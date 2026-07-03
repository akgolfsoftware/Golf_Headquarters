# Mesterens prosess — beslutningshierarki, kritikk og craft

Hvordan en master med 50 års erfaring faktisk jobber. Ikke flere regler — riktig rekkefølge på dommene.

## Beslutningshierarkiet (arbeid alltid ovenfra)

1. **Jobben** — hva skal brukeren oppnå, og kan de lese det på 5 sekunder? Feil her gjør alt under verdiløst.
2. **Flyten** — færrest mulige steg til jobben er gjort. Kutt steg før du polerer steg.
3. **Hierarkiet** — ett fokuspunkt per skjerm. Hva ser øyet først, og er det riktig?
4. **Komposisjonen** — hvilke designsystem-komponenter, i hvilken struktur. Gap meldes, aldri improviseres.
5. **Craft** — optikk, rytme, motion, mikrodetaljer.

Jernregel: **aldri løs nivå N med nivå N+1.** En feil flyt kan ikke poleres frisk; en rotete skjerm fikses ikke med bedre skygger. Når noe «føles galt», gå ETT nivå opp fra der du jobber — feilen bor nesten alltid der.

## Kritikk-passene (kjør i rekkefølge på alt du lager eller vurderer)

1. **Squint-testen:** mys mot skjermen. Står hierarkiet fortsatt? Ser du fokuspunktet som lysere/større masse?
2. **5-sekunderstesten:** hva forstår en fersk bruker på 5 sekunder? For coach-flater: tilstand på 5, årsak på 30.
3. **Tilstandspasset:** hover, focus, disabled, loading, empty, error, drag-over. Mangler én: skisse, ikke komponent.
4. **To-modus-passet:** dark og light side ved side. Light skal holde identisk nivå, aldri være en blek eksport.
5. **Tommel-passet:** 390px, én hånd. Primærhandling i tommelsonen, mål ≥ 44px, ingen presisjonskrav under bevegelse (rep-logging skjer med svette hender).
6. **Språkpasset:** klarspråk-verdier i spiller-/foreldreflater, fagkoder kun hos coach. Alle tall med enhet og retning.

Kritikk leveres alltid som: hva som virker → det viktigste problemet med hvorfor (koblet til hierarkinivå) → konkret løsning. Aldri en liste av tjue småting uten prioritet.

## Tradeoff-dommene (når to gode prinsipper kolliderer)

- **Tetthet vs. ro:** coach-flater tåler Linear-tetthet; spiller- og foreldreflater prioriterer ro. Samme data, to komposisjoner — aldri samme skjerm gjenbrukt rått på tvers.
- **Konsistens vs. lokal forbedring:** konsistens vinner i flaten. Forbedringen fremmes som systemendring i designsystemet, ellers forkastes den.
- **Hastighet vs. delight:** opplevd hastighet ER delight i arbeidsverktøy. Motion skal forklare (hvor kom dette fra, hvor ble det av), aldri underholde. Er animasjonen svaret på et «hvor»-spørsmål: behold. Ellers: kutt.
- **Informasjon vs. handling:** når begge kjemper om plassen vinner handlingen hos spiller (de skal GJØRE), informasjonen hos coach (de skal DØMME).

## Craft-detaljene som skiller 9 fra 10

- **Optisk over geometrisk:** ikoner og trekanter sentreres optisk, ikke matematisk. Store display-tall henger på baseline-rytmen, ikke boksens senter.
- **Typografisk rytme:** linjeavstand og vertikal spacing på 8pt-rytme; brødtekst 45–75 tegn per linje; tabular-nums på ALT som sammenlignes i kolonner.
- **Tall-craft:** display-tall semibold, enhet 40–50 % størrelse i muted ved siden av, aldri på egen linje.
- **Motion-budsjett:** 150–250 ms ease-out, én bevegelse per hendelse, respekter prefers-reduced-motion. Skeleton over spinner, alltid.
- **Kant-disiplin:** elevation gjennom lyshet (dark) eller myk skygge (light) — border kun der den er semantisk (akse-farge, live-tilstand).
- **Luft er hierarki:** dobling av avstand mellom grupper slår en skillelinje. Skillelinjer er siste utvei.
