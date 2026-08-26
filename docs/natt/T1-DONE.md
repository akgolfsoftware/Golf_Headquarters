# T1 — Skall: Agency-rail + dock (AX-01)

**Dato:** 26.08.2026 · **Gren:** `claude/t1-agency-skall-tl-stcvsv` · **Omfang:** KUN
skallfiler (AgencyOS-rail + -dock) — ingen innholdsskjermer, ingen nye tokens.

Fasit: `designsystem/train-lock/AX-01 Skall rail og tabbar.dc.html` +
`docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6 + `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`
§0.2 rad 1 (T1-fullføring).

---

## Utgangspunkt for denne økten

Oppdraget viste til en eksisterende worktree (`~/Developer/akgolf-hq/.claude/worktrees/t1-agency-skall-tl`)
der AX-01-skallet «alt var bygget» og gjensto kun `--tl-rail-mac` 64→232 +
skjermbilder + PR. Den worktreen finnes ikke i denne økten (fjernkjørende
container, fersk klone av `claude/t1-agency-skall-tl-stcvsv` — som ved
sesjonsstart var identisk med `origin/main`, commit `604b0aa`). Koden på
branchen hadde med andre ord IKKE det fem-fane-skallet ennå — kun den gamle
sju-fane fase2-railen (`Cockpit · Innboks · Kalender · Stall · Plan/Workbench
· Innsikt · Oppsett`, 64 px, kun ikoner) + en «Mer»-flyout med fem rom.

Denne økten har derfor bygget hele AX-01-skallet fra bunnen av mot committet
`main`-tilstand, ikke bare flippet ett token. `origin/main` var allerede inne
(ingen merge nødvendig — branchen var 0/0 mot main ved sesjonsstart, inkl.
font-fiksen #597).

---

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/styles/train-lock-tokens.css` | `--tl-rail-mac` 64px → **232px**. |
| `src/components/v2/shell.tsx` | `AGENCYOS_NAV`: 7 punkter → **5** (Stall · Workbench · Kø · Jarvis · Meg), samme rekkefølge mobil/Mac. Ny `AGENCYOS_UNDER_MEG`-liste (Konsoll · Innboks · Kalender · Innsikt · Økonomi · Oppsett). `TrainLockAgencyRail` skrevet om fra 44×44 ikon-firkanter (64px rail, feil fasit) til AX-01s 232px tekst-rader + «Under Meg»-seksjon (fast synlig, ikke bak klikk) + «Åpne AgenticOS»-lenke. Ny `TrainLockRailRad` (erstatter `TrainLockRailPunkt`). `AgencyBunnNav` skrevet om til nøyaktig 5 like kolonner (var 4 primær + «Mer»-knapp) — ingen «Mer-ark» for AgencyOS lenger. `AGENCYOS_ROM` (fem rom, «Mer»-flyout) fjernet — utdatert etter AX-01 (pekte bl.a. «Plan» og «AgenticOS» til ruter som nå ER egne tabber). `withAgencyOsNavBadges` peker nå på `"ko"` (var `"innboks"`). `pathTilSeksjon`-tabellen (auto-aktiv uten eksplisitt `aktiv`-prop) rettet: fjernet duplikat-rad, fjernet `/admin/queue` fra «innboks»-bøtta (matcher nå Kø-tabben direkte via den generiske nav-løkken), rettet `/admin/planlegge`-målet fra `"workbench"` (matchet ingen id) til `"planlegge"`, lagt til eksplisitt `/admin/agencyos/okonomi` → `"okonomi"`. |
| `src/app/admin/planlegge/page.tsx` | `aktiv="workbench"` → `"planlegge"` (matcher nav-item-id'en 13 andre sider allerede bruker — se D2-UNDERLAG §5.3-noten i shell.tsx). |
| `src/app/admin/agencyos/okonomi/page.tsx` | `aktiv="mer"` → `"okonomi"` (den gamle «Mer»-fanen finnes ikke lenger). |
| `src/app/admin/queue/page.tsx` | `aktiv="innboks"` → `"ko"` (siden ER nå Kø-tabbens destinasjon). |
| `src/app/admin/agenticos/page.tsx` | `aktiv="agenticos"` → `"jarvis"` (siden ER nå Jarvis-tabbens destinasjon). |
| `src/components/admin/global-search-modal.tsx` | Kommentar rettet (viste til `AGENCYOS_ROM`, som er fjernet) — ingen funksjonell endring, dyp-katalogen står uendret. |

**Ingen nye tokens.** Alt bruker `TL`/`--tl-*` (kun `--tl-rail-mac` endret verdi,
ingen nytt navn). To rå pikselverdier fra selve AX-01-filen (rad-radius `10px`,
kompakt rad-høyde `34px`) er hardkodet direkte i komponentene siden de er
spesifikke for AKKURAT denne fasitfilen og ikke matcher noen eksisterende
`--tl-r-*`-token (`--tl-r-row` er 12px) — kopiert fra fasiten, ikke oppfunnet.

---

## Bygger-beslutninger (fasiten låser ikke disse — dokumentert per oppdraget)

Launch-planen sier eksplisitt: «Cockpit/Innboks/Innsikt/Oppsett er IKKE lenger
egne tabber — href-mapping for de 5 + plassering av tidligere tab-innhold
avgjøres av byggeren, begrunnes i DONE-fila.» Disse er mine valg:

| Tab | Href | Begrunnelse |
|---|---|---|
| **Stall** | `/admin/spillere` | Uendret fra før — allerede riktig. |
| **Workbench** | `/admin/planlegge` | Uendret fra før (D2-beslutning 1, 25.08) — allerede riktig. |
| **Kø** | `/admin/queue` | Eneste eksisterende rute som heter nettopp «kø». `T-S2` (Caddie-trioens/Kø-eierskap) er eksplisitt IKKE blokkerende for T1 — dette er en plassholder T12 kan endre. |
| **Jarvis** | `/admin/agenticos` | Samme adresse som «AI-laget samles på ÉN adresse» (beslutninger.md, 04.08) — allerede den samlede AI-siden. «Åpne AgenticOS»-lenken i railen peker bevisst til SAMME adresse (redundant med Jarvis-tabben i dag) — fasiten tegner dem som to atskilte elementer, og T12 (Jarvis-merge-motor + JV-skjermer) vil trolig skille dem (Jarvis = kø/chat, «Åpne AgenticOS» = full agent-konfigurasjon). Ikke løst her — ingen ny skjerm bygget. |
| **Meg** | `/admin/profile` | Eksisterende profilside. Får sitt egentlige «Under Meg»-innhold i T13 (Oppsett + Meg) — i dag uendret innhold (anti-scope: ingen innholdsskjermer). |

**«Under Meg» (Mac-rail, fast synlig — ikke bak et klikk):** fasiten navngir
eksplisitt kun tre rader (Konsoll · Økonomi · Kalender). Jeg har lagt til
**Innboks** og **Innsikt** og **Oppsett** fordi AX-01-teksten sier eksplisitt
«Alt som ikke er en tab, bor som rad under Meg» — og de tre var egne tabber i
går. Uten dem ville coach/admin mistet all navigasjonsvei til Innboks/Innsikt/
Oppsett fra skallet helt til T3/T11/T13 lander (ukjent horisont). Rutene finnes
fortsatt direkte via URL, men skallet må ha en vei inn. `Grupper`/«Stall+» er
BEVISST utelatt fra «Under Meg» — den hører naturlig hjemme under Stall-tabben
(T4/T8), ikke som en global rad.

**Mobil «Meg»:** fasiten viser «Under Meg»-radene som synlig innhold når du er
i Meg-fanen (ikke som en fast rail-seksjon, siden mobil ikke har en rail). Det
er en INNHOLDSSKJERM (`/admin/profile` sitt eget innhold) — bygges i T13, ikke
her. Frem til da viser Meg-fanen på mobil samme `/admin/profile`-innhold som i
dag, uendret.

---

## Regresjon flagget, IKKE fikset (krever Anders' avklaring)

**Mobil/iPad AgencyOS mistet sin eneste touch-inngang til globalt søk.**
Den gamle «Mer»-panelet for AgencyOS hadde en synlig søkeknapp (lagt til
19.07 nettopp fordi «funnet manglet helt i AgencyOS» — se git-historikk i
`MerPanel`) som dispatchet `global-search:open`-eventet `GlobalSearchModal`
lytter på. Cmd+K (den andre inngangen) finnes ikke på touch. AX-01 fjerner
«Mer»-panelet for AgencyOS helt (§0.2: «ingen Mer-ark lenger»), og verken
Mac-railen eller iPhone-docken i selve AX-01-fasiten viser noen søkeknapp —
jeg har derfor IKKE lagt til en erstatning, siden det ville vært en ny
UI-komponent fasiten ikke tegner (CLAUDE.md invariant 2: PIXEL/MAL vinner,
ingen nye elementer uten Anders' ja). Konsekvens: coach/admin på mobil/iPad
har ingen vei inn i globalt søk før dette avklares — enten et sted i
Meg-fanens innhold (T13) eller en eksplisitt Anders-beslutning om en
søkeinngang i skallet. Flagget her, ikke patchet i det stille.

## Kjent avvik / videreført fra tidligere økt

- Avatar + lys/mørk-bryter nederst i Mac-railen er IKKE en del av AX-01-
  mockupen (den er en dokumentasjonsskjerm av selve strukturen, ikke hver
  eneste rail-detalj). Beholdt fra før denne porten — å fjerne temabryteren
  ville latt brukere sitte fast i ett tema uten vei ut før Meg-siden (T13) får
  en. Plasseringen (rett under «Åpne AgenticOS») er et bygger-valg, ikke fasit.
- `agents/[agentId]/page.tsx` og andre AI-relaterte detaljsider peker fortsatt
  `aktiv="cockpit"` (→ Konsoll under Meg) — ikke rettet til `"jarvis"`, siden de
  ikke er selve `/admin/agenticos`-siden. Ren content-fil-justering, utenfor
  skall-scope; la stå.
- `agencyos/okonomi/page.tsx` sin `<TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>`-
  tekst sier fortsatt «Cockpit» (ikke «Konsoll») — innholdstekst, ikke skall;
  T2 (Cockpit-porten) er riktig sted å rette det.

---

## Verifisering

```
npx tsc --noEmit   → 0 feil
npm run verify     → se resultat under (kjørt i bakgrunnen, logget til /tmp/verify.log)
```

**Skjermbilder (390px + 1280px, lys + mørk) — IKKE gjort, miljøbegrensning:**
denne containeren har ingen `.env.local`/DB-tilkobling (samme begrensning som
D3-DONE.md rapporterte for forrige AgencyOS-rail-endring). Alle `/admin/*`-
sider er `requirePortalUser`-gatet mot ekte Supabase-auth — uten database kan
ingen innlogget admin-skjerm rendres, verken lokalt eller i Playwright. Anders
må se den ekte Vercel-preview-lenken fra PR-en under — det er uansett kravet i
skjermbilde-gaten (`beslutninger.md`), uavhengig av om jeg hadde tatt egne
skjermbilder.

---

## Anti-scope holdt

Kun `src/components/v2/shell.tsx`, `src/styles/train-lock-tokens.css`, og fire
ett-linjes `aktiv`-prop-rettelser (påkrevd av mine egne href-valg over) er
rørt. Ingen innholdsskjermer bygget eller redesignet, ingen nye design-tokens,
ingen main-merge.
