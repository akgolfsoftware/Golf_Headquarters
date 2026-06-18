# 80 — Gjenstående design-plan: alle TRENGER-DESIGN-skjermer

> **Formål:** Prioritert master-plan for alle skjermer som MÅ gjennom Claude Design FØR de kan portes til kode.
> **Kilde:** `design-koe/playerhq.md`, `design-koe/agencyos.md`, `design-koe/marketing-auth-forelder.md`, `design-koe/stats.md` + `61-DEKNINGSMATRISE.md` + `70-DESIGN-TIL-KODE-PLAN.md`.
> **Laget:** 17. juni 2026.

> **Viktig presisering:** Disse batchene gjelder KUN `TRENGER-DESIGN`-skjermer (Design=– og IKKE i 17.juni-handoffen). RE-SKIN-skjermer (~41 ruter) re-skinnes via token-migrering — sendes ALDRI hit. NY-HYBRID-skjermer (~28 stk) portes direkte fra `.dc.html`-filene per 70-planen.

---

## 1 — Oversikt

| | Batcher | Skjermer |
|---|---|---|
| **PlayerHQ** | 13 | 104 |
| **AgencyOS** | 12 | 64 |
| **Marketing + Auth + Forelder** | 9 | 29 |
| **Stats-plattform (eget spor)** | 6 | ~28 skjermtyper |
| **Total** | **40** | **~225** |

> **Oppdatert 2026-06-17 (kritiker-gjennomgang):** Lagt til 4 nye PlayerHQ-batcher (B0, B1b, B4b, B5b — 32 skjermer) og 2 nye AgencyOS-batcher (AG-5b, AG-5c — 8 skjermer). AG-5 fikset for mismatch (4, ikke 5 skjermer). Totalt 40 batcher · ~225 skjermer.

### Fordelt på prioritet

| Prioritet | Batcher | Skjermer | Frist |
|---|---|---|---|
| **P1 — lanseringskritisk** | **25** | **~129** | Før 1. juli 2026 |
| **V2 — post-lansering** | **9** | **~63** | Juli–august |
| **Stats (P1)** | 2 | ~10 | Løpende (live allerede) |
| **Stats (V2)** | 4 | ~18 | Etter lansering |

---

## 2 — Prioritert batch-rekkefølge

### P1 — Lanseringskritiske batcher (design og porter FØR 1. juli)

Disse MÅ ha Claude Design-fasit klart slik at porting kan skje parallelt med Bølge 1–3 i 70-planen.

| # | Batch-ID | Produkt | Prioritet | Skjermer | Prompt-fil |
|---|---|---|---|---|---|
| 1 | B0 | PlayerHQ | P1 | 5 | `design-koe/playerhq.md` → §B0 |
| 2 | B4 | PlayerHQ | P1 | 10 | `design-koe/playerhq.md` → §B4 |
| 3 | B4b | PlayerHQ | P1 | 9 | `design-koe/playerhq.md` → §B4b |
| 4 | B5 | PlayerHQ | P1 | 11 | `design-koe/playerhq.md` → §B5 |
| 5 | B5b | PlayerHQ | P1 | 4 | `design-koe/playerhq.md` → §B5b |
| 6 | AG-1 | AgencyOS | P1 | 4 | `design-koe/agencyos.md` → §AG-1 |
| 7 | AG-2 | AgencyOS | P1 | 4 | `design-koe/agencyos.md` → §AG-2 |
| 8 | AG-3 | AgencyOS | P1 | 5 | `design-koe/agencyos.md` → §AG-3 |
| 9 | AG-4 | AgencyOS | P1 | 8 | `design-koe/agencyos.md` → §AG-4 |
| 10 | AG-5 | AgencyOS | P1 | 4 | `design-koe/agencyos.md` → §AG-5 |
| 11 | AG-5b | AgencyOS | P1 | 6 | `design-koe/agencyos.md` → §AG-5b |
| 12 | AG-5c | AgencyOS | P1 | 2 | `design-koe/agencyos.md` → §AG-5c |
| 13 | B1 | PlayerHQ | P1 | 6 | `design-koe/playerhq.md` → §B1 |
| 14 | B1b | PlayerHQ | P1 | 8 | `design-koe/playerhq.md` → §B1b |
| 15 | B2 | PlayerHQ | P1 | 5 | `design-koe/playerhq.md` → §B2 |
| 16 | B3 | PlayerHQ | P1 | 4 | `design-koe/playerhq.md` → §B3 |
| 17 | MA-1 | Marketing | P1 | 4 | `design-koe/marketing-auth-forelder.md` → §MA-1 |
| 18 | MA-2 | Marketing | P1 | 4 | `design-koe/marketing-auth-forelder.md` → §MA-2 |
| 19 | MA-3 | Marketing | P1 | 2 | `design-koe/marketing-auth-forelder.md` → §MA-3 |
| 20 | MA-6 | Marketing/Booking | P1 | 4 | `design-koe/marketing-auth-forelder.md` → §MA-6 |
| 21 | AU-1 | Auth | P1 | 3 | `design-koe/marketing-auth-forelder.md` → §AU-1 |
| 22 | AU-2 | Auth | P1 | 2 | `design-koe/marketing-auth-forelder.md` → §AU-2 |
| 23 | FO-1 | Forelder | P1 | 3+stub | `design-koe/marketing-auth-forelder.md` → §FO-1 |

**P1 i tall: 23 batcher · ~129 skjermer**

> **Rekkefølge-notat:** B0 er lanseringskritisk og bør sendes til Claude Design FØR B1 siden økt-gjennomføring er kjerne-flyten. B4b og B5b kan sendes parallelt med B4 og B5.

### V2 — Post-lansering batcher

| # | Batch-ID | Produkt | Prioritet | Skjermer | Prompt-fil |
|---|---|---|---|---|---|
| 24 | B6 | PlayerHQ | V2 | 5 | `design-koe/playerhq.md` → §B6 |
| 25 | B7 | PlayerHQ | V2 | 10 | `design-koe/playerhq.md` → §B7 |
| 26 | B8 | PlayerHQ | V2 | 14 | `design-koe/playerhq.md` → §B8 |
| 27 | B9 | PlayerHQ | V2 | 7 | `design-koe/playerhq.md` → §B9 |
| 28 | AG-6 | AgencyOS | V2 | 6 | `design-koe/agencyos.md` → §AG-6 |
| 29 | AG-7 | AgencyOS | V2 | 4 | `design-koe/agencyos.md` → §AG-7 |
| 30 | AG-8 | AgencyOS | V2 | 6 | `design-koe/agencyos.md` → §AG-8 |
| 31 | AG-9 | AgencyOS | V2 | 5 | `design-koe/agencyos.md` → §AG-9 |
| 32 | AG-10 | AgencyOS | V2 | 8 | `design-koe/agencyos.md` → §AG-10 |
| 33 | MA-4 | Marketing/Blogg | V2 | 2 | `design-koe/marketing-auth-forelder.md` → §MA-4 |
| 34 | MA-5 | Marketing/Turneringer | V2 | 2 | `design-koe/marketing-auth-forelder.md` → §MA-5 |
| 35 | MA-7 | Marketing/Juridisk | V2 | 3 | `design-koe/marketing-auth-forelder.md` → §MA-7 |

**V2 i tall: 12 batcher · ~72 skjermer**

### Stats (eget spor, separat behandling)

Stats-plattformen er et eget design-spor med eget uttrykk (se `design-koe/stats.md`). Preambulen fra `10-PROMPT-PAKKE.md` limes inn FØR prompten.

| # | Batch-ID | Prioritet | Skjermer | Prompt-fil |
|---|---|---|---|---|
| 30 | S1 | P1 | 3 | `design-koe/stats.md` → §S1 |
| 31 | S2 | P1 | 4 | `design-koe/stats.md` → §S2 |
| 32 | S3 | V2 | 6 | `design-koe/stats.md` → §S3 |
| 33 | S4 | V2 | 6 | `design-koe/stats.md` → §S4 |
| 34 | S5 | V2 | 4 | `design-koe/stats.md` → §S5 |
| 35 | S6 | V2 | ~8 skjermtyper | `design-koe/stats.md` → §S6 |

**Stats i tall: 6 batcher · ~31 skjermtyper**

> **Stats-batch-numrene er nå #36–#41 (oppdatert fra #30–#35 etter at P1+V2-batchene ble utvidet).**

---

## 3 — Arbeidsflyt per batch

For ALLE batcher — Anders gjør trinn 1, deretter overtar Claude Code:

```
Trinn 1 (Anders):
  a. Åpne prompt-filen (se lenke i tabell over).
  b. Kopier prompten for aktuell batch.
  c. Lim inn i Claude Design — svar på spørsmål designer stiller.
  d. Eksporter .dc.html-filen til:
     public/design-handover/prosjektgjennomgang-2026-06-17/<batch-id>/

Trinn 2 (Claude Code — per porting-runbook i 40-PORTING-RUNBOOK.md):
  1. Les .dc.html + lag element-liste (7-stegs gate i 70-plan seksjon 3).
  2. Bygg fra design-kilden (ikke fra minne).
  3. Screenshot (route-shot.mjs, riktig bredde per produkt).
  4. Adversarial diff (kritiker-agent — finn avvik, IKKE godkjenn).
  5. Fiks til 0 avvik, loop.
  6. Koble Prisma-data + fiks døde knapper.
  7. Oppdater MASTER-SKJERMPLAN (6 haker per skjerm, samme commit).
  8. Kjør: npx prisma validate && tsc --noEmit && npm run build.
```

**Bredder:**
- PlayerHQ, Forelder, Auth: 430px mobil-first
- AgencyOS: 1280px desktop
- Marketing: 1440px desktop
- Stats: 1440px desktop (offentlig)

---

## 4 — Hvordan dette møter porting-bølgene i 70-planen

Design og porting skjer parallelt, ikke sekvensielt. Én agent designer neste batch mens forrige batch portes.

| Bølge (70-plan) | Bruker design fra batch | Parallell design-aktivitet |
|---|---|---|
| Bølge 1 — PlayerHQ kjerne | NY-HYBRID-handoff (allerede klar) | Send B4 + B5 til Claude Design nå |
| Bølge 2 — AgencyOS kjerne | NY-HYBRID-handoff (allerede klar) | Send AG-1 + AG-2 + AG-3 til Claude Design |
| Bølge 3 — Workbench | NY-HYBRID-handoff (allerede klar) | Send AG-4 + AG-5 + B1 til Claude Design |
| Bølge 4 — Forelder | NY-HYBRID-handoff (allerede klar) | Send B2 + B3 + MA-1 til Claude Design |
| Bølge 5 — Auth | NY-HYBRID-handoff (allerede klar) + AU-1/AU-2 | Send MA-2 + MA-3 + MA-6 til Claude Design |
| Bølge 6 — Marketing | MA-1/MA-2/MA-3/MA-6 fra Claude Design | Send FO-1 + AU-1 + AU-2 til Claude Design |
| Post-lansering V2 | B6–B9 + AG-6–AG-10 + MA-4/5/7 | Design-batcher settes i gang etter lansering |

**Nøkkelprinsipp:** Claude Design-fasiten for en batch MÅ komme FØR porting av den batchen starter. Design-frontloading (B4 og B5 sendes til Claude Design FØR Bølge 1 er ferdig) er den eneste måten å holde 1. juli-fristen.

---

## 5 — Estimat og milepæler

### P1: Ferdig FØR 1. juli 2026

```
Uke 25 (nå, 17.–23. juni):
  - Send B4 og B5 til Claude Design (dag 1–2)
  - Send AG-1, AG-2, AG-3 til Claude Design (dag 2–3)
  - Motta B4/B5-fasit → porter parallelt med Bølge 1 porting
  
Uke 26 (23.–29. juni):
  - Send B1, B2, B3 til Claude Design
  - Send AG-4, AG-5 til Claude Design
  - Send MA-1, MA-2, MA-3, MA-6 til Claude Design
  - Motta AG-batcher → porter parallelt med Bølge 2
  - Send AU-1, AU-2, FO-1 til Claude Design

Uke 27 (30. juni):
  - Alle P1-batcher har fasit fra Claude Design
  - Alle P1-batcher er portert og verifisert
  - Bølge 1–6 komplette i kode
  - Stripe + booking aktivert
  - Lansering
```

### V2: Juli–august 2026

```
Uke 28–30 (1.–21. juli):
  - Send B6, B7, B8, B9 til Claude Design
  - Send AG-6–AG-10 til Claude Design
  - Send MA-4, MA-5, MA-7 til Claude Design
  - Porter V2-batcher etter hvert som fasit kommer

Uke 31+ (august):
  - Stats-plattformen S3–S6 (V2)
  - QA + accesslint + brand-enforcer-runde for V2
```

---

## 6 — Anbefalt første 3 batcher (i denne rekkefølgen)

Disse tre sender du til Claude Design umiddelbart. De er P1, dekker de viktigste manglende analytikk-skjermene og blokkerer minst videre porting.

**Batch 1 — B4: Analysere-undersider + statistikk-dybde (PlayerHQ, 10 skjermer)**
Hvorfor først: SG-Hub-undersidene + runde-detalj er «moaten» — datarikeste skjermene i appen, og de mest etterspurte. Går rett inn i Bølge 1-porting. Gir test-overflate for DispersionMap + SgBreakdown-komponentene.
Prompt: `design-koe/playerhq.md` seksjon §B4.

**Batch 2 — AG-1: Handlingssenter godkjenning + oppfølging (AgencyOS, 4 skjermer)**
Hvorfor andre: AgencyOS-kjerneskjermene blokker Bølge 2. AG-1 er coachens daglige arbeidsflyt (godkjenner forespørsler, ser Workspace). Liten batch (4 skjermer) → rask runde-trip med Claude Design.
Prompt: `design-koe/agencyos.md` seksjon §AG-1.

**Batch 3 — B5: Coach-seksjonen (PlayerHQ, 11 skjermer)**
Hvorfor tredje: Coach-interaksjon (meldinger, planer, øvelser, videoer) er P1 og kobler direkte til AgencyOS-dataen som designer i AG-batchene. InboxList + MessageThread er nye komponenter som trengs på tvers av produkter — design dem her og gjenbruk i AgencyOS.
Prompt: `design-koe/playerhq.md` seksjon §B5.

---

## 7 — MASTER-SKJERMPLAN-kobling

Når en batch er portert og verifisert:
1. Finn ALLE skjermene fra batchen i `docs/MASTER-SKJERMPLAN.md`
2. Sett 6 haker grønne per skjerm (Design · Mob/Desktop/iPad · Adresse · Flyt · Data · Funker)
3. Oppdater dashboard-tellingen i MASTER-SKJERMPLAN Status-seksjonen
4. Logg i `~/ak-brain/prosjekter/akgolf-hq.md` og kjør `/lagre-sesjon`

Aldri merk en skjerm som ferdig i MASTER uten at den er verifisert i appen.

---

## Oppsummering for andersom

- **Totalt gjenstående:** ~225 skjermer fordelt på 40 batcher (+ 6 stats-batcher)
- **P1-batcher:** 23 batcher · ~129 skjermer — MÅ være designet og portert FØR 1. juli
- **Oppdatert 2026-06-17:** Lagt til 4 nye PlayerHQ-batcher (B0, B1b, B4b, B5b — 32 skjermer) og 2 nye AgencyOS-batcher (AG-5b, AG-5c — 8 skjermer). AG-5 fikset for mismatch (4, ikke 5 skjermer — /admin/godkjenninger/[id] dublert fra AG-1). 40 batcher totalt.
- **Første steg nå:** Send B0 (økt-gjennomføring, 5 skjermer, lanseringskritisk), B4 (10 skjermer, analytikk) og AG-1 (4 skjermer, handlingssenter) til Claude Design
- **Arbeidsflyt:** Anders limer prompt inn i Claude Design → eksporterer .dc.html → Claude Code porter via 7-stegs gate i 70-planen
