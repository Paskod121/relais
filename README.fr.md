<h1 align="center">relais</h1>

<p align="center"><strong>Ton agent IA installe des paquets. relais vérifie chacun d'eux avant.</strong></p>

<p align="center">
  <a href="https://github.com/Paskod121/relais/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Paskod121/relais/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@paskod121/relais"><img alt="npm" src="https://img.shields.io/npm/v/@paskod121/relais"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/Paskod121/relais"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/Paskod121/relais/badge"></a>
  <a href="LICENSE"><img alt="Licence : MIT" src="https://img.shields.io/badge/licence-MIT-blue"></a>
</p>

<p align="center"><a href="README.md">Read in English</a></p>

---

Les agents de code lancent maintenant `npm install` tout seuls, et personne ne lit ce qu'ils récupèrent. Selon les études publiées, les modèles de langage inventent des noms de paquets dans près d'un échantillon de code sur cinq, des attaquants enregistrent ces noms, et des vers comme Shai-Hulud se sont propagés à des centaines de vrais paquets en quelques jours.

relais se place entre ta machine et npm et répond à une seule question avant toute installation : **peut-on faire confiance à ce paquet, oui ou non, et pourquoi ?**

## Essayer

```sh
RELAIS_LANG=fr npx @paskod121/relais check express react_dom
```

```text
express@5.3.0  OK
  info  Publié il y a 13 jours.
  info  Provenance vérifiée : cette version a été construite et publiée depuis une CI publique.

react_dom  BLOQUÉ
  BLOQUÉ  react_dom n'existe pas sur npm. Les assistants IA inventent souvent des noms
          de paquets, et des attaquants les enregistrent ensuite pour piéger ceux qui
          les installent.
          Que faire : Si tu voulais react-dom : npm install react-dom
```

Chaque problème vient avec l'étape suivante, écrite pour quelqu'un qui a commencé à coder le mois dernier : la commande exacte pour installer le bon paquet, ou pour passer à la première version qui corrige une faille connue.

Nécessite Node 22.23.4 ou plus récent.

## Ce qui est vérifié

| Vérification                                      | Verdict                                      | Pourquoi                                                                         |
| ------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| Le nom existe sur npm                             | Bloqué sinon                                 | Les noms inventés sont la porte d'entrée du slopsquatting                        |
| Malware connu (alertes OSV `MAL-`)                | Bloqué                                       | Les paquets malveillants publiés sont répertoriés en quelques heures             |
| Âge de la version                                 | Bloqué sous 72 h (réglable)                  | La plupart des versions piégées sont repérées en quelques jours                  |
| Sosie d'un paquet populaire                       | Attention                                    | Typosquatting et noms voisins qu'une IA a pu confondre                           |
| Paquet à la fois tout neuf et presque pas utilisé | Bloqué (`--allow` pour le tien)              | Le profil d'un nom enregistré pour piéger                                        |
| Scripts à l'installation                          | Attention                                    | Le moyen habituel pour un malware de s'exécuter chez toi                         |
| Failles connues, abandon                          | Attention, avec la première version corrigée | Vieux projets et versions suggérées par l'IA figent souvent des versions cassées |
| Provenance de la construction                     | Info                                         | Relie la version à son code source et à sa CI publique                           |

Quand quelque chose ne peut pas être vérifié, relais le dit. Il ne déclare jamais « sûr » par défaut.

## Pour les agents et la CI

```sh
npx @paskod121/relais check un-paquet --json
```

| Code de sortie | Signification                                                                         |
| -------------- | ------------------------------------------------------------------------------------- |
| 0              | Rien de bloquant. Lis les avertissements.                                             |
| 2              | Au moins un paquet est bloqué. Ne pas installer.                                      |
| 1              | Vérification impossible (réseau, registre, nom invalide). À considérer comme non sûr. |

Le texte écrit par les auteurs de paquets (notes d'abandon) n'apparaît jamais dans `message` : il est renvoyé dans `untrusted.authorNote`, pour qu'un agent ne le prenne jamais pour une instruction.

Tu peux l'écrire dans le fichier d'instructions de ton agent : _« Avant d'ajouter une dépendance npm, lance `npx @paskod121/relais check <nom> --json` et n'installe pas si le code de sortie n'est pas 0. »_

## Pourquoi relais

- **Pensé d'abord pour les agents.** Sortie structurée, codes de sortie stricts, explications claires qu'un modèle peut relayer à un humain.
- **Économe.** Moins de 10 Ko par vérification pour un paquet populaire ; le document complet n'est téléchargé que pour les paquets peu utilisés, où il est petit. Fait à Lomé, où la data se paie au Mo.
- **Sans télémétrie, sans compte, licence MIT.** Rien de ce que tu installes ne quitte ta machine, à part les requêtes vers npm et OSV.
- **Zéro dépendance d'exécution.** Un outil de sécurité ne doit pas élargir ta surface d'attaque.

## La sécurité de relais lui-même

Un outil placé à cet endroit est une cible. Tout texte venant d'un registre est traité comme hostile (codes d'échappement, caractères invisibles et réponses géantes sont retirés ou refusés), relais n'a aucune dépendance d'exécution ni aucun token npm, et les versions sont publiées depuis la CI avec provenance. Ce contre quoi on se défend, et les limites connues : [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Écosystèmes

npm aujourd'hui. Le cœur est conçu pour qu'un nouveau registre tienne en un fichier : PyPI est le prochain, et les contributions sont bienvenues ([guide](docs/ADDING_AN_ECOSYSTEM.md)). `relais check pypi:requests` te dit déjà que c'est prévu.

## La suite

`relais check` est la première brique. Ensuite vient un registre local qui applique ces règles automatiquement à tout ce qui installe sur une machine ou un réseau : npm, pnpm, bun, les `npx` cachés dans les configurations MCP et les agents. Il gardera un journal lisible de ce que chaque agent a installé, notera les tentatives d'installation de paquets inexistants, et servira hors ligne les paquets déjà en cache. Voir [ROADMAP.md](ROADMAP.md) et [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contribuer

Bugs, paquets suspects, documentation et code sont bienvenus, en français ou en anglais. Commence par [CONTRIBUTING.fr.md](CONTRIBUTING.fr.md). Si une IA t'a proposé un paquet louche, [signale-le](https://github.com/Paskod121/relais/issues/new?template=package_report.yml). Si le nom n'existe pas encore, signale-le [en privé](https://github.com/Paskod121/relais/security/advisories/new) : une liste publique de noms inventés aide les attaquants.
- [Politique de sécurité](SECURITY.md)
- [Gouvernance](GOVERNANCE.md)
- [Code de conduite](CODE_OF_CONDUCT.md)

## Licence

[MIT](LICENSE) © Pascal Sewonou et les contributeurs.
