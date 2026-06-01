# Plan — 71 offentlige sider (stats + marketing) — 2026-06-01

## Hovedfunn: de er allerede stort sett på-brand

Audit av alle 72 offentlige `page.tsx` + stats sin CSS-stilbok:

| Tilstand | Antall |
|---|---|
| Bruker allerede DS-tokens / merkevarefarger | **58** |
| Egen stil (kandidat for finpuss) | 8 |
| Tynn / stub | 6 |

**Stats-plattformen bruker allerede merkevarepaletten** — `stats.css` og under-CSS-ene er bygd på forest `#005840`, lime `#D1F843`, cream `#FAFAF7`, sand `#F1EEE5` + Inter Tight + JetBrains Mono, via et eget `--s-*`-tokensett. Den *ser allerede ut som AK Golf*, den har bare sin egen plattform-passende token-definisjon (som er helt riktig for en offentlig stats-seksjon).

**Konklusjon:** Dette er IKKE et redesign-prosjekt for 71 sider. Det er **fiks det som er galt + verifiser resten**.

> **Beslutning (min anbefaling):** Behold stats + marketing sin egen plattform-/editorial-stil. IKKE tving athletic-app-komponenter på dem — athletic er dashboard-UI, og å bruke det på en offentlig statistikkportal/landingsside ville være feil verktøy. De er allerede merkevare-konsistente.

---

## Reelt arbeid: ~17 sider, ikke 71

### Fase A — Fiks de 3 ødelagte stats-sidene (AKUTT)
Synlige 500-feil i prod **nå**:
- `/stats/leaderboards`
- `/stats/regions` (+ `/stats/regions/[slug]`)
- `/stats/sammenlign-spillere`

1 agent: diagnostiser årsak (fake-data/manglende query/krasj) → fiks hvis lite, ellers skjul bak «kommer snart» til datakilde finnes. **Dette bør gjøres uansett hva du bestemmer om resten** — det er bugs i live prod.

### Fase B — Verifiser + finpuss avvik (1 batch, 2 agenter)
- **8 egen-stil stats-sider** (aargang, regions, sok, tour, wrapped, stats-forsiden): sikre `--s-*`-tokenbruk, fjern evt. avvikende hardkodet hex, ekte data / ærlig tomstate.
- **6 tynne/stub-sider**: sjekk om komplette — bygg ut det som faktisk er halvferdig.

### Fase C — Visuell QA-sveip (1 sveip)
Playwright-screenshot av alle 71 mot ekte data (samme metode som 44-skjerm-galleriet). Øyet fanger det heuristikken ikke ser. Fiks kun det som visuelt stikker seg ut.

---

## Rekkefølge & estimat

```
Fase A (3 ødelagte — akutt)  →  Fase B (~14 sider verifiser/finpuss)  →  Fase C (visuell QA)  →  deploy
```

- **Fase A:** raskt (1 agent). Bør tas nå uansett.
- **Fase B:** 1 batch (2 agenter).
- **Fase C:** 1 screenshot-sveip + målrettede fikser.

Langt mindre enn et fullt redesign. Mesteparten av de 71 sidene står urørt fordi de allerede holder merkevaren.
