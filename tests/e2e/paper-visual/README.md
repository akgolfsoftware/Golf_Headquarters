# Visuelle Paper-tester

108 spec-filer som sammenligner skjermene mot lagrede referansebilder
(«snapshots») fra Paper-porten.

## Referansebildene ligger ikke i git

De 432 snapshot-filene veide 28 MB og lå tidligere i repoet. Siden hver
designrunde skrev nye bilder, la hver oppdatering en ny kopi i historikken.
De er gitignorert siden 14.08.2026 (`**/*-snapshots/` i `.gitignore`).

**Testene kjører ikke i CI** — verken `ci.yml` eller `playwright.yml` refererer
til dem. De er et lokalt verktøy for designporten, ikke en gate.

## Generere referansebildene

Første gang, eller etter en bevisst designendring:

```bash
npx playwright test tests/e2e/paper-visual --project=chromium --update-snapshots
```

Deretter kjøres de som vanlig:

```bash
npx playwright test tests/e2e/paper-visual --project=chromium
```

Bildene havner i `*-snapshots/`-mapper ved siden av hver spec, og blir liggende
lokalt på maskinen din.

## Viktig forbehold

Fordi bildene ikke deles mellom maskiner, sammenligner du mot **din egen**
referanse, ikke mot en felles fasit. To maskiner kan derfor gi ulikt svar på
samme kode — font-rendering og skjermoppløsning varierer. Testene fanger at
*du* har endret noe siden sist, ikke at skjermen matcher Paper-fasiten.

Skal dette bli en ekte felles gate, må referansebildene lagres delt (Vercel
Blob eller tilsvarende) og testene kobles på CI. Det er ikke gjort.

## Signerte skjermbilder

Sign-off-galleriet fra Paper-porten er arkivert i Google Drive:
`AK Golf Group/akgolf-hq/screenshots-arkiv-2026-08-14/` (449 filer, 58 MB).
