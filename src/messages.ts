import { DEFAULT_ECOSYSTEM, getEcosystem } from "./ecosystems/index.ts";
import type { Finding, Level, Report, Verdict } from "./policy.ts";

export type Lang = "en" | "fr";

export function detectLang(env: NodeJS.ProcessEnv = process.env): Lang {
  const raw = env.RELAIS_LANG ?? env.LC_ALL ?? env.LC_MESSAGES ?? env.LANG ?? "";
  return raw.toLowerCase().startsWith("fr") ? "fr" : "en";
}

function list(ids: string[], lang: Lang, max = 5): string {
  const shown = ids.slice(0, max).join(", ");
  const rest = ids.length - max;
  if (rest <= 0) return shown;
  return lang === "fr" ? `${shown} et ${rest} autres` : `${shown} and ${rest} more`;
}

/**
 * What a finding means, in plain words. With `untrusted: false` (agent output), text written by
 * package authors is left out of the message: it is returned separately so an agent never reads
 * an author's words as instructions.
 */
export function describe(
  f: Finding,
  report: Pick<Report, "name" | "ecosystem">,
  lang: Lang,
  options: { untrusted: boolean } = { untrusted: true },
): string {
  const fr = lang === "fr";
  const { name } = report;
  const where = (getEcosystem(report.ecosystem) ?? DEFAULT_ECOSYSTEM).displayName;
  switch (f.code) {
    case "not-found":
      return fr
        ? `${name} n'existe pas sur ${where}. Les assistants IA inventent souvent des noms de paquets, et des attaquants les enregistrent ensuite pour piéger ceux qui les installent.`
        : `${name} does not exist on ${where}. AI assistants often invent package names, and attackers then register them to trap whoever installs them.`;
    case "version-not-found":
      return fr
        ? `La version "${f.requested}" de ${name} n'existe pas.`
        : `Version "${f.requested}" of ${name} does not exist.`;
    case "malicious":
      return fr
        ? `Signalé comme malveillant (${list(f.ids, lang)}). Ce paquet est conçu pour nuire : vol de mots de passe, de clés ou de code.`
        : `Reported as malicious (${list(f.ids, lang)}). This package is built to cause harm: stealing passwords, keys or code.`;
    case "too-new":
      return f.allowed
        ? fr
          ? `Publiée il y a ${f.hours} h. Tu as autorisé ce paquet, le délai de ${f.minHours} h ne s'applique pas.`
          : `Published ${f.hours} h ago. You allowed this package, so the ${f.minHours} h delay does not apply.`
        : fr
          ? `Cette version a été publiée il y a ${f.hours} h. relais attend ${f.minHours} h avant de faire confiance à une version : la plupart des versions piégées sont repérées dans ce délai.`
          : `This version was published ${f.hours} h ago. relais waits ${f.minHours} h before trusting a release: most poisoned versions are caught within that window.`;
    case "unproven":
      return fr
        ? `Paquet créé il y a ${f.days} jours et téléchargé ${f.downloads} fois la semaine dernière. Neuf et inutilisé à la fois : c'est le profil d'un nom enregistré pour piéger.${f.allowed ? " Tu l'as autorisé." : ""}`
        : `Created ${f.days} days ago and downloaded ${f.downloads} times last week. New and unused at once is the profile of a name registered as a trap.${f.allowed ? " You allowed it." : ""}`;
    case "lookalike":
      return fr
        ? `Le nom ressemble beaucoup à ${f.target}, un paquet très utilisé.`
        : `The name is very close to ${f.target}, a widely used package.`;
    case "young-package":
      return fr
        ? `Le paquet a été créé il y a ${f.days} jours.`
        : `The package was created ${f.days} days ago.`;
    case "low-downloads":
      return fr
        ? `Seulement ${f.downloads} téléchargements la semaine dernière.`
        : `Only ${f.downloads} downloads last week.`;
    case "install-scripts":
      return fr
        ? `Exécute du code sur ta machine pendant l'installation (${f.scripts.join(", ")}).`
        : `Runs code on your machine during installation (${f.scripts.join(", ")}).`;
    case "vulnerabilities":
      return fr
        ? `Failles de sécurité connues dans cette version : ${list(f.ids, lang)}.`
        : `Known security flaws in this version: ${list(f.ids, lang)}.`;
    case "deprecated":
      if (!options.untrusted) {
        return fr
          ? "Abandonné par son auteur (sa note est dans le champ untrusted.authorNote)."
          : "Deprecated by its author (their note is in untrusted.authorNote).";
      }
      return fr
        ? `Abandonné par son auteur. Sa note : "${f.reason}"`
        : `Deprecated by its author. Their note: "${f.reason}"`;
    case "advisories-unchecked":
      return fr
        ? "Base de vulnérabilités (osv.dev) injoignable : les malwares connus n'ont pas été vérifiés."
        : "Vulnerability database (osv.dev) unreachable: known malware was not checked.";
    case "age-unchecked":
      return fr
        ? "Date de publication introuvable : l'âge de cette version n'a pas été vérifié."
        : "Publish date unavailable: the age of this version was not checked.";
    case "downloads-unchecked":
      return fr ? "Nombre de téléchargements inconnu." : "Download count unavailable.";
    case "provenance":
      return f.present
        ? fr
          ? "Provenance vérifiée : cette version a été construite et publiée depuis une CI publique."
          : "Verified provenance: this version was built and published from public CI."
        : fr
          ? "Pas de provenance : rien ne relie cette version à son code source."
          : "No provenance: nothing links this version to its source code.";
    case "age":
      return fr ? `Publié il y a ${f.days} jours.` : `Published ${f.days} days ago.`;
  }
}

/** The next concrete step for a beginner, or undefined when there is nothing to do. */
export function advise(
  f: Finding,
  report: Pick<Report, "name" | "ecosystem" | "version">,
  lang: Lang,
): string | undefined {
  const fr = lang === "fr";
  const { name } = report;
  const eco = getEcosystem(report.ecosystem) ?? DEFAULT_ECOSYSTEM;
  const cmd = eco.commands;
  switch (f.code) {
    case "not-found":
      return f.lookalikeOf
        ? fr
          ? `Si tu voulais ${f.lookalikeOf} : ${cmd.install(f.lookalikeOf)}`
          : `If you meant ${f.lookalikeOf}: ${cmd.install(f.lookalikeOf)}`
        : fr
          ? `N'installe rien et ne crée pas ce paquet. Demande à ton assistant le nom officiel, puis vérifie-le avec relais check.`
          : `Do not install or create it. Ask your assistant for the official name, then verify it with relais check.`;
    case "version-not-found":
      return fr
        ? `Voir les versions qui existent : ${cmd.listVersions(name)}`
        : `See which versions exist: ${cmd.listVersions(name)}`;
    case "malicious":
      return fr
        ? `Ne l'installe pas. S'il est déjà dans un projet : ${cmd.uninstall(name)}, supprime node_modules, réinstalle, puis change tous les mots de passe, clés et tokens utilisés sur cette machine.`
        : `Do not install it. If it is already in a project: ${cmd.uninstall(name)}, delete node_modules, reinstall, then change every password, key and token used on this machine.`;
    case "too-new":
      if (f.allowed) return undefined;
      return fr
        ? `Attends ${Math.max(1, f.minHours - f.hours)} h ou garde la version précédente (${cmd.listVersions(name)}). Si c'est ton propre paquet : ajoute --allow ${name}`
        : `Wait ${Math.max(1, f.minHours - f.hours)} h or keep the previous version (${cmd.listVersions(name)}). If it is your own package: add --allow ${name}`;
    case "unproven":
      if (f.allowed) return undefined;
      return fr
        ? `Cherche une alternative connue. Si c'est ton propre paquet ou celui d'une personne de confiance : ajoute --allow ${name}`
        : `Look for a well-known alternative. If it is your own package or one you trust: add --allow ${name}`;
    case "lookalike":
      return fr
        ? `Si tu voulais ${f.target} : ${cmd.install(f.target)}`
        : `If you meant ${f.target}: ${cmd.install(f.target)}`;
    case "vulnerabilities":
      return f.fixVersion
        ? fr
          ? `Mets à jour vers la première version corrigée : ${cmd.install(name, f.fixVersion)}`
          : `Update to the first fixed version: ${cmd.install(name, f.fixVersion)}`
        : fr
          ? `Aucune version corrigée connue. Détails : https://osv.dev/vulnerability/${f.ids[0]}`
          : `No fixed version is known. Details: https://osv.dev/vulnerability/${f.ids[0]}`;
    case "install-scripts":
      return fr
        ? "npm 12 et pnpm 10 bloquent ces scripts par défaut. Ne les autorise que si tu fais confiance à ce paquet."
        : "npm 12 and pnpm 10 block these scripts by default. Only approve them if you trust this package.";
    case "deprecated":
      return fr
        ? "Cherche le remplaçant recommandé par l'auteur."
        : "Look for the replacement the author recommends.";
    case "advisories-unchecked":
      return fr
        ? "Relance la vérification une fois en ligne, ou consulte osv.dev avant d'installer."
        : "Run the check again once online, or look the package up on osv.dev before installing.";
    default:
      return undefined;
  }
}

export function levelLabel(level: Level, lang: Lang): string {
  const labels: Record<Lang, Record<Level, string>> = {
    en: { block: "BLOCK", warn: "WARN", info: "info" },
    fr: { block: "BLOQUÉ", warn: "ATTENTION", info: "info" },
  };
  return labels[lang][level];
}

export function verdictLabel(verdict: Verdict | "error", lang: Lang): string {
  const labels: Record<Lang, Record<Verdict | "error", string>> = {
    en: { pass: "OK", warn: "CHECK", block: "BLOCKED", error: "ERROR" },
    fr: { pass: "OK", warn: "À VÉRIFIER", block: "BLOQUÉ", error: "ERREUR" },
  };
  return labels[lang][verdict];
}

export const text = {
  en: {
    help: `relais: checks packages before you, or your AI agent, install them.

Usage
  relais check <package>[@version] [more...] [--json] [--min-age <hours>] [--allow <name>]
  relais --version
  relais --help

Examples
  relais check express
  relais check lodash@4.17.15 left-pad
  relais check npm:@types/node --json
  relais check my-new-package --allow my-new-package

Exit codes
  0  nothing blocking (read the warnings)
  2  at least one package is blocked: do not install
  1  could not verify (network, registry, invalid name): treat as not safe

Set RELAIS_LANG=fr for French output.`,
    invalidName: (input: string) => `"${input}" is not a valid package name.`,
    unsupported: (eco: string) =>
      `${eco} is not supported yet. It is planned, and contributions are welcome: https://github.com/Paskod121/relais/blob/main/docs/ADDING_AN_ECOSYSTEM.md`,
    unknownCommand: (cmd: string) => `Unknown command: ${cmd}. Run "relais --help".`,
    missingPackage: "Name at least one package. Example: relais check express",
    badMinAge: "--min-age expects a number of hours.",
    unreachable: (detail: string) =>
      `Could not reach the registry, nothing was verified (${detail}).`,
    todo: "What to do:",
  },
  fr: {
    help: `relais : vérifie les paquets avant que toi, ou ton agent IA, ne les installiez.

Utilisation
  relais check <paquet>[@version] [autres...] [--json] [--min-age <heures>] [--allow <nom>]
  relais --version
  relais --help

Exemples
  relais check express
  relais check lodash@4.17.15 left-pad
  relais check npm:@types/node --json
  relais check mon-nouveau-paquet --allow mon-nouveau-paquet

Codes de sortie
  0  rien de bloquant (lis les avertissements)
  2  au moins un paquet est bloqué : ne pas installer
  1  vérification impossible (réseau, registre, nom invalide) : à considérer comme non sûr`,
    invalidName: (input: string) => `"${input}" n'est pas un nom de paquet valide.`,
    unsupported: (eco: string) =>
      `${eco} n'est pas encore pris en charge. C'est prévu, et les contributions sont bienvenues : https://github.com/Paskod121/relais/blob/main/docs/ADDING_AN_ECOSYSTEM.md`,
    unknownCommand: (cmd: string) => `Commande inconnue : ${cmd}. Lance "relais --help".`,
    missingPackage: "Indique au moins un paquet. Exemple : relais check express",
    badMinAge: "--min-age attend un nombre d'heures.",
    unreachable: (detail: string) => `Registre injoignable, rien n'a été vérifié (${detail}).`,
    todo: "Que faire :",
  },
} as const;
