---
description: Registrer en beslutning fra Anders — skriver den til beslutninger.md med «Arbeidet dette utløser» som nummererte oppgaver, i samme økt. Bruk ALLTID når Anders har bestemt noe.
---

Anders har tatt en beslutning. Jobben din er å sørge for at den **blir til arbeid**, ikke bare
til en notis.

Bakgrunn (målt 30.08.2026): ni store beslutninger tatt 26.–30. august sto kun som regler.
Sju av dem fantes ikke som oppgaver noe sted. Beslutningene døde der de ble skrevet. Denne
kommandoen finnes for å lukke det hullet. `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i
b700ce008, så arbeidet står nå **inne i beslutningsblokken selv**, som en egen liste
«Arbeidet dette utløser». **Blokk uten den lista er en ikke-utført jobb.**

## 1. Få beslutningen presis

Beslutningen er `$ARGUMENTS`, eller — hvis det er tomt — det Anders nettopp bestemte i denne
økten.

Før du skriver noe: sjekk at du har **hva** som ble bestemt, **hvorfor** (begrunnelsen hans, med
hans egne ord der de er tydelige), og **hva det overstyrer** hvis noe. Mangler en av delene, spør
— ett kort spørsmål, ikke en liste.

Verifiser mot koden før du skriver. Sier beslutningen noe om en fil, en rute eller et tall, sjekk
at det stemmer. Aldri skriv en påstand du ikke har sett.

## 2. Skriv blokken i `.claude/rules/beslutninger.md`

Øverst, rett under innledningen (nyeste først). Formatet er det fila allerede bruker:

```markdown
## TITTEL I STORE BOKSTAVER (Anders DD.MM.ÅÅÅÅ, bindende)

Én–to setninger: hva Anders sa, og hva det svarer på.

- Regel 1, som den gjelder nå.
- Regel 2.

**Overstyrer:** §TITTEL på det gamle punktet, eller «ingenting».

**Arbeidet dette utløser:**

1. **Oppgave:** hva, hvor i koden (fil/rute), og hva som gjør den ferdig.
2. ...
```

- Store bokstaver i tittelen alltid; «bindende» når Anders har bestemt, «bestilt» når det er en
  bestilling uten produktvalg.
- Overstyrer den et eldre punkt: skriv `**Overstyrer:**` i den nye blokken, og rett eller stryk
  (`~~tekst~~` med «Overstyrt DD.MM») setningen i den gamle. Ingen to konkurrerende oppskrifter.
  Det finnes ingen egen arkivfil; historikken ligger i Git.
- **Kun det som gjelder nå.** Fila lastes i hver eneste økt — hvert ord koster.

## 3. «Arbeidet dette utløser» — dette steget hoppes ALDRI over

Oversett beslutningen til oppgaver noen kan utføre. Konkret:

- **Krever den bygging?** → nummererte punkter. Hvert punkt: hva, hvor i koden, og hva som gjør
  det ferdig («Ferdig når …», gjerne «låst med test»).
- **Haster den (sikkerhet, PII, lisens, penger)?** → merk «(haster)» og sett den først.
- **Åpner den et nytt spørsmål du ikke kan svare på?** → eget punkt som starter med «Uavklart:».
- **Krever den ingenting?** (ren avklaring, bekrefter dagens tilstand) → skriv det eksplisitt i
  blokken: «Krever ingen kodeendring — bekrefter dagens tilstand.» Da er det et bevisst valg,
  ikke en glipp.

## 4. Er noe nå utdatert?

Sjekk om beslutningen gjør noe eksisterende feil: andre blokker i beslutninger.md,
`docs/platform/BUSINESS-RULES.md`, `.claude/rules/gotchas.md`, skills under `.claude/skills/`
og `docs/design-system/design-autoritet.md`. Rett dem i samme PR. Et dokument som sier noe
annet enn en fersk beslutning er verre enn ingen dokumentasjon.

## 5. Lagre

`node scripts/check-doc-lenker.mjs` → egen gren → commit → push → PR. Rører du kode (ikke bare
dokumenter): full `npm run verify` først.

## 6. Rapporter til Anders — kort

Fire linjer, hverdagsspråk:

1. Hva som ble registrert.
2. **Hvilke oppgaver det ble til** (nummer i blokken) — eller «krever ingen bygging».
3. Hva som ble utdatert og rettet.
4. PR-lenken.

Sier du ikke hva beslutningen ble til av arbeid, har du ikke fullført kommandoen.
