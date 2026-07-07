> **KOPI for Claude Design-prosjektet.** Kanonisk kilde: `docs/design-guide-terminologi.md` i akgolf-hq-repoet. Ikke rediger denne kopien — endre kanonisk fil og synk hit (valideres av `scripts/ordbok-json.ts`).

# AK Golf — Design-guide for terminologi (lag 2)

> **Hva dette er:** Hvordan hvert begrep VISES — enheter, tallformat, farger, chips, knapper,
> eksempeldata. Lag 2 av terminologi-systemet: **lag 1** = `docs/ordbok-ak-golf-konsept.md`
> (betydning + staving), **lag 3** = `docs/ordbok.json` (maskinlesbar, generert av
> `scripts/ordbok-json.ts`). Ved konflikt om betydning/staving vinner ordboken; ved konflikt
> om tokens/komponenter vinner `.claude/rules/designsystem.md` + `src/app/globals.css`.
> Alle verdier her er verifisert mot koden 2026-07-03.

## 1. Farger per begrepsdomene

### Pyramiden — TO fargesett (velg etter flate)

| Område | Lys flate (`--pyr-*` i globals.css) | Workbench mørk terminal (`CAT_COLORS` i workbench-hybrid/theme.ts) |
|---|---|---|
| FYS | `#005840` (forest) | `#56C59A` |
| TEK | `#B8852A` (ochre) | `#E8A33D` |
| SLAG | `#2563EB` (blå) | `#84A9FF` |
| SPILL | `#D1F843` (lime) | `#D1F843` |
| TURN | `#A32D2D` (rød) | `#F2908C` |

Bruk utility-klassene `bg-pyr-fys`, `text-pyr-tek` osv. på lyse flater — aldri hex direkte.
TS-speil for charts: `pyramidColors` i `src/lib/design-tokens.ts`. Track-varianter
(`--color-pyr-*-track`) for lette bakgrunner. **NB lys-regel:** aldri lime-på-lys som
tekst/ikon — lime er flate/aksent (jf. theme-light-dark-regelen).

### SG (strokes gained)

- **Positiv verdi:** `text-success` · **Negativ:** `text-destructive` · **Nøytral/flat:** `text-foreground`.
- Kategorifarger i trendlinjer (`sg-trend-line.tsx`): OTT = `--primary`, APP = `--success`,
  ARG = `--warning`, PUTT = `--accent`, Total = `--foreground`.
- Norsk klarspråk-label per kategori: OTT «Tee-slag» · APP «Innspill» · ARG «Nærspill» · PUTT «Putting».

### Compliance på økt-kort (Workbench)

Kategorifargen eier kortets venstre kant + prikk. Compliance vises i EGEN kanal: liten
rund badge øverst til høyre — hake på lime (`WB.lime`) = på plan · kryss på coral (`WB.err`)
= avvik · minus på grå (`WB.muted`) = ikke gjennomført (kortet dempes til 72 % opacity).
Fremtidige økter: INGEN badge. Kilde: `COMPLIANCE_COLORS` + UkeView.

### Semantiske tokens (lys — fasit i globals.css / designsystem.md)

`background #FAFAF7 · foreground #0A1F17 · card #FFFFFF · primary #005840 ·
primary-foreground #D1F843 · accent #D1F843 · accent-foreground #005840 ·
secondary #F1EEE5 · muted-foreground #5E5C57 · destructive #A32D2D · success #1A7D56 ·
warning #B8852A · info #2563EB · border #E5E3DD`. Bruk alltid klassene (`bg-primary`,
`text-success`) — aldri hex i komponenter.

## 2. Tall, enheter og formatering

| Begrep | Visning | Eksempel |
|---|---|---|
| Desimaltall | komma, aldri punktum | `+3,5` · `0,42 SG` |
| SG-verdier | fortegn ALLTID (+/−), komma, 1–2 desimaler | `SG +1,2` · `−0,4` |
| HCP | fortegn på pluss-hcp; ekte minus-tegn (−) | `+3,5` · `−2,1` |
| Putting-avstander | **ALLTID fot (ft)** | `Putt 3–6 ft` |
| Innspill-avstander | meter i dagens kode; yards i intelligence-taksonomien | `100–150 m` / `Innspill 150y` |
| Club Speed (målt) | mph | `104 mph` |
| CS-nivå (trening) | CS + prosent-tall, ni nivåer | `CS80` (aldri CS75) |
| Tusenskille | mellomrom | `47 250 kr` |
| Prosent | mellomrom før % (formelt) | `73 %` |
| Tid | 24-timers, kolon | `09:00` |
| Varighet | min / t | `60 min` · `1 t 30 min` |
| Perioder/ranges | tankestrek (—), ikke bindestrek | `19—25 mai` |
| KPI-/tabulære tall | JetBrains Mono (`font-mono`) | alle store tall og eyebrows |

## 3. Typografi per begrepsbruk

Inter (`font-sans`) = UI/brødtekst · Familjen Grotesk (`font-display`) = display/hero (editorial
italic på nøkkelord) — Inter Tight er utgående (se `.claude/rules/design-system-regel.md`) ·
JetBrains Mono (`font-mono`) = KPI-tall, tabulære tall, eyebrows,
koder (CS80, M2, PR3, P4.0). Ingen andre fonter.

## 4. Chips, badges og statusvisning

- **Badge-varianter** (`athletic/badge.tsx`): `primary | lime | neutral | warn | urgent | ok`.
  Bruk semantisk: ok = grønn bekreftelse, warn = advarsel, urgent = haster, lime = aktiv/NÅ.
- **Økt-status** (fra ordbok B5): planlagt = grå/forest · av Anders = mono forest badge ·
  selvplanlagt = lime badge · ✓ fullført = grønn checkmark · hoppet over = grå ·
  avbrutt = rød · i gang = lime puls · LIVE = rød puls.
- **Tier-pill:** «PlayerHQ · {tier}» (+ «· HCP {hcp}» på desktop). ALDRI
  «Performance»/«Performance Pro» som app-nivå (coaching-pakker!). Elite vises aldri.
- **Spillerkategori A–K (canon v3.5):** A = nybegynner → K = tour-proff. Vis som mono-badge
  «KAT G» e.l. NB: eldre skjermer med A=elite-retning skal migreres — følg canon i alt nytt.
- **AK-formel-koder** som chips: mono uppercase — `TEK · INN150 · L-BALL · CS70 · M2 · PR2`.

## 5. Knapper & CTA-er (flyttet fra ordbok B13)

App-idiom: **rounded-full pill + mono 12px bold uppercase** (app-bredt unntak fra fasit-radius).

| Funksjon | Tekst | Stil |
|---|---|---|
| Lagre / Ferdig | Lagre / Ferdig | primary lime |
| Bekreft / Fortsett / Send / Gjenoppta / Importer / Marker oppnådd | — | primary |
| Avbryt / Lukk / Tilbake / Pause / Endre / Rediger / Vis / Skjul / Last ned / Eksporter / Be om hjelp / Marker som lest | — | outline (Lukk kan være X-ikon) |
| Slett | Slett | danger |
| Neste / Forrige | Neste → / ← Forrige | primary / outline |
| Be om | Be om økt | aldri «request» |
| Logg | Logg ny økt | aldri «log new» |
| Start økt | Start økt | lime primary med play-ikon |
| Avslutt | Avslutt | outline (live-modus: lime) |
| Se mer / Se alle / Åpne | Se mer → / Se alle → / Åpne → | text-button forest |
| Send melding | Send melding | primary lime |
| Oppgrader | Oppgrader til Pro | primary lime |

Touch-mål mobil: min. 44 px høyde (`max-md:h-11`).

## 6. Eyebrows (flyttet fra ordbok B19)

Mono, small, uppercase, letter-spacing 0.08em: `MIN PLATFORM` · `MIN WORKBENCH` ·
`MINE VARSLER` · `MIN STALL` · `TURNERING` · `PERIODE` · `UKE 21` · `DAG · 19. MAI` ·
`LIVE · 09:42` · `RACE 19` (sesong-uke-teller) · `COACH BRIEFING · MANDAG`.

## 7. Hero-titler (flyttet fra ordbok B20)

| Mønster | Eksempel |
|---|---|
| «God morgen, [navn]» | God morgen, Øyvind |
| «[Tall] [substantiv] [verb]» | 38 spillere venter |
| «Min [italic]workbench[/italic]» | Min *workbench* |
| «Lag *ny plan*» / «Mine *mål*» / «Din *innboks*» | italic (Familjen Grotesk) på nøkkelordet |

## 8. Personas — demo-data (flyttet fra ordbok B21)

| Navn | Detaljer |
|---|---|
| **Øyvind Rohjan** | Spiller, HCP +3,5, A1 — **demo-kanon** (alltid fullt navn) |
| **Anders Kristiansen** | Head coach AK Golf, 38 aktive spillere |
| Markus Røinås Pedersen | **Ekte coach på markedssidene — ALDRI demo-spiller** |
| Joachim Tangen | Spiller, HCP +1,2, A1 |
| Emma Sundsdal | Spiller, HCP 4,8, A2 |
| Sigrid Berg | Spiller, HCP 8,2, B1 |
| Nora Lillevold | Spiller, HCP 12,4, B2 |
| Henrik Vorli | Spiller, HCP +0,4, A1 |
| Ida Mathisen | Spiller, HCP 3,1, A2 |

Avatar-initialer avledes ALLTID av ekte navn (Øyvind Rohjan → ØR). Demo-tekster er data,
ikke design — konkret ordlyd kan avvike fra fasit-PNG.

## 9. Klubber & lokasjoner — demo-data (flyttet fra ordbok B22)

| Klubb | Forkortelse | Lokasjon |
|---|---|---|
| Gamle Fredrikstad Golfklubb | GFGK | Fredrikstad |
| Bossum Golfklubb | Bossum GK | Bærum |
| Mandal Golfklubb | Mandal GK | Mandal |
| Trondheim Golfklubb | Trondheim GK | Trondheim |
| Mulligan Indoor | — | Innendørs simulator-fasilitet (AK Golf) |

## 10. Tomtilstander (ærlighets-prinsippet)

Manglende data vises ALDRI som oppdiktede tall. Mønstre: verdi = `—` (mono, `muted`),
subtekst forklarer hvorfor: «ingen data ennå» · «ingen forfalte økter» · «Ingen tester ennå.»
Plassholder-tall for ulåste formler (FYS, A–K-nivåtall) = `—` til Anders låser verdiene.

## 11. Ikoner og forbudt

Kun `lucide-react` — 24 px, 1.5 px stroke, `currentColor`. ALDRI emoji i UI.
Forbudte ord: se ordbokens **B24 forbudt-liste** (fredet, dupliseres ikke her).
