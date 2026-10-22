# Measurements

Numbers in this project come from runs anyone can repeat. These measurements support the offline cache planned in Phase 2 of the [roadmap](../ROADMAP.md). Add yours through a pull request to this file.

## Download size of common starter stacks

**Date:** 22 October 2026. **Tools:** npm 10.9.4, Node 22.22.0, Linux x64. **Method:** empty npm cache, empty project, then:

```sh
npm init -y
npm install --cache ./cache --no-audit --no-fund <packages>
du -sm ./cache            # downloaded (tarballs and metadata)
du -sm ./node_modules     # size on disk
```

| Stack                     | Packages installed                                     | Downloaded (MB) | On disk (MB) |
| ------------------------- | ------------------------------------------------------ | --------------- | ------------ |
| Next.js + React           | `next react react-dom`                                 | 215             | 352          |
| Tailwind + Vite           | `vite tailwindcss @tailwindcss/vite`                   | 181             | 52           |
| Vite + React + TypeScript | `vite @vitejs/plugin-react react react-dom typescript` | 177             | 73           |
| Express                   | `express`                                              | 8               | 5            |

`du -sm` counts mebibytes. Download size depends on the operating system, because some packages ship platform-specific binaries. Windows and macOS numbers are welcome.

## Data prices used in examples

The examples use 540 XOF per GB, the mid-range average reported by Togo's regulator ARCEP in 2023 for one operator. Prices change: always quote the date and source of a price you use.
