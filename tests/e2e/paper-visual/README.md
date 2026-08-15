# Visuelle Paper-tester

108 spec-filer som sammenligner skjermene mot lagrede referansebilder
(«snapshots») fra Paper-porten.

## Referansebildene ligger ikke i git

De 432 snapshot-filene veide 28 MB og lå tidligere i repoet. Siden hver
designrunde skrev nye bilder, la hver oppdatering en ny kopi i historikken.
De er gitignorert siden 14.08.2026 (`**/*-snapshots/` i `.gitignore`).

**Testene kjører ikke i CI.** `ci.yml` kjører ikke Playwright i det hele tatt.
`playwright.yml` (prod-røyktesten) kjører `npx playwright test` over hele
`tests/e2e/`, men `playwright.config.ts` filtrerer bort `paper-visual/` når
`CI` er satt. De er et lokalt verktøy for designporten, ikke en gate.

Denne setningen var lenge feil, og det kostet: fram til 15.08.2026 sa filen at
`playwright.yml` ikke rørte mappa. Den gjorde det. 104 av spec-ene hoppet over
seg selv (`test.skip` uten seed eller credentials), men
`portal-analysere.visual.spec.ts` manglet vakten. Den navigerte uinnlogget til
`/portal/analysere`, ble sendt til `/auth/login`, og lette etter et
referansebilde som ikke fantes på Linux. Resultat: prod-røyktesten sto rød i
195 kjøringer fra 06.08 til 15.08 — hele tiden det eneste automatiske signalet
på at produksjon var ødelagt.

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
