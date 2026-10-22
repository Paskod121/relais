export type Lang = "en" | "fr";

export function detectLang(env: NodeJS.ProcessEnv = process.env): Lang {
  const raw = env.RELAIS_LANG ?? env.LC_ALL ?? env.LC_MESSAGES ?? env.LANG ?? "";
  return raw.toLowerCase().startsWith("fr") ? "fr" : "en";
}

interface Messages {
  help: string;
  heading: (installs: number, size: string) => string;
  withoutRelay: string;
  withRelay: string;
  avoided: string;
  costTitle: string;
  saved: string;
  status: string;
  unknownCommand: (cmd: string) => string;
  missing: (flag: string) => string;
}

export const messages: Record<Lang, Messages> = {
  en: {
    help: `relais: download your dependencies once, install them on every machine in the room.

Usage
  relais estimate --size <MB> --installs <n> [--price <per GB>] [--currency <code>]
  relais --version
  relais --help

Example
  relais estimate --size 215 --installs 30 --price 540 --currency XOF

Set RELAIS_LANG=fr for French output.`,
    heading: (installs, size) => `${installs} machines installing ${size} each`,
    withoutRelay: "Downloaded without a relay",
    withRelay: "Downloaded with a relay  ",
    avoided: "Data avoided            ",
    costTitle: "Cost",
    saved: "Saved                    ",
    status:
      "The relay itself is not ready yet. This command only estimates what it would save. Follow progress: https://github.com/Paskod121/relais",
    unknownCommand: (cmd) => `Unknown command: ${cmd}. Run "relais --help".`,
    missing: (flag) => `Missing or invalid --${flag}. Run "relais --help".`,
  },
  fr: {
    help: `relais : télécharge tes dépendances une fois, installe-les sur toutes les machines de la salle.

Utilisation
  relais estimate --size <Mo> --installs <n> [--price <par Go>] [--currency <code>]
  relais --version
  relais --help

Exemple
  relais estimate --size 215 --installs 30 --price 540 --currency XOF`,
    heading: (installs, size) => `${installs} machines qui installent ${size} chacune`,
    withoutRelay: "Téléchargé sans relais   ",
    withRelay: "Téléchargé avec relais   ",
    avoided: "Data évitée              ",
    costTitle: "Coût",
    saved: "Économisé                ",
    status:
      "Le relais lui-même n'est pas encore prêt. Cette commande estime seulement ce qu'il ferait économiser. Suivre le projet : https://github.com/Paskod121/relais",
    unknownCommand: (cmd) => `Commande inconnue : ${cmd}. Lance "relais --help".`,
    missing: (flag) => `--${flag} manquant ou invalide. Lance "relais --help".`,
  },
};
