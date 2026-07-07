# Spec — Treningsplanlegger (WANG Toppidrett + GFGK Junior)

Dato: 2026-07-07 · Status: UTKAST til godkjenning · Eier: Anders Kristiansen

## 1. Formål (klarspråk)
En fungerende sportslig plan og offisiell treningsplanlegger for WANG Toppidrett og GFGK Junior —
for både spillere og foreldre. All planlegging skjer ett sted (AgencyOS), og alt annet henter
derfra og oppdateres automatisk.

## 2. Beslutninger (låst i brainstorming 2026-07-07)
1. **Bo:** Bygges inn i **akgolf-hq**, ikke som ny app. «Eget rom, samme hus» — samlet i egne,
   tydelig merkede mapper, men deler database og utlegging med resten av plattformen.
2. **Planleggingssenter:** **AgencyOS** (`/admin`). Gruppene WANG og GFGK planlegges direkte der
   (uker, økter, måneder). `admin/grupper/[id]/timeplan` er utgangspunktet.
3. **Sync-retning:** Enveis auto-utsending («lag ett sted, vis mange steder»). Endring på
   gruppenivå → hver spillers personlige plan + de åpne sidene oppdateres automatisk.
   **Ikke** ekte toveis (ingen redigering fra spiller/offentlig side tilbake til kilden).
4. **Åpen gruppe-side:** Delbar lenke uten innlogging. Viser **kun felles gruppedata**
   (tider, kalender, samlinger, turneringer, tester). **Ingen personlige spillerdata** —
   personvernhensyn for mindreårige.
5. **Personlig plan:** Innlogget, i PlayerHQ («Tren»-fanen som allerede finnes).
6. **Delt spiller (WANG + GFGK):** Vises som **to separate planer**, ikke slått sammen.
7. **GFGK-side:** gfgkjunior.no er den offentlige GFGK-siden og skal mates fra samme data.

## 3. Hva finnes allerede (gjenbruk — ikke bygg på nytt)
- **Workbench** = treningsplanleggeren: uker, økter, dra-og-slipp, årsplan/perioder, maler,
  standardøkter, tester, øvelser/driller. 313 automatiske tester grønne, `tsc` 0 feil.
- **Grupper med timeplan:** `src/app/admin/grupper/` inkl. `[id]/timeplan/`.
- **Spillerens plan:** `src/app/portal/tren/` (PlayerHQ).
- **Kobling gruppe → spiller i datamodellen:**
  - `Group`, `GroupSchedule` (prisma/schema.prisma)
  - `TrainingSessionV2.generertFraId` — speiler en spillerøkt tilbake til kilden
  - `partner`-felt kjenner allerede `"WANG Toppidrett"`
- **GFGK-presentasjon:** `src/app/team-gfgk/` — men **hardkodet** (leser `./data.ts`, ingen DB).
- **WANG:** finnes som `partner`-streng og seed-data, ikke som egen flate ennå.

## 4. Scope — tre jobber
| # | Jobb | Resultat for Anders |
|---|------|---------------------|
| **A** | Gjøre gruppe → spiller-utsendingen **pålitelig** | Endring i gruppa vises korrekt hos hver spiller, automatisk |
| **B** | Bygge **åpne gruppe-sider** for WANG + GFGK (levende data, ingen personlig info) | Delbar oversikt for spillere/foreldre |
| **C** | Koble **gfgkjunior.no** til den datadrevne siden | Én sannhet; slutt på håndskrevet innhold |

### Jobb A — detaljer
Kjent feil (audit 2026-07-05): `src/lib/workbench/merge-week-sessions.ts:69-70` dedupliker på
feil felt (`id` i stedet for `generertFraId`), så speilede økter telles dobbelt → feil timetall
og feil «på plan»-prosent. Manglende transaksjoner i `v2-sync.ts` / `coachDuplicateWeek` /
`apply-template-actions.ts` kan gi duplikate V2-rader ved samtidige endringer.
Mål: én korrekt utsending, dekket av en test som fanger scenariet (dagens test tester feil sak).

### Jobb B — detaljer
Ny åpen rute (foreslått) `src/app/(gruppe)/[gruppe]/` eller `src/app/grupper/[slug]/` som leser
`Group` + `GroupSchedule` + tilknyttede samlinger/turneringer/tester og viser dem uten innlogging.
Komponeres fra v13/`athletic/golfdata/` per designsystem-reglene. Én URL per gruppe (WANG, og
GFGK Mini/Basis/Utvikling/Elite).

### Jobb C — detaljer
gfgkjunior.no må lokaliseres (repo/tilgang — se åpne punkter). Enten (a) peker gfgkjunior.no til
den nye åpne siden i akgolf-hq, eller (b) gfgkjunior.no henter data via et lite lese-API.
Avgjøres når repoet er funnet.

## 5. Utenfor scope (YAGNI)
- Ekte toveis-sync (redigering fra spiller/offentlig side tilbake til kilden).
- Ny separat app eller egen database.
- Personlige spillerdata på åpen lenke.
- Ombygging av Workbench-funksjonalitet som allerede virker.

## 6. Åpne punkter (avklares i planfasen)
1. **gfgkjunior.no-repoet** — ikke funnet lokalt. Må lokaliseres / tilgang skaffes før jobb C.
2. **team-gfgk-presentasjonssiden** — består ved siden av den nye åpne siden, eller erstattes?
   (Forslag: beholdes som foreldremøte-presentasjon; ny åpen side er den løpende oversikten.)
3. **Gruppe-navn-mapping** — base bruker enum `GFGK_MINI/BREDDE/JENTER/ELITE`; gfgkjunior.no bruker
   Mini/Basis/Utvikling/Elite. Må mappes 1:1 og bekreftes med Anders.
4. **Verifisering** — om gruppe-planlegging i AgencyOS faktisk propagerer ende-til-ende i dag,
   eller kun delvis (audit peker på delvis + buggy).

## 7. Verifikasjon (per prosjektets regler)
`npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build` + `npm test`
(313 grønne som baseline; jobb A skal legge til en test som fanger dobbelttellingen).
