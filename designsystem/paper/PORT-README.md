# PORT-README — porteringskontrakt

> **ARKIV / DEPRECATED (25.08.2026).** Ikke port produktskjermer herfra.
> Gjeldende portkontrakt: `designsystem/train-lock/PORTING.md`. Se `DEPRECATED.md`.

**Historisk:** Les denne først. Deretter `DESIGN-FASIT.md`. `PROSESS.md` gjelder ikke deg — den beskriver arbeid inne i Claude Design.

Sist oppdatert 18.08.2026 (supersedert 25.08).

---

## 1 · Hva som er fasit

| Kilde | Status |
|---|---|
| `fase1/` (35 skjermfiler) | **Fasit** |
| `fase2/` (61 skjermfiler) | **Fasit**, men les fideliteten på første linje i hver fil |
| `tokens/akhq-tokens.css` v3.1 | **Token-fasit** — eneste gyldige |
| `components/` + `_ds_bundle.js` | Komponentfasit (React, kompilert) |
| `uploads/` | **Kopi/utgått.** Aldri sammenligningsgrunnlag. (`export/design-zip/` og handoff-mappen er slettet 20.08.2026) |
| `kart/` | Historikk og ordrer. Ikke fasit |

Ferskhetskilden er **`designsystem/paper/SYNC-STATUS.md` i kodebasen** — den sier hvilken zip-eksport speilet er synket mot. Til sammen **96 skjermfiler**. Tallet 208 er totalen for alle HTML-filer i prosjektet inkludert `components/`, `guidelines/` og `templates/` — ikke et skjermtall.

## 2 · MAL-filer leses alltid sammen med manifestet

Hver fase2-fil har en `FIDELITET:`-linje øverst:

- **`FIDELITET: PIXEL-FASIT`** — selvstendig fil. Mørk modus, bruddpunkter og tilstander står i fila. Port som den ser ut.
- **`FIDELITET: MAL`** — fila lenker `w3-base.css` (PlayerHQ), `w4-base.css` (AgencyOS) eller `w5-base.css` (felles/marketing/auth/forelder). **Mørk modus, bruddpunkter og tilstander er ikke i HTML-fila — de er i base-CSS-en.** Avvik per rute står i manifestfilen som er navngitt i stempelet. Porterer du en MAL-fil uten manifestet, porterer du en halv skjerm.
- **`FIDELITET: UAVKLART`** — venter på eiers klassifisering. Ikke port.

## 3 · Bruddpunkt-kartet

**430 px er innholdsbredde, ikke viewport-krav.** PlayerHQ-fasitene er tegnet i en 430 px kolonne fordi det er maksbredden innholdet skal ha. Skjermen skal fungere fra 390 px viewport og oppover; kolonnen er en `max-width`, ikke et minimumsvindu. En port som setter 430 px som fast bredde er feil.

Bruddpunktene ellers: desktop basis · ≤1100 px iPad · ≤640 px mobil · `pointer: coarse` → 44 px treffmål (gulv, kan ikke underskrides).

## 4 · Tema

- **I kode brukes kun `html[data-v2-tema]` med cookie `ak-v2-tema`.**
- Fasitens `[data-theme]` + `localStorage` (`akhq-theme-agencyos` / `akhq-theme-playerhq`) er **demo-stillas**. Skrelles bort ved port; verdiene (hvilke tokens som gjelder i mørk modus) beholdes.

## 5 · Demo-stillas som alltid skrelles

- `.phone`, `.framehint` og all telefonramme-chrome
- tilstandsbrytere og alt merket `data-demo-only`
- tema-JS og tema-knapper i fasitfilene
- `w3-demo.js` / `w4-demo.js` / `w5-demo.js`
- `href="#"`, `() => {}` og `data-toast` som står i stedet for ekte handling

## 6 · Ikonmapping

Håndskrevet SVG i en fasitfil → **nærmeste Lucide-ikon** i kode. Lucide er eneste ikonkilde: stroke 1,5 px, `currentColor`, 18 px i navigasjon. Unntak: data-viz (dispersion, pyramide, trend, baneskisser) er ikke ikoner og tegnes som egen SVG.

## 7 · Token-oversettelse

Venstre kolonne er hentet ordrett fra `tokens/akhq-tokens.css` v3.1. Høyre kolonne er kodens navn i **`src/styles/paper-tokens.css`**, verifisert mot koden 18.08.2026 (Anders). Rader merket *avklar* har ingen oppgitt motpart ennå.

**Mørk modus i kode aktiveres med `html[data-v2-tema="dark"]` — og bare det.** Fasitens `[data-theme]` + `localStorage` er demo-stillas og porteres aldri (jf. §4).

| Fasit-token | Verdi (lys) | Verdi (mørk) | Kode |
|---|---|---|---|
| `--bg` | `#faf9f5` | `#141413` | `--p-bg` |
| `--surface` | `#ffffff` | `#1d1c1a` | `--p-surface` |
| `--soft` | `#f0eee6` | `#26241f` | `--p-soft` |
| `--soft-hover` | `#e8e6dc` | `#2e2c28` | *(mangler i koden — avklar)* |
| `--surface-warm` | `#e3dacc` | `#2a2824` | *(mangler i koden — avklar)* |
| `--border` | `#e8e6dc` | `rgba(250,249,245,.10)` | `--p-border` |
| `--hairline` | `#d1cfc5` | `rgba(250,249,245,.08)` | `--p-hairline` |
| `--fg` | `#141413` | `#faf9f5` | `--p-fg` |
| `--ink-soft` | `#3d3d3a` | `#e8e6dc` | `--p-ink-soft` |
| `--muted` | `#5e5d59` | `#b0aea5` | `--p-muted` |
| `--mid` | `#b0aea5` | `#6b675e` | `--p-mid` |
| `--text-tertiary` | `#87867f` | `#87867f` | *(mangler i koden — avklar)* |
| `--rail` / `--rail-fg` / `--rail-on` | `#141413` / `#b0aea5` / `#faf9f5` | `#0e0d0c` / `#97938a` / `#faf9f5` | *(mangler i koden — avklar)* |
| `--cta` / `--on-cta` / `--cta-hover` | `#141413` / `#faf9f5` / `#3d3d3a` | invertert | `--p-cta` / `--p-on-cta` / *(hover: avklar)* |
| `--accent` | `#d97757` | `#d97757` | `--p-accent` |
| `--accent-fg` | `#b85c3d` | `#e5a184` | `--p-accent-fg` |
| `--accent-soft` | `rgba(217,119,87,.12)` | `rgba(217,119,87,.18)` | *(mangler i koden — avklar)* |
| `--accent-deep` | `#c6613f` | — | `--p-accent-deep` |
| `--up` / `--up-raw` | `#63784a` / `#788c5d` | `#9db284` / `#788c5d` | `--p-up` / `--p-up-raw` |
| `--dn` | `#a85536` | `#de9e82` | `--p-dn` |
| `--info` / `--info-raw` | `#46719f` / `#6a9bcc` | `#93b7dc` / `#6a9bcc` | `--p-info` / `--p-info-raw` |
| `--s1`…`--s9` | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 px | samme | `--p-s1`…`--p-s9` (samme verdier) |
| `--r-sm` / `--r` / `--r-md` / `--r-lg` / `--r-pill` | 8 / **12** / 16 / 24 / 999 px | samme | `--p-r-sm` / `--p-r` / `--p-r-md` / `--p-r-lg` / `--p-r-pill` |
| `--shadow` | to lag, 3 % + 5 % | `none` | `--p-shadow` |
| `--scrim` | `rgba(20,20,19,.4)` | samme | `--p-scrim` |
| `--dur` / `--dur-slow` / `--ease` | 160 ms / 280 ms / `cubic-bezier(.16,1,.3,1)` | samme | `--p-dur` / *(slow: avklar)* / `--p-ease` |
| `--tap` / `--tap-lg` / `--tap-capture` | 44 / 48 / 60 px | samme | `--p-tap` / `--p-tap-lg` / `--p-tap-capture` |
| `--font-sans` / `--font-serif` / `--font-mono` | Poppins / Lora / IBM Plex Mono | samme | `--p-ui`+`--p-disp` / `--p-body` / `--p-mono` |

Aliaser som finnes i skjermfilene og peker på det samme: `--disp` og `--ui` = `--font-sans`, `--body` = `--font-serif`, `--mono` = `--font-mono`.

## 8 · Faste regler porten ikke får bryte

1. CTA er blekk/papir (`--cta`/`--on-cta`). Oransje `#d97757` har monopol på «Én ting nå» og focus. Logoprikken er eneste unntak.
2. Alle tall i `--mono` med tabulære sifre og komma-desimal (`+2,92`).
3. `--mid` er aldri tekst i lys modus.
4. Norsk bokmål med æøå i all UI-tekst. Ingen emojier.
5. 44 px treffmål er et gulv, ikke en anbefaling.
6. Overlay-fokuskontrakten (10 punkter i `DESIGN-FASIT.md`) gjelder alt som legger seg over innholdet.
7. **Fundament-normen (18.08.2026):** for delte komponenter (`.btn`, `.chip`, `.num`, `.eyebrow`, topp, rail) vinner `fase1/_foundation.css` ved konflikt med en skjermfil; for skjermspesifikt innhold vinner skjermfilen. Normverdiene: `.btn` 48 px (`--tap-lg`) / 14 px, `.num` med `font-feature-settings:"tnum"`, `.eyebrow` med `var(--text-label)`.

---

## Åpne punkter

Avgjort 18.08.2026 (Anders): token-tabellen (§7), SYNC-STATUS-peker (§1), fundament-normen (regel 7), gfgk/wang stemplet UTENFOR PORT. Gjenstår:

1. **11 manifest-UTKAST** (`fase2/manifest-utkast-*.md`) krever Anders' godkjenning før de er fasit.
2. **Fem token-rader merket *avklar*** i §7 (`--soft-hover`, `--surface-warm`, `--text-tertiary`, rail-tripletten, `--accent-soft`, `--cta-hover`, `--dur-slow`) har ingen oppgitt `--p-*`-motpart.
3. **Ny Rail (232 px sidemeny) venter på A1-godkjenning** — se `guidelines/rail-sammenligning.html`; fase2-fasitens rail er fortsatt mørk 64 px ikonskinne.
