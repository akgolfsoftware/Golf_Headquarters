# Paper-mønstre for skjermer uten egen fasit

**Skrevet:** 2026-08-04 (Fase 1, designport steg 7–8) · **Status:** UTKAST — venter på Anders' godkjenning
Eneste designkilde når fasit-HTML mangler. Alle verdier er sitert fra `designsystem/paper/fase1/` + `guidelines/`. Ved konflikt med en faktisk fasit-fil vinner fasit-filen. Dekker ikke mønsteret? → STOPP og spør Anders.

## 1. Grunnlayout
- **Desktop-skall:** `grid-template-columns: 64px minmax(0,1fr) <panel>` med `height:100vh` (alle `agencyos-*.html`). Rail alltid 64px, alltid mørk (`--rail #141413`), knapper 56px brede med 19px ikon + 9.5px etikett (agencyos-konsoll-desktop.html).
- **Artefaktpanel:** 380px (konsoll, innboks, spillere) · 360px (playerhq-chat-desktop) · 340px (kalender, workbench høyrepanel). Ny skjerm: bruk **380px** for AgencyOS, 360px for PlayerHQ. Innstillinger har i stedet sidenav 268px (agencyos-innstillinger.html).
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
- Navigasjon: AgencyOS fem flater i rail = **Konsoll · Innboks · Spillere · Kalender · Workbench** (+ sekundære rail-lenker AgenticOS/Økonomi/Innstillinger/Tema) — samme fem som bunnfaner på mobil. PlayerHQ fire faner: **I dag · Plan · Analyse · Meg**. Alt annet via chat eller ⌘K/«Alt»-ark.

## 7. Forbud
- Null hex utenfor tokens · null hardkodet px-spacing (unntak: 1px kanter, begrunnede layout-mål med kommentar) (KONTRAKT §2).
- Maks én `.btn.now`; aldri aksent som dekorasjon (KONTRAKT §3). Aldri sperre-tekst — anbefalinger, «be Anders …»-vei videre (FASE-1.md §3–4, CLAUDE.md invariant 1).
- Norsk bokmål i UI; tall med enhet OG retning, norsk desimalkomma, brutto score (KONTRAKT §7).
- Aldri style en annen komponents element fra egen fil (komponentskjelett.md, bindende). Ingen `vw/vh` i komponenter — `cqi/cqb` (komponentskjelett.md).
- Demo-stillas (`data-demo-only`, `.state-switch`, `.phone`-ramme, ankret klokke) skal ikke porteres (FASE-1.md «Demo-stillas som skal ut»).

## Uavklart (sprik mellom filene — spør Anders før det bygges på disse punktene)
- **Artefaktpanel-bredde:** 380 vs 360 vs 340px — fasitene varierer per skjerm; ingen fil utroper én kanon. Arbeidsregel over (380 AgencyOS / 360 PlayerHQ) er et forslag, ikke fasit.
- **Trådbredde:** `74ch` (AgencyOS konsoll) vs `720px` (PlayerHQ chat) — to målestokker for samme rolle.
- **Nav-navn:** KONTRAKT §10 sier «Konsoll · Kø · Spillere · Kalender · Maskinrom»; fasit-filene bruker Innboks/Workbench; kodeordre-agencyos.md §7 sier «Hjem, Kø, Stall, Kalender, Workbench, Alt». Fasit-HTML er nyest — følg den, men avklar med Anders før ny nav bygges.
- **Demodata:** KONTRAKT §8 sier Emma Sæther m.fl.; alle 20 fasit-filer bruker Øyvind Rohjan (navne-kanon 2026). Følg Øyvind Rohjan.
- **Mobilbredde skjermbilder:** fasit-rammen er `.phone` 430×932px; skjermbilde-gaten bruker 390px viewport (FASE-1.md-målingene ble kjørt på 390px). Skjermbilder tas på 390px per gate-regelen.

Kilder: `fase1/KONTRAKT.md`, `fase1/FASE-1.md`, `fase1/_foundation.css`, alle `fase1/*.html` (skannet for skall/`.btn.now`/`.phone`), `guidelines/gulvregel.md`, `guidelines/komponentskjelett.md`, `guidelines/klasseinventar.md`, `guidelines/kodeordre-agencyos.md`.
