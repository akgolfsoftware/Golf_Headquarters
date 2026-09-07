# Team Norway-skjermer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port de resterende Team Norway-skjermene fra Claude Design-prosjektet «Claw Design — Team Norway Golf» (`a03bf94a-c923-4c04-82ff-415773557e37`, speilet i `designsystem/team-norway/`) til ekte kode på `/team-norway/*`, på ekte data — ikke fabrikkerte tall.

**Architecture:** To skjermer (organisasjonsskallet og Oversikt) er klare til å bygges på data som finnes i dag og får full TDD-detalj i denne planen. De fem resterende (Uttak, Rangliste, Fellestesting, Protokollbibliotek, Protokolldetalj) er blokkert på datamodell- eller driftsmodell-beslutninger som er Anders' å ta (ikke noe en agent skal anta) — de får en presis beslutningsoppgave hver i stedet for oppdiktet kode, og en egen oppfølgingsplan skrives når svaret foreligger.

**Tech Stack:** Next.js App Router (server components + server actions), Prisma/Postgres, Claw-designsystemet (`TN`-tokens i `src/lib/v2/team-norway.ts`, IKKE Train-lock/`TL`), Node test runner (`node:test` + `node:assert/strict`).

**Spec:**
- `designsystem/team-norway/templates/tn-skall/TnSkall.dc.html` (org-skall)
- `designsystem/team-norway/templates/tn-oversikt/TnOversikt.dc.html` (Oversikt)
- `designsystem/team-norway/readme.md` (fargeregler, bevegelse, typografi)
- `.claude/rules/beslutninger.md` §TEAM NORWAY-WORKDESK — spesifikasjon, §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN, §TN-RØDT LÅST
- `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 17 (17.1-17.6)
- `designsystem/team-norway/docs/team-norway-workdesk-skjermplan.md`

## Global Constraints

- **Claw er fasit for `/team-norway/*`, Train-lock rører det aldri.** Bruk KUN `TN.*` fra `src/lib/v2/team-norway.ts` - aldri `TL.*`, aldri `--tl-*`, aldri Train-lock-komponenter (beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN).
- **TN-rød `#D70232` KUN på logo og skinne, aldri som statusfarge.** Status bruker `TN.status.*` (en egen, varmere rød `#C2352B` sammen med grønn og ravgul) - aldri merkevarerødt for feil/varsel (N-D2, §TN-RØDT LÅST).
- **Ingen fri chat.** Kun poster (`tn-post.ts` er allerede bygget slik) - dette gjelder ikke denne planens skjermer direkte, men enhver ny kommunikasjonsflate i Team Norway skal følge samme regel.
- **IDOR-mønsteret er obligatorisk for enhver ny lesefunksjon:** gate på `viewerId`/`userId` som parameter, bruk `aktivtTrenerMedlemskapWhere`/`aktivtSpillerMedlemskapWhere`/`hentViewerRolleIGruppe`-mønsteret fra `src/lib/domain/grupper.ts`/`src/lib/domain/tn-post.ts`, returner `null`/tom liste ved manglende tilgang - kast ALDRI en feil som lekker om raden finnes.
- **TruthLayer: ingen fabrikkerte tall.** Mangler grunnlaget for et tall, sier UI-en det - aldri en plausibel gjetning. Design-annotasjonene i `.dc.html`-filene («Tall som er eksempler») lister nøyaktig hvilke tall i mockupen er skjermtekst kontra ekte bestilling - bruk den listen, ikke egen vurdering.
- **Én gren per skjerm. ALDRI merge selv.** Push, åpne draft-PR, vent på Anders' skjermbilde-gate (mobil 390 + desktop 1280, lys - Team Norway har ikke mørk modus per readme: «Standardflate: Lys - mørk brukes kun til hero, seksjonsskille og presentasjon»).
- **`npm run verify` grønt før hver commit.** Ingen `--no-verify`.
- **Norsk bokmål i all UI-tekst og domenekode** - identifikatornavn på norsk i domenelaget, matcher resten av `src/lib/domain/`.

---

## Fase-oversikt

| Fase | Hva | Status |
|---|---|---|
| 0 | Verifiser datagrunnlag i prod (read-only) + én organisasjons-identifikasjonsbeslutning | Må gjøres først, blokkerer Fase 2 |
| 1 | `TnRail` -> dynamisk, rutebevisst, responsiv (skjermbilde: TnSkall) | Full TDD-plan under |
| 2 | `/team-norway` - Oversikt med ekte dekningsgrad (skjermbilde: TnOversikt) | Full TDD-plan under, avhenger av Fase 0 |
| 3 | Uttak + Rangliste | **Blokkert.** Beslutningsoppgave, ikke kode - se «Blokkerte skjermer» |
| 4 | Fellestesting | **Blokkert.** Beslutningsoppgave, ikke kode |
| 5 | Protokollbibliotek + Protokolldetalj | **Blokkert.** Beslutningsoppgave, ikke kode |
| 6 | Skoleoversikt | **Ikke undersøkt ennå** - egen research-oppgave før noen beslutning kan tas |

De tre TN-09/10/11-skjermene (Gruppeposter, Post til enkeltspiller, Dokumentdeling) er allerede levert (PR #726/#727) og røres ikke av denne planen.

---

## File Structure

**Nye filer:**
- `src/lib/domain/tn-skall.ts` - ren funksjon: rutebevisst aktiv-deteksjon for TN-railen (samme mønster som `skallAktivFraPath` i AgencyOS, men egen fil siden Claw og Train-lock aldri deler kode).
- `src/lib/__tests__/domain/tn-skall.test.ts`
- `src/lib/domain/tn-oversikt.ts` - ren funksjon: regner dekningsgrad (komplett/delvis/samtykket-uten-data/ikke-samtykket) fra rå input.
- `src/lib/__tests__/domain/tn-oversikt.test.ts`
- `src/lib/team-norway/oversikt-data.ts` - loader: henter coach sine TN-grupper + spillerdata, kaller domenefunksjonen.
- `src/app/team-norway/page.tsx` - ny rute, TnOversikt.
- `src/components/team-norway/rail-mobil.tsx` - ny komponent: mobil bunn-nav/ark-variant av railen (TnRail har i dag KUN en fast 232px desktop-versjon).

**Endrede filer:**
- `src/components/team-norway/core.tsx` - `TnRail` (linje 167-287): parameteriser org-navn/undertittel (i dag hardkodet «Team Norway» / «Junior»), fjern implisitt «alltid desktop»-antakelse (legg til `className="hidden [breakpoint]:flex"` og la ny `TnRailMobil` dekke resten).
- `src/app/team-norway/layout.tsx` - monter railen (i dag rendrer trolig ingenting delt - bekreft ved lesing i Task 1.1) med ekte org-navn fra ny loader, ikke hardkodet tekst.
- `src/app/team-norway/[groupId]/page.tsx` og `.../dokumenter/page.tsx` - bytt den lokalt bygde `punkter: TnMenyPunkt[]`-arrayen til å bruke den nye `tnAktivFraPath`-funksjonen i stedet for en manuelt satt `aktiv`-flagg (kirurgisk endring, ikke en rewrite - behold alt annet i filene).

---

## Fase 0 - Verifiser datagrunnlag (blokkerer Fase 2)

### Task 0.1: Les-only sjekk av Team Norway-gruppedata i prod

**Files:**
- Ingen filendring - dette er en engangsspørring, kjørt med `tsx` mot `DIRECT_URL`, samme mønster som `prosjektrevisjon-2026-09-05.md` brukte (kun lesende tellinger, ingen PII i output).

- [ ] **Steg 1: Kjør en read-only telling mot prod**

Fra en økt med ekte `.env.local` (IKKE denne worktreen - se gotchas.md «Aldri kopier .env* inn i en worktree»), kjør:

```bash
npx tsx --conditions=react-server -e '
import "./src/lib/prisma/_env.js";
import { prisma } from "./src/lib/prisma";
(async () => {
  const grupper = await prisma.group.findMany({
    where: { slug: { startsWith: "team-norway" } },
    select: { id: true, slug: true, name: true, kind: true, managedByAkGolf: true },
  });
  console.log("Grupper:", grupper);
  for (const g of grupper) {
    const antall = await prisma.groupMember.count({ where: { groupId: g.id, endedAt: null } });
    console.log(g.slug, "aktive medlemmer:", antall);
  }
  await prisma.$disconnect();
})();
'
```

- [ ] **Steg 2: Noter resultatet i denne planens fremdriftslogg (nederst i filen), ikke bare i terminalen**

To mulige utfall, og hva de betyr for Fase 2:
- **Én gruppe (`team-norway`) med >=1 aktivt medlem** -> Fase 2 bygges mot akkurat den ene gruppen. Ingen organisasjons-switcher trengs ennå (pilotens faktiske omfang, jf. STEG 17.4: «Anders + 2-5 navngitte TN-trenere»).
- **Ingen grupper, eller gruppen finnes men har 0 medlemmer** -> Fase 2 kan ikke vise ekte dekningsgrad ennå. Stopp her, meld tilbake til Anders at seed/pilot-onboarding (STEG 17.4) må skje først - bygg IKKE en tom-tilstand-only versjon som late-binder til en gruppe som ikke finnes; det er «Task 2.x» sitt ansvar å håndtere en ekte tom gruppe (0 spillere), ikke en helt manglende gruppe.

### Task 0.2: Bekreft organisasjons-identifikasjon med Anders

**Ikke kode. Presentér dette spørsmålet før Fase 2 startes:**

Skjemaet har ingen `Organization`-modell over `Group` - «Team Norway» som organisasjon er i dag bare metadata (`kind: "ekstern"`, `managedByAkGolf: false`) på én enkelt kanonisk gruppe (`src/lib/domain/grupper.ts`, `KANONISKE_GRUPPER`). TnSkall-designet forutsetter derimot at en trener kan se «2 av 6 grupper» og bytte mellom flere Team Norway-undergrupper (aldersklasser/regionlag) - den strukturen finnes ikke i databasen.

**Anbefaling (foreslått i denne planen, IKKE besluttet av agenten):** bruk `Group.slug`-prefiks `team-norway*` som organisasjons-identifikator inntil en egen modell trengs - dvs. enhver fremtidig undergruppe (f.eks. `team-norway-jenter`) telles med automatisk uten skjemaendring. Dette dekker pilotens faktiske behov (én gruppe) og skalerer forsiktig.

**Spørsmål til Anders:** godkjenn prefiks-konvensjonen over, ELLER si at organisasjons-switcheren (TnSkall sitt «BYTT ORGANISASJON»-ark) skal utsettes helt til en ekte `Organization`-modell er spesifisert. Fase 1 i denne planen bygger uansett IKKE org-switcheren (se Task 1.4) - svaret påvirker kun hvor mange grupper Fase 2 sin dekningsgrad skal summere over.

---

## Fase 1 - `TnRail`: dynamisk, rutebevisst, responsiv

Fasit: `designsystem/team-norway/templates/tn-skall/TnSkall.dc.html`. Nåværende kode: `src/components/team-norway/core.tsx:167-287` (`TnRail`) - allerede Claw-riktig visuelt, men hardkodet tekst («Team Norway» / «Junior»), ingen rutedeteksjon (kallerne setter `aktiv` manuelt), og ingen mobilvariant (fast 232px, ingen brekkpunkt).

### Task 1.1: Ren funksjon for aktiv-rute-deteksjon

**Files:**
- Create: `src/lib/domain/tn-skall.ts`
- Test: `src/lib/__tests__/domain/tn-skall.test.ts`

**Interfaces:**
- Produces: `tnAktivFraPath(pathname: string): string | null` - brukt av Task 1.3 og av `[groupId]/page.tsx`/`.../dokumenter/page.tsx` i Task 1.5.

- [ ] **Steg 1: Skriv feilende test**

```ts
// src/lib/__tests__/domain/tn-skall.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { tnAktivFraPath } from "@/lib/domain/tn-skall";

test("gruppepost-siden gir 'oversikt' som aktiv rad", () => {
  assert.equal(tnAktivFraPath("/team-norway/abc123"), "oversikt");
});

test("dokumenter-undersiden gir samme aktiv-id som selve gruppen (ingen egen rad i menyen ennå)", () => {
  assert.equal(tnAktivFraPath("/team-norway/abc123/dokumenter"), "oversikt");
});

test("spillerpost-siden gir null - den ligger ikke i railens meny", () => {
  assert.equal(tnAktivFraPath("/team-norway/spiller/xyz"), null);
});

test("root-siden /team-norway gir 'oversikt'", () => {
  assert.equal(tnAktivFraPath("/team-norway"), "oversikt");
});

test("ukjent sti gir null, ikke en gjetning", () => {
  assert.equal(tnAktivFraPath("/admin/spillere"), null);
});
```

- [ ] **Steg 2: Kjør testen, bekreft at den feiler**

```bash
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/domain/tn-skall.test.ts
```
Forventet: FAIL - `Cannot find module '@/lib/domain/tn-skall'`.

- [ ] **Steg 3: Skriv minimal implementasjon**

```ts
// src/lib/domain/tn-skall.ts
/**
 * Aktiv-rute-deteksjon for TnRail - Claw sin variant av `skallAktivFraPath`
 * (AgencyOS). Egen fil fordi Claw og Train-lock aldri deler kode
 * (beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN).
 *
 * Prefiks-tabellen er bevisst kort - kun rutene som faktisk ligger i
 * TnSkall sin meny (`menySet()` i designfilen) skal gi et treff. Ruter
 * utenfor menyen (spillerpost) gir `null`, ikke en gjetning.
 */

const PREFIKSER: { prefix: string; id: string }[] = [
  { prefix: "/team-norway/spiller", id: "" }, // sjekkes FØR /team-norway under - mer spesifikk vinner
  { prefix: "/team-norway", id: "oversikt" },
];

export function tnAktivFraPath(pathname: string): string | null {
  for (const { prefix, id } of PREFIKSER) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return id || null;
    }
  }
  return null;
}
```

- [ ] **Steg 4: Kjør testen på nytt, bekreft at den består**

```bash
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/domain/tn-skall.test.ts
```
Forventet: 5 pass.

- [ ] **Steg 5: Commit**

```bash
git add src/lib/domain/tn-skall.ts src/lib/__tests__/domain/tn-skall.test.ts
git commit -m "feat(team-norway): ren funksjon for rutebevisst aktiv-rad i TnRail"
```

### Task 1.2: Parameteriser `TnRail` - org-navn og undertittel, ikke hardkodet tekst

**Files:**
- Modify: `src/components/team-norway/core.tsx:167-287`

**Interfaces:**
- Consumes: ingenting nytt.
- Produces: `TnRail`-props utvidet med `orgNavn: string` og `orgUndertittel: string` - konsumeres av Task 1.5 (kallerne i `[groupId]/page.tsx` m.fl.) og Task 2.3 (Oversikt-siden).

- [ ] **Steg 1: Endre prop-signaturen og fjern hardkodingen**

I `src/components/team-norway/core.tsx`, endre funksjonssignaturen (linje 167):

```ts
export function TnRail({
  punkter,
  bruker,
  orgNavn,
  orgUndertittel,
}: {
  punkter: TnMenyPunkt[];
  bruker: TnBrukerFot;
  orgNavn: string;
  orgUndertittel: string;
}) {
```

Og bytt de to hardkodede tekstene (linje 195 `Team Norway` og linje 207 `Junior`) til `{orgNavn}` og `{orgUndertittel}`.

- [ ] **Steg 2: Oppdater de to eksisterende kallerne så de ikke knekker**

`src/app/team-norway/[groupId]/page.tsx` og `src/app/team-norway/[groupId]/dokumenter/page.tsx` kaller i dag `<TnRail punkter={...} bruker={...} />` uten de to nye propsene. Legg til `orgNavn="Team Norway"` og `orgUndertittel="Junior"` i begge - samme verdier som før, kun eksplisitte nå i stedet for hardkodet inni komponenten. Dette er en presserende, ren tekst-endring - ikke rør resten av de to filene.

- [ ] **Steg 3: Kjør typesjekk**

```bash
npx tsc --noEmit
```
Forventet: 0 feil. (Ingen egen test her - dette er en ren prop-plumbing-endring uten ny logikk; `TnRail` har ingen eksisterende test å bygge videre på, og å legge til en snapshot-test for JSX-tekst gir ikke reell trygghet utover det tsc allerede gir.)

- [ ] **Steg 4: Commit**

```bash
git add src/components/team-norway/core.tsx "src/app/team-norway/[groupId]/page.tsx" "src/app/team-norway/[groupId]/dokumenter/page.tsx"
git commit -m "refactor(team-norway): TnRail tar org-navn/undertittel som prop, ikke hardkodet tekst"
```

### Task 1.3: Bruk `tnAktivFraPath` i railens kallere i stedet for manuell `aktiv`-flagging

**Files:**
- Modify: `src/app/team-norway/[groupId]/page.tsx`
- Modify: `src/app/team-norway/[groupId]/dokumenter/page.tsx`

**Interfaces:**
- Consumes: `tnAktivFraPath` fra Task 1.1.

- [ ] **Steg 1: Les dagens `punkter`-array i begge filer**

Finn stedet i hver fil der `punkter: TnMenyPunkt[]` bygges (sannsynligvis en `menySet()`-lignende liste med `aktiv: true` satt manuelt på riktig rad for den aktuelle siden - bekreft eksakt variabelnavn før du endrer).

- [ ] **Steg 2: Bytt den manuelle `aktiv`-verdien til å komme fra `tnAktivFraPath`**

I stedet for en hardkodet `aktiv: true` på «Oversikt»-raden i begge filer, importer `tnAktivFraPath` og bruk resultatet:

```ts
import { tnAktivFraPath } from "@/lib/domain/tn-skall";
// ...
const aktivId = tnAktivFraPath(`/team-norway/${groupId}`); // "oversikt" for begge sider i dag
```

og sett `aktiv: aktivId === "oversikt"` på riktig meny-rad i stedet for en hardkodet `true`. Dette er bevisst identisk oppførsel i dag (begge sider peker på samme meny-rad) - verdien av endringen er at NÅR flere rader legges til railen (Fase 2+), går alle sidene automatisk riktig i stedet for at hver side må oppdateres manuelt.

- [ ] **Steg 3: Kjør verify**

```bash
npm run verify
```
Forventet: grønt.

- [ ] **Steg 4: Commit**

```bash
git add "src/app/team-norway/[groupId]/page.tsx" "src/app/team-norway/[groupId]/dokumenter/page.tsx"
git commit -m "refactor(team-norway): rail-aktiv-rad fra tnAktivFraPath, ikke hardkodet"
```

### Task 1.4: Mobil-variant av railen

**Ikke bygget i denne planen: organisasjons-switcher («BYTT ORGANISASJON»-arket).** TnSkall sitt eget designnotat kaller dette «usikkert» (se skjermens «Tre:»-punkt) - vent på Task 0.2s svar før den bygges. Mobilvarianten her dekker KUN navigasjon, ikke org-bytte.

**Files:**
- Create: `src/components/team-norway/rail-mobil.tsx`
- Modify: `src/components/team-norway/core.tsx:167-179` (legg til `className="hidden lg:flex"` på `TnRail`s rot-div, se steg 2)

**Interfaces:**
- Consumes: samme `punkter: TnMenyPunkt[]`, `orgNavn: string` som `TnRail` (Task 1.2).
- Produces: `TnRailMobil({ punkter, orgNavn }: { punkter: TnMenyPunkt[]; orgNavn: string })` - konsumeres av Task 1.5.

- [ ] **Steg 1: Bygg en enkel toppbar + utfellbar meny for mobil**

```tsx
// src/components/team-norway/rail-mobil.tsx
"use client";

import { useState } from "react";
import { TN } from "@/lib/v2/team-norway";
import { Icon } from "@/components/v2";
import type { TnMenyPunkt } from "./core";

/**
 * Mobil-erstatning for `TnRail` under `TN_BREKK.rail` (1101px - samme
 * brekkpunkt som Train-lock sin `TL_BREKK.macRail`, for konsistent følelse
 * på tvers av de to designsystemene selv om de aldri deler kode). Ingen
 * organisasjons-switcher her - se Task 1.4s hode-kommentar i planen.
 */
export function TnRailMobil({ punkter, orgNavn }: { punkter: TnMenyPunkt[]; orgNavn: string }) {
  const [apen, setApen] = useState(false);
  const lenker = punkter.filter((p): p is Extract<TnMenyPunkt, { type: "lenke" }> => p.type === "lenke");

  return (
    <div className="flex lg:hidden" style={{ flexDirection: "column", width: "100%" }}>
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${TN.borderSubtle}`,
          background: TN.surfaceCard,
        }}
      >
        <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.bold, color: TN.navy900 }}>
          {orgNavn}
        </span>
        <button
          type="button"
          onClick={() => setApen((v) => !v)}
          aria-expanded={apen}
          aria-label={apen ? "Lukk meny" : "Åpne meny"}
          style={{ background: "none", border: "none", padding: 8, cursor: "pointer" }}
        >
          <Icon name={apen ? "x" : "menu"} size={20} style={{ color: TN.navy900 }} />
        </button>
      </div>
      {apen && (
        <nav
          aria-label="Team Norway"
          style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 2, background: TN.surfaceCard, borderBottom: `1px solid ${TN.borderSubtle}` }}
        >
          {lenker.map((p) => (
            <a
              key={p.href}
              href={p.href}
              onClick={() => setApen(false)}
              style={{
                height: 44,
                borderRadius: TN.radius.xs,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: p.aktiv ? TN.navy100 : "transparent",
                color: p.aktiv ? TN.navy900 : TN.textSecondary,
                fontFamily: TN.font.body,
                fontSize: TN.text.sm,
                fontWeight: TN.weight.medium,
              }}
            >
              {p.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Steg 2: Skjul `TnRail` under brekkpunktet, vis kun over**

I `src/components/team-norway/core.tsx`, legg til `className="hidden lg:flex"` på `TnRail`s rot-`<div>` (linje 169), slik at den forsvinner på smale skjermer i stedet for å bli klemt til uleselighet (232px fast bredde har i dag ingen nedre brekkpunkt). Tailwinds `lg`-prefiks tilsvarer 1024px som standard i dette prosjektet - bekreft mot `tailwind.config`/`globals.css` at det ikke er endret; bruk uansett samme prefiks som resten av railen skal reagere på i Task 1.5, ikke en frittstående pikselverdi.

- [ ] **Steg 3: Kjør verify**

```bash
npm run verify
```

- [ ] **Steg 4: Commit**

```bash
git add src/components/team-norway/rail-mobil.tsx src/components/team-norway/core.tsx
git commit -m "feat(team-norway): mobil topplinje+meny for TN-skallet under lg-brekkpunktet"
```

### Task 1.5: Monter begge rail-variantene sammen i layoutet

**Files:**
- Modify: `src/app/team-norway/layout.tsx` (les hele filen først - den finnes allerede men monterer trolig ikke en delt rail i dag; bekreft før du endrer, ikke anta strukturen)

- [ ] **Steg 1: Les den eksisterende layout-filen fullt ut, og de to page.tsx-filene som i dag bygger sin egen `punkter`-liste inline**

Formålet er å flytte `punkter`-bygging opp i layoutet (delt for alle undersider) i stedet for duplisert per side - men KUN hvis layoutet faktisk får `groupId` fra ruten (Next.js layout-filer under `[groupId]/` gjør det via samme `params`-mekanisme som page.tsx). Hvis `layout.tsx` ligger over `[groupId]/` (dvs. deles av `/team-norway` også, uten groupId), behold `punkter`-bygging i hver page.tsx i stedet, og monter kun `<TnRail>`/`<TnRailMobil>` som et par rundt `{children}` i layoutet med en `punkter`/`orgNavn` som hver side selv sender inn via en enkel React Context eller ved at layoutet selv bygger den minimale, felles delen av menyen. **Ikke gjett - dette steget er research-før-koding, ikke en oppskrift å følge blindt.**

- [ ] **Steg 2: Monter de to rail-variantene side om side (kun én synlig av gangen via CSS, ikke JS)**

```tsx
<div style={{ display: "flex", minHeight: "100vh" }}>
  <TnRail punkter={punkter} bruker={bruker} orgNavn={orgNavn} orgUndertittel={orgUndertittel} />
  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
    <TnRailMobil punkter={punkter} orgNavn={orgNavn} />
    <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
  </div>
</div>
```

- [ ] **Steg 3: Kjør `npm run verify`, deretter en manuell sjekk i dev-server på 390px og 1440px**

```bash
npm run dev
```
Åpne `/team-norway/<en-ekte-groupId-fra-task-0.1>` i nettleser, DevTools-responsiv-modus 390px: bunn/topp-nav skal vises, sideraillen skal være borte. 1440px: motsatt. Ingen horisontal scroll på 390px (samme sjekk som `gotchas.md` sin rutenett-advarsel).

- [ ] **Steg 4: Commit**

```bash
git add src/app/team-norway/layout.tsx
git commit -m "feat(team-norway): monter responsiv rail (desktop + mobil) i TN-layoutet"
```

### Task 1.6: Push, draft-PR, skjermbilde-gate

- [ ] **Steg 1: Push grenen**

```bash
git checkout -b tn-skall-dynamisk-responsiv
git push -u origin tn-skall-dynamisk-responsiv
```
(Grenen opprettes fra siste commit i Fase 1 - hvis du fulgte planen sekvensielt er du allerede på en egen gren fra Task 1.1; ikke opprett en ny gren midt i fasen.)

- [ ] **Steg 2: Åpne draft-PR**

```bash
gh pr create --draft --title "feat(team-norway): TnRail dynamisk, rutebevisst og responsiv" --body "Fase 1 av docs/superpowers/plans/2026-09-06-team-norway-skjermer.md. Skjermbilde-gate gjenstår (kan ikke tas fra denne worktreen - se kjent begrensning i gotchas.md)."
```

- [ ] **Steg 3: IKKE merge.** Vent på at Anders har sett mobil 390 + desktop 1440 mot `TnSkall.dc.html` (lys - Team Norway har ingen mørk modus per readme).

---

## Fase 2 - `/team-norway` (TnOversikt): dekningsgrad på ekte data

**Forutsetning:** Fase 0 er fullført, og Task 0.2s svar (organisasjons-identifikasjon) er kjent. Denne fasens tasks antar prefiks-konvensjonen `team-norway*` fra Task 0.2s anbefaling - hvis Anders svarer noe annet, oppdater Task 2.2s `where`-klausul tilsvarende før du starter (én linje, ikke en omskrivning).

Fasit: `designsystem/team-norway/templates/tn-oversikt/TnOversikt.dc.html`. Dekningskortet («4 av 11») er per designnotatet **obligatorisk**, resten av skjermens tall («samlinger», «lesekvitteringer», navn) er skjermtekst - bygg IKKE de andre kortene i denne fasen, kun dekningskortet + en enkel gruppeliste som lenker videre til de eksisterende `[groupId]`-sidene.

### Task 2.1: Ren funksjon - regn dekningsgrad fra rå spillerdata

**Files:**
- Create: `src/lib/domain/tn-oversikt.ts`
- Test: `src/lib/__tests__/domain/tn-oversikt.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type SpillerDekningRad = {
    spillerId: string;
    harKomplettProfilSamtykke: boolean; // DelingsSamtykke.scope === "KOMPLETT_PROFIL", gitt: true, ingen nyere trukket rad
    harTestEllerStatsSamtykke: boolean; // scope TEST_RESULTATER eller STATS, gitt: true
    harRegistrertData: boolean;         // minst én Round eller TestResult finnes
  };
  export type Dekningsgrad = {
    komplettProfil: number;
    delvisProfil: number;
    samtykketIngenData: number;
    ikkeSamtykket: number;
    totalt: number;
  };
  export function beregnDekningsgrad(rader: SpillerDekningRad[]): Dekningsgrad;
  ```
  Konsumeres av Task 2.2 (loader) og Task 2.3 (siden).

- [ ] **Steg 1: Skriv feilende test**

```ts
// src/lib/__tests__/domain/tn-oversikt.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { beregnDekningsgrad, type SpillerDekningRad } from "@/lib/domain/tn-oversikt";

function rad(over: Partial<SpillerDekningRad> = {}): SpillerDekningRad {
  return {
    spillerId: "s1",
    harKomplettProfilSamtykke: false,
    harTestEllerStatsSamtykke: false,
    harRegistrertData: false,
    ...over,
  };
}

test("ingen spillere gir alle tall på 0", () => {
  const d = beregnDekningsgrad([]);
  assert.deepEqual(d, { komplettProfil: 0, delvisProfil: 0, samtykketIngenData: 0, ikkeSamtykket: 0, totalt: 0 });
});

test("komplett profil krever BÅDE komplett-samtykke OG registrert data", () => {
  const d = beregnDekningsgrad([
    rad({ harKomplettProfilSamtykke: true, harRegistrertData: true }),
    rad({ spillerId: "s2", harKomplettProfilSamtykke: true, harRegistrertData: false }),
  ]);
  assert.equal(d.komplettProfil, 1);
  assert.equal(d.totalt, 2);
});

test("delvis profil: samtykket til test/stats og har data, men ikke komplett-samtykke", () => {
  const d = beregnDekningsgrad([
    rad({ harTestEllerStatsSamtykke: true, harRegistrertData: true }),
  ]);
  assert.equal(d.delvisProfil, 1);
  assert.equal(d.komplettProfil, 0);
});

test("samtykket, ingen data: har et samtykke men ingen registrert runde/test ennå", () => {
  const d = beregnDekningsgrad([
    rad({ harTestEllerStatsSamtykke: true, harRegistrertData: false }),
  ]);
  assert.equal(d.samtykketIngenData, 1);
});

test("ikke samtykket: ingen av samtykke-feltene er sanne, uansett data", () => {
  const d = beregnDekningsgrad([rad({ harRegistrertData: true })]);
  assert.equal(d.ikkeSamtykket, 1);
});

test("hver spiller telles i nøyaktig én bøtte", () => {
  const rader = [
    rad({ spillerId: "a", harKomplettProfilSamtykke: true, harRegistrertData: true }),
    rad({ spillerId: "b", harTestEllerStatsSamtykke: true, harRegistrertData: true }),
    rad({ spillerId: "c", harTestEllerStatsSamtykke: true, harRegistrertData: false }),
    rad({ spillerId: "d" }),
  ];
  const d = beregnDekningsgrad(rader);
  assert.equal(d.komplettProfil + d.delvisProfil + d.samtykketIngenData + d.ikkeSamtykket, 4);
  assert.equal(d.totalt, 4);
});
```

- [ ] **Steg 2: Kjør testen, bekreft at den feiler**

```bash
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/domain/tn-oversikt.test.ts
```
Forventet: FAIL - modulen finnes ikke.

- [ ] **Steg 3: Skriv minimal implementasjon**

```ts
// src/lib/domain/tn-oversikt.ts
/**
 * Dekningsgrad for Team Norway-oversikten (A-19-lignende TruthLayer-prinsipp:
 * hver spiller havner i nøyaktig én av fire bøtter, aldri en gjetning).
 *
 * Fasit: designsystem/team-norway/templates/tn-oversikt/TnOversikt.dc.html,
 * dekningSet() - «Komplett profil / Delvis profil / Samtykket, ingen data /
 * Ikke samtykket». Designnotatet kaller dette kortet OBLIGATORISK.
 *
 * Ren funksjon: ingen IO. Input hentes av loaderen i tn-team-norway/oversikt-data.ts.
 */

export type SpillerDekningRad = {
  spillerId: string;
  harKomplettProfilSamtykke: boolean;
  harTestEllerStatsSamtykke: boolean;
  harRegistrertData: boolean;
};

export type Dekningsgrad = {
  komplettProfil: number;
  delvisProfil: number;
  samtykketIngenData: number;
  ikkeSamtykket: number;
  totalt: number;
};

export function beregnDekningsgrad(rader: SpillerDekningRad[]): Dekningsgrad {
  const d: Dekningsgrad = { komplettProfil: 0, delvisProfil: 0, samtykketIngenData: 0, ikkeSamtykket: 0, totalt: rader.length };
  for (const r of rader) {
    const harSamtykke = r.harKomplettProfilSamtykke || r.harTestEllerStatsSamtykke;
    if (!harSamtykke) {
      d.ikkeSamtykket++;
    } else if (!r.harRegistrertData) {
      d.samtykketIngenData++;
    } else if (r.harKomplettProfilSamtykke) {
      d.komplettProfil++;
    } else {
      d.delvisProfil++;
    }
  }
  return d;
}
```

- [ ] **Steg 4: Kjør testen på nytt, bekreft at den består**

```bash
npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/domain/tn-oversikt.test.ts
```
Forventet: 6 pass.

- [ ] **Steg 5: Commit**

```bash
git add src/lib/domain/tn-oversikt.ts src/lib/__tests__/domain/tn-oversikt.test.ts
git commit -m "feat(team-norway): ren funksjon for dekningsgrad (komplett/delvis/samtykket/ikke)"
```

### Task 2.2: Loader - hent ekte spillerdata for coachens Team Norway-grupper

**Files:**
- Create: `src/lib/team-norway/oversikt-data.ts`

**Interfaces:**
- Consumes: `beregnDekningsgrad` fra Task 2.1, `aktivtTrenerMedlemskapWhere`/`aktivtSpillerMedlemskapWhere` fra `src/lib/domain/grupper.ts` (verifisert eksakt i denne planens research - se Global Constraints).
- Produces:
  ```ts
  export type TnOversiktData = {
    orgNavn: string;
    grupper: { id: string; navn: string }[];
    dekningsgrad: Dekningsgrad;
  } | null; // null = coachen har ingen aktive Team Norway-grupper
  export async function hentTnOversikt(coachUserId: string): Promise<TnOversiktData>;
  ```

- [ ] **Steg 1: Skriv loaderen**

```ts
// src/lib/team-norway/oversikt-data.ts
import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtTrenerMedlemskapWhere, aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { beregnDekningsgrad, type SpillerDekningRad } from "@/lib/domain/tn-oversikt";

export type TnOversiktData = {
  orgNavn: string;
  grupper: { id: string; navn: string }[];
  dekningsgrad: ReturnType<typeof beregnDekningsgrad>;
} | null;

/**
 * Henter Oversikt-grunnlaget for én coach. Organisasjons-identifikasjonen
 * (`slug` starter med "team-norway") er Task 0.2 sin foreslåtte konvensjon -
 * oppdater denne where-klausulen først hvis Anders svarte noe annet.
 *
 * IDOR: `coachUserId` er alltid den innloggede brukeren (satt av
 * `requirePortalUser` i page.tsx) - denne funksjonen tar aldri imot en
 * fremmed bruker-id fra klienten.
 */
export async function hentTnOversikt(coachUserId: string): Promise<TnOversiktData> {
  const trenerMedlemskap = await prisma.groupMember.findMany({
    where: { ...aktivtTrenerMedlemskapWhere(coachUserId), group: { slug: { startsWith: "team-norway" } } },
    select: { group: { select: { id: true, name: true } } },
  });
  if (trenerMedlemskap.length === 0) return null;

  const grupper = trenerMedlemskap.map((m) => m.group);
  const groupIder = grupper.map((g) => g.id);

  const spillere = await prisma.groupMember.findMany({
    where: { ...aktivtSpillerMedlemskapWhere(), groupId: { in: groupIder } },
    select: { userId: true },
  });
  const spillerIder = [...new Set(spillere.map((s) => s.userId))];

  const [samtykker, rundeAntall, testAntall] = await Promise.all([
    prisma.delingsSamtykke.findMany({
      where: { userId: { in: spillerIder }, mottakerGruppeId: { in: groupIder }, gitt: true },
      orderBy: { createdAt: "desc" },
      select: { userId: true, scope: true },
    }),
    prisma.round.groupBy({ by: ["userId"], where: { userId: { in: spillerIder } }, _count: true }),
    prisma.testResult.groupBy({ by: ["userId"], where: { userId: { in: spillerIder } }, _count: true }),
  ]);

  const komplettSamtykkeIder = new Set(samtykker.filter((s) => s.scope === "KOMPLETT_PROFIL").map((s) => s.userId));
  const testEllerStatsSamtykkeIder = new Set(
    samtykker.filter((s) => s.scope === "TEST_RESULTATER" || s.scope === "STATS").map((s) => s.userId),
  );
  const harDataIder = new Set([...rundeAntall.map((r) => r.userId), ...testAntall.map((t) => t.userId)]);

  const rader: SpillerDekningRad[] = spillerIder.map((id) => ({
    spillerId: id,
    harKomplettProfilSamtykke: komplettSamtykkeIder.has(id),
    harTestEllerStatsSamtykke: testEllerStatsSamtykkeIder.has(id),
    harRegistrertData: harDataIder.has(id),
  }));

  return {
    orgNavn: "Team Norway",
    grupper,
    dekningsgrad: beregnDekningsgrad(rader),
  };
}
```

**Merk før du kjører dette:** `DelingsSamtykke.userId`/`.mottakerGruppeId`/`.scope`/`.gitt` og `Round.userId`/`TestResult.userId` er navngitt fra denne planens research (se Global Constraints) - bekreft feltnavnene mot `prisma/schema.prisma` FØR du limer inn koden, siden en feilstavet feltnavn her feiler helt i `tsc`, ikke stille.

- [ ] **Steg 2: Kjør typesjekk**

```bash
npx tsc --noEmit
```
Forventet: 0 feil. (Ingen unit-test her - loaderen er ren IO-sammenstilling av allerede testet domenelogikk; verdien av en test ville vært å mocke Prisma, som `sg-mot-seg-selv`/`vekstrate`-mønsteret i denne planens søsterfiler bevisst unngår til fordel for å teste domenelaget separat.)

- [ ] **Steg 3: Commit**

```bash
git add src/lib/team-norway/oversikt-data.ts
git commit -m "feat(team-norway): loader for Oversikt-dekningsgrad på ekte data"
```

### Task 2.3: `/team-norway`-siden

**Files:**
- Create: `src/app/team-norway/page.tsx`

- [ ] **Steg 1: Skriv siden**

```tsx
// src/app/team-norway/page.tsx
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnOversikt } from "@/lib/team-norway/oversikt-data";
import { TnKort, TnPille } from "@/components/team-norway/core";
import { TN } from "@/lib/v2/team-norway";

export const dynamic = "force-dynamic";

export default async function TeamNorwayOversiktPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await hentTnOversikt(user.id);
  if (!data) notFound();

  const { dekningsgrad: d } = data;
  const bøtter: { label: string; tall: number; tone: "navy" | "amber" | "nøytral" }[] = [
    { label: "Komplett profil", tall: d.komplettProfil, tone: "navy" },
    { label: "Delvis profil", tall: d.delvisProfil, tone: "navy" },
    { label: "Samtykket, ingen data", tall: d.samtykketIngenData, tone: "amber" },
    { label: "Ikke samtykket", tall: d.ikkeSamtykket, tone: "nøytral" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <h1 style={{ fontFamily: TN.font.body, fontSize: TN.text.xl, fontWeight: TN.weight.bold, color: TN.navy900, margin: 0 }}>
        Oversikt
      </h1>

      <TnKort>
        <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.ink400 }}>
          Dekningsgrad
        </div>
        <div style={{ marginTop: 8, fontFamily: TN.font.body, fontSize: TN.text.xl, fontWeight: TN.weight.bold, color: TN.navy900 }}>
          {d.komplettProfil} av {d.totalt} med komplett profil
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {bøtter.map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, color: TN.textSecondary }}>{b.label}</span>
              <TnPille tone={b.tone}>{b.tall}</TnPille>
            </div>
          ))}
        </div>
      </TnKort>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.ink400 }}>
          Grupper
        </div>
        {data.grupper.map((g) => (
          <a
            key={g.id}
            href={`/team-norway/${g.id}`}
            style={{
              textDecoration: "none",
              display: "block",
            }}
          >
            <TnKort padding={16}>
              <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
                {g.navn}
              </span>
            </TnKort>
          </a>
        ))}
      </div>
    </div>
  );
}
```

**Bevisst utelatt (matcher designnotatets «obligatorisk kun dekningskortet»):** samlings-kortet, lesekvitterings-tallene og «krever deg nå»-listen fra `TnOversikt.dc.html` - de er skjermtekst i designet (eksempeldata), ikke bestilt funksjonalitet ennå. Legg dem til i en senere, egen oppgave når den underliggende dataen (samlinger koblet til `GroupSchedule`, se «Det som mangler i datamodellen» i skjermplan-dokumentet) faktisk finnes - ikke fyll dem med plausible tall nå.

- [ ] **Steg 2: Kjør verify**

```bash
npm run verify
```

- [ ] **Steg 3: Manuell sjekk i dev-server**

```bash
npm run dev
```
Logg inn som en coach med et ekte Team Norway-medlemskap (fra Task 0.1s resultat) og åpne `/team-norway`. Bekreft: dekningstallene stemmer med en manuell opptelling i databasen (stikkprøve, ikke full revisjon), gruppelisten viser riktig(e) gruppe(r), lenken til `/team-norway/<id>` fungerer.

- [ ] **Steg 4: Commit**

```bash
git add src/app/team-norway/page.tsx
git commit -m "feat(team-norway): Oversikt-siden med ekte dekningsgrad"
```

### Task 2.4: Push, draft-PR, skjermbilde-gate

- [ ] **Steg 1: Push grenen**

```bash
git checkout -b tn-oversikt-dekningsgrad
git push -u origin tn-oversikt-dekningsgrad
```

- [ ] **Steg 2: Åpne draft-PR**

```bash
gh pr create --draft --title "feat(team-norway): Oversikt-siden (/team-norway) med ekte dekningsgrad" --body "Fase 2 av docs/superpowers/plans/2026-09-06-team-norway-skjermer.md. Avhenger av Fase 1 (TnRail-oppgradering) og av Task 0.1/0.2s svar. Skjermbilde-gate gjenstår."
```

- [ ] **Steg 3: IKKE merge.** Vent på skjermbilde-gate mot `TnOversikt.dc.html` (mobil 390 + desktop 1440, lys).

---

## Blokkerte skjermer - beslutningsoppgaver, ikke kode

Disse fem skjermene er bevisst IKKE brutt ned i TDD-tasks her. Å skrive kode mot en datamodell ingen har bekreftet er verre enn å ikke bygge - det produserer noe som må rives opp igjen. Hver blokk under er den eksakte beslutningen som mangler; når svaret foreligger, skriv en ny, egen plan for akkurat den skjermen med samme detaljnivå som Fase 1/2 over.

### Uttak + Rangliste (`TnUttak.dc.html`, `TnRangliste.dc.html`)

**Mangler:** `selection_criteria`/`selection_scores`-datamodell for uttaksvurdering finnes ikke i `prisma/schema.prisma`. To harde regler er allerede vedtatt og MÅ inn i modellen fra dag én (skjermplan-dokumentet §Uttak): appen konkluderer aldri (uttak er alltid underlag, aldri en «bestått»-dom appen selv feller), og feltet/UI-teksten heter **«vurdering»**, aldri «karakterer».

**Spørsmål til Anders:** hvilke kriterier skal en uttaksvurdering faktisk bestå av (frie tekstfelt per trener? en fast liste av kategorier - fysisk/teknisk/mentalt/sosialt, jf. de fem TN-prosessene? en tallskala, og i så fall hvilken)? Uten svar her kan ikke `selection_criteria`-tabellen designes, og uten den tabellen er hverken Uttak eller Rangliste byggbare på ekte data.

### Fellestesting (`TnFellestesting.dc.html`)

**Mangler:** bulk-testføringsflyt. Skjermens eget designnotat kaller dette «det ekte skjermgapet»: én trener fører mange spillere gjennom samme protokoll på testdag (10+ elever etter tur på samme øvelse), og dagens `TestResult`-modell/UI er bygget for én-spiller-om-gangen.

**Spørsmål til Anders (fra WANG/TEAM NORWAY-beslutningen 30.08, punkt 7.5 - delvis besvart, men UI-flyten er ikke spesifisert):** er «velg protokoll -> før spiller for spiller i kø» (slik skjermplanen beskriver det) riktig flyt for de tre protokoll-arketypene (port/tall/stige) pluss PEI-varianten, eller trengs det ulik UI per arketype? Dette avgjør om `TestResult`-lagringen kan gjenbrukes som den er, eller om en ny «testøkt»-samlemodell (flere resultater lagret atomisk) trengs.

### Protokollbibliotek + Protokolldetalj (`TnProtokollbibliotek.dc.html`, `TnProtokolldetalj.dc.html`)

**Mangler:** driftsmodell for delte, versjonerte testprotokoller på tvers av AK Golf, WANG og Team Norway (STEG 17.3). MASTERPLAN sier eksplisitt: «Driftsmodellen SKAL spesifiseres i planen (Anders eksplisitt)» - dette er ikke en agent-beslutning.

**Anbefaling som allerede ligger i MASTERPLAN (ikke godkjent ennå):** versjonerte protokoller låst ved første bruk - resultater peker på versjonen, en endring gir en ny versjon, eierorganisasjonen endrer, delte mottakere bruker versjonen som var gjeldende da de tok den i bruk.

**Spørsmål til Anders:** godkjenn denne modellen (eller gi en annen), OG avklar hvem som er «eierorganisasjon» for de 16 TN-testprotokollene som allerede finnes i `ProtocolScorecard.prompt.md` - er de eid av AK Golf (siden appen er AK Golfs) eller av Team Norway/NGF (siden protokollene kom derfra)? Dette avgjør hvem som får redigere-knappen i Protokolldetalj.

### Skoleoversikt (`TnSkoler.dc.html`)

**Ikke undersøkt ennå.** Før noen beslutning kan tas her, må en egen, kort research-oppgave svare: hvilke data forutsetter skjermen (koblingen mellom TN-spillere og skoler - finnes det et `School`-konsept i skjemaet i det hele tatt, eller er «skole» i dag bare fritekst på spillerprofilen)? Legg denne som første steg i en fremtidig plan for denne skjermen, ikke som en antakelse her.

---

## Selvgjennomgang (utført ved skriving av denne planen)

**Spec-dekning:** Alle 8 skjermene fra brukerens forespørsel er adressert - 2 med full TDD-plan (Fase 1-2), 5 med en presis, navngitt beslutningsoppgave (aldri en vag «TODO»), 1 (Skoleoversikt) med en eksplisitt «undersøk først»-instruks. De tre allerede leverte TN-09/10/11-skjermene er nevnt som utenfor omfang, ikke ignorert stille.

**Placeholder-skann:** Ingen `TBD`/«implementer senere»/«legg til passende feilhåndtering» i noen kode-steg. Der en funksjon avhenger av et ubekreftet feltnavn (Task 2.2s `DelingsSamtykke`-felt), er det flagget eksplisitt som noe å bekrefte mot skjemaet FØR koding - det er en verifiseringsinstruks, ikke en unnlatt spesifikasjon; koden selv er komplett skrevet med beste kunnskap fra researchen.

**Typekonsistens:** `Dekningsgrad`, `SpillerDekningRad`, `TnOversiktData`, `tnAktivFraPath` og `TnMenyPunkt` brukes med samme navn og form gjennom Task 2.1 -> 2.2 -> 2.3 og Task 1.1 -> 1.3 -> 1.5. `TnRail`s nye props (`orgNavn`, `orgUndertittel`) er de samme i Task 1.2, 1.4 (mobilvarianten) og 2.3 (Oversikt-siden sender ikke disse - den bruker `TnKort`/`TnPille` direkte, ikke `TnRail`, siden Oversikt-siden selv IKKE er en side inni railen i denne planens minimale versjon; railen monteres av layoutet rundt den, jf. Task 1.5).

---

## Fremdriftslogg

*(Fylles ut av den som utfører planen - ikke forhåndsutfylt her.)*

- Task 0.1-resultat:
- Task 0.2-svar fra Anders:
