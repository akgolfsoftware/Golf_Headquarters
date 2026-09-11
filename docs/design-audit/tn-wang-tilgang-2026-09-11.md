# Team Norway-oversikt og WANG-ressurstilgang

Oppdatert 11.09.2026. Pakken bygger et sikkert inngangspunkt for Team Norway og lukker WANGs trener-/elevgrense. Den fullfører ikke alle skjermene i de to brukerreisene og er ikke visuelt godkjent av Anders.

## Team Norway

- `/team-norway` viser en datadrevet oversikt fra den kanoniske Team Norway-gruppen.
- Bare ADMIN eller en bruker med aktivt gruppemedlemskap får siden. Avsluttet medlemskap, uvedkommende og manglende gruppe gir ingen data.
- Databasefeil går til en trygg feilside med nytt forsøk.
- Gruppeposter og dokumenter vises bare for aktive medlemmer. Lenken til PlayerHQ-testføring vises bare for spillerrollen og beskrives som en delreise, ikke som en komplett trenerreise.
- Loading- og feiltilstand bruker eksisterende Team Norway-designverdier.

## WANG

- Coachflaten krever ADMIN eller aktiv COACH/ASSISTANT i den konkrete kanoniske gruppen `wang-toppidrett`. Medlemskap bare i WANG Ung gir ingen tilgang til Toppidrett-listen.
- Samme elevressursgrense brukes før både IUP-lesing og `lagreIupSamtale`: eleven selv, godkjent foresatt, ADMIN eller trener/hjelpetrener i samme Toppidrett-gruppe.
- IUP-mål og neste periode kontrolleres mot samme elev og gruppe før transaksjonen.
- Innloggingens `next`-parameter godtar bare interne WANG-stier og avviser eksterne adresser, protokollrelative adresser og innloggingssløyfer.
- Databasefeil blir en trygg prøve-igjen-feil. De blir ikke presentert som manglende gruppe eller demonstrasjonsdata.

## Kontroll

- 24 samlede tilgangs- og rutetester bestod uten hoppede tilfeller.
- Team Norway-sporet bestod 2 434 enhetstester og fire komponenttester. WANG-sporet bestod 2 450 enhetstester og fire komponenttester.
- Begge spor bestod full `npm run verify`, inkludert typesjekk, streng kodekontroll, prosjektkontroll, 56 raske designvisninger og Next.js/Serwist-produksjonsbygg.
- Ingen databaseskjema, migrasjon, RLS, produksjonsmiljø, import, betaling eller utsending ble endret.

## Gjenstår

- Ekte innlogget kontroll med tillatt og avvist bruker mot et isolert testmiljø.
- Visuell sammenligning mot valgt Team Norway-pakke og WANG-kilde på 390 og 1440 px, relevante temaer og 200 prosent tekst.
- Team Norway: full testføring, resultat/historikk og dokument-/postreise for trener og spiller.
- WANG: full uke-, økt-, elev-/gruppe- og rapportreise med reelle data og relevante tom-/feiltilstander.
