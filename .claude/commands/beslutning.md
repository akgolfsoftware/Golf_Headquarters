---
description: Registrer en beslutning fra Anders — skriver den til beslutninger.md OG inn i MASTERPLAN som nummerert arbeid, i samme økt. Bruk ALLTID når Anders har bestemt noe.
---

Anders har tatt en beslutning. Jobben din er å sørge for at den **blir til arbeid**, ikke bare
til en notis.

Bakgrunn (målt 30.08.2026): ni store beslutninger tatt 26.–30. august sto kun i
`.claude/rules/beslutninger.md`. Sju av dem fantes ikke i planen i det hele tatt. Beslutningene
døde der de ble skrevet. Denne kommandoen finnes for å lukke det hullet. **Begge stegene under
er obligatoriske — én av dem alene er en ikke-utført jobb.**

## 1. Få beslutningen presis

Beslutningen er `$ARGUMENTS`, eller — hvis det er tomt — det Anders nettopp bestemte i denne
økten.

Før du skriver noe: sjekk at du har **hva** som ble bestemt, **hvorfor** (begrunnelsen hans, med
hans egne ord der de er tydelige), og **hva det overstyrer** hvis noe. Mangler en av delene, spør
— ett kort spørsmål, ikke en liste.

Verifiser mot koden før du skriver. Sier beslutningen noe om en fil, en rute eller et tall, sjekk
at det stemmer. Aldri skriv en påstand du ikke har sett.

## 2. Skriv til `.claude/rules/beslutninger.md`

Øverst i «Beslutningene»-seksjonen (nyeste først), som en `- **TITTEL (Anders DD.MM.ÅÅÅÅ, i økt):**`-blokk.

- Store bokstaver i tittelen når beslutningen overstyrer noe eksisterende.
- Sier den noe annet enn et eldre punkt: merk det gamle `[SUPERSEDERT DD.MM.ÅÅÅÅ — se X]` i
  stedet for å slette det.
- **Kun det som gjelder nå.** Historikk og supersederte blokker hører i
  `docs/arkiv/beslutninger-historikk.md`. Fila lastes i hver eneste økt — hvert ord koster.

## 3. Skriv arbeidet inn i `docs/MASTERPLAN-GJENSTAAENDE.md` — dette steget hoppes ALDRI over

Oversett beslutningen til oppgaver noen kan utføre. Konkret:

- **Krever den bygging?** → nummererte rader i riktig STEG-tabell, eller et nytt STEG hvis den er
  stor nok (mønster: STEG 15). Hver rad: hva, hvor i koden, og hva som gjør den ferdig.
- **Haster den (sikkerhet, PII, lisens, penger)?** → STEG 0.
- **Åpner den et nytt spørsmål du ikke kan svare på?** → nummerert punkt i «Samlet beslutningskø
  til Anders» nederst.
- **Krever den ingenting?** (ren avklaring, bekrefter dagens tilstand) → skriv det eksplisitt i
  beslutningsblokken: «Krever ingen kodeendring — bekrefter dagens tilstand.» Da er det et
  bevisst valg, ikke en glipp.

Pek alltid tilbake til kilden i planen: `.claude/rules/beslutninger.md` §TITTEL.

## 4. Er noe nå utdatert?

Sjekk om beslutningen gjør noe eksisterende feil: rader i MASTERPLAN, punkter i beslutningskøen,
`CLAUDE.md`-invarianter, `.claude/rules/gotchas.md`. Rett dem i samme PR. Et dokument som sier noe
annet enn en fersk beslutning er verre enn ingen dokumentasjon.

## 5. Lagre

`node scripts/check-doc-lenker.mjs` → egen gren → commit → push → PR. Rører du kode (ikke bare
dokumenter): full `npm run verify` først.

## 6. Rapporter til Anders — kort

Fire linjer, hverdagsspråk:

1. Hva som ble registrert.
2. **Hvilke oppgaver det ble til i planen** (nummer og hvor) — eller «krever ingen bygging».
3. Hva som ble utdatert og rettet.
4. PR-lenken.

Sier du ikke hva beslutningen ble til i planen, har du ikke fullført kommandoen.
