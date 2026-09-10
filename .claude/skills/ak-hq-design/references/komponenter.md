# Komponenter og felles designverdier

Dette er en behovskatalog for hele appen, ikke ordre om å bygge enda et bibliotek. Undersøk de faktiske komponentfilene i [inventaret](../assets/ruteinventar.json). Velg gjenbruk, justering eller ny komponent med begrunnelse. Ikke behandle 693 filer som 693 selvstendige grunnkomponenter.

## Designverdier i tre nivåer

1. **Grunnverdier:** fargepalett, skriftfamilie/-vekt, avstand, størrelse, hjørner og bevegelse.
2. **Betydning:** tekst, nedtonet kontekst, side, panel, kant, aktivt valg, hovedhandling, feil, varsel, suksess, egne data, mål og referanse.
3. **Komponent:** knappens høyde/fyll, feltets kant, radens padding og grafens serieverdier peker til nivåene over.

Hvert tema definerer de samme betydningene med lesbare kombinasjoner. Ikke anta at identisk hex i lys og mørk gir samme kontrast. Før en kartlegging til dagens CSS-variabler og komponenter ved implementering; behold eksisterende navn der det er hensiktsmessig. Ikke fastsett et nytt prefiks eller importer et nytt UI-bibliotek som en del av selve designbeskrivelsen.

## Katalog over komponentfamilier

| ID | Familie og varianter | Tilstander og særkrav |
|---|---|---|
| C01 | App-ramme: spiller, coach, forelder, lag, offentlig | Safe-area, scroll, global melding, rolle/kontekst |
| C02 | Navigasjon: bunnmeny, side-/toppmeny, brødsmule, tilbake | Aktiv, fokus, undernivå, tilgjengelig plass, synlige navn |
| C03 | Sidehode, seksjonshode, handlingslinje | Lang tittel, flere handlinger, mobil ombrekking |
| C04 | Button, ikonknapp, lenke | Normal, hover, press, fokus, disabled, loading; stabilt navn og størrelse |
| C05 | Input, textarea, tall/enhet, passord, søk | Label, hjelp, feil, utfylt, read-only, fokus, inputmetode |
| C06 | Select/combobox, checkbox, radio, switch | Valgt, tomt søk, utilgjengelig, tastatur, feil |
| C07 | Dato-/tidsvalg, varighet, tidsrom | Lokal tid, over midnatt, utilgjengelig dag, kollisjon |
| C08 | Filter, tabs, segmented control, chips | Aktivt valg, null treff, fjern valg, avkorting |
| C09 | Kort, panel, listelinje, agenda | Ikke alle rader er trykkbare; valgt og informativ må skilles |
| C10 | Tabell, sortering, paginering, flervalg | Tom, loading, feil, lange celler, handling per rad, mobilalternativ |
| C11 | Ark/dialog/inspektør, meny/popover | Fokus inn/ut, lukk/avbryt, dirty state, skjermtastatur, nested-flow |
| C12 | Banner, toast, inline-melding, fremdrift | Varighet, screen-reader-annonsering, retry, ikke bare farge |
| C13 | Tom, laster, feil, offline, ikke funnet | Kontekst, nyttig neste steg, sist hentet, delvis tilgjengelig data |
| C14 | Avatar, rolle-/organisasjonsvelger | Syntetisk eksempel, manglende bilde, lang tittel, synlig valgt kontekst |
| C15 | Status-/lagringsindikator, hendelseslinje | Planlagt/pågående/avbrutt/fullført holdes atskilt fra lagret/synker/feilet |
| C16 | Øktkort og øktoppskrift | Planlagt, foreslått, pågående, fullført, avbrutt, skjult/ikke delta |
| C17 | Live-registrering og teller | Treff/kant/bom eller domenevariant, Angre, pause ved behov, tidlig avslutning |
| C18 | Resultatsammendrag og neste steg | Faktiske forsøk, mål, avbrutt, lagring, lenke til plan/fordypning |
| C19 | Uke-/måned-/årsplan og agenda | Tom, tett, overlapp, drag med alternativ knapp, valgt økt, mobil liste |
| C20 | Opprett/flytt/rediger/serie/publiser | Validering, konflikt, omfang én/serie/gruppe, forhåndsvisning, avvist/delvis feil |
| C21 | Spiller-/gruppeoversikt og profil | Filtre, utvalg, synlige kriterier, tilgang, tom gruppe, flere roller |
| C22 | Øvelsesbank, test og testprotokoll | Instruksjon, utstyr, antall, enhet, registrering, gyldighet og resultat |
| C23 | KPI, trend, sammenligning, målvindu | Kilde, enhet, periode, antall, null/mangler, usikkerhet; ingen fabrikkert fremgang |
| C24 | Stolpe/linje/spredning/radar | Felles skala, nullpunkt, legend, utvalg, tilgjengelig tekst/tabell |
| C25 | TrackMan, slagtabell, kølle/gapping | Få slag, normalisering, filter, sesjon, importfeil, datakvalitet |
| C26 | Hullkart, gameplan, runde/scorekort | Orientering, avstand, brutto score, slagpunkt, geometri mangler, ferdig runde |
| C27 | Meldinger, innboks, trenerbeskjed | Ulest, sender, sending/feil/retry, vedlegg, mottaker og tillatt innsyn |
| C28 | Video, lyd, dokument/filopplasting | Tillatelse, fremdrift, bearbeiding, avvist type, avspillingsfeil, alternativ tekst |
| C29 | Caddie/AI-forslag og godkjenning | Foreslår/arbeider/feiler, kilder, konsekvens, rediger/avvis; eget forslag er ikke utført handling |
| C30 | Booking: tjeneste, coach, tid, sted | Pris, varighet, utløpt/oppbrukt tid, ikke tilgjengelig, tilgjengelige alternativer |
| C31 | Bestillingsgjennomgang og betaling | Totalpris, betaler, vilkår, betaling venter/feiler/avbrytes/bekreftet, duplikat |
| C32 | Mine bookinger, kvittering, endring | Avbestilling/flytting etter gjeldende regler, betalt/ubetalt/refusjon der relevant |
| C33 | Abonnement, credits og økonomi | Avklarte produktregler, saldo/kilde, faktura, prøve/oppsigelse, tilgang etter betaling |
| C34 | Innlogging, invitasjon og onboarding | Ugyldig/utløpt lenke, bekreftelse, gjenoppretting, retur til opprinnelig mål |
| C35 | Samtykke, personvern og tilgang | Barn/kontekst, hvem ser hvilke felt, avvist/utløpt lenke, trekk tilbake der relevant |
| C36 | Innstillinger, hjelp og kontakt | Liste → detalj → skjema, lagring/feil, lange verdier, støttebehov |
| C37 | Lag-/skoleinnlegg og dokumentrom | Gruppefilter, rettigheter, vedlegg, hendelser, org-profil og publisering |
| C38 | Offentlig innhold og tilbud | Hero, tilbud, coach-/anleggskort, bevis/case, FAQ, kontakt, navigasjon/footer |
| C39 | Offentlig statistikk og verktøy | Søk, filter, rangering, beregning, kilde/dato, tomt resultat, lang tabell |
| C40 | Drift, audit og integrasjonsstatus | Tid, kilde, feilårsaker, retry, påvirket funksjon, sikker visning av tekniske detaljer |

Utvid katalogen når inventar eller brukerreise viser et faktisk udekket behov. Kartlegg hver relevant eksisterende komponentfamilie til katalogen; kategorinavnet alene dokumenterer ikke full dekning.

## Kontrakt per komponent

Dokumenter ID/navn, oppgave, anatomi, hvilke data/felt den trenger, varianter, alle relevante tilstander, interaksjoner, tastatur/screen-reader, formater, temaer, designverdier og hvor den brukes. Angi hva som er informativt og hva som er en handling. Vis ekstremtilfeller: langt navn, null, negative tall, mange rader og tomt innhold.

Tegn gjerne én samlet komponentoversikt, men koble hvert eksempel til en faktisk skjerm i prototypen. Komponentens tekst, størrelse og variant skal samsvare med det skjermen viser. Et dokumentert avvik er en åpen oppgave, ikke en ferdig leveranse.

## Datavisning

Samme verdier i samme graf må ha samme skala. +0,20 og −0,20 får like stort utslag rundt null. Oppgi når akser er begrenset, normalisert eller på forskjellige enheter. Ikke skjul uønskede tall med lav opacity. Mål, egen prestasjon og referanse må kunne skilles også uten farge. Ved manglende datagrunnlag vises forklaring, ikke null som om det var en måling.
