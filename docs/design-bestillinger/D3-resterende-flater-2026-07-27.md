# D3 — Open Design-bestilling: Alle resterende flater

> Skrevet 2026-07-27. Søsterbestilling til **D2** (Workbench, planlegging, diagnose, økt-skjermer).
> D2 dekker treningsplanleggingen — D3 dekker **alt det andre**: analyse, coachens daglige flater,
> AI-laget, booking, forelder, grupper, onboarding og marketing.
>
> Lim hele blokken mellom «PROMPT START» og «PROMPT SLUTT» inn i Open Design.
> **Kjør D2 først** — vokabularet og designretningen derfra gjelder her også.
>
> Erstatter de utgåtte bestillingene D1, D4 og D6 (skrevet 6.–7. juli mot det gamle
> v13-designsystemet, som ble avviklet 25. juli).

---

## PROMPT START

Dette er del to av designoppdraget for **AK Golf HQ**. Del én (D2) dekket treningsplanleggingen:
Workbench, årsplan, periodisering, kalender, teknisk plan, årsaksdiagnosen og økt-skjermene.

**Alt vokabular, alle regler og all designretning fra D2 gjelder uendret her.** Kort repetisjon:
norsk bokmål · Lucide-ikoner · aldri emoji · AK-formelens seks akser (Pyramide, Læringstrinn, CS,
Arena, Belastning, P-posisjoner) · SG-kategoriene **Tee Total · Innspill · Nærspill · Putting** ·
varighet alltid i timer og minutter · vis alltid hvor sikre tallene er, aldri oppdiktede tall.

Denne bestillingen dekker de resterende flatene. To produkter deler samme fundament:
**PlayerHQ** (spilleren, `/portal`) og **AgencyOS** (coachen, `/admin`), pluss foreldreportal,
gruppeflater og de offentlige sidene.

---

### DEL 1 — PLAYERHQ: SPILLERENS EGNE FLATER

**A. Hjem — spillerens forside**

Det første spilleren ser. Skal svare på ett spørsmål: **hva gjør jeg i dag?**
- **Dagens økt** som det dominerende elementet — med én tydelig vei inn (Start økt)
- Ukestripe: hva er gjort, hva gjenstår, hvor jeg ligger an
- Neste turnering med formål-merket (Trening/Utvikling/Prestasjon) og nedtelling
- Én ting fra coachen om den finnes (melding, godkjent plan, tilbakemelding)
- Ett innsiktskort fra diagnosen: «Dette jobber vi med nå, og hvorfor»
- Tom tilstand: ingen plan ennå → én vei videre, ikke en tom kalender

**B. Analyse — spillerens statistikk**

Alt om hvordan spilleren faktisk presterer. Én flate med faner, ikke spredte moduler.
- **SG-oversikt:** de fire kategoriene med utvikling over tid, mot eget snitt og mot referanse
- **Kobling til diagnosen:** hvert tap i SG skal kunne trykkes → «hvorfor taper jeg her?»
  (fører rett inn i diagnose-trakten fra D2). Dette er den viktigste koblingen på flaten.
- **Runder:** liste + detalj med slag-for-slag, hullkart, spredning mot siktelinje
- **TrackMan:** økter, køllevisning, spredningsplott per kølle (aldri alle køller i én sky —
  det måler køllevalg, ikke treffsikkerhet), utvikling i fart og treffkvalitet
- **Tester:** resultater over tid, med bestått/ikke bestått mot protokollen
- **Treningsbelastning:** planlagt mot faktisk, med varsel når det bikker
- Alle grafer: vis datagrunnlaget («6 runder»), og en ærlig strek når det er for tynt

**C. Meg — profil og innstillinger**

- Spillerprofil: kategori, handicap, mål, utstyr, hjemmebane
- **Maksfart per kølle** (fra CS-kalibreringen) med når den sist ble målt
- **Slag-begrensninger:** «ikke bunker over 20 m» o.l. — det systemet skal respektere
- Tilgjengelige anlegg og tider — det planleggingen bygger på
- Abonnement, varsler, personvern, eksport av egne data

**D. Turneringer**

- Kalender med formål-merking (dekket i D2) — her: **resultatsiden**
- Resultat per turnering med runder, SG-nedbryting og hvordan det skal tolkes gitt formålet
  (en Trening-turnering måles aldri som Prestasjon)
- Sesongoversikt: form, plasseringer, poeng, utvikling

**E. Booking**

- Finn ledig time hos coach: kalender, varighet, sted, pris
- Bekreftelse, endring og avbestilling — med tydelige frister
- Klippekort/pakker: hva er igjen, hva utløper når
- Kvitteringer

---

### DEL 2 — AGENCYOS: COACHENS DAGLIGE FLATER

**F. Cockpit — coachens forside**

Coachens viktigste skjerm. Skal svare på: **hvem trenger meg nå?**
- **Én ting nå** øverst: den enkeltsaken som haster mest
- Avviksliste: spillere med røde flagg (belastning, manglende logging, plan som skled)
- AI-forslag som venter på godkjenning, med antall og alvorlighet
- Dagens kalender: timer, grupper, økter
- Ubesvarte meldinger med hvor lenge de har ventet
- Prinsipp: **coachen skal aldri lete.** Alt som krever handling kommer til ham.

**G. Stall — alle spillere**

- Spillerliste med det som betyr noe: siste aktivitet, plan-status, SG-trend, flagg
- Filtre: mine spillere, grupper, klubb, kategori, abonnement
- Spillerkort → full spillerprofil med all historikk samlet
- Sammenlign spillere i samme gruppe

**H. Godkjenninger og AI-hub (AgenticOS)**

Her møter coachen alt AI-laget foreslår.
- **Forslagskø** med type, spiller, begrunnelse og hva som konkret endres
- **Godkjenn én / godkjenn mange** — og alltid muligheten til å endre før godkjenning
- **Begrunnelsen synlig:** hvorfor foreslår systemet dette, hvilke data ligger bak
- Avvist forslag skal kunne kommenteres — det er treningsdata for systemet
- Historikk: hva ble godkjent, av hvem, hva ble resultatet

**I. Coach-chat (Kommando)**

- Samtale med AI-coachen om spillere, planer og data
- Kan hente frem spillerdata, foreslå endringer, skrive utkast
- Alt som endrer noe går via godkjenningskøen — chatten endrer aldri direkte
- Vis tydelig når svaret bygger på hentet data kontra generell kunnskap

**J. Innboks og meldinger**

- Samlet innboks: spillermeldinger, foreldre, e-post, systemvarsler
- Svar-utkast fra AI som coachen redigerer og sender — aldri automatisk utsending
- Tråd per spiller med hele historikken
- Ubesvart-teller med tid, koblet til cockpitens SLA-visning

**K. Grupper og team**

- Gruppeoversikt: WANG-klasser, GFGK-juniorgrupper, akademigrupper
- **Gruppeplanlegging:** legg samme økt til hele gruppen, med individuelle tilpasninger
- Oppmøte og gjennomføring per gruppe
- Gruppens samlede utvikling: hvem henger etter, hvem drar fra

**L. Booking-administrasjon**

- Coachens kalender med tilgjengelighet: åpne tider, blokkerte tider, gjentakende mønstre
- Innkommende forespørsler: godta, foreslå ny tid, avslå
- Oversikt over inntekt, gjennomførte timer, klippekort i omløp

**M. Øvelsesbank**

- Alle øvelser med AK-formel-adresse, video, bilde og krav
- Søk og filtrering på formel-aksene og SG-kategori
- Opprett og rediger øvelse — med den samme akse-skjulingen som ellers
  (en putting-øvelse viser aldri svingposisjoner)
- AI-forslag til nye øvelser, som coachen godkjenner inn i banken

**N. Tester**

- Testbibliotek med protokoller (rullerende vindu, streak, økt-port)
- Kjør test: gjennomføring, registrering, umiddelbart resultat
- **Kobling til diagnosen:** testen som bekrefter en mistenkt årsak (D2, Del 2)
- Testhistorikk per spiller og per gruppe

---

### DEL 3 — ANDRE FLATER

**O. Foreldreportal** (lese-først, aldri redigering)

- Barnets aktivitet: gjennomførte økter, oppmøte, neste turnering
- Ukerapport i klarspråk — ingen fagsjargong, ingen rådata
- Betaling og fakturaer
- Kontakt med coach
- **Personvern:** foreldre ser aktivitet og oppmøte, ikke coachens interne vurderinger

**P. Onboarding** (ny spiller)

Den viktigste førsteopplevelsen. Skal føles som starten på noe, ikke et skjema.
- Hvem er du, hva er målet, hvor spiller du
- Handicap og utgangsnivå
- Tilgjengelige anlegg og tider
- **SG-utgangspunkt:** enten fra ekte runder eller et enkelt estimat
- Første plan foreslås automatisk — spilleren skal aldri møte en tom app
- Fremdrift synlig, mulig å hoppe over og fullføre senere

**Q. Invitasjon og innmelding**

- Coach inviterer spiller eller forelder via lenke
- Gruppeinnmelding for klubber og skoler
- Bekreftelse og første innlogging

**R. Marketing** (akgolf.no)

- Forside som forklarer AK-metoden uten å drukne i fagbegreper
- Produktsider: PlayerHQ for spillere, AgencyOS for coacher og klubber
- Priser: gratis, 299 kr/mnd, og coaching-pakkene
- Om Anders og akademiet, referanser, blogg
- Konvertering: fra nysgjerrig til prøvekonto på færrest mulig steg

---

### DEL 4 — GJENNOMGÅENDE MØNSTRE (design én gang, brukes overalt)

Disse går på tvers og skal løses som system, ikke per skjerm:

1. **Navigasjon:** PlayerHQ = få, tydelige hovedflater (mobil først, bunnmeny).
   AgencyOS = tettere sidemeny med rom, tåler mer. Begge med hurtigsøk (cmd+K).
2. **Spillerkortet** — samme komponent i stall, gruppe, søk og kø.
3. **Varsler og flagg** — ett system for alvorlighet, brukt likt i cockpit, kø og lister.
4. **Tomme tilstander** — alltid én tydelig vei videre, aldri en blindvei.
5. **Datagrunnlag** — fast mønster for «basert på 6 runder» og for «for lite data».
6. **Godkjenn/avvis** — samme mønster overalt AI foreslår noe.
7. **Offline** — spilleren er på range uten dekning; vis hva som er lagret lokalt og
   hva som venter på nett.
8. **Rollegrenser** — samme skjerm kan ha ulikt innhold for spiller, coach og forelder.
   Vis tydelig hva som er lesevisning kontra redigerbart.

---

### DEL 5 — KRAV TIL LEVERANSEN

Samme som D2:
- **Norsk bokmål**, Lucide-ikoner, aldri emoji
- **Mobil og desktop** for hver skjerm. Spilleren er ofte på mobil, i sollys, med hansker
- **Alle tilstander:** tom, laster, feil, ingen data, for lite data til å konkludere
- **Tabellsifre** på alt som skal sammenlignes
- **Ærlighet foran fullstendighet** — hellere en strek enn et gjettet tall
- **Tilgjengelighet:** synlig tastaturfokus, redusert bevegelse respekteres, lesbart i sterkt lys
- **Designsystemet er ikke låst** — foreslå din egen retning, men hold den stram nok til at
  hele plattformen (rundt 450 skjermer) kan bygges på den. Coachflaten tåler tetthet og mørk
  bakgrunn; spillerflaten skal være lettere og mer fokusert.

**Det viktigste, som i D2:** Systemet er ekstremt presist under panseret. Brukeren skal aldri
kjenne det. Vanskelig å forstå er feil design — ikke en dum bruker.

## PROMPT SLUTT

---

## Notater til Anders (ikke del av prompten)

**Rekkefølge:** Kjør D2 først (Workbench er kjernen og setter designspråket), deretter D3.
Vurder å dele D3 i to kjøringer hvis Open Design leverer bedre på mindre bestillinger:
Del 1+2 (produktflatene) og Del 3+4 (rundt-flatene og systemmønstrene).

**Utgåtte bestillinger:** D1, D4 og D6 er skrevet mot v13-designsystemet (forest/lime, Claude
Design) som ble avviklet 25. juli. Innholdet deres er dekket av D2 (live-økt, Workbench-palett)
og D3 (booking, forelder, runde-logg under Analyse). De bør arkiveres.

**Ikke bestilt her:** rene utviklerflater (`/intern`, `/dev-banekart`), feilsider og
offline-siden — de er funksjonelle og trenger ikke designrunde nå.
