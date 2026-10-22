#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { detectLang, type Lang, messages } from "./messages.ts";
import { estimateSavings, formatMB, formatMoney } from "./savings.ts";

function readVersion(): string {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgUrl, "utf8")) as { version: string };
  return pkg.version;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function run(argv: string[], lang: Lang = detectLang()): { code: number; out: string } {
  const t = messages[lang];
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      size: { type: "string" },
      installs: { type: "string" },
      price: { type: "string" },
      currency: { type: "string" },
    },
  });

  if (values.version) return { code: 0, out: readVersion() };
  const command = positionals[0];
  if (values.help || command === undefined) return { code: 0, out: t.help };
  if (command !== "estimate") return { code: 1, out: t.unknownCommand(command) };

  const sizeMB = toNumber(values.size as string | undefined);
  const installs = toNumber(values.installs as string | undefined);
  const price = toNumber(values.price as string | undefined);
  const currency = ((values.currency as string | undefined) ?? "XOF").toUpperCase();

  if (sizeMB === undefined || sizeMB <= 0) return { code: 1, out: t.missing("size") };
  if (installs === undefined || installs < 1 || !Number.isInteger(installs)) {
    return { code: 1, out: t.missing("installs") };
  }
  if (values.price !== undefined && (price === undefined || price <= 0)) {
    return { code: 1, out: t.missing("price") };
  }

  const e = estimateSavings(
    price === undefined ? { sizeMB, installs } : { sizeMB, installs, pricePerGB: price },
  );
  const lines = [
    t.heading(installs, formatMB(sizeMB, locale)),
    "",
    `  ${t.withoutRelay}  ${formatMB(e.withoutRelayMB, locale)}`,
    `  ${t.withRelay}  ${formatMB(e.withRelayMB, locale)}`,
    `  ${t.avoided}  ${formatMB(e.avoidedMB, locale)}`,
  ];
  if (e.cost) {
    lines.push(
      "",
      `  ${t.costTitle}${lang === "fr" ? " :" : ":"} ${formatMoney(e.cost.withoutRelay, currency, locale)} -> ${formatMoney(e.cost.withRelay, currency, locale)}`,
      `  ${t.saved}  ${formatMoney(e.cost.saved, currency, locale)}`,
    );
  }
  lines.push("", t.status);
  return { code: 0, out: lines.join("\n") };
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

const isMain = isEntryPoint();
if (isMain) {
  try {
    const { code, out } = run(process.argv.slice(2));
    (code === 0 ? process.stdout : process.stderr).write(`${out}\n`);
    process.exitCode = code;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
