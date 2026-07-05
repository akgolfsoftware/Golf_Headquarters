# Skjerm-tekst — alle flater (copy-deck)

Den faktiske norske teksten som står PÅ skjermene, for **PlayerHQ** (spiller),
**AgencyOS** (coach) og **markedsflatene** (akgolf.no). Styrt av ordboken
(`docs/design-guide-terminologi.md` lag 2 + `docs/ordbok-ak-golf-konsept.md` lag 1).
Skrevet 5. juli 2026. Kopier rett inn i design/implementasjon.

**Rolle-regel (viktig):** Spiller ser KUN klarspråk (Innspill/Nærspill, «% av maksfart»).
Coach ser kode + navn (`TEK · INN150 · L-BALL · CS70 · M2 · PR2`). Markedsflatene bruker
ekte coach **Markus Røinås Pedersen** (aldri demo-spilleren), humanisert tekst uten em-strek.

## Fasit-regler brukt her (fra ordboken)
- **Demo-spiller:** Øyvind Rohjan · HCP **+3,5** · **Kategori A** (A = beste, tour-nær — governing beslutning i `public/design-handover/CLAUDE.md`; ordbokens «A=nybegynner» er forkastet).
- **SG:** fortegn ALLTID (+/−), komma, ekte minus «−», klarspråk-label: Tee-slag · Innspill · Nærspill · Putting.
- **Avstander:** innspill i **meter**, putting i **fot (ft)**.
- **Tall:** komma-desimal, mellomrom-tusenskille, `73 %` (mellomrom før %), 24-t klokke, tankestrek i perioder.
- **Tomtilstand:** verdi `—` + ærlig subtekst, aldri oppdiktet tall.
- **Knapper:** rounded-full pill, mono 12px bold uppercase. Tekst per ordbok-tabell.
- **Font:** Familjen Grotesk (display) — IKKE Inter Tight (stale i lag 2, overstyrt av handover-kanon).
- **Ingen emoji.** Lucide-ikoner.

---

## 1. HJEM (`/portal`)

**Tier-pill:** `PlayerHQ · PRO`
**Eyebrow (dato):** `SØN 6. JULI · 08:20`
**Hero-tittel:** God morgen, *Øyvind.*  (italic på fornavn)
**Undertekst:** Én økt i dag. Største gevinst ligger fortsatt i innspill.

**NesteFokusKort (dommen):**
- Eyebrow: `NESTE FOKUS`
- Verdikt (display): Innspill 50–100 m er største lekkasje
- Bevis: `↘ −0,8 slag` · Innspill · mot Broadie scratch
- Forklaring: Du taper mest fra kort avstand inn. Én innspill-økt i uka lukker mesteparten av gapet mot Tour-snitt.
- Benchmark (elite): `Tour-snitt: +0,4 slag`
- Handling (knapp): Legg inn innspill-økt

**Start-CTA (lime primary + play):** Start økt

**SgTotalKort:**
- Eyebrow: `SG TOTAL`
- Verdi: `+2,4` `slag` · trend `↗ +0,4`
- Meta: siste 12 runder · mot Broadie scratch
- Forklaring: Formen stiger — du henter mest på tee og putting.

**KPI-strip (mono):** `SG TOTALT +2,4` · `RUNDER 12` (siste 90 d) · `SNITTSCORE 72,4`

**Dagens plan:**
- Eyebrow: `DAGENS PLAN`
- Økt-rad: Innspill 200–50 · `09:00 · 2 drills · 60 min`

**Coach-notat:**
- Eyebrow: `COACH`
- Navn: Anders Kristiansen · `HEAD COACH` · `3 t`
- Melding: «Denne uka prioriterer vi innspill fra 50–100 meter — der ligger den største SG-gevinsten din nå.»

**Tomtilstander:**
- Ingen økt i dag: «Ingen økt planlagt i dag.» + knapp «Planlegg økt →»
- Ingen SG ennå: verdi `—` + «Spill din første runde for å se hvor slagene tapes og vinnes.»

---

## 2. ANALYSE — «Min golf» (`/portal/analysere`)

**Eyebrow:** `ANALYSE · NIVÅ-DIAGNOSE`
**Hero-tittel:** Strokes gained *i dybden*
**Undertekst:** Øyvind Rohjan · HCP +3,5

**Faner:** Oversikt · Strokes gained · TrackMan · Runder · Tester · Nivå

**SgKategoriBar (SG per kategori):**
- Eyebrow: `SG PER KATEGORI` · `mot Broadie scratch`
- Rader: Tee-slag `+0,6` · Innspill `−0,8` *(størst tap)* · Nærspill `+0,3` · Putting `+1,1`

**Nivå-diagnose:**
- Eyebrow: `DITT NIVÅ NÅ`
- Nivå (display): Kategori A · tour-nær
- Meta: snittscore 72,4 · siste sesong
- (Ingen «til neste nivå» når spilleren er på toppkategori — vis i stedet «Hold nivået»-benchmark mot Tour.)

**Tomtilstand (ingen runder i år):** `DITT NIVÅ NÅ` + «Logg runder denne sesongen for å se nivået ditt og hva som skal til videre.»

---

## 3. GJENNOMFØRE (`/portal/gjennomfore`)

**Eyebrow:** `GJENNOMFØRE`
**Hero-tittel:** Dagens *program*
**Metalinje:** Lørdag 6. juli · 3 økter · 2 t 15 min totalt

**Neste økt (forest-hero):**
- Eyebrow: `PÅGÅR · 09:00` (eller `NESTE · 09:00 · OM 40 MIN`)
- Tittel: Innspill 200–50 *med A. Kristiansen*
- Meta: Coach: A. Kristiansen · Sted: Oslo GK · Drills: 2
- Knapp: Fortsett økt / Start økt

**Seksjoner:** `RESTEN AV DAGEN` · `FULLFØRT I DAG`
- Rad-knapper: Start · Logg
- Status: `Logget` (grønn hake)

**Tomtilstand:** «Ingen økter planlagt i dag.» + «Planlegg i Workbench →»

---

## 4. PLANLEGGE (Workbench-inngang)

**Eyebrow:** `MIN WORKBENCH`
**Hero-tittel:** Min *plan*
**Undertekst:** Teknisk plan, sesongmål og uke — lagt av Anders, gjennomført av deg.

**Knapper:** Åpne uke → · Se teknisk plan → · Se sesongmål →
**Tomtilstand:** «Ingen aktiv plan ennå. Coachen setter opp din første plan.»

---

## 5. MEG (`/portal/meg`)

**Avatar-pill:** `PlayerHQ · PRO`
**Navn:** Øyvind Rohjan · `HCP +3,5 · Oslo GK`
**Stat-fliser:** `HCP +3,5` · `STREAK 6 d` · `RUNDER 12`

**Seksjoner (eyebrow):** `KONTO` · `VARSLER` · `TRENING` · `MER` · `ABONNEMENT`
- Konto: Rediger profil (Navn, e-post, foto) · Sikkerhet (Passord, 2FA, aktive økter)
- Varsler: Push-varsler (Nye meldinger fra coach) · E-postvarsler (Ukessammendrag)
- Trening: Utstyrsbag · Helse · Dokumenter · Bookinger
- Abonnement: Oppgrader til Pro — `299 kr/mnd · Video + prioritet`
- Knapp: Logg ut

---

---

# AgencyOS (coach — `/admin/*`)

Mørkt tema, data-tett (Bloomberg-tetthet), desktop-først. Coach ser fagkoder + navn.
**To tall, aldri blandet:** PLAN-KVALITET (0–100) og GJENNOMFØRING (%) er separate hero-tall.

## A1. Cockpit (`/admin/agencyos`)
**Eyebrow:** `COACH BRIEFING · MANDAG`
**Hero-tittel:** God morgen, *Anders.*
**Undertekst:** 38 spillere i stallen. 3 trenger oppfølging i dag.
**KPI-strip (mono):** `STALL-SG +0,8` · `PLAN-KVALITET 86` · `GJENNOMFØRING 73 %` · `AKTIVE PLANER 24`
**Handlingssenter-kort:** `HANDLINGSSENTER` · «3 spillere trenger oppfølging» · knapp «Åpne →»
**Neste økt-rad:** `NESTE · 09:00` · Innspill 200–50 · med Øyvind Rohjan · Oslo GK
**Tomtilstand:** verdi `—` + «Ingen forfalte oppgaver.»

## A2. Stall (`/admin/stall`)
**Eyebrow:** `MIN STALL`
**Hero-tittel:** Min *stall*
**Undertekst:** 38 aktive spillere · sortert etter oppfølgingsbehov
**Spillerkort:** Øyvind Rohjan · `HCP +3,5 · KAT A` · SG-tilstand-prikk (lime = økt i dag, coral = haster)
**Filter:** Alle · Trenger oppfølging · NM-spor · Junior
**Tomtilstand:** «Ingen spillere i stallen ennå.»

## A3. Workbench (`/admin/coach-workbench`)
**Eyebrow:** `MIN WORKBENCH`
**Hero-tittel:** Min *workbench*
**Undertekst:** Bygg og følg planer for hele stallen.
**7 hub-faner:** Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt · Uke · Økt
**Drill-koder (coach ser fagkode):** `TEK · INN150 · L-BALL · CS70 · M2 · PR2`
**Compliance-badge:** hake (på plan) · kryss (avvik) · minus (ikke gjennomført)
**Knapper:** Lagre · Dupliser uke · Legg til drill

## A4. Handlingssenter / Oppgaver (`/admin/handlingssenter`)
**Eyebrow:** `HANDLINGSSENTER`
**Hero-tittel:** Dine *oppgaver*
**View-toggle:** Liste · Kanban · Kalender
**Kolonner:** Å gjøre · Pågår · Venter · Ferdig
**Tomtilstand:** «Ingen åpne oppgaver. Godt jobba.»

## A5. Varsler (`/admin/varsler`)
**Eyebrow:** `MINE VARSLER`
**Hero-tittel:** Dine *varsler*
**Varsel-eksempel:** «Sterkt avvik: Øyvind droppet innspill-økt i går.» · `HASTER`
**Regel:** Avvik informerer Plan-kvalitet; sterkt avvik varsler coach automatisk. Aldri sperre.

## A6. Økonomi (`/admin/okonomi`)
**Eyebrow:** `ØKONOMI`
**Hero-tittel:** Din *oversikt*
**KPI:** `MRR COACHING 47 250 kr` · `AKTIVE ABONNEMENT 32` · `FORFALT 3`
**Pakker:** GRATIS · PRO `299 kr/mnd` · PRO årlig `2 690 kr`
**Tomtilstand:** verdi `—` + «Ingen transaksjoner ennå.»

## A7. Kalender · Innboks (kort)
**Kalender-eyebrow:** `KALENDER · UKE 27` — Hero: Din *uke*
**Innboks-eyebrow:** `INNBOKS` — Hero: Din *innboks* · «Ingen uleste meldinger.»

---

# Markedsflater (akgolf.no)

Humanisert, salgs-tekst, **ingen em-strek** som setnings-kobling. Ekte coach **Markus Røinås Pedersen**.
Aldri demo-spilleren her. Priser: GRATIS · PRO 299 kr/mnd · PRO årlig 2 690 kr.

## M1. Forside (`/`)
**Eyebrow:** `AK GOLF`
**Hero-tittel:** Tren på det du *trenger*
**Undertekst:** Strokes gained, plan og coach i samme app. Se hvor du taper slag, og få en plan som lukker gapet.
**Primær-CTA:** Kom i gang gratis
**Sekundær:** Se hvordan det virker →
**Bevis-linje:** Brukt av spillere fra junior til aspirerende Tour.

## M2. PlayerHQ-produktside (`/playerhq`)
**Eyebrow:** `PLAYERHQ`
**Hero-tittel:** Din golf, *målt og planlagt*
**Undertekst:** Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke generiske råd.
**Seksjoner:** Strokes gained i dybden · Plan fra coachen din · Følg fremgangen
**CTA:** Prøv gratis i én måned

## M3. Coaching (`/coaching`)
**Eyebrow:** `COACHING`
**Hero-tittel:** Coaching som *ser hele spilleren*
**Coach-navn:** Markus Røinås Pedersen · Head Coach, AK Golf Academy
**Undertekst:** Personlig oppfølging bygget på data, ikke magefølelse.
**CTA:** Book en samtale

## M4. Priser (`/priser`)
**Eyebrow:** `PRISER`
**Hero-tittel:** Enkelt og *ærlig*
**Gratis:** `0 kr` — «Prøveperiode, eller inkludert i coaching-pakke.»
**Pro:** `299 kr/mnd` — «Full app: strokes gained, plan, video, prioritet.»
**Pro årlig:** `2 690 kr/år` — «To måneder gratis.»
**Note:** Coaching-pakker (antall økter) kjøpes separat. Ikke app-nivåer.
**CTA:** Velg Pro

## M5. Booking (`/booking`)
**Eyebrow:** `BOOK TID`
**Hero-tittel:** Book en *time*
**Undertekst:** Velg coach, dag og ledig tid.
**CTA:** Bekreft booking
**Tomtilstand:** «Ingen ledige tider denne uka. Prøv neste uke →»

---

## Forbudte ord (ordbok B24) — bruk aldri i UI-tekst
«kortspill» (→ Nærspill) · «øving» (→ trening) · «request/log new» (norsk) · «Performance/Performance Pro» som app-nivå · «ELITE» · «brudd/overstyr/krever begrunnelse» (anbefaling, aldri sperre) · emoji.
