# Synk Claude Design ← designfasit · 01.08.2026

Kjørt av Claude (Cowork) på Anders' oppdrag. Alt under er **målt**, ikke anslått.

## Utgangspunktet: to designsystemer i drift

`tokens/akhq-tokens.css` i dette prosjektet var **v2.1** med `--r: 8px` og `--r-sm: 6px`.
Fase 1 låste radius til 12/8 den 31.07. Låsen ble aldri skrevet tilbake hit.

Resultatet var at alle **106 komponentene** kompilerte mot radius 8, mens Fase 1-skjermene
og designfasit-mappen kjørte 12. To systemer som ser nesten like ut — den dyreste typen avvik,
fordi ingen oppdager den før noen koder etter feil kilde.

## Endret

| Fil | Fra | Til |
|---|---|---|
| `tokens/akhq-tokens.css` | v2.1, radius 8/6, 21 tokens | **v3.1**, radius 12/8, full palett |
| `fase1/_foundation.css` | lokalt 47-hex-subsett | tokens v3.1 verbatim + delt base |
| `fase1/agencyos-konsoll-desktop.html` | Fase 1 | + iPad-ark, layout-fiks, 3px-kant |
| `fase1/agencyos-konsoll-mobil.html` | Fase 1 | + bruddpunkt 640, clay-monopol under fangst |
| `fase1/playerhq-chat-desktop.html` | Fase 1 | + fire «Hvorfor dette tallet», iPad-ark |
| `templates/_UTGÅTT.md` | — | ny: hva som erstatter hva |

### Hva v3.1 legger til over v2.1

Full Anthropic-stige (`--surface-warm`, `--manilla`, `--kraft`, `--hairline`, `--inverse`),
de dormante aksentene (coral, fig, cactus, olive, sky, heather), type-skalaen
(`--text-display` … `--text-kpi`), `--r-md`/`--r-lg`, `--s9`, `--ink-soft`, `--cta-hover`,
`--dur-slow`, `--z-modal`, `--z-command`, trykkflate-tokens (`--tap` 44 / `--tap-lg` 48 /
`--tap-capture` 60).

**v3.1 over v3:** `--rail-hover` og `--rail-active` er løftet inn i kilden. De levde som
lokale oppfinnelser i hver Fase 1-fil. Ingen verdiendring — en flytting.

**Én verdikonflikt avgjort:** `--muted` er `#5e5d59` (v3-kilden), ikke `#5F5B53` (Fase 1).

## Hvorfor radius-byttet var trygt

Stikkprøve av tre komponenter fra ulike familier:

| Komponent | Radius |
|---|---|
| `actions/OneThingNow.jsx` | `border-radius:var(--r)` |
| `layout/Panel.jsx` | `border-radius:var(--r)` |
| `data/KpiCard.jsx` | arver via `.akhq-card` |

Alle token-drevne. Radius propagerer fra tokenfila uten å røre komponentene.

**Verdt å merke:** `OneThingNow.jsx` har hatt `border-left:3px solid var(--accent)` hele tiden.
Komponentbiblioteket var aldri i stykker — det var de tolv hi-fi-malene som mistet kanten.
Det er grunnen til at malene er merket utgått og komponentene er urørt.

## Feil i fasitfilene som må rettes utenfor dette prosjektet

1. **Prosjekt-ID-en `be6bdcb8-4587-4fa1-9cb0-60ad808468f3` gir 404.** Riktig er
   `605a48cc-81e8-44bd-94d2-07d50a97370a`. Den døde ID-en står i `SPOR-STATUS.md`,
   session-starteren og prompt-malen — hver agent som følger dem, finner ikke prosjektet.
2. **Verktøyet heter Claude Design, ikke «Open Design».** Feil navn i seks fasitfiler.

## Ikke gjort

- `templates/` og `uploads/` er **merket**, ikke slettet. Sletting er en egen beslutning.
- `_ds_manifest.json` og `_ds_bundle.js` er ikke rørt — de kompileres av appen.
- Radius-endringen er ikke render-verifisert per komponentkort. Stikkprøven dekker tre
  familier, ikke alle 106. Et fullt renderpass hører hjemme i Claude Design-appen.
