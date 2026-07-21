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


## Elementer (full element-detalj — 100 elementer, alle 12 skjermer + delt shell)

### `/forelder/*` (12)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.layout.skip.main | link | Hopp til hovedinnhold | native anchor | route: #forelder-main | sr-only, focus-visible | Skjult til fokusert (skip-link); samme … | src/app/forelder/layout.tsx:17 |
| forelder.layout.usermenu | button | Brukermeny (navn/e-post/avatar — Innsti… | UserMenu | client: dropdown-meny (UserMenu) | default, open | I header (banner) på alle bredder; User… | src/app/forelder/layout.tsx:37 |
| forelder.sidebar.nav.oversikt | link | Oversikt | next/link | route: /forelder | default, active(aria-current)… | Desktop: sidebar (lg:flex, w-56, label-… | src/components/forelder/sidebar.tsx:20 |
| forelder.sidebar.nav.barn | link | Mine barn | next/link | route: /forelder/barn | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:21 |
| forelder.sidebar.nav.bookinger | link | Bookinger | next/link | route: /forelder/bookinger | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:22 |
| forelder.sidebar.nav.okonomi | link | Okonomi | next/link | route: /forelder/okonomi | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:23 |
| forelder.sidebar.nav.coach | link | Coach | next/link | route: /forelder/coach | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:24 |
| forelder.sidebar.nav.ukerapport | link | Ukerapport | next/link | route: /forelder/ukerapport | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:25 |
| forelder.sidebar.nav.fakturaer | link | Fakturaer | next/link | route: /forelder/fakturaer | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:26 |
| forelder.sidebar.nav.varsler | link | Varsler | next/link | route: /forelder/varsler | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:27 |
| forelder.sidebar.nav.samtykke | link | Samtykker | next/link | route: /forelder/samtykke | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:28 |
| forelder.sidebar.nav.innstillinger | link | Innstillinger | next/link | route: /forelder/innstillinger | default, active(aria-current)… | Desktop sidebar / mobil bunn-nav. | src/components/forelder/sidebar.tsx:29 |

### `/forelder` (10)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.hjem.empty.tekst | slot | Ingen barn koblet til kontoen din ennå … | div | none: | default | Vises kun når data == null. max-w-[440p… | src/app/forelder/page.tsx:13 |
| forelder.hjem.eyebrow.uke | slot | Forelderportal · uke {ukenummer} | span | none: | default | Mobil-kolonne max-w-[440px]. | src/components/forelder/hjem-terminal.tsx:78 |
| forelder.hjem.h1.barnnavn | slot | {childName} · {childAge} år | h1 | none: | default | Mobil-kolonne. | src/components/forelder/hjem-terminal.tsx:81 |
| forelder.hjem.samtykke.status | slot | Samtykke aktivt / Samtykke kreves (med … | div | none: | consentActive, consentMissing | Lime/varsel-flate avhengig av consentAc… | src/components/forelder/hjem-terminal.tsx:90 |
| forelder.hjem.samtykke.administrer | link | Administrer | next/link | route: /forelder/samtykke | default, hover(underline) | Inline-lenke i samtykke-kort. Mobil-kol… | src/components/forelder/hjem-terminal.tsx:124 |
| forelder.hjem.kpi.oppmote | slot | Oppmøte — {oppmotePct} % | Kpi (lokal) | none: | default | 3-kolonne KPI-grid. Mobil-kolonne. | src/components/forelder/hjem-terminal.tsx:148 |
| forelder.hjem.kpi.sgtrend | slot | SG-trend — ▲/▼/■ {delta} | Kpi (lokal) | none: | default, tone-ok(sgRetning=op… | Midtcelle med border-x. Mobil-kolonne. | src/components/forelder/hjem-terminal.tsx:149 |
| forelder.hjem.kpi.streak | slot | Streak — {streak} | Kpi (lokal) | none: | default | 3-kolonne KPI-grid. Mobil-kolonne. | src/components/forelder/hjem-terminal.tsx:155 |
| forelder.hjem.fremgang.sgbars | slot | Fremgang · siste 8 uker (SG-søylediagra… | div (bars) | none: | default | 8 søyler, gradient accent→primary. Mobi… | src/components/forelder/hjem-terminal.tsx:160 |
| forelder.hjem.coachnote | slot | Coach-notat ({author} · coach + body) | div | none: | default, skjult(ingen coachNo… | Vises kun når data.coachNote finnes. Mo… | src/components/forelder/hjem-terminal.tsx:184 |

### `/forelder/barn` (7)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.barn.empty.hero | slot | Mine barn (hero) — tomtilstand når inge… | ForelderHero | none: | default | Vises kun ved barn.length===0. max-w-[4… | src/app/forelder/barn/page.tsx:70 |
| forelder.barn.hero.avatar | link | Endre profilbilde (hero-avatar) | next/link + AthleticAvatar | route: /forelder/innstillinger | default, hover(camera-overlay) | ForelderHero-avatar. Kun rendret når av… | src/components/forelder/forelder-hero.tsx:35 |
| forelder.barn.card.link | link | Barn-kort (avatar + navn + HCP + pyrami… | next/link | route: /forelder/barn/{childId} | default, hover(border), focus… | Per barn i liste. Klikkbart helkort. ma… | src/app/forelder/barn/page.tsx:216 |
| forelder.barn.card.pyramide | slot | Pyramide · siste 30 dager (PyramidProgr… | PyramidProgress | none: | harOkter, ingenOkter(tomtekst) | Inni barn-kort. Mobil-kolonne. | src/app/forelder/barn/page.tsx:246 |
| forelder.barn.card.stat.okter | slot | Økter — {antall} (Stat-celle) | Stat (lokal) | none: | default | 3-kolonne dl i barn-kort. Mobil-kolonne. | src/app/forelder/barn/page.tsx:263 |
| forelder.barn.card.stat.neste | slot | Neste — {dato\|—} (Stat-celle) | Stat (lokal) | none: | default | 3-kolonne dl i barn-kort. Mobil-kolonne. | src/app/forelder/barn/page.tsx:269 |
| forelder.barn.card.stat.utestaaende | slot | Utestående — {beløp\|0 kr} (Stat-celle,… | Stat (lokal) | none: | default, alert(utestående>0) | 3-kolonne dl i barn-kort. Mobil-kolonne. | src/app/forelder/barn/page.tsx:275 |

### `/forelder/barn/[childId]` (12)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.barn.detalj.tilbake | link | Mine barn (tilbake-lenke) | next/link | route: /forelder/barn | default, hover | Topp av side. Mobil-kolonne. | src/app/forelder/barn/[childId]/page.tsx:202 |
| forelder.barn.detalj.hero | slot | Hero forest-card (avatar/initialer + na… | div (gradient) | none: | default | Forest-gradient hero. Mobil-kolonne (sp… | src/app/forelder/barn/[childId]/page.tsx:210 |
| forelder.barn.detalj.pyramide | slot | Pyramide-balanse (5 akser FYS/TEK/SLAG/… | div | none: | default, ingen-plan(tomtekst) | Hvit card. Mobil-kolonne. | src/app/forelder/barn/[childId]/page.tsx:267 |
| forelder.barn.detalj.sesongmal | slot | Sesongmål · fremdrift (mål-liste m/ pla… | div | none: | default, skjult(ingen mål) | Vises kun når barn.goals.length>0. Mobi… | src/app/forelder/barn/[childId]/page.tsx:299 |
| forelder.barn.detalj.tab.oversikt | tab | OVERSIKT | next/link | route: /forelder/barn/{childId}?tab=oversikt | default, active(aria-current)… | Server-render fane via ?tab=. Tab-rad u… | src/app/forelder/barn/[childId]/page.tsx:347 |
| forelder.barn.detalj.tab.uke | tab | UKE | next/link | route: /forelder/barn/{childId}?tab=uke | default, active(aria-current)… | Server-render fane via ?tab=. Mobil-kol… | src/app/forelder/barn/[childId]/page.tsx:347 |
| forelder.barn.detalj.tab.mal | tab | MÅL | next/link | route: /forelder/barn/{childId}?tab=mal | default, active(aria-current)… | Server-render fane via ?tab=. Mobil-kol… | src/app/forelder/barn/[childId]/page.tsx:347 |
| forelder.barn.detalj.tab.okonomi | tab | ØKONOMI | next/link | route: /forelder/barn/{childId}?tab=okonomi | default, active(aria-current)… | Server-render fane via ?tab=. Mobil-kol… | src/app/forelder/barn/[childId]/page.tsx:347 |
| forelder.barn.detalj.panel.oversikt | slot | Aktiv plan (øktliste m/ rating) + Siste… | div | none: | tab=oversikt, tom(ingen plan/… | Vises når tab===oversikt. Mobil-kolonne. | src/app/forelder/barn/[childId]/page.tsx:365 |
| forelder.barn.detalj.panel.uke | slot | Uke — 3 HybridKpi (økter/treningstid/sn… | HybridKpi + div | none: | tab=uke, tom(ingen logg) | Vises når tab===uke. KPI-grid sm:grid-c… | src/app/forelder/barn/[childId]/page.tsx:444 |
| forelder.barn.detalj.panel.mal | slot | Mål — Aktive mål-liste | div | none: | tab=mal, tom(ingen mål) | Vises når tab===mal. Mobil-kolonne. | src/app/forelder/barn/[childId]/page.tsx:514 |
| forelder.barn.detalj.panel.okonomi | slot | Økonomi — Betalinger-liste m/ status-pi… | div | none: | tab=okonomi, tom(ingen faktur… | Vises når tab===okonomi. Mobil-kolonne. | src/app/forelder/barn/[childId]/page.tsx:543 |

### `/forelder/bookinger` (6)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.bookinger.h1 | slot | Bookinger & øktplan (editorial H1) | h1 | none: | default | max-w-[480px] mobil-kolonne. | src/app/forelder/bookinger/page.tsx:139 |
| forelder.bookinger.weekgrid.prev | slot | Forrige måned (chevron — visuell, ikke … | div | none: | static | Ikon i div, ingen onClick/href — dekora… | src/app/forelder/bookinger/page.tsx:152 |
| forelder.bookinger.weekgrid.next | slot | Neste måned (chevron — visuell, ikke in… | div | none: | static | Ikon i div, ingen onClick/href — dekora… | src/app/forelder/bookinger/page.tsx:155 |
| forelder.bookinger.weekgrid.cells | slot | Uke-grid (7 dager m/ i-dag + booking-pr… | div | none: | default, isToday, hasBooking | grid-cols-7. Mobil-kolonne. | src/app/forelder/bookinger/page.tsx:174 |
| forelder.bookinger.kommende.list | slot | Kommende bookinger (BookingCard-liste) … | BookingCard (lokal) | none: | default, tom(ingen kommende) | Lese-modus, ingen handling på vegne av … | src/app/forelder/bookinger/page.tsx:225 |
| forelder.bookinger.tidligere.list | slot | Tidligere bookinger (BookingCard dempet) | BookingCard (lokal) | none: | default, skjult(ingen tidlige… | Vises kun når tidligere.length>0. Mobil… | src/app/forelder/bookinger/page.tsx:245 |

### `/forelder/coach` (3)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.coach.hero | slot | Dialog med coach (hero) | ForelderHero | none: | default | space-y-8, ingen max-w-wrapper (bredere… | src/app/forelder/coach/page.tsx:19 |
| forelder.coach.emptystate | slot | Coach-dialog kommer Q3 2026 (EmptyState) | EmptyState | none: | default | Sentrert tomtilstand. Mobil-kolonne. | src/app/forelder/coach/page.tsx:26 |
| forelder.coach.cta.support | link | Kontakt support i mellomtiden | native anchor (mailto) | external: mailto:support@akgolf.no?subject=Spørsmål%20fra%20foreldre | default, hover | CTA-pill i EmptyState. Mobil-kolonne. | src/app/forelder/coach/page.tsx:32 |

### `/forelder/fakturaer` (5)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.fakturaer.h1 | slot | Fakturaer & økonomi (editorial H1) | h1 | none: | default | max-w-[480px] mobil-kolonne. | src/app/forelder/fakturaer/page.tsx:78 |
| forelder.fakturaer.kpi.betalt | slot | Betalt hittil — {kr} · 2026 | div | none: | default | 2-kolonne KPI. Mobil-kolonne. | src/app/forelder/fakturaer/page.tsx:85 |
| forelder.fakturaer.kpi.nesteforfall | slot | Neste forfall — {kr\|—} | div | none: | harForfall(warn), ingenForfall | 2-kolonne KPI. Mobil-kolonne. | src/app/forelder/fakturaer/page.tsx:97 |
| forelder.fakturaer.historikk.list | slot | Fakturahistorikk (dato-boks + beskrivel… | ul | none: | default, tom(ingen fakturaer) | Liste-card. Mobil-kolonne. | src/app/forelder/fakturaer/page.tsx:131 |
| forelder.fakturaer.note.epost | link | hei@akgolf.no (lesemodus-notis) | native anchor (mailto) | external: mailto:hei@akgolf.no | default, hover(underline) | Inline-lenke i notis. Mobil-kolonne. | src/app/forelder/fakturaer/page.tsx:196 |

### `/forelder/okonomi` (7)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.okonomi.empty.hero | slot | Abonnement og betaling (hero) — tomtils… | ForelderHero | none: | default | Vises kun ved childIds.length===0. max-… | src/app/forelder/okonomi/page.tsx:91 |
| forelder.okonomi.hero | slot | Abonnement og betaling (hero) | ForelderHero | none: | default | max-w-[480px] mobil-kolonne. | src/app/forelder/okonomi/page.tsx:149 |
| forelder.okonomi.varsel.utestaaende | link | {N} utestående betalinger · {kr} (varse… | next/link | route: /forelder/fakturaer | default, hover, focus-visible… | Vises kun når ubetalte.length>0. Mobil-… | src/app/forelder/okonomi/page.tsx:161 |
| forelder.okonomi.kpi.strip | slot | KPI-strip (Utestående / Betalt totalt /… | KpiStrip + KpiCard | none: | default | 3-kolonne KpiStrip. Mobil-kolonne. | src/app/forelder/okonomi/page.tsx:189 |
| forelder.okonomi.abonnement.list | slot | Abonnement per barn (AbonnementRad — ti… | AbonnementRad (lokal) + Athle… | none: | default, pro(credits-grid) | Liste-card. Mobil-kolonne. | src/app/forelder/okonomi/page.tsx:214 |
| forelder.okonomi.siste.sealle | link | Se alle (siste betalinger panel-header) | next/link | route: /forelder/fakturaer | default, hover(underline) | Panel-header-lenke (PanelHead href). Mo… | src/app/forelder/okonomi/page.tsx:236 |
| forelder.okonomi.siste.list | slot | Siste betalinger (4 preview) / tomtilst… | ul | none: | default, tom(ingen betalinger) | Liste-card. Mobil-kolonne. | src/app/forelder/okonomi/page.tsx:243 |

### `/forelder/samtykke` (10)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.samtykke.h1 | slot | Personvern & samtykke (editorial H1) | h1 | none: | default | max-w-[480px] mobil-kolonne. | src/app/forelder/samtykke/page.tsx:97 |
| forelder.samtykke.banner.alleaktive | slot | Alle samtykker aktive og oppdatert (suk… | div | none: | skjult, vises(alleAktive) | Vises kun når alleAktive. Mobil-kolonne. | src/app/forelder/samtykke/page.tsx:105 |
| forelder.samtykke.datatillatelser.overview | slot | Datatillatelser (visuell oversikt m/ de… | ul | none: | static(defaultOn/off) | Visuell oversikt; togglene er IKKE inte… | src/app/forelder/samtykke/page.tsx:115 |
| forelder.samtykke.guardian.info | slot | Du er ansvarlig for samtykkene … (guard… | div | none: | default | Info-kort. Mobil-kolonne. | src/app/forelder/samtykke/page.tsx:144 |
| forelder.samtykke.form.checkbox | checkbox | Samtykke-checkbox (per type: fotoBruk/d… | native input[type=checkbox] (… | client: toggle(key) — lokal state valg | checked, unchecked | Per barn-seksjon (SamtykkeForm). En rad… | src/app/forelder/samtykke/samtykke-form.tsx:58 |
| forelder.samtykke.form.submit | button | Lagre samtykker / Lagrer … | native button | server-action: lagreSamtykker(childId, valg) [skriver: User.preferenc… | default, disabled(pending), l… | En submit per barn-seksjon. h-11 knapp.… | src/app/forelder/samtykke/samtykke-form.tsx:88 |
| forelder.samtykke.data.eksport | link | Last ned alle data (GDPR-eksport) | native anchor (DataActions) | route: /forelder/samtykke/eksport (GET route.ts — laster ned JSON-eks… | default | Full-bredde rad i DataActions. Mobil-ko… | src/app/forelder/samtykke/data-actions.tsx:45 |
| forelder.samtykke.data.slett | button | Be om sletting av data / Sender forespø… | native button (DataActions) | server-action: beOmDataSletting() [skriver: DataExportRequest (type=D… | default, disabled(pending), l… | Destruktiv full-bredde knapp. Mobil-kol… | src/app/forelder/samtykke/data-actions.tsx:53 |
| forelder.samtykke.data.kvittering | slot | Slette-forespørsel registrert (kvitteri… | div | none: | skjult, vises(sendt\|\|sisteS… | Vises etter sletteforespørsel eller hvi… | src/app/forelder/samtykke/data-actions.tsx:66 |
| forelder.samtykke.policy.epost | link | personvern@akgolf.no (datapolicy-seksjo… | native anchor (mailto) | external: mailto:personvern@akgolf.no | default, hover(underline) | Inline-lenke i policy-liste. Mobil-kolo… | src/app/forelder/samtykke/page.tsx:203 |

### `/forelder/ukerapport` (5)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.ukerapport.empty | slot | Ingen barn er koblet til kontoen din en… | div | none: | default | Vises kun når d == null. max-w-[440px] … | src/app/forelder/ukerapport/page.tsx:24 |
| forelder.ukerapport.h1 | slot | Ukerapport (header m/ eyebrow Uke {n} ·… | header | none: | default | max-w-[440px] mobil-kolonne. | src/app/forelder/ukerapport/page.tsx:40 |
| forelder.ukerapport.denneuka | slot | Denne uka — 3 stat (Økter / Trent / SG) | Stat (lokal) | none: | default | Card m/ 3 stat-kolonner. Mobil-kolonne. | src/app/forelder/ukerapport/page.tsx:50 |
| forelder.ukerapport.coachkommentar | slot | Coachens kommentar ({body} — {author}) | div | none: | default, skjult(ingen coachNo… | Vises kun når d.coachNote. Mobil-kolonn… | src/app/forelder/ukerapport/page.tsx:62 |
| forelder.ukerapport.hoydepunkt | slot | Høydepunkt ({testNavn} · beste resultat… | div | none: | default, skjult(ingen høydepu… | Vises kun når d.hoydepunkt. Mobil-kolon… | src/app/forelder/ukerapport/page.tsx:77 |

### `/forelder/innstillinger` (9)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.innstillinger.hero.avatar | link | Endre profilbilde (hero-avatar m/ initi… | next/link + AthleticAvatar (F… | route: /forelder/innstillinger | default, hover(camera-overlay) | Hero har avatarInitials → avatar rendre… | src/components/forelder/forelder-hero.tsx:35 |
| forelder.innstillinger.kontakt.rediger | link | Rediger (kontaktinfo) | next/link | route: /portal/meg | default, hover(underline) | Header-lenke i kontaktinfo-card. Mobil-… | src/app/forelder/innstillinger/page.tsx:81 |
| forelder.innstillinger.kontakt.rows | slot | Kontaktinfo-rader (Navn / E-post / Tele… | InfoRad (lokal) | none: | default, telefon-mangler | dl i card. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:88 |
| forelder.innstillinger.barn.sealle | link | Se alle (koblede barn) | next/link | route: /forelder/barn | default, hover(underline) | Header-lenke i barn-card. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:120 |
| forelder.innstillinger.barn.list | slot | Koblede barn-liste (navn + relasjon + K… | ul + AthleticBadge | none: | default, tom(ingen barn) | Liste i card. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:127 |
| forelder.innstillinger.varsler.list | slot | Varsler — typer du mottar (read-only «P… | ul + AthleticBadge | none: | static(På) | Read-only status. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:155 |
| forelder.innstillinger.konto.passord | link | Endre passord (Via Supabase Auth) | next/link (KontoLenke) | route: /portal/meg/innstillinger/sikkerhet | default, hover, focus-visible | Konto-lenke-rad. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:211 |
| forelder.innstillinger.konto.2fa | link | To-faktor-autentisering (Ikke aktivert) | next/link (KontoLenke) | route: /portal/meg/innstillinger/sikkerhet | default, hover, focus-visible | Konto-lenke-rad. Mobil-kolonne. | src/app/forelder/innstillinger/page.tsx:217 |
| forelder.innstillinger.konto.loggut | link | Logg ut | next/link | route: /auth/login | default, hover, focus-visible | Destruktiv-tonet rad nederst. Mobil-kol… | src/app/forelder/innstillinger/page.tsx:223 |

### `/forelder/varsler` (5)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forelder.varsler.hero | slot | Velg hva du vil varsles om (hero) | ForelderHero | none: | default | space-y-8, ingen max-w-wrapper. Mobil-k… | src/app/forelder/varsler/page.tsx:47 |
| forelder.varsler.info.spor1 | slot | Push-varsler aktiveres i Spor 1 (info —… | section | none: | default | Info-kort. Mobil-kolonne. | src/app/forelder/varsler/page.tsx:55 |
| forelder.varsler.toggle.kanal | checkbox | Varsel-toggle per barn/kanal (okt_planl… | native input[type=checkbox] | none: disabled defaultChecked — read-only, ingen handler | disabled, checked(default) | 4 kanaler per barn (grid sm:grid-cols-2… | src/app/forelder/varsler/page.tsx:108 |
| forelder.varsler.empty.ingenbarn | slot | Ingen barn koblet ennå (tomtilstand for… | section | none: | vises(barn.length===0) | Mobil-kolonne. | src/app/forelder/varsler/page.tsx:73 |
| forelder.varsler.siste.list | slot | Siste varsler (Notification-feed: ikon … | ul | none: | default, tom(ingen varsler) | Liste-card. Mobil-kolonne. | src/app/forelder/varsler/page.tsx:124 |

### `/inviter/forelder/[token]` (9)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| inviter.forelder.status.ugyldig | slot | Invitasjonen finnes ikke (ugyldig token) | p | none: | vises(status=ugyldig) | Offentlig side (utenfor forelder-layout… | src/app/inviter/forelder/[token]/page.tsx:44 |
| inviter.forelder.status.brukt.login | link | innloggingen (når invitasjon allerede b… | native anchor | route: /auth/login | default, underline, vises(sta… | Inline-lenke i brukt-melding. max-w-md. | src/app/inviter/forelder/[token]/page.tsx:53 |
| inviter.forelder.status.utlopt | slot | Invitasjonen utløp {dato} (utløpt token) | p | none: | vises(status=utlopt) | max-w-md. | src/app/inviter/forelder/[token]/page.tsx:60 |
| inviter.forelder.form.firstName | input | Fornavn | native input (Felt, AksepterF… | client: FormData firstName (required) | default, required, focus-visi… | 2-kolonne grid m/ Etternavn (sm:grid-co… | src/app/inviter/forelder/[token]/form.tsx:26 |
| inviter.forelder.form.lastName | input | Etternavn | native input (Felt) | client: FormData lastName (required) | default, required, focus-visi… | 2-kolonne grid. max-w-md. | src/app/inviter/forelder/[token]/form.tsx:27 |
| inviter.forelder.form.email | input | E-post (forhåndsutfylt, disabled) | native input (Felt) | none: defaultValue=invitation.email, disabled | disabled, defaultValue | Full bredde. max-w-md. | src/app/inviter/forelder/[token]/form.tsx:30 |
| inviter.forelder.form.phone | input | Telefon (type=tel, valgfri) | native input (Felt) | client: FormData phone (valgfri) | default, focus-visible | Full bredde. max-w-md. | src/app/inviter/forelder/[token]/form.tsx:32 |
| inviter.forelder.form.password | input | Velg passord (type=password, min 8 tegn) | native input (Felt) | client: FormData password (required, ≥8) | default, required, focus-visi… | Full bredde. max-w-md. | src/app/inviter/forelder/[token]/form.tsx:34 |
| inviter.forelder.form.submit | button | Godta og opprett konto / Oppretter kont… | native button (submit, Aksept… | server-action: aksepterInvitasjon(FormData) [skriver: Supabase Auth c… | default, disabled(pending), l… | Full-bredde pill-knapp. Feil vises over… | src/app/inviter/forelder/[token]/form.tsx:48 |
