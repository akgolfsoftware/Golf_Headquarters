# T6 — Plan-hub + Workbench-kilder → Train-lock (DONE)

**Dato:** 27.08.2026 · **Gren:** `claude/t6-plan-hub-port-df1a02` · **Bygger:** Sonnet 5 (to
parallelle underoppdrag i samme worktree, disjunkte filsett).

Omfang per `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` rad T6 og
`docs/natt/D-LYS-OG-5T-BESLUTNING.md` §0/§2.1/§2.3.

---

## Hva som ble gjort

### 1. AG-06 Plan-hub — ny, ekte produksjonsside

- `src/app/admin/planlegge/page.tsx` — omskrevet fra "v2preview"-duplikat til den ekte
  AG-06-hub-siden. Fem rader med reelle tall:
  - **Ukemaler** = `PlanTemplate` med `varighetUker ≤ 1`
  - **Treningsprogram** = `PlanTemplate` med `varighetUker > 1`
  - **Månedsplaner** = **0, ikke klikkbar** — ingen måned-modell finnes ennå (bølge 2,
    "Ikke i scope" i CLAUDE.md). Vist ærlig som "Ikke bygget ennå (bølge 2)", ikke fabrikert.
  - **Standardøkter** = `OktMal.count()` — vist, men ikke klikkbar (ingen admin-CRUD-rute
    for `OktMal` ennå, kun konsumert via Workbenchs kilder-panel)
  - **Øvelsesbank** = `DrillMal.count()` — samme begrunnelse, ikke klikkbar
  - Uke-header ("Uke 35 · 38 spillere · 6 økter · 35 udekket") bygget på **`WorkbenchSession`**
    (den ekte, nye modellen fra natt-sporet), IKKE den pensjonerte `TrainingPlan`/
    `TrainingPlanSession`. "Udekket" = coachede spillere uten noen `WorkbenchSession` denne
    uka (planleggingshull, ikke gjennomføringshull — dokumentert i koden).
  - Primær-CTA **«Åpne uke i Workbench»** resolver mål med samme fallback-kjede som den
    gamle `/admin/plans`-siden (dagens økt → første aktive spiller → første spiller), men
    bygget på `WorkbenchSession`/`coachScopedPlayerWhere` i stedet for `TrainingPlan`.
- Ny komponent `src/components/admin/v2/PlanHubV2.tsx` — Train-lock-tokens (`TL`), mobil-
  hub-liste + desktop KPI-rad/topolonne-mal-lister (AG-06a/b/c).
- `src/app/admin/plans/page.tsx`, `src/app/admin/plans/templates/page.tsx`,
  `src/app/admin/okter/page.tsx` → rene `permanentRedirect`. `okter` peker til
  `/admin/planlegge` (ikke `/admin/workbench` — det finnes ingen spillerløs
  `/admin/workbench`-indeks, og "Workbench" i railen ER `/admin/planlegge`).
- `src/app/admin/plans/[planId]/` → slår opp planens `userId` og redirecter til
  `/admin/workbench/[userId]`, fallback `/admin/planlegge`. 13 døde hjelpefiler slettet
  (verifisert med grep at ingen andre importerer dem); `actions.ts` beholdt (brukes fortsatt
  av `add-session-wizard.tsx`).
- **`teknisk-plan` er IKKE pensjonert** — siden aggregerer noe unikt (TEK-fullføring % +
  TrackMan-øktantall per spiller ved siden av godkjente `PlanTemplate`) som verken Workbench
  eller Plan-hub dekker i dag. Flagget for Anders i stedet for å gjette en redirect.

### 2. Plan-maler-familien (4 ruter) → Train-lock-skall

`src/app/admin/plan-templates/{page,ny/page,[id]/page,[id]/rediger/page}.tsx` pakket i
`TL_SCOPE` (samme skygge-teknikk som Workbench-uka bruker) i stedet for å håndredigere
hundrevis av `T.*`-referanser inni de fire `AdminPlanMal*`-komponentene — matcher
"Klasse A, generisk skall"-rammen Anders godkjente i D-LYS-dokumentet §2.2. All eksisterende
CRUD-funksjonalitet er urørt.

### 3. Drill-bibliotek → avviklet til Workbenchs kilder-panel

A-03 (Ny økt-modal), A-04 (Kilder/Øvelsesbank, drag) og A-04b (Program ghost) er **allerede
bygget** i Workbench (`CreateSessionModal.tsx`, `SourcesPanel.tsx` — DONE på PR #601). De
frittstående drill-sidene duplikerte denne jobben og er nå pensjonert
(`permanentRedirect` til `/admin/planlegge`, som har "Åpne uke i Workbench"-inngangen):

- `(legacy)/drills/{page,[id]/page,ny/page,forslag/page}.tsx`
- `admin/drills/[id]/rediger/page.tsx` (fant denne utenfor `(legacy)`, importerte fra en nå
  slettet `actions.ts` — ville brutt `tsc` uendret)
- `(legacy)/drills/forslag` → `/admin/agenticos` spesifikt (AI-forslag samles i
  AgenticOS-køen, beslutning §0.5)

Orphanede hjelpefiler slettet etter `grep -rln`-verifisering (ingen andre importerte dem):
`actions.ts`, `drill-detail-actions.tsx`, `drill-create-form.tsx`, `forslag/actions.ts`,
`forslag-liste.tsx`, `video-forslag-liste.tsx`, `AdminDrillRedigerV2.tsx`. Lenker oppdatert i
`global-search-modal.tsx`, `search/route.ts`, `ukesrapport-ovelser-agent.ts`.

**A-03b/c (Ny drill)-dekning i `DrillListEditor.tsx`:** manglet et Beskrivelse-felt selv om
domenemodellen og server-actionen (`addDrill`) allerede støttet det — lagt til minimalt.
Fasitens Reps-felt (5–5–5) har derimot ingen backing i domenemodellen (`Drill` har ikke et
reps-felt) — det er en ekte schema-utvidelse, ikke en UI-fiks, og er IKKE lagt til.

`AdminDrillsV2.tsx`/`AdminDrillDetaljV2.tsx` er nå ubrukte men ikke slettet (lå utenfor
oppdraget) — flagget som opprydding for en senere økt.

### 4. A-14 Økt-ark — ny ekte skjerm for `gjennomfore/okter/[id]`

Fasiten (`A-14 iPhone Okt-ark Filip.dc.html`) viser et Caddie-AI-forslag som skal
godkjennes/avvises. Den ekte siden har en annen jobb (start/fullfør/avlys en booket økt) —
**det visuelle/strukturelle idiomet er portet** (bunnark-look, eyebrow+tittel, driller-liste,
notat-kort, ÉN hvit primær-CTA), men CTA-teksten og handlingen følger den faktiske
statusmaskinen: «Start økt» (PLANNED) / «Åpne live-konsoll» (AKTIV NÅ) / «Skriv oppfølging»
(GJENNOMFØRT, kun aktiv når økten har en lenket `TrainingSessionV2`).

- Ny komponent `src/components/admin/v2/OktArkV2.tsx`. `page.tsx` er nå ren loader (auth +
  Prisma + statusutledning bevart 1:1 fra legacy Booking-modellen).
- `start-okt-knapp.tsx`/`avlys-okt-knapp.tsx` slettet — logikken er inlinet i `OktArkV2`
  (server actions `startOkt`/`kansellerBooking` kalt direkte fra klientkomponenten).
- Placeholder-data (`SESSION_DRILLS`, prep/ønsket-notater, etter-økt-rating) er bevart 1:1
  fra det opprinnelige design-bundlet — IKKE min endring, allerede flagget for egen
  datakobling i en senere økt.
- `src/app/admin/gjennomfore/page.tsx` (indekslisten på tvers av økter) → pensjonert,
  `permanentRedirect("/admin/kalender")` (`/admin/gjennomfore/okter/[id]` lever videre
  urørt). Lenker oppdatert i `global-search-modal.tsx`, `search/route.ts`,
  `agency-cockpit.tsx`.

### 5. Token-gap-fiks

`OktArkV2.tsx` hadde én hardkodet `rgba(255,255,255,0.2)` (progress-track på en
`TL.fill`-bakgrunn) — rettet til `color-mix(in srgb, ${TL.onFill} 20%, transparent)`, samme
mønster som `WorkbenchUke.tsx`/`PublishConfirmDialog.tsx` bruker for transparente farger på
tokens. `check-token-gap` er grønn.

---

## Verifikasjon

- `npm run verify` (prisma validate/generate, `tsc --noEmit`, eslint, check-action-auth,
  check-token-gap, check-critical-imports, check-doc-lenker, `next build` + Serwist):
  **grønn** (måtte kjøre `npm ci` først — worktreet manglet `node_modules` helt, kjent
  gotcha for nye worktrees).
- `npm test` (node:test, hele repoet): **1702/1702 grønn.**
- Skjermbilde-gate kjørt med Playwright mot lokal dev-server, innlogget som
  `coachtest@akgolf.test`, 390px + 1280px, lys + mørk, for `/admin/planlegge` og
  `/admin/gjennomfore/okter/[id]`. Ingen kontrastfeil, ingen primary/accent-kollisjon,
  data er ekte fra dev-DB (92 `PlanTemplate`, 0 `OktMal`/`DrillMal` — begge tomme i dev,
  vist ærlig som 0). Skjermbildene er sendt til Anders i samtalen for godkjenning — de er
  IKKE lagret i repoet.
- Manuelt verifisert alle nye redirects (innlogget, ekte navigasjon): `/admin/plans` →
  `/admin/planlegge`, `/admin/plans/templates` → `/admin/plan-templates`, `/admin/okter` →
  `/admin/planlegge`, `/admin/gjennomfore` → `/admin/kalender`, `/admin/drills` →
  `/admin/planlegge`, `/admin/drills/ny` → `/admin/planlegge`, `/admin/drills/forslag` →
  `/admin/agenticos`, `/admin/drills/[id]/rediger` → `/admin/planlegge`.

---

## Åpne spørsmål til Anders

1. **`teknisk-plan`** — ikke pensjonert (se §1). Skal den slås sammen med Plan-hub/Workbench
   likevel, eller stå som egen side?
2. **Reps-felt på `Drill`** — fasitens A-03c viser et Reps-felt (5–5–5) som ikke finnes i
   domenemodellen i dag. Egen kontraktsutvidelse, eller skal reps ligge i
   beskrivelse/notat slik det gjør nå?
3. **`AdminDrillsV2.tsx`/`AdminDrillDetaljV2.tsx`** i `src/components/admin/v2/` er nå
   ubrukte etter pensjoneringen — trygge å slette i en opprydningsøkt.

Ingen av disse er blokkerende for smoke/merge — alle tre er dokumenterte avveininger, ikke
gjettede.
