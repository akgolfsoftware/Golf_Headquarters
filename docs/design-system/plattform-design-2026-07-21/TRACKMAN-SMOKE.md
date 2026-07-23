# TrackMan smoke-sjekkliste (manuell)

## Automatisk (E.06 delvis)

```bash
npx tsx --conditions=react-server --test \
  src/lib/trackman/canonical.test.ts \
  src/lib/trackman/stabilitet-fallback.test.ts
```

Forvent: alle grønne. Stabilitet-fallback dekker DB-slag når rawJson er tom.

## Manuell

1. Ha **aktiv** teknisk plan med fullsving-oppgave + kølle + TM-mål.  
2. Gå til TrackMan → **Importer TrackMan**.  
3. Last opp **CSV** → velg slag → bekreft.  
4. Forvent: toast med antall slag · matchet · TM-mål oppdatert.  
5. Åpne teknisk plan → full sving-flate viser **nå**-verdier.  
6. Last opp **HTML** multi-group → samme.  
7. Importer samme fil på nytt → advarsel «lignende økt» → **Importer likevel**.  
8. Velg manuell oppgave i import-steg 2 → match går dit.  
9. Kjør whitelist-test (CHS/smash) → coach ser **TrackMan-baseline fra test** i Godkjenninger → Godkjenn.  
10. Åpne økt-detalj → dispersjon + stabilitet vises også når CSV-raw er tynn (DB-slag).
