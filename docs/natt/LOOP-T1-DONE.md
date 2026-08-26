# LOOP T1 — AgencyOS-skall portet til Train-lock (25.–26.08.2026)

## Status: FERDIG (i egen gren, ikke merget)

Gren: `claude/t1-agency-skall-tl`. PR: se lenke i sluttrapporten til oppdragsgiver.
`npm run verify` + `npm test` (1612/1612) grønt på alle commits.

## Viktig — oppdraget ble korrigert underveis, IKKE en feil fra utføreren

Oppdraget startet med en eksplisitt instruks om å IGNORERE
`designsystem/train-lock/AX-01 Skall rail og tabbar.dc.html` (kalt "UGYLDIG/
utdatert" i oppdragsteksten) og bygge etter `AG-00 LOCK.dc.html` + `AG-05
Mer-ark.dc.html` + HANDOFF.md sitt "Meny per enhet"-avsnitt i stedet: **sju**
Mac-destinasjoner (Cockpit · Innboks · Kalender · Stall · Workbench · Innsikt ·
Oppsett, 64px ikon-rail) og **fem** mobil-destinasjoner + eget "Mer"-ark
(Plan/Innsikt/Oppsett/Klubb).

Første commit (`35174b25`) bygde nøyaktig dette. Underveis i arbeidet sendte
Anders inn en korrigering: `AX-01`-filen var i mellomtiden levert på nytt i
komplett form (11 431 byte, ikke den avkuttede 2 809-byte-versjonen), og
**overstyrer** både 7-tabs-fasiten og AG-00s 5-tabs+Mer-ark-mønster (dokumentert
i `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6, skrevet FØR jeg fikk beskjeden —
jeg hadde bare ikke lest den seksjonen selv i første runde). Riktig, endelig
struktur: **fem faste destinasjoner, identisk rekkefølge mobil og Mac, aldri
en sjette: Stall · Workbench · Kø · Jarvis · Meg**, med Konsoll/Økonomi/Kalender
som RADER under Meg (ikke egne tabber), og Mac-railen 232px MED tekst
(ikke 64px ikon-bare firkanter).

Jeg flagget selve motsigelsen mellom oppdragsteksten og `beslutninger.md`
(som allerede pekte mot AX-01-varianten) FØR jeg begynte å kode — se
transkriptet — men fulgte den eksplisitte oppdragsinstruksen siden den var
mer detaljert og direkte adressert til akkurat denne konflikten. Da
korrigeringen kom, bygde jeg om i en ny commit (`aef75f05`) i stedet for å la
den gale strukturen stå. **Konklusjon: ikke min feil, ikke Anders' feil** —
kilden (`AX-01`) endret seg fysisk midt i oppdraget (avkuttet fil → komplett
fil), og det tok en runde å oppdage.

## Hva som ble gjort (endelig, gjeldende struktur)

Fasit brukt: `designsystem/train-lock/AX-01 Skall rail og tabbar.dc.html`
(komplett versjon) + `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6.

**Mac-rail (`TrainLockAgencyRail`, ≥ TL_BREKK.macRail = 1101px):**
- 232px bred (`--tl-rail-mac` oppdatert fra 64px → 232px), bakgrunn `TL.dock`,
  høyre kant `TL.hair`, padding 18px 12px, gap 4px.
- Header: AK-prikk (`TL.warm`, 8px) + "AK Golf Academy" + tema-bryter (liten,
  ikke i fasiten men beholdt funksjonelt per tidligere beslutning).
- 5 rader (`AgencySkallRad`, 40px, radius `TL.radius.row`): Stall · Workbench ·
  Kø · Jarvis · Meg. Aktiv = flate `TL.dim` + tekst `TL.text`. Inaktiv =
  `TL.mute`, ingen flate.
- Divider, caps-label "Under Meg", 3 rader (34px, ingen ikon): Konsoll ·
  Økonomi · Kalender — hver med egen aktiv-sjekk mot `pathname`.
- Bunnrad: "Åpne AgenticOS" → `/admin/agenticos`.

**Mobil-dock (`TrainLockAgencyDock`, AX-01a):**
- Full bredde, 88px høy, bakgrunn `TL.dock`, hairline-topp `TL.hair` (ikke
  lenger en flytende 358px-pille som i forrige commit).
- 5 like kolonner, samme rekkefølge som Mac-railen. Aktiv = `TL.text`,
  inaktiv = `TL.mute`, ikon 20px, label 10px/600 (VANLIG case, ikke uppercase
  — AX-01-mockupen bruker "Stall"/"Workbench", ikke "STALL"/"WORKBENCH").
- "Meg" er en `<button>`, ikke en `<Link>`: åpner `MegArkTL` i stedet for å
  navigere direkte (se begrunnelse under).
- Kø-badge (danger, kun tall som krever handling) er kodet men **ikke koblet
  til noen ekte datakilde** — ingen kallsted i repoet leverer et kø-tall
  til denne komponenten ennå (samme som `withAgencyOsNavBadges` allerede sto
  ubrukt før dette oppdraget). Badge-visningen fungerer, men vil alltid vise
  0/skjult inntil en side wirer inn et tall.

**`MegArkTL` (nytt, mobil-only):** shell.tsx eier ikke `/admin/profile`-siden
(anti-scope: "ingen innholdsskjermer portes"), så et lite TL-ark med rader
Konsoll/Økonomi/Kalender/Min profil (samme geometri som AG-05: grabber 36×4,
tittel 26/700, rader 15/600+chevron, Avbryt 44px) er raskeste vei til å holde
disse tre sidene nåbare på mobil uten funksjonstap. Alternativet (redigere
`/admin/profile`-siden til å vise radene) ble eksplisitt tilbudt av
oppdragsgiveren men innebar å røre en innholdsskjerme utenfor scope.

**Href-mapping (min vurdering, laveste endring):**
| Tab | Href | Begrunnelse |
|---|---|---|
| Stall | `/admin/spillere` | Samme som gamle "spillere"-punktet i AGENCYOS_NAV |
| Workbench | `/admin/planlegge` | Samme som gamle WORKBENCH_ITEM/planlegge-familien |
| Kø | `/admin/queue` | Reell, fungerende side med det navnet — ikke `/admin/godkjenninger` (annet konsept: godkjenninger er én av flere ting i "innboks") |
| Jarvis | `/admin/agenticos` | Eneste AI-agent-hub som finnes; ingen egen "Jarvis"-rute |
| Meg | `/admin/profile` | Eneste profilside; brukt for Mac-radens direkte lenke |
| Konsoll (under Meg) | `/admin/agencyos` | Gamle "cockpit"-siden |
| Økonomi (under Meg) | `/admin/agencyos/okonomi` | Per admin-tripletex.md (gamle `/admin/finance` redirecter dit) |
| Kalender (under Meg) | `/admin/kalender` | Uendret fra før |

**Token-tillegg:** `--tl-on-danger: #FFFFFF` (begge tema, samme hex som
`--tl-avatar`/`--tl-warm`-mønsteret) — erstatter to hardkodede `"#FFFFFF"`-
literaler som `check-token-gap.mjs` flagget for Kø-badge-teksten. `TL.onDanger`
lagt til i `src/lib/v2/train-lock.ts`.

**Reell bug funnet og fikset (commit `8b1d3971`):** doken hadde både
`className="flex md:hidden"` OG en inline `style={{ display: "flex", ... }}`.
Inline styles vinner alltid over CSS-klasser/media-queries, så
`.md\:hidden { display: none }` fikk aldri effekt — doken var synlig på
1280px desktop-bredde også (verifisert med Playwright `getComputedStyle`
før/etter). Fjernet den overflødige `display`-linja fra style-objektet.

## Hva som IKKE ble gjort

- Ingen innholdsskjermer er portet (Stall/Konsoll/Kø/Jarvis/Profile-sidene
  beholder sitt eksisterende, u-Train-lock-ede innhold — kun skallet rundt
  dem er nytt).
- `AGENCYOS_NAV` (7 punkter, gamle ider cockpit/innboks/kalender/spillere/
  planlegge/innsikt/innstillinger) er **uendret** — den brukes fortsatt av
  ~50 andre kallsteder for `aktiv=`-matching, `withAgencyOsNavBadges` og
  `AGENCYOS_ROM`/Mer-panelet på ANDRE steder i koden (ikke skallet). Å endre
  selve konstanten ville brutt de skjermene uten at de er portet. Ny,
  frittstående `AGENCYOS_SKALL_TABS`/`AGENCYOS_UNDER_MEG` styrer KUN
  rail/dock-visningen.
- Kø-badge er visuelt implementert men ikke koblet til noen datakilde
  (se over).
- Hover/fokus-tilstander for Mac-tastaturnavigasjon: fasiten selv sier dette
  er "ikke blokkerende, tas når det blir aktuelt" (D2-UNDERLAG §5.5) —
  ikke bygget her.
- Ingen ruter er flyttet, opprettet eller slettet. Ingen redirects endret.
- Ikke merget til main. PR opprettet som draft/vanlig PR, venter på Anders.

## Skjermbilder

Alle 5 tatt mot lokal dev-server, innlogget som `coachtest@akgolf.test`
(samme testbruker som `tests/e2e/_auth-helpers.ts` bruker, passord fra
`.env.local` i hovedmappen — LEST, aldri kopiert som fil, jf.
`.claude/rules/gotchas.md`), side `/admin/spillere` (Stall-fanen, viser
railen/doken tydelig sammen med reelt sideinnhold):

- `mac-1280-mork.png` — 1280px, mørk
- `mac-1280-lys.png` — 1280px, lys
- `mobil-390-mork.png` — 390px, mørk
- `mobil-390-mork-meg-ark.png` — 390px, mørk, Meg-arket åpent
- `mobil-390-lys.png` — 390px, lys

Merk: en liten sirkulær "N"-knapp nederst i venstre hjørne på alle
skjermbildene er **Next.js' eget dev-mode-verktøy-ikon** (kun i `next dev`,
aldri i prod/preview) — ikke noe bygget i dette oppdraget.

## Feil som kostet tid

1. Oppdraget pekte meg eksplisitt bort fra `AX-01`, men den filen var den
   riktige fasiten hele tiden (bare levert i to versjoner: avkuttet, så
   komplett). Løst ved at oppdragsgiver korrigerte underveis — se toppen av
   denne fila.
2. `display: "flex"` som inline style overstyrte `md:hidden`-klassen på
   doken — usynlig i kode-review, kun oppdaget ved faktisk å måle computed
   style i nettleseren på 1280px. **Lærdom for neste skall-jobb:** sett ALDRI
   `display` i `style={{}}` på et element som har en responsiv
   `hidden`/`md:flex`-klasse — la className eie display fullt ut.
3. Playwright `.first()` på `nav[aria-label="Hovedmeny"]` matchet feil
   element (rail, ikke dock) fordi begge har samme aria-label og rail
   kommer først i DOM-rekkefølgen — måtte bruke `data-paper-faner="agency"`
   for å target riktig element i debug-scriptene.
