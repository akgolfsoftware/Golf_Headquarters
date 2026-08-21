# PORTPLAN — Paper-fasit til kode, sesjon for sesjon

**Skrevet:** 2026-08-17 · **Verifisert mot:** `main` @ `ffb18060` (449 ruter) ·
**Fasit:** `designsystem/paper/` (254 HTML, zip 16.08.2026 21:11 — 0 avvik)

> **⚠ Ikke resynket 21.08.2026:** speilet er siden oppdatert mot en NY zip (20.08.2026,
> PR #564) — treningsplanleggingens Workbench-skjermer kom inn her, se
> `docs/plan-treningsplanlegging-til-kode-2026-08-20.md`. Rutefasit-tabellene (54 rader/24
> mal-fasiter) under er ikke reverifisert mot den nye zip-en i denne runden — kjør ny
> MCP-sammenligning (regelen i `CLAUDE.md` §Skjermarbeid) før neste portbølge. Ferdigstatus
> for S1–S3/S9/S17/S22/S23 og PP-B1/B2/B5 er derimot bekreftet aktuell 21.08 (se
> `docs/STATUS-NÅ.md`).

Kontrakten og Claude-følelsen står i `CLAUDE.md` §Skjermarbeid og gjentas ikke her.
Tabellene rute → mal → avvik står i `docs/port/rutefasit.md` og gjentas ikke her.
**Denne fila eier kun ÉN ting: hvilken rekkefølge sesjonene kjøres i, og hva som blokkerer hva.**

## Sesjonsregelen

**Én sesjon = én mal-fasit, aldri én rute.** En mal bærer 1–14 ruter som deler struktur.
Bygger du malen én gang og varianten rett etterpå, er marginalkostnaden per variantrute
små minutter. Bygger du rute for rute, bygger du malen på nytt hver gang — og de fire
avvikene mellom kopiene blir aldri like igjen.

Verifisert grunnlag: **24 mal-fasiter dekker 164 konkrete ruter** i 54 fasit-rader.

---

## ⛔ Fase A må kjøres først — 25 av 54 rader kan ikke bygges som de står

Verifiseringen (7 agenter mot `main`, 16.08) ga ett hovedfunn som endrer rekkefølgen:

| Måltall | Verdi |
|---|---|
| Fasit-rader totalt | 54 |
| **Rader som STRYKER én-linje-testen** | **25 (46 %)** |
| Rader USIKKER | 3 |
| Rader som består | 26 |
| «Utgår»-påstander som ikke stemmer mot koden | **4 av 5** |
| Konflikter rangert BLOKKERER | **8** |

Etter kontrakten punkt 4 skal en rad som stryker én-linje-testen **meldes, ikke improviseres**.
25 rader kan altså ikke bygges før noen har tatt en beslutning. Å starte på mal-sesjonene før
Fase A er lukket betyr at nesten annenhver rute stopper midt i sesjonen.

**W5 er verst: 6 av 6 rader stryker.** Hele marketing/auth/forelder/system-bølgen er blokkert.

---

## FASE A — Lukk blokkeringene (ingen skjermkode)

### A0 · Farligste enkeltfunn: «26 legacy-ruter med v2-erstatning» er feil

`rutefasit.md` W4 «Utgår»-linje sier ~26 `(legacy)`-ruter har v2-erstatning og kan strykes.
**Målt: 21 legacy-admin-ruter har ekte innhold, og kun ÉN har en faktisk v2-erstatningsrute.**

`(legacy)` er navnet på en Next.js rutegruppe — den er parentes-pakket og forsvinner fra URL-en.
Den sier ingenting om at koden er gammel. Alle 21 er bygget med V2-komponenter og er live-lenket
fra ikke-legacy kode. **Å behandle «Utgår» som en slettliste her ville fjernet 20 fungerende
admin-flater.** Ingen sletting før hver enkelt rute er verifisert mot en navngitt erstatning.

### A1 · Beslutninger som må hentes fra Anders

Disse er ikke tekniske valg — de kan ikke avgjøres i en kodesesjon.

| # | Spørsmål | Blokkerer | Kilde |
|---|---|---|---|
| A1.1 | **PP-A-gaten: er A1–A4 låst eller åpen?** `beslutninger.md` (16.08) sier låst; `PIXEL-PERFECT-PLAN-COMPLETE.md` v2.0 (16.08, samme dag) sier åpen og blokkerende. | PP-B1, PP-B2, alle admin-maler | To dok., samme dato |
| A1.2 | **`/portal/talent`-huben: bygges eller redirect?** Avvikslinjen inneholder selv et åpent spørsmål. | S-TALENT (5 ruter) | rutefasit.md |
| A1.3 | **Godkjenninger: én flate eller fem?** rutefasit sier «ÉN flate»; `PP-W4-VARIANTS` sier queue + handlingssenter er egne datadomener og at sammenslåing er uavklart; checklisten har signert dem separat. | S-GODKJENN (6 ruter) | Tre motstridende |
| A1.4 | **`/admin/bookinger/ny`: 3 eller 5 steg?** rutefasit sier 3; koden har 5; `PP-W4-VARIANTS` sier antallet er åpent (rører kollisjonsvern + multi-coach). | S-BOOKING-ADMIN | Tre motstridende |
| A1.5 | **`/admin/grupper/[id]/arsplan` → fane?** Å gjøre den til fane fjerner en eksisterende URL — krever «ja» per arbeidsregel 2. | S-GRUPPE (6 ruter) | rutefasit.md |
| A1.6 | **`/portal/coach/melding`: én tråd eller flertråd?** Fasiten tegner enkelttråd-chat; koden har CoachingSession-liste. rutefasit sier «malen som den er» — som skjuler en strukturell forskjell. | S-COACH-HUB (10 ruter) | rutefasit vs PP-W3 |
| A1.7 | **Kortskjema: Stripe Elements eller Billing Portal?** rutefasit ber om innebygd «Stripe-element»; koden bruker Stripes hostede portal. Elements er ikke installert → **ny avhengighet, krever ja.** | S-ABONNEMENT | rutefasit vs kode |
| A1.8 | **`/portal/meg/help`: hvilket skall?** rutefasit sier GFGK-mal med PlayerHQ-chrome; checklisten sier GFGK-maler måles per definisjon ikke mot Paper-shell. | S-HELP (4 ruter) | rutefasit vs checklist |
| A1.9 | **`/portal/meg/utstyr` vs `/utstyrsbag`:** én fasit, to levende ruter. Hvilken dør? | S-UTSTYR | Kode vs checklist |
| A1.10 | **`/portal/ukesdigest` vs `/portal/digest/[uke]`:** fasit-markupen og koden oppgir ulik URL. | D3-raden | Fasit vs kode |

### A2 · Dokumentkonflikter som må ryddes (kan gjøres uten Anders)

| Konflikt | Handling |
|---|---|
| `CLAUDE.md` peker på `plan-designport-alle-skjermer.md` som gjeldende kvalitetsport — filen var stemplet UTGÅTT og er slettet 17.08.2026. To konkurrerende ferdig-definisjoner i hver eneste økt. | **Rettet i denne sesjonen** — se §Gjort |
| Andre fysiske kopi av rutefasit: `designsystem/paper/design_handoff_rutefasit_agenticos/docs-port/rutefasit.md` med den gamle kontrakt-seksjonen. | **Rettet i denne sesjonen** — se §Gjort |
| `agencyos-okonomi.html` finnes i BÅDE `fase1/` (43 kB) og `fase2/agencyos/` (12 kB), samme `<title>`, begge referert. | Anders/eier må stryke den ene |
| `/auth/login`: `fase1/innlogging.html` (signert ferdig) vs `fase2/auth/auth-flyt.html` (ikke signert). Samme skjerm, to maler, motsatt status. | Anders/eier må stryke den ene |
| `/portal/booking`: tre sannheter (checklist signert `playerhq-booking.html`, rutefasit tildeler `-mine` kun til `[bookingId]`, fasit-markupen peker på begge). | Anders/eier avklarer |
| Fasit-regnskapet: checklisten sier 88 aktive rader, PIXEL-PERFECT sier 85. «COMPLETE» kan erklæres på 85/85 mens 3 rader står igjen. | Én av dem rettes |
| Åtte fase1-signerte AgencyOS-skjermer bruker **gammel rail**. Samme grunn ble brukt til å stryke to andre fasiter. Etter PP-B1 (fase2-rail) blir alle åtte utdaterte. | Re-signering etter PP-B1 |
| `PP-W4-VARIANTS` fører «Ny booking» som clay-CTA — nøyaktig det A3-beslutningen kaller et brudd. | Variant-dok. rettes |
| Checklisten sier `playerhq-profil`, `playerhq-utstyr`, `coach-tilbakemelding` er «ikke portet» — alle tre ligger ferdig bygget i repoet. | Checklist oppdateres |

### A3 · Komponenter som må bygges FØR malene

Skallet er på plass; **kø- og AI-laget er det ikke.** Verifisert mot `src/components/`:

**Mangler helt (ingen repo-motstykke):**
- `SectionHeader` (`.grphead`/`.grpnote` — seksjonstittel med tellerbadge)
- `KeyValueGrid` (`.linje` — label/verdi-par, ~10 skjermer)
- **Kø-familien:** `QueueCard`, `ProvenanceDisclosure` (agentkøen med opphav)
- **Data-familien:** `AiRecap`, `AiTipCard`, `NowNext`, `StatusCircleRow`
- **Auth-skall** (`auth-flyt.html`: split brand-panel + kort) — blokkerer alle 13 auth-ruter
- `SkipLink`, `QuickLinkBar`, `StatusBar`

**Delvis (finnes, men dekker ikke fasitens bruk):** `Composer` festet på alle desktop-flater ·
artefaktkolonne 380px · `CommandPalette` · `KpiCard`/`KpiStripe` · `ListRow` · `Tabs` ·
`OneThingNow` · `Callout` · systemtilstander (3 av 87 Next-spesialfiler er Paper).

**Rekkefølge i Fase A:** A3.1 primitiver (`SectionHeader`, `KeyValueGrid`, `Callout`) →
A3.2 auth-skall → A3.3 kø-/AI-familien.

---

## FASE B — Mal-sesjoner

Én rad = én sesjon. «Stryker» = antall rader i sesjonen som ikke kan bygges før Fase A svarer.
Sorteringen er avhengighetsdrevet: det som låser opp mest, først.

### B1 · Skall-sesjoner (låser opp alt annet)

| # | Sesjon | Mal-fasit | Ruter | Stryker | Blokkeres av | Scope |
|---|---|---|---|---|---|---|
| S1 | **Admin-rail → fase2** (PP-B1) | `fase2/agencyos/w4-base.css` | alle admin | — | A1.1 | **GJORT — verifisert 17.08.** `AGENCYOS_NAV` i `src/components/v2/shell.tsx` er identisk med fasitens 7 rail-punkter (Cockpit · Innboks · Kalender · Stall · Plan · Innsikt · Oppsett) i alle 9 fase2-agencyos-fasiter; eneste bevisste avvik er logoen. Alle admin-flater arver den via `V2Shell`. |
| S2 | **Auth-skall** | `auth-flyt.html` | 13 | 1 | A3.2, A2 (to maler) | L — skallet mangler helt |
| S3 | **Systemtilstander** | `system-tilstander.html` | 6 | 1 | — | M — Next-spesialfiler, ikke layouts |

### B2 · PlayerHQ (W3) — 8 sesjoner, 41 ruter

| # | Sesjon | Mal-fasit | Rader | Ruter | Stryker | Blokkeres av | Scope |
|---|---|---|---|---|---|---|---|
| S4 | Innstillinger | `playerhq-innstillinger.html` | 9 | 9 | **3** | okter/anlegg/ai-coach mangler datamodell | L |
| S5 | Abonnement | `playerhq-abonnement.html` | 5 | 5 | 1 | A1.7 (Stripe Elements) | M |
| S6 | Coach-hub | `playerhq-coach-hub.html` | 6 | 10 | 1 | A1.6 (tråd-modell) | L |
| S7 | Talent | `playerhq-talent.html` | 3 | 5 | 1 | A1.2 (hub?) | M |
| S8 | Booking (mine) | `playerhq-booking-mine.html` | 2 | 3 | 0 | A2 (`/portal/booking`-konflikt) | S |
| S9 | Booking (ny) | `playerhq-booking-ny.html` | 1 | 3 | 0 | — | M |
| S10 | Helse | `playerhq-helse.html` | 1 | 2 | 1 | BottomSheet-omlegging fjerner rute | S |
| S11 | Hjelp | `gfgk-veileder-artikkel.html` | 1 | 4 | 1 | A1.8 (skall) | M |

**S4 er tyngst og mest blokkert:** tre av ni underruter (`okter`, `anlegg`, `ai-coach`) har
avvikslinjer som forutsetter felter som **ikke finnes** i `UserPreferences` eller Prisma.
`anlegg` beskriver dessuten feil innholdstype (fasiliteter, ikke anlegg).

### B3 · AgencyOS (W4) — 6 sesjoner, 47 ruter

| # | Sesjon | Mal-fasit | Rader | Ruter | Stryker | Blokkeres av | Scope |
|---|---|---|---|---|---|---|---|
| S12 | Oppsett | `agencyos-oppsett.html` | 3 | 14 | 2 | A1 + «avvik står i malen» er en henvisning, ikke et avvik | L |
| S13 | Planbibliotek | `agencyos-planbibliotek.html` | 3 | 9 | 2 | `plan-templates` er stubb som «Utgår» sier aldri kodes | M |
| S14 | Bookinger | `agencyos-bookinger.html` | 4 | 7 | 1 | A1.4 (3 vs 5 steg) | L |
| S15 | Gruppe-detalj | `agencyos-gruppe-detalj.html` | 2 | 6 | 1 | A1.5 (fane fjerner URL) | M |
| S16 | Godkjenninger | `agencyos-godkjenninger.html` | 1 | 6 | 1 | A1.3 (én flate?) | M |
| S17 | Turneringer | `agencyos-turneringer.html` | 1 | 5 | 0 | — | M |

### B4 · Marketing · Forelder (W5) — 4 sesjoner, 38 ruter · **alle stryker**

| # | Sesjon | Mal-fasit | Ruter | Problem |
|---|---|---|---|---|
| S18 | Marketing-side | `marketing-side.html` | 14 (11 fortsatt blokkert) | Ingen mapping fra 14 ruter til 3 skallvarianter — «velg riktig per rute» er en instruks om å improvisere. Variantnavnet i malen er «forside», ikke «hero+bevis». **3 av 14 (`/`, `/mulligan`, `/playerhq`) har nå en bygget variant fra #565/#566 (20.08) — se § under.** |
| S19 | Marketing-katalog | `marketing-katalog.html` | 9 | Holder for coacher/anlegg/blogg/cases; **bryter på turneringer** (KPI/leaderboard finnes ikke i malen og står ikke i avvikslinjen). Uendret av #565/#566 — kun delt nav/footer, ingen av de 9 rutene fikk innholdsombygging. |
| S20 | Forelder | `forelder-barn.html` | 10 | Fire tegnede tilstander mot ti ruter. `ukerapport`, `fakturaer`, `bookinger`, `varsler`, `innstillinger`, `coach` har **ingen tegnet visning**. Uendret av #565/#566. |
| S21 | Samtykke | `auth-samtykke.html` | 5 | Fire tilstander mot fem ruter, uten mapping. «utlopt» er en tilstand, ikke en rute. Uendret av #565/#566. |

**W5 kan ikke starte før eieren har levert mapping rute → tilstand for S18 (11 gjenstående), S20 og S21.**
Dette er ikke pixel-arbeid; det er manglende design.

#### §B4-tillegg 21.08.2026 — marketing-redesignet (#565–#568) reconciled mot W5

**Konklusjon (verifisert i kode, ikke Invariant 2-brudd):** de nye marketing-flatene bruker
Paper sine faktiske tokens — `--mk-*`-blokken i `globals.css:279-287` er verbatim hentet fra
`--bg`/`--fg`/`--accent` i Paper-tokens (`#faf9f5`/`#141413`/`#d97757`), og `paper-katalog.css`
siterer selv `designsystem/paper/fase2/marketing/marketing-katalog.html` som kilde med
kommentaren «bruk ALDRI egne hex-verdier her». Kilden er `ak-golf-website` (et marketing-utsnitt
av Paper-tokens, ifølge kommentaren i `globals.css`), ikke et konkurrerende designsystem.

**Men det er heller ikke pixel-match mot mal-fasiten** — #565/#566s egne commit-meldinger
dokumenterer bevisste avvik fra `marketing-side.html`/`w5-base.css` (mobil hamburger-meny
malen ikke har, eyebrow-farge `clay` der malen sier `muted`) — «avvik som skal rettes tilbake
i designprosjektet» ifølge PR-en selv, altså en kjent, ikke lukket, gap.

**Faktisk rutedekning fra #565/#566:**
- **Helt ombygd til nytt skall:** `/` (forside), `/mulligan` (ny rute — finnes IKKE i
  `rutefasit.md`/PORTPLAN i dag, må legges til som egen rad), `/playerhq` (bygd fra fasitens
  `/hq`), `/booking` (kun den pausede tilstanden).
- **Fikk kun delt nav/footer, innhold urørt** (var allerede Paper-scoped via `PkShell` →
  `paper-katalog.css`/`paper-side.css` FØR #565): `/coacher(+[slug])`, `/anlegg(+[slug])`,
  `/blogg(+[slug])`, `/turneringer(+[slug])`, `/cases`, `/suksess`, `/vilkar`, `/personvern`,
  `/cookies`, `/coaching`, `/priser`, `/om-oss`, `/faq`, `/kontakt`, `/jobb`, `/junior`,
  `/treningsfilosofi`.
- **Fortsatt urørt, egen mørk v2 (IKKE Paper, IKKE ak-golf-website):** `/stats/*` (~45 ruter,
  egen W7-bølge) og booking-underrutene (`[slug]`, bekreft, kvittering) — fortsatt `MRamme`
  fra `marked-ramme.tsx`.

**Beslutning som gjenstår (uendret fra STEG 0.6 i MASTERPLAN):** skal `ak-golf-website`s skall
formelt overstyre `marketing-side.html` som ny mal-fasit for de 3 rutene (og resten av S18s
11 gjenstående), eller skal de tre rettes pixel-tilbake til malen? Én linje fra Anders løser det.
S19/S20/S21 er upåvirket og trenger fortsatt design uansett svar.

### B5 · Drift/AgenticOS — 3 sesjoner

| # | Sesjon | Mal-fasit | Ruter | Stryker | Merknad |
|---|---|---|---|---|---|
| S22 | AgenticOS-hub | `agencyos-agenticos-hub.html` | 9 | 0 | **GJORT** — PR #555. Ny samleflate + redirects fra agents/agent-team/kommando. Venter kun signering. |
| S23 | Agent-detalj | `agencyos-agent-detalj.html` | 1 | 0 | **GJORT** — PR #435 (13.08): `/admin/agents/[agentId]` er pixel-passet mot fasiten. Venter kun signering. |
| S24 | «Eksisterende V2» ×4 | **ingen mal-fil** | 9 | **4** | `/admin/brief`, `/recording`, `/workspace`, `/marketing·reports`. «Pixel-pass mot Paper-mønsteret» navngir ingen fasit — kan ikke bygges. Trenger enten fasit eller strykning. |

### B6 · Jarvis `/meg` — utenfor rutefasiten

12 fasiter kom i zip 16.08 (`designsystem/paper/jarvis/`). **`rutefasit.md` kjenner dem ikke** —
den har bare `/admin/brief (+ meg/dispatch, meg/morgenbrief)` og antyder redirect. Zip-en gir dem
tvert imot 12 fullt tegnede skjermer. **Konflikt A1-nivå: skal `/meg` være en egen flate eller
redirecte til `/admin/brief`?**

Status: skall + 3 av 12 skjermer er portet (PR #532, draft — hjem, saker, sak).
Gjenstår 9: kalendervakt, dagen, morgenbrief, kveldsjournal, ukesreview, maskinrom, historikk,
innstillinger, fangst. Egen plan i `natt-rapport.md` på den grenen.

---

## Rekkefølge i én linje

```
A0 (ikke slett legacy) → A1 (10 beslutninger) → A2 (rydd dok.) → A3 (komponenter)
   → S1 rail → S2 auth-skall → S3 systemtilstander
   → S22–S23 (GJORT) → S17, S9 (GJORT) → S8 (0 stryker)
   → resten av W3 → W4 → W5 (blokkert til design leveres)
```

**Lista er tom.** Alle fem sesjonene som sto her er merget siden 13.08: S23 (#435),
S3 (#549), S9 (#553), S17 (#554), S22 (#555). De venter nå kun på signering
(skjermbilde-gaten), ikke på bygging. Alt annet venter på Fase A.

---

## Gjort i denne sesjonen

- `designsystem/paper/` resynket mot zip 16.08 21:11 — 20 nye filer (`jarvis/` ×15 + 5 skjermbilder),
  **0 avvik**. Speilet er byte-identisk med zip-en.
- Kontrakten + Claude-følelsen **flyttet** fra `rutefasit.md` til `CLAUDE.md` §Skjermarbeid
  (erstattet med peker — teksten lever nå ett sted).
- `CLAUDE.md`: rettet utdatert speil-linje (208 HTML/zip 09.08 → 254 HTML/zip 16.08) og lagt inn
  forbud mot parallelle fasit-kopier.
- `docs/port/rutefasit.md` er **ikke** flyttet — den lå allerede på plass og er byte-identisk med
  zip-ens `kart/rutefasit-for-claude-code.md` (sha256 `77390a45…`).

## Bevisst avvik fra oppdraget

1. **Zip-en er IKKE pakket ut til `docs/port/paper/`.** De 820 filene ligger allerede i
   `designsystem/paper/`, som `CLAUDE.md` utpeker som arbeidsfasit. En andre kopi ville vært
   nøyaktig de «to sannheter om samme skjerm» oppdraget selv ber om å flagge. Synket inn i det
   eksisterende speilet i stedet.

## ⚠ RETTELSE 17.08.2026 — zip-en var utdatert, v2 hentet fra MCP

Denne planen ble først skrevet mot zip-ens rutefasit. En MCP-sammenligning mot selve
designprosjektet avdekket at **zip-en inneholdt v1 (12.08) mens prosjektet hadde v2 (16.08)**:

| | v1 (zip) | v2 (MCP, gjeldende) |
|---|---|---|
| Størrelse | 9 382 B | 12 543 B |
| Kolonner | Rute · Mal-fasit · Avvik | **+ Komponenter** |
| Porteringsstrategi | — | 6 punkter (token-økonomi) |
| Modellvalg | — | Tabell: Opus / Sonnet / Haiku per oppgaveklasse |
| Skall-pakker | — | Tabell: PlayerHQ · AgencyOS · Marketing/Auth · Forelder |

**Rettet påstand:** planen sa først at rutefasiten «ikke har en Komponenter-kolonne». Det gjaldt
v1. **v2 har den**, og den er nå i `docs/port/rutefasit.md`. Komponentanalysen i §A3 under står
seg — den ble utledet fra Claude-følelsen og `*-base.css` — men er nå **supplert** av v2s
autoritative komponentnavn per rute. Bruk v2-kolonnen som fasit; §A3 sier hvilke av dem som
mangler repo-motstykke.

**v2 bekrefter uavhengig to valg denne planen tok:** «én sesjon per mal-fasit, aldri per rute»,
og at kontrakten skal ligge i `CLAUDE.md` («koster da 0 tokens per sesjon»).

**Ny regel av dette:** før hver portbølge, kjør én MCP-sammenligning
(`list_files` `depth: -1` → diff sti + `size` mot speilet). Zip mot speil var «0 avvik» hele tiden;
driften lå mellom zip og prosjekt. Se `CLAUDE.md` §Skjermarbeid.

Øvrige filer som drifter (mindre kritisk, ikke synket): `_ds_bundle.js` (+8 857 B),
`github.md` (+473 B), `_adherence.oxlintrc.json` (+27 B), og en ny
`Rutekart v2 - portering og komponentfasit.html` (20 060 B, menneskelesbar utgave av v2).
