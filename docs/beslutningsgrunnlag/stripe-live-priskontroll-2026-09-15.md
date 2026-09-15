# Stripe live-priskontroll — beslutningskø punkt 28, 15.09.2026

Målt 15.09.2026 mot **live**-kontoen `acct_1Jw44KEtDgDniDw9` (AK Golf Group AS) gjennom
Stripe-koblingen, med Anders' uttrykkelige godkjenning for produksjonslesing. **Kun lesing.
Ingen pris opprettet, endret eller arkivert. Ingen belastning.**

## Spørsmålet

Beslutningen 08.09.2026 (`.claude/rules/beslutninger.md` §DESIGNPORT FASE 2, punkt 1) lot
punkt 28 stå åpent: de fire prisene var bare opprettet i TEST-modus 16.08.2026, og punktet
«Opprett de fire prisene i live-modus» i [cutover-sjekklisten](../platform/stripe-cutover-sjekkliste.md)
var uavkrysset. Anders skulle sjekke dashbordet selv. Denne kontrollen gjør den sjekken.

## Svaret: to av fire finnes

| Pris | Forventet | Live-status | Price-ID |
|---|---|---|---|
| Performance | 1 200 kr/mnd | **Finnes** (opprettet 12.05.2026) | `price_1TWCzbEtDgDniDw9NWMazgLn` |
| Performance Pro | 2 220 kr/mnd | **Finnes** (opprettet 12.05.2026) | `price_1TWCzjEtDgDniDw9B73enQ5q` |
| PlayerHQ månedlig | 299 kr/mnd | **Finnes IKKE** | — |
| PlayerHQ årlig | 2 690 kr/år | **Finnes IKKE** | — |

De to Performance-prisene er entydige: de bærer nickname «Performance — 1200 NOK/mnd» og
«Performance Pro — 2220 NOK/mnd», er `recurring` månedlig i NOK, og beløpene stemmer
eksakt (120 000 og 222 000 øre).

**Ingen aktiv live-pris har beløp 29 900 øre (299 kr).** Det finnes priser på 24 900, 19 900,
14 900, 9 900, 39 900 og 49 900 øre fra det gamle modul-/bundle-oppsettet, men ingen på 299 kr.

**Det finnes nøyaktig én aktiv årspris i live**, og den er ikke PlayerHQ:
`price_1TQm6wEtDgDniDw9PJn1HScz`, 12 800 kr/år, opprettet 27.04.2026.

## Hva som gjenstår, og hvem som eier det

Beslutningen 08.09 sier hva som skjer i akkurat dette tilfellet: «finnes den ikke, oppretter
han den (speil test-oppsettet) og gir Claude IDen.»

**Anders må opprette to priser i live-modus**, som speil av test-oppsettet fra 16.08:

1. PlayerHQ månedlig — 299 kr/mnd, NOK, `recurring` month
2. PlayerHQ årlig — 2 690 kr/år, NOK, `recurring` year

Når ID-ene foreligger, settes `STRIPE_PRICE_ID_PRO` og `STRIPE_PRICE_ID_PRO_AAR` i Vercel
production. Det er ikke gjort her — miljøendring i produksjon krever egen autorisasjon.

Prisene skal opprettes av Anders, ikke av en agent: dette er produksjonskatalogen for det
kundene faktisk belastes, og beslutningen legger handlingen eksplisitt hos ham.

## Begrensninger

- Kontrollen listet **kun aktive** priser (`active: true`). En arkivert 299- eller
  2 690-pris ville ikke dukket opp — men en arkivert pris kan uansett ikke brukes til nye
  abonnementer, så handlingen er den samme.
- Kontrollen gjelder **live**. Test-modus er ikke lest: Stripe-koblingen i denne økta
  eksponerer bare én kontekst, og den er `livemode: true`.
- Ingenting her er et kjøp, en testbetaling eller en verifisering av betalingskjeden.
  KODE-B er fortsatt blokkert på testnøkler i miljøet — se
  [kartleggingen](../design-audit/kode-b-stripe-testreise-kartlegging-2026-09-14.md).

## Ikke påstått

- At punkt 28 er ferdig. Spørsmålet er besvart; handlingen gjenstår hos Anders.
- At de to Performance-prisene er verifisert mot et ekte kjøp. De er lest fra katalogen.
- At noe er endret i Stripe.
