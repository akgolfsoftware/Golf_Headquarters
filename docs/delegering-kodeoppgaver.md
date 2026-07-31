# Delegerte kodeoppgaver — AK Golf HQ

Oppgavekort for en modell som IKKE er Claude, som jobber i dette repoet.
Kilde: `docs/for-under-etter-spec.md` (gren `feature/for-under-etter-spec`), seksjon 12.

**Skrevet 31.07.2026.** Design og designsystem gjøres i Claude Design og er IKKE her.

---

## Leseplikt før første oppgave

1. `CLAUDE.md` i repo-rot — invarianter, stack, arbeidsregler
2. `.claude/rules/gotchas.md` — **les denne før du skriver kode**, den er full av feller som har bitt før
3. `docs/for-under-etter-spec.md` — hele spesifikasjonen oppgavene er hentet fra

## Kontrakten — gjelder hver eneste oppgave

**Ferdig betyr at `npm run verify && npm test` er grønt.** Ikke «koden ser riktig ut».
`verify` = `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src && node scripts/check-action-auth.mjs && npm run build`.

**Aldri:**
- `any` i TypeScript uten eksplisitt begrunnelse i kommentar
- `as unknown as T` på forretningskritiske data — bruk zod (`src/lib/validation/schemas.ts`)
- emoji i kode eller UI — Lucide-ikoner
- engelsk i UI-tekst — alt er norsk bokmål
- domenelogikk i komponenter — den bor i `src/lib/domain/`
- `prisma migrate dev` eller `prisma db push` — begge er ødelagte her, se gotchas
- rå `getDay()` / `setHours()` på datoer — bruk `src/lib/uke-helpers.ts` (Oslo-tid)
- push til `main`. Jobb i gren, åpne PR.

**Aldri rør:** `.env*`-filer, ekte spillerdata, databasedumper. Repoet inneholder navn på
mindreårige elever — de skal ikke inn i en prompt hos en tredjepartsmodell. Bruk
demo-navnene: spiller **Øyvind Rohjan**, coach **Anders Kristiansen**.

**Stopp og spør Anders ved:** nye avhengigheter, schema-endringer, ruter som fjerner URL-er,
alt som rører betaling, samtykke eller sletting.

**Rapporter alltid hva som IKKE ble ferdig.** Delvis levering meldt som ferdig er verre enn
ingen levering.

---

# Oppgavekortene

Rekkefølgen er fra spec-en. Spor B har ingen avhengighet til spor A og kan tas parallelt.
**Begynn med B11** — den er minst risikabel og lærer deg kodebasens konvensjoner.

---

## B11 · `ListRow.trailing` — additivt felt

**Mål:** `ListRow` skal kunne vise et halefelt uten at noen eksisterende bruk endrer seg.

**Filer:** `src/components/` — finn `ListRow` med grep, den har flere varianter.

**Ferdig når:**
- `npm run verify && npm test` grønt
- alle eksisterende bruksteder av `ListRow` rendrer **uendret** — verifiser ved å telle dem
  først (`grep -rn "ListRow" src/ | wc -l`) og gå gjennom hver enkelt
- `meta`, `unread` og `chevron` har uendret oppførsel

**Forbudt:** å endre signaturen til eksisterende props. Feltet er additivt.

**Stopp og spør hvis:** du finner mer enn én `ListRow`-implementasjon og er i tvil om hvilken
som er kanonisk.

---

## B12 · Generaliser `VisningsVelger`

**Mål:** `VisningsVelger` finnes, men er låst til kalendertyper. Den skal kunne velge mellom
vilkårlige visninger. **Bygg den ikke på nytt** — generaliser den som finnes.

**Ferdig når:** eksisterende kalenderbruk er uendret, og komponenten tar en generisk liste.

**Forbudt:** å lage en parallell komponent ved siden av. Det er nøyaktig feilen spec-en advarer mot.

---

## B14 · `GroupCard`, tre varianter

**Mål:** kort for en gruppe, tre varianter styrt av `Group.kind`.

**Avhenger av:** `Group.kind` i schema-runden. **Feltet finnes ikke ennå.**
Til det er kjørt: bygg komponenten mot en lokal type, ikke mot Prisma-modellen.

**Stopp og spør hvis:** `Group.kind` fortsatt mangler når du kommer hit.

---

## B13 + B15 · Spillere-flaten, to faner

**Mål:** fanen «Alle spillere» og fanen «Alle grupper».

**Avhenger av:** B11, B12, B14 — og av at designet er ferdig i Claude Design.

**Ferdig når:** verify grønt, begge faner rendrer med ekte data, ingen ny navigasjonsflate
er lagt til (maks fem arbeidsflater — regelen er bindende).

**Stopp og spør hvis:** designet ikke foreligger. Ikke dikt opp et.

---

## A2 · AK-glossar i `transcribe.ts` — raskeste gevinst i hele lista

**Mål:** `GOLF_PROMPT` i `src/lib/.../transcribe.ts` har i dag null AK/MORAD-terminologi, kun
generiske engelske golftermer. Whisper har derfor aldri hatt en sjanse på norske fagtermer.

**Legg inn:** P1–P10 (MORAD-posisjoner) · CS20–CS100 · L-KROPP / L-ARM / L-KØLLE / L-BALL /
L-AUTO · M0–M5 · PR1–PR5 · FYS/TEK/SLAG/SPILL/TURN · A–K-kategorier · «nærspill» (aldri
«kort spill») · norske klubbnavn.

**Ferdig når:** strengen inneholder termene, verify grønt.

**Merk:** ren strengendring, stor effekt. Gjør den før spiken.

**Forbudt:** å endre modellvalg eller API-oppsett. Kun prompt-strengen.

---

## A3 · `--handling`-token + gate i `verify`

**Mål:** ett token for den oransje primærhandlingen, og en gate i `verify` som feiler hvis en
skjerm har mer enn én.

**Ferdig når:**
- tokenet finnes og brukes
- gaten er lagt til i **både** `package.json`-scriptet `verify` OG `.github/workflows/ci.yml`
  — de to skal aldri komme ut av synk (den gamle hex-gaten gjorde nettopp det)
- **gaten er sett feile:** lag en skjerm med to oransje handlinger, kjør gaten, se den bli rød,
  fjern skjermen igjen. **Rapporter at du gjorde dette.** En gate som ikke er sett feile, er
  ikke verifisert.

**Deles med spor B.** Gjøres her, spor B arver den.

---

## A1 · Samtykkegating i `/api/recording/start`

**Mål:** ingen lydfangst uten gyldig `LydSamtykke`. Hard gate **på server**, ikke bare klient.

**Avhenger av:** `LydSamtykke` i schema-runden.

**Ferdig når:**
- kall uten gyldig samtykke returnerer feil før noe lyd tas imot
- gaten kan ikke omgås fra klienten
- det finnes en test som treffer den nektede stien

**Dette er eneste tillatte unntak fra invariant 1** («anbefalinger sperrer aldri»). Alt annet i
appen skal aldri blokkere.

**Stopp og spør før du rører:** sletting, trukket samtykke eller foresatt-e-post. GDPR-sti.

---

## A7 · Godkjenningskortet i `/admin/queue`

**Mål:** ETTER-steget. `/admin/queue` har allerede en tom «Løst»-kolonne som venter på dette.

**Bruk `PlanAction`** — den finnes med `suggestion`, `status`, `provenance` og riktig indeks.
**Bygg IKKE `CoachingTask`.** Det ville vært en parallell kø med samme jobb.

**Ferdig når:** verify grønt, kortet leser `provenance` og kan svare på «hvorfor dette tallet».

---

## A8 · Før-kortet i `/admin/innboks`

**Mål:** FØR-steget. Ingen ny navigasjonsflate — det bor i Innboks.

**Ferdig når:** verify grønt, kortet er forhåndsutfylt (aldri tom skjerm).

---

## A9 · Instrumentering

**Mål:** måle om sløyfen virker. Se spec seksjon 8.

**Ferdig når:** hendelsene logges og kan leses ut.

**Forbudt:** å logge PII. Ingen elevnavn i hendelsesdata.

---

# Ikke deleger disse

| Oppgave | Hvorfor den blir hos Anders / Claude |
|---|---|
| **Schema-runden** (LydSamtykke · PlanAction.sjekkpunkt+fangstId · TradApning · Group.kind) | Kjøres med kirurgisk `db execute` mot produksjonsdatabasen. Du kan gjerne **skrive** SQL-en og redigere `schema.prisma` — men ikke kjøre noe mot databasen. |
| **A4 · Talegjenkjenning-spike** | 10 ekte opptak av mindreårige. PII i sky-prompt hos tredjepart. |
| **A5 · IndexedDB-kø** | Høyest datataps-risiko. Må testes i ekte flymodus på rangen, ikke i devtools. |
| **A6 · Fangst-skjermen** | Designes i Claude Design først. Koden kan delegeres etterpå. |
| **A10 · Pilot bølge 1** | Menneskearbeid. |

---

# Kjent blokker over alt dette

**DKIM blokkerer samtykke, som blokkerer all fangst.** Fase 0-infrastrukturen kjøres i egen
økt og er ikke dekket av spec-en. Uten den kommer ikke spor A forbi punkt A1.

Personvernerklæringen må oppdateres før pilot. Ikke dekket noe sted ennå.
