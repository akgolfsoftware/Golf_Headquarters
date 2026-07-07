# CLAUDE.md — AK Golf designsystem (LES FØRST, hver chat)

> Dette er den låste design-grunnloven for AK Golf-plattformen. **Les denne før du tegner én eneste
> skjerm.** Aldri improviser farger, fonter eller komponenter — bruk ALLTID verdiene under, så blir
> skjermene konsistente på tvers av alle chatter. UI-tekst: norsk bokmål (æ, ø, å).

## Plattformen (6 flater)
1. **PlayerHQ** — spillerens app. Mobil-først. **LYST** tema.
2. **AgencyOS** — coachens kontrolltårn. Data-tett. **MØRKT** tema (standard) + lys variant.
3. **akgolf.no / Marketing + stats** — offentlig nettside + stats-funnel. **LYST**.
4. **Forelder** — foreldreportal. **LYST**.
5. **Auth** — innlogging/oppstart. **LYST**.
6. **Booking** — kjøpsflyt (på tvers).

## Farge-tokens (EKSAKTE — ikke gjett)

**LYST tema** (PlayerHQ, Marketing, Forelder, Auth, AgencyOS-lys):
| Token | HEX | Bruk |
|---|---|---|
| Bakgrunn | `#FAFAF7` | side-bakgrunn |
| Kort | `#FFFFFF` | kort/flater |
| Tekst | `#0A1F17` | primær tekst |
| Dempet tekst | `#5E5C57` | sekundær tekst |
| Kantlinje | `#E5E3DD` | borders |
| Sand/sekundær | `#F1EEE5` | chips, rolige flater |
| Primary | `#005840` (skog-grønn) | CTA, primær handling — tekst-på = lime `#D1F843` |
| Lime-aksent | `#D1F843` | highlight/aktiv — tekst-på = `#005840` |
| OK `#1A7D56` · Advarsel `#B8852A` · Info `#2563EB` · Feil `#A32D2D` | | status |

**MØRKT tema** (AgencyOS standard — nær-svart, IKKE grønn):
| Token | HEX | Bruk |
|---|---|---|
| Bakgrunn | `#0A0B0A` | side (varm nær-svart) |
| Kort/flis | `#171817` | kort |
| Hevet | `#1E1F1D` | hevet flis |
| Panel | `#141513` | paneler |
| Tekst | `#F0F0F0` | primær |
| Dempet tekst | `#A6A8A3` | sekundær |
| Kantlinje | `#262725` | hairline |
| Lime | `#D1F843` | aktiv/NÅ/CTA — tekst-på = `#0A140C` |
| OK `#4FD08A` · Advarsel `#E8B43C` · Info `#5AA9F0` · Feil `#F0683E` | | status |

## Typografi (3 fonter — ingen andre)
- **Inter** — UI og brødtekst (default).
- **Familjen Grotesk** — display/overskrift. Editorial italic tillatt. (Inter Tight er utgående — se `.claude/rules/design-system-regel.md`.)
- **JetBrains Mono** — ALLE tall + eyebrows/små etiketter. **Store mono-tall er signaturen.**

## Ufravikelige regler
- **Ikoner:** KUN Lucide-stil, 1.5px strek, currentColor. **INGEN emoji.**
- **Spacing:** 8pt-grid (`p-2/4/6/8`). Data-tette flater (dashboards, tabeller, lister) kan bruke 12–14px tetthet.
- **Lime-disiplin:** lime (`#D1F843`) KUN på den ENE tingen som krever blikket nå (CTA / aktiv / NÅ). Aldri som flatefyll.
- **Knapper:** rounded-full pill + mono uppercase. 3 størrelser. 44px touch-mål på mobil.
- **Estetikk:** editorial sport-analytics — skog-grønn dybde + ett lime-blikkanker, store mono-tall,
  rikelig tomrom, premium. Aldri «excel»/grå rad-på-rad. Interaktiv datafortelling der det er data.

## Komponentbibliotek (gjenbruk — bygg ikke nytt)
Knapper · kort · KPI-blokker · badges/chips (ok/warn/urgent/lime/neutral) · avatar · faner · tabeller
(tabulære mono-tall) · skjema/input · navigasjon (PlayerHQ bunnbar, AgencyOS sidebar/skuff) · modaler ·
kalendere (måned/uke/dag/gantt) · tom/laster/feil-tilstander.
**Data-viz (hjertet):** fordelings-radar, SG-elv, benchmark-scrubber, approach-varmestige, trend/sparkline,
heatmap. Nytenkende og interaktivt — aldri flate grafer.

## Per-flate designspråk
- **PlayerHQ:** lyst, mobil-først, motiverende. «Hva skal JEG gjøre i dag?» Bunnbar-navigasjon.
- **AgencyOS:** mørkt, data-tett (Bloomberg-aktig men rolig), ADHD-føring (én ting i fokus, lime kun på «hva nå»). «Hvem trenger MEG i dag?»
- **Marketing/stats:** lyst, redaksjonelt, premium, interaktiv datafortelling, funnel mot PlayerHQ.
- **Forelder/Auth:** lyst, enkelt, trygt, få valg.

## Låste beslutninger (følg — ikke endre)
- App-navn: **AgencyOS** (aldri «CoachHQ»).
- Demo-navn: spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** (fulle navn alltid).
- Abonnement: **gratis ELLER 299 kr/mnd** — INGEN nivåer/tiers. **«ELITE» vises ALDRI.**
- Performance / Performance Pro = coaching-pakker, ikke app-nivåer.
- Tema: PlayerHQ alltid lyst. AgencyOS mørkt standard (+ lys variant).

## Terminologi & tallvisning (LES `ordbok-design-guide` før du skriver tekst)
Den vedlagte `ordbok-design-guide` er fasit for ALT som vises av tekst, tall og enheter:
- **«nærspill»** — aldri «kort spill»/«kortspill». SG-kategoriene på norsk: Tee-slag · Innspill · Nærspill · Putting.
- **Putting-avstander ALLTID i fot (ft)** (`Putt 3–6 ft`), aldri meter.
- **SG-verdier:** alltid fortegn + komma (`+1,2` / `−0,4`); positiv = grønn, negativ = rød.
- Tall: komma-desimal, mellomrom-tusenskille, tankestrek i ranges (`19—25 mai`), 24h-tid.
- Knapp-tekster, eyebrows, personas (Øyvind Rohjan = demo-kanon) og tomtilstands-mønstre («—», aldri oppdiktede tall) står i guiden.
- Forbudte ord (elev, session, stats, goal, Error m.fl.): se guidens §11 / ordbokens B24.

## Skjerm-fasit
Hvilke skjermer som finnes + mobil/desktop-status: se de vedlagte skjerm-docene
(`plattform-skjermer-indeks`, `playerhq-agencyos-skjermer-desktop-mobil`,
`marketing-booking-forelder-auth-skjermer-desktop-mobil`). Bruk dem som sannhet for IA og dekning.

> **Konsistens-kontrakt:** Hver ny skjerm SKAL bruke tokenene, fontene og komponentene over.
> Avvik = feil. Når i tvil: matchet en eksisterende skjerm i samme flate.
