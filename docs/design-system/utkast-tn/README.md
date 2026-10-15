# Team Norway i nytt design — utkast

Status: **alle sju pakker er tegnet (utkast 1, 14.10.2026), 41 skjermer. Aksefargene er godkjent av Anders 14.10 («Ja til aksefargene»). Resten venter på port 7.**
Samleside: https://claude.ai/artifact/RvAJbY7rCZvBvf4mfBTftF (`index.html`).
Gjelder trenerskjermene under `/team-norway/*`. Spilleren bruker PlayerHQ (§ÉN IUP OG ETT TESTBATTERI).

Bakgrunn: Claude Design stenger 14.12 og prosjektet «Team Norway App» ble aldri laget. Anders godkjente 14.10 at
Team Norway tegnes i repoet som HTML-utkast publisert som private Artifacts, samme metode som
[PlayerHQ-utkastene](../utkast-playerhq/README.md). Anders går gjennom alt samlet til slutt (port 7).

Designspråket: `.claude/rules/beslutninger.md` §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK og
`src/styles/team-norway-tokens.css`. Jost i overskrifter, Lato i tekst, IBM Plex Mono på tall. Hjørner 0 · 2 · 4.
Ingen skygger, ingen sirkler, kvadratisk avatar. Navy sidemeny `#012B5D` med hvit tekst og rød markør.
Rød `#D70232` er identitet, aldri status og aldri akse.

## Kjernekravet fra Anders

Alt i Team Norway-skjermene, også pyramiden FYS · TEK · SLAG · SPILL · TURN, har Team Norway-designets farger.
Ingen AK Golf-farger (rust `#9B2415`, sand, AK-aksefargene), og pyramiden er ikke bare flaggets rød, hvit og blå.

### Aksefargene (godkjent 14.10)

| Akse | Fyll (hvit tekst) | Lys (på navy) | Tint (bakgrunn) | Hvit på fyll | Fyll på tint | Lys på navy |
|---|---|---|---|---|---|---|
| FYS Fysisk | `#0D6E6A` fjord | `#6FD3C9` | `#E2F2F0` | 6,1 | 5,3 | 7,9 |
| TEK Teknisk | `#0A5199` (TN navy-600) | `#8DBDF0` | `#E3ECF6` | 7,9 | 6,6 | 7,1 |
| SLAG Golfslag | `#4B3F9E` indigo | `#B9B0F2` | `#ECEAF8` | 8,4 | 7,1 | 7,0 |
| SPILL Spill | `#8A2A72` plomme | `#EBA3D8` | `#F6E6F1` | 7,9 | 6,6 | 7,2 |
| TURN Turnering | `#A80126` (TN red-700) | `#FF9CB0` | `#FCE3E8` | 7,8 | 6,4 | 7,1 |

Kontrast etter WCAG 2.1, alle over 4,5 : 1. Fargene er laget av TN-navy og TN-rød: TEK og TURN er palettens egne
toner, SPILL er navy blandet med rød, og FYS og SLAG ligger i samme dybde på hver side. Aksenavnet står alltid ved
fargen, så fargen er aldri eneste bærer. TURN blir i mørk rød (Anders 14.10). Statusrød vises alltid med ordet ved seg.

## Slik lages en skjerm

1. Ny fil i denne mappen, f.eks. `oversikt.html`. Mal: `grunnmur.html`.
2. `felles/tn.css` (tokens, skall, byggeklosser) og egen `<style>` bare for det skjermen trenger.
   Fontene lastes fra Google Fonts i `<head>` (Jost, Lato, IBM Plex Mono).
3. Skjermen ligger i `<template id="skjerm"><div class="app" data-aktiv="oversikt"><main class="innhold">…</main></div></template>`.
   `felles/tn.js` bygger navy sidemeny (PC, 252 px, seks grupper fra `tnHovedmeny`), navy topplinje og bunnmeny
   (mobil: Oversikt · Samlinger · Uttak · Spillere · Mer). Undersider: `data-skall="tilbake" data-tilbake="Spillere"`.
4. `TNUtkast.start({ tom, laster, feil, etter })`. Flere skjermer i én fil: `TNUtkast.start({ skjermer: { id: { mal, … } } })`
   med velger `data-skjerm` og lenker `data-gaa`. Tilstandsvelger `data-tilstand` (data, tom, laster, feil).
5. Kontroll: `NODE_PATH=<hovedrepo>/node_modules node ../utkast-playerhq/kilder/sjekk.js $PWD/oversikt.html <ut>`
   gir skjermbilder og måler sidelengs rulling i 390 og 360 px og JS-feil.
6. Publiser med Artifact: `file_path` = skjermfila, `root` = denne mappen, `files` = `felles/*`.
7. Bare syntetiske data. Ingen ekte spillernavn (mindreårige, §WANG/GFGK-reglene gjelder også her).

## Faste regler i byggeklossene

- Ett stort tall per flate (`.hoved strong`, IBM Plex Mono).
- Farge betyr akse. Grønt, gult og rødt er bare status (`.merke.ok/.vent/.feil`). Info er navy (`.merke.info`).
- Primærknapp navy (`.knapp.pri`), sekundær navy kontur, sletting mørk statusrød (`.knapp.slett`). Aldri logorød på knapper.
- Fylte øktkort i aksefargen (`.okt.fys` osv.), kantete, uten bilder.
- Merker er kantete (2 px), aldri piller med runde ender. Avatar er kvadratisk.
- Flaggstreken (`.flaggstrek`) er det eneste motivet, og brukes sparsomt.
- Kilde og dato der appen påstår noe om en spiller. Estimat merkes (`.merke.kontur`).
- Aldri sidelengs rulling. Ord fra `docs/treningsplanlegging.md`.
- Fagregler som skjermene må følge: Wedge Gate og gate-testene føres som Godkjent eller Bom; 8-ball føres med
  meter fra hullet og «I hull» (5 / 3 / 2 / 1 / 0 poeng), andre PEI-tester med carry og side (vedtak 14.10); Data Golf vises bare for coacher, og TN-menyen har ingen Data Golf-lenke (§KODEGJENNOMGANGEN 06.10).

## Pakkeplan (fase 2, etter ja til aksefargene)

Én fil og én PR per pakke, alle tilstander (tom, laster, feil). Rekkefølgen følger TN-menyen.

| Pakke | Skjermer (rute) | Fil | Status | Lenke |
|---|---|---|---|---|
| 1 Grunnmur | skall 390 og PC, aksefarger, pyramide, øktkort, ukefordeling, graf, knapper, status | `grunnmur.html` | **Utkast 1**, aksefarger godkjent 14.10 | https://claude.ai/artifact/EjcY2cu91S4ydhCCjGWYSE |
| 2 Daglig | Oversikt (`/team-norway`), Samlinger (`/samlinger`, `/samlinger/[id]`), Turneringer og reise (`/turneringer`, `/turneringer/[id]`, `/turneringer/ny`), Live Watch (`/live-watch`) | `daglig.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/8wDaGLGc1mu8awyhGyDVr8 |
| 3 Spillere | Spillerutvikling (`/spillere`), spillerprofil (`/spiller/[id]` med oversikt, analyse, evaluering, teknisk plan, tester og én test), Fellestesting (`/fellestesting`, `/fellestesting/[deltakerId]`), College og USA (`/college`), Skoleoversikt (`/skoler`), WANG-resultater (`/wang-resultater`) | `spillere.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/Gf7q9rdUHQmQZ8cZvfm4MY |
| 4 Uttak | Uttak og kriterier (`/uttak`), Rangliste (`/rangliste`) | `uttak.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/BG1Pn6RHrg9XU3C8FDnGYX |
| 5 Plan og fag | Månedsplan (`/manedsplan`), Workbench (`/workbench`), Testprotokoller (`/protokoller`, `/protokoller/[id]`), Referansenivåer (`/referansenivaer`), Fagapparat (`/fagapparat`), Analyse (`/analyse`), Trenerkatalog (`/apparatet`) | `plan-fag.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/UyH7hFkJVAtUo5Ds68eJFN |
| 6 Gruppe | Gruppeposter (`/[groupId]`), Dokumenter (`/[groupId]/dokumenter`) | `gruppe.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/9yQPdj6UaCUK7fDHfK66wC |
| 7 Meg og admin | Lisens og økonomi (`/lisens-okonomi`), Trenere og tilgang (`/tilgang`), Inviter spiller (`/inviter`) | `admin.html` | **Utkast 1** (14.10), venter på port 7 | https://claude.ai/artifact/FVETdiC9sYtCcxBdc2ZmPZ |
| 8 Samleside | Alle lenker på én side | `index.html` | **Utkast 1** (14.10) | https://claude.ai/artifact/RvAJbY7rCZvBvf4mfBTftF |
| 9 Data Golf | Analyse âº Data Golf, bare for trenere med coach-rollen: DG-01 Oversikt, DG-02 Proffkatalog, DG-03 Proffprofil, DG-04 Topplister, DG-05 Spiller mot proff, DG-06 Innspill-tak, DG-07 Fra funn til forslag, DG-08 Norske proffer, DG-09 Kilde og dekning. Innholdsfasit: `../utkast-agencyos/datagolf.html` og `../datagolf-coach-datakart-og-skjermliste.md` (PR #1340). **Bygges ikke fÃ¸r lisensen er avklart.** | `datagolf.html` | **Utkast 1** (15.10), venter pÃ¥ port 7 og lisens | https://claude.ai/artifact/JYRbsvoVNqrEStsoEfFgFx |

### De 16 rutene uten tegning

Disse finnes i appen, men har ingen tegning i det gamle Claw-registeret (`designsystem/team-norway/handover/SKJERMREGISTER.md`).
De tegnes fra bunnen i pakken over, ut fra dagens kode og vedtakene:

| Rute | Pakke |
|---|---|
| `/team-norway/analyse` | 5 |
| `/team-norway/fagapparat` | 5 |
| `/team-norway/fellestesting/[deltakerId]` (føring per deltaker) | 3 |
| `/team-norway/lisens-okonomi` | 7 |
| `/team-norway/live-watch` | 2 |
| `/team-norway/samlinger` (lista; detaljen var TN-14) | 2 |
| `/team-norway/spiller/[id]/analyse` | 3 |
| `/team-norway/spiller/[id]/evaluering` | 3 |
| `/team-norway/spiller/[id]/oversikt` | 3 |
| `/team-norway/spiller/[id]/teknisk-plan` og `/[planId]` | 3 |
| `/team-norway/spiller/[id]/tester` og `/[testId]` | 3 |
| `/team-norway/turneringer/[id]` | 2 |
| `/team-norway/wang-resultater` | 3 |
| `/team-norway/workbench` | 5 |

Rutene med tegning i Claw (TN-01 til TN-21) tegnes også på nytt: Claw er funksjonsinventar, ikke visuell fasit.

## PR-rekken

Hver pakke er én PR som bygger på den forrige, så diffen bare viser pakken: #1256 grunnmur → #1260 Daglig → #1266 Spillere →
#1268 Uttak → #1271 Plan og fag → #1272 Gruppe → #1274 Meg og admin → samlesiden. Legges inn i den rekkefølgen, etter port 7.

## Åpne spørsmål til Anders (14.10)

Avklart 15.10: spillerprofilen heter IUP i Team Norway (Anders: «For Team Norway skjerm skal det hete IUP som spiller profil»). Avklart 14.10 i main: 8-ball føres med meter fra hullet, poeng 5 i hull, 3 innenfor 1 m, 2 innenfor 2 m, 1 innenfor 3 m, ellers 0.

1. Oversikt: skal gruppas trening fordelt på aksene være med, eller bare de tre tingene den har i dag? (pakke 2)
2. Reise (avreise, overnatting, ansvarlig) på turneringen: koden har ingen felt. Skal det med? (pakke 2)
3. Landslagsnivå per klasse og A–K-nivåtall mangler. Utkastet viser strek der de skulle stått. (pakke 3, 4 og 5)
4. Kriterium 3 «Prosess og adferd» i uttaket har ingen vurderingsmodell. Hvem lager den? (pakke 4)
5. Kjønn i ranglisten venter til delingen virker. Utkastet filtrerer på klasse. (pakke 4)
6. Workbench og Månedsplan for Team Norway: én skjerm eller to? (pakke 5)
7. Fagapparatet (fysio, mental trener) har ingen egen rolle i koden. (pakke 5)
8. Sperren uten foresatt på poster: under 18 eller under 16? (pakke 6)
9. Stipend og budsjett: hvor kommer tallene fra, og skal treneren se dem? (pakke 7)
10. Kan en trener legge til Assist Coach i egen gruppe, eller bare sportssjefen? (pakke 7, B2)
11. Lisens for Data Golf til Team Norway-trenere er ikke avklart. Kundedistribusjon av Data Golf-tall er ikke dokumentert (kontroll 02.10). Pakke 9 er tegnet, men bygges ikke fÃ¸r bruksretten er avklart. (pakke 9)
12. Data Golf-lenken tilbake i Analyse-menyen bare for trenere med coach-rollen; andre TN-trenere ser den ikke. Riktig? (pakke 9)

## Avvik i koden (målt 14.10.2026, ikke rettet)

Bestillingen nevnte fire avvik fra 22.09. Målt på nytt i `src/app/team-norway` og `src/components/team-norway`:

1. **Hardkodede farger: 2, ikke ~150.** Begge i `src/components/team-norway/skjermer/tn-oversikt-skjerm.tsx:27`
   (`#D5E1EE`, `#9FB6D1`). Resten er flyttet til `TN.*` / `--tn-*`. Ingen Train-lock- eller Precision-tokens i TN-kode
   utenom én henvisning i `core.tsx`.
2. **`radius.full` / `--tn-radius-full`: 23 kallsteder** (blant annet `core.tsx:151`, `tn-shell.tsx:238`,
   `tn-post-tidslinje.tsx`, `tn-tilgang-skjema.tsx`, `tn-testdag-scorecard.tsx`, `tn-kontroller.module.css:11`, flere
   `loading.tsx` og `error.tsx`, `workbench/page.tsx:358`, `wang-resultater/page.tsx:93`). Tokenet er satt til 0, så de
   ser riktige ut, men navnet lover en sirkel. Flere av dem er 7 × 7 px prikker som var ment som sirkler.
3. **De fem skjermene som bygget skallet for hånd bruker nå `TnShell`.** `/team-norway` og gruppesidene går gjennom
   `SkjermRamme` (`skjermer/felles.tsx`), `spiller/[spillerId]` og `tilgang` (via `tn-tilgang-visning.tsx`) bruker
   `TnShell` direkte. Skallet er likt; sidemenyen er fortsatt ikke 252 px før `TnRail` rettes.
4. **Delte AK-komponenter inne i TN-flatene:**
   - `src/components/workbench/Trenerforslag` (`TrenerforslagSkjema`) i `src/app/team-norway/workbench/page.tsx:39`.
   - `src/components/workbench/SamlingsprogramKontroll` i `skjermer/tn-samlinger-skjerm.tsx:9`.
   - `src/components/v2/icon` (`Icon`) i `core.tsx:6` og `rail-mobil.tsx:5`. AK-ikonsettet har sirkler og runde ender;
     TN trenger et eget lukket sett på 20 (utkastet bruker `IKON` i `felles/tn.js`).
   Disse arver AK Golfs uttrykk og må få TN-variant eller tokens når skjermene porteres.
5. **Ingen aksefarger i koden.** Pyramiden vises bare som tekst. Aksefargene over må inn i `team-norway-tokens.css`
   (`--tn-akse-*`) og `src/lib/v2/team-norway.ts` når Anders har sagt ja.
