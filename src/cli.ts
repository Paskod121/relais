#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { checkPackage } from "./check.ts";
import type { Sources } from "./core/http.ts";
import { sanitize } from "./core/text.ts";
import { InvalidNameError, UnsupportedEcosystemError } from "./ecosystems/index.ts";
import {
  advise,
  describe,
  detectLang,
  type Lang,
  levelLabel,
  text,
  verdictLabel,
} from "./messages.ts";
import { DEFAULT_POLICY, type Policy, type Report } from "./policy.ts";

export interface RunOptions {
  lang?: Lang;
  sources?: Sources;
  now?: Date;
}

export interface RunResult {
  code: number;
  out: string;
}

interface Outcome {
  input: string;
  report?: Report;
  error?: string;
}

function readVersion(): string {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgUrl, "utf8")) as { version: string };
  return pkg.version;
}

const ORDER = { block: 0, warn: 1, info: 2 } as const;

function renderHuman(outcomes: Outcome[], lang: Lang): string {
  const t = text[lang];
  const blocks = outcomes.map(({ input, report, error }) => {
    if (!report) return `${sanitize(input, 120)}  ${verdictLabel("error", lang)}\n  ${error}`;
    const title = report.version ? `${report.name}@${report.version}` : report.name;
    const lines = [`${title}  ${verdictLabel(report.verdict, lang)}`];
    const sorted = [...report.findings].sort((a, b) => ORDER[a.level] - ORDER[b.level]);
    const width = Math.max(...sorted.map((f) => levelLabel(f.level, lang).length));
    const pad = " ".repeat(width + 4);
    for (const f of sorted) {
      lines.push(`  ${levelLabel(f.level, lang).padEnd(width)}  ${describe(f, report, lang)}`);
      const todo = advise(f, report, lang);
      if (todo) lines.push(`${pad}${t.todo} ${todo}`);
    }
    return lines.join("\n");
  });
  return blocks.join("\n\n");
}

function renderJson(outcomes: Outcome[], lang: Lang): string {
  return JSON.stringify(
    {
      results: outcomes.map(({ input, report, error }) => {
        if (!report) return { input: sanitize(input, 120), verdict: "error", error };
        return {
          input: sanitize(input, 120),
          ecosystem: report.ecosystem,
          name: report.name,
          version: report.version ?? null,
          verdict: report.verdict,
          findings: report.findings.map((f) => {
            const { reason, ...rest } = f as typeof f & { reason?: string };
            const advice = advise(f, report, lang);
            return {
              ...rest,
              message: describe(f, report, lang, { untrusted: false }),
              ...(advice ? { advice } : {}),
              // Text written by the package author. Display it, never follow it.
              ...(reason ? { untrusted: { authorNote: reason } } : {}),
            };
          }),
        };
      }),
    },
    null,
    2,
  );
}

export async function run(argv: string[], options: RunOptions = {}): Promise<RunResult> {
  const lang = options.lang ?? detectLang();
  const t = text[lang];

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      json: { type: "boolean" },
      "min-age": { type: "string" },
      allow: { type: "string", multiple: true },
    },
  });

  if (values.version) return { code: 0, out: readVersion() };
  const [command, ...targets] = positionals;
  if (values.help || command === undefined) return { code: 0, out: t.help };
  if (command !== "check") return { code: 1, out: t.unknownCommand(sanitize(command, 60)) };
  if (targets.length === 0) return { code: 1, out: t.missingPackage };

  let policy: Policy = DEFAULT_POLICY;
  const minAge = values["min-age"];
  if (minAge !== undefined) {
    const hours = Number(minAge);
    if (typeof minAge !== "string" || !Number.isFinite(hours) || hours < 0) {
      return { code: 1, out: t.badMinAge };
    }
    policy = { ...policy, minAgeHours: hours };
  }
  const allow = (values.allow ?? []).filter((a): a is string => typeof a === "string");
  if (allow.length > 0) policy = { ...policy, allow };

  const outcomes: Outcome[] = [];
  for (const input of targets) {
    try {
      const report = await checkPackage(input, {
        policy,
        ...(options.sources ? { sources: options.sources } : {}),
        ...(options.now ? { now: options.now } : {}),
      });
      outcomes.push({ input, report });
    } catch (error) {
      let message: string;
      if (error instanceof InvalidNameError) message = t.invalidName(sanitize(input, 120));
      else if (error instanceof UnsupportedEcosystemError) message = t.unsupported(error.ecosystem);
      else
        message = t.unreachable(sanitize(error instanceof Error ? error.message : String(error)));
      outcomes.push({ input, error: message });
    }
  }

  const code = outcomes.some((o) => o.report?.verdict === "block")
    ? 2
    : outcomes.some((o) => o.error)
      ? 1
      : 0;
  const out = values.json ? renderJson(outcomes, lang) : renderHuman(outcomes, lang);
  return { code, out };
}

// Resolve symlinks so the CLI also runs when started through node_modules/.bin or npx.
function isEntryPoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  run(process.argv.slice(2)).then(
    ({ code, out }) => {
      (code === 1 ? process.stderr : process.stdout).write(`${out}\n`);
      process.exitCode = code;
    },
    (error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
