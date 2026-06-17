# Design → App: bulletproof porterings- og lanseringsplan

> Hvordan vi får det ferdige Claude Design-resultatet inn i den ekte appen **uten tull, forvirring eller feildesign** — og lanserer trygt. Inkluderer full gjennomgang av alle prosjektfiler + undermapper. Skrevet 17. juni 2026.

## Garantien (hvorfor dette ikke kan rote seg til)

Ingen skjerm er «ferdig» før den har passert **fem porter samtidig**:
1. **Design-porting-gaten** — uavhengig kritiker-agent finner 0 avvik mot Claude Design-kilden.
2. **Master-skjermplanens 6 haker** grønne (Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker), oppdatert i SAMME commit.
3. **Ingen døde knapper** — sjekket mot flyt-inventaret (`50-FLYT-DODE-KNAPPER`).
4. **Verifikasjon grønn** — `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`.
5. **Design-system-lint** — ingen hardkodet hex, ingen rogue token-filer; alt fra `globals.css`.

Halvferdig vises aldri. Én skjerm om gangen, isolert på branch. Det er det som gjør planen bulletproof.

---

## FASE 0 — Forberedelse (½ dag)
- Opprett arbeidsbranch/worktree (skill: **akgolf-branch-workflow**). Aldri rett på main.
- Last ned ferdig design-zip fra Claude Design → `public/design-handover/` (kilden gaten måler mot).
- Bekreft scope mot `40-SKJERM-INVENTAR` (det rene settet ~150–180 skjermer).
- **Gate:** branch ren, design-kilde på plass.

## FASE 1 — Full kodebase-gjennomgang (audit ALLE filer + undermapper) (1–2 dager)
Mål: vite nøyaktig hva vi har før vi rører noe. Kjøres som parallelle agenter (skill: **gsd-map-codebase**, **Explore**), som skriver funn til `docs/redesign-2026-06/audit/`.

Fire sveip, rekursivt gjennom hele treet:
1. **Struktur & død kode** — hele `src/`, `docs/`, `scripts/`, `prisma/`, `public/`. Kartlegg: hva brukes, hva er foreldreløst, hvilke legacy-ruter skal slettes (hele `/portal/mal/*`, redirect-dubletter, `/(internal)`+`/intern/komponenter` demo, dødt `ELITE`-enum). Output: `audit-struktur.md` + slette-liste.
2. **Komponent-inventar** — `src/components/` (athletic/ui/shared/admin*/portal*). Hva finnes, hva er duplisert, hvilke skjermer bruker hva. Output: `audit-komponenter.md` (mapping komponent → skjermer).
3. **Datalag** — Prisma-modeller, server-actions, API-ruter: hva er koblet til ekte data vs. mock. Output: `audit-data.md` (per skjerm: ekte/mock/mangler).
4. **Config & teknisk gjeld** — `globals.css` (token-struktur som MÅ endres for nytt design), `next.config.ts`, env, tester, lint. Output: `audit-config.md`.

- **Gate:** fire audit-docs ferdig + én konsolidert **slette-/behold-/fiks-liste**. Ingenting slettes ennå — kun kartlagt.

## FASE 2 — Nytt designsystem (fundamentet) (2–3 dager)
Dette er den ENESTE høyrisiko-delen (endrer alt nedstrøms), så den gjøres først, helt ferdig, isolert.
- **Tokens:** migrer `src/app/globals.css` (`@theme`) + `src/lib/design-tokens.ts` til hybrid-settet fra `15-DESIGN-SPRAK-TOKENS` — lyst (PlayerHQ) + mørkt terminal (AgencyOS), lime låst. Begge temaer definert samtidig. (skill: **akgolf-design-system**, **ak-golf-hq-design**.)
- **Komponentbibliotek:** re-skin eksisterende `athletic/`-komponenter + bygg de nye fra `20-KOMPONENT-SPEC` (Notion-visninger: ViewSwitcher/Kanban/DataTable Pro/HeatmapCalendar; gamification: MasteryRing/Streak/Badge/LevelLadder/GoalProgress/JourneyMap/PercentileGauge; golf-viz: SgBreakdown/Dispersion/RadarLive/HoleStrip). (skill: **frontend-design**, **playerhq-arkitektur**.)
- **Visuell regresjon:** screenshot et galleri før/etter; bekreft lime låst, ingen hardkodet hex.
- **Gate:** designsystem-galleri matcher komponent-laben (`E`), build grønn, design-system-lint rent.

## FASE 3 — Skjerm-for-skjerm porting (design-porting-gaten) (hoveddelen)
Per skjerm, i batcher per spor (rekkefølge: **PlayerHQ → AgencyOS → Forelder → Auth → Marketing**; stats senere):
1. Bygg FRA Claude Design-kilden (ikke fra minne/eksisterende kode) — lag element-liste.
2. Screenshot implementeringen (Playwright, riktig bredde).
3. **ADVERSARIAL diff** — egen kritiker-agent, kilde-PNG vs. min PNG + element-liste. Default: anta avvik finnes.
4. Fiks til **0 avvik**, loop.
5. Oppdater master-skjermplanens 6 haker i samme commit.
   (Regel: `.claude/rules/design-porting-gate.md`. Skills: **nextjs-developer**, **frontend-developer**.)
- **Gate per skjerm:** 0 avvik + Design-hake grønn.

## FASE 4 — Datakobling + døde knapper (flettet med Fase 3 per skjerm)
- Koble hver skjerm til ekte Prisma-data (skill: **supabase-expert**, Prisma-helpere). Plassholder kun der besluttet (FYS-formel).
- Fiks hver døde knapp fra `50-FLYT-DODE-KNAPPER` — ekte destinasjon eller fjern. Verifiser at kuttede legacy-ruter ikke lenger lenkes til.
- **Gate per skjerm:** Data- + Flyt-haken grønn, 0 døde knapper.

## FASE 5 — Kvalitetskontroll (på tvers, før lansering) (2–3 dager)
- **Kode-review:** skill **code-review** / **code-reviewer**-agent på hver batch; **simplify** for opprydding.
- **Tilgjengelighet:** **accesslint** + **web-design-guidelines** (kontrast, fokusring, 44px touch, aria).
- **Merkevare:** **brand-enforcer**-agent (tokens/lime-disiplin/Lucide/8pt).
- **Nettlesertest:** **webapp-testing** + preview-verktøy — klikk gjennom kjerneflytene (≤2 trykk), tre bredder.
- **Full verifikasjon:** `prisma validate && generate && tsc && build` + `npm test` grønt.
- **Gate:** alle skjermer 6/6 i master-skjermplanen, dashboard-tall oppdatert.

## FASE 6 — Lansering (½–1 dag)
- Slett bekreftet død kode/legacy-ruter fra Fase 1-lista (nå trygt — alt nytt er på plass).
- Merge til main (skill: **akgolf-branch-workflow** — dobbeltsjekk mot prod-brytende kode).
- **Deploy prod:** `vercel deploy --prod` (NB: push til main deployer IKKE prod — eget steg). (skill: **dev-deploy**, **vercel:deploy**.)
- **Go-live-sjekkliste:** `docs/go-live-sjekkliste.md` + P0-ene + GCal re-auth + betaling klar (1. juli).
- Røyktest live: forside/portal/admin svarer, kjerneflyt funker.
- Oppdater sesjons-minne (skill: **lagre-sesjon**).

---

## Skill-kart (kort)
| Fase | Skills |
|---|---|
| 1 Audit | gsd-map-codebase, Explore, general-purpose |
| 2 Designsystem | akgolf-design-system, ak-golf-hq-design, frontend-design |
| 3 Porting | design-porting-gate (regel), nextjs-developer, frontend-developer, playerhq-arkitektur, coachhq-arkitektur |
| 4 Data/flyt | supabase-expert, postgres-pro |
| 5 QA | code-review, simplify, accesslint, web-design-guidelines, brand-enforcer, webapp-testing, test-runner |
| 6 Lansering | akgolf-branch-workflow, dev-deploy, vercel:deploy, dev-status, lagre-sesjon |

## Rekkefølge & avhengigheter (kritisk)
**Fase 2 (designsystem) MÅ være helt ferdig før Fase 3.** Hvis vi porter skjermer før tokens er nye, må alt gjøres om — det er DER «tull» oppstår. Fundament først, så skjermer på toppen.

## Slik unngår vi de fire klassiske fellene
- **Feildesign:** design-porting-gaten (0 avvik mot kilde, uavhengig kritiker) — ikke «fra minne».
- **Forvirring:** master-skjermplanen er ÉN sannhet; 6 haker per skjerm, oppdatert i samme commit.
- **Døde knapper:** flyt-inventaret er fasit; hver knapp må føre et sted.
- **Prod-brudd:** branch-isolasjon + verifikasjon før hver commit + eget prod-deploy-steg.
