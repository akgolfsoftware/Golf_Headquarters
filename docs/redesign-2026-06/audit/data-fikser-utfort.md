# Data-fikser utfort — 2026-06-17

## FIKS 1: ELITE-lekkasjer

### Endrede filer

**`src/app/portal/meg/profil/rediger/profil-rediger-form.tsx`**
- Type-union beholder `"ELITE"` for TypeScript-kompatibilitet med Prisma-returtype, men render-logikk mapper:
  - `"PRO"` → `"Pro"`
  - alt annet (inkl. `"ELITE"`) → `"Gratis"`
- Tidligere viste tier-pill raa enum-verdi (`{initial.tier}`) — naa kan ELITE aldri rendres som tekst.

**`src/app/admin/stall/stall-client.tsx`**
- `TIER_STYLE["ELITE"]` satt til samme styling som `GRATIS` (neutral secondary) i stedet for `bg-foreground text-accent`.
- Render-logikk endret fra tre-veis (`"Free" / "Pro" / "Elite"`) til to-veis (`"Pro" / "Gratis"`). ELITE kan ikke lenger vises som "Elite".

**`src/app/admin/profile/page.tsx`**
- `<StatRow l="Tier" v={user.tier} />` endret til `<StatRow l="Abonnement" v={user.tier === "PRO" ? "Pro (300 kr/mnd)" : "Gratis"} />`.
- Bruker korrekt label "Abonnement" (ikke teknisk enum-navn), og ELITE kan aldri vises.

### Prinsipp
Prisma-enumet `ELITE` er ikke endret (forblir i skjemaet som dod verdi). All UI-kode mapper naa eksplisitt: kun `"PRO"` gir Pro-visning, alle andre verdier gir Gratis-visning.

---

## FIKS 2: DrillMalLibrary — UTSATT (produktbeslutning mangler)

**Komponent:** `src/components/shared/calendar/DrillMalLibrary.tsx`

**Vurdering:**
- `DrillMal`-modellen i `prisma/schema.prisma` er IKKE dod — den har tabell (`drill_maler`), migrasjoner og egne felter (L-fase, CS-niva, FYS-detaljer) som ikke finnes i `OktMal`.
- Gapet er at ingen server action henter `DrillMal`-rader og sender dem som prop til `DrillMalLibrary`. Komponenten mottar `maler: DrillMalKort[]` og faller tilbake pa `MOCK_DRILL_MALER` nar lista er tom.
- `OktMal` og `DrillMal` er IKKE utskiftbare: de tjener ulike formal (oktstuktur vs. enkeltdrill-bibliotek).

**Hva som trengs for ekte data:**
1. Server action `hentDrillMaler(coachId?)` — analog til `hentOktMaler` — mot `prisma.drillMal`.
2. Kallstedet som bruker `DrillMalLibrary` maa hente og sende `maler`-prop.
3. (Valgfritt) Seed-data for globale drill-maler sa biblioteket ikke er tomt for nye coacher.

**Beslutning Anders ma ta:** er DrillMal-biblioteket prioritert na, eller kan mock-en staa til etter lansering?

---

## TypeScript og bygg

- `npx tsc --noEmit` — 0 feil etter endringene.
- `npm run build` ikke kjort (unodvendig for disse kirurgiske UI-endringene som ikke paavirker Prisma/schema).
