> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Fase 0 — kartlegging før designport

Målt 2026-08-02 i `akgolfsoftware/Golf_Headquarters`, branch `claude/akgolf-design-mapping-xvov2s`.
Ingen kodeendringer gjort. `prisma migrate dev` er IKKE kjørt.

Arbeidskatalogen var `/home/user/Golf_Headquarters`, ikke `~/Developer/akgolf-hq` — samme repo,
verifisert med `git remote -v` (origin = akgolfsoftware/Golf_Headquarters).

Alle tall nedenfor kommer fra kommandoene som står oppgitt. Der noe ikke lot seg måle står det eksplisitt.

---

## Kort svar først

Den viktigste konklusjonen er ikke rutedekningen — den er **spørsmål 2**. Repoet har ikke
ett stilsystem som `akhq-tokens.css` kan legge seg over. Det har **fire parallelle
token-filer og 340 unike CSS-variabler i `globals.css` alene**, med tre lag av aliaser
som peker på hverandre. Å innføre en femte kilde uten å bestemme hva som skjer med de
fire eksisterende gir tokens som taper mot eksisterende regler i tilfeldige rekkefølger.

Sekundært: **designbiblioteket finnes ikke på disk i denne sessionen.** Verken
`components/` (78) eller `fase1/` (19 HTML) ligger i repoet eller i hjemmekatalogen.
Neste session kan ikke sammenligne mot fasit uten at filene gjøres tilgjengelige.

---

## Spørsmål 1 — ruter

```bash
find src/app -name "page.tsx" | wc -l
find src/app -name "page.tsx" | sed 's|^src/app||; s|/page.tsx$||' | sort
```

**454 `page.tsx`-ruter.** (CLAUDE.md sier ~449 — tallet har vokst med 5.)

Fordeling på topp-nivå, målt fra samme liste:

| Område | Ruter |
|---|---|
| `(marketing)/` | 76 |
| `admin/` | ~120 (inkl. `admin/(legacy)/` ~45) |
| `portal/` | ~150 (inkl. `portal/(legacy)/` ~30, `portal/(fullscreen)/` 11) |
| `forelder/`, `auth/`, `kommando/`, `meg/`, `intern/`, `gfgk-junior/`, `team-*`, `onboard/`, `inviter/`, `(internal)/`, `offline/`, `dev-banekart/` | resten |

Konsekvens for porten: `admin/(legacy)/` og `portal/(legacy)/` er ~75 ruter som ikke er
målbildet. Porten bør ikke røre dem — men de deler `globals.css`, så en token-endring
treffer dem uansett. Det er et argument for at fase 1.1 må være additiv, ikke erstattende.

### De 19 fasitflatene

Se tabellen nederst i dokumentet.

## Spørsmål 2 — stilsystem

```bash
find . -name "akhq*" -not -path "./node_modules/*"        # 0 treff
grep -rl "akhq-" --include="*.css" --include="*.tsx" .     # 0 treff
find src -name "*.module.css" | wc -l                      # 0
grep -E '"(styled-components|@emotion|tailwindcss)"' package.json
```

- **`akhq-tokens.css` finnes ikke.** Ingen fil, ingen klasse, ingen variabel med `akhq`-prefiks
  noe sted i repoet. Kaskadelagene `akhq-base` / `akhq-container` / `akhq-modifier` er heller
  ikke i bruk.
- **Tailwind CSS v4**, CSS-first (`@theme` i `globals.css`, ingen `tailwind.config`).
  Pluss `clsx` 2.1.1 og `tailwind-merge` 3.5.0.
- **Ingen CSS-moduler** (0 `.module.css`), **ingen styled-components, ingen emotion.**
- 21 håndskrevne CSS-filer i `src/`, hvorav 4 er token-filer.

### Konkurrerende variabelnavn — dette er funnet som endrer rekkefølgen

```bash
for f in src/app/globals.css src/styles/golfdata-tokens.css src/styles/wang-tokens.css \
         src/styles/gfgk-junior-tokens.css src/styles/v2/patterns.css; do
  echo "$f $(grep -cE '^\s*--[a-zA-Z0-9-]+\s*:' $f)"; done
grep -oE '^\s*--[a-zA-Z0-9-]+' src/app/globals.css | tr -d ' ' | sort -u | wc -l
```

| Fil | Variabel-deklarasjoner |
|---|---:|
| `src/app/globals.css` | 454 (340 unike navn) |
| `src/styles/golfdata-tokens.css` | 161 |
| `src/styles/wang-tokens.css` | 78 |
| `src/styles/gfgk-junior-tokens.css` | 63 |
| `src/styles/v2/patterns.css` | 2 |
| `src/styles/v2/motion.css` | 0 |
| **Sum** | **758** |

Ja, `--bg`, `--fg`-familien og `--accent` finnes allerede — og de gjør allerede jobben,
i minst tre lag oppå hverandre:

- **Lag 1, råverdier:** `--sand-50`, `--graphite-0`, `--lime-500` …
- **Lag 2, DS-navn:** `--bg: var(--sand-50)` (linje 203), `--bg: var(--graphite-0)` i mørk (linje 263)
- **Lag 3, shadcn-formede aliaser:** `--color-background: var(--bg)` (linje 319), pluss
  hsl-tripletter `--background: 60 15.8% 96.3%` (linje 19) som *ikke* er samme mekanisme

I tillegg: `--handling: var(--v2-handling)` (linje 766) — den låste `#D97757`-tokenen fra
2026-07-31 — og 15 akse-tokens (`--axis-fys`, `--axis-slag`, `--axis-spill`, `--axis-tek`,
`--axis-turn`, hver med `-soft`/`-text`), 6 chart-tokens, coach-sidebar-tokens.

`@layer` brukes bare to steder (`globals.css:516` og `:529`), begge `@layer base`, og
kommentaren på linje 514 forklarer hvorfor: unlayered CSS slår ut alle Tailwind-utilities.
Det er akkurat den fella et innkommende `akhq-base`/`akhq-container`/`akhq-modifier`-oppsett
vil gå i hvis det legges inn uten en plan for lagrekkefølgen mot Tailwind v4s egne lag.

**Dette er et konkurrerende stilsystem.** Per instruksen i oppdraget betyr det at neste
session ikke er «tokens inn som eneste kilde», men beslutningen om hva som skjer med de
fire eksisterende token-filene og de tre aliaslagene. Begrunnelsen: en femte kilde uten
den beslutningen gir kollisjoner på `--bg`, `--accent` og `--handling` som ikke feiler
høylytt — de rendrer bare feil farge på tilfeldige flater, og det oppdages skjerm for
skjerm gjennom hele resten av kjeden.

## Spørsmål 3 — komponenter

```bash
ls src/components/ui/ | wc -l          # 21
find src/components -name "*.tsx" | wc -l   # 618
find src/components/v2 -name "*.tsx" | wc -l # 28
grep -c "radix" package.json           # 0
ls components.json                      # finnes ikke
```

- **Ingen av de 78 designbibliotek-komponentene er inne.** Ikke målt mot en filliste —
  biblioteket finnes ikke på disk (se under) — men `akhq`-søket ga 0 treff i hele repoet,
  så ingen av dem er inne under sitt eget navnerom.
- **Ikke shadcn/ui i praksis.** `@radix-ui` står ikke i `package.json` i det hele tatt
  (0 treff), og det finnes ingen `components.json`. CLAUDE.md kaller `ui/` «shadcn-basert»
  — det er riktig som *opphav og formspråk*, men primitivene er håndskrevne uten Radix
  under. Konsekvens: ingen headless-avhengighet å ta hensyn til ved bytte, men heller
  ingen a11y-oppførsel som kommer gratis.
- **618 egne komponentfiler** totalt i `src/components/`, fordelt på 27 undermapper.
  21 av dem er primitiver i `ui/`, 28 i `v2/`.

De 21 primitivene: breadcrumb, button, checkbox, dialog, dropdown-menu, icon, input,
kpi-card, popover, progress-bar, progress-ring, radio, select, sheet, skeleton, switch,
tabs, textarea, toast, tooltip (+ `index.ts`).

### Designbiblioteket finnes ikke på disk

```bash
ls -a /home/user/            # kun Golf_Headquarters
ls ~/Developer               # finnes ikke
git branch -a                # kun main + claude/akgolf-design-mapping-xvov2s
```

Verken `components/` (78 stk) eller `fase1/` (19 HTML) ligger i repoet, i hjemmekatalogen
eller på en branch. Branchen `chore/paper-speil-lokal` som CLAUDE.md viser til finnes
ikke på origin. **Neste session kan ikke verifisere mot fasit før filene er lagt inn.**

## Spørsmål 4 — datahenting

```bash
grep -rl "^\"use client\"" src/app --include="page.tsx" | wc -l   # 3
grep -rl "@/lib/prisma" src/app --include="page.tsx" | wc -l      # 216
grep -rl "use server" src --include="*.ts" --include="*.tsx" | wc -l  # 170
find src/app/api -name "route.ts" | wc -l                          # 55
grep -rln "createBrowserClient" src                                # 1 fil
```

Mønsteret er entydig: **Server Components med Prisma direkte**, pluss server actions.

- **216 av 454 `page.tsx` importerer `@/lib/prisma` direkte.** Kun **3** sider er
  `"use client"` — datahenting skjer nesten utelukkende på server.
- **170 filer med server actions** (`"use server"`).
- **55 API-ruter** under `src/app/api/` — cron, webhooks, trackman, booking, public.
  Disse er for eksterne kall, ikke for sidens egen datahenting.
- **Supabase-klient i nettleseren brukes ikke til data.** `createBrowserClient` finnes
  i én fil, `src/lib/supabase/client.ts`, og den er auth-relatert. Ingen sider henter
  forretningsdata via Supabase-klient fra browseren.

### Konkret eksempel — `src/app/portal/meg/page.tsx`

```tsx
export const dynamic = "force-dynamic";

export default async function V2MegPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  const [profil, goals, agg] = await Promise.all([
    hentProfil(),                 // server action
    getGoals(user.id, 3),         // server action
    prisma.round.aggregate({ where: { userId: user.id }, ... }),  // Prisma direkte
  ]);
```

Async Server Component → auth-guard → `Promise.all` av server actions og direkte
Prisma-kall → data sendes som props til en klientkomponent (`MegV2`) som kun rendrer.
Dette er mønsteret porten skal følge: **skjermkomponenten tar props, henter ikke selv.**

## Spørsmål 5 — nav i `/admin/agencyos`

```bash
ls src/app/admin/agencyos/
grep -nE "export const [A-Z_]*NAV" src/components/v2/shell.tsx
```

Ruten finnes: `src/app/admin/agencyos/page.tsx` + `actions.ts`, `error.tsx`, `loading.tsx`,
og undersidene `caddie/` (med `aktivitet`, `dashbord`), `live/`, `okonomi/`, `spillere/`, `uka/`.
**Ingen egen `layout.tsx`** — chrome kommer fra `V2Shell`.

Navigasjonen er definert i `src/components/v2/shell.tsx`, ikke i rute-mappen:

**`AGENCYOS_NAV` (5 hovedpunkter, linje 78–84):**

| Punkt | Ikon | Href |
|---|---|---|
| Hjem | home | `/admin/agencyos` |
| Stall | users | `/admin/spillere` |
| Kalender | calendar | `/admin/kalender` |
| Kø | inbox | `/admin/godkjenninger` |
| Innsikt | bar-chart | `/admin/analyse` |

**«Mer»-seksjonen (linje 103–141):** AgenticOS → `/admin/agents` · Plan → `/admin/planlegge` ·
Stall+ → `/admin/grupper` · Økonomi → `/admin/agencyos/okonomi` · Drift → `/admin/settings`

Samme fil eksporterer `PLAYERHQ_NAV` (Hjem/Plan/Gjør/Analyse/Meg) og `FORELDER_NAV`
(Oversikt/Barn/Økonomi/Meldinger). Shell-en har egen aktiv-rute-matching på lengste
href-prefiks (linje 624–668).

Merk at nav-en peker **utenfor** `/admin/agencyos/` for 4 av 5 hovedpunkter. «Konsollen»
er altså ikke en selvstendig seksjon i rutetreet — den er en forside med et nav som
spenner hele `/admin`. Porten av `agencyos-konsoll-*` må ta stilling til om det skal bestå.

---

## De 19 fasitflatene

«Bruker tokens» = importerer/refererer v2-token-laget. «Bruker biblioteket» = bruker
noen av de 78 designbibliotek-komponentene. Sistnevnte er **nei overalt** — biblioteket
er ikke på disk. «Datakilde OK» = ruten henter ekte data server-side (Prisma/server action),
ikke demo-data.

Målt med: for hver rute, `grep -c "components/v2\|/v2/"`, `grep -c "@/lib/prisma"`,
`grep -c "use client"` i `page.tsx`.

| # | Flate | Rute finnes | Rute | Tokens (v2) | Bibliotek | Datakilde OK |
|---|---|---|---|---|---|---|
| 1 | innlogging | ja | `/auth/logg-inn` (+ `/auth/login`) | **nei** (0 v2-import) | nei | n/a (auth) |
| 2 | foreldreportal | ja | `/forelder` | ja | nei | ja (server action) |
| 3 | booking | ja | `/(marketing)/booking` | ja | nei | ja (Prisma) |
| 4 | playerhq-booking | ja | `/portal/booking` | ja | nei | ja (Prisma) |
| 5 | playerhq-meg | ja | `/portal/meg` | ja | nei | ja (Prisma + actions) |
| 6 | playerhq-plan | ja | `/portal/planlegge` | ja | nei | ja (server action) |
| 7 | playerhq-chat-desktop | delvis | `/portal/coach/ai` | ja | nei | ja (Prisma) |
| 8 | playerhq-chat-mobil | delvis | samme rute, responsiv | ja | nei | ja |
| 9 | playerhq-analyse | ja | `/portal/analysere` (+ `/portal/analyse`) | ja | nei | ja (server action) |
| 10 | agencyos-konsoll-desktop | ja | `/admin/agencyos` | ja | nei | ja (Prisma) |
| 11 | agencyos-konsoll-mobil | delvis | samme rute, responsiv | ja | nei | ja |
| 12 | agencyos-innboks | ja | `/admin/innboks` | ja | nei | ja (server action) |
| 13 | agencyos-innboks-mobil | delvis | samme rute, responsiv | ja | nei | ja |
| 14 | agencyos-innstillinger | ja | `/admin/settings` (+ 6 undersider) | ja | nei | ja (Prisma) |
| 15 | agencyos-agenticos | ja | `/admin/agents` (+ `/admin/agent-team`) | ja | nei | ja (Prisma) |
| 16 | agencyos-okonomi | ja | `/admin/agencyos/okonomi` | ja | nei | ja (Prisma) |
| 17 | workbench-desktop | ja | `/portal/planlegge/workbench`, `/admin/spillere/[id]/workbench` | ja | nei | ja |
| 18 | workbench-mobil | delvis | samme ruter, responsiv | ja | nei | ja |
| 19 | workbench-turnering | uklart | nærmeste: `/portal/tren/turneringer`, `/admin/tournaments` | ja | nei | ja |
| — | **fangstsheet** | **NEI** | ingen rute, ingen fil, ingen omtale | — | — | — |

Merknader til tabellen:

- **6 «delvis»** er desktop/mobil-varianter av flater som i dag er én responsiv rute.
  Det er ikke nødvendigvis feil — men fasiten har dem som to filer, så noen må bestemme
  om appen skal ha to komponenter eller én responsiv. Det er en beslutning, ikke en oppgave.
- **`fangstsheet` finnes ikke i det hele tatt.** `grep -rli "fangstsheet"` over hele repoet
  (utenom `node_modules`/`.git`) gir null treff. De 10 «fangst»-treffene er andre ord
  (`oppfangst`, `fangst-` i lydopptak-kontekst) i urelaterte filer. Dette er en helt ny
  flate, ikke en port. Den bør planlegges som nybygg og legges sist.
- **`innlogging` er den eneste flaten uten v2-tokens.** `/auth/logg-inn/page.tsx` har 0
  importer fra `components/v2`. Den vil endre seg mest visuelt av alle 19.
- **`workbench-turnering` er den eneste jeg ikke kunne avgjøre.** Det finnes turnerings-ruter
  og det finnes workbench-ruter, men ingen rute som er begge. `workbench-hybrid/`-mappen
  nevner turnering i `taxonomy.ts`/`types.ts`/`demo-data.ts`, så konseptet finnes i
  datamodellen. Trenger avklaring før port.

## Databasen — hva jeg kunne og ikke kunne verifisere

**Kunne ikke måle mot Supabase.** MCP-serveren krever OAuth-autorisering, og denne
sessionen er ikke-interaktiv. Radtallene og de fire kolonnene i oppdragsteksten står
altså **uverifiserte** av meg — jeg gjengir dem ikke som mine målinger.

**Kunne måle i repoet:**

```bash
grep -n "model ServiceType" -A 40 prisma/schema.prisma | grep -iE "billingInterval|..."
ls prisma/migrations | wc -l   # 88
```

- **Bekreftet:** `model ServiceType` i `prisma/schema.prisma` (linje 818) inneholder ingen
  av feltene `billingInterval`, `sessionsPerPeriod`, `includesPlayerHq`, `rolloverUnused`.
  Prisma-schemaet vet ikke om kolonnene, akkurat som oppdraget sier.
- **88 migrasjoner** i `prisma/migrations/` (CLAUDE.md sier 81 — 7 er kommet til).
- `prisma migrate dev` er ikke kjørt i denne sessionen.

## Hva porten faktisk møter — oppsummert

1. **Rutedekning er ikke problemet.** 18 av 19 flater har en rute. Bare `fangstsheet` er nybygg.
2. **Stilsystemet er problemet.** 758 variabeldeklarasjoner i 5 filer, 3 aliaslag, og et
   `@layer`-oppsett som allerede har måttet dokumentere en kaskadefelle i en kodekommentar.
3. **Datalaget er porteringsvennlig.** Server Components + props ned til rendrende
   komponenter er nøyaktig det mønsteret et komponentbibliotek trenger. 216 sider gjør
   det allerede.
4. **Biblioteket er ikke tilgjengelig.** Ingenting kan verifiseres mot fasit før det er inne.
