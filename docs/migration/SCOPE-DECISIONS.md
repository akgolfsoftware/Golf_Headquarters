# V2 Migration — Scope Decisions

**Dato:** 2026-05-25
**Godkjent av:** Anders Kristiansen, AK Golf Group AS
**Status:** Lukket — ikke endre uten ny formell beslutning

---

## Q1: Stilautoritet for skjermer uten V2-eqivalent

**Beslutning: B**

Når en V1-skjerm ikke har et tilsvarende V2-mønster (eks. `/admin/audit-log`, `/admin/email-templates`), skal vi **bygge et nytt mønster og legge det til V2-biblioteket først**.

**Konsekvens:**
- V2-biblioteket utvides iterativt under migrasjonen
- Ingen "fudging" av enkelt-skjermer
- Nye mønstre må godkjennes av Anders før de slipper inn i biblioteket
- Hver nytt mønster dokumenteres i `V2-PATTERNS.md`

**Hvem godkjenner nye mønstre:** Anders (via screenshot-review eller live preview)

---

## Q2: Funksjonalitet vs UI

**Beslutning: A**

Vi bevarer all eksisterende logikk (Prisma-queries, auth, forretningsregler), og bytter kun UI-laget.

**Konsekvens:**
- Server Actions, route handlers, lib-funksjoner forblir uendret
- Prisma-schema endres ikke under denne migrasjonen
- Auth-guards (`requirePortalUser`, `hasRole`) forblir
- Refactor til bedre data-flow gjøres som SEPARAT prosjekt etter v2.0.0

**Risiko som elimineres:** Funksjonsregresjoner under UI-refactor.

---

## Q3: Stub-skjermer

**Beslutning: A**

Skjermer som er stubs i V1 ("kommer snart"-placeholders) skal **bygges som ekte versjoner med V2-design** under denne migrasjonen.

**Konsekvens:**
- Scope utvides — ikke bare ny styling, men også ekte implementering
- Stub-skjermer blir identifisert i `V1-TO-V2-MAPPING.md` med flag `stub→full`
- Krever ekte demo-data, ekte Prisma-queries, ekte handlinger
- Estimat justert: +20-30% tid for stub→full-konvertering

**Stub-skjermer i V1 (foreløpig liste):**
- `coachhq-stubs/KONTROLL-bookinger.html`
- `coachhq-stubs/KONTROLL-godkjenninger.html`
- `coachhq-stubs/KONTROLL-plan-templates.html`
- `coachhq-stubs/KONTROLL-settings.html`
- `coachhq-stubs/KONTROLL-wagr-import.html`
- `coachhq-stubs/audit-log.html`
- `coachhq-stubs/notion-prosjekter.html`
- `coachhq-stubs/workspace-tildelt-meg.html`
- (Full liste etableres i V1-TO-V2-MAPPING.md)

---

## Q4: Plan A-workbench

**Beslutning: B**

Plan A (plan-bygger med 5 zoom-nivåer + pyramide-baner) er **utenfor scope** for denne migrasjonen.

**Konsekvens:**
- Plan A blir egen sprint etter v2.0.0
- Egen Prisma-schema-utvidelse for plan-period-types kommer da
- `/portal/tren/aarsplan` (eksisterende) får V2-styling i denne migrasjonen
- Plan A-bundle lagres som referanse i `docs/design-resources/`

**Planlagt Plan A-sprint:** Etter v2.0.0 launch, sannsynligvis uke 24-25.

---

## Q5: Fotoer

**Beslutning: A**

Hver skjerm får 1-2 relevante AK Golf Academy-foto.

**Konsekvens:**
- Photo-assignment-strategi må etableres som del av Pre-Fase 1
- 41 WebP-foto i `/public/images/akgolf/` er pålatten
- Hver V1-skjerm tilordnes 1 hero-foto (obligatorisk) + 0-1 sub-foto (kontekstuell)
- `PHOTO-ASSIGNMENT-MATRIX.md` mapper foto → skjerm
- Foto-temaer:
  - Swing-fokus (#1, #2, #38) → spiller-orientert
  - Coach + spiller (#7, #17, #25) → coaching-sider
  - Bane-action (#22, #26, #44) → tournament/turning
  - Stille/editorial (#10, #14, #19) → admin/profil
  - Performance Studio (#28, #29, #31) → fasiliteter/tekninker

---

## Stadfestet scope

148 V1-skjermer skal:
1. Implementeres i V2-stil (LIVING athletic editorial)
2. Bevare eksisterende funksjonalitet (Prisma, auth, lib)
3. Få ekte data der V1 hadde stubs
4. Få 1-2 AK Golf Academy-foto per skjerm
5. Verifiseres mot 20-punkts sjekkliste per skjerm

**Ikke i scope:**
- Plan A-workbench (egen sprint senere)
- Refactor av forretningslogikk
- Endringer i Prisma-schema (utenom det Q3 krever)
- Nye features utover stub→full-konvertering

---

## Endringskontroll

Endringer i dette dokumentet krever:
1. Skriftlig forespørsel fra Anders
2. Konsekvensanalyse (hvor mange skjermer påvirket, tid)
3. Godkjent endring → ny versjon av dokumentet
4. Re-baseline av tid-estimater
