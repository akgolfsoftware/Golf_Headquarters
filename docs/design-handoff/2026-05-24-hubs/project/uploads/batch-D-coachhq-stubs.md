# Claude Design — Batch D · CoachHQ stub-sider

> **Output:** 8 HTML-filer i ZIP. Bruk samme designsystem som forrige bunke (`DvUag24gRqxaxrHzgSaTfg`).
>
> **Kontekst:** AK Golf HQ er PlayerHQ + CoachHQ for et toppidrettsakademi. CoachHQ-sidemenyen er konsolidert til 6 hovedseksjoner: Oversikt · Stall · Planlegge · Gjennomføre · Innsikt · Admin. Disse 8 sidene er stubs som trenger pixel-perfekt design.
>
> **Designspråk (må følges strengt):**
> - **Farger:** Forest `#005840`, Forest dark `#003A2A`, Accent lime `#D1F843`, Lime deep `#BFE933`, Cream `#FAFAF7`, Card `#FFFFFF`, Tint `#F1EEE5`, Ink `#0A1F18`, Muted `#5E5C57`, Border `#E5E3DD`, Warn `#B8852A`, Danger `#A32D2D`, Success `#2C7D52`
> - **Pyramide-farger:** FYS `#005840`, TEK `#1A7D56`, SLAG `#D1F843`, SPILL `#B8852A`, TURN `#5E5C57`
> - **Fonts (Google Fonts):** Inter (body), Inter Tight (display), JetBrains Mono (tabular tall + eyebrows), Instrument Serif italic (hero-aksent-ord)
> - **Radius:** 16px cards, 12px buttons/inputs, 8px chips, 999px pills
> - **Spacing:** 8pt-grid (multipler av 8px)
> - **Ikoner:** Lucide inline SVG kun, 24px default, 1.5-1.75px stroke
> - **CoachHQ-sidebar:** forest `#0F2A22` med lime accent, 240px bred
> - **CoachHQ topbar:** breadcrumb-stil med `CoachHQ / Seksjon / Side`-format
> - **Hero-mønster:** eyebrow (mono) + Inter Tight title med italic accent-ord + sub med dot-separators
> - **Aldri emojis.** Norsk bokmål.
> - **Mobile-first:** iPhone 14 (375px) til desktop (1480px max-width)

## Output-filer

1. `workspace-tildelt-meg.html` — Coach: oppgaver/godkjenninger som er tildelt meg
2. `wagr-import.html` — WAGR CSV-import wizard
3. `plan-templates.html` — Bibliotek av plan-maler
4. `bookinger.html` — Bookings-liste for coach
5. `godkjenninger.html` — Godkjennings-kø
6. `notion-prosjekter.html` — Notion-prosjekter integrert
7. `audit-log.html` — Audit log med filter
8. `settings.html` — Coach-innstillinger hub

Lever som ZIP `coachhq-stubs.zip`. Hver fil under 35KB. Bruk delt CSS hvis det gir mening (eks. `_coachhq-stubs.css` som extender `_tester.css` fra forrige bunke).

---

## Skjerm 1 — `workspace-tildelt-meg.html`

**Rute:** `/admin/workspace/tildelt-meg`
**Seksjon i sidebar:** Oversikt (item 4)

### Brukstilfelle
Coach Anders åpner Workspace → Tildelt meg for å se alle oppgaver/saker som krever hans handling akkurat nå. Dette er en personlig inbox/handlingsliste — IKKE en stall-wide liste.

### Layout (desktop 1280px+)

**Topbar:** `CoachHQ / Oversikt / Tildelt meg`

**Hero:**
- Eyebrow: `COACHHQ · OVERSIKT · TILDELT MEG`
- Title: `Det krever <em>din</em> handling`
- Sub: `<strong>14</strong> ventende saker · <strong>4</strong> overdue · <strong>SLA</strong> snitt 18 timer`
- CTA-rad høyre: "Slå opp i kø" + "Send påminnelse alle"

**KPI-rad (4 celler):**
1. Ventende (featured, dark gradient): `14` · sub: `siden i går: +3`
2. Overdue (rød): `4` · sub: `> 48 timer gammel`
3. I dag (snart due): `7` · sub: `må fullføres i dag`
4. SLA snitt: `18t` · sub: `Mål: < 24t`

**Filter-rad (pills):**
- Type: Alle (14) · Godkjenning (6) · Forespørsel (4) · Notion (2) · Melding (2)
- Sorter: Eldst → Nyeste / Prioritet
- Vis kun: Overdue · I dag · Hele uka

**Hovedliste (oppgave-rader):**

Per rad — grid med:
- Venstre: avatar (24px) + type-badge (PILL: GODKJ / FORESP / NOTION / MELD)
- Midten: tittel (Inter Tight 14px) + meta-linje (mono 11px muted)
- Høyre: alder-pill (rød hvis overdue, oker hvis i dag, grå ellers) + 2-3 quick-actions
- Hover: bg cream + border

Eksempel-rader (vis 14 stk i mockupen, gjenta variasjon):
```
[JK avatar] [GODKJ]   Plan-justering · Julia Karlsen          [3d ↑]  [Avvis] [Godkjenn]
[OB avatar] [FORESP]  Booking-forespørsel · Oliver Brekke     [2d]    [Avvis] [Aksepter]
[NT logo]   [NOTION]  Ny task: "Lag treningsplan for U16"     [1d]    [Åpne]
[MP avatar] [MELD]    Spørsmål om teknisk plan · Markus       [4t]    [Svar]
[SH avatar] [GODKJ]   Klubb-bytte · Sara Hauge                [I dag] [Avvis] [Godkjenn]
```

Hver rad klikkbar → åpner detalj-modal.

**Sidebar høyre (valgfritt) — Daglig brief-card:**
- "AI-foreslår:" 3 forslag for hvordan rydde køen i dag
- Eks: "Behandle Julia + Oliver først — de blokkerer 2 andre tasks"

---

## Skjerm 2 — `wagr-import.html`

**Rute:** `/admin/talent/wagr-import`
**Seksjon:** Stall

### Brukstilfelle
WAGR (World Amateur Golf Ranking) publiserer offisielle juniorranglister. Coach laster opp CSV-fil → systemet matcher mot eksisterende spillere → coach godkjenner sammenkobling → ranking-data lagres til talent-radar.

### Layout

**Topbar:** `CoachHQ / Stall / Talent / WAGR-import`

**Hero:**
- Eyebrow: `COACHHQ · STALL · WAGR-IMPORT`
- Title: `Importer <em>WAGR</em> ranking-data`
- Sub: `Last opp CSV fra wagr.com → match mot stallen → godkjenn`

**Wizard-stepper (3-stegs):**
1. `[✓] Last opp` — done
2. `[2] Match spillere` — active
3. `[3] Bekreft + lagre` — idle

**Steg 2 (vist i mockup):**

**Upload-recap-card (top, slank):**
- Filnavn: `wagr-junior-2026-q2.csv`
- Lastet opp: `23. mai 2026, 14:22`
- Inneholder: `412 spillere · 28 land · Q2 2026`
- "Last opp annen fil"-link

**Filter-row:**
- Bare matchet (38) · Trenger gjennomgang (4) · Ingen match (6)
- Min HCP: slider 0-15
- Inkludér land: NOR · SWE · DEN · FIN (multi-select pills)

**Match-tabell:**

Header: `Stallen` · `WAGR-match` · `Ranking` · `Konfidens` · `Handling`

Rader (vis ~12 stk):
```
[MP] Markus R. Pedersen 18  →  [MP] Markus Roinaas Pedersen NOR  · #284  · 98% [Auto-match]    [Godkjenn ✓]
[JK] Julia Karlsen 19      →  [JK] Julia Karlsen NOR             · #129  · 99% [Auto-match]    [Godkjenn ✓]
[OB] Oliver Brekke 18      →  [OB] Oliver Brekke NOR             · #511  · 100% [PR]            [Godkjenn ✓]
[?]  Sara Hauge 17         →  ⚠ Ingen match · 3 forslag                            [Velg manuelt ▼]
[EG] Emil Grøtnes 18       →  [EG] Emil Grottnes NOR              · #708  · 87% [Trenger sjekk] [Avvis] [Godkjenn]
```

Konfidens-prosent som mini-bar (lime hvis > 90 %, oker 80-90, rød < 80).

**Footer:**
- Venstre ghost: "38 av 48 vil bli importert"
- Høyre: "Tilbake" + "Bekreft import →" (primary)

---

## Skjerm 3 — `plan-templates.html`

**Rute:** `/admin/plan-templates`
**Seksjon:** Planlegge

### Brukstilfelle
Coach Anders har et bibliotek av plan-maler (eks. "Vintergrunntrening 12 uker", "Pre-turneringuke", "Comeback fra skade"). Han bruker disse som utgangspunkt når han lager ny plan for en spiller.

### Layout

**Topbar:** `CoachHQ / Planlegge / Plan-maler`

**Hero:**
- Eyebrow: `COACHHQ · PLANLEGGE · PLAN-MALER`
- Title: `Bibliotek av <em>plan-maler</em>`
- Sub: `<strong>12</strong> maler · <strong>4</strong> brukt siste 30 dager · Mest brukt: <strong>Vintergrunntrening</strong>`
- CTA: "Bla i kommunitets-maler" + "Ny mal →" (primary)

**Filter-row:**
- Disiplin: Alle (12) · FYS (3) · TEK (2) · SLAG (4) · SPILL (2) · TURN (1)
- Varighet: Alle · < 4 uker · 4-12 uker · 12+ uker
- Bruk: Mine egne (8) · Delt med team (4) · AK Golf-standard (6)

**Mal-grid (3-kolonner):**

Per mal-card:
- Topp-strip: pyramide-badge + varighet-pill ("8 uker")
- Title (Inter Tight 16px): "Vintergrunntrening U19"
- Sub: "Periodisering · FYS-fokus · uke 1 av 8 = volum 12t/uke"
- Mini-progresjon (5 mini-prikker for ukene)
- Stats-rad: "Brukt 8× · sist 14. apr" / "Effektivitet 78%"
- CTA-footer: "Bruk mal" (primary outline) · "Forhåndsvis" · "Rediger"

Vis 9 maler i grid:
1. Vintergrunntrening U19 (12 uker · FYS) — mest brukt
2. Pre-turnering Sørlandsåpent (4 uker · SLAG)
3. Comeback fra skade (8 uker · FYS) — markert "AK Golf-standard"
4. Spesialisering vår (6 uker · TEK)
5. Putt-fokus 30 dager (4 uker · SLAG)
6. Mental tøffhet U16 (6 uker · TURN)
7. Course management drill (8 uker · SPILL)
8. Hjemmebanen-trening (12 uker · SLAG)
9. Sommerleir 2-uker intensiv (2 uker · FYS+TEK)

**Bunn — "Effektivitet-rangering"-card:**
Liten tabell som viser topp-3 mest effektive maler (bedømt på spillere som gjorde fremgang etter bruk):
1. Vintergrunntrening U19 — 91 % positiv fremgang
2. Putt-fokus 30 dager — 87 %
3. Pre-turnering Sørlandsåpent — 84 %

---

## Skjerm 4 — `bookinger.html`

**Rute:** `/admin/bookinger`
**Seksjon:** Gjennomføre

### Brukstilfelle
Coach Anders ser alle bookinger på tvers av spillere — denne uka, neste uka, fortid. Kan filtrere på status, type, anlegg.

### Layout

**Topbar:** `CoachHQ / Gjennomføre / Bookinger`

**Hero:**
- Eyebrow: `COACHHQ · GJENNOMFØRE · BOOKINGER`
- Title: `Bookinger <em>på tvers</em> av stallen`
- Sub: `<strong>42</strong> bookinger neste 7 dager · <strong>4</strong> nye i dag · <strong>2</strong> avlyst`
- CTA-rad: Filtre · Eksporter CSV · Ny booking manuelt (primary)

**KPI-rad (4 celler):**
1. I dag (featured): `8` bookinger · `3 igjen`
2. Denne uka: `42` · `+12% vs forrige`
3. Avlyst denne uka: `2` · `Krever ny-booking`
4. Inntekt denne uka: `48 400 kr` · `+18% vs forrige`

**View-switcher:** `[Liste] [Tidslinje] [Kalender]` — vis Liste som default

**Filter-row:**
- Status: Alle (42) · Bekreftet (38) · Pågående (1) · Fullført · Avlyst (2)
- Anlegg: Mulligan (24) · GFGK Range (12) · Drøbak (6)
- Type: Coaching 1-1 · Gruppetrening · Anleggsleie · Annet
- Periode: Denne uka / I dag / Neste uka / Mai 2026

**Booking-tabell (rader):**

Header: `Tid` · `Spiller` · `Type` · `Anlegg` · `Status` · `Verdi` · `Actions`

Eksempel-rader (vis 12 stk):
```
[I DAG · 14:00–15:00]   [MP] Markus R. Pedersen  · Coaching 1-1     · Mulligan studio 2  · [BEKREFTET]  · 800 kr  · [...]
[I DAG · 16:30–17:30]   [JK] Julia Karlsen        · TrackMan-økt     · Mulligan studio 1  · [BEKREFTET]  · 600 kr  · [...]
[TOR 25 · 09:00–11:00]  [Lag U16]                 · Gruppetrening    · GFGK Range         · [BEKREFTET]  · 1 600 kr · [...]
[TOR 25 · 13:00–14:00]  [OB] Oliver Brekke        · Coaching 1-1     · Mulligan studio 2  · [PÅGÅENDE]   · 800 kr  · [...]
[FRE 26 · 10:00]        [EG] Emil Grøtnes         · Coaching 1-1     · Mulligan studio 1  · [AVLYST]     · –       · [Ombook]
```

Per rad — klikkbar → booking-detalj-modal.

**Bunn — "Trenger oppfølging"-bench-card:**
- Avlyste bookinger som ikke har ny tid: 2 spillere
- Foreslå at vi sender automatisk ombooking-link

---

## Skjerm 5 — `godkjenninger.html`

**Rute:** `/admin/godkjenninger`
**Seksjon:** Innsikt

### Brukstilfelle
Coach Anders har en kø av godkjennings-saker: spiller-foreslåtte plan-justeringer, foreldre-tilgang, mindreårig-samtykke, booking-rabatter, etc. Han må gå gjennom og godkjenne/avvise.

### Layout

**Topbar:** `CoachHQ / Innsikt / Godkjenninger`

**Hero:**
- Eyebrow: `COACHHQ · INNSIKT · GODKJENNINGSKØ`
- Title: `Saker som krever <em>godkjenning</em>`
- Sub: `<strong>11</strong> ventende · <strong>3</strong> overdue (> 48t) · Snitt-tid: <strong>18 timer</strong>`
- CTA: "Aksepter alle lav-risiko" + "Eskalert til admin"

**KPI (4 celler):**
1. Ventende (featured): `11`
2. Overdue: `3` (rød)
3. Mottatt i dag: `4`
4. Godkjent denne uka: `28` (success-grønn)

**Kategori-tabs (pill-style):**
- Alle (11) · Plan-justering (4) · Foreldre-tilgang (2) · Mindreårig (1) · Booking-rabatt (3) · Annet (1)

**Godkjennings-rader:**

Hver rad — utvidet card:
- Topp-strip: type-badge + spiller-avatar + spiller-navn + dato/alder-pill
- Beskrivelse (Inter Tight 14px): "Markus ber om å bytte ut Driver Basic med Driver Gate denne uka"
- Begrunnelse (mono 11.5px italic): "PEI har stagnert siste 14 dager. Vil prøve mer presisjonsfokus."
- Risk-pill: `LAV` (grønn) / `MEDIUM` (oker) / `HØY` (rød)
- 3-knapps actions: "Avvis" (outline) · "Be om mer info" (ghost) · "Godkjenn ✓" (primary)
- Detalj-knapp (utvidbar): "Vis full kontekst"

Vis 11 saker i mockupen.

**Bunn — bench-card:**
- "AI foreslår batch-godkjenning av lav-risiko: 5 saker fra spillere med PR siste 30 dager"

---

## Skjerm 6 — `notion-prosjekter.html`

**Rute:** `/admin/notion-prosjekter`
**Seksjon:** Admin

### Brukstilfelle
AK Golf bruker Notion som master for operative prosjekter (eks. "Sørlandsåpent forberedelse", "WAGR-data Q2", "Junior-cup 2026"). Notion-API synker prosjekter inn i CoachHQ slik at coach Anders kan se status uten å bytte verktøy.

### Layout

**Topbar:** `CoachHQ / Admin / Notion-prosjekter`

**Hero:**
- Eyebrow: `COACHHQ · ADMIN · NOTION-PROSJEKTER`
- Title: `Aktive <em>prosjekter</em> · sync fra Notion`
- Sub: `<strong>8</strong> prosjekter · Sist synket <strong>4 min siden</strong> · <strong>3</strong> trenger oppmerksomhet`
- CTA: "Sync nå" (outline) · "Åpne i Notion" (lime)

**Sync-status-banner:**
- Lim-tinted bg + lime accent border + sync-ikon (animert spinning hvis aktiv)
- "Notion API tilkoblet · sist sync: 14:18 · 412 oppgaver totalt"
- Liten "Konfigurer integrasjon"-link

**Filter-row:**
- Status: Alle (8) · Aktive (5) · Planlagt (2) · Fullført (1)
- Type: Turnering · Camp · WAGR · Coaching · Klubb
- Eier: Anders K. (6) · Anna J. (2)

**Prosjekt-kort (2-kolonner grid):**

Per prosjekt-card:
- Top-strip: Notion-icon + status-pill (Aktiv/Planlagt/Fullført) + dato-range
- Title (Inter Tight 16px): "Sørlandsåpent forberedelse"
- Sub: "8. juni 2026 — Kristiansand GK · 4 spillere påmeldt"
- Progresjon-bar: 12 av 18 deloppgaver fullført (62%)
- Mini-task-list (3 siste):
  - [✓] Bestill innkvartering — Anders K.
  - [✓] Send turnerings-info til foreldre — Anna J.
  - [ ] Booking av TrackMan-økt 7. juni — overdue 2d
- CTA-footer: "Åpne i Notion ↗" + "Detaljer"

Vis 6 prosjekter:
1. Sørlandsåpent forberedelse — 62% — 3 overdue tasks
2. WAGR-data Q2 — 90% — 1 overdue
3. Junior-cup 2026 — 18% — planlagt
4. Mulligan-vinterstop — 100% — fullført
5. NM Junior 14. juli forb. — 12% — planlagt
6. Comeback fra skade · Sara H. — 35% — coaching

**Bunn-bench:**
- "Synker hver 15. minutter · 412 oppgaver totalt · 14 endringer siste 24t"

---

## Skjerm 7 — `audit-log.html`

**Rute:** `/admin/audit-log`
**Seksjon:** Admin

### Brukstilfelle
Anders kan se alle endringer i systemet — hvem gjorde hva, når. For trygghet, debugging, og GDPR-etterlevelse.

### Layout

**Topbar:** `CoachHQ / Admin / Audit-log`

**Hero:**
- Eyebrow: `COACHHQ · ADMIN · AUDIT-LOG`
- Title: `Endringer i <em>systemet</em>`
- Sub: `<strong>247</strong> endringer siste 24t · <strong>8 brukere</strong> aktive · Logg <strong>30 dager</strong>`
- CTA: "Eksporter CSV" (outline) · "Slett før 1. mai" (ghost danger)

**KPI (4 celler):**
1. Siste 24t: `247`
2. Siste 7d: `1 842`
3. Aktive brukere: `8`
4. Slettet (siste 30d): `12`

**Filter-row:**
- Tidspunkt: Siste 24t · 7 dager · 30 dager · Custom
- Bruker: Alle · Anders K. · Anna J. · Spillere (...)
- Type: Alle · Login · Endring · Sletting · Eksport · API-kall · Auth-feil
- Søk: free-text (eks. "Markus" / "plan-id-123")

**Audit-tabell (rader):**

Header: `Tid` · `Bruker` · `Handling` · `Mål` · `IP` · `Detalj`

Hver rad — mono font, kompakt høyde:
```
14:22:18  [AK] Anders K.        [LOGIN-OK]      —                                    192.168.1.x   [Vis]
14:21:53  [AK] Anders K.        [UPDATE]        plan-23ab · Sørlandsåpent forb.     192.168.1.x   [Vis diff]
14:18:00  [SYS] System         [SYNC]          Notion API · 14 endringer            —             [Vis]
14:12:33  [MP] Markus R.P.      [LOGIN-OK]      —                                    98.x.x.x      [Vis]
14:10:01  [MP] Markus R.P.      [CREATE]        test-result-789 · Driver Basic 67.4 98.x.x.x      [Vis]
14:02:45  [AK] Anders K.        [DELETE]        booking-451 · ombooket               192.168.1.x   [Vis]
13:58:00  [SYS] Cron-job       [GENERATE]      AI brief · 38 spillere               —             [Vis]
```

Hver rad klikkbar → modal med diff (før/etter JSON) eller rådata.

Type-pills:
- `LOGIN-OK` — success-grønn
- `LOGIN-FAIL` — danger-rød
- `CREATE` · `UPDATE` — primary
- `DELETE` — danger-rød
- `SYNC` · `GENERATE` — muted

**Bunn-bench:**
- "Audit-logg lagres i 30 dager · GDPR-konform · sletting krever admin-godkjenning"

---

## Skjerm 8 — `settings.html`

**Rute:** `/admin/settings`
**Seksjon:** Admin

### Brukstilfelle
Coach-innstillinger hub. Anders konfigurerer sin personlige profil, varsler, kalender-integrasjon, betalinger, klubb-info, API-nøkler.

### Layout

**Topbar:** `CoachHQ / Admin / Innstillinger`

**Hero:**
- Eyebrow: `COACHHQ · ADMIN · INNSTILLINGER`
- Title: `Konfigurer <em>CoachHQ</em>`
- Sub: `Coach Anders K. · klubb GFGK · 38 spillere`

**Settings-grid (kategori-kort, 2-kolonner):**

Hver kategori-card:
- Ikon (40px) i farget bg-sirkel
- Title (Inter Tight 15px)
- Sub-tekst (Inter 12px muted): kort beskrivelse
- Antall sub-innstillinger
- "Åpne →"-link i hjørnet

Kategorier (8 stk):

1. **Min profil**
   - Ikon: UserCircle (primary)
   - Sub: "Navn, bilde, kontakt, signatur"
   - Status: 1 manglende felt (rød pill)

2. **Varsler**
   - Ikon: Bell (lime accent)
   - Sub: "E-post, push, SMS, daglige sammendrag"
   - Status: "E-post + push aktivert"

3. **Kalender + Google sync**
   - Ikon: Calendar
   - Sub: "Google Calendar tilkoblet · 2-veis sync aktiv"
   - Status-pill: "Tilkoblet · sist sync 5 min siden"

4. **Betaling + abonnement**
   - Ikon: CreditCard (warn)
   - Sub: "Stripe Connect · stallens abonnementer · payout"
   - Status: "Auto-payout 15. hver mnd"

5. **Klubb-info**
   - Ikon: Building (forest)
   - Sub: "Gamle Fredrikstad GK · 38 spillere · 12 trenere"

6. **Team-tilganger**
   - Ikon: Users
   - Sub: "12 trenere · 3 admins · 2 ventende invitasjoner"
   - Status: "2 ventende invitasjoner"

7. **API + integrasjoner**
   - Ikon: Code
   - Sub: "MCP-nøkler · webhooks · 3rd-party"
   - Status: "3 aktive nøkler · 2 webhooks"

8. **Sikkerhet**
   - Ikon: Shield (danger)
   - Sub: "Passord · 2FA · aktive sesjoner · audit"
   - Status: "2FA aktivert · 3 enheter pålogget"

**Bunn-bench (full bredde):**
- "Trenger hjelp? Se [docs] · [support] · [feature request]"
- Versjon-info: "CoachHQ v2.4.1 · sist oppdatert 23. mai 2026"

---

## Output-instruksjoner

1. Generer 8 HTML-filer som beskrevet
2. Inkluder en `index.html` som er en design-canvas oversikt med alle 8 som live iframes
3. Bruk `_coachhq-stubs.css` som extender `_tester.css` (eller bare include alle nødvendige variabler øverst)
4. Lever som ZIP `coachhq-stubs.zip`
5. Pixel-perfekt på 1280px breddedesktop + responsivt fall-down på mobile

**Når levert:** jeg porter til React + deployer til prod på `/admin/*`-rutene. Estimat: 4-5 timer fra mockup til live.
