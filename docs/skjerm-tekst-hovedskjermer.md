# Skjerm-tekst — PlayerHQ hovedskjermer (copy-deck)

Den faktiske norske teksten som står PÅ skjermene. Styrt av ordboken
(`docs/design-guide-terminologi.md` lag 2 + `docs/ordbok-ak-golf-konsept.md` lag 1).
Skrevet 5. juli 2026. Kopier rett inn i design/implementasjon.

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

## Forbudte ord (ordbok B24) — bruk aldri i UI-tekst
«kortspill» (→ Nærspill) · «øving» (→ trening) · «request/log new» (norsk) · «Performance/Performance Pro» som app-nivå · «ELITE» · «brudd/overstyr/krever begrunnelse» (anbefaling, aldri sperre) · emoji.
