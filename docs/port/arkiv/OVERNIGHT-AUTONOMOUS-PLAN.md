> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# OVERNIGHT AUTONOMOUS PLAN v2.0 — automatisk godkjennelse

**Versjon:** 2.0 · **09.08.2026 kveld** (avløser v1.0 som var skrevet for iPhone-sandbox uten git-push)  
**Kontekst:** Alt nattarbeid fra natt 1 er på `main`. Denne maskinen (Mac) kan pushe. `akgolf.no`
videresender midlertidig til Acuity (PR #384) — **prod er derfor ikke kundeeksponert**, kun
`akgolf-hq.vercel.app`. Det gjør auto-merge til main lavrisiko akkurat nå.  
**Styrende plan:** `PIXEL-PERFECT-PLAN-COMPLETE.md` v1.1 (D1–D12)  
**Autorisasjon:** Anders har eksplisitt bestilt denne nattplanen med automatisk godkjennelse
(samtale 09.08.2026 kveld). Det dekker forbruksregelens krav om eksplisitt beslutning for
autonome nattkjøringer.

---

## 1. Hva «automatisk godkjennelse» betyr — og ikke betyr

### 1.1 FORHÅNDSGODKJENT (agenten gjør uten å spørre)

| Handling | Vilkår |
|---|---|
| Bygge/pixel-passe skjermer til READY_SIGN | Kun in-scope per pixel-planen §1.1 |
| Commit på arbeidsgren + PR + **merge til main** | KUN når `npm run verify` + `npm test` er grønt; maks 1–3 skjermer per PR |
| Produsere side-om-side-skjermbilder (app vs fasit, m390 + d1280) | Lagres i `screenshots/paper/`; samles i morgengalleri |
| Oppdatere status-docs (PP-*-STATUS, checklist `[ ]`→`[~]`, VARIANTS-filer) | Aldri sette `[x]` |
| Kjøre Playwright smoke / lint / tsc løpende | Rødt = fiks før merge, aldri merge rødt |
| Opprette/oppdatere redirects for legacy-ruter som allerede er vedtatt i PP-0-ROUTE-MAP | Kun dokumenterte vedtak |
| Feillogg-linjer i `docs/feillogg.md` | Ved reelle feilmønstre |

### 1.2 ALDRI auto-godkjent (hard grense — uansett hva natten finner)

| Forbudt om natten | Hvorfor |
|---|---|
| Sette `[x]` / D12 sign-off | Kun Anders. Natten leverer READY_SIGN + skjermbilder |
| Fjerne Acuity-redirecten (PP-10.7) | Lanseringsbeslutning — kun Anders |
| DB-migrasjoner / `schema.prisma` / nye dependencies | CLAUDE.md arbeidsregel 2 |
| Slette ruter/URLer, slette grener, force-push | Sikkerhetsregler |
| Sende noe til spillere/kunder (e-post, push, SMS) | PII + kunde-SLA |
| Røre Stripe/betaling/webhooks, `.env*`, secrets | Runbook §2.5 |
| Endre `proxy.ts` CSP, `vercel.json`, feature-flags | Prod-adferd utenfor design |
| Refaktorering utenfor skjermen som portes | Minimal diff-prinsippet |
| Rørepunkter med PII (spillerdata i prompts/skjermbilder) | Bruk screentest-brukeren (Øyvind Rohjan), aldri ekte spillere |

**Blir noe i køen umulig uten en forbudt handling: merk `BLOCKED` i status-doc med én linje
begrunnelse, hopp til neste pakke. Aldri improviser forbi grensen.**

---

## 2. Nattens arbeidskø (strikt rekkefølge)

Prinsipp: **først gjøre sign-off billig for Anders, deretter bygge det ubygde.**

### Pakke 1 — Morgengalleri for sign-off (høyest verdi, ~2–3 t)

Målet: Anders skal kunne signere PP-1 + PP-2-kjernen fra iPhone på 15 minutter i morgen.

1. Start dev/preview mot screentest-bruker.
2. For hver av de 7 PP-1-skjermene + PP-2.1–2.4: screenshot app m390 + d1280, lys og mørk,
   og tilsvarende fasit-HTML i samme viewport.
3. Sett bildene sammen side-om-side (app venstre, fasit høyre) → `screenshots/paper/signoff/`.
4. Generer `docs/port/SIGNOFF-GALLERI-2026-08-10.md`: én seksjon per skjerm med bilder,
   diff-liste (maks 5 punkter per skjerm) og anbefaling GODKJENN / FIKS FØRST.
5. Commit + merge (dokument + bilder).

**Exit:** 11 skjermer klare for D12 med bevis. Ingen skjerm merket `[x]`.

### Pakke 2 — Diff-lukking på det galleriene avdekker (~2 t)

Der pakke 1 finner åpenbare avvik (feil spacing, feil CTA, manglende seksjon): fiks med minimal
diff, regenerer skjermbildet. Kun avvik der fasit er entydig — skjønnsspørsmål listes i galleriet
som spørsmål til Anders i stedet.

### Pakke 3 — PP-3 pixel-pass (Live / Runde / Fangst / Workbench / Forelder, ~3–4 t)

PP-3.1–3.12 fra chrome-PORT til READY_SIGN: strukturell pixel per fasit, slugs verifisert,
skjermbilder inn i galleriet. Workbench-mobil og live-økt prioriteres (høyest bruk).

### Pakke 4 — De 36 `[ ]` bygges, i denne rekkefølgen (~resten av natten)

1. **PP-4 W1** (11): drills, drill-detalj, økt-detalj, fys-plan, teknisk-plan, tester-hub,
   test-detalj, turneringer, turnering-detalj, feiring, live-tapper.
2. **F2.6-primitiver** som PP-5 trenger (datavis/trackman/golfdata) — port én gang, komponer etterpå.
3. **PP-5 W2** (12): putte-lab, trackman liste/detalj, analyse-hull, runder, runde-detalj,
   gameplan ×2, datagolf, filter-sheet, varsler, hjem-rest.
4. **PP-6–PP-8 mal-fabrikk:** malen 100 % pixel først, deretter variant-pass per rute inn i
   `PP-W3/W4/W5-VARIANTS.md`.
5. **PP-9 W6** (wang/gfgk microsites — egne tokens, ikke Paper-shell).

Hver skjerm: READY_SIGN + skjermbildepar inn i galleriet. Commit per 1–3 skjermer, verify grønt
før hver merge.

### Pakke 5 — Nattrapport (siste 30 min, eller ved stopp)

`docs/port/NATTRAPPORT-2026-08-10.md`: hva ble READY_SIGN, hva ble BLOCKED og hvorfor,
checklist-tellere før/etter, lenke til galleriet, de 3 viktigste beslutningene Anders må ta.
Oppdater `docs/STATUS-NÅ.md`-snapshotlinjen + `WAVE-STATUS-MASTER.md`.

---

## 3. Autonomi-protokoll (uendret fra v1.0, presisert)

1. **Fasit vinner** på layout/CTA/logo/type. Skjønn → spørsmål i galleriet, ikke gjetting.
2. **Én solid clay** per view; ellers ink CTA.
3. **Minimal diff** — aldri refaktor utenfor skjermen.
4. **Mal før variant** (W3–W5). **PlayerHQ før AgencyOS** i samme blokk.
5. Manglende data i fasit: ærlig tom tilstand, aldri fake seed.
6. Usikker rute: `github.md` + `PP-0-ROUTE-MAP.md`.
7. Batch pushes — ikke én push per småfiks (gotchas §Token-økonomi).
8. Lange kommandoer til loggfil, les halen (aldri rå strøm i kontekst).
9. To mislykkede forsøk på samme feil → `BLOCKED`, neste pakke.
10. Stopp KUN ved: Anders sier stopp · build-brudd som ikke løses på 2 forsøk · disk/miljøfeil.

---

## 4. Suksesskriterium for natten

> **Anders våkner til ett galleri-dokument, signerer fra iPhone, og ingenting annet krever ham.**

| Måltall | Minimum | Mål |
|---|---|---|
| Skjermer i sign-off-galleri | 11 (PP-1 + PP-2-kjerne) | 25+ |
| `[ ]` → `[~]` READY_SIGN | 10 | 25+ |
| Røde merges til main | **0** | 0 |
| `[x]` satt av agent | **0** | 0 |

---

## 5. Oppstart

Natten startes med én melding fra Anders i en frisk økt (Sonnet 5 per beslutning 2026-08-04):

```text
Kjør OVERNIGHT-AUTONOMOUS-PLAN.md v2.0 pakke 1–5. Auto-godkjent per planen. Stopp-ord: stopp.
```

Meldingen er samtidig det eksplisitte «ja» for nattens main-merges innenfor §1.1-vilkårene.
