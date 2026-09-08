# TILGANGSMATRISE — hvem ser hva, per skjerm

**Dette er pakkens viktigste dokument.** Elevene er mindreårige. Fellessiden er navnefri med
vilje. Les dette **før** du skriver UI, ikke etter.

## Reglene som gjelder hele flaten

1. **Rollen bor på gruppen** — `GroupMember.role`. **Aldri** som `UserRole.COACH` på brukeren.
   Rollen er derfor implisitt skolebundet gjennom `Gruppe.skoleId`.
2. **En trener ved én WANG-skole skal aldri se en annen skoles elever.** Ikke navn, ikke tall,
   ikke at eleven finnes. Dette er ikke et filter i UI-et — det er en serversjekk.
3. **Post til én elev er synlig for foresatt.** Lesetilgangen utledes av elevens fødselsdato og
   faller bort ved 18. Det er ingen bryter noen kan slå på igjen.
4. **Fellessiden er navnefri.** Uten innlogging vises snitt og antall for gruppa, aldri
   enkeltresultater og aldri navn.
5. **Rekrutteringsvurderingen av en navngitt kandidat er det mest følsomme i hele flaten.**
   Se egen seksjon nederst.
6. Tilgangssjekken skjer på serveren. En klientsjekk er ingen sjekk.
7. Fant sjekken ingenting brukeren har rett på, er svaret **403 «Denne siden er lukket»** med
   hvem som kan gi tilgang — aldri en tom side og aldri en ny innloggingsprompt.

Roller: `Åpen` (uten innlogging) · `Elev` · `Foresatt` · `Trener` (rolle på gruppe ved én skole) ·
`Sportssjef` (ved én skole) · `Admin` (ved én skole) · `Kontaktlærer`.

---

## Matrisen

| ID | Skjerm | Hvem ser den | Hva de ser | Hva som er skjult |
|---|---|---|---|---|
| A1 | Skall | Alle, også åpen | Topplinje, faner, bunnmeny | Faner som krever rolle vises ikke i det hele tatt |
| A2 | Fellesside · hjem | Alle, også åpen | Årshjul, faser, gruppetall | Alle navn. Alle enkeltresultater. |
| A3 | Årsplan | Alle, også åpen | Perioder, mål per trinn, øktmal | Elevens egne fokusområder — kun innlogget elev og trener |
| A4 | Periode | Alle, også åpen | Fasepanel, mål, innhold | Ingenting elevspesifikt |
| A6 | Uke | Alle, også åpen | Dagrader, øktrader | Hvem som deltar på hvilken økt |
| B1 | Testdag-føring | Trener ved gruppens skole | Alle elever i gruppa, alle tall, protokollversjon | Ingen elev eller foresatt ser føringsskjermen. Andre skolers grupper. |
| B2 | Protokoller | Trener, Sportssjef | Protokoller, versjoner, øvelser, eier | Ingen elevtall. Protokollen er en kontrakt, ikke data. |
| B3 | Resultater per elev | Elev (**kun egne**), Foresatt (eget barn), Trener ved elevens skole | Alle målte tall med kildelinje og protokollversjon | Andre elevers tall. Estimat er merket som estimat, ikke skjult. |
| B4 | Ukessammendrag | Trener (skriver), Foresatt (leser) | Publisert tekst, vedlegg | Kladden — **ingen foresatt ser en upublisert kladd**. Elevnavn i teksten skal ikke forekomme. |
| B5 | Dokumenter | Elev, Foresatt, Trener — **etter rekkevidde per dokument** | Dokumenter delt med din rolle i din gruppe | Dokumenter merket «kun foresatte» vises ikke for elev, og omvendt |
| B6 | Statistikk-skinn | Elev (egne runder), Trener | Golfstatistikk i WANG-skinn | Ingenting nytt — skjermen er Train-lock med andre tokens |
| B7 | Turneringer | Alle, også åpen | Turneringsliste, snitt og antall for gruppa | **Enkeltresultater.** De ligger på elev-arket, kun innlogget. |
| B8 | Elev-ark | Trener ved elevens skole, Sportssjef ved samme skole | Fokusområder, siste tall med kilde, oppmøte, IUP-lenke | **Alt** uten innlogging — heller ikke at eleven finnes. Andre skolers elever. |
| B9 | Samlinger | Elev, Foresatt, Trener | Samlinger i skoleåret, sted, uke | Uttaket til andre elever før publisering |
| C1 | Elevliste | Trener, Sportssjef — **kun egen skole** | Nummererte elever, klasse, gruppe, siste test | Elever ved andre WANG-skoler. Navn er nummerert i alle tegninger. |
| C2 | Samling med uttak | Elev (**egen status og egen grunn**), Trener | Kriterium, program, hvem som er tatt ut | **Andre elevers grunn til å ikke bli tatt ut.** Kladd er usynlig for alle elever. |
| C3 | Økt-detalj | Elev, Foresatt, Trener | Hensikt, innhold, trener, utstyr | Elevens eget fokus vises kun for eleven selv, foresatt og trener |
| C4 | Turnering-detalj | Alle (navnefri), innlogget ser mer | Åpen: turnering, dato, bane. Innlogget: WANG-elevenes runder. | Enkeltresultater uten innlogging. Plassering fargelegges aldri. |
| C5 | IUP med kildelinje | Elev (egen), Foresatt (eget barn), Trener ved elevens skole | Testresultater med kilde, vurderingstekst | Andre elevers samtaler. Ordet er «vurdering», aldri «karakter». |
| C6 | Trenerflate | Trener med rolle på minst én gruppe ved skolen | Dagens økter, det som krever handling, egne elever | Andre skolers elever og oppgaver. Uten rolle: 403, ikke en tom flate. |
| C7 | Logg inn | Åpen | Skjema + rollekart | Feilmeldingen sier ikke om e-postadressen finnes |
| C8 | Systemtilstander | Alle | Laster, feil, uten nett, 403 | 403-siden avslører ikke hva som ligger bak |
| C9 | Skole-fanen | Elev (egen klasse), Foresatt (eget barn) | Timeplan, prøver, kollisjoner, kompetansemål | Andre klassers timeplan. Kollisjonen vises, men avklares ikke av flaten. |
| D1 | Rekruttering | **Sportssjef ved egen skole. Ingen andre.** | Kandidatliste, vurderingstall, notat, skolekarakterer | Se egen seksjon nederst |
| D2 | Plasser | Sportssjef, Admin | Egen skoles plasser i detalj; andre skolers **totaltall** | Hvilke kandidater andre skoler har på venteliste |
| D3 | Koordinering | Sportssjef ved skoler som har flagget kandidaten | Status, tidsstempel og ansvarlig for alle involverte skoler | **Andre skolers vurderingstall og notater.** Kandidat og foresatt ser aldri tråden. |
| D4 | Timeplan-føring | Admin, Kontaktlærer ved egen skole | Ukemal, unntak, konflikter | Andre skolers timeplaner. Elever ser resultatet i C9, ikke editoren. |
| D5 | Prøveplan | Trener, Kontaktlærer, Elev (egen klasse) | Prøver mot treningsvolum | Andre klassers prøver |
| D6 | Foreldremøte | Foresatt (invitasjon og eget svar), Kontaktlærer og Sportssjef (alt) | Foresatt: møtet, agenda, dokumenter, referat. Skolen: svar og oppmøte per hjem. | **Foresatt ser aldri andre hjems svar eller oppmøte.** |
| D7 | Gruppeposter | Elev og Foresatt i gruppa (leser), Trener (skriver) | Poster, vedlegg | **Lesekvitteringen** — kun trener. Ingen elev ser hvem som ikke har lest. |
| D8 | Post til én elev | Elev (egen tråd), Foresatt (leser barnets tråd), Trener ved elevens skole | Tråd, meldinger, tidsstempel | **Post krysser ikke skoler.** Foresatt ser barnets tråd, men skriver i sin egen. Meldinger kan ikke slettes. |
| D9 | Periodeplan | Trener | Perioder, mål, planlagt volum | Elever og foresatte ser ikke planleggingsnivået |
| D10 | Månedsplan | Trener | Ukene, avvik mot periodeplan, begrunnelse | Avviket vises **kun for treneren selv** — ingen sportssjef skal godkjenne |
| D11 | Trenere og roller | Sportssjef, Admin | Hver rolle ved hver skole, inkludert hva personen **ikke** når | Roller ved skoler du selv ikke har rolle ved |
| D12 | Inviter elev | Trener med gruppeansvar, Sportssjef | Sendte invitasjoner, status, engangsnøkkelens tilstand | Nøkkelen selv. Invitasjoner sendt av andre skoler. |

---

## Rekrutteringsvurderingen — det mest følsomme i flaten

D1 inneholder en **navngitt mindreårig kandidat** med vurderingstall, fritekstnotat fra en trener,
og skolens egne karakterer fra vitnemålet. Ingenting annet i `/team-wang` er i nærheten.

### Hvem ser den

| Rolle | Ser |
|---|---|
| **Sportssjef ved den skolen som eier vurderingen** | Alt: kandidatens navn, alle vurderingstall, notatet, skolekarakterene, statushistorikken |
| **Ansvarlig trener for kandidaten, ved samme skole** | Samme som sportssjef, for kandidatene hen er ansvarlig for |

### Hvem ser den ikke — eksplisitt

| Rolle | Ser ikke |
|---|---|
| **Sportssjef ved en annen WANG-skole** | Vurderingstall, notat og skolekarakterer. Ser **kun** at kandidaten er flagget, med status, tidsstempel og ansvarlig — det er hele D3. |
| **Trener uten ansvar for kandidaten** | Alt, også ved egen skole |
| **Admin** | Vurderingen. Admin styrer registre og roller, ikke rekruttering. |
| **Kandidaten selv** | Vurderingstallene, notatet, rangeringen, og at koordineringstråden finnes |
| **Kandidatens foresatte** | Samme som kandidaten. De ser skolens henvendelse, ikke underlaget bak den. |
| **Elever ved skolen** | Alt |
| **Åpen / uten innlogging** | Alt. Ruten finnes ikke uten rolle. |
| **Team Norway og forbund** | Alt. De har ingen tilgang i denne flaten i det hele tatt. |

### Konsekvenser for porten

- `/team-wang/rekruttering` skal 403-e på alt annet enn sportssjef eller ansvarlig trener **ved
  den skolen ruten spør om**. `?skole=` er ikke en filterparameter — den er en del av sjekken.
- Totalpoengsummen er **underlag**. Den sorterer lista. Skjermen viser aldri et opptaksvedtak.
- Notatfeltet er fritekst om en mindreårig. Det skal ikke logges, speiles eller sendes videre.
- Koordineringstråden (D3) er intern mellom skolene og skal aldri kunne nås av kandidat, foresatt
  eller elev — heller ikke via lenke.
- **Personvern må avklares før D3 bygges:** hvor mye én skole får se om en annen skoles kontakt med
  en mindreårig kandidat. Tegningen viser status, tidsstempel og ansvarlig. Om det er for mye er
  ikke et designspørsmål.

---

## Aldri, uansett rolle

- Ekte elevnavn i tegninger, fixtures eller testdata. «Elev 04», «Kandidat B».
- Enkeltresultater på fellessiden.
- Elevtall om en annen skoles elev.
- En vurdering av en elev formulert som karakter — ordet er «vurdering», unntatt i D1 der skolens
  egne karakterer faktisk inngår.
- Et tall i UI-et som ikke finnes i datamodellen. Da er svaret tomtilstand med hel setning.
