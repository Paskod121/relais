# Contribuer à relais

Merci de ton aide. Les contributions en français ou en anglais sont également bienvenues. [English version](CONTRIBUTING.md).

## Les contributions les plus utiles en ce moment

1. **Les rapports de terrain.** Des chiffres réels d'une séance : nombre de machines, ce qui a été installé, comment les gens étaient connectés, prix de la data. Utilise le [formulaire de rapport de terrain](https://github.com/Paskod121/relais/issues/new?template=field_report.yml).
2. **Des retours sur la conception** dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), via les [Discussions](https://github.com/Paskod121/relais/discussions).
3. **Du code**, en commençant par les issues marquées `good first issue`.

## Installer le projet

Il faut Node 22.18 ou plus récent (24 conseillé, voir `.nvmrc`).

```sh
git clone https://github.com/Paskod121/relais.git
cd relais
npm ci
npm run check
```

`npm ci` télécharge environ 71 Mo. Si la data te coûte cher, fais-le une fois sur un Wi-Fi ; rien d'autre dans le travail quotidien n'a besoin du réseau.

| Commande                                            | Ce qu'elle fait                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `npm run check`                                     | Lint, vérification des types et tests. À lancer avant chaque push. |
| `npm test`                                          | Les tests seuls, avec le lanceur intégré à Node.                   |
| `npm run format`                                    | Formate et corrige le lint avec Biome.                             |
| `npm run build`                                     | Compile `src/` vers `dist/`.                                       |
| `node src/cli.ts estimate --size 215 --installs 30` | Lance la CLI depuis les sources, sans build.                       |

## Comment on travaille

- **Ouvre une issue avant un gros changement**, pour que personne ne passe une semaine sur quelque chose qui ne sera pas fusionné.
- **Une pull request, un changement.** Les petites PR sont relues plus vite.
- **Les tests accompagnent le code.** Une correction de bug inclut un test qui échoue sans la correction.
- **Aucune nouvelle dépendance d'exécution** sans discussion. Chaque dépendance coûte de la data et de la confiance à chaque utilisateur.
- **Les titres de commit et de PR suivent [Conventional Commits](https://www.conventionalcommits.org/fr/)** : `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. Les PR sont fusionnées en squash, donc le titre de la PR devient le commit et alimente le changelog.

## Style de code

TypeScript en mode strict, modules ES. Les imports relatifs utilisent l'extension `.ts` ; le build les réécrit. Biome gère le formatage : pas de débat, lance `npm run format`.

## Publication

Les mainteneurs fusionnent la PR de release ouverte automatiquement par release-please. La publication sur npm se fait ensuite depuis la CI, avec trusted publishing et provenance. Personne ne publie depuis son ordinateur.

## Conduite

En participant, tu acceptes le [Code de conduite](CODE_OF_CONDUCT.md).
