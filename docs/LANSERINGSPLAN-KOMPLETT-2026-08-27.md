# LANSERINGSPLAN — KOMPLETT (27.08.2026, kveld)

**Oppdatert 28.08.2026** mot `origin/main` @ `8c00c322d` (C1 #632, Train-lock-tokenport #631,
natt #629/#630). Snapshot: `docs/STATUS-NÅ.md`.

**Rolle:** den ENE samlede planen for alt som gjenstår før lansering — backend, funksjoner,
design (Train-lock) og web-kvalitet, for HELE appen (marketing, /auth, /portal, /admin,
/forelder). Skrevet 27.08 kveld etter måling mot `origin/main` @ `4a7e7987` (0 åpne PR-er),
ikke lest fra eldre dokumenter.

**Forhold til andre dokumenter:**
- `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` — detaljgrunnlag for T-/C-radene (fasit-filer,
  §5T-beslutninger). Denne planen vinner på *hva som gjenstår og i hvilken rekkefølge*.
- `docs/MASTERPLAN-GJENSTAAENDE.md` (17.08) — supersedert som samlet oversikt av denne filen.
  Beholdes for spor-detaljer den peker på (SG-app, Masterbrain m.m.).
- `docs/STATUS-NÅ.md` — løpende snapshot, oppdateres oftere.
- Design: `designsystem/train-lock/` er fasit for alle produktskjermer (invariant 2).
  Marketing har egen fasit (ak-golf-website). `/auth` er låst lys (PP-A/A4).

---

## 0. Gjenstår 28.08 (kjør mot dette)

**Levert siden 27.08 kveld:** T7 T8 QA-1 C6 C7 C9 (#629) · T12-IA J-A/J-B/J-C (#630) ·
Train-lock-tokenport PlayerHQ+AgencyOS+Meg+Forelder + F1 mandags-bug (#631) · C1 måned/år (#632).

| Hva | Eier | Merknad |
|---|---|---|
| Stripe live-cutover | Anders | Sjekkliste i `docs/platform/stripe-cutover-sjekkliste.md` |
| DNS `akgolf.no` → Vercel + vedlikehold AV | Anders | Samme operasjon |
| Resend DKIM `send.akgolf.no` | Anders | Blokkerer ekte aktiverings-e-post |
| Aktiverings-e-post til spillere | Anders | Venter på DKIM |
| `SCREENTEST_PASSWORD` | Anders | Avklar; e2e-spillertester hoppes over i CI |
| Se skjermene (390 + 1280, lys + mørk) | Anders | Skjermbilde-gate — tokenport er ikke piksel-1:1 |
| Freemium: strammes TALENT-listen? | Anders | Før 1. sep |
| C10 DataGolf-kort + økonomiflate | Kode | **LEVERT** på `claude/c10-datagolf-okonomi` — skjermbilde-gate gjenstår |
| C8 lys-pass | Kode | Sist av design; 8 nøkkelskjermer + mekanisk lys |
| T12 visuell AgenticOS | Kode | IA inne (#630); AO-00/01 piksel gjenstår |
| V1 betalings-verifisering | Kode + Anders | Test-clock, talent-gate, push — etter Stripe live |
| V2 røyk-test klikket av menneske | Anders | Coach opprett→publiser · spiller I dag · TrackMan |

P-bølgen (P1–P4) og AD-1/F1-skjermene har **token-port** (#631), ikke fasit-1:1. W5-auth
venter på tegnet fasit (ikke smoke-blokker). J-A/J-B/J-C er kodet.

**Neste 5:** C8 · T12-visuell · V1 (etter Stripe) · V2.

---

## 1. Målt tilstand 27.08 kveld

**Merget siste døgn:** hele T-bølgens etappe 3 (T6, T9, T10, T11, T13-detaljer, T4-rest)
og bølge 2-starten (C2 #624, C3 #623, C4 #627, C5 #625). Bølge 1 (økt-pakken) var ferdig
fra før. **Ingen åpne PR-er.**

**Målt skjermdekning** (script kjørt mot `src/` fra `origin/main`): 327 ruter under
/admin + /portal + /forelder → **45 PORTET** (ren Train-lock) · 7 BLANDET · **77 PAPER** ·
95 CHROME-ONLY (kun felles TL-skall) · 102 REDIRECT.

| Flate | Portet | Paper igjen | Hva som gjenstår (hovedtrekk) |
|---|---|---|---|
| /admin | 42 | 24 | kalender-familien (T7), grupper (T8), agenticos + agents (T12), spillere/[id]-detaljrest, runder, queue/brief, innboks-epost, økonomi (C10) |
| /portal | 3 | 53 | nesten hele flaten utenom økt-ark/I dag (B8): Meg-familien ~19 ruter, live-løypa, mal/runder + trackman, analysere, booking, tren-resten |
| /forelder | 0 | 0 (11 chrome-only) | helporten (T4-beslutning 26.08) — egen sesjon, lys+mørk |

> ⚠ `scripts/maal-trainlock-status.mjs` har hardkodet `ROOT = ~/Developer/akgolf-hq`
> (linje 9) og måler ALLTID hovedmappen — uansett hvor du kjører den fra. Står hovedmappen
> på en gammel gren, blir tallene feil. Verifiser gren i hovedmappen før du stoler på tallene.

**Konsekvens for planen:** T-bølgen (admin) er nesten i mål, men **Player-porten utover B8
har aldri hatt egne sesjonsrader** — det er det største udekkede gapet (53 Paper-ruter).
Denne planen legger inn P-bølgen for det.

---

## 2. Sesjonsplan — alt gjenstående kodearbeid

Faste regler (alle rader): Sonnet 5 · ny sesjon · worktree fra `main` · `npm run verify`
grønn før commit · skjermbilde-gate (390 px + 1280 px, lys OG mørk) før merge av skjerm-PR ·
kvittering i `docs/natt/LEVERANSELOGG.md` · aldri merge uten Anders' ja · maks 2–3
parallelle økter, kun disjunkte filområder.

### Etappe 1 — nå (parallellbare)

| # | Sesjon | Scope | Fasit/kilder | Avhenger |
|---|---|---|---|---|
| T7 | Kalender + booking-lag | Samle `/admin/kalender` + `(legacy)/kalender/maned` til ÉN kalender; booking (`bookinger` + `[id]` + `ny`, availability) inn som lag/ark. Pensjoner `agencyos/uka` og bookinger-listeflaten (JA 27.08). Google-synk røres IKKE. `/admin/kalender/lag` (fra C3) er startpunktet — hovedsiden har 0 TL-tokens i dag | KA-01/01L, KA-02, KA-03, KA-05, AG-11 | **LEVERT #629** |
| T8 | Grupper | `grupper/[id]/workbench` → WB-08/09; `arsplan` → A-06 + WB-06; gruppedag → A-10 (gjenbruk TimeGrid fra C2). Uten fasit (mønsterport, JA 27.08): grupper-liste, medlemsadmin, timeplan, skoledata, ak-stigen (PII-vurdering i økten). Rett `lPhase`-etiketter (utgått vokabular) | WB-08/09, A-06, WB-06, A-10 | **LEVERT #629** |
| QA-1 | Web-hygiene (funn fra 20-punkts audit, §3) | (a) **Monter toast-oppsett i admin** — 78 `toast.*`-kall fra sonner rendres ALDRI (`<Toaster/>` er ikke montert noe sted; admin-layout har ingen provider). Velg én kanal (sonner-Toaster i admin-layout, eller ToastProvider-mønsteret fra portal) og få suksess/feil på writes synlig. (b) Klikkbart telefonnummer på kontaktsiden (`tel:` + vurder `formatDetection`). (c) Fjern hardkodet «© 2026» i gfgk-junior-footer. (d) Slett død `MobileMenu`-komponent. (e) Fane-titler (`metadata.title`) på de ~20 viktigste portal-/admin-hubene. (f) Fjern dobbel e-postvisning på kontaktsiden | §3 under; `src/components/shared/toast-provider.tsx`, `src/app/admin/layout.tsx` | **LEVERT #629** |

### Etappe 2 — motor før T12

| # | Sesjon | Scope | Fasit/kilder | Avhenger |
|---|---|---|---|---|
| C6 | Jarvis-merge-motor | Kø + eval-gate (ACWR 0,8–1,3 · ingen kollisjon · motorer adskilt · drills komplette) + merge-provenance. Jarvis merger ALDRI selv; rød eval = STENGT. **Anti-scope: `src/lib/jarvis/` er Anders' PERSONLIGE assistent — feil «Jarvis», ikke rør.** ACWR-gjenbruk: sjekk `src/lib/health/belastning.ts` | JV-01–03 | **LEVERT #629** |
| C7 | AgenticOS cockpit-queue | Queue + approval-policy A3/B1/C3 (agent skriver aldri uten godkjenning; research uten write = badge). Inneholder to Anders-valg: **J-A** (/meg-lenking i IA) og **J-B** (Gmail-send-scope vs «Utkast opprettet») — spør i økten | AO-00/01/02/05/12 | **LEVERT #629** (J-A/J-B kodet i #630) |
| T12 | AgenticOS + Jarvis + Caddie-port | `/admin/agenticos` + `agents/[agentId]` + `handlingssenter` til TL. Caddie (chat) NEDLAGT (27.08) → foldes inn i Jarvis-tabben; ompek `(legacy)/caddie`-redirecten. Pensjoner `workspace/tildelt-meg`, `drills/forslag` → AO-01-køen. Avklar J-C (godkjenninger inn i AgenticOS-flaten) her | AO-fasitene + JV-01–03 | **IA LEVERT #630** — visuell AO-00/01 gjenstår |

### Etappe 3 — resterende C-rader

| # | Sesjon | Scope | Fasit/kilder | Avhenger |
|---|---|---|---|---|
| C1 | Måned/år i Workbench | Read-first: klikk dag → uke, ingen redigering i årscelle. Uke/Måned/År bevarer valgt spiller; tom måned = norsk empty-state. ETTERPÅ: pensjoner gamle `spillere/[id]/workbench` (§5T.2 rad 14) | A-05, A-06, WB-05, WB-06 | **LEVERT #632** |
| C10 | DataGolf + økonomi | DG-01-spillerkort (bland ALDRI Broadie/DataGolf/PEI) + EC-01-økonomiflate (FORFALT eneste danger; Tripletex-LESING — klient finnes i `src/lib/tripletex/`). `reports` flettes inn (JA 27.08). Avklar plassering av **D2 booking→faktura** her (datakjeden finnes, Invoice-modell mangler; «forfalt» fra Stripe ved visning). Ta med PGA-kildemerking (syncPgaPuttDistance er Broadie-tabell — merk i UI) | DG-01, EC-01 | **LEVERT** (kode; skjermbilde-gate gjenstår). D2 booking→faktura avklart: vises som Forfalt fra Stripe, Invoice-modell ikke innført. |
| C9 | Foreldre-kort FO-01 | Read-only «neste økt»-kort på wb-domenet i forelder-hjem. Aldri DRAFT, kun fornavn (GDPR). NB: dette er IKKE forelder-helporten (egen rad F1) | FO-01 | **LEVERT #629** |

### Etappe 4 — P-bølgen (Player-porten, NYE rader) + admin-rest + forelder

Portal har 53 Paper-ruter som ingen eksisterende rad dekker. Fire sesjoner, disjunkte
filområder, parallellbare 2 og 2. Fasit finnes i `designsystem/train-lock/` (196 filer) —
finn hver skjerm i `SCREEN-INDEX.md`.

| # | Sesjon | Scope (ruter) | Avhenger |
|---|---|---|---|
| P1 | Meg-familien | `/portal/meg` + ~19 underruter (innstillinger ×N, abonnement + faktura, bookinger, profil, utstyr, 2fa, varsler) | **TOKEN #631** — fasit-1:1 og skjermbilde-gate gjenstår |
| P2 | Analyse-familien | `mal/runder` + `mal/trackman` (7), `analysere` + historikk, `gameplan` (2), `drills` (2) | **TOKEN #631** — fasit-1:1 og skjermbilde-gate gjenstår |
| P3 | Tren + planlegge + resten | `tren/` (tester, turneringer, fys-plan, teknisk-plan), `planlegge/workbench`, booking (2), venner (2), kalender, varsler, coach (2), `utenfor-banen`, `ai/foresla-drill` | **TOKEN #631** — fasit-1:1 og skjermbilde-gate gjenstår |
| P4 | Live-løypa + gjennomføring | live-rutene (4), `gjennomfore/[id]`, offline-siden (Paper-stilet i dag). Vurder testbatteri-ark i Workbench her hvis T6 ikke dekket det (grep 27.08: finnes ikke) | **TOKEN #631** — fasit-1:1 og skjermbilde-gate gjenstår |
| AD-1 | Admin-rest | `spillere/[id]`-detaljrest (fremgang/analyse/tester/turnering-kobling — det som IKKE pensjoneres via T6/T7), `runder`, `teknisk-plan`, `queue`, `brief`, `innboks-epost` (PII-vurdering i økten), `bookinger/[id]` (hvis ikke tatt i T7), `analysere/compliance`, `tester/foreslatte` | **TOKEN #631** (T7 kalender levert #629) |
| F1 | Forelder-helporten | Alle 9 seksjoner + barn/[childId] til Train-lock med lys+mørk toggle (T4-beslutning 26.08; default forblir lys). Fasit komplett i zip (6). **Fiks kjent bug:** `hentForelderUkerapport` teller mandagsøkter dobbelt (lte mot eksklusiv grense, `src/lib/forelder.ts`) | **Mandags-bug + token #631** — fasit-1:1 gjenstår |

### Etappe 5 — lys-pass og auth (sist av design)

| # | Sesjon | Scope | Avhenger |
|---|---|---|---|
| C8 | Lys-pass | 8 nøkkelskjermer (I dag, Plan-uke, TM-detalj, Workbench-uke, Kalender-uke, Live runde, Gate, Login) + mekanisk avledet lys der tegnet fasit mangler (T-S5-godkjent). KUN `data-v2-tema`. TM-unntaket står (ellipse kun mørk). Rydd død `PuttModell` samtidig. **Kjøres SIST og aldri parallelt** — rører manges filer | C4 ✓ + C5 ✓ + (helst P-bølgen inne) |
| W5-auth | Auth-skallet | 15 auth-ruter er funksjonelle men mangler tegnet fasit (låst LYS). **Krever designbestilling fra Anders først** — ikke smoke-blokker; kan gå etter lansering hvis fasit ikke foreligger | Anders (bestilling) |

### Etappe 6 — verifisering og cutover (før 1. september!)

| # | Sesjon | Scope | Avhenger |
|---|---|---|---|
| V1 | Betalings-cutover-verifisering | `BETALING_STARTER = 2026-09-01` slår av `gratisForAlle()` automatisk. Kjør test-clock-løypa (8 steg i `stripe-cutover-sjekkliste.md`), verifiser talent-gate i prod (kontrakttestene fra #539 mot prod — aldri kjørt), sjekk A1-indeks-scriptet (`--dropp-gammel-indeks` — udokumentert om kjørt), push-opt-in i prod | Anders: Stripe live (P0) |
| V2 | Full smoke + release | Del 3-kriteriene i LAUNCH-PLAN (8 punkter) + §8.5: samlet ende-til-ende-smoke klikket av MENNESKE (inkl. TM-steget + godta/avvis), offentlig booking ende-til-ende, e2e-secrets i CI (427 spillertester hoppes over i dag), vedlikeholdsmodus-av-plan for akgolf.no | Alt over |

**Neste 5 sesjoner nå (28.08):** C8 · T12-visuell · V1 (etter Stripe live) · V2.

---

## 3. Web-QA — 20-punktslisten (målt mot kode 27.08)

Alle 20 punkter er verifisert mot faktisk kode (grep/fil-lesing, ikke antatt).
Restene samles i sesjon **QA-1** (etappe 1).

| # | Punkt | Status | Rest |
|---|---|---|---|
| 1 | Horisontal scroll | ✅ | `tests/e2e/bredde-gate.spec.ts` (390 px, tom unntaksliste) |
| 2 | Brutte lenker | 🟡 | Footer/nav manuelt verifisert OK; ingen site-crawler (e2e-smoke dekker nøkkelruter) |
| 3 | Mobilmeny | ✅ | Hamburger i `MarkedNav.tsx`; død `mobile-menu.tsx` slettes (QA-1) |
| 4 | Favicon | ✅ | metadata.icons + filer + e2e-test |
| 5 | Sidetitler | 🟡 | Marketing 70/73 ✅; portal 15/166 og admin 25/149 arver generisk fallback → QA-1 |
| 6 | Meta descriptions | ✅ | Marketing 67/73 + root-fallback; bak innlogging er fallback OK |
| 7 | Footer-lenker | ✅ | Alle 18 mål verifisert mot filsystemet |
| 8 | Egen 404 | ✅ | Rot + per flate + e2e-test |
| 9 | Copyright-år | 🟡 | Marketing årstall-fri (bra); «© 2026» hardkodet i gfgk-junior → QA-1 |
| 10 | Bildekomprimering | 🟡 | next/image på hovedflater; 11 bilder 500 KB–1 MB; ingen precache av tunge mapper. Akseptabelt — evt. komprimering ved anledning |
| 11 | Brutte knapper | ✅ | `kjerne-klikk.spec.ts` + flyt-tester klikker begge roller på 390+1280 |
| 12 | Suksessmeldinger | 🔴 | **Sonner-toasts rendres aldri** (ingen `<Toaster/>` montert; admin uten provider) → QA-1 (a) — viktigste funn |
| 13 | Feilmeldinger | ✅ | 84 `error.tsx` godt fordelt + global-error |
| 14 | Placeholder-tekst | ✅ | Null «lorem»; «Kommer snart» er designede tilstander |
| 15 | Ubrukt nav | ✅ | Alle 18 nav-mål finnes; kun død MobileMenu-komponent (QA-1) |
| 16 | Mobil overflow | ✅ | Automatisert (bredde-gate + cookie-dokk + toppbar-tester). Kjent rest: bunn-ark under cookie-banner (dokumentert gotcha) |
| 17 | Klikkbar logo | ✅ | `<Link href="/">` i MarkedNav |
| 18 | Klikkbart tlf | 🔴 | Kun 1 `tel:`-lenke i hele appen; kontaktsidens nummer er ren tekst + `formatDetection: telephone: false` → QA-1 (b) |
| 19 | Klikkbar e-post | ✅ | mailto i 31 filer; liten dobbelvisning på kontakt (QA-1 f) |
| 20 | Mobiloptimalisert | ✅ | Viewport (WCAG 1.4.4 OK), PWA-manifest, splash, safe-area, e2e-dekning |

---

## 4. P0 — Anders (panel), frist mot 1. september

Betaling starter **automatisk 1. september** (`BETALING_STARTER` i `src/lib/feature-flags.ts`)
— fem dager unna. Disse kan bare Anders utføre:

| # | Punkt | Status 27.08 | Merknad |
|---|---|---|---|
| 1 | Resend DKIM `send.akgolf.no` | Åpen 28.08 | Blokkerer aktiverings-e-post (spam ellers) |
| 2 | `akgolf.no` DNS → Vercel | Åpen 28.08 | + skru AV vedlikeholdsmodus (#574) i samme operasjon; sjekk `NEXT_PUBLIC_APP_URL` |
| 3 | Stripe live-cutover | Åpen 28.08 | 4 priser m/metadata, price-id-er i env, logo, Billing Portal-lås, webhook 13 event-typer. Sjekkliste: `docs/platform/stripe-cutover-sjekkliste.md` |
| 4 | Google Calendar re-kobling | **UTFØRT** | — |
| 5 | Ekte spilleradresser + aktiverings-e-post | Åpen 28.08 | 13 spillere uten auth/invitasjon; `scripts/send-aktiverings-epost.ts --dry-run` først; venter på DKIM |
| 6 | `SCREENTEST_PASSWORD` | **KILDEKONFLIKT** | MASTERPLAN sier rotert 17.08 (96/98 OK, forelder-bruker gjensto); LAUNCH-PLAN/STATUS-NÅ 27.08 sier fortsatt åpen. **Anders avklarer** — minst forelder-brukeren gjenstår uansett |

---

## 5. Åpne Anders-beslutninger (utenom P0)

| Beslutning | Haster? | Hvor den tas |
|---|---|---|
| Freemium-presisering: strammes TALENT-listen (16.08-listen er fasit inntil svar)? | **Før 1. sep** | Én linje fra Anders |
| J-A: hvor lenkes `/meg` inn i IA-en (i dag kun via URL) | Nei | **LØST #630** — `/meg` under Meg (admin) |
| J-B: Gmail-send-scope eller «Utkast opprettet» | Nei | **LØST #630** — utkast, aldri send |
| J-C: `/admin/godkjenninger` inn i AgenticOS-flaten? | Nei | **LØST #630** — Kø-fane = `/admin/godkjenninger` |
| J-D: KommandoTask vs Notion-cache | Nei | Egen beslutning (blokkerer /kommando-opprydding) |
| `/team-wang` varig åpen (navnefri) eller sperres? | Nei | Én linje |
| W5: bestille tegnet auth-skall? | Nei (ikke smoke-blokker) | Designbestilling |
| D4: områdekoder for ~20 testdefinisjoner (forslag klart 15.08) | Nei | Én godkjenning → backfill-økt |
| WANG B4 (coach-side) — B5 kan være løst av #578, verifiser først | Nei | Egen økt |
| FYS-referanseverdier + evt. admin-FYS-flate | Nei | Når Anders vil |
| Pyramide-UI for spiller: fortsatt ønsket etter #562 (regler slettet)? Trolig dødt — bekreft og lukk | Nei | Én linje |
| Live-økt drill-reps: DB-persist (B1-konsolidering) | Nei | Én beslutning → liten økt |

---

## 6. Etter lansering (bevisst UTENFOR denne planen)

Skal ikke re-flagges som lanseringsarbeid: `/stats/*`-migrasjonen (~45 ruter, D5-beslutning
26.08) · SG-appen AP1–AP6 (plan i `docs/plan-baneguide-sg-app-2026-08-16.md`; AP0 er inne) ·
TalentHQ inn i PlayerHQ (eget spor: `docs/natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`;
talenthq-repoet arkiveres først i steg 10 der) · Masterbrain-rebuild + øvelsesbank · onboarding-quiz · AI Coach
(bølge 7) · GJGT-scraping (ToS-gråsone, trenger ja/nei) · banedata rette-editor ·
historikk-import til Supabase Storage · dame-tour/college-datakilder · CSP-chunk-støy.

---

## 7. Definisjon av ferdig (samlet gate)

1. Alle sesjoner i §2 etappe 1–5 levert, hver skjerm-PR skjermbilde-godkjent av Anders
   (390 + 1280, lys + mørk).
2. Målt skjermdekning: 0 PAPER-ruter igjen i /admin, /portal og /forelder (remål med
   scriptet — mot riktig gren, jf. ROOT-fella).
3. QA-listen i §3: punkt 12 og 18 fikset; ingen røde.
4. Del 3-kriteriene i LAUNCH-PLAN alle sanne (RLS ✓, DRAFT-gate ✓, verify/CI grønn,
   docs-konsistens) + samlet menneskelig smoke (V2).
5. Betalings-cutover verifisert (V1) FØR 1. september.
6. P0-listen (§4) lukket av Anders.
7. Ingen åpne «haster»-beslutninger i §5 (kun freemium-presiseringen har frist).
