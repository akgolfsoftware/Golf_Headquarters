# Revisjon av docs/ — 08.09.2026

Gjort i to lag: (1) en agent gikk gjennom alle ~150 filer i `docs/` og klassifiserte dem mot
CLAUDE.md/beslutninger.md sitt fasit-hierarki. (2) Claude verifiserte i tillegg
vokabular-/taksonomifilene direkte mot `prisma/schema.prisma` og
`src/lib/domain/ak-formel-v2.ts` — det avdekket drift agent-gjennomgangen ikke fanget, fordi
den sammenlignet dokumenter mot dokumenter, ikke mot koden. Ingen filer er endret eller slettet.

---

## Det viktigste funnet: tre taksonomier for "treningsområde" lever samtidig

| System | Antall områder | Hvor | Status |
|---|---|---|---|
| `src/lib/taxonomy.ts` (`TRENINGSOMRADER`) | 16–17, gamle koder (`TEE`, `INN200`, `PUTT0_3`…`PUTT40P` i andre grenser enn under) | Driver fortsatt eksisterende UI | Legacy — koden selv sier "fasiten vinner" over denne |
| `docs/vokabular-planlegging-2026-08-18.md` | 17 | Dokument | **Supersedert** 2 dager senere av FASIT-AK-GOLF-HQ.md, aldri oppdatert |
| `Omraade`-enum + `src/lib/domain/ak-formel-v2.ts` (`OMRAADE_KODER`) | **19** (seks puttebånd, tre FYS-områder) | Kode, v2 | **Gjeldende fasit** — matcher `docs/FASIT-AK-GOLF-HQ.md` nøyaktig |

`docs/FASIT-AK-GOLF-HQ.md` (19.08, rettet 20.08) sier det selv, ordrett: *"Merk: koden har
fortsatt en eldre liste (egen INNSPILL_0_50, putt i sju bånd, kun STYRKE/MOBILITET på FYS).
Denne tabellen vinner — koden oppdateres til den i fase 1."* Det er ikke gjort ennå — det er
en teknisk gjeld i `src/lib/taxonomy.ts`, ikke en docs-feil, og ligger utenfor denne revisjonen.

**Samme mønster på spillerkategori:**
- `docs/FASIT-AK-GOLF-HQ.md` (19.08, GJELDENDE FASIT): *"Spillerkategorier er A–K (11 nivåer)
  — L er fjernet"* — et bevisst valg Anders tok i redigeringen.
- `prisma/schema.prisma` (`NgfKategori`-enum, brukt til nivådifferensiering av drills/maler,
  IKKE NGFs offisielle klasser): fortsatt **A–L, 12 nivåer**. Ikke rettet.
- `docs/vokabular-planlegging-2026-08-18.md`: sier fortsatt "12 kategorier A–L" — matcher koden,
  ikke fasiten.

**Konklusjon:** `docs/FASIT-AK-GOLF-HQ.md` er den eneste filen i `docs/` som er ajour og som
riktig dokumenterer sine egne avvik mot koden. De to andre vokabular-dokumentene
(`vokabular-planlegging-2026-08-18.md` og `ordbok-ak-golf-konsept.md` §4) beskriver hver sin
eldre tilstand som om den var gjeldende, uten selv å vite det.

**Én død filreferanse funnet i kode:** `src/lib/domain/ak-formel-v2.ts` og `ordbok-ak-golf-konsept.md`
siterer begge `docs/spec-treningsplanlegging-2026-08-19.md` som fasit — filen finnes ikke i
repoet. Enten aldri committet, eller slettet uten at siteringene ble rettet.

**LIFE-kodene og Voksen-modellen finnes kun som dokument-vokabular — null treff i kode
(`src/` og `prisma/schema.prisma`).** De er beskrivende begreper, ikke implementert data. Ikke
en feil i seg selv (vokabular-fila sier selv «merkelapper»), men verdt å vite: hvis du forventer
å finne dem igjen i en spillerprofil i appen, er de ikke der ennå.

### Hva du bør gjøre
1. Enten oppdater `vokabular-planlegging-2026-08-18.md` til å speile `FASIT-AK-GOLF-HQ.md`
   nøyaktig, eller slett den og la FASIT-fila være eneste ordforråds-fasit (anbefalt — to filer
   om samme ting er nøyaktig det som skapte dette avviket).
2. `ordbok-ak-golf-konsept.md` §4 (Treningsområder) bør enten oppdateres til v2-taksonomien
   eller få samme «UTGÅTT»-varsel som §2/§3/§5/§13 allerede har. Resten av fila (Del A §1, 6–16
   og hele Del B) er ikke sjekket linje for linje i denne runden — anta ikke automatisk at den
   er korrekt bare fordi §2/3/5/13 er riktig flagget.
3. Kategori A–K vs. A–L: avgjør om `NgfKategori`-enumet i skjemaet skal rettes til 11 nivåer,
   eller om FASIT-fila skal rettes tilbake til 12 — de kan ikke begge være sanne samtidig. Dette
   er en kodeendring (fjerne en enum-verdi + migrere eksisterende `L`-data), ikke en docs-fiks —
   flagg det som eget steg i MASTERPLAN hvis du vil ha det rettet.
4. Rett eller fjern referansen til `docs/spec-treningsplanlegging-2026-08-19.md` to steder.

---

## Full filgjennomgang (agent, verifisert mot fasit-hierarkiet)

### GJELDENDE — behold som de er
Toppnivå: `MASTERPLAN-GJENSTAAENDE.md`, `STATUS-NÅ.md`, `ak-master.md`, `FASIT-AK-GOLF-HQ.md`,
`feillogg.md`, `ordbok.json`, `taksonomi-verifikasjon.md`, `turnering-datakilder.md`,
`jarvis-shortcut.md`, `testing.md`, `runbook.md`.
`platform/`: `AGENT-BRIEF.md`, `NORDSTJERNE.md`, `BUSINESS-RULES.md`, `DATA-MODEL.md`,
`DO-NOT-USE-PAPER.md`, `BOOKING-POLICY.md`, `BOOKING-SLOT-HOLD.md`, `stripe-cutover-sjekkliste.md`.
`beslutningsgrunnlag/`: alle tre filer — fortsatt referert fra låste beslutninger.
`gdpr/`, `sikkerhet/`, `integrasjoner/`, `juridisk/`: alle fem filer, ingen motstrid funnet.
`natt/workbench/README.md` + `ACCESS-AND-GROUPS.md`; `natt/README.md`, `D-LYS-OG-5T-BESLUTNING.md`,
`D2-UNDERLAG-2026-08-25.md`, `N6-PROMPT.md` (operativ for et annet repo).
`merkevare/ak-golf-tekstkonsept-2026-09-01.md`, `marketing/tekstplan-forside-2026-09-05.md` (nyeste).
`superpowers/plans/2026-09-06-team-norway-skjermer.md`, `specs/2026-09-04-marked-ak-golf-port-design.md`,
`plans/2026-09-04-marked-ak-golf-port.md`, `plans/2026-09-05-komplett-designport.md` (aktiv, fase 2–8 gjenstår).
`treningsplanlegger/wang-toppidrett/`: kompetansemål-filene, årshjul, grunnlag-funn,
design-handoff-arsplan-mappen — aktivt kildegrunnlag.
`epost-maler/LES-MEG.md` — prosessen er riktig (se MÅ OPPDATERES for selve fargeinnholdet).
`arkiv/` — allerede korrekt merket historikk, ingen handling nødvendig.

**Presisering etter kodesjekk (over):** `vokabular-planlegging-2026-08-18.md` og
`ordbok-ak-golf-konsept.md` var i agentens gjennomgang klassifisert GJELDENDE — nedgradert til
**MÅ OPPDATERES** etter direkte verifisering mot skjema/kode, se seksjonen over.

### MÅ OPPDATERES

| Fil | Problem | Anbefaling |
|---|---|---|
| `vokabular-planlegging-2026-08-18.md` | Supersedert av FASIT-AK-GOLF-HQ.md 1–2 dager senere (17 vs. 19 områder, A-L vs. A-K) | Slett, eller synk mot FASIT — se anbefaling 1 over |
| `ordbok-ak-golf-konsept.md` §4 | Beskriver `taxonomy.ts`s eldre 16-områdeliste som gjeldende, ikke selv-flagget | Legg til UTGÅTT-varsel som §2/3/5/13, eller oppdater til v2 |
| `design-system/TEMA-LYS-MORK.md` (26.07) | Motsatt av dagens sannhet: sier PlayerHQ/AgencyOS default lys, auth/marketing default mørk. Faktisk (25.08-beslutning): `/portal`+`/admin` mørk, `/auth` lys, marketing lys. Nevner ikke Train-lock. | Skriv om fra `tema-default.ts` + beslutninger.md, eller slett og la koden/testen være eneste kilde |
| `epost-maler/LES-MEG.md` + de tre `.html`-malene | **Reell driftsrisiko, ikke bare docs:** bruker avviklet forest/lime-palett (`#005840`/`#D1F843`), mens `src/lib/email/templates/shared.ts` bruker AK Golf-paletten. Malene limes manuelt inn i Supabase og leser ikke kode — ekte brukere kan motta feil-merkede e-poster nå. | Generer på nytt fra `emailLayout()`, lim inn i Supabase. Sjekk Supabase-dashbordet snarest. |
| `merkevare/ak-golf-merkeplattform.html` + `-2026-08-31.md` | Font fortsatt Lora+Poppins — overkjørt to ganger 01.09 (→ Archivo Narrow → IBM Plex). `designsystem/ak-golf/` er nå ekte master. | Oppdater eller merk tydelig «historisk utkast» |
| `treningsplanlegger/gfgk-junior/README.md` og `wang-toppidrett/README.md` | Lenker til `../spec-design.md` — finnes ikke | Fjern/rett lenken |
| `platform/user-flows.md` | Selv-varslet: grafen er >1 måned gammel (343 vs. 330 ruter), STEG 15 har endret navigasjonen mye siden | Kjør `node scripts/rute-graf.mjs` på nytt |
| `platform/PLATFORM-PRD.md` | Egen header: skrevet før designsystem-revisjonen juli 2026, viser til slettet fil | Verifiser ikke-design-innhold, fjern/oppdater designreferansen |
| `marketing/masterprompt-visuell.md` | Bygget på Claude Paper-fasiten og «ak-golf-website» — begge utgått | Skriv om mot `designsystem/ak-golf/` hvis fortsatt i bruk, ellers arkiver |
| `skjermtekst/skjerm-tekst-hovedskjermer.md` | Ikke lest ord for ord — bør kryssjekkes mot nyeste tekstkonsept | Sammenlign mot `ak-golf-tekstkonsept-2026-09-01.md` + `tekstplan-forside-2026-09-05.md` |
| `src/lib/domain/ak-formel-v2.ts` (kode, ikke docs) + `ordbok-ak-golf-konsept.md` | Begge siterer `docs/spec-treningsplanlegging-2026-08-19.md` — finnes ikke | Rett siteringen eller legg filen til |

### KAN SLETTES (utgått/død)
- `docs/global-CLAUDE.md` — manuell kopier-lapp for en gammel `~/.claude/CLAUDE.md`-oppdatering, lenge utført, ekte fila er langt nyere.
- `docs/.DS_Store`, `docs/superpowers/.DS_Store` — macOS-søppel.
- `marketing/tekstplan-landingsside-2026-08-31.md` — selv-merket «PENSJONERT 05.09.2026».
- `arkiv/paper-port/*` (6 filer) — allerede arkivert og supersedert, kan slettes helt (git bevarer historikk).
- `superpowers/plans/2026-09-05-designport-fase-1.md` + de 8 `okt-1`…`okt-8`-filene — fase 1 er ferdig (økt 1–8 alle merget: PR #797, #801, #802, #806, #807, e518b9a8b, #808, #809). Behold `2026-09-05-komplett-designport.md` (overordnet, fase 2–8 gjenstår).

### ARTEFAKTER (skjermbilder/JSON)
- `design-audit/2026-09-03/`, `2026-09-04/`, `2026-09-05/scoreboard.*` — supersedert av senere kjøringer, reproduserbare (`node scripts/design-audit.mjs`). Behold kun nyeste.
- `design-audit/2026-09-05/skjermbilde-gate-a0/*.jpg` (12) og `skjermbilde-gate-oe19/*.jpg` (8) — merge-bevis for allerede mergede PR-er. Kan flyttes ut av git til Drive når PR-ene har «satt seg».
- `design-audit/2026-09-07-csp-konsoll/montasje-csp-konsoll.jpg` — bevis for én fikset sak, lav gjenbruksverdi nå.
- `design-audit/2026-09-08/rigg-panelmodus-ao/*.jpg` (6) — ferskest, ikke rydd ennå.
- `platform/rute-graf-data.json` — generert, >1 måned gammel, regenerer sammen med user-flows.md.
- `treningsplanlegger/wang-toppidrett/wang-logo-transparent.png` — ekte asset, behold.

---

## Anbefalt rekkefølge
1. **Sjekk Supabase-dashbordet** for e-postmalene — dette er den eneste posten med reell
   brukerpåvirkning, ikke bare dokument-rot.
2. Rydd de fem trygge slette-kandidatene (ingen risiko, git bevarer alt).
3. Avgjør A-K/A-L og synk vokabular-dokumentene — se punktene i toppseksjonen.
4. Rett de to døde `spec-design.md`/`spec-treningsplanlegging`-lenkene.
5. Resten (MÅ OPPDATERES-lista) tas i vanlig arbeidstakt, ingen haster.

Si ifra om du vil at jeg utfører rydningen (branch, slett/oppdater, PR, merge) — denne fila er
kun revisjonen, ingen filer er rørt.
