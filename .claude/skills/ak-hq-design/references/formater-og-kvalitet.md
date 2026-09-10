# Skjermformater og kvalitetskontroll

«Alle formater» betyr her den eksisterende responsive webappen: telefon, nettbrett og desktop, berøring og tastatur. Det er ikke automatisk en bestilling av separate native iOS-/Android-apper, klokke eller TV. Utskrift/PDF beskrives for relevante planer og rapporter når den funksjonen finnes eller er bestilt.

## Referanseflater og tilpasning

| Format | Referansebredder i CSS-piksler | Viktigste tilpasning |
|---|---|---|
| Smal telefon | 320, 360 | Ombrekk tekst, prioriter handling, ingen global horisontal scrolling |
| Vanlig/stor telefon | 390/393, 430 | Tommelsone, safe-area, åpnet tastatur, stående og liggende bruk |
| Nettbrett | 768, 834 | En kolonne eller liste/detalj etter innhold, touch og tastatur |
| Bredt nettbrett | 1024, 1180 | Delte flater når de gir verdi, skjul/åpne inspektør uten å miste kontekst |
| Laptop | 1280, 1440 | Tydelig navigasjon, effektiv oversikt, oppgavebestemt tetthet |
| Stor desktop | 1920, 2560 | Begrens tekstbredde, bruk tilgjengelig plass men unngå utstrakte tomme kort |

Disse er prøvebredder, ikke obligatoriske CSS-breakpoints eller faste lerretmål. Dokumenter hva som skjer mellom dem. Tegn hver skjermfamilie ved representative formater; bruk felles mønster og eksplisitte unntak for resten. Kritiske reiser prøves i de formatene brukerne faktisk benytter. Designet skal tåle høydeendring, liggende mobil og skjermtastatur.

## Tilstander per relevant skjerm

Normal, første gangs bruk/tom, lasting, delvis data, feil, offline/utdatert, lesetilgang/avvist, valgt/redigering, sender/lagrer, lagret, avbrutt/fullført. Ikke alle kombinasjoner krever et eget tegnebrett. Angi `ikke relevant` med begrunnelse i skjermkontrakten; ingen blanke ruter som skjuler et gap.

### Fysisk bruk

Trykkflater rundt 44–48 px er et praktisk utgangspunkt for appen; gjentatt slagregistrering kan trenge større flater og avstand. Test én hånd, dagslys og feiltrykk på en faktisk telefon. Dette er designråd, ikke en påstand om at testing er utført.

### Tilgjengelighet

Mål WCAG 2.2 AA for relevante flater. Dokumenter faktiske kontroller og åpne avvik; en automatisk kontroll alene beviser ikke samsvar.

- Vanlig tekst trenger normalt 4,5:1 kontrast, stor tekst 3:1. Ikke demp vesentlige tall til opacity 0,45. [W3C: kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- WCAG 2.2 AA beskriver 24 × 24 CSS-piksler eller de spesifiserte unntakene, blant annet tilstrekkelig avstand. Ikke presenter appens anbefalte 44–48 som selve AA-minimumet. [W3C: målområder](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Prøv tekstforstørrelse til 200 % uten tap av innhold eller funksjon. En manuelt tegnet XL-variant alene er ikke bevis. [W3C: tekststørrelse](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
- Kontroller ombrekking ved smal visning, eksempelvis 320 CSS-piksler/400 % zoom fra 1280. Todimensjonalt innhold som nødvendige tabeller/kart kan ha begrunnede unntak; resten av siden skal fortsatt fungere. [W3C: ombrekking](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Synlig tastaturfokus, logisk rekkefølge og meningsfulle navn. Fokuserte kontroller må ikke bli fullstendig skjult av eget klebrig innhold. Produktmålet bør være at hele kontrollen er synlig. [W3C: fokus ikke skjult](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- Navn/rolle/verdi, etiketter, feilbeskjeder og status må fungere med hjelpemidler. Grafer trenger en forståelig tekst- eller tabellrepresentasjon. Test med tastatur og skjermleser der miljøet tillater det; rapporter resten som utestet.

## Visuell og funksjonell gjennomgang

For hver relevant variant: skjerm-ID, versjon, bredde/høyde, tema, rolle, syntetisk datatilstand og kontrollmetode. Sammenlign app med valgt referanse når implementering er bestilt. Dokumenter nettleser/fontgrunnlag; et universelt krav om 0,1 % pikselforskjell på tvers av miljøer er ikke en hensiktsmessig ferdigdefinisjon.

Se etter optisk justering, leserekkefølge, klare hoved-/sekundærhandlinger, størrelse på informasjon, kort som har en hensikt, scrollposisjon, tilbakevei og bevegelse som forklarer tilstand. Små billedavvik kan være irrelevante mens feil dataskala eller feil øktstatus er alvorlig.

## Prøver som skal endre en vurdering

- +0,20 og −0,20 tegnes like store; manglende data blir ikke målt null.
- To registreringer og tidlig avslutning gir ikke «alle steg fullført».
- Feiltrykk kan rettes; ventende lagring er synlig og beholder faktisk registrering.
- Den samme økten har konsistente navn, mål og status gjennom reisen.
- Lang tittel, null historikk og tett uke skjuler ikke nødvendig handling.
- Bookingens totalpris, coach og tid stemmer gjennom valgene; prototypens simulering skilles fra ekte betalingstest.
- En spiller, coach og forelder får forståelig navigasjon og riktig kontekst. Ikke bruk forskjellig design som erstatning for verifiserte tilgangsregler.
