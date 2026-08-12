# Fiksliste etter Anders' signering 12.08.2026

> **LUKKET 13.08.2026:** bølge A–C (#427–#429) leverte fiksene, nytt galleri ble kjørt mot
> prod 13.08, og **Anders signerte GODKJENN på alle 18 skjermene + push-banneret (#430)**.
> Sjekklisten er oppdatert til `[x]` for de signerte radene. Gjenstående skjønnsspørsmål
> i §0/§1 under er dermed løst i praksis (skjermene godkjent som de står) — historikk.

**Grunnlag:** signering mot sign-off-galleriet 12.08 (ferske bilder mot dagens `main`, etter
#413/#414/#424). Anders svarte **FIKS på 18 skjermer**; NT-416b (AgencyOS turneringer) ble ikke
vurdert.

**Regel:** ingen skjerm merkes `[x]` i `PAPER-ZIP-CHECKLIST.md` før Anders har sett den PÅ NYTT
etter fiks og sagt GODKJENN. Denne fila er arbeidslista fram dit.

---

## 0. Tre skjermer trenger retning før arbeid (FIKS er ikke entydig)

| Skjerm | Hvorfor uklart | Hva jeg trenger |
|---|---|---|
| **NT-417** Runde-logg | Vurderingen fant **ingen** avvik mot fasiten. «FIKS» peker ikke på noe konkret. | Hva skal endres? Ellers foreslår jeg GODKJENN. |
| **NT-418b** Blogg og **NT-418c** 404 | Avviket lå i **fasitbildet**, ikke i appen: galleriet fanget feil fasit-tilstand (blogg fikk coacher-fasiten, 404 fikk offline-fanen). Appen følger Paper-mønsteret. | Skal jeg hente riktig fasit-tilstand og sammenligne på nytt, eller godkjenne mot mønsteret? |
| **PP-1.7** Offentlig booking | Kan ikke fikses nå — flaten er bevisst pauset (`BOOKING_PUBLIC`), så den viser Acuity. Dette er selve lanseringsbryteren. | Bekreft at den står til sist, som portplanen sier. |

## 1. Produktbeslutninger som ligger inne i fiksene

Disse er ikke håndverk — de er valg. Jeg bygger ikke før du har sagt hva du vil:

1. **PP-1.6 Innlogging:** fasiten har verken «Fortsett med Google», «BankID» eller «Opprett konto».
   Skal de bort, eller vinner koden her?
2. **NT-416a Planbibliotek:** skal desktop få fasitens tredje kolonne (detaljpanel), altså erstatte
   liste → egen side med liste → panel? Gjelder også AgencyOS ellers.
3. **PP-2.1 Konsoll:** fasiten spriker med seg selv om «Én ting nå» skal være oransje eller svart.
4. **PP-1.1 / PP-1.3:** hvilken av de mange veiene i tom tilstand er DEN ene?

## 2. Arbeidslista, sortert etter effekt

### Bølge A — bærende informasjonsarkitektur (størst forskjell for deg som coach)
- **PP-2.3 Spillere:** bygg fasitens gruppering «Trenger deg nå / Følger planen / Hviler».
  Bytt filtrene til program (Academy, WANG, GFGK, stille over sju dager). Legg til SG-kolonne,
  fast bunnhandling på mobil og detaljpanel på desktop.
- **PP-2.4 Kalender:** åpne i dagsvisning med «Løs kollisjonen» som konkret handling. Fjern
  topplinjens modulfaner og de to knappene (fasiten har null handlinger i toppen). Programfiltre.
- **PP-2.2 Innboks:** slå sammen de 30+ like «Coddie-utkast»-radene til én sak. Rydd bunn-nav til
  fasitens fire faner.

### Bølge B — PlayerHQ-kjernen
- **PP-1.3 Analyse:** ett SG-kort med de fire båndene inline. Fjern varselkortet foran fanene
  (to konkurrerende handlinger). Tre faner, ikke fire. Legg inn disclaimeren.
- **PP-1.1 I dag:** flat header med temabryter. Svart rund send-knapp; mic, `/` og `@` inne i
  skrivefeltet på desktop. Én vei videre i tom tilstand.
- **PP-1.5 Book time:** abonnementskort (pakke, pris, inkludert, brukt i perioden). Fast
  bunnhandling «Velg en dag». Rund tilbakeknapp. Fjern «Coacher»-seksjonen.
- **PP-1.2 Plan:** eierskapsnotisen inn i grå notisboks med blyantikon. Temabryter.
  «Book coachingtime med Anders».
- **PP-1.4 Meg:** temabryter. Fjern gradienten på sesongmål-kortet (Paper er matt).
  Manglende felter i «Om deg» er testdata, ikke design.

### Bølge C — resten
- **PP-2.1 Konsoll:** skrivefeltet fast nederst over fanelinjen, svart rund send-knapp,
  søk og temabryter i header, «Workbench» synlig i navigasjonen i stedet for «Mer».
- **NT-416a Planbibliotek:** filterrad med tellere på desktop (+ panel, se beslutning 2).
- **NT-415 Coach-hub:** smal, sentrert kortflate på desktop i stedet for full bredde.
- **NT-418a Coacher:** filterrad med tellere over kortene.
- **NT-419b GFGK-kalender:** mobilfeilen er rettet — trenger presisering av hva mer du vil ha.

### Ikke vurdert
- **NT-416b Turneringer:** mangler KPI-stripe, dublett-varsel med handling, og tabellen med
  egen fanerad. Venter på din vurdering.

## 3. Tverrgående funn

**Temabryteren mangler på nesten alle PlayerHQ-skjermene** (PP-1.1, 1.2, 1.4, 2.1). Fasiten har
den i headeren overalt. Dette er ett grep som lukker et avvik på fire skjermer samtidig — tas
først i bølge B.

**Send-knappen** er samme avvik på PP-1.1 og PP-2.1 (grå papirfly mot fasitens svarte runde pil).
Én komponentfiks dekker begge.
