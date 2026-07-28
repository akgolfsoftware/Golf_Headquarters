# Beslutningslogg — opprydding før redesign

Løpende logg. Nyeste øverst. Én oppføring per opprydningsrunde.

---

## 2026-07-28 — opprydding før redesign (fase 0–5)

**Gren:** `claude/opprydding-redesign-du9wt4` fra `main@2a0702f8`.

### Gjennomført

| Fase | Handling | Resultat |
|---|---|---|
| 1 | Slettet demo-/utstillingsruter | 13 filer, ~4 800 linjer |
| 1 | Slettet Next.js-scaffold-assets | 6 SVG-er |
| 3 | Skrev legacy-kart | `docs/opprydding/legacy-status.md` |

**Slettede ruter** — alle verifisert med null innkommende `href`/`router.push`/`redirect`
fra `src/`, `e2e/`, `tests/`, sitemap og robots:

- `(internal)/demos/{newplan,ny-okt,plan-bygger,trackman-import}`
- `dev-banekart` (+ `layout.tsx`)
- `intern/komponenter/{daglig-brief,forelder,hull-analyse,spiller-panel,team-bookinger}` + index
- `intern/layout.tsx` — foreldreløs etter at komponent-galleriet forsvant

Følgekonsekvens: `/dev-banekart` fjernet fra auth-vakten i `proxy.ts`. `/intern`-vakten
er **beholdt** med vilje — namespacet kan komme tilbake, og en vakt som står er billigere
enn en rute som blir offentlig ved et uhell.

### Beslutninger tatt underveis

**PR #181 og #190 ble ikke merget.** Oppdraget ba om å merge dem først hvis de var grønne.
Begge var røde: merge-konflikt mot main (`src/lib/google-calendar.ts` henholdsvis
`admin/(legacy)/drills/forslag/forslag-liste.tsx`), #190 hadde aldri kjørt CI, og begge
krever en manuell prod-DB-migrasjon før merge. Konfliktløsning + prod-migrasjon er
funksjonsarbeid, ikke opprydding — holdt utenfor denne PR-en.

**Fase 2 (dublettruter) krevde null endringer.** Alle seks dublettene hadde allerede
redirect fra gammel til ny adresse. To pekte motsatt vei av det oppdraget antok:
`/admin/plans/templates/*` → `/admin/plan-templates` (ikke omvendt), og
`/portal/tren/ovelser` → `/portal/drills` (ikke omvendt). `/admin/messages` og
`(legacy)/kommunikasjon` peker begge til `/admin/innboks`, ikke til hverandre.
Å slette redirect-stubbene ville brutt gamle bokmerker og e-postlenker.

**Fase 4 (Intelligence → TalentHQ) var et null-oppdrag.** Ordet finnes ikke i brukersynlig
tekst. Eneste forekomster i kode er `src/lib/intelligence/` — en intern API-klient for
benchmarks, med null importer utenfor seg selv — pluss `prisma/schema.prisma` og docs.
Omdøping ville rørt en API-kontrakt, som var utenfor grensene.

**Døde eksporter ble ikke slettet.** knip fant 119 ubrukte eksporter i `src/lib`. Listen er
full av falske positiver fordi repoet har 22 åpne PR-er: `harGyldigHelseSamtykke` og
`krevHelseSamtykke` brukes av #191, `getEncryptionKey` av #181, og `src/lib/meg/tools.ts`
(31 eksporter) registreres dynamisk. Utsatt til PR-køen er landet.

**50 akgolf-fotoer ble ikke slettet.** `public/images/akgolf/AK-Golf-Academy-*.webp` (7 MB)
har null referanser i kode — men PR #136 («stemningsbilder på sider uten foto») er nettopp
det som skal ta dem i bruk. Behandlet som råmateriale for redesignet, ikke som søppel.

**`(internal)/design-system` ble beholdt.** Ingen onboarding-referanse, men
`MASTER-SKJERMPLAN.md:638` lister den som utviklerverktøy. Ført opp som UKJENT etter
regelen «usikker på om noe er dødt → behold det».

### Ikke gjort — trenger din beslutning

- **Sletteliste for grener.** 6 grener er fullt merget inn i main og trygge å slette:
  `claude/playerhq-goals-components-b17528`, `claude/whoop-garmin-integration-plan-89cdde`,
  `claude/wonderful-diffie-1a5dd1`, `feat/fellesmelding-deltakere`,
  `feature/widget-sg-mal-og-gruppeokter`, `fix/auth-hull-runde2`.
  De 9 grenene i `gjenstaende-grener-2026-07-27.md` har unikt innhold og bør ikke slettes ennå.
- **Bruksdata for legacy-kartet.** Kategorien BRUKES IKKE står tom fordi containeren ikke har
  DB-tilgang. SQL-spørringen som lukker de 6 UKJENT-e ligger i `legacy-status.md`.

### Avvik fra oppdraget

- Open Design-eksporten ble **ikke** kopiert. Økta kjørte i en fjernkontainer;
  `~/Desktop/0dbe8c92-…` og `~/Documents/Claude/akgolf-hq-redesign/` finnes ikke der.
- Kartene ligger i `docs/opprydding/` i stedet for `~/Documents/Claude/akgolf-hq-redesign/kart/`,
  slik at de committes og overlever containeren.
- Grenen heter `claude/opprydding-redesign-du9wt4`, ikke `chore/opprydding-for-redesign` —
  økta hadde en hard regel om at push kun går til den tildelte grenen.
