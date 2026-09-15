# Claude Design — beslutning for D-03 og D-05

Besluttet 13.09.2026.

Status: produkt- og designbeslutning. Dokumentet låser betydning og omfang, men godkjenner ikke en visuell versjon for bygging.

## D-03 — Live

### «Auto» betyr «Automatikk»

Den synlige termen skal være **Automatikk**, i tråd med den treningsfaglige fasiten. Det er motorikkens tredje læringssteg etter **Uten ball** og **Lav hastighet**. Det betyr utførelse i normal eller full fart med oppgavefokus.

Det betyr ikke:

- automatisk registrering;
- AI-styring;
- automatisk tidtaking;
- automatisk pause;
- at press alltid er med. Press er en separat akse i AK-formelen.

Ved behov for forklaring i Live brukes: «Utfør i normal eller full fart med fokus på oppgaven.»

### Tidsregel

Live skal skille tydelig mellom to tider:

1. **Økttid** går mens økten er aktiv. Den fortsetter mellom øvelser og stopper bare når brukeren velger **Pause**, avslutter eller avbryter økten.
2. **Tid på øvelse** går bare mens en konkret øvelse er aktiv. Den stopper automatisk når øvelsen markeres ferdig eller ingen øvelse er aktiv, og starter når neste øvelse aktiveres.

Systemet skal aldri sette hele økten på pause uten at brukeren har valgt det. Overgangstid er dermed del av økttiden, men ikke av tiden på en bestemt øvelse. Manuell pause stanser begge tider.

Designet skal holde disse forholdene adskilt:

- planlagt, aktiv, pauset, fullført og avbrutt økt;
- aktiv og ferdig øvelse;
- lagret, lagrer, uten nett og synkroniseringsfeil.

En lagrings- eller nettstatus skal aldri se ut som om selve økten er pauset eller avsluttet.

## D-05 — Team Norway og WANG

Begge er obligatoriske, egne organisasjonsflater i AK Golf HQ. De ligger ikke under AgencyOS. De bruker felles dataobjekter, komponentbetydninger, tilgangsregler og tilgjengelighetskrav, men skal ha en gjenkjennelig organisasjonsprofil.

Gamle Team Norway- og WANG-tegninger er innholds- og mønsterreferanser. De skal ikke kopieres ukritisk som den nye visuelle fasiten.

### Team Norway — obligatorisk omfang

Den detaljerte kjernereisen er:

```text
Riktig organisasjon og gruppe
  -> oversikt og dekningsgrad
  -> velg protokoll og variant
  -> før flere spillere i kø
  -> kontroller og attester
  -> resultat
  -> historikk og neste oppfølging
```

Designpakken skal dekke følgende skjermfamilier:

1. organisasjonsskall, rolle, gruppevalg og tilgangsavslag;
2. oversikt med dekningsgrad, kommende arbeid og avvik;
3. spiller- og gruppeliste med tilgang bare til tildelte grupper;
4. protokollbibliotek med eier, versjon og låst brukt variant;
5. fellestesting: protokoll, gruppe, spillerkø, føring, retting og attestering;
6. resultater og historikk med enhet, retning, forsøk, variant, kilde og tidspunkt;
7. spilleroppfølging: mål, plan, tester, analyse og sammenligning;
8. samling, uke-/månedsplan og økt der dette følger gruppa;
9. gruppeposter, sporbar 1:1-post, dokumenter og lesekvittering; ingen fri chat;
10. trenerinvitasjon, gruppetilgang og samtykkebasert innsyn.

Uttak og vurdering skal alltid presenteres som beslutningsunderlag. Systemet konkluderer aldri. «Vurdering» brukes, aldri «karakterer».

### WANG — obligatorisk omfang

Den detaljerte kjernereisen er:

```text
WANG Hjem
  -> riktig rolle og gruppe
  -> uke og økt
  -> elevkort
  -> IUP og utviklingsplan
  -> oppfølging og rapport
```

Designpakken skal dekke følgende skjermfamilier:

1. navnefri offentlig fellesside for trening, skole, kalender og foresatte;
2. innlogging og tydelig rolleinngang for elev, foresatt og trener;
3. trenerens hjem, skole-/treningsuke og øktdetalj;
4. elev- og gruppeliste med beskyttet elevkort;
5. IUP, mål, utviklingsplan, samtale og rapport;
6. årsplan, testdag, resultater og historikk;
7. styrkeprogram, gruppeaktivitet, samling og turnering der dette er relevant;
8. poster, dokumenter, varsler og bekreftelser;
9. tom, laster, delvis data, feil, uten nett og tilgangsavslag.

Elevene er mindreårige. Navn og spillerlister skal aldri vises på den åpne siden. Privat 1:1-oppfølging skal være sporbar og følge gjeldende foresatt- og tilgangsregler. Det heter «vurdering», ikke «karakter».

### Felles leveransekrav

- Team Norway og WANG skal finnes i samme komplette kandidat som PlayerHQ og AgencyOS.
- Hver kjernereise skal bruke konsistente syntetiske data fra start til slutt.
- Kjernereisene skal bevises ved 320, 390, 834, 1180 og 1440 px, samt 200 prosent tekst.
- Alle skjermfamilier skal være koblet til rute eller mønster. Det er ikke nødvendig med et unikt detaljdesign for hver like rute.
- Tom, lasting, delvis data, feil, uten nett og tilgangsavslag skal inngå der tilstanden kan oppstå.
- Tall skal vise kilde, enhet, måleretning, tidspunkt og datamangler. Ukjent er ukjent, aldri null eller oppdiktet.
- Designpakken skal ikke opprette nye roller, rettigheter, datamodeller eller juridiske løfter som ikke finnes i godkjente produktkilder.

## Kilder kontrollert

- `docs/ordbok-master-trening.md`
- `docs/skjermtekst/ak-golf-hq-sprak-og-ordbok.md`
- `src/components/portal/live/use-live-session.ts`
- `src/components/portal/live/DrillLogger.tsx`
- `docs/planer/claude-design-til-grok-portering-2026-09-12.md`
- `docs/design-audit/team-norway-d2-tn-teknisk-reise-2026-09-12.md`
- `docs/design-audit/wang-d2-wang-teknisk-reise-2026-09-12.md`
- `designsystem/team-norway/readme.md`
- `designsystem/wang/readme.md`
