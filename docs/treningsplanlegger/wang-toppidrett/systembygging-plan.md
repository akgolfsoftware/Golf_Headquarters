# Systembygging — steg 4–6 (kalender, åpen side, filtrering)

Konkret byggeplan mot faktisk repo-tilstand (kartlagt 2026-07-07). Alt bygges i akgolf-hq,
isolert på egen branch, med verifisering (`tsc` + `npm test` + `npm run build`) før commit.

## Forutsetning (steg 0 — må gjøres FØR 4–6): WANG-data i databasen
Kalender og åpen side viser `Group` + `GroupSchedule`. I dag er WANG-gruppen definert i
`prisma/seed.ts` (navn + M/O/F 08–10, linjer 51/354–357/397/625), men **ikke skrevet til DB**
(seed.ts:647 «ikke seeded til DB enda»). Uten dette har flatene ingenting å vise.

**Oppgave 0:**
1. Seed `Group` «WANG Toppidrett Fredrikstad» + tre `GroupSchedule` (man/ons/fre 08:00–10:00, recurring=WEEKLY).
2. Legg periodene fra [årshjulet](arshjul-2026-2027.md) inn som data (TURN-rest/GRUNN/SPES/TURN med uke-grenser) — enten på gruppen eller i en enkel periode-tabell som kalenderen kan fargelegge.
3. Bruk akgolf-hq-gotcha: additive endringer via `db execute` (`CREATE TABLE IF NOT EXISTS`), ikke `migrate dev`/`db push`.

## Steg 4 — Kalender år/måned/uke (mest gjenbruk)
Komponentene finnes: `src/components/athletic/calendars/{year-plan-gantt,month-grid,week-grid}.tsx`.
- **Ny:** én wrapper `src/app/.../wang-kalender/` (eller en fane) som:
  - leser `GroupSchedule` for WANG-gruppen + periodene,
  - mater `YearPlanGantt` (år, med periodefarger), `MonthGrid` (måned), `WeekGrid` (uke, 08–10-økter),
  - toggle mellom år/måned/uke.
- **Gjenbruk props** slik de er (kartlagt): `YearPlanGantt(year, phases[], milestones[])`, `MonthGrid(year, month, cells[])`, `WeekGrid(weekStart, events[], startHour, endHour)`.

## Steg 6 — Åpen WANG-side (uten innlogging)
Mal: `src/app/team-gfgk/` (ingen `requirePortalUser()`, `robots: noindex`).
- **Ny:** `src/app/team-wang/page.tsx` — server component som leser WANG-gruppe + schedules + perioder og rendrer kalender-wrapperen + tider/samlinger/turneringer/tester. **Ingen personlige spillerdata.**
- Domenekobling til gfgkjunior.no-mønster kommer i GFGK-delen (egen jobb).

## Steg 5 — Filtrering VG1/VG2/VG3
Ingen eksplisitt trinn-felt i dag. **Default (ingen ny data):** beregn trinn fra `User.dateOfBirth` + skoleår.
- Alternativ (hvis Anders vil ha redigerbart): legg til `User.schoolYear` enum (VG1/VG2/VG3) via `db execute` — avklares.
- UI: filter-tabs på kalender/åpen side; filtrer `GroupMember[]` før render.

## Rekkefølge (minst ny kode først)
0. Seed WANG-gruppe + schedules + perioder (forutsetning).
1. Steg 4 kalender-wrapper (gjenbruk 3 komponenter).
2. Steg 6 åpen side (mal fra team-gfgk).
3. Steg 5 VG-filter (default: beregn fra fødselsår).

## akgolf-hq-regler som gjelder
- Isolert branch (WIP fra annen økt ligger på main — ikke bland inn).
- `docs/MASTER-SKJERMPLAN.md`: legg til rad for hver ny skjerm, oppdater 6 haker i samme commit.
- v13-design: komponér fra `athletic/golfdata/` + design-handover-kontrakter; meld gap, ikke improviser.
- Verifiser: `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build` + `npm test`.
- Design dømmes av `.claude/skills/ak-designekspert`.

## Åpne beslutninger for Anders
1. VG-filter: beregne fra fødselsår (enkelt, anbefalt) vs. redigerbart felt (schema-endring)?
2. team-gfgk-presentasjonen: består ved siden av ny åpen side, eller erstattes?
3. Perioder: lagres på gruppen eller i egen liten tabell kalenderen fargelegger?
