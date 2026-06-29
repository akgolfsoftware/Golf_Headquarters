# Forelder — skjerm-inventar (`/forelder` + `/inviter/forelder`)

> BASISPASS (skjerm-nivå). READ-ONLY. Hver påstand `fil:linje`, ellers `UVERIFISERT`.
> Forelder har **ingen ★/P0** i `docs/MASTER-SKJERMPLAN.md` → ingen element-detalj i denne runden
> (full element-detalj kommer i egen fase). Per skjerm noteres hvilken klient-/under-komponent som
> holder elementene, så neste fase er rask. Generert 2026-06-29. Samme skjema som `auth.*`.

## Kontekst (verifisert)
- **Antall skjermer:** 11 `/forelder/**/page.tsx` + 1 `/inviter/forelder/[token]/page.tsx` = **12**.
  Verifisert via `find src/app/forelder -name page.tsx` (11 treff) + `inviter`-treet (1).
- **Shell:** alle `/forelder/*` deler `src/app/forelder/layout.tsx:8` — sidebar (desktop, `lg:`) +
  mobil-nav fra `src/components/forelder/sidebar.tsx` (`ForelderSidebar`, `ForelderMobileNav`,
  `layout.tsx:5`), topbar med `UserMenu` (`layout.tsx:6`). `/inviter/...` er **utenfor** shell (egen
  fullskjerm-side, `[token]/page.tsx:35`).
- **Gating:** hver `/forelder/*`-side kaller `requirePortalUser({ allow: ["PARENT"] })` (eget kall i
  page + i layout). Helper redirecter ikke-PARENT (`requirePortalUser.ts:31-36`). `/inviter`-siden er
  **offentlig + token** (ingen auth-guard; `parentInvitation.findUnique({ where: { token } })`,
  `[token]/page.tsx:20`).
- **Tema:** lyst (mobil-først, ingen `.dark`). Roller for hele flaten: **PARENT** (`/inviter` = GUEST).

## Skjermer
| id | Rute | Fil | Jobb | Arketype | Desktop/mobil | Gating | Tilstander (loading/empty/error/success) | Elementer holdes av | Prioritet |
|---|---|---|---|---|---|---|---|---|---|
| forelder.hjem | `/forelder` | `src/app/forelder/page.tsx:9` | Forelder-landing: samtykke-status + ukerapport-narrativ + SG-trend + coach-notat | mobil-kolonne | mobil-først `max-w-[440px]`; ingen egne breakpoints i page (shell gir sidebar `lg:`) | auth · PARENT (`page.tsx:10`) | loading MANGLER · empty ✓ («ingen barn koblet», `page.tsx:13`) · error MANGLER · success ✓ (`<ForelderHjemTerminal>`, `page.tsx:24`) | `src/components/forelder/hjem-terminal.tsx` (`ForelderHjemTerminal`, import `page.tsx:7`) | P1 |
| forelder.barn | `/forelder/barn` | `src/app/forelder/barn/page.tsx:63` | Liste over koblede barn som fremgangs-kort (pyramide-snapshot, økter 30 d, neste økt, utestående) | mobil-kolonne | `max-w-[480px]`; kort er full-bredde, ingen `md:`-grid (shell gir desktop-sidebar) | auth · PARENT (`page.tsx:64`) | loading MANGLER · empty ✓ (`barn.length === 0`, `page.tsx:67`) + per-kort empty («Ingen fullførte økter», `page.tsx:255`) · error MANGLER · success ✓ (kort-liste, `page.tsx:183`) | inline i page.tsx (server) + `PyramidProgress`/`ForelderHero` fra `@/components/athletic` & `@/components/forelder/forelder-hero`; lokal `Stat`/`SectionLabel` (`page.tsx:55,294`) | P1 |
| forelder.barn.detalj | `/forelder/barn/[childId]` | `src/app/forelder/barn/[childId]/page.tsx:81` | Read-only barn-profil m/ fane-nav (oversikt/uke/mål/økonomi) via `?tab=` | mobil-kolonne (fluid hero-gradient) | `space-y-6` full-bredde; uke-KPI `grid sm:grid-cols-3` (`page.tsx:447`); ellers ett kolonnespor | auth · PARENT + eierskap (`assertBarnTilhorerForelder`→`notFound`, `page.tsx:95-96`); `notFound` hvis ikke PLAYER (`page.tsx:121`) | loading MANGLER · empty ✓ (per-seksjon: «Ingen aktiv plan» `:374`, «Ingen runder» `:418`, «Ingen mål» `:523`, «Ingen fakturaer» `:557`) · error → `notFound()` (`:96,121`) · success ✓ (`page.tsx:199`) | inline i page.tsx (server-rendret faner) + lokal `HybridKpi` (`page.tsx:599`); tab-state via URL `?tab=` (`page.tsx:91`) | P1 |
| forelder.bookinger | `/forelder/bookinger` | `src/app/forelder/bookinger/page.tsx:45` | Read-only innsyn i barnas bookede timer: mini uke-grid + kommende/tidligere kort | mobil-kolonne | `max-w-[480px]`; `grid-cols-7` uke-grid; ingen `md:`-skift | auth · PARENT (`page.tsx:46`); `dynamic="force-dynamic"` (`page.tsx:19`) | loading MANGLER · empty ✓ (ingen barn `:53`, ingen kommende `:225`) · error MANGLER · success ✓ (`BookingCard`-liste `:238`) | inline i page.tsx (server) + lokal `BookingCard`/`IngenBarn` (`page.tsx:275,336`); `AthleticEyebrow` fra `@/components/athletic` | P1 |
| forelder.coach | `/forelder/coach` | `src/app/forelder/coach/page.tsx:14` | Forventnings-side: coach-dialog «kommer Q3 2026» + support-CTA | mobil-kolonne | `space-y-8` full-bredde; ingen breakpoints i page | auth · PARENT (`page.tsx:15`); `dynamic="force-dynamic"` (`:12`) | loading n/a · empty = hele siden er coming-soon `EmptyState` (`page.tsx:26`) · error n/a · success n/a (statisk) | `ForelderHero` (`@/components/forelder/forelder-hero`) + `EmptyState` (`@/components/shared/empty-state`); ingen data-fetch | P2 |
| forelder.fakturaer | `/forelder/fakturaer` | `src/app/forelder/fakturaer/page.tsx:36` | Full faktura-historikk per barn + KPI (betalt hittil / neste forfall) | mobil-kolonne | `max-w-[480px]`; KPI `grid-cols-2` (`:84`); ett kolonnespor | auth · PARENT (`page.tsx:37`) | loading MANGLER · empty ✓ («Ingen fakturaer registrert», `:136`) · error MANGLER · success ✓ (liste `:141`) | inline i page.tsx (server); lokal `statusPille`/`ore` (`:19,26`); ingen separat klient-komponent | P2 |
| forelder.okonomi | `/forelder/okonomi` | `src/app/forelder/okonomi/page.tsx:82` | Lese-først økonomi-sammendrag: abonnement per barn + utestående + siste betalinger | mobil-kolonne | `max-w-[480px]`; `KpiStrip cols=3` (`:189`); abonnement-credits `grid-cols-2` (`:381`) | auth · PARENT (`page.tsx:83`); `dynamic="force-dynamic"` (`:34`) | loading MANGLER · empty ✓ (ingen barn `:88`, ingen betalinger `:243`) · error MANGLER · success ✓ (`:147`) | inline i page.tsx (server) + lokal `PanelHead`/`AbonnementRad`/`IngenBarn` (`:305,340,410`); `KpiCard`/`KpiStrip`/`AthleticBadge`/`ForelderHero` fra athletic & forelder | P2 |
| forelder.samtykke | `/forelder/samtykke` | `src/app/forelder/samtykke/page.tsx:48` | GDPR samtykke-admin per barn + data-handlinger (eksport/sletting) | mobil-kolonne | `max-w-[480px]`; ett kolonnespor; ingen `md:`-skift | auth · PARENT (`page.tsx:49`) | loading MANGLER · empty ✓ («Ingen tilknyttede barn», `:157`) · error MANGLER · success ✓ («Alle samtykker aktive» `:105` + per-barn `SamtykkeForm` `:172`) | **interaktiv:** `SamtykkeForm` (`./samtykke-form.tsx`, import `:17`) + `DataActions` (`./data-actions.tsx`, import `:18`); server-actions i `samtykke/actions.ts`; eksport-underflate `samtykke/eksport/` | P2 |
| forelder.ukerapport | `/forelder/ukerapport` | `src/app/forelder/ukerapport/page.tsx:20` | Read-only ukesoppsummering: «denne uka» 3 stat + coach-kommentar + høydepunkt | mobil-kolonne | `max-w-[440px]`; `flex gap-8` for 3 stat; ingen breakpoints | auth · PARENT (`page.tsx:21`); `dynamic="force-dynamic"` (`:13`) | loading MANGLER · empty ✓ (ingen barn `:24`); coach-note/høydepunkt betinget (`:62,77`) · error MANGLER · success ✓ (`:37`) | inline i page.tsx (server) + lokal `Stat` (`:101`); data fra `hentForelderUkerapport` | P2 |
| forelder.innstillinger | `/forelder/innstillinger` | `src/app/forelder/innstillinger/page.tsx:40` | Konto/kontakt/varsel-typer (read-only) + koblede barn + konto-lenker + logg ut | mobil-kolonne | `max-w-[480px]`; ett kolonnespor; ingen `md:`-skift | auth · PARENT (`page.tsx:41`); `dynamic="force-dynamic"` (`:30`) | loading MANGLER · empty ✓ (ingen barn `:127`) · error MANGLER · success ✓ (`:53`). Varselbrytere = read-only status «På» (`:187`) | inline i page.tsx (server) + lokal `InfoRad`/`KontoLenke` (`:242,263`); `ForelderHero`/`AthleticBadge`. Logg ut = `Link` til `/auth/login` (`:225`) | P2 |
| forelder.varsler | `/forelder/varsler` | `src/app/forelder/varsler/page.tsx:31` | Varsel-preferanser per barn (disabled toggles) + siste varsler fra Notification-feed | mobil-kolonne | `space-y-8` full-bredde; toggles `grid sm:grid-cols-2` (`:98`) | auth · PARENT (`page.tsx:32`) | loading MANGLER · empty ✓ (ingen barn `:73`, ingen varsler `:139`) · error MANGLER · success ✓ (`:85,144`). Toggles `disabled defaultChecked` (`:108-114`) | inline i page.tsx (server); `ForelderHero`; ingen egen klient-komponent (toggles er native disabled `input`) | P2 |
| forelder.inviter (token) | `/inviter/forelder/[token]` | `src/app/inviter/forelder/[token]/page.tsx:13` | Offentlig accept-side: verifiser token + registreringsskjema for ny forelder | fluid-editorial (sentrert `max-w-md`) | `min-h-screen`, sentrert kort; utenfor forelder-shell | **offentlig + token** (ingen auth; token-oppslag `:20`) | loading MANGLER · empty/ugyldig ✓ (4 token-states: ugyldig `:44`, brukt `:50`, utløpt `:60`, ok `:66`) · error = token-states · success → `AksepterForm` (`:73`) | **interaktiv:** `AksepterForm` (`./form.tsx`, import `:5`); server-action i `[token]/actions.ts` | P2 |

## Klient-/under-komponenter som holder elementene (for neste fase)
| Skjerm | Komponent(er) | Fil |
|---|---|---|
| forelder.hjem | `ForelderHjemTerminal` | `src/components/forelder/hjem-terminal.tsx` |
| forelder.barn | inline server + `Stat`/`SectionLabel` (lokal) + `PyramidProgress`, `ForelderHero` | `src/app/forelder/barn/page.tsx` |
| forelder.barn.detalj | inline server (tabs via URL) + `HybridKpi` (lokal) | `src/app/forelder/barn/[childId]/page.tsx` |
| forelder.bookinger | inline server + `BookingCard`/`IngenBarn` (lokal) | `src/app/forelder/bookinger/page.tsx` |
| forelder.coach | `EmptyState`, `ForelderHero` | `src/components/shared/empty-state.tsx`, `src/components/forelder/forelder-hero.tsx` |
| forelder.fakturaer | inline server | `src/app/forelder/fakturaer/page.tsx` |
| forelder.okonomi | inline server + `PanelHead`/`AbonnementRad`/`IngenBarn` (lokal) + `KpiCard`/`KpiStrip` | `src/app/forelder/okonomi/page.tsx` |
| forelder.samtykke | `SamtykkeForm`, `DataActions` (client) | `src/app/forelder/samtykke/samtykke-form.tsx`, `.../data-actions.tsx` |
| forelder.ukerapport | inline server + `Stat` (lokal) | `src/app/forelder/ukerapport/page.tsx` |
| forelder.innstillinger | inline server + `InfoRad`/`KontoLenke` (lokal) | `src/app/forelder/innstillinger/page.tsx` |
| forelder.varsler | inline server (native disabled toggles) | `src/app/forelder/varsler/page.tsx` |
| forelder.inviter | `AksepterForm` (client) | `src/app/inviter/forelder/[token]/form.tsx` |

## UVERIFISERT / merknader
- **Loading-tilstander:** Ingen av sidene har egen `loading.tsx` eller skeleton i page.tsx — alle er
  `async` server-komponenter som blokkerer til data er klart. Markert «loading MANGLER» (ikke feil, men
  ingen eksplisitt loading-skjerm finnes). Ikke verifisert om en rute-nær `loading.tsx` finnes utenfor
  page.tsx-treet — **UVERIFISERT** for hver rute.
- **error-tilstander:** Kun `forelder.barn.detalj` har eksplisitt feilhåndtering (`notFound()`,
  `[childId]/page.tsx:96,121`). Øvrige sider har ingen try/catch/error-grense i page → «error MANGLER»
  (uhåndtert DB-feil bobler til Next default error). Rute-nær `error.tsx` ikke sjekket → **UVERIFISERT**.
- **Element-innhold** (knapp-for-knapp, input-state, responsiv per element) er **ikke** kartlagt i denne
  runden — kommer i egen element-fase mot komponentene i tabellen over.
- **Interaktive klient-komponenter** (`SamtykkeForm`, `DataActions`, `AksepterForm`) er ikke åpnet →
  deres interne elementer/tilstander er **UVERIFISERT**.
