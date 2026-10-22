# Team Norway-trenerflaten: plan for designløftet og de resterende wireframes (22.10.2026)

Bestilt 22.10 fra hovedøkta for TN-trenerflaten. Gjelder `/team-norway/*` etter
§TEAM NORWAY-TRENERFLATEN BYGGES I HQ, §TEAM NORWAY ER BARE FOR TRENERE, §SKRÅ (19.10),
navy sidemeny og Schibsted Grotesk (20.10), §DESKTOP-SKJERMER BRUKER FULL BREDDE (21.10) og
TN-aksefargene (14.10). Bilder bare fra `public/team-norway/bilder/`.

Denne planen rører ikke `src/`. Koden bygges av kodeøkta («tn-kode-ferdig») etter wireframes i
`docs/design-system/utkast-tn/trenerflate/`.

- Utkast 1 (meny, hjem, profil, spillere, IUP Oversikt og Turneringer, uten deling, Referanse › WAGR):
  [index.html](../design-system/utkast-tn/trenerflate/index.html), https://claude.ai/artifact/DJHq9dKNNs8iCoyHZDptbF
- Funksjonsgrunnlag: Team Norway funksjonsplan 22.10, https://claude.ai/artifact/1i2fcpao7BW2m7UvF9dcPf. Planen og utkast 2 sier det samme som den om menyen, de åtte IUP-fanene og PlayerHQ-koblingen.
- Utkast 2 (resten): [utkast-2.html](../design-system/utkast-tn/trenerflate/utkast-2.html), https://claude.ai/artifact/EvAKJdcygRpfMSKUPjGw1Y

## 1. Kartlegging

Grunnlag: alle `page.tsx` under `src/app/team-norway` på `origin/main` 22.10 (df49c25b9), skjermkomponentene i
`src/components/team-norway/skjermer/`, og registeret
[tn-trenerflate-register-2026-10-21.md](tn-trenerflate-register-2026-10-21.md). Kartlagt fra koden, ikke sett
i nettleser (krever innlogget trener mot basen). Det er punkt 2 i planen under.

Kolonnene: **Ny flate** = bygget i den nye trenerflaten (pakke a–d, i main). **Skrå** = har bildetoppen
(`TnSkraTopp` eller `tn-iup-topp`). **WF** = wireframe (1 = utkast 1, 2 = utkast 2).

| Skjerm | Adresse | Ny flate | Skrå | WF | Svakt i designet i dag |
|---|---|---|---|---|---|
| Hjem › I dag | `/team-norway` | ja | egen topp | 1 | Mange like kort; «Saker som venter» konkurrerer med samling og turnering om å være hovedtall |
| Hjem › Gruppeposter | `/[groupId]` | delvis | ja | — | Tidslinjen er smal kolonne på 1920; ingen tom-tilstand i komponenten |
| Hjem › Dokumenter | `/[groupId]/dokumenter` | delvis | nei | — | Ingen bildetopp; filliste uten tom-tilstand |
| Min profil | `/profil` | ja (b) | ja | 1 | — |
| Spillere | `/spillere` | ja (c) | ja | 1 | Ingen loading per side; delt `loading.tsx` på roten |
| Spillere › Skoler | `/skoler` | nei | ja | — | Gruppert liste uten hovedtall |
| Spillere › College og USA | `/college` | nei | nei | — | Ingen bildetopp |
| IUP › Oversikt | `/spiller/[id]` | ja (d) | ja | 1 | — |
| IUP › Turneringsplan | `/spiller/[id]/turneringsplan` | delvis | ja | 2 | Planleggeren har eget uttrykk; mangler ett hovedtall over |
| IUP › Ranking | ny | nei | — | 2 | Finnes ikke |
| IUP › Turneringer | ny | nei | — | 1 | Finnes ikke; data ligger i gamle `/profil` |
| IUP › Trening | ny (`workbench?spiller=`) | nei | — | 2 | Finnes ikke; Workbench er 894 linjer med egen skall-logikk |
| IUP › Tester | `/spiller/[id]/tester` | delvis | ja | 2 | Lang liste uten «X av N» øverst; «Utvikling» ligger i egen gammel side |
| IUP › Teknisk plan | `/spiller/[id]/teknisk-plan` | delvis | ja | 2 | Ingen før og nå side om side; knappetekst sier ikke «Foreslå» |
| IUP › Fireukerssjekk | `/spiller/[id]/evaluering` | nei | via IUP-topp | 2 | Gammel side (107 linjer) uten trenerkommentar |
| Samlinger | `/samlinger` | nei | ja | 2 | Årshjul og liste uten hovedtall (dager til neste) |
| Månedsplan | `/manedsplan` | nei | ja | 2 | Kalender bryter ikke til liste på 390 i dag; må måles |
| Fellestesting | `/fellestesting` | nei | ja | 2 | «X av N» per deltaker mangler som hovedtall |
| Gruppeanalyse | `/analyse` | nei | ja | 2 | Har egen `maxWidth` (brudd på full bredde) |
| WANG-tester | `/wang-resultater` | nei | ja | 2 | Ikke i menyen før pakke a; «Ingen tilgang» må være egen tilstand |
| Turneringer | `/turneringer` | nei | ja | 2 | Ingen frist-sortering |
| Live Watch | `/live-watch` | nei | nei | 2 | Ingen bildetopp; ingen «oppdatert kl.» |
| Uttak | `/uttak` | nei | ja | 2 | Kriterium 3 (1–5) mangler i skjermen |
| Rangliste | `/rangliste` | nei | ja | 2 | — |
| Referanse › WAGR | `/referanse` | ja | ja | 1 | — |
| Referanse › Sammenlign, Søk, Planlegger, Norsk golf, HCP Norge | nye | nei | — | 2 | Finnes ikke; data må inn i basen (registeret B2–B11) |
| Referanse › Tester | `/referansenivaer` | nei | ja | 2 | Viser «beste» per test (skal bort, B13) |
| Årsplan | `/workbench` | nei | ja | 2 | Stor egen side; perioder ikke som bånd |
| Testprotokoller | `/protokoller` | nei | ja | 2 | — |
| Fagapparat | `/fagapparat` | nei | nei | 2 | Ingen bildetopp |
| Lisens og status | `/lisens-okonomi` | nei | ja | 2 | Adressen heter fortsatt økonomi |
| Trenere og tilgang | `/tilgang` | nei | nei | 2 | Egen gammel skall-bygging; ingen bildetopp |
| Inviter spiller | `/inviter` | nei | nei | 2 | Gjenbruker admin-skjerm |
| Data Golf | `/datagolf` | nei | delvis | 2 | Bare ADMIN, uendret |

Tverrgående svakheter:

1. **Tom, laster og feil:** hele `/team-norway` har bare tre `loading.tsx`/`error.tsx` (roten, `tilgang`,
   `[groupId]`). Andre skjermer viser rotens laster, som ikke ligner skjermen. Tom-tilstand mangler i bl.a.
   dokumenter, gruppeposter, fellestesting, testprotokoller og trenerprofil.
2. **Ett hovedtall:** bildetoppen er der på de fleste sider, men ofte uten tall. Utkast 2 gir hver skjerm ett.
3. **Full bredde:** `tn-analyse-visning`, `tn-gruppe-visning`, `tn-iup-laast-visning` og
   `tn-oversikt-skjerm` har egne `maxWidth`. På 1920 skal kortene bli flere kolonner, ikke bredere linjer.
4. **Bevegelse:** TN har ingen innkomst-bevegelse på kort eller faner i dag. `prefers-reduced-motion` er
   håndtert i åtte stilark, så grunnmuren er der.
5. **Seks sider uten bildetopp:** dokumenter, college, live-watch, fagapparat, tilgang, inviter.

## 2. Planen (prioritert)

| # | Steg | Ferdig når |
|---|---|---|
| 1 | **Utkast 2 sett av Anders** (port 7, eller Claude på hans vegne etter nattregelen): de 31 skjermene i `utkast-2.html`. | Anders har sagt ja, eller rettelsene er tegnet inn. |
| 2 | **Se dagens skjermer i nettleser** med demotrener i 390, 1280 og 1920, og legg skjermbilder ved registeret. | Hver rad i tabellen over har skjermbilde, og påstandene om 390 (særlig Månedsplan) er bekreftet eller rettet. |
| 3 | **Felles tilstander:** én tom-, laster- og feilkomponent for TN etter «Tom, laster og feil» i utkast 2, og `loading.tsx` per hovedpunkt. | Alle seks hovedpunkter har egen laster i skjermens form, og et søk etter skjermer uten tom-tilstand gir 0. |
| 4 | **IUP-fanene** (kodeøkta, én PR per fane): Turneringer, Ranking, Trening, Tester med «X av N», Teknisk plan, Fireukerssjekk, Turneringsplan. | Alle åtte fanene finnes, gamle adresser sender videre, og hver fane er målt i 390/1280/1920 uten sidelengs rulling. |
| 5 | **Samlinger og testing** og **Turneringer** etter utkast 2: hovedtall i bildetoppen, uttak med kriterium 3 (1–5), Live Watch med «oppdatert kl.». | Ni skjermer har hovedtall og bildetopp; testen for kriterium 3 låser 1–5. |
| 6 | **Fag og administrasjon** etter utkast 2: bildetopp på fagapparat, tilgang og inviter; Årsplan med periodebånd. | Ingen TN-side mangler bildetopp. |
| 7 | **Referanse resten**, etter at dataene er i basen (registeret B2–B13, beslutningen punkt 5): Sammenlign og Søk først (data finnes), så Planlegger, Norsk golf, HCP Norge. Referanse › Tester uten «beste». | Tallene er de samme som på teamnorwayref for samme uke, med kilde og dato. |
| 8 | **Full bredde rydding:** fjern de fire `maxWidth` i TN-skjermene, unntatt løpende tekst og dialoger. | Et søk etter `maxWidth` i `src/components/team-norway/skjermer` treffer bare tekst og dialoger, og skjermene er målt i 1920. |
| 9 | **Bevegelse:** kort glir inn ved første visning, faner bytter uten hopp, med TN-tidene og `prefers-reduced-motion`. | Bevegelsen er lik på alle hovedpunkter og slås av med «reduser bevegelse». |
| 10 | **Hjem-fanene og Spillere-fanene** som mangler wireframe (Gruppeposter, Dokumenter, Skoler, College og USA): tegnes i utkast 3 når 1–6 er gjort. | Utkast 3 finnes og er målt. |

## 3. Wireframes: hva finnes, hva mangler

**Utkast 2 dekker (31):** IUP › Turneringsplan, Ranking, Trening, Tester, Teknisk plan, Fireukerssjekk ·
Samlinger og testing › Samlinger, Månedsplan, Fellestesting, Gruppeanalyse, WANG-tester · Turneringer ›
Turneringer, Live Watch, Uttak, Rangliste · Referanse › Sammenlign, Søk, Planlegger, Norsk golf, HCP Norge,
Tester · Fag og administrasjon › Årsplan, Testprotokoller, Fagapparat, Lisens og status, Trenere og tilgang,
Inviter spiller, Data Golf · Referanse › WAGR, visningene Turneringer og Sesong · PlayerHQ › «Se hva Team Norway ser» · Tom, laster og feil (med låsen som gjelder alle åtte IUP-fanene). IUP › Turneringer står i utkast 1.

**Mangler fortsatt (steg 10):** Hjem › Gruppeposter og Dokumenter, Spillere › Skoler og College og USA,
og undersidene (én samling, én turnering, én testprotokoll, én test, én teknisk oppgave, scorekort for føring).

**Kodeøkta kan bygge etter nå** (data finnes i HQ): IUP › Tester, Teknisk plan, Fireukerssjekk, Trening,
Turneringer, Turneringsplan; alle i Samlinger og testing, Turneringer og Fag og administrasjon; Referanse ›
Sammenlign, Søk og Tester; WAGR-visningene Turneringer og Sesong; PlayerHQ › «Se hva Team Norway ser». **Venter på data:** IUP › Ranking (WAGR per uke er i basen fra 22.10, NGF-junior
«—»), Referanse › Planlegger, Norsk golf og HCP Norge (pipelines må skrive til basen først).

## 4. Åpne spørsmål til Anders

1. **Hovedtall på IUP › Tester:** prioriterte tester tatt («7 av 11») eller siste testdag? Anbefaling: «7 av 11»,
   fordi det sier hva spilleren mangler før neste samling.
2. **Trenerkommentar i Fireukerssjekk:** skal treneren kunne skrive en kommentar spilleren ser i PlayerHQ?
   Anbefaling: ja, som en post til spilleren (samme lesekvittering som gruppeposter), ikke et eget felt.
3. **Live Watch:** automatisk oppdatering hvert minutt, eller knappen «Oppdater»? Anbefaling: knappen, så radene
   ikke flytter seg mens treneren leser.

Avgjort av Anders 22.10 (registreres i beslutningene av kodeøkta): PlayerHQ-lenken går til «Se hva Team Norway ser»,
og «beste» tas bort i Referanse › Tester. Utkast 2 er tegnet slik: Referanse › Tester viser bare median og antall.
