# Personvernerklæring for AK Golf — UTKAST

> **UTKAST — må kvalitetssikres juridisk før publisering.** Dette er G4 i
> masterplanens Del 3d: et oppdatert utkast basert på `docs/gdpr/datakart.md`,
> ment å erstatte teksten i `src/components/marketing/v2/MarkedPersonvernV2.tsx`
> (datert 12. mai 2026) NÅR (a) jurist har godkjent og (b) gapene i
> `docs/gdpr/rettigheter-status.md` er lukket eller teksten justert til det som
> faktisk stemmer. Felter merket `[FYLL INN]` må Anders/jurist fylle ut.
> Løfter merket ⚠ forutsetter kode som ikke finnes ennå — ikke publiser dem før
> funksjonen er bygget, eller skriv dem om.

Sist oppdatert: [FYLL INN dato ved publisering]

---

## 1. Hvem er ansvarlig for dataene dine?

AK Golf Group AS, org.nr. 927 248 581, Bossumveien 6, 1605 Fredrikstad, er
behandlingsansvarlig for personopplysningene som registreres når du bruker
akgolf.no, PlayerHQ-appen og tilhørende tjenester.

Spørsmål om personvern: personvern@akgolf.no
[FYLL INN: eventuelt personvernkontakt/DPO med navn — jurist vurderer om DPO er påkrevd]

## 2. Hvilke opplysninger samler vi inn?

**Konto og profil:** navn, e-postadresse, telefonnummer, profilbilde,
fødselsdato, hjemmeklubb, skole og klassetrinn (for toppidrettselever),
handicap, spillererfaring og ambisjoner.

**Trenings- og spilldata:** treningsplaner, gjennomførte økter, runder og
slag-for-slag-data, testresultater, TrackMan-målinger, mål og prestasjoner.
Dette er kjernen i tjenesten — det er slik vi viser utviklingen din.

**Helseopplysninger (frivillig):** hvilepuls, HRV, søvn, vekt og skade-/
rehabiliteringsinformasjon — kun hvis du eller din coach registrerer det.
Dette er en særlig kategori personopplysninger og behandles bare med ditt
uttrykkelige samtykke. [JURIST: bekreft samtykkemekanismen før publisering —
se AVKLAR-punkt 1 i datakartet.]

**Video og lyd:** treningsvideoer av deg (lastet opp av deg eller coachen)
og lydopptak av coaching-økter med transkripsjon og AI-analyse. Lydfiler
slettes automatisk etter en fastsatt periode; [FYLL INN: hva som gjelder for
transkript — i dag beholdes de uten tidsgrense, se AVKLAR-punkt 2].

**Meldinger:** dialog med coach, spørsmål og svar, vedlegg, og samtaler med
AI-hjelperen i appen.

**Betalingsdata:** betalings- og abonnementshistorikk. Selve kortinformasjonen
lagres hos Stripe — vi ser og lagrer aldri kortnummeret ditt.

**Tekniske data:** innloggingstidspunkt, enhetsinformasjon for push-varsler,
feillogger og en sporbar logg over viktige handlinger (f.eks. samtykke-endringer).

**Hvis du booker som gjest** (uten konto) lagrer vi navn, e-post og telefon
for å gjennomføre timen.

## 3. Hvorfor, og med hvilket rettslig grunnlag?

| Formål | Rettslig grunnlag |
|---|---|
| Levere tjenesten: konto, planer, analyse, booking | Avtale (GDPR art. 6 nr. 1 b) |
| Betaling og regnskap | Avtale + rettslig forpliktelse (bokføringsloven) |
| Helse- og skadedata for belastningsstyring | Ditt uttrykkelige samtykke (art. 9 nr. 2 a) |
| Foreldresamtykke og -innsyn for spillere under 16 år | Rettslig forpliktelse (art. 8) |
| Produktforbedring og feilsøking | Berettiget interesse (art. 6 nr. 1 f) |
| Markedsføring til eksisterende kunder | Berettiget interesse — du kan reservere deg i innstillingene |
| Nyhetsbrev og guider til ikke-kunder | Samtykke |

## 4. Hvem deler vi opplysninger med?

Vi selger aldri opplysningene dine. Vi bruker disse underleverandørene
(databehandlere), med databehandleravtale:

- **Supabase** (database, innlogging, fillagring — EU-region)
- **Vercel** (hosting — EU-region)
- **Stripe** (betalingsbehandling)
- **Resend** (transaksjons-e-post)
- **Anthropic** (AI-funksjoner som AI-coach og analyse; innhold du skriver til
  AI-hjelperen sendes dit for å lage svar)
- **Deepgram** (transkripsjon av lydopptak fra coaching-økter)
- **Google** (kalendersynkronisering — kun hvis coachen kobler til Google Kalender)
- **Notion** (synkronisering — kun hvis du selv kobler til Notion)

[JURIST: verifiser DPA-status og overføringsgrunnlag (SCC) for leverandører
utenfor EU/EØS, særlig Stripe, Anthropic og Deepgram.]

Din coach ser trenings-, spill- og relevante helsedata som del av
coaching-avtalen. Har du kun app-abonnement uten coaching, har ingen coach
tilgang til dataene dine.

## 5. Hvor lenge lagrer vi opplysningene?

- **Kontodata:** så lenge kontoen din er aktiv. Sletter du kontoen, stenges
  den umiddelbart og alle persondata slettes permanent etter 30 dager
  (angrefristen din).
- **Regnskapsdata** (betalinger, fakturaer): 5 år, iht. bokføringsloven —
  også etter kontosletting.
- **Lydopptak fra coaching-økter:** slettes automatisk etter
  [FYLL INN: antall dager — styres av retentionUntil per opptak].
- ⚠ **Feillogger:** [FYLL INN — dagens erklæring lover 90 dager, men ingen
  automatikk finnes. Bygg jobben eller oppgi reell praksis.]
- ⚠ **Inaktive kontoer:** [FYLL INN — dagens erklæring lover sletting etter
  36 måneder, men ingen automatikk finnes. Bygg jobben eller stryk løftet.]
- **Turneringsresultater** fra offentlige kilder (GolfBox, WAGR) er offentlig
  informasjon og består uavhengig av kontoen din.

## 6. Dine rettigheter

Du har rett til:

- **Innsyn og kopi:** Last ned alle dataene dine som fil under
  Innstillinger → Personvern i appen. Foresatte kan laste ned barnets data
  fra foreldreportalen. [MERK: eksporten må utvides til å dekke alt —
  se gap-liste punkt 4 — før dette formuleres som «alle».]
- **Retting:** Du kan endre profilopplysninger selv i appen. Andre feil
  retter vi når du kontakter oss.
- **Sletting:** Slett kontoen din selv under Innstillinger → Personvern
  (skriv SLETT for å bekrefte). Data vi er lovpålagt å beholde
  (regnskapsdata) slettes ikke.
- **Dataportabilitet:** eksporten er i maskinlesbart format (JSON).
- **Begrensning og innsigelse:** kontakt oss, så begrenser vi behandlingen
  mens vi vurderer saken.
- ⚠ **Slette AI-chat-historikk:** [Ikke lov dette før knappen finnes —
  se gap-liste punkt 2.]
- **Klage:** Du kan klage til Datatilsynet (datatilsynet.no).

Henvendelser til personvern@akgolf.no besvares innen 30 dager.

## 7. Barn og unge under 16 år

Spillere under 16 år kan ikke selv samtykke til at vi behandler
personopplysninger. Derfor:

- Kontoen settes på vent til en foresatt har gitt samtykke — før det samles
  ingen treningsdata inn.
- Foresatte kobles til via en sikker invitasjon, og forvalter samtykkene i
  foreldreportalen (innsyn, endring, eksport og krav om sletting).
- Foresatte har lesetilgang til barnets utvikling, økonomi og samtykker.

[JURIST: vurder eget samtykkepunkt for video-/bildeopptak av mindreårige.]

## 8. Cookies og analyse

Vi bruker kun cookies som er nødvendige for innlogging og sikkerhet.
[FYLL INN/VERIFISER: analytics-verktøy — dagens erklæring oppgir Plausible
(cookie-fri). Bekreft at det stemmer med faktisk oppsett før publisering.]
Vi bruker ikke Google Analytics, Facebook Pixel eller tilsvarende
tredjepartssporing.

## 9. Sikkerhet

Alle data lagres kryptert i EU. Tilgang styres av roller og
kapabiliteter — en coach ser bare egne spillere, og selvbetjente brukere er
usynlige for coacher. Viktige handlinger logges. Tilkoblinger til eksterne
tjenester (Google, Notion) lagres med krypterte nøkler.

## 10. Endringer i denne erklæringen

Vi kan oppdatere erklæringen. Ved vesentlige endringer varsler vi deg på
e-post. Datoen øverst viser siste versjon. [ANBEFALING: innfør versjonsnummer
og lagre hvilken versjon hver bruker/foresatt har samtykket til — se
gap-liste punkt 6.]

---

## Publiserings-sjekkliste (interne notater — slettes før publisering)

1. Alle `[FYLL INN]` utfylt og alle ⚠-løfter enten bygget eller omskrevet.
2. Jurist har godkjent: art. 9-samtykke, databehandlerliste, overføringsgrunnlag,
   DPO-vurdering, mindreårige-tekst.
3. Teksten portes inn i `MarkedPersonvernV2.tsx` (v2-ramme beholdes) og
   `SIST_OPPDATERT` settes.
4. Kortversjon/lenke inn i onboarding og foreldresamtykke-flyten.
