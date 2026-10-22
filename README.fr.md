<h1 align="center">relais</h1>

<p align="center"><strong>Télécharge tes dépendances une fois. Installe-les sur toutes les machines de la salle.</strong></p>

<p align="center">
  <a href="https://github.com/Paskod121/relais/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Paskod121/relais/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@pasod121/relais"><img alt="npm" src="https://img.shields.io/npm/v/@pasod121/relais"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/Paskod121/relais"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/Paskod121/relais/badge"></a>
  <a href="LICENSE"><img alt="Licence : MIT" src="https://img.shields.io/badge/licence-MIT-blue"></a>
</p>

<p align="center"><a href="README.md">Read in English</a></p>

---

Un projet Next.js neuf télécharge environ **215 Mo** de paquets. Dans une salle de 30, ça fait **6,45 Go** d'octets identiques tirés d'Internet 30 fois, payés sur la data mobile de chaque étudiant.

relais est un petit relais local pour npm. Une machine de la salle récupère chaque paquet une seule fois ; toutes les autres l'installent depuis elle, par le Wi-Fi local ou un partage de connexion, sans consommer de data.

## Où en est le projet

**Au tout début. Le relais est conçu en public.** Ce qui existe aujourd'hui, c'est `relais estimate`, qui calcule ce qu'un groupe économiserait. On collecte des chiffres réels dans des salles de cours avant de construire le relais, pour que la conception suive le terrain et pas l'inverse.

Si tu enseignes, organises une formation ou un hackathon, un [rapport de terrain](https://github.com/Paskod121/relais/issues/new?template=field_report.yml) est la contribution la plus utile en ce moment.

## Ce que ça coûte aujourd'hui

Mesuré le 22 octobre 2026 avec un cache npm vide (npm 10.9, Node 22) :

| Stack de départ           | Téléchargé par machine | Pour une salle de 30 |
| ------------------------- | ---------------------- | -------------------- |
| Next.js + React           | 215 Mo                 | 6,45 Go              |
| Tailwind + Vite           | 181 Mo                 | 5,43 Go              |
| Vite + React + TypeScript | 177 Mo                 | 5,31 Go              |
| Express                   | 8 Mo                   | 240 Mo               |

Méthode et chiffres bruts : [docs/MEASUREMENTS.md](docs/MEASUREMENTS.md).

## Essayer l'estimateur

```sh
RELAIS_LANG=fr npx @pasod121/relais estimate --size 215 --installs 30 --price 540 --currency XOF
```

```text
30 machines qui installent 215 Mo chacune

  Téléchargé sans relais     6,45 Go
  Téléchargé avec relais     215 Mo
  Data évitée                6,24 Go

  Coût : 3 483 F CFA -> 116 F CFA
  Économisé                  3 367 F CFA
```

Nécessite Node 22.18 ou plus récent.

## Comment le relais fonctionnera

1. Une machine lance `relais` et s'annonce sur le réseau local.
2. Les autres machines pointent npm vers elle en une seule commande.
3. La première demande d'un paquet part vers le registre officiel ; toutes les suivantes sont servies en local.
4. Chaque paquet servi est vérifié contre l'empreinte publiée par le registre officiel : un relais ne peut jamais injecter de code.
5. Un compteur affiche la data et l'argent économisés après chaque séance.

La conception est ouverte à la discussion dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Principes

- **Zéro configuration** pour la personne qui installe. S'il faut un tutoriel, c'est raté.
- **Jamais moins sûr que npm.** L'intégrité est vérifiée ; rien n'est considéré fiable parce qu'il est local.
- **Peu coûteux pour contribuer.** Aucune dépendance à l'exécution. L'environnement de dev complet télécharge environ 71 Mo, surtout les compilateurs TypeScript et Biome.
- **Mesuré, pas supposé.** Une fonctionnalité arrive quand les rapports de terrain montrent qu'elle compte.

## Pourquoi ce projet

Les gestionnaires de paquets sont pensés pour la fibre illimitée. Dans une grande partie de l'Afrique, et dans les salles de cours, conférences et centres communautaires partout ailleurs, la bande passante est payée au Mo, partagée ou instable. Des projets comme local-npm ont prouvé l'idée et ont été abandonnés là où la bande passante ne coûte rien. relais est construit à Lomé, au Togo, pour les endroits où elle coûte.

## Contribuer

Bugs, rapports de terrain, documentation et code sont bienvenus, en français ou en anglais. Commence par [CONTRIBUTING.fr.md](CONTRIBUTING.fr.md) et cherche les issues marquées `good first issue`.
- [Feuille de route](ROADMAP.md)
- [Gouvernance](GOVERNANCE.md)
- [Politique de sécurité](SECURITY.md)
- [Code de conduite](CODE_OF_CONDUCT.md)

## Licence

[MIT](LICENSE) © Pascal Sewonou et les contributeurs.
