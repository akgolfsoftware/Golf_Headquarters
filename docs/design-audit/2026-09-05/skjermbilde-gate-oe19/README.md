# Skjermbilde-gate Ø19 — PH-21 Min kurve (05.09.2026)

`/portal/analysere/turneringer`, lokal dev mot prod-basen, innlogget `screentest@akgolf.test`
med demo-identiteten fra `scripts/seed-ph21-signoff-fixture.ts` (skjult: `isActive=false`,
`tour=demo`). 0 px horisontal overflow, ingen konsollfeil i de fire visningene.

| Fil | Hva |
|---|---|
| `ph21-m390-dark.jpg` / `ph21-m390-light.jpg` | PH-21a, 390 × 844, mørk / lys |
| `ph21-d1280-dark.jpg` / `ph21-d1280-light.jpg` | PH-21b, 1280 × 800, mørk / lys |
| `ph21c-m390-dark.jpg` | PH-21c tom tilstand (koblet, ingen turneringer), 390 mørk |
| `ph-21a-…-fasit.jpg` / `ph-21b-…-fasit.jpg` / `ph-21c-…-fasit.jpg` | Fasit-rammene, rendret fra `.dc.html` |

Rigg (`tests/visual/skjerm-mapping.ts`): PH-21a **12,32 %** · PH-21b **13,12 %** · PH-21c **18,39 %**.
Kjente årsaker: V2Shells toppluft (~40 px) forskyver alt mot fasitens y=0; tilbake-lenken er
appens ghost-pille, ikke fasitens tekstrad; bunn-navigasjonen er appens (ikoner + tekst); demo-
dataene har andre verdier enn fasitens eksempeltall (fasitens 7 punkter vs. seedens 6 i 2026).
