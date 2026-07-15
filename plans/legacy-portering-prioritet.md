# Legacy-portering — prioritert rekkefølge

> **Oppfrisket 2026-07-15** (kryssjekket rad for rad mot faktisk kode, ikke bare mot forrige
> versjon av dette dokumentet — se `plans/skjermplan-riktig-design-plan`-økten for metoden).
> Flere rader fra 12. juli-versjonen var portert uten at dokumentet fulgte med. Se
> «Nylig portert» rett under før du begynner på en bølge, så du ikke bygger noe som alt finnes.

Resten av sidene i `src/app/admin/(legacy)/` har gammelt design. ALLE er nåbare (fungerer,
gammel stil) — flere via Mer-menyen i AgencyOS-nav-en. Portering skjer bølgevis: én skjerm per
commit, master-skjermplanens haker oppdateres i samme commit (LÅST regel).

## Nylig portert (fjernet fra listen under — IKKE bygg disse på nytt)

- **Turneringer, hele familien** — hub (`/admin/tournaments`), ny (5-stegs veiviser), `[id]`,
  `dubletter` — alle v2, `(legacy)/tournaments` finnes ikke lenger.
- **`/admin/spillere/ny`** — v2 (`AdminNySpillerV2`), ekte `createSpiller`-action.
- **`/admin/audit-log`** — v2 (`AdminAuditLogV2`), `(legacy)/audit-log` slettet.
- **`/admin/trackman`** — v2, KpiFlis/Rad-komposisjon.
- **`/admin/email-templates`** (kun hub-siden) — v2 (`AdminEmailV2`), ekte data. NB:
  `docs/MASTER-SKJERMPLAN.md` sin rad for denne er selv stale (viser fortsatt Design «–») —
  rett den raden i samme commit som du rører noe annet på denne siden.
- **`/admin/okonomi` P2-sammenslåingen** — `(legacy)/okonomi` er nå selv bare en
  `permanentRedirect("/admin/agencyos/okonomi")`. Ferdig, ikke en gjenstående jobb.
- **Grupper-timeplan** — `/admin/grupper`, `[id]`, `[id]/timeplan` er alle v2, ingen restflater.
- **`/kommando` retired (2026-07-15)** — antakelsen om at dette var en "workspace-databakking"-jobb
  var feil: da vi faktisk leste koden, var Agent-team (`KommandoProject`/`Run`/`Step`) allerede v2
  og live på `/admin/agent-team` siden 12. juli — `/admin/prosjekter` + `(legacy)/prosjekter`
  redirecter dit alt. Det som faktisk manglet var AI-agenter-chatten (kun `(legacy)/agenter`) —
  portet til v2 på `/admin/agenter` (`AdminAgenterChatV2`, samtale-familien). `KommandoTask`
  (kommandos EGNE oppgaver — separat fra Notion-oppgavene) er retired: ingenting annet brukte den,
  Notion/handlingssenteret er kanon. Hele `/kommando`-treet er nå `permanentRedirect`-stubber til
  sine reelle mål. `KommandoProject`-Prisma-modellen er IKKE rørt (fortsatt i aktiv bruk av
  Agent-team) — kun `KommandoTask` er foreldreløs nå (Prisma-modell/tabell utgjør en egen,
  separat migreringsjobb, ikke gjort denne runden).

## P1 — daglig coach-bruk (port først)

| Skjerm | Rute | Merknad |
|---|---|---|
| Drills-bibliotek | `/admin/drills` (+ `[id]`/rediger/ny/forslag) | Fortsatt kun `(legacy)/drills/**` — ingen ikke-legacy versjon finnes. Lenket fra Mer-menyen. |
| Live-økt coach-flyt | `/admin/live/[sessionId]/brief\|active\|summary` | Fortsatt kun `(legacy)/live/**`. Kjernen i gjennomføring med spiller. (Ikke å forveksle med `/admin/agencyos/live` «Mission Control» — egen, allerede v2, skjerm.) |
| Spiller-skjemaer (resten) | `/admin/spillere/[id]/rediger`, `[id]/tildel-test` | `ny` er ferdig portet (se over) — disse to gjenstår, fortsatt kun `(legacy)/spillere/**`. |
| Plan-mal-redigering | `/admin/plan-templates/ny`, `[id]`, `[id]/rediger` | Hub-siden (`/admin/plan-templates`) er allerede v2 — disse tre undersidene er fortsatt kun `(legacy)/plan-templates/**`. Volum-linje/masseredigering finnes alt i delt lib (`src/lib/plan-templates/`) — selve siden er det som gjenstår. |

## P2 — ukentlig bruk

| Skjerm | Rute |
|---|---|
| Innstillinger | `/admin/settings` (+ api/calendar/security/tilgang) — fortsatt kun `(legacy)/settings/**` |
| Tilgjengelighet | `/admin/availability` |
| Tjenester og priser | `/admin/services` |
| Anlegg | `/admin/anlegg` (+ detalj) |
| Kapasitet | `/admin/kapasitet` |
| Stall-oversikt | `/admin/stall` |

## P3 — sjelden/admin

Fortsatt kun `(legacy)`-versjon, bekreftet mot koden 15. juli: e-postmal-redigering
(`email-templates/[id]/rediger` — hub-siden selv er ferdig, se over), integrasjoner,
klubb-innstillinger, team/inviter, profile, hjelp, stats-moderering/-overview,
talent-undersider (kohort/region/ressurser/wagr-import), tilstander, videoer, opptak,
board, reach, kommunikasjon, teknisk-plan-detalj (`teknisk-plan/[spillerId]` — hub-siden
selv er ferdig), lag-snitt, foresporsler, godkjenninger-detalj (`godkjenninger/[id]` —
hub-siden selv er ferdig).

**Fjernet fra listen:** `workspace/oppgaver/[id]` — spøkelsesrute, aldri bygget, allerede
purget fra `docs/MASTER-SKJERMPLAN.md` 14. juli. Ikke en gjenstående jobb.

## Dobbelt-adresser (redirect → slett) — alle bekreftet i drift 15. juli

`/admin/finance`→okonomi (dobbelt-hopp videre til `/admin/agencyos/okonomi`, virker men
litt redundant) · `/admin/calendar`→kalender · `/admin/messages`→innboks ·
`/admin/approvals`(+`[id]`)→godkjenninger · `/admin/plans/templates`→plan-templates ·
`/admin/coach-workbench`→`/admin/planlegge` (redirect finnes alt — selve slettingen av
filen venter fortsatt på at P1 er ferdig, som det IKKE er ennå — ikke slett nå).
