# Atletisk intelligens — retningen bak Precision Athletics (historisk fra 26.09.2026)

**Status 15.10.2026:** Dette dokumentet beskriver smaks- og arbeidsretningen som Precision Athletics ble bygget på. Utforskingen er avsluttet. **Visuell fasit er Claude Design «AK Golf Precision Athletics» (`7d7c2994`), valgt av Anders 26.09.2026**, jf. [design-autoritet.md](../../../../docs/design-system/design-autoritet.md). Bruk denne fila for å forstå hvorfor systemet ser ut som det gjør, ikke som tillatelse til å starte blankt eller lage en ny kandidat.

**Team Norway:** `/team-norway/*` følger Claude Design «Team Norway App» (Anders 22.09.2026, beslutninger.md §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK). Claw-valget 13.09 er overstyrt; lenken under er historikk: [beslutningen 13.09.2026](../../../../docs/design-system/team-norway-claw-valgt-2026-09-13.md).

Opprinnelig status 13.09.2026: Dette var Anders' aktive smaks- og arbeidsretning for produktdesignet. PlayerHQ, AgencyOS, Team Norway og WANG var obligatoriske kjerner. Arbeidet startet fra blankt lerret med v0.1 og ble videreført til Precision Athletics.

Historiske produktuttrykk i koden kan brukes til å finne funksjoner, tilstander og tekniske avhengigheter. De er ikke automatisk visuell fasit. Ved videreføring beholdes kandidatens fungerende designvalg og rettinger, mens konkrete svakheter forbedres. Nye uttrykkelige valg registreres for sitt omfang.

## Retningen

Arbeidstittel: **Atletisk intelligens**.

Én produktfamilie skal kunne skifte uttrykk etter oppgaven uten å bli flere merkevarer:

- **Sportslig energi:** PlayerHQs innganger, øktstart, Live og milepæler kan bruke meningsbærende sportsfoto, bevegelse og stor, selvsikker typografi.
- **Operativ ro:** AgencyOS, kalender, køer og analyse skal ha en rolig, presis arbeidsflate med høy lesbarhet og oppgavebestemt datatetthet.
- **Tid som ryggrad:** Plan, dagsoversikt og treningsflyt bruker tid, rekkefølge, intervaller og neste handling som struktur.
- **Fokus ved behov:** Mørke, dype flater og kontrollert farget lys kan brukes i Live, fordypning, personlig innsikt og synlig AI-arbeid. Dette er en oppgavemodus, ikke et krav om mørk bakgrunn overalt.

AgenticOS lever visuelt i AgencyOS. Det skal ikke få en separat neon-, robot- eller «AI-magisk» merkevare. Skill forslag, godkjenning, kjøring, feil og utført handling med hierarki, språk og status – ikke dekorativ glød alene.

## Fire beslutningsprinsipper

1. **Atletisk:** Vis bevegelse, innsats og prestasjon uten golfklisjeer eller pynt som later som den er data.
2. **Redaksjonelt:** La typografi, fotografi og rytme skape hierarki; ikke bygg identiteten av like dashboard-kort.
3. **Operativt rolig:** Oppgaven og neste beslutning skal være tydeligere enn systemets moduler.
4. **Fokus ved behov:** Bruk dramatikk på øyeblikk som fortjener konsentrasjon; hold resten stille.

## Det nye designsystemet

Design System v0.1 skal utvikles sammen med reelle skjermer, ikke som et løsrevet komponentbrett. Dokumenter:

- grunnverdier for farge, typografi, avstand, størrelse, rutenett, radius, kant, dybde, ikonografi og bevegelse;
- betydningsbaserte verdier for bakgrunn, flate, tekst, valgt, handling, informasjon, varsel, feil, suksess, egne data, mål og referanse;
- komponentverdier og komponentkontrakter med anatomi, varianter, tilstander, responsiv oppførsel og tilgjengelighet;
- sammenhengen mellom lys operativ modus og mørk fokusmodus;
- når fotografi er innhold, når det er tillatt som stemning, og hvordan lesbarhet beskyttes.

Bruk tre nivåer: **grunnverdi → betydning → komponent**. Ikke hardkod tilfeldige farger eller avstander i komponentene. Ikke fyll v0.1 med hypotetiske komponenter uten et ekte brukseksempel.

## Første prøver

1. AgencyOS Hjem: prioritet, kalender, coachkontekst, godkjenning og AgenticOS-status.
2. PlayerHQ: I dag → økt → Live → oppsummering på mobil.
3. Analyse: positive og negative verdier, periode, kilde, skala og manglende data.

Først når samme system løser disse tre uten å miste produktidentiteten, kan v0.1 foreslås som valgt retning for flere skjermfamilier.

## Lån og avgrensning

Anders' bildesett fra 11.09.2026 er visuell smaksreferanse. Konseptbilder fra Pinterest og Dribbble viser preferanse, men beviser ikke testet brukervennlighet. Lån fotoenergi, typografisk selvtillit, tidslinjer, rolig datatetthet og kontrollert fokus. Ikke kopier enhetsrammer, presentasjonsglans, ekstrem glød, uleselig tekst eller merkevaren til referansen.

For funksjonelle mønstre kan etablerte produkter brukes som sekundær kilde. Trekk ut layout, hierarki og handling; ikke kopier farger eller produktidentitet.

## Bruk i prompts, design og kode

- **Ny utforsking:** Start blankt og navngi leveransen v0.1 når Anders bestiller en ny start. Vis både systemet og skjermene som bruker det.
- **Videreføring:** Les siste prosjektfiler og gjeldende delvalg. Fullfør avklart omfang med neste ledige kandidatversjon. Eldre eksport og siste rapport fra et verktøy må skilles fra kontrollert filinnhold.
- **Valg:** Registrer Claude Design-versjon, dato, berørte reiser, temaer og åpne avvik når Anders velger en retning.
- **Implementering:** Bygg bare mot den valgte versjonen. Kartlegg den til faktiske delte komponenter og designverdier i repoet; ikke behold gamle visuelle regler av vane og ikke opprett et parallelt bibliotek uten plan.
- **Kontroll:** Sammenlign mobil og desktop med valgt versjon, og prøv relevante tomme, lastende, feil-, offline-, tilgangs- og lagringstilstander.

Den komplette byggepakken skal inkludere PlayerHQ, AgencyOS, Team Norway og WANG. Offentlig marked, booking, innlogging/konto, forelder, delt innsyn og systemtilstander skal bruke samme fundament gjennom eksplisitte profiler eller mønstre før lansering. Profilforskjeller kan endre tone og tetthet, men ikke skape parallelle, skjulte designregler.
