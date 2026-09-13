# PlanAction i `PROCESSING` — trygg avstemming

Dato: 13.09.2026

Status: kontrollnotat, ingen produksjonskjøring

Gjelder: `PlanAction` som ble låst av `acceptAndApplyPlanAction`, men ikke fikk
status `ACCEPTED` eller `REJECTED`

## Konklusjon

En handling i `PROCESSING` skal aldri settes automatisk tilbake til `PENDING`.
Eksisterende data kan hjelpe en autorisert operatør å undersøke hva som skjedde,
men kan i de fleste skriveflytene ikke bevise sikkert om handlingen ble utført.
Å prøve på nytt uten avstemming kan derfor opprette doble økter eller meldinger.

Det finnes ingen ferdig gjenopprettingshandling i dagens kode. En låst rad er en
fail-safe sperre, ikke en fullført brukerreise.

## Kilder som finnes i dag

### `PlanAction`

Raden har `id`, `userId`, `coachId`, `planId`, `actionType`, `suggestion`,
`status`, `createdAt` og `updatedAt`. Ved et normalt vedtak får den også blant
annet `decidedAt`, `decidedById`, `sjekkpunkt` og `fangstId`.

Begrensninger:

- `updatedAt` viser når raden sist ble skrevet, men er ikke et eget tidspunkt
  for «domeneendring fullført».
- Statusfeltet er fritekst. Kommentaren i datamodellen nevner foreløpig ikke
  den nye mellomstatusen `PROCESSING`.
- Raden har ingen utførings-ID som følger sideeffekten videre til andre tabeller.

### `AgentRun`

PlanAction-spor bruker agentnavnet `plan-action-executor`. JSON-feltet `output`
inneholder `actionId`, `actionType` og `utfall`.

Begrensninger:

- Et feilspor skriver alltid `applied: false`, også når utfallet i praksis er
  ukjent. Feltet kan derfor ikke brukes som bevis på at ingenting ble lagret.
- Sporloggen skrives utenfor selve domeneendringen og kan også feile.
- Et manglende spor betyr ikke at handlingen ikke ble utført.

### Domenerader

Planøkter, V2-speil, coachmeldinger, målverdier og varsler har egne ID-er og
tidsstempler. Ingen av dem lagrer `PlanAction.id`. Lik tittel, dato eller tekst
er derfor bare et indisium, ikke en unik kobling.

## Hvor ukjent utfall kan oppstå

| Handling | Varig trinn før et senere kall kan feile | Hva dagens data kan vise |
|---|---|---|
| `CHURN_MESSAGE` | `CoachingSession` opprettes før `Notification` | Meldingen og eventuelt varselet kan finnes, men ingen av radene har `actionId`. |
| Planendringer | Planøkter endres i en transaksjon før V2-speil og varsel | Økten og V2-speilet kan sammenlignes mot forslaget, men opphav kan ikke bevises entydig. |
| `SESSION_ADD` / `WEEKLY_PROPOSAL` | Én eller flere nye økter kan være committed | Tittel, dato, varighet og `rationale` gir sterke indisier, ikke unik korrelasjon. |
| Fjerning/endring av økt | Opprinnelig rad kan være slettet eller overskrevet | Fravær eller nåverdi beviser ikke hvilken handling som gjorde endringen. |
| `TM_BASELINE_PROPOSE` | Baseline oppdateres i ett atomisk databasekall | `goalId`, verdi, kilde og dato kan sammenlignes, men raden har ikke `actionId`. |
| `SOCIAL_POST` / `PAYMENT_FOLLOWUP` | Ingen automatisk publisering eller domeneendring i executor | Kan avstemmes som «ingen sideeffekt», men manglende status må fortsatt håndteres uten å kjøre executor på nytt. |
| `FANGST_SJEKKPUNKT` | Executor gjør ingen egen domeneendring | Sjekkpunktet skrives først ved ACCEPTED-lagringen; en `PROCESSING`-rad kan ikke antas ferdig. |

## Sikker operatørrutine

Rutinen er lesende frem til en egen, eksplisitt godkjent gjenoppretting finnes.

1. Stans retry. Ikke godkjenn, avvis eller nullstill raden mens utfallet
   undersøkes.
2. Bekreft tilgang. Kun ADMIN eller ansvarlig coach med gjeldende tilgang til
   spilleren kan se grunnlaget. Bruk interne ID-er i notater, ikke navn eller
   andre personopplysninger.
3. Les PlanAction-raden og noter `id`, `actionType`, `planId`, `suggestion`,
   `createdAt` og `updatedAt`.
4. Les alle `AgentRun`-spor der `output.actionId` er lik handlingens ID. Et
   feilspor viser bare at et kall feilet; det avgjør ikke om effekten skjedde.
5. Sammenlign de relevante domeneradene med tabellen over. Kontroller både
   primærendringen og sekundære spor som V2-speil og varsel.
6. Klassifiser resultatet som én av tre verdier:
   - **Utført og entydig bekreftet:** sideeffekten kan knyttes sikkert til
     handlingen gjennom mer enn lik tekst eller tid.
   - **Ikke utført og entydig bekreftet:** handlingstypen har ingen
     sideeffekt, eller en dokumentert feil skjedde før første mulige skriving.
   - **Ukjent:** alt annet. Dette er normal konklusjon når `actionId` mangler
     på domeneraden.
7. Ved **ukjent**: behold `PROCESSING`. Avklar eller reparer domenet manuelt før
   status endres. Ikke bruk executor som diagnoseverktøy.
8. Ved et senere autorisert statusvedtak: logg hvem som avstemte, begrunnelse,
   kildene som ble kontrollert og tidspunkt. Ikke kopier fritekst med
   personopplysninger inn i tekniske logger.

## Hva som mangler for trygg gjenoppretting

Dagens modell mangler et atomisk, uforanderlig bevis som kobler én utføring til
alle sideeffektene. Derfor finnes ingen generell trygg regel for «markér utført»
eller «åpne for retry».

Minste anbefalte oppfølging er en egen ADMIN-begrenset avstemmingsfunksjon som:

- aldri kaller executor;
- krever fersk tilgangskontroll og en begrunnelse;
- tilbyr separate valg for «bekreft utført» og «bekreft ingen effekt»;
- skriver et uforanderlig revisjonsspor med `actionId`;
- bare åpner for retry etter dokumentert bevis på at ingen skriving skjedde.

For maskinelt sikker avstemming trengs senere en unik utførings-ID eller
idempotensnøkkel på domeneradene, samt faser som skiller «før commit»,
«domene committed», «speil/varsel mangler» og «fullført». Det krever en egen
godkjent data- og migrasjonsendring og inngår ikke i dette kontrollnotatet.

## Kontrollerte kodekilder

- `src/lib/agents/accept-plan-action.ts`
- `src/lib/agents/plan-action-executor.ts`
- `src/lib/agents/plan-action-spor.ts`
- `src/lib/workbench/v2-sync.ts`
- `prisma/schema.prisma` (`PlanAction`, `AgentRun`, `TrainingPlanSession`,
  `CoachingSession` og `Notification`)
