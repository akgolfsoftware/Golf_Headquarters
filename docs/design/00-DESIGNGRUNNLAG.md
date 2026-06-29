# AK Golf HQ — designgrunnlag (kode-verifisert 2026-06-29)

> Globalt grunnlag for skjerm-for-skjerm redesign. Per-skjerm-detaljer ligger i flate-filene (`10`–`50`). Hver påstand er fil:linje-verifisert eller merket `UVERIFISERT`.

## 0. Toppsammendrag
- **Stack:** Next.js 16 (App Router, proxy-middleware), React 19, Prisma 7 + Supabase (Postgres), Tailwind v4 (`@theme` i `globals.css`, ingen `tailwind.config`), shadcn/ui. Inter / Inter Tight / JetBrains Mono.
- **Flater (5):** Marketing `/` (lyst), PlayerHQ `/portal` (lyst), AgencyOS `/admin` (mørkt), Forelder `/forelder` (lyst), Auth `/auth` + diverse topp-nivå.
- **Antall skjermer:** **421 `page.tsx`** — portal 153 · admin 146 · marketing 72 (inkl. stats-underapp ~42) · forelder 11 · auth+misc ~35.
- **Dominerende designsystem:** terminal/lime-systemet med lime `#D1F843` som eneste aksent. AgencyOS mørk canvas retunet til varm nær-svart `#0A0B0A` (2026-06-28, `globals.css:61`). PlayerHQ/Marketing/Forelder lyst cream `#FAFAF7`.
- **Største designgjeld:** (1) **142 tsx-filer med hardkodet hex** utenfor tokens — verst i `(internal)/demos` + `onboard`-wizards. (2) **13 tsx-filer med emoji** (forbudt i UI). (3) Legacy **`CoachHQ`-rester** (13 filer, bl.a. `src/components/coachhq/`) ved siden av kanon-AgencyOS. (4) **ELITE-tier** lekker i type-unioner selv om dødt. (5) Konkurrerende Workbench-implementasjoner (`workbench/`, `workbench-hybrid/`, `coachhq/workbench/`, `portal/workbench/`).

## 1. Flater og ruter (struktur + antall — full enumerering i flate-filene)
| Flate | Rot | Tema | Ruter | Nøkkel-undertrær |
|---|---|---|---|---|
| Marketing | `src/app/(marketing)` | Lyst | 72 | rot + ~30 sider · **stats/** ~42 (arver marketing-layout, `UVERIFISERT` om foreldreløs) |
| PlayerHQ | `src/app/portal` | Lyst | 153 | `mal/` 24 · `tren/`+`(fullscreen)/` 27 · `meg/` ~40 · resten ~62 |
| AgencyOS | `src/app/admin` | Mørkt | 146 | flat `/admin` (ingen route-group, `admin/layout.tsx`) · agencyos/live/kalender, spillere/talent/tester/risiko, plans/workspace/teknisk-plan, drift |
| Forelder | `src/app/forelder` | Lyst | 11 | barn, bookinger, fakturaer, samtykke, ukerapport, varsler |
| Auth + misc | `src/app/auth` m.fl. | Blandet | ~35 | auth/* · `(internal)/demos` · `intern/komponenter` · `kommando` · `onboard` · `team-gfgk` · `dev-banekart` |

Foreldreløse/interne kandidater (verifiser i flate-fil): `(internal)/demos/*`, `intern/komponenter/*`, `dev-banekart` (midlertidig), `team-gfgk`, `meg` (topp-nivå, ikke `/portal/meg`).

## 2. Navigasjon per flate (lest fra nav-komponenten)
- **PlayerHQ bunnnav** (`src/components/portal/bottom-nav.tsx`): **Hjem** `/portal` · **Plan** `/portal/planlegge` · **Gjør** `/portal/gjennomfore` · **Analyse** `/portal/analysere` · **Meg** `/portal/meg`. (5 faner.) Sidebar/sub-nav: `src/components/portal/{sidebar,sub-nav,mobile-sidebar-drawer}.tsx`.
- **AgencyOS** (`src/components/admin/agencyos-sidebar.tsx:12`): 54px ikon-rail → 244px på hover; ordmerke «AgencyOS» (`:81`). Mobil: `agencyos-mobile-nav.tsx`; topbar: `agencyos-topbar.tsx`. `UVERIFISERT`: full faneliste i rekkefølge — les `agencyos-sidebar.tsx`.
- **Forelder** (`src/components/forelder/sidebar.tsx`): `UVERIFISERT` faneliste — les fila.
- **Marketing/stats:** marketing-header (`UVERIFISERT` fil). Stats arver marketing-layout (ingen egen `stats/layout.tsx`).

## 3. Designsystem og tokens
- **Kilde:** `src/app/globals.css` (`:root` lyst + `.dark` mørkt + `@theme inline`-mapping) speilet i `src/lib/design-tokens.ts`. **Én kanonisk kilde** (globals.css), men med **historiske aliaser** (`--t-*` terminal-stack, `--color-*` cockpit-tokens) som lever side om side.
- **Lyst (`:root`):** bg cream `#FAFAF7`, card `#FFFFFF`, ink `#0A1F17`, primary forest `#005840`, accent lime `#D1F843`, border `#E5E3DD`.
- **Mørkt (`.dark`, retunet 2026-06-28):** bg `#0A0B0A`, card `#171817`, border `#262725`, fg `#F0F0F0`, primary=lime. Data: up `#4FD08A` / down `#F0683E` / warn `#E8B43C` / info `#5AA9F0`.
- **Sprik:** «terminal-lys/lime» dominerer hele appen i dag; «heritage-grønn `#005840`» er primary-action-fargen i lyst tema (CTA/forest), ikke et konkurrerende system — men **forest-tonet mørk** (`#07100C`) er nettopp byttet ut, så eldre kode kan fortsatt referere forest-mørke `--color-*`-rails (sidebar-tokens `--color-coach-sidebar #0A1F17` står bevisst igjen, `globals.css:213`).
- **Fonter:** Inter + Inter Tight + JetBrains Mono lastet (`UVERIFISERT` eksakt `next/font`-konfig — sjekk `src/app/layout.tsx`).
- **Kvalitetsskann:** **142** tsx/jsx-filer med hardkodet hex (verst: `(internal)/demos/plan-bygger/[steg]` 51, `demos/ny-okt/[steg]` 39, `demos/newplan/[steg]` 30, `onboard/coach/coach-wizard` 28, `portal/tren/turneringer/[id]/turnering-client` 26, `onboard/klubb/klubb-wizard` 26). **13** filer med emoji (forbudt). Døde knapper / TODO / tilstands-skann: `UVERIFISERT` (kjør per flate-fil).

## 4. Komponentbibliotek
- `src/components/athletic/` — branded kjerne (Hero, Eyebrow, Card, KpiCard/KpiStrip, Badge, calendars/, data/shot-map). Sannhet for AK-DNA.
- `src/components/ui/` — shadcn-primitiver (ESLint-håndhevet).
- `src/components/{admin,portal,forelder}/` — flate-spesifikke (nav, shells, hero-er).
- `src/components/{shared,workbench,workbench-hybrid}/` — delt + planleggings-hub.
- **Duplikater/varianter (gjeld):** Workbench finnes i `workbench/`, `workbench-hybrid/`, `coachhq/workbench/`, `portal/workbench/`. Player-hero i både `coachhq/workbench/spiller-hero.tsx` og `portal/workbench/player-hero-v2.tsx` (begge med `Tier="...|ELITE"`). `UVERIFISERT` full dublett-kartlegging.

## 5. Gating
- **Abonnement:** `enum Tier { GRATIS, PRO, ELITE }` (`prisma/schema.prisma:24-27`). **ELITE er dødt** (CLAUDE.md + `booking-hub.tsx:93`) men **lekker i type-unioner** (`coachhq/workbench/spiller-hero.tsx:28`, `portal/workbench/player-hero-v2.tsx:27`) — skal fjernes fra UI-typer. Stripe-kobling: `UVERIFISERT` (sjekk `/portal/meg/abonnement/*` + `connect-src ... api.stripe.com`, `proxy.ts:51`).
- **Roller:** `enum UserRole { ADMIN, COACH, PLAYER, PARENT, GUEST }` (`schema:16`). Admin-tilgang via `AdminShell` i `admin/layout.tsx` (ikke route-group). CBAC/capability-gating brukt på admin finans/anlegg/bruker-sider (capability, ikke rolle-liste — jf. prosjekt-memory). `UVERIFISERT`: hvilke capabilities er definert men ikke håndhevet.

## 6. AK-domenet i UI (begrep → skjerm)
- **SG (OTT/APP/ARG/PUTT):** `/portal/mal/sg-hub` + `/portal/statistikk` + `/admin/analyse`/`lag-snitt`. **Dispersion/banekart:** `/portal/baneguide/*` (fase 1-5).
- **TrackMan:** `/portal/mal/trackman/*`, `/portal/trackman/[sessionId]`.
- **AK-formel økt-ID / pyramide (FYS/TEK/SLAG/SPILL/TURN) / L-faser:** Workbench (`/admin/coach-workbench`, `/portal/planlegge/workbench`) + plan-skjermer.
- **A–K nivå:** `/portal/talent/*`, admin spiller-flater.
- **Tester/PEI:** `/admin/tester/*`, `/portal/tren/tester`.
- `UVERIFISERT`: eksakt rendering av CS-nivå, M0–M5, PR1–PR5, P-posisjoner — kartlegges i flate-filene.

## 7. Konfliktrapport (løst mot koden)
1. **AgencyOS vs CoachHQ:** **AgencyOS er kanon** — 195 filer nevner det, sidebar-ordmerke «AgencyOS» (`agencyos-sidebar.tsx:81`). CoachHQ = legacy i 13 filer (bl.a. `src/components/coachhq/`) — skal bort fra ny UI.
2. **Coach-appens rute:** **flat `/admin`** — ingen route-group i `src/app/admin/`; vakthold via `AdminShell` i `admin/layout.tsx`.
3. **PlayerHQ nav-faner:** Hjem · Plan · Gjør · Analyse · Meg (`bottom-nav.tsx`) — se §2.
4. **PlayerHQ-tema:** **lyst cream** `#FAFAF7` — ingen `.dark` på portal-shell.
5. **Antall flater / Stats:** 5 flater + **Stats som halv-foreldreløs sub-app**. `(marketing)/stats/*` (45 ruter) har **eget designspor**: scoped `stats.css` med egne `--s-*`-tokens (`(marketing)/stats/stats.css:9-32`) + eget komponentbibliotek `src/components/stats/` (28 komp.) + egne `.dc.html` («Stats-plattform (eget spor)»). MEN ingen `stats/layout.tsx` (arver marketing-shell), og **ingen nav lenker dit** — `marketing-header.tsx:5`: «Stats og Turneringer ikke med i v1, aktiveres etter launch». Tiltenkt `StatsCmdK`-nav er ikke montert. Auth-grense uklar: `/stats/min-progresjon` + `/stats/sg-sammenlign/*` krever innlogging i offentlig marketing-flate (IA-spørsmål: hører personlig SG hjemme i PlayerHQ?). `--s-*` dupliserer globals' lyse HEX som egne aliaser.
6. **Auth-mekanisme:** **Supabase SSR i `src/proxy.ts`** (Next 16 proxy-middleware) via `updateSession` (`@/lib/supabase/proxy`). Leverandør: Supabase.

## 8. Redesign-prioritering
| Skjermgruppe | Flate | Prioritet | Hvorfor |
|---|---|---|---|
| `(internal)/demos/*`, `intern/komponenter/*` | Misc | **P3 / fjern** | Interne, 51+39+30 hardkodet hex — ikke produkt |
| Emoji-filer (13) + ELITE-type-lekkasje | Tvers | **P0** | Bryter låste regler — rask opprydding |
| AgencyOS cockpit/kalender/live | Admin | **P0** | Coachens daglige løkke; ny nær-svart canvas skal verifiseres |
| PlayerHQ kjerne (Hjem, analysere, mal/sg-hub, baneguide) | Portal | **P0** | Mest brukte spiller-flater |
| Workbench (begge) + dublett-konsolidering | Admin+Portal | **P1** | 4 konkurrerende implementasjoner |
| Marketing kjerne (/, priser, coaching, anlegg) | Marketing | **P1** | Salgsankere |
| Stats-underapp (~42) | Marketing | **P2** | Stor, men sekundær; avklar flate-status |
| Forelder | Forelder | **P2** | Liten, rolig; samtykke/faktura viktigst |
| Meg/innstillinger-undersider | Portal | **P3** | Mange tynne settings-skjermer |

> Full per-skjerm-prioritet i flate-filene. Denne tabellen grupperer.
