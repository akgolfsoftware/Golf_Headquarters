# W4 AgencyOS maler — variant tracking (overnight, PP-7)

Status: **mal-pixel finpuss + variant-pass 2026-08-12** (natt-økt, `feat/natt-w4-planbibliotek-turneringer`).
Alle rader: m390/d1280 sign-off = Anders.

## agencyos-planbibliotek (Planer/maler/teknisk plan-familien)

| Rute | Kode-komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/plans` | `AdminPlansV2` | ja (allerede) | «Planer» | ja (`TomTilstand`, vei til Workbench/mal) | «Ny plan» (ink-knapp i topplinjen — A3: clay aldri som liste-CTA) | [ ] |
| `/admin/plan-templates` | `AdminPlanMalerV2` | **lagt til i natt** | «Planmaler» | ja (`TomTilstand`) | «Ny mal» (ink-knapp i topplinjen — A3) | [ ] |
| `/admin/teknisk-plan` | `AdminTekniskPlanV2` | **lagt til i natt** (kun tagging — layout uendret) | «Teknisk plan.» | ja, to lister (spillere/maler) | «Ny mal» (ghost — sekundær) | [ ] |
| `/admin/plans/[planId]` | bespoke (`_timeline`, `_phase-card`, `_kpi-card`, `_pyramide-fordeling`, `_completed-sessions`) | nei | ja (`Tittel`) | delvis — ikke sjekket i denne runden | ikke sjekket | [ ] — **åpent: ikke v2-komponentisert, egen fil-familie i `plans/[planId]/`** |
| `/admin/plan-templates/[id]` | `AdminPlanMalDetaljV2` | nei | ja | ja | ja (`CTAPill`) | [ ] |
| `/admin/plan-templates/[id]/rediger` | (skjema, ikke sjekket i detalj) | nei | ikke sjekket | n/a (skjema) | lagre-knapp forventet | [ ] |
| `/admin/plan-templates/ny` | `AdminPlanMalNyV2` | nei | ja (veiviser) | n/a (veiviser) | ja | [ ] |
| `/admin/spillere/[id]/plan` | ikke undersøkt i denne runden | — | — | — | — | [ ] — **åpent: verifiser mot samme mal ved neste pass** |

**Diff-punkter implementert i natt (planbibliotek):**
1. `plan-templates/page.tsx`: hentet `approved`-feltet fra `PlanTemplate` (fantes i skjema, ble ikke brukt).
2. `AdminPlanMalerV2`: nytt felt `godkjent` i datakontrakten.
3. `AdminPlanMalerV2`: `data-paper-slug="agencyos-planbibliotek"` på hode (manglet — familien deler fasit).
4. `AdminPlanMalerV2`: «Utkast»-status-pille på malkort som ikke er godkjent (matcher fasitens
   «Godkjent 18 / Utkast 6»-skille — reell data, ikke fabrikert).
5. `AdminPlanMalerV2`: ny «Status»-filterrad (Godkjent/Utkast) ved siden av eksisterende fase-filter.
6. `AdminPlanMalerV2`: KPI-rad utvidet fra 3 til 4 fliser — lagt til «Godkjent»-telling.
7. `AdminTekniskPlanV2`: `data-paper-slug="agencyos-planbibliotek"` på hode (kun tagging, ingen
   visuell endring — allerede riktig struktur/lister).

**Ikke gjort i natt (bevisst utelatt, minimal-diff-prinsippet):**
- `/admin/plans/[planId]` er ikke v2-komponentisert (egen fil-familie, ikke `admin/v2/`). Å bygge
  den om til master–detalj-mønsteret i fasiten er en egen skjerm-jobb, ikke en variant-fiks.
- Fasitens master–detalj-panel (liste + inspektørpanel på samme flate) er IKKE bygget inline — appen
  bruker konsekvent liste-side → egen detalj-rute (samme mønster som Godkjenninger/Bookinger). Dette er
  en arkitekturbeslutning som allerede gjelder resten av AgencyOS, ikke noe denne PR-en endret.

## agencyos-turneringer

| Rute | Kode-komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/tournaments` | `AdminTurneringerV2` | ja (allerede) | «Turneringer» | ja | «Ny turnering» | [ ] |
| `/admin/tournaments/[id]` | detalj + `FellesmeldingFlyt` | nei | ikke sjekket i detalj | n/a | fellesmelding-flyt | [ ] |
| `/admin/tournaments/ny` | `TurneringWizardV2` | nei | ja (veiviser) | n/a | ja | [ ] |
| `/admin/tournaments/dubletter` | `MergeDubletterListe` | nei | ja | ja (`TomTilstand`, «Ingen ventende dubletter») | «Slå sammen» per rad | [ ] |

**Diff-punkter implementert i natt (turneringer):**
1. `tournaments/page.tsx`: fjernet filteret som skjulte alle turneringer før inneværende uke — nå
   lastes hele sesongen, klassifisert med `erKommende` (ekte dato-sammenligning, Oslo-uke via
   `startOfWeek`).
2. `AdminTurneringerV2`: nye `PillTabs` «Kommende / Spilte» (matcher fasitens filterrad), med reelle
   tellinger per fane.
3. `tournaments/page.tsx`: ny spørring `prisma.tournament.count({ sourceOrigin: MANUAL, mergedIntoId:
   null })` — samme datagrunnlag som `/admin/tournaments/dubletter` bruker allerede.
4. `AdminTurneringerV2`: «Én ting nå»-banner (tint-kort) vises når dublett-kandidater finnes, lenker
   til den eksisterende dubletter-siden — matcher fasitens duplikat-varsel 1:1 i funksjon, ekte data.
5. `AdminTurneringerV2`: hode-undertekst utvidet med «sesong {år} · N registrerte» (fasitens mønster).

**Ikke gjort i natt:**
- Fasitens dublett-sammenligningstabell («Beholdes/Slettes» side ved side) er IKKE flyttet inn på
  hovedsiden — den ligger fortsatt på egen rute `/admin/tournaments/dubletter`, som allerede har en
  fullverdig implementasjon (algoritme + UI). Banneren over lenker dit i stedet for å duplisere UI-en.
- `/admin/tournaments/[id]` og `/admin/tournaments/ny` er ikke pixel-sjekket i denne runden (kun
  strukturelt bekreftet at de bruker v2-komponenter).

Oppdateres fortløpende under overnight.

---

# W4-runde 2026-08-13 (fem strømmer, PR #437/#438/#440/#441/#442)

Alle rader: m390/d1280 sign-off = Anders. `npm run verify` grønn i hovedrepo per gren;
`npm test` 980/980 per gren. Skjermbilde-gallerier tas mot Vercel-preview før sign-off.

## agencyos-godkjenninger (PR #437, `feat/w4-godkjenninger`)

| Rute | Komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/godkjenninger` | `AdminGodkjenningerV2` | ja (allerede) | «Godkjenninger» | ja (`TomTilstand`) | gjensidig utelukkende ink-/ghost-knapper (haster/lav-risiko/innboks) — A3: clay kun i «Én ting nå»-kortet | [ ] |
| `/admin/godkjenninger/[id]` | `AdminGodkjenningDetaljV2` | lagt til 13.08 | ja | ja (`ApprovalNotFound`) | «Godkjenn» (sticky bar) | [ ] |
| `/admin/handlingssenter` | `AdminHandlingssenterV2` | lagt til 13.08 (kun tagging) | «Handlingssenter» | ja | «Ny oppgave» | [ ] |
| `/admin/queue` | inline page.tsx | lagt til 13.08 (kun tagging) | «Hvem trenger en samtale» | delvis (tomme kanban-kolonner) | ingen primær (ghost) | [ ] |
| `/admin/approvals` (+[id]) | redirect-stub → godkjenninger | n/a | — | — | — | [ ] |

STOPP: queue (spiller-risiko-kanban) og handlingssenter (Notion-oppgaver) er egne datadomener —
fasitens «ÉN flate» krever produktbeslutning før sammenslåing. `/admin/foresporsler` finnes ikke i kode.

## agencyos-gruppe-detalj (PR #440, `feat/w4-grupper`)

| Rute | Komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/grupper` | `GrupperV2` | lagt til 13.08 | «Grupper» | ja | «Ny gruppe» | [ ] |
| `/admin/grupper/[id]` | `GruppeDetaljV2` + ny `GruppeFaner` | ja (allerede) | gruppenavn | ja (medlemsliste) | «Legg til spiller» | [ ] |
| `…/[id]/timeplan` | `GruppeTimeplanV2` | lagt til 13.08 | «Grupper · {navn}» | ja | opprett-skjema | [ ] |
| `…/[id]/arsplan` | page.tsx (`GruppeKalenderWrapper`) | lagt til 13.08 | «Årsplan» | tekstlig fallback | «Legg inn skoledata» | [ ] |
| `…/[id]/arsplan/skoledata` | page.tsx (`SkoledataForm`) | lagt til 13.08 | «Legg inn skoledata» | n/a (skjema) | lagre | [ ] |

Fasitens faner (Medlemmer/Årsplan/Timeplan/Skoledata) bygget som delt `GruppeFaner` (pill-tab-
konvensjonen, server-drevne lenker). STOPP: workbench-fanen (drag-drop-canvas, ikke i fasit) og
årsplan-kalenderkjernen (delt med offentlig `/team-wang`) er ikke rørt.

## agencyos-bookinger (PR #438, `feat/w4-bookinger`)

| Rute | Komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/bookinger` | `AdminBookingerV2` (+ nytt «Tjenester og åpningstid»-kort) | ja (allerede) | «Bookinger» | ja | «Ny booking» (ink-knapp i topplinjen — A3: clay aldri som liste-CTA; verifisert i kode 17.08: `CTAPill` uten `enTing` er allerede ink) | [ ] |
| `…/bookinger/[id]` | `AdminBookingDetaljV2` | lagt til 13.08 | «Booking · {dato}» | notFound() | åpne spiller / tilbake | [ ] |
| `…/bookinger/ny` | `NyBookingWizard` | lagt til 13.08 | «Ny booking» | n/a (veiviser) | opprett (steg 5/5) | [ ] |
| `(legacy)` services · anlegg · availability | `AdminServicesV2`/`AdminAnleggV2`/`AdminAvailabilityV2` | lagt til 13.08 | ja | ja | ja | [ ] |
| `(legacy)` kapasitet | redirect med v2-erstatning | n/a | — | — | — | [ ] |

STOPP: ny-veiviseren er 5 steg (Spiller→Tjeneste→Lokasjon→Tid→Bekreft), fasit-kontrakten sier 3
(tjeneste→tid→spiller) — ombygging rører kollisjonsvern/multi-coach-filtrering, venter på Anders.
Oppfølging: `admin/bookinger/bookinger.tsx` + `bookinger-view.tsx` er foreldreløse med gamle
`text-accent`-farger — ikke importert av noen rute, ikke rørt.

## agencyos-oppsett (PR #441, `feat/w4-oppsett`)

| Rute | Komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/settings` | `AdminSettingsV2` | rettet `agencyos-innstillinger`→`agencyos-oppsett` | «Innstillinger» | ja | — (info) | [ ] |
| `…/settings/api · calendar · security · tilgang · periode-navn · periode-fordeling` | respektive V2-komponenter | lagt til 13.08 | ja | varierer (se PR) | — | [ ] |
| `/admin/klubb/innstillinger` | `AdminKlubbInnstillingerV2` | lagt til 13.08 + rail-fiks | «Innstillinger» | ja | «Legg til klubb» | [ ] |
| `/admin/gdpr` | inline page.tsx | lagt til 13.08 + to fikser | «GDPR-kø» | ja | «Utfør sletting» (nå rød, var clay) | [ ] |
| `/admin/audit-log` · `/admin/feillogg` | `AdminAuditLogV2`/`AdminFeilloggV2` | lagt til 13.08 + rail flyttet Innsikt→Oppsett | ja | n/a | — | [ ] |

Reelle feil fikset: gdpr sendte ugyldig `aktiv="settings"` (railen lyste aldri); audit-log/feillogg
lå under Innsikt; klubb/innstillinger manglet rail-match; GDPR-sletting brukte clay-aksent på
destruktiv handling (nå `T.down`). STOPP: «System og logg»-konsolidering til én fane =
arkitekturendring; `klubb/integrasjoner` + `klubb/team(+inviter)` finnes ikke i kode; tittel
«Innstillinger» vs. «Oppsett» henger på rail-avklaringen (beslutninger.md).

## Detaljruter planbibliotek + turneringer (PR #442, `feat/w4-detaljruter`)

| Rute | Komponent | `data-paper-slug` | Tittel | Tom-tilstand | Primær handling | Sign-off |
|---|---|---|---|---|---|---|
| `/admin/plans/[planId]` | bespoke | lagt til 13.08 (`agencyos-planbibliotek`) + token-sjekk | plantittel | delvis (`EmptyState`) | ingen clay | [ ] |
| `/admin/plan-templates/[id]` (+rediger, ny) | `AdminPlanMalDetaljV2`/`…RedigerV2`/`…NyV2` | lagt til 13.08 | ja | ja/n/a | ja | [ ] |
| `/admin/okter` | `AdminOkterV2` | lagt til 13.08 | «Økter» | ja | én `CTAPill` | [ ] |
| `/admin/spillere/[id]/plan` | `AdminSpillerPlanV2` | lagt til 13.08 | «Spillerplan» | ja | — | [ ] |
| `/admin/tournaments/[id]` (+ny, dubletter) | bespoke + `TurneringWizardV2` + `MergeDubletterListe` | lagt til 13.08 (`agencyos-turneringer`) | ja | ja | maks én clay | [ ] |
| `/admin/tournaments`-familien | ny `loading.tsx` + `error.tsx` (manglet helt) | — | — | — | — | [ ] |

`/admin/plans/templates/*` = rene redirects (urørt). `turnering-kart` finnes ikke som rute.
STOPP: plans/[planId] fortsatt ikke v2-komponentisert (egen skjerm-jobb); `/admin/okter` trenger
`DataTable`-komponent som ikke finnes i src/ (eget byggeprosjekt); nested
`/admin/spillere/[id]/plan/[planId]` utenfor scope — neste pass.
