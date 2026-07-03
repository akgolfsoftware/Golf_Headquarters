# AK Golf — Claude Design-prosjekt (les meg)

Dette prosjektet designer **AK Golf-plattformen** — en premium sport-analytics-plattform for golf,
med seks flater: PlayerHQ (spiller), AgencyOS (coach), akgolf.no/Marketing+stats (offentlig),
Forelder, Auth og Booking.

## START HER — for konsistente skjermer hver chat
**Les `CLAUDE.md` først, hver eneste nye chat.** Den er den låste design-grunnloven: eksakte
fargetokens (lyst + mørkt), fonter, ikoner, 8pt-grid, lime-disiplin, komponentbibliotek, per-flate
designspråk og låste beslutninger. Uten den driver skjermene fra hverandre mellom chatter — MED den
blir alt konsistent.

## Filene i prosjektet
| Fil | Hva | Når |
|---|---|---|
| **`CLAUDE.md`** | Design-grunnloven — tokens, fonter, komponenter, regler. | **Les ALLTID først.** |
| `plattform-skjermer-indeks` | Hele plattformen på ett blikk — totaltall + de tre største gapene. | Oversikt. |
| `playerhq-agencyos-skjermer-desktop-mobil` | Hver PlayerHQ- + AgencyOS-skjerm m/ mobil/desktop-status. | Fasit for IA/dekning. |
| `marketing-booking-forelder-auth-skjermer-desktop-mobil` | Resten av flatene, samme format. | Fasit for IA/dekning. |
| **`ordbok-design-guide`** | Terminologi-fasit for visning: enheter (putting i **ft**), tallformat (+1,2 med komma), SG-farger, chips/badges, knappe-tekster, eyebrows, personas, tomtilstander. | **Les før du skriver én UI-tekst eller ett tall.** |
| `akgolf-stats-claude-design-prompt` (valgfri) | Egen prompt for stats-funnelen. | Når du tar stats-flaten. |

## Slik jobber du
1. Les `CLAUDE.md` (tokens + regler).
2. Slå opp skjermen(e) i skjerm-docene (finnes den? mobil/desktop-status?).
3. All tekst, tall og enheter: følg `ordbok-design-guide` (aldri «kort spill» — alltid «nærspill»; putting i ft; SG med fortegn og komma).
4. Tegn med de eksakte tokenene + gjenbruk komponentene. Mobil + desktop (iPad der naturlig).
5. Match stilen til en eksisterende skjerm i samme flate når du er i tvil.

## De tre største gapene å ferdigstille (prioritert)
1. **AgencyOS mobil** — coach-flaten finnes nesten bare på desktop. Trenger egen mobil-IA.
2. **PlayerHQ-undersider** — mål-hub/bygger, teknisk plan, SG-Hub-subs, coach-seksjon, talent, booking-subs.
3. **akgolf.no/stats** — verdens beste stats-funnel (benchmark-scrubber + data-viz, drevet av DataGolf-data).

> Estetikk: editorial sport-analytics — skog-grønn dybde + ett lime-blikkanker, store mono-tall,
> rikelig tomrom, interaktiv datafortelling. Aldri kjedelige golf-tabeller.
