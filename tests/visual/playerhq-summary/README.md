# PH-06-rigg — Live-økt-oppsummering (PlayerHQ)

Egen, isolert rigg for D2-PH06/R2 (se
`docs/planer/arbeidsdeling-codex-claude-2026-09-11.md`). Rører ikke den delte
Playwright-riggen (`tests/e2e/`, `playwright.config.ts`) eller
`tests/visual/portering/`-serveren.

## Hva riggen faktisk gjør — og ikke gjør

**SIMULERT, ikke en innlogget databaseprøve.** Ingen Next dev-server, ingen
database, ingen ekte innlogging. `SessionSummary` rendres med
`renderToStaticMarkup` og syntetiske `LiveV2Summary`-objekter
(`fixtures.ts`) — kun første-malingen (SSR-markup) fanges opp.
`lagreDineOrd`/`lagreSpillerVurdering` mockes bort med node:test sin
`mock.module` utelukkende for at import-kjeden (som drar med seg
server-only-kode via actions.ts) skal kunne lastes utenfor
`react-server`-betingelsen `react-dom/server` krever — de faktiske
handlingene kalles aldri.

**Dekket:** layout, tekst-hierarki, innholdsrekkefølge, tomtilstand vs.
delvis vs. fullført, langt innhold, viewport 320/390/834/1440, lys/mørk,
200 % CSS-zoom.

**IKKE dekket av denne riggen** (krever ekte nettleser-hydrering mot en
kjørende app med database/innlogging):
- Skriving i tekstfelt, faktisk lagre-klikk, feilmelding ved lagringsfeil,
  nytt forsøk, dobbel-innsending-sperre.
- Tastaturnavigasjon og fokusrekkefølge.
- Faktisk lukking til `/portal` og at notater/vurdering overlever en
  ekte omlasting.

Disse punktene er verifisert ved lesing av kildekoden (linjereferanser i
`docs/design-audit/playerhq-ph06-2026-09-11.md`), ikke i en levende
nettleser. Teknisk grønt her er ikke visuell godkjenning — Anders må se
appen selv.

## Kjøre riggen

```bash
node tests/visual/playerhq-summary/build-tailwind.mjs                                   # 1) bygg utility-CSS for komponentene
npx tsx --experimental-test-module-mocks --test tests/visual/playerhq-summary/render.tsx # 2) SSR-markup → statiske HTML-filer
npx tsx tests/visual/playerhq-summary/screenshot.ts                                      # 3) skjermbilder → _archive/
```

Mellomfiler havner i `tests/visual/ut/playerhq-summary/` (gitignorert).
Skjermbilder havner i `_archive/visuell-kontroll-ph06-2026-09-11/`
(gitignorert, aldri i `public/` eller Git — se AGENTS.md §Data og sikkerhet).

## Tilstander i fixtures.ts

| Fixture | Viser |
|---|---|
| `TOM_OKT` | Fri økt, ingen drills/logger — ærlig tomtilstand |
| `DELVIS_OKT` | 1 av 3 drills ferdigmarkert, én delvis logget, én urørt |
| `FULLFORT_OKT` | Alle drills ferdigmarkert |
| `LANGT_INNHOLD_OKT` | Lang tittel, 6 drills med lange navn, langt coach-navn |
| `ELDRE_OKT_UTEN_COMPLETED_IDS` | `completedSummary` uten `completedDrillIds` — dokumentert fallback til loggene |
