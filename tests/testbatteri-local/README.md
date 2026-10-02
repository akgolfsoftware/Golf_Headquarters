# Testbatteri mot isolert PostgreSQL

`lagring.test.ts` kjører den faktiske spillerhandlingen og Prisma-transaksjonene mot eget skjema. Bare innlogget identitet, cache og etterarbeid for talentprofil er erstattet. Dette er databasebevis, ikke en prøve av innlogging, RLS, bilder eller nettleser.

Kjøringen krever `DATABASE_URL` til `127.0.0.1:56022/testbatteri_20261002` og identitetsraden `public._testbatteri_identity.name = 'ak-hq-testbatteri-20261002'`. Testen stopper før skriving hvis disse ikke stemmer. Bruk kun den separate lokale containeren `ak-hq-testbatteri-20261002-db`, aldri et hostet miljø.

Skjemaet er generert fra prosjektets Prisma-skjema med `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`, og SQL er kjørt direkte mot denne tomme databasen. pgvector er aktivert lokalt. Ingen migrasjon eller tilgangsendring er kjørt i produksjon.

Den lokale miljøfilen `tmp/testbatteri-db/runtime.env` er ignorert og inneholder bare egne testlegitimasjoner. Fra arbeidsgrenens rot:

```sh
node --env-file=tmp/testbatteri-db/runtime.env --import tsx --conditions=react-server --experimental-test-module-mocks --test tests/testbatteri-local/lagring.test.ts
```

Hver kjøring oppretter nye syntetiske spillere med `example.invalid`-adresser. Data beholdes i denne testdatabasen for gjenlesing. 34 fullførbare varianter prøves fra utkast til resultat, sammen med avvist annen spiller, gjentatt innsending, feltenes rekkefølge i JSONB, flyttallspresisjon og samtidige rettelser. Formelverdiene prøves separat mot det uavhengige kildefasitsettet i `src/lib/portal-tester/tn-kildefasit.test.ts`.
