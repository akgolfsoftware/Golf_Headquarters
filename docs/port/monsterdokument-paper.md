# Paper-mønstre for skjermer uten egen fasit

**Skrevet:** 2026-08-04, utvidet og godkjent 2026-08-05 (Fase 1, designport steg 7–8) · **Status:** GODKJENT — eneste designkilde for de 318 skjermene uten fasit. §1–7 fra 04.08, §8–12 (skjema/tabell/filter+paginering/dashbord/detaljside) tilføyd 05.08. De fem punktene som sto i Uavklart er alle lukket (se bunnen) — bygg videre uten å spørre per skjerm, med mindre en ny skjerm avdekker et mønster dokumentet ikke dekker (da: STOPP og spør Anders, samme regel som før).
Eneste designkilde når fasit-HTML mangler. Alle verdier er sitert fra `designsystem/paper/fase1/` + `guidelines/`. Ved konflikt med en faktisk fasit-fil vinner fasit-filen. Dekker ikke mønsteret? → STOPP og spør Anders.

## 1. Grunnlayout
- **Desktop-skall:** `grid-template-columns: 64px minmax(0,1fr) <panel>` med `height:100vh` (alle `agencyos-*.html`). Rail alltid 64px, alltid mørk (`--rail #141413`), knapper 56px brede med 19px ikon + 9.5px etikett (agencyos-konsoll-desktop.html).
- **Artefaktpanel (Anders 2026-08-05, LÅST):** 380px for AgencyOS, 360px for PlayerHQ på enhver ny skjerm uten egen fasit. Fasitfilene varierer (380px konsoll/innboks/spillere, 360px playerhq-chat-desktop, 340px kalender/workbench høyrepanel) — der en konkret fasit sier noe annet enn 380/360, følg fasiten for den skjermen. Innstillinger har i stedet sidenav 268px (agencyos-innstillinger.html).
- **Tråd/hovedkolonne:** sentrert med `max-width:74ch` (agencyos-konsoll-desktop.html `.tw`) eller `max-width:720px` (playerhq-chat-desktop.html `.tw`, `.cwrap`). Composer nederst i midtkolonnen (`border-top:1px solid var(--border); background:var(--surface)`), tråden scroller internt (`.stage` må ha `min-height:0`, dokumentert i kommentar i konsoll-desktop).
- **Enhetsbånd (kommentar i agencyos-konsoll-desktop.html):** ≥1181px = tre kolonner · 641–1180px = rail 64 + tråd, artefaktpanel blir bunn-ark (`transform:translateY(100%)`, `max-height:88vh`, grab-håndtak 36×4px) · ≤640px = egen mobilfil med bunnfaner.
- **Mobil:** telefonramme 430×932px (demo-stillas, fjernes ved integrasjon — FASE-1.md). Bunnfaner `repeat(5,1fr)` på mørk `--rail`, aktiv fane får 2px topplinje; composer fast rett over fanene; alt fast bunnfestet bruker `env(safe-area-inset-bottom)` (KONTRAKT §4).

## 2. «Én ting nå»
- Komponent: `.btn.now` — accent-fylt `var(--accent)` (#D97757), `min-height:var(--tap-lg)` 48px, vekt 600. **Nøyaktig én per skjermtilstand** (KONTRAKT §3), med HTML-kommentar rett over som begrunner valget.
- Blokka: `.nowblock` — `background:var(--accent-soft)` + `border-left:3px solid var(--accent)` («kanten er komponentens signatur», konsoll-desktop). Tekst: Poppins-tittel 14.5px + Lora-forklaring 14px `max-width:52ch` + `.btn.now`. Handling muterer faktisk tilstand + angre-nedtelling 10 s (FASE-1.md §1).
- Aksent ellers KUN: fokusring, logoprikk, `--accent-soft`-flate. Aldri på badges, tall, statuspunkter (KONTRAKT §3).
- **Mobil-unntak:** på chat-mobilflatene eier mikrofonen aksenten (`.btn.now.mic`, 60px `--tap-capture`, pill) og godkjenn blir `.btn.ink` (FASE-1.md §2). Clay-monopol håndheves i DOM: åpent fangst-ark demoterer composer-mikrofonen til blekk (agencyos-konsoll-mobil.html).

## 3. Typografi
- Poppins = `--disp`/`--ui` (UI, titler) · Lora = `--body` (prosa/AI-svar: `.prose` 14.5px/1.62; `.msg` 15px) · IBM Plex Mono = `--mono` (alle tall `.num` med tabular-nums, `.eyebrow` 10px versaler tracking .09em) (_foundation.css).
- Størrelser: body-base 13.5px (AgencyOS) / 14px (PlayerHQ) · topplinje-tittel 15px Poppins 600 (`.top h1`/`.top .title`) · `--text-title` 22px · `--text-kpi` 40px mono · tabell-headere mono 10px versaler · knapper 13px (_foundation.css + fasit-filene).

## 4. Farger/flater (tokens, aldri hex i skjerm-CSS)
- Flater: `--bg #faf9f5` (canvas) · `--surface #ffffff` (kort) · `--soft #f0eee6` (sekundær) · `--border #e8e6dc` · `--hairline #d1cfc5`. Tekst: `--fg #141413` · `--muted #5e5d59` · `--mid #b0aea5` (aldri brødtekst i lys). Handling: `--cta` blekk · `--accent #d97757`. Data: `--up #63784a` · `--dn #a85536` (aldri ren rød) · `--info #46719f`. Mørkt tema finnes i `[data-theme="dark"]` — begge skal virke (_foundation.css).
- Radius: `--r-sm 8` (knapper/chips) · `--r 12` (app-default, kort/composer) · `--r-pill`. Skygge kun `--shadow`. Spacing kun `--s1..--s8` (4/8/12/16/24/32/48/64).

## 5. Komponentmønstre
- Kort: `.panel`/`.artcard` = `--surface` + 1px `--border` + `--r` + `--s4`-padding. Artefaktkort i tråd: navn (Poppins 13.5/600) + `.tag`-status (UTKAST/PUBLISERT) + Lora-beskrivelse + handlingsrad.
- Badges: `.tag` mono 10.5px versaler pill på `--soft`; varianter `.up/.dn/.info` toner kun tekst. Chips: `.chip` pill, `aria-pressed` inverterer til blekk.
- Tom tilstand: `.empty` — `--soft` + stiplet kant, h3 + Lora-forklaring + én handling videre. Laster: `.skel`-pulse i samme form som ekte innhold. Feil: konkret tekst («Modellen svarte ikke innen 30 s. Utkastet ditt er lagret»), aldri «noe gikk galt» (KONTRAKT §6).
- Topplinje: tittel venstre, ⌘K-hint/`.icbtn` 44px høyre, `border-bottom`, sticky. Mobil + `env(safe-area-inset-top)`.
- Tabeller: `.tbl` — mono-versalheadere, 1px radskiller, tall høyrestilt `.n`.
- AI-svar-anatomi: arbeidslinjer (`.steps`, kilde + varighet, kollapset på mobil) → Lora-prosa → `<details>` «Hvorfor dette tallet» (påkrevd uansett flate, FASE-1.md §2) → artefaktkort.

## 6. Interaksjon
- «Lag en skjerm» = **artefakt, ikke ny flate** (FASE-1.md beslutning 3): sidepanel på desktop, bunn-ark på mobil. Ark: `.sheet` + `.scrim`, sveip-ned >80px lukker, dra opp = fullskjerm (`data-full`), `max-height:88vh`.
- Primærhandling/composer bunnfestet på mobil, aldri i scroll-flyt (KONTRAKT §4). Composer-textarea: 15px, min 1 / maks 5 linjer (`max-height:110px` mobil / 180px desktop).
- Alt interaktivt: ≥44px (`--tap`; gulvregel-mekanikk `max(var(--h),var(--floor))`, `::after`-sone når synlig høyde bærer betydning), `data-od-id` i kebab-case, ekte handler — aldri `() => {}` eller `href="#"` (KONTRAKT §5, gulvregel.md).
- Tema-toggle: `localStorage` `akhq-theme-agencyos`/`akhq-theme-playerhq`, respekter `prefers-color-scheme` (KONTRAKT §5). NB: i produksjonskoden er `data-v2-tema`-cookien eneste tema-mekanisme (gotchas.md) — porten kobler Paper-temaet på den, ikke på ny localStorage-nøkkel uten avklaring.
- Navigasjon: **AgencyOS fem flater i rail (Anders 2026-08-05, LÅST): Konsoll · Innboks · Spillere · Kalender · Workbench** (+ sekundære rail-lenker AgenticOS/Økonomi/Innstillinger/Tema) — samme fem som bunnfaner på mobil. Erstatter koden i `src/components/v2/shell.tsx` (i dag Hjem/Stall/Kalender/Kø/Innsikt) når steg 8 bygges. **PlayerHQ fire faner (Anders 2026-08-05, LÅST): I dag · Plan · Analyse · Meg.** «Gjør» utgår som egen fane — gjennomføring (live-økt/runde/test) åpnes fra Hjem eller Plan. Alt annet via chat eller ⌘K/«Alt»-ark.

## 7. Forbud
- Null hex utenfor tokens · null hardkodet px-spacing (unntak: 1px kanter, begrunnede layout-mål med kommentar) (KONTRAKT §2).
- Maks én `.btn.now`; aldri aksent som dekorasjon (KONTRAKT §3). Aldri sperre-tekst — anbefalinger, «be Anders …»-vei videre (FASE-1.md §3–4, CLAUDE.md invariant 1).
- Norsk bokmål i UI; tall med enhet OG retning, norsk desimalkomma, brutto score (KONTRAKT §7).
- Aldri style en annen komponents element fra egen fil (komponentskjelett.md, bindende). Ingen `vw/vh` i komponenter — `cqi/cqb` (komponentskjelett.md).
- Demo-stillas (`data-demo-only`, `.state-switch`, `.phone`-ramme, ankret klokke) skal ikke porteres (FASE-1.md «Demo-stillas som skal ut»).

## 8. Skjemaskjermer / flerstegsflyt
- Komponent: `Stepper` — viser posisjon i en flerstegsflyt: gjennomført (blekkfylt sirkel + hake), gjeldende (2px blekkramme), kommende (dempet). Ingen farge — «et steg er ikke en datasemantikk» (Stepper.jsx).
- **Stigen navigerer ikke.** Ingen `<button>`/`<a>`, ingen tab-stopp — en klikkbar stige lover at brukeren kan hoppe til steg 1 uten å miste utfylt data i steg 3, og det løftet kan komponenten ikke holde. Tilbake skjer via skjermens egen «Tilbake»-knapp (Stepper.prompt.md).
- Gjeldende steg annonseres to veier: `aria-current="step"` på `<li>` **og** en skjult setning «Steg 2 av 5 · pågår»/«· fullført» (Stepper.jsx, Stepper.prompt.md).
- Bruddpunkt: `@container (max-width:520px)` — stigen legger seg loddrett, forbindelsesstrekene forsvinner; i et `Panel` svarer det til ~556px i spalten (Stepper.jsx). `compact` skjuler etiketter, viser kun nummererte sirkler (Stepper.d.ts).
- Grense mot naboer: `Pagination` = posisjon i et datasett uten meningsbærende rekkefølge · `ProgressBar` = kontinuerlig, navnløs andel · `ProgramLadder` = varig utviklingsmodell over måneder, ikke én flyt (Stepper.prompt.md).
- **Uavklart:** feltvalidering, feilmelding per felt og bunnfestet lagre/avbryt-rad er IKKE dekket her — `Stepper` viser kun fremdrift. Sjekk `forms/`-komponentene (`FormField`, `FieldMessage` — nevnt i tidligere handover, ikke lest inn i dette dokumentet) før seksjonen brukes til en skjerm med reell feltvalidering.

## 9. Tabell → kort på mobil
- Komponent: `DataTable` — radsett med flere sammenlignbare kolonner der lesningen går nedover i én kolonne. Er det bare én verdi per rad, er det en liste (`ListRow`/`ListGroup`), ikke en tabell (DataTable.prompt.md).
- **Det finnes intet «tabell blir kort»-mønster i biblioteket.** `DataTable` løser smal bredde ved at `.akhq-dt-scroll` får egen `overflow:auto`, aldri ved å rendre rader om til kort — «rullingen bor i komponenten, aldri på siden» (DataTable.prompt.md). Bruddpunkt `@container (max-width:560px)` strammer kun celleluft (12/10px → 10/8px) og skrift (13px → 12.5px); i PlayerHQs 430px-kolonne er terskelen alltid fyrt (DataTable.jsx).
- `maxHeight` låser høyden og gjør `<thead>` klebrig (`position:sticky;top:0`) for lange lister i panel (DataTable.jsx/.d.ts).
- Tall får alltid `align:"end"` → høyrestilt mono med `tabular-nums` (DataTable.prompt.md). `footNote` (kilde + tidsvindu) ligger utenfor rullecontaineren med hensikt.
- Tilstander: `state="loading"` → skjelettrader i normalt radantall · `state="empty"`/`"error"` → én rad over alle kolonner med ekte norsk tekst. `density`: tett/md/romslig (DataTable.jsx/.d.ts).
- **Bruk denne regelen — ikke «tabell blir kort»:** `DataTable` scroller alltid horisontalt i egen container på smal skjerm. Har en skjerm reelt behov for kort-visning i stedet for tabell, er det en ny komponent/variant, ikke et eksisterende Paper-mønster — spør Anders før noe bygges der.

## 10. Filter og paginering
- **`FilterPills`** — innsnevrer et sett som allerede vises. Flervalg som standard, piller med valgfritt `count`, nullstiller kun synlig når noe er valgt. Valgt pille er blekkfylt, aldri oransje — oransjen har monopol på «Én ting nå» (FilterPills.prompt.md/.jsx).
  - Bruddpunkt `@container (max-width:420px)` strammer gap 8→6px; `scroll={true}` gir vannrett rullende rad når settet ellers bryter over tre linjer.
  - Grense: `Tabs` bytter *hva* du ser, `FilterPills` bestemmer *hvor mye av det samme*. `SegmentControl` er eksklusivt ett-valg — er du i tvil mellom den og `multiple={false}`-pills, bruk `SegmentControl`. `Chip` beskriver ett objekt, ikke et sett.
- **`Pagination`** — sidevis navigasjon i et sett for stort for én side. Vindu: første, siste, gjeldende + én nabo hver side, `…` for utelatelser (Pagination.jsx/.prompt.md).
  - **Bindende: når paginering IKKE skal brukes.** Uendelig liste/«hent flere» slår paginering på en stall, en øktliste, en kø — alt som leses som «hva finnes» fremfor «hva står på side 4». Test: kan raden bytte side i morgen uten at noe endret seg for brukeren? Da er sidetallet tilfeldig.
  - Endres filteret, går `page` tilbake til 1. `totalLabel` («248 økter · side 4 av 12») står først. Bruddpunkt `@container (max-width:380px)` skjuler sidetall, viser kun forrige/neste + `totalLabel`; `simple={true}` gjør det permanent.
  - Grense mot `Stepper`: `Pagination` = posisjon i et datasett uten mening, `Stepper` = posisjon i en flyt med mening.

## 11. Dashbord-rutenett
- **`CardGrid`** — selvfyllende rutenett, ingen bredder/media queries på skjermsiden. Standard `minmax(min(280px,100%),1fr)` → 1 kolonne i PlayerHQs 430px-spalte, 3 kolonner i AgencyOS' hovedspalte (CardGrid.jsx/.prompt.md).
  - `min="wide"` → fra 360px, for kort med graf/tabell. `columns={2|3}` kun når antallet er en bevisst beslutning (skal stå side om side uansett), ikke en tilpasning. Bruddpunkt `@container (max-width:420px)` strammer gap `--s4`→`--s3`.
  - **Ingen fast «N kort ved X px»-tabell finnes** — `auto-fill` regner selv ut kolonnetall mot faktisk containerbredde. Ikke slå opp et tall, regn det per skjerm.
- **`KpiStripe`** — horisontal KPI-stripe med hairline-skillere, 2–5 KPI-er, brukes i topplinjen på en flate (KpiStripe.d.ts).
  - Desktop: kolonneflyt, 1px venstre-border mellom celler. Bruddpunkt `@container (max-width:520px)` bytter til stables med toppstrek i stedet for venstrestrek. Verdi: mono 18px/600 tabular-nums; delta i `--up`/`--dn`. Tilstander `content|empty|loading|error`, fast høyde 72px.

## 12. Detaljside-anatomi
- **`PageHeader`** eier sidens `<h1>`: kicker → h1 → ingress (venstre), metadatalinje → handlinger bunnjustert (høyre) — samme mønster på alle ~66 skjermer med sidehode (PageHeader.prompt.md/.jsx).
  - Tittel `clamp(26px,4cqi,32px)` målt mot **containeren** (`cqi`), ikke viewport — bevisst, så PlayerHQs 430px-spalte på en bred skjerm ikke holder desktop-størrelse. Ingress Lora 14.5px, `max-width:52ch`, `--muted`. `meta` mono 11px/500 over knappene.
  - `actions`: maks 3, maks 1 primær (komponenten varsler ved brudd). Fjerde handling → `DropdownMenu`.
  - Bruddpunkt `@container (max-width:640px)`: sideklyngen går fra bunnjustert/auto-bredde til venstrejustert/full bredde under tekstblokken, handlinger wrapper.
  - `level={2}` kun når visningen bevisst ikke eier dokumentets h1 (inspektørpanel, master-detalj-detaljside) — aldri to synlige h1 samtidig. Skjulte tilstander ut av a11y-treet med `display:none`/`hidden`, aldri `opacity:0`.
- **`Panel`** er standardflaten under detaljinnhold: `--surface` + 1px `--border` + `--r` + `--shadow`. `action`: **én** ting maks — aldri to knapper eller primærknapp+lenke. `flush` for rader til kant, `bleed` i tillegg for fullbredde-graf/tabell. Bruddpunkt `@container (max-width:480px)` stabler hodet. Ingen egen `state`-prop — tomtilstand på panelnivå er `EmptyState` i body.
- **`KeyValueGrid`** — label/verdi-par for spesifikasjoner/metadata, `<dl>`, nøkkel `--muted`, verdi mono tabular-nums.
  - **Bindende avgrensning:** KUN enkle nøkkel/verdi-par. IKKE for resultatregnskap med hierarki, budsjettavvik med fargekodet prosent, eller kontobevegelser med sortering — bruk `DataTable`/kommende `LedgerTable` der. Test: har raden innbyrdes struktur eller semantisk farge på verdien, er det ikke `KeyValueGrid`.
  - `columns={2}` i bredt panel, `1` i sidespalte, container legger selv om under `@container (max-width:420px)`. `layout="stack"` for lange verdier. `dividers={false}` for korte sett (≤3 par).
  - Sammensatt mønster: `SectionHeader` (tittel + `count` + valgfri `action`-lenke) over en gruppe `Panel`-er, hver med `KeyValueGrid` inni.
- **404/feilside: ingen egen komponent finnes.** `EmptyState` er eksplisitt IKKE ment for «ikke bygget ennå»/routing-feil — kun for legitim, permanent, brukervendt datatilstand («ingen data ennå»). Trenger en skjerm å si noe til en ekte bruker om en manglende rute: bruk `Banner tone="info"` skrevet som driftsmelding, ikke en oppdiktet «ComingSoon». En reell 404 (ruten finnes ikke) er udekket i Paper-biblioteket.

## Uavklart (spør Anders før det bygges videre på dette punktet)
- **Skjemavalidering/lagre-linje (§8):** eneste gjenstående hull — ikke dekket av noen lest komponent. Trenger en gjennomgang av `forms/`-mappen (`FormField`, `FieldMessage` m.fl.) før §8 kan si noe konkret om feilmeldinger og bunnfestet lagre/avbryt-rad. Blokkerer kun skjemaskjermer med reell feltvalidering — resten av dokumentet gjelder uavkortet.

**Løst 2026-08-05 (Anders' godkjenning):** PlayerHQ-nav (fire faner, §6) · AgencyOS-rail-navn (Konsoll · Innboks · Spillere · Kalender · Workbench, §6) · artefaktpanel-bredde (380 AgencyOS / 360 PlayerHQ, §1, nå fasit ikke forslag) · trådbredde (74ch AgencyOS / 720px PlayerHQ beholdes som to mål, §1) · demodata (Øyvind Rohjan) · mobilbredde skjermbilder (390px, per skjermbilde-gaten).

Kilder: `fase1/KONTRAKT.md`, `fase1/FASE-1.md`, `fase1/_foundation.css`, alle `fase1/*.html` (skannet for skall/`.btn.now`/`.phone`), `guidelines/gulvregel.md`, `guidelines/komponentskjelett.md`, `guidelines/klasseinventar.md`, `guidelines/kodeordre-agencyos.md`, `designsystem/paper/components/layout/{Stepper,FilterPills,Pagination,CardGrid,PageHeader,KeyValueGrid}.{jsx,prompt.md,d.ts}`, `designsystem/paper/components/data/{DataTable,KpiStripe}.{jsx,prompt.md,d.ts}`, `designsystem/paper/components/feedback/EmptyState.prompt.md`, eksempelkort `datatable.card.html` · `pageheader.card.html` · `sectionheader-keyvaluegrid.card.html`.
