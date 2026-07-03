# Interaksjonsstandarder — AK Golf HQ

Standarder for de fire interaksjonsklassene plattformen bruker. Alle gjelder begge moduser (light/dark) og både mus og touch.

## 1. Hover/trykk-stats (previews på datakomponenter)

Enhver komponent som viser aggregert data (KPI-kort, testresultat, kølle-rad, kalenderøkt) skal avsløre detaljer ved hover/trykk:

- **Mus:** popover etter 150–200 ms hover-delay (aldri instant — flimmer), posisjonert uten å dekke kilden, forsvinner ved mouse-leave med 100 ms grace.
- **Touch:** første trykk åpner popover, trykk utenfor lukker. Aldri hover-only-informasjon — alt hover viser må være nåbart på touch.
- **Innhold:** maks 5 datapunkter + én mikro-visualisering (sparkline, mini-plott, dot-grid). Alltid enheter. Lenke "Se full analyse" nederst hvis dypere visning finnes.
- **Ytelse:** popover-innhold rendres fra allerede lastet data — aldri spinner i en hover-popover.

## 2. Drag-and-drop

Brukes i: treningsplanlegger (økter til kalender), testbatteri-bygger, kanban-tavler.

- Draggable elementer har grip-affordance (Lucide grip-vertical) synlig ved hover, alltid synlig på touch.
- **Under drag:** original får 40 % opacity, cursor-følger er en lettvekts-ghost av kortet, gyldige dropsoner får synlig tilstand (surface-2 + accent-kantlinje 2 px), ugyldige soner dempes.
- **Drop-indikator:** horisontal linje (2 px accent) mellom elementer i lister; hel-flate-highlight i kalenderceller.
- Slipp utenfor gyldig sone = animert retur til origo (150–200 ms ease-out). Ingen stille feiling.
- Tastatur-alternativ kreves: space plukker opp, piler flytter, space slipper.

## 3. Kalender og tidslinje

- **Kalender (booking + treningsplan):** ukesvisning default for coach, månedsvisning for oversikt. Økter som kort med pyramide-fargeindikator (FYS/TEK/SLAG/SPILL/TURN) som venstre-stripe. Dnd for flytting, resize for varighet. I dag-markering diskret, ikke skrikende.
- **Tidslinje (periodisering/progresjon):** horisontal, GRUNN/SPESIALISERING/TURNERING som fasebånd, tester og turneringer som milepæl-punkter. Zoom uke ↔ sesong. Hover på milepæl = stats-popover (regel 1).
- Levende preview: endringer i planlegger reflekteres umiddelbart i tidslinje/kalender uten lagre-steg — optimistisk UI med diskret lagret-bekreftelse.

## 4. Levende previews

Der brukeren konfigurerer noe (testbatteri, øktmal, rapport): split-visning med konfigurasjon venstre, levende preview høyre. Preview bruker ekte komponenter, ikke forenklet mock. Oppdatering < 100 ms opplevd (optimistisk render).

## Felles

- All motion: 150–250 ms, ease-out, respekterer prefers-reduced-motion.
- Fokusring synlig på alle interaktive elementer (accent, 2 px offset).
- Ingen interaksjon uten alle tilstander: hover, active, focus, disabled, loading, error.
