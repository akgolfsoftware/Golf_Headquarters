# design-sync NOTES — akgolf-hq athletic-bibliotek

Repo-spesifikke gotchas for syncen. Les FØR re-sync.

## SCOPE-BESLUTNING 2026-07-06 (Anders)
- Sync KUN `src/components/athletic/golfdata/` (v13, 25 komponenter) — `cfg.srcDir` er oppdatert.
- Det gamle athletic-biblioteket (rot + calendars/data/patterns/…) er i vedlikeholdsmodus og skal
  IKKE til Claude Design (jf. `.claude/rules/design-system-regel.md`).
- NB: golfdata-komponenter kan importere fra `../hooks` eller delte filer utenfor golfdata —
  bygget vil vise om srcDir-scoping holder, ellers bruk componentSrcMap/exclusions.
- Tokens for v13: `golfdata-tokens.css` (i tillegg til globals.css) — sjekk at cssEntry-kompileringen
  tar med begge før konverter-bygg.
- Ingen sync fullført ennå: intet projectId. 2026-07-06 stoppet på DesignSync-autorisasjon
  (økten var startet før /design-login; kjør syncen fra en fersk, innlogget økt).

## Hva dette er
- `akgolf-hq` er et **Next.js APP-repo**, ikke et publisert DS-bibliotek. Designsystemet vi syncer er
  `src/components/athletic/` (97 komponenter etter eksport-utvidelse). `cfg.srcDir = src/components/athletic`
  scoper oppdagelsen til det merkede biblioteket (ikke hele appen).

## Bygg-gotchas (rekkefølge + flagg)
1. **node_modules: worktreen har INGEN egen.** Deps resolves fra hovedrepoet via opp-i-treet-oppslag.
   Kjør konverteren med `--node-modules /Users/anderskristiansen/Developer/akgolf-hq/node_modules`.
2. **Appen self-installer ikke i node_modules**, så `PKG_DIR` (`node_modules/akgolf-hq`) mangler.
   Fix: pek `--entry ./.design-sync/.synth-marker.ts` (en fil som IKKE finnes). Det tvinger
   synth-modus OG setter PKG_DIR til den ekte worktree-roten (konverteren går oppover fra
   entry-dir og finner appens `package.json`). **Ikke symlink akgolf-hq inn i node_modules** —
   det gir dobbel-sti og bryter esbuilds tsconfig-resolusjon.
3. **Synth-entry-modus** (ingen dist/exports): konverteren syntetiserer entry fra src.
   `.d.ts`-kontraktene blir svakere enn med et ekte build — forventet for app-repo.
4. **Tailwind v4 JIT-styling:** komponentene er stylet via utility-klasser som genereres av byggesteget,
   IKKE et ferdig stilark. Kompilér FØR konverter-bygg:
   `npx @tailwindcss/cli@4 -i src/app/globals.css -o .design-sync/compiled-tailwind.css`
   `cfg.cssEntry` peker dit. **Re-kompilér hver gang `globals.css` eller komponent-klasser endres.**
5. **`cfg.tsconfig = tsconfig.sync.json`** (full kopi av app-tsconfig, IKKE `extends` — extends
   bryter esbuilds mappe→index-resolusjon). Inneholder: eksplisitt mapping av mappe-importene
   (`@/components/athletic`, `.../hooks`, `@/components/ui` → deres `index.ts`), `@/*`, og
   **next/*-stubber** (`next/link|image|navigation` → `.design-sync/stubs/`). Uten stubbene drar
   Next-runtimen inn `process.env.__NEXT_*` → `process is not defined` → alle komponenter brekker.
6. **Fork:** `.design-sync/overrides/source-kit.mjs` får synth-entryen til å re-eksportere
   navngitte defaults (`export { default as <Navn> }`) — 33 athletic-filer bruker `export default`,
   og `export *` tar dem ikke med → de havner ellers ikke på `window.AKGolfHQ`. Forken trenger
   `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` (ts-morph-resolusjon).

## Byggekommando (full sekvens — den som faktisk virker)
```
npx @tailwindcss/cli@4 -i src/app/globals.css -o .design-sync/compiled-tailwind.css
ln -sfn ../.ds-sync/node_modules .design-sync/node_modules   # for forken (ts-morph)
node .ds-sync/package-build.mjs --config .design-sync/config.json \
  --node-modules /Users/anderskristiansen/Developer/akgolf-hq/node_modules \
  --entry ./.design-sync/.synth-marker.ts --out ./ds-bundle
PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright node .ds-sync/package-validate.mjs ./ds-bundle
```

## Render-status (siste bygg)
- `✓ bundle is complete` — alle 97 komponenter på globalen, 89/97 render rent.
- 8 RENDER_BLANK = små badge/dot/chip-komponenter (floor-card uten props) — ikke feil, trenger authored preview for å se rike ut.
- Ikke-blokkerende warns: `[TOKENS_MISSING]` (font-vars injisert i runtime), `[FONT_MISSING] Cambria` (fallback i CSS — system-font er ok).

## Re-sync risks (hva som kan ruste i stillhet)
- `compiled-tailwind.css` er et **build-artefakt** (gitignored) — må regenereres hver re-sync, ellers
  mangler nye utility-klasser → komponenter rendrer halvt-stylet.
- Symlinken + avhengigheten av hovedrepoets node_modules — forsvinner ved ny maskin/clone.
- Synth-entry gir svake typer; hvis appen senere får en ekte DS-pakke med dist, bytt til `--entry`.
- `next/link`, `next/image`, server-komponenter i enkelte athletic-filer kan feile isolert render →
  floor-card eller `cfg.overrides.<Name>.skip`.
