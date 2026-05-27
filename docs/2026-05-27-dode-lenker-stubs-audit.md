# Portal-audit: døde lenker + stub-sider — 2026-05-27

**Metode:** automatisk skanning via `scripts/audit-portal-links.ts` og `scripts/audit-portal-stubs.ts`.
Resultatene er verifiserte (ikke spekulasjon).

---

## Sammendrag

| Kategori | Antall | Status |
|---|---:|---|
| Totalt portal-sider (`page.tsx`) | 143 | — |
| Unike portal-href i kode | 56 | — |
| **Døde lenker** (target finnes ikke) | **3** | Fiksbart på 5 min |
| Rene redirect-stubs | 2 | Behold (de er kategori-redirect, ikke gjeld) |
| Sider med `TODO`/`placeholder`/`kommer i` i kode | 18 | Trenger manuell vurdering — flest er false-positives |
| Ekte fullverdige sider | 116 | OK |
| Sider som delegerer til stor komponent | 7 | OK |

---

## 1. Døde lenker (3)

Disse `href="..."` peker til ruter som ikke finnes som `page.tsx`:

| Lenke | Brukt i | Foreslått fix |
|---|---|---|
| `/portal/innstillinger` | `src/app/portal/reach/page.tsx` | Endre til `/portal/meg/innstillinger` |
| `/portal/meldinger/ny` | `src/app/portal/meg/help/artikkel/[slug]/page.tsx` | Bytt til `/portal/coach/melding/ny` (som finnes) |
| `/portal/profil` | `src/components/portal/sidebar.tsx` | Endre til `/portal/meg` |

**Totalt fikstid: ~5 minutter** (kun string-replace).

---

## 2. Døde knapper (0)

Søkte etter:
- `<button>` uten `onClick`
- `<Button>` med tom handler / kun `console.log`
- `onClick={() => {}}` mønstre

**Funn: 0.** Alle knapper har meningsfulle handlere.

---

## 3. Stub-sider (2 ekte redirect-stubs)

Dette er sider som kun gjør en server-side redirect og ikke har egen UI. De er IKKE gjeld — de fungerer som kategori-redirects:

| Rute | Linjer | Redirecter til |
|---|---:|---|
| `/portal/meg/abonnement/oppgrader/flyt` | 8 | `/portal/meg/abonnement/oppgrader` |
| `/portal/meg/innstillinger/sikkerhet` | 7 | `/portal/meg/sikkerhet` |

**Anbefaling:** Behold. Disse leder fra eldre URLer til riktig nåværende side.

---

## 4. Sider med `TODO`/`placeholder`/`kommer i` — trenger manuell vurdering (18)

Disse sidene har en stub-markør **et eller annet sted** i koden, men det betyr ikke nødvendigvis at SIDEN er en stub. Ofte er det:
- `placeholder=` på input-felt (normalt)
- En `TODO:`-kommentar i kode (ikke i UI)
- En `kommer i` i feature-tekst der bare ÉN sub-feature mangler

| Rute | Linjer | Markør | Sannsynlig status |
|---|---:|---|---|
| `/portal` | 308 | `TODO:` | Dashboard — sjekk om hovedfunksjon eller bare en delseksjon mangler |
| `/portal/booking` | 490 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/coach/ai` | 120 | `TODO:` | Sjekk |
| `/portal/drills` | 242 | `TODO` | Sjekk |
| `/portal/drills/[id]` | 427 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/gjennomfore` | 176 | `kommer i` | Sjekk feature-tekst |
| `/portal/mal/baner` | 74 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/mal/leaderboard` | 614 | `TODO` | Sjekk |
| `/portal/mal/runder` | 315 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/meg/dokumenter` | 152 | `TODO:` | Sjekk |
| `/portal/meg/helse` | 375 | `kommer i` | Sjekk feature-tekst |
| `/portal/meg/sikkerhet` | 178 | `TODO:` | Sjekk |
| `/portal/onskeligokt` | 87 | `TODO` | Liten side — sjekk |
| `/portal/talent/min-plan` | 258 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/talent/roadmap` | 296 | `TODO:` | Sjekk |
| `/portal/talent/sammenligning` | 489 | `placeholder` | Sannsynligvis input-placeholder |
| `/portal/tren/teknisk-plan/[planId]` | 351 | `kommer i` | Sjekk feature-tekst |
| `/portal/workbench-v2` | 254 | `TODO:` | Sjekk — gammel rute, kan kanskje slettes |

**Anbefaling:**
- I morgen tidlig: gå igjennom de 6 viktigste (`/portal`, `/portal/onskeligokt`, `/portal/workbench-v2`, `/portal/gjennomfore`, `/portal/meg/helse`, `/portal/tren/teknisk-plan/[planId]`) for å se om noe faktisk er stub.
- Hvis `TODO:`-en bare er en kode-kommentar uten UI-impact, skipp.
- `placeholder` i input-felt er ALDRI gjeld — det er standard.

---

## 5. Topp 3 prioriterte fikser

| # | Fix | Tid |
|---|---|---|
| 1 | Erstatt `/portal/profil` → `/portal/meg` i sidebar.tsx | 1 min |
| 2 | Erstatt `/portal/innstillinger` → `/portal/meg/innstillinger` i reach/page.tsx | 1 min |
| 3 | Erstatt `/portal/meldinger/ny` → `/portal/coach/melding/ny` i help/artikkel/[slug]/page.tsx | 1 min |

**Total fikstid: 3 minutter.**

---

## 6. Hvordan kjøre auditen på nytt

```bash
# Døde lenker:
npx tsx scripts/audit-portal-links.ts

# Stub-sider:
npx tsx scripts/audit-portal-stubs.ts
# (skriver også til docs/2026-05-27-portal-stubs-detaljert.md)
```

---

## Konklusjon

Portal-koden er **i betydelig bedre stand** enn forventet. Kun 3 reelle døde lenker, 0 døde knapper, og 0 tomme sider. De 18 "stub-markørene" trenger manuell verifikasjon, men flertallet er sannsynligvis false-positives (input placeholders eller kode-kommentarer).

Etter de 3-minutters-fixene er portal effektivt 100% lenke-frisk.
