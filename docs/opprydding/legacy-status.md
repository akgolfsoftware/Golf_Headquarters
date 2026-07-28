# Legacy-status — kartlegging før redesign

**Dato:** 2026-07-28 · **PR:** opprydding før redesign · **Ingen skjerm er slettet i denne runden.**

Kartlegger de 82 `page.tsx`-filene under `src/app/admin/(legacy)/` (48) og
`src/app/portal/(legacy)/` (34).

> **Merk om metode.** Oppdraget ba om kryssjekk mot audit-logg/bruksdata siste 60 dager.
> Det lot seg **ikke** gjøre: denne økta kjører i en container uten `.env.local`, og
> Supabase-MCP-tilkoblingen er ikke autorisert. `AuditLog`-tabellen finnes i schemaet
> (`prisma/schema.prisma:2696`), så spørringen kan kjøres når noen med DB-tilgang tar den.
>
> I stedet er klassifiseringen gjort på **kode-nåbarhet**: antall filer utenfor legacy-treet
> som refererer URL-en (nav, lenker, `router.push`, `redirect`). Det er et strengere kriterium
> for BRUKES enn for BRUKES IKKE — en skjerm uten kodelenker kan fortsatt nås via bokmerke
> eller dyplenke i e-post. Derfor er ingen skjerm plassert i BRUKES IKKE; de havner i UKJENT.

## Sammendrag

| Kategori | Antall | Betydning |
|---|---|---|
| **BRUKES** | 22 | Ekte side + innkommende kodelenker. Må få nytt design. |
| **BRUKES IKKE** | 0 | Ingen kan bekreftes død uten bruksdata — se metode-merknaden. |
| **UKJENT** | 6 | Ekte side uten kodelenker. Trenger instrumentering før sletting. |
| **Ren omdirigering** | 54 | Ikke skjermer — URL-bevaring mot kanonisk flate. Skal ikke redesignes. |

---

## BRUKES — 22 skjermer (må få nytt design)

Ekte sider med minst én innkommende referanse fra kode utenfor `(legacy)`.

| Rute | Nåbarhet | Sist endret |
|---|---|---|
| `/admin/anlegg` | 1 innkommende | 2026-07-20 |
| `/admin/availability` | 7 innkommende | 2026-07-25 |
| `/admin/drills/[id]` | 2 innkommende | 2026-07-20 |
| `/admin/drills/forslag` | 3 innkommende | 2026-07-22 |
| `/admin/drills/ny` | 1 innkommende | 2026-07-22 |
| `/admin/drills` | 9 innkommende | 2026-07-20 |
| `/admin/foresporsler` | 4 innkommende | 2026-07-20 |
| `/admin/godkjenninger/[id]` | 1 innkommende | 2026-07-20 |
| `/admin/kalender/maned` | 3 innkommende | 2026-07-20 |
| `/admin/lag-snitt` | 1 innkommende | 2026-07-27 |
| `/admin/live/[sessionId]/brief` | 1 innkommende | 2026-07-20 |
| `/admin/services` | 4 innkommende | 2026-07-20 |
| `/admin/spillere/[id]/profil` | 1 innkommende | 2026-07-27 |
| `/admin/spillere/[id]/rediger` | 1 innkommende | 2026-07-27 |
| `/admin/spillere/[id]/tildel-test` | 1 innkommende | 2026-07-27 |
| `/admin/stats/moderering` | 2 innkommende | 2026-07-20 |
| `/admin/stats/overview` | 1 innkommende | 2026-07-20 |
| `/admin/talent/sammenligning` | 3 innkommende | 2026-07-22 |
| `/admin/tester/benchmarks` | 2 innkommende | 2026-07-20 |
| `/admin/tester/tildel/[spillerId]` | 1 innkommende | 2026-07-27 |
| `/admin/workspace/tildelt-meg` | 1 innkommende | 2026-07-20 |
| `/portal/mal/sg-hub/equipment` | 1 innkommende | 2026-07-20 |

---

## BRUKES IKKE — 0 skjermer

Ingen skjerm er plassert her. Kode-nåbarhet alene kan ikke skille «ingen bruker den» fra
«ingen lenker til den, men folk har den i bokmerkene». Kategorien fylles først når
`AuditLog`-spørringen under er kjørt.

---

## UKJENT — 6 skjermer (trenger instrumentering)

Ekte sider uten innkommende kodelenker. Kan være reelt døde, eller nås via dyplenke.
**Ikke slett før bruksdata foreligger.**

| Rute | Nåbarhet | Sist endret |
|---|---|---|
| `/admin/live/[sessionId]/active` | ingen | 2026-07-20 |
| `/admin/live/[sessionId]/summary` | ingen | 2026-07-20 |
| `/admin/reach` | ingen | 2026-07-20 |
| `/admin/talent/wagr-import` | ingen | 2026-07-20 |
| `/portal/tren/aarsplan/periode/[id]/rediger` | ingen | 2026-07-20 |
| `/portal/tren/aarsplan/periode/ny` | ingen | 2026-07-20 |

Merknad per rute:

- `/admin/live/[sessionId]/active` og `/summary` — søsken av `/admin/live/[sessionId]/brief`,
  som **er** lenket. Live-flyten navigerer trolig mellom stegene i klienten uten at URL-en
  står som streng i kode. Høy sannsynlighet for at de er i bruk.
- `/portal/tren/aarsplan/periode/ny` og `/periode/[id]/rediger` — foreldreruta
  `/portal/tren/aarsplan` er en omdirigering til `/portal/planlegge/workbench?zoom=ar`.
  Underrutene er sannsynlig etterlatt, men periode-redigering finnes også i Workbench.
- `/admin/reach` — `/portal/reach` er allerede omdirigert til `/portal`. Admin-siden har
  ingen tilsvarende omdirigering.
- `/admin/talent/wagr-import` — importverktøy, kjøres trolig ad hoc av Anders direkte på URL.

### Spørring som lukker UKJENT

Kjøres av noen med DB-tilgang (`DIRECT_URL`), ikke fra agent-container:

```sql
SELECT "path", count(*) AS treff, max("createdAt") AS sist
FROM "AuditLog"
WHERE "createdAt" > now() - interval '60 days'
  AND "path" IN (
    '/admin/live/[sessionId]/active', '/admin/live/[sessionId]/summary',
    '/admin/reach', '/admin/talent/wagr-import',
    '/portal/tren/aarsplan/periode/ny', '/portal/tren/aarsplan/periode/[id]/rediger'
  )
GROUP BY "path" ORDER BY treff DESC;
```

Har `AuditLog` ikke path-kolonne, må ruten instrumenteres først — legg en teller i
`proxy.ts` for disse seks rutene og la den stå i 30 dager.

---

## Rene omdirigeringer — 54 ruter

Disse er **ikke skjermer**. Hver er en stubbe på under 25 linjer som bevarer en gammel URL
mot en kanonisk flate. De skal ikke redesignes, og de skal ikke slettes — de er det som
gjør at gamle bokmerker og e-postlenker fortsatt treffer.

| Gammel URL | Peker til |
|---|---|
| `/admin/agenter` | `/admin/agents` |
| `/admin/ai` | `/admin/agencyos` |
| `/admin/analysere` | `/admin/analyse` |
| `/admin/board` | `/admin/spillere?view=tavle` |
| `/admin/caddie` | `/admin/agencyos/caddie/dashbord` |
| `/admin/coach-workbench` | `/admin/planlegge` |
| `/admin/kalender/uke` | `destination` |
| `/admin/kapasitet` | `/admin/bookinger` |
| `/admin/kommunikasjon` | `/admin/innboks` |
| `/admin/mer` | `/admin/agencyos` |
| `/admin/okonomi` | `/admin/agencyos/okonomi` |
| `/admin/plan-templates/[id]/effectiveness` | `/admin/plan-templates` |
| `/admin/plans/new` | `/admin/planlegge` |
| `/admin/prosjekter` | `/admin/agent-team` |
| `/admin/risiko` | `/admin/agencyos` |
| `/admin/stall` | `/admin/spillere` |
| `/admin/talent/kohort` | `/admin/talent/radar` |
| `/admin/talent/region` | `/admin/talent/radar` |
| `/admin/talent/ressurser` | `/admin/talent/radar` |
| `/admin/talent/wagr-benchmark` | `/admin/talent/radar` |
| `/admin/teknisk-plan/[spillerId]` | `/admin/spillere/${spillerId}/plan` |
| `/admin/tester/tildel` | `/admin/tester` |
| `/admin/tilstander` | `/admin/gjennomfore` |
| `/portal/agent-pipeline` | `/portal` |
| `/portal/coach/[coachId]` | `/portal/coach` |
| `/portal/coach/melding/[id]` | `/portal/coach/melding` |
| `/portal/coach/melding/[id]/vedlegg` | `/portal/coach/melding` |
| `/portal/coach/notes/[noteId]` | `/portal/coach` |
| `/portal/coach/notes` | `/portal/coach` |
| `/portal/coach/ovelser/[id]/rediger` | `/portal/coach/ovelser` |
| `/portal/coach/ovelser/ny` | `/portal/coach/ovelser` |
| `/portal/coach/plans/[planId]/ny-okt` | `/portal/planlegge/workbench` |
| `/portal/coach/plans/[planId]` | `/portal/coach/plans` |
| `/portal/coach/plans/perioder` | `/portal/planlegge/workbench?zoom=ar` |
| `/portal/mal/milepaeler` | `/portal/talent` |
| `/portal/mal/runder/[id]/fullfor` | `/portal/mal/runder/${id}` |
| `/portal/mal/runder/[id]/shot-by-shot` | `/portal/mal/runder/${id}` |
| `/portal/mal/sg-hub/[club]` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub/benchmark` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub/best-vs-now` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub/conditions` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub/strategy` | `/portal/coach/sg-hub` |
| `/portal/mal/sg-hub/yardage` | `/portal/coach/sg-hub` |
| `/portal/mal/statistikk` | `/portal/analysere` |
| `/portal/ny-okt` | `/portal/planlegge/workbench` |
| `/portal/reach` | `/portal` |
| `/portal/statistikk` | `/portal/analysere` |
| `/portal/tren/[sessionId]` | `/portal/live/${sessionId}` |
| `/portal/tren/aarsplan` | `/portal/planlegge/workbench?zoom=ar` |
| `/portal/tren/fys-plan/[planId]` | `/portal/fysisk` |
| `/portal/tren/tester/katalog` | `/portal/tren/tester` |
| `/portal/tren/turneringer/ny` | `/portal/tren/turneringer` |
| `/portal/utfordringer/ny` | `/portal/utfordringer` |

---

## Konsekvens for redesignet

Redesign-omfanget i legacy-treet er **22 skjermer**, ikke 82. De 54 omdirigeringene er
ferdig ryddet arbeid, og de 6 UKJENT-e bør avklares med bruksdata før noen tegner dem.
