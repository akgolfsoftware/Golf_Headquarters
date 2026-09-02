# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ). Forretningslogikk og UI-tekst: **norsk bokmål**.

Ved konflikt: `docs/ak-master.md` > denne filen — **unntatt design**: for alt design/look vinner Train-lock-beslutningen (25.08.2026, se invariant 2) + `docs/natt/` over ALLE eldre dokumenter, inkludert ak-master. Paper er slettet fra plattformen 30.08.2026 (Anders) — all Paper-tekst i eldre dokumenter er historikk, aldri byggeordre.

---

## Start her (les i denne rekkefølgen)

1. **`docs/MASTERPLAN-GJENSTAAENDE.md`** — DEN gjeldende, eneste plandokumentet: alt gjenstående arbeid, session-tabeller, status, beslutningskø.
2. **`docs/STATUS-NÅ.md`** — levert / ikke levert (løpende snapshot).
3. **`src/lib/domain/workbench/` + `src/lib/workbench/wb-actions.ts`** — koden er fasit for domain/actions. `docs/natt/workbench/` er kontrakt/arkiv (ACCESS-AND-GROUPS.md gjelder fortsatt for tilgang).
4. **`docs/platform/AGENT-BRIEF.md`** — stack, versjoner, mappestruktur.
5. **`docs/platform/BUSINESS-RULES.md`** — abonnement, GDPR, booking (ikke utledbart fra kode).
6. **`.claude/rules/gotchas.md`** — les FØR koding.
7. **`designsystem/train-lock/README.md` + `PORTING.md`** — designfasiten (invariant 2 under) og hvordan en skjerm faktisk porter til kode. Les FØR du bygger eller endrer UI, ikke bare når «design» nevnes eksplisitt.

Ikke les hele repoet. Åpne filer etter behov. Lange kommandoer → redirect til fil, tail/grep.

---

## Nåværende spor: A1–A4 (bølge 1)

**Mål-smoke (må være grønn før bølge 2):**

```
Coach: opprett økt → UTKAST → flytt → Publiser
Spiller: ser økten i «I dag», ser ikke DRAFT
Spiller: Start → IN_PROGRESS → Ferdig (warm hake)
TrackMan-detalj: 1σ-ellipse + én caddie-setning + prikk → slag-ark
```

| Loop | Jobb | Anti-scope |
|------|------|------------|
| 1 | Domain + server actions (ingen UI) | UI, drag-lib, kilder-innhold |
| 2 | Agency uke + create/move/publish | måned/år, stall, Google |
| 2S | Inspector + drill komplett/MANGLER | serie, Player-ark |
| 2T | Kilder, drag, serie | Google, Player live |
| 3 | I dag ← `loadPlayerDay` | composer/dock |
| 3S | Økt-ark + start/complete | live *runde* RU |
| 3T | Godta/Avvis + ikke delta | full GROUP-materialisering |
| 4 | DispersionMap | ingest, DataGolf, stall-preview |

**Én Claude-session per loop.** Ny chat. Commit + leveranserapport for loopen. Ikke start neste loop uten grønn forrige.

Gren for kode: `claude/agency-workbench-uke-ui-c4d2a4`-linjen (Loop 1+2+3S); Loop 2S ligger på PR #577, RLS på `claude/workbench-rls-policies-8b054b` — samles i release-gren per session-tabellen i `docs/MASTERPLAN-GJENSTAAENDE.md` (session B2, tidligere `natt/LAUNCH-PLAN-FULL-2026-08-25.md`, slettet 30.08 i doc-konsolideringen). PR #575 er superseded.

Bølge 2 (måned/år, stall, kalender uten Google, tester-live, runde-live, Jarvis, AgenticOS, lys, Forelder, DataGolf/økonomi): se `docs/MASTERPLAN-GJENSTAAENDE.md` — **kun etter** bølge 1-smoke.

---

## Harde invarianter

1. **Ingen treningsregler** (2026-08-18). Vokabular (pyramide, formel, perioder) er merkelapper. Gjeninnfør aldri metodikk-sperrer uten Anders' beslutning.
2. **Design — Train-lock er fasit for ALLE skjermer i PlayerHQ OG AgencyOS (Anders 25.08.2026).**
   - **Fasiten ligger i repoet: `designsystem/train-lock/`** (196 skjermfiler, sist synket
     26.08 fra zip (6) — les `DESIGN-SYSTEM.md` der først (look-fasit), finn skjermen i
     `SCREEN-INDEX.md`, og bruk `HANDOFF.md` som IA-/beslutningshistorikk. Ved konflikt:
     HANDOFF vinner på struktur, DESIGN-SYSTEM på visuelle verdier. Porting til kode styres
     av `PORTING.md` samme sted). Scene `#000000` (lys-varianter `#FFFFFF`).
   - **AgencyOS:** Train-lock — alle skjermer.
   - **Paper finnes ikke lenger** (slettet 30.08.2026, Anders). Ingen `designsystem/paper/`,
     ingen `T`, ingen `--p-*`, ingen Paper-CSS. `scripts/check-ingen-paper.mjs` i
     `npm run verify` hindrer at det kommer tilbake.
   - **Tokens finnes i kode (D2 løst 25.08, PR #586):** `src/styles/train-lock-tokens.css`
     (`--tl-*`) med TS-speil `src/lib/v2/train-lock.ts` (`TL`, `TL_BREKK`). Bruk dem —
     `T` finnes ikke lenger. Tokenene ligger lys på `:root` og mørk på
     `html[data-v2-tema="dark"]`.
     **Mørk er default på `/portal` og `/admin`** (Anders 25.08.2026) — regelen bor i
     `src/lib/v2/tema-default.ts`, kalt av både rot-layout og `V2Shell`; bryteren
     (`ak-v2-tema`) vinner over defaulten. `/auth` er fortsatt lys (låst PP-A/A4).
     **`/forelder` skal ha BÅDE lys og mørk modus, som resten av produktet (Anders
     26.08.2026)** — forelder-omfangsspørsmålet (T4) er dermed løst: hele forelder-appen
     porter til Train-lock med toggle, ikke bare ett kort. Default (lys/mørk uten cookie)
     er ikke endret av denne beslutningen — kun at begge moduser MÅ virke. Selve
     skjermporten gjenstår (B8 = Player, bølge T = AgencyOS, forelder-porten ubestemt
     session ennå). Marketing/landingssider har egen fasit (ak-golf-website) og omfattes ikke —
     **UNNTAK (Anders 28.08.2026): hele booking-flyten, også `/booking` på marketing, er
     Train-lock (lys variant).** PR #650 porter den; ny booking-kode leser aldri `T`/`--p-*`-verdier
     direkte (broen i `booking-paper.css` peker dem til `--tl-*`).
   - Ingen nye tokens / parallelle designsystemer uten Anders' ja.
   - **Merkelaget ligger OVER (Anders 31.08.2026):** AK Golf-merkevaresystemet
     (`designsystem/ak-golf/`, STEG 18) eier logo, farge, tone, foto, marked og materiell for
     hele konsernet. Det **overstyrer ikke** denne invarianten: Train-lock er fortsatt fasit
     for hver skjerm i PlayerHQ, AgencyOS og Forelder. Konfliktregel — produktskjerm:
     Train-lock vinner · merket: AK Golf vinner · `/team-norway/*`: Claw vinner.
     Ingen skjerm har to fasiter.
   - Fullført = warm `#B85C3D` + hake. `#30D158` **kun** Godta / PUBLISERT-merke.
   - **DO NOT USE — Presis.** Ny skjermkode = `--tl-*` / `TL` (flate, tekst, handling)
     og `AK` fra `src/lib/v2/ak-palett.ts` (domeneverdier: pyramideakser, tee-farger,
     merkefarger). Ikke Presis-skog/lime. Paper er slettet fra repoet 30.08.2026 og
     kan ikke lenger brukes som few-shot — hverken tokens, CSS eller fasitfiler.