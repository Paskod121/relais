# Architecture (draft, open for discussion)

This describes the relay planned for Phase 1. Nothing here is final. Comment in [Discussions](https://github.com/Paskod121/relais/discussions).

## Shape

```text
                 internet (once per package)
                          |
                 registry.npmjs.org
                          |
   +----------------- relay machine -----------------+
   |  HTTP registry proxy   |   verified tarball store |
   +--------------------------------------------------+
            |  local Wi-Fi or phone hotspot  |
     student laptop    student laptop    student laptop
       (npm install)     (npm install)     (npm install)
```

## Decisions so far

1. **Plain HTTP npm registry protocol.** Clients are stock npm, pnpm or yarn pointed at the relay. No client plugin to install.
2. **Metadata always comes from upstream when online.** The relay caches package documents (packuments) but never edits them.
3. **Tarballs are verified before being stored or served.** The relay computes the hash and compares it to the `integrity` field from the upstream metadata. A mismatch is dropped and logged.
4. **Offline mode serves only what is already verified.** If upstream is unreachable, cached metadata and tarballs are served as they are; nothing new is invented.
5. **No runtime dependencies** in the first version. Node's built-in `http`, `crypto` and `fs` are enough.

## Open questions

- Discovery: mDNS (`relais.local`) works on most home networks but is often blocked on campus Wi-Fi. Fallback: show the IP and a QR code.
- Storage limits on small laptops: when to evict, and how to pin a session pack.
- HTTPS on a LAN without certificate warnings, or plain HTTP with integrity checks only.
- Windows firewall prompts on first run: how to make them understandable for a beginner.
