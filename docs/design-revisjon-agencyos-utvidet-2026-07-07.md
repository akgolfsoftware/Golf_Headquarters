# Design-revisjon — AgencyOS utvidet klynge (D/E/F/G/H/J) mot v13

**Dato:** 2026-07-07 · **Metode:** kildekode-lesing (fire parallelle agenter, hver klynge lest fullt) mot
`public/design-handover/CLAUDE.md`, ordbok (CANON v3.5), `.claude/rules/designsystem.md` og
`.claude/rules/design-produktbeslutninger.md`. Oppfølging av `docs/design-revisjon-kjerneskjermer-2026-07-06.md`
og designprosjektets egne `guidelines/skjerm-plan-resterende-kryssjekk.md` +
`guidelines/skjerm-plan-audit-2026-07-07.md`.

**Golfdata-adopsjon er 0 % i alle seks klynger — dette er AKSEPTERT** (Anders' beslutning 2026-07-07):
driftsskjermer (kø, risiko, moderering, opptak, agenter, talent, kart) fortsetter med sitt eget
håndrullede Tailwind-lag (semantiske CSS-tokens, ikke golfdata-komponenter). Flagges derfor ikke som
defekt i seg selv — kun tokens, terminologi, farger og datavisning er vurdert.

**To bugs ble fikset direkte denne økten** (commit `964ae8ce`): DNA/pyramide-mislabeling på
`/admin/talent` + `/admin/spillere/[id]/profil`, og hardkodet «Inter Tight» på `/admin/queue`.

## Hovedkonklusjon
26+ ruter er reelt bygget og fungerer — ingen tomme mockups. Gjenstående arbeid er en kort liste med
presise token-/font-/kontrast-fikser, pluss to funn som ikke er design-avvik men egne beslutningssaker
(se «Krever avklaring» nederst).

---

## D · Agent-orkestrering — nesten plettfri

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| `components/kommando/agent-chat.tsx` | 🔧 | Lime-fyll (`bg-accent`) på modell-pill/boble/knapp — sjekk visuelt i lys AgencyOS-modus. |
| `/admin/agents` | ✅ | Ingen handling. |
| `/admin/agents/[agentId]` | ✅ | Ingen handling. |
| `/admin/agenter` | ✅ | Riktig tynn wrapper rundt `<AgentChat>`, ikke mockup. |
| `/kommando/agenter` | ✅ (merknad) | Mangler tittel/kontekst sammenlignet med tvillingen. |
| `/portal/agent-pipeline` | 🔧 | Rå engelske enum-verdier vist til spiller (status/actionType/kind) — bør norsk-mappes som admin-siden allerede gjør. |

## E · Talent & benchmark (19 ruter, størst klynge)

**DNA/pyramide-forveksling bekreftet FRAVÆRENDE** i alle radar-varianter etter dagens fiks.

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| `/admin/talent` | 🔧 | Hardkodet hex `#005840` i gauge-fargeskala (linje 163). |
| `/admin/talent/[playerId]` | 🔧 | `'Inter Tight'` inline (linje 113, samme bug som queue) + `var(--font-geist-mono)` (linje 413, feil token). |
| `/admin/talent/discovery` | ✅ | — |
| `/admin/talent/kohort` | ✅ | — |
| `/admin/talent/radar` | ✅ | — |
| `/admin/talent/radar/[playerId]` | 🔧 | `var(--font-geist-mono)` arvet. |
| `/admin/talent/region` | 🔧 | `var(--font-geist-mono)` ×2 (linje 216, 227). |
| `/admin/talent/ressurser` | ✅ | — |
| `/admin/talent/sammenligning` | ✅ | — |
| `/admin/talent/wagr-benchmark` | ✅ | — |
| `/admin/talent/wagr-import` | ✅ | — |
| `/admin/tester` + `[id]` + `benchmarks` | ✅ | — |
| `/admin/tester/[id]` (detail-client) | 🔧 | `fontFamily="JetBrains Mono"` som streng ×3 (linje 229/239/246). |
| `/portal/talent` | 🔧 | Flest funn: lime-rgba (linje 307), hex `#8EBF00` i gradient (linje 368), `bg-white/20` (linje 276-277), rå `amber-500`-palett (linje 555-556) — bruk `warning`-token som `roadmap` allerede gjør riktig. |
| `/portal/talent/min-plan` | DELVIS | Mild — talent-akser dekorert med `bg-pyr-*` (kun farge, labels korrekte). |
| `/portal/talent/mitt-niva` | ✅ | — |
| `/portal/talent/roadmap` | ✅ | Fasit for `warning`-bruk. |
| `/portal/talent/sammenligning` | ✅ (lav) | Rå SG-koder til spiller — klarspråk ville vært bedre. |
| `admin/tester/tildel/[spillerId]/tildel-modal.tsx` | (utenfor scope, funnet i grep) | `background: "#fff"` hardkodet. |

## F · Kart & region — viktigste funn i hele revisjonen

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| `stats-norgeskart.tsx` | 🔧 | Hardkodet region-farger (blå/lilla/oransje, off-brand), ingen legend/tomtilstand, ikke tastaturnavigerbar. |
| `/stats/regions` | DELVIS | Token-ren i eget `--s-*`-navnerom; KPI blander ekte DB-tall med hardkodede fallbacks. |
| `/stats/regions/[slug]` | 🔧 **+ tillitssak** | Se «Krever avklaring» — fabrikkerte spillernavn/statistikk på offentlig, indeksert side. |
| `/admin/anlegg/[id]` | ✅ | Klyngens beste fil — legend, tomtilstand, aria-labels. Kun ett kosmetisk rgba-punkt. |
| `/admin/talent/region` | 🔧 | Helt annet kart enn `stats-norgeskart` med divergerende region-inndeling (5 vs. 7 regioner) — se «Krever avklaring». Død font-token. |

## G · Moderering & merge

| Skjerm | Status | Hva gjenstår |
|---|---|---|
| `tournaments/dubletter/merge-liste.tsx` | 🔧 **reell bug** | `text-destructive-foreground` på `bg-destructive/5` → feilmelding praktisk talt usynlig (linje 185-188). Engelsk «Merge»-knapp. |
| `tournaments/[id]/page.tsx` | ✅ (småplukk) | Hardkodet `text-white` på avatar; lime-tint på lys flate (grensetilfelle). |

## H · Effekt-analyse

| Skjerm | Status |
|---|---|
| `/admin/plan-templates/[id]/effectiveness` | ✅ MATCHER, verifisert. |

## J · Enkeltstående

| Skjerm | Status |
|---|---|
| `/portal/talent/roadmap` | ✅ MATCHER — fasit for `warning`-token-bruk. |

---

## Krever avklaring (ikke design-avvik — produktbeslutninger)

1. **Fabrikkerte spillernavn på offentlig side.** `/stats/regions/[slug]` (indeksert, `revalidate=3600`,
   canonical + OG-tags) viser oppdiktede «topp-spillere» med navn og score som om de var ekte statistikk,
   mens klubbtabellen på samme side er ekte DB-data. Dette er en innholds-/tillitssak — bør avklares før
   siden er offentlig tilgjengelig for ekte brukere.
2. **To Norge-kart med ulik regioninndeling.** `stats-norgeskart.tsx` (5 regioner: øst/vest/midt/nord/sør)
   og `admin/talent/region` (7 regioner, egen taksonomi) deler ikke kode. En spiller fra Trøndelag havner
   i «midt» på markedssiden men egen «trøndelag»-bøtte i admin. Bør konsolideres til én kilde.
3. **`--s-*`-tokens i marketing/stats er hardkopiert hex**, ikke `var(--color-*)`-referanser som filens
   egen kommentar hevder. Fungerer i dag (marketing er alltid lyst), men er teknisk gjeld — bør pekes til
   de faktiske tokenene.

## Anbefalt prioritering
1. **Merge-liste kontrast-bug** — reell, brukervendt feil (usynlig feilmelding). Lavest risiko, høyest nytte.
2. **Font-token-sveipen** (`var(--font-geist-mono)` → `var(--font-jetbrains-mono)`, `'Inter Tight'` →
   `font-display`, hardkodede `fontFamily`-strenger) — mekanisk, samme mønster fem steder.
3. **Hex/rgba → tokens** i talent + kart-klyngene — mekanisk, lav risiko.
4. **Rå enum-tekst til spiller** på `/portal/agent-pipeline` og `/portal/talent/sammenligning`.
5. **De tre avklaringspunktene over** — krever Anders' beslutning, ikke bare koding.
