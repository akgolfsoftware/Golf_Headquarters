# PlayerHQ IA Hybrid — Implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development eller superpowers:executing-plans. Steg bruker checkbox (`- [ ]`).

**Goal:** Fjern strukturkaoset i plattformen og koble alle skjermer + knapper til én bevisst informasjonsarkitektur, definert av en Claude Design-prototype.

**Architecture:** Behold de ~150 fungerende skjermene (ekte data, auth, Prisma). Prototypen definerer endelig navigasjon + flyt + knapper. Vi rydder strukturen som er kaos i dag, og kobler eksisterende skjermer til prototypen — bygger kun det som faktisk mangler.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Prisma 7 + Supabase, Tailwind v4, athletic-komponentbibliotek, Vercel.

**Arbeidsdeling:** Del 1 kjører jeg **nå, parallelt med at du lager prototypen**. Del 2 er din leveranse (prototypen). Del 3 kobler vi sammen når prototypen er klar.

---

## DEL 1 — Rydd strukturen (jeg kjører nå, uavhengig av prototypen)

Dette er kaoset som *ikke* trenger prototypen. Tre uavhengige opprydninger.

### Oppgave 1: Fjern to-URL-forvirringen

Problem: `akgolf.no` (nyeste) og `akgolf-hq-…vercel.app` (gammel branch-deploy) viser ulikt innhold fordi GitHub→Vercel auto-deploy henger. Du så «gamle sider» fordi du var på branch-URL-en.

**Files:** Vercel-prosjektkonfig (ingen kodefiler nødvendigvis) · evt. `vercel.json`/`.vercel/`

- [ ] **Steg 1: Diagnostiser hvorfor auto-deploy henger**
  Kjør: `vercel git ls` og `vercel project ls`. Sjekk i Vercel-dashbordet om GitHub-integrasjonen er koblet og om "Ignored Build Step" eller en branch-filter blokkerer.
- [ ] **Steg 2: Re-koble eller fiks git-integrasjonen**
  Hvis frakoblet: koble repoet på nytt (`vercel git connect`). Hvis "ignored build step" blokkerer: fjern/juster.
- [ ] **Steg 3: Verifiser auto-deploy trigger**
  Lag en triviell commit (f.eks. tom linje i README), push, og bekreft at en ny deploy starter automatisk i `vercel ls`.
- [ ] **Steg 4 (fallback hvis ikke løsbart): dokumenter én URL**
  Hvis auto-deploy ikke kan fikses raskt: oppdater `docs/todo.md` med at **akgolf.no er eneste gyldige URL**, og at deploy skjer manuelt via `vercel --prod --yes`. Gi Anders beskjed: ikke bruk `akgolf-hq-…vercel.app`.
- [ ] **Steg 5: Commit** (kun hvis kodeendring): `git commit -m "chore: fix Vercel auto-deploy / dokumenter prod-URL"`

### Oppgave 2: Slett døde demo/preview-ruter

Problem: ~12 demo/preview-ruter forurenser rutelista (411 ruter) og forvirrer audits.

**Files (slett etter verifisering):**
- `src/app/(marketing)/sesjon-opptak-demo/`, `hull-demo/`, `kalender-demo/`, `kalender-maaned-demo/`, `lokasjoner-demo/`, `talent-kohort-demo/`, `talent-region-pipeline-demo/`, `talent-sammenlign-to-demo/`, `talent-spiller-360-demo/`
- `src/app/coach-preview/`, `src/app/portal-preview/`, `src/app/(marketing)/v2-preview/` (+ underruter)

- [ ] **Steg 1: Verifiser at ingen prod-kode lenker til demo-rutene**
  Kjør for hver: `grep -rn "<rute-uten-slash>" src/ --include="*.tsx" --include="*.ts" | grep -v "src/app/<rute>/"`
  Forventet: ingen treff fra sidebar/nav/knapper. (LÆRDOM: skygget rute ≠ død kode — sjekk ALLTID imports først.)
- [ ] **Steg 2: Bekreft de ikke er lenket fra meny**
  Kjør: `grep -rn "demo\|preview" src/components/portal/sidebar.tsx src/components/admin/sidebar.tsx` → forventet: ingen treff.
- [ ] **Steg 3: Slett rutene**
  `git rm -r src/app/(marketing)/*-demo src/app/coach-preview src/app/portal-preview "src/app/(marketing)/v2-preview"` (kjør per verifisert mappe).
- [ ] **Steg 4: Verifiser build**
  Kjør: `npx tsc --noEmit` (0 src-feil) og `npm run build` (grønn).
- [ ] **Steg 5: Commit**: `git commit -m "chore: slett døde demo/preview-ruter"`

### Oppgave 3: Data-konsistens-sveip (fjern gjenstående mock)

Problem: mock-data i prod-skjermer (vi fant og fikset «Velkommen-plan»; flere kan gjenstå). Mål: ekte Prisma eller ærlig tomstate — aldri oppdiktede tall.

**Files (gjennomgå hver — erstatt mock med ekte data / tomstate):**
- `src/app/portal/trackman/[sessionId]/page.tsx`, `src/app/portal/talent/roadmap/page.tsx`
- `src/app/admin/workspace/page.tsx`, `workspace/prosjekter/page.tsx`, `workspace/oppgaver/page.tsx`, `workspace/oppgaver/[id]/page.tsx`
- `src/app/admin/audit-log/page.tsx`, `src/app/admin/agencyos/caddie/caddie-page-shell.tsx`
- `src/app/admin/approvals/[id]/page.tsx`, `src/app/admin/tester/tildel/[spillerId]/tildel-modal.tsx`
- Skygge-sider (lavere prio): `src/app/portal/analyse/page.tsx`, `src/app/admin/analyse/page.tsx` (+ `__demoData.ts`)

- [ ] **Steg 1: Per fil — klassifiser mock-bruken**
  For hver fil: les den, avgjør om `MOCK_/SAMPLE_/DEMO_` er (a) dev-fallback merket «Eksempeldata» (OK å beholde, lavt prio), (b) hardkodet data som vises som ekte (MÅ fikses), eller (c) i en skygget rute (ikke nås — lavt prio).
- [ ] **Steg 2: Fiks (b)-tilfellene**
  Erstatt hardkodet array med ekte Prisma-query (samme mønster som Fase 1: `prisma.<modell>.findMany` + tomstate-komponent når tomt). Behold auth-guard.
- [ ] **Steg 3: Verifiser per fil**
  `npx eslint <fil>` (0 warnings) + `npx tsc --noEmit` (0) + `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000<rute>` (307/200).
- [ ] **Steg 4: Commit** per logiske gruppe: `git commit -m "fix: ekte data i <skjerm> (fjernet mock)"`

---

## DEL 2 — Prototype-brief (DIN leveranse i Claude Design)

For at prototypen skal bli en brukbar spec jeg kan koble mot, må den inneholde dette. Lever som HTML-handover (zip) i `public/design-handover/` — samme format som før.

**Må inneholde:**
1. **De 5 hubene + Min profil** som klikkbar sidemeny: Oversikt · Planlegge · Gjennomføre · Analysere · Coach · Min profil. (Følg IA i `docs/plan-meny-ia-2026-06-01.md`.)
2. **Hver hub-landingsside** med oversiktskortene (Planlegge: Årsplan/Treningsplan/Fysplan/Mål/Turneringer/Drills; osv.).
3. **Nøkkel-detaljskjermene** du vil endre eller er viktigst (ikke alle 150 — de du har en mening om). Resten arver eksisterende design.
4. **Hver knapp/lenke kobles** — vis hvor hver CTA går (klikkbar flyt), så jeg vet koblingen.
5. **Design-tokens:** forest #005840, lime #D1F843, cream #FAFAF7, Inter / Inter Tight / JetBrains Mono. Ingen nye farger/fonter, ingen emoji.

**Trenger IKKE:** ekte data (tomstater er nok), funksjonell logikk, alle 150 skjermer. Fokus: **struktur, navigasjon, flyt, knapper.**

---

## DEL 3 — Koble prototype → skjermer (når prototypen er levert)

Detaljeres når prototypen finnes (jeg skriver Del 3 som egne tasks da). Prosessen:

- [ ] **Steg 1: Sorter + mapp prototypen** (som tidligere handover): hver prototype-skjerm → eksisterende rute *eller* «bygg ny». Lever mapping-tabell for godkjenning.
- [ ] **Steg 2: Koble navigasjon + knapper** — oppdater sidebar + hub-kort + CTA-er til å matche prototypens flyt 1:1.
- [ ] **Steg 3: Bygg kun manglende skjermer** — parallell fan-ut (som Fase 1), athletic-komponenter + ekte Prisma, DONE-gate per skjerm.
- [ ] **Steg 4: Visuell QA-sveip** — Playwright-screenshots av hele flyten mot ekte data, fiks avvik.
- [ ] **Steg 5: Deploy + du verifiserer** på akgolf.no.

---

## Self-review-notat

- **Spec-dekning:** Del 1 dekker de tre strukturproblemene (URL, duplikater, data). Del 2 dekker «slik jeg ønsker» (prototype). Del 3 dekker kobling + bygg.
- **Avhengighet:** Del 1 ⊥ uavhengig (kjør nå). Del 3 krever Del 2.
- **Risiko:** sletting i Oppgave 2 — alltid verifiser 0 imports først (tidligere cleanup brakk build da skygge-ruter delte kode).
