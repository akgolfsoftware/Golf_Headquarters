# AK Golf-masteren → Train-lock: hva tas inn, hva tas ikke inn

Skrevet 03.09.2026 etter at Anders valgte **masteren «AK Golf Designsystem»**
(Claude Design `3e5c851c-4b78-41ab-8ced-7b11048838f9`, speilet i `designsystem/ak-golf/`)
som kilde for å heve designkvaliteten i PlayerHQ og AgencyOS. Lest via Claude Design MCP
samme dag: `tokens/kontrast.md`, `tokens/semantikk.css`, `guidelines/04-farge.md`,
`06-rom-og-geometri.md`, `10-forbudt.md`, `12-bevegelse.md`, `CHANGELOG.md` (v1.0.1).

## Rammen: ingen tokens, kun prinsipper

Masterens egen forbudt-liste (`10-forbudt.md`, «Grensene mot de andre systemene») sier:
**«AK Golf-tokens skal aldri inn i en produktskjerm. PlayerHQ, AgencyOS og Forelder bruker
`--tl-*` (Train-lock). Ingen skjerm har to fasiter.»** Det er samme regel som CLAUDE.md
invariant 2 og beslutningene 31.08/01.09. Denne broen bytter derfor **ingen farge, font,
radius eller avstand** i produktet. Det som tas inn er *måten masteren tenker på* — regler som
kan håndheves mekanisk uten å røre en eneste `--tl-*`-verdi.

## Tatt inn (bygget 03.09)

| Prinsipp fra masteren | Slik lever det i produktet nå |
|---|---|
| **Kontrast måles, aldri anslås** (`kontrast.md`: 52 par, 0 brudd, generert) | `scripts/check-tl-kontrast.mjs` måler 40 par i Train-lock og skriver `docs/design-audit/train-lock-kontrast.md`. Rapporterer, stopper ikke verify (Train-lock er fasit). |
| **Én kilde, én vakt** (`tokens.json` → generator → verify feiler på sklidde filer) | `scripts/design-audit.mjs` gir ett tall per skjermfamilie for de feilene auditen 03.09 fant. Kjøres på nytt etter hver batch. |
| **Trykkflate 44 × 44, «ofte med hansker»** | Allerede Train-lock (`--tl-tap: 44px`). Riggen teller `<div onClick>` uten rolle — de er trykkflater uten tastatur og uten størrelse. |
| **Redusert bevegelse = mindre bevegelse, ikke mindre tilbakemelding** | Train-lock har `--tl-dur-reduced: 180ms` kryss-fade. Regelen skrives inn i audit-sjekklisten: en `prefers-reduced-motion`-gren som fjerner tilbakemeldingen er et funn. |
| **Hover aldri i JavaScript**, kun bak `@media (hover: hover) and (pointer: fine)` | Audit-sjekkpunkt. `onMouseEnter`-hover henger igjen på telefon etter trykk. |
| **Ingen tall om en spiller uten dato og kilde** | Er allerede TruthLayer (PRODUKTRETNING pkt. 7). Audit-sjekkpunkt per skjerm. |
| **Status er aldri identitet** (feilrød ≠ signalrød) | Train-lock har samme skille: `danger` kun feil, `ok` kun godkjent, `warm` kun fullført. Riggen fanger ikke dette mekanisk — manuell dimensjon 5. |

## Funn som krever Anders — ikke rørt

**1. Train-lock i lys modus bryter kontrastkravet på alle signalfarger brukt som tekst.**
Målt 03.09 (`train-lock-kontrast.md`):

| Par (lys) | Målt | Krav |
|---|---:|---:|
| `danger` #FF3B30 på scene #FFFFFF | 3,5:1 | 4,5:1 |
| `ok` #34C759 på scene | 2,2:1 | 4,5:1 |
| `ok` #34C759 på elev #F2F2F2 | 2,0:1 | 4,5:1 |
| `warn` #FFD60A på scene | 1,4:1 | 3,0:1 |
| `viz-target` #0A84FF på scene (StatusPill `tone="info"`) | 3,6:1 | 4,5:1 |
| `mute` #6E6E73 på dock #E9E9EB | 4,2:1 | 4,5:1 |
| mørk: `on-danger` #FFFFFF på `danger` #FF453A (Kø-badge) | 3,4:1 | 4,5:1 |

Dette er Apples systemfarger lagt på hvitt, og de er fasit. To veier, Anders velger:
- **A (anbefalt):** behold tokenene, men innfør regelen «signalfarge er aldri brødtekst i lys
  modus» — bruk den som fyll med hvit tekst, som ikon, eller som stor tekst fra 21 px. Krever
  gjennomgang av `StatusPill`, feilmeldinger i skjemaer og PUBLISERT-merket. Ingen token endres.
- **B:** legg til mørkere lys-varianter av `danger`/`ok`/`warn`/`viz-target` (som masteren gjorde
  med varsel-gul 02.09: `#8A6410` → `#755608`). Endrer Train-lock og krever ny fasit-tegning.

**2. Tall som teller oppover.** Masteren avviste det eksplisitt («et måleresultat gjort om til en
avsløring, og uleselig mens det skjer»). `TallHero` i `src/components/v2/core.tsx` bruker
`useCountUp`, og 16 filer henter den. Train-lock-fasiten sier ingenting om telling. Anbefaling:
fjern tellingen, behold inn-animasjonen (opacity + translateY, som `--tl-dur-card` allerede gir).

**3. Radius og pill.** Masteren: «aldri pill på et kort, aldri 16 px på en knapp». Train-lock:
kort 20, felt 16, pille 999 på CTA og dock. De to systemene er uenige, og Train-lock vinner på
produktskjermer. Ingen handling — nevnt så ingen «retter» det.

**4. Kurven.** Masteren dokumenterer en uenighet med seg selv om `cubic-bezier(0.2, 0, 0.2, 1)`.
Train-lock bruker `cubic-bezier(0.32, 0.72, 0, 1)` (Apple-sheet-kurven) og `--tl-ease-out`
`(0.23, 1, 0.32, 1)` — nøyaktig den masteren sier den *burde* hatt. Ingen handling.

## Ikke tatt inn, med vilje

- Verkstedspaletten (`#E8E4DC`, `#B83217`, `#2C6E63`). Produktet er Train-lock, mørk-først.
- IBM Plex. Produktet er Poppins/IBM Plex Mono (beslutning 25.08).
- 4-skala for avstand og 10 px kortradius. Train-lock har egne loft-trinn og radius 20.
- Instrumentlaget (rutenett 56, målestokk, kryss). Det er merkegrafikk, ikke UI.
- `data-ak-flate="mork"` som tema-mekanisme. Produktet har `data-v2-tema` alene (gotchas.md).

## Programmet: alle skjermfamilier til 18/20

Rekkefølgen står i CLAUDE.md §Skill-bruk og gjelder uendret. Dette er hvordan den kjøres i bredden.

1. **Riggen først.** `node scripts/design-audit.mjs` → `docs/design-audit/<dato>/scoreboard.md`.
   104 familier, 199 skjermer (03.09). Laveste fem: `portal/planlegge` 3,2 · `admin/plan-templates`
   4,2 · `admin/marketing` 5,4 · `admin/gjennomfore` 6,4 · `forelder/innstillinger` 6,4.
2. **Systemgrep før skjermer** — de løfter alle familier samtidig, i denne rekkefølgen:
   (a) felt-primitiv i v2 med fokusring, feiltekst og `aria-invalid` — erstatter `alert()` (6)
   og fokus-hull (7); (b) vakt mot halve tekststørrelser (904 forekomster) i `check-token-gap`
   eller egen sjekk, port familie for familie; (c) `tierEtikett()` i feature-flags — enum aldri i
   UI; (d) `hjelpetekster.ts` mot vokabularet 18.08 (`lFase`, `csNivaa` ut);
   (e) `<div onClick>` → `<button>` eller `role="button"` + tastatur (172, hvorav 2 per familie
   kommer fra `V2Shell`).
3. **Manuell audit per familie**, fem dimensjoner 0–4 (tilgjengelighet, ytelse, responsivitet,
   tema/tokens, helhet/fasit), skrevet til `docs/design-audit/<dato>/<familie>.md`. Fem
   arbeidere i parallell på egne grener, fem familier hver. Sonnet gjør bredden; vurderinger
   og canvas-beslutninger tas i hovedøkten.
4. **Skjermløkke per familie:** canvas der fasit mangler (`skjerm-mapping.ts` sier «ingen» for
   98 av 104) → bygg mot Train-lock → `/impeccable audit` + `review-animations` →
   `better-ui` → `hallmark audit` eller `anti-ui-slop` som uavhengig sjekk → skjermbilde-gate
   (390 + 1280, lys + mørk) til Anders.
5. **Terskel:** 18/20 manuelt og ≥ 8,0 mekanisk. Gjenaudit bekrefter. Under det er familien
   ikke ferdig.
6. **Git:** én gren per batch, `npm run verify` grønt, PR, merge, slett gren. Maks tre økter
   samtidig, maks to timer per økt.
7. **Retro** i `docs/feillogg.md` etter hver batch.

Starter ikke før 24.09-milepælen (STEG 1B) er i havn, med unntak av punkt 2a og 2c som gjør
lanseringen tryggere. Se `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 19.
