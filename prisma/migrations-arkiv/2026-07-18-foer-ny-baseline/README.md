# Migrasjons-konvensjoner

Denne mappen inneholder alle Prisma-migrasjoner for akgolf-hq.

## Navne-konvensjon

Alle nye migrasjoner SKAL følge formatet:

```
<YYYYMMDD><HHMMSS>_<kort_beskrivelse>
```

- `YYYYMMDD` — datoen migrasjonen ble laget (lokal tid)
- `HHMMSS` — sekvens-suffiks (Prisma setter typisk dette automatisk)
- `kort_beskrivelse` — snake_case, maks ca. 40 tegn, beskriver hva
  migrasjonen gjør

Eksempler på god navngivning:

```
20260514000040_notifications
20260514000050_session_videos
20260514000060_m14_m18_bonus
```

## Hvorfor

Konvensjonen gjør det enklere å:

- Sortere migrasjoner i kronologisk rekkefølge
- Slå opp en migrasjon på beskrivelse uten å lese SQL-en
- Skille mellom kort-suffiks-kataloger (f.eks. `20260512_booking_fields`)
  og full-tidsstempel-kataloger

## Historiske unntak

Noen eldre migrasjoner avviker fra full-format-konvensjonen:

```
0_baseline
20260512_booking_fields
20260512_service_type_slug
```

Disse skal **ikke** omdøpes. Prisma sin migrate-state lagrer mapenavnet
i databasen (`_prisma_migrations.migration_name`), og navne-endringer
vil gjøre at migrate tror migrasjonen er ny og forsøke å kjøre den på
nytt mot eksisterende skjema.

Nye migrasjoner skal følge konvensjonen — historikken får stå som den
er.

## Skrive en ny migrasjon

```bash
npx prisma migrate dev --name <kort_beskrivelse>
```

Prisma genererer mappenavnet automatisk med riktig tidsstempel-prefix.
