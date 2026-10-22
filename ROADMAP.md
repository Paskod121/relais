# Roadmap

Each phase has a bar to clear before the next one starts. If a bar is missed, we change course rather than build on a guess.

## Phase 0: Measure (now)

- `relais estimate` to put numbers on the problem.
- Collect field reports from classrooms, bootcamps and hackathons.
- **Bar:** at least a third of surveyed learners name data cost as a real obstacle, and a real session uses more than 2 GB.

## Phase 1: Working relay for npm

- Registry proxy that fetches each tarball once and serves it on the local network.
- Integrity verification against the official registry on every tarball.
- One-command setup on the client side, on Windows, macOS and Linux.
- Session counter: MB and money saved.
- **Bar:** a full Next.js install on 10 machines with a single download, no errors.

## Phase 2: Real classrooms

- Used for a full training cohort and in a university lab.
- Automatic discovery on the local network.
- Session packs: preload a course's dependencies the night before.
- **Bar:** the trainer starts it again the following week without being asked, and more than 20 GB saved in total.

## Phase 3: Beyond npm, beyond Lomé

- Export and import of the cache on a USB drive.
- Candidates, in order of field demand: pip, offline docs through Kiwix, Docker images.
- **Bar:** a group outside Togo runs it without help from the maintainers.

## Not planned

- A hosted cloud service. relais is about not crossing the internet.
- Peer-to-peer swarms across the internet. Earlier attempts were slower than plain HTTP on a LAN.
