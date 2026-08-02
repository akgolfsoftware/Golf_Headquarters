# BudgetBar

Budsjettlinjen over ukelerretet. Den er det som gjør CANON levende:
invariantene kjører på hvert slipp, og resultatet står her.

## Regelen som styrer hele komponenten
**Invariantbrudd er anbefalinger, aldri sperrer.** Bruddet vises som et kort
med hva som brytes, hvorfor, og en vei videre — inkludert «Overstyr med
begrunnelse», som alltid er tilgjengelig. En sperre er teknisk billig og
faglig feil: coachen vet ting modellen ikke vet, og et system som nekter blir
omgått utenfor systemet.

`onOverride` er derfor ikke valgfri i praksis. Utelates den, må bruddet være
informativt alene.

## Komponenten regner ikke
Invariantene bor i CANON. `BudgetBar` viser tall konsumenten har regnet — den
har ingen egen forståelse av aldersregelen eller TEK-taket, og skal ikke få
det. Et UI-bibliotek som kjenner faglige regler blir en andre sannhet.

## Farge
- Sporet er blekk. Over taket fylles det `--dn` (leire), under minimum
  `--mid` — datasemantikk, ikke alarm. Rød finnes ikke.
- Periodens vindu tegnes som to tynne markører, ikke som et farget felt: det
  er en ramme man er innenfor eller utenfor, ikke en verdi.
- Fordelingen bruker pyramideområdenes farger, de samme som `SessionCard`s
  venstrekant. To komponenter som viser samme akse skal aldri fargelegge den
  ulikt.
- Ingen oransje. «Overstyr med begrunnelse» er en pilleknapp i blekk (30 px
  synlig, 44 px sone ved grov peker), ikke skjermens viktigste handling.

## Tilgjengelighet
Begge grafiske sporene er `role="img"` med tekstlig sammendrag — «Ukevolum
6,5 t, periodens vindu 5 til 8 t, innenfor». Et fyllingsforhold formidler
ingenting til en skjermleser. Bruddkortet er `role="status"`, så det
annonseres når det dukker opp etter et slipp.

## Målt
Nøkkeltallsgriden legger om på container: 3 → 2 → 1 kolonne ved 420 og
260 px [måles i `workbench.card.html`].
