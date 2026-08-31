# Beslutninger — historikk (arkiv)

Supersederte og utførte beslutninger, flyttet ut av `.claude/rules/beslutninger.md` 30.08.2026.

**Dette er ikke byggeordre.** Blokkene her beskriver hva som gjaldt før de ble overstyrt, og er
beholdt fordi begrunnelsene forklarer hvorfor dagens beslutninger ser ut som de gjør. Gjeldende
beslutninger — de eneste som skal følges — står i `.claude/rules/beslutninger.md`.

Fila lastes IKKE som kontekst i økter. Slå opp her bevisst, når du lurer på hvorfor noe ble som
det ble.

---

## Design-sporet: Presis → Paper → Train-lock

De fire blokkene under er kjeden som endte med Train-lock-beslutningen 25.08.2026. Paper ble
slettet fra hele plattformen 30.08.2026 (Anders), og `scripts/check-ingen-paper.mjs` i
`npm run verify` hindrer at det kommer tilbake.

- **[SUPERSEDERT 2026-08-25 — se Train-lock-beslutningen øverst. Beholdt som historikk.]
  Design-fasit er Claude Paper 1:1 (Anders 2026-08-04):** skjermene skal bli **slik de er
  designet i Claude Design-prosjektet «AK Golf HQ — Claude Paper»** (`605a48cc`) — layout,
  informasjonsarkitektur og interaksjonsmønster, ikke bare farger/tokens.
  **Speilregelen endret 2026-08-12 (Anders):** `designsystem/paper/` er **arbeidsfasiten** —
  208 HTML-filer, målt byte-identisk mot siste zip (zip (3), 09.08). Den gamle formuleringen
  («IKKE kilden, sjekk alltid mot Claude Design-prosjektet direkte») skrev seg fra 05.08, da
  speilet var 25 av 33 skjermer. Det stemmer ikke lenger, og `claude-design`-MCP-en er ikke
  tilgjengelig i alle økter — så regelen krevde en vei som ofte er stengt, samtidig som den
  forbød tillit til den som virker. `605a48cc` er fortsatt originalen ved uenighet, og speilet
  resynkes når Anders leverer ny zip. Sjekk `SYNC-STATUS.md` for ferskhet.
  Bakgrunn for selve 1:1-kravet: steg 7 PR1–PR4 ble merget med riktige
  tokens men feil skall («Én ting nå» manglet på alle fire, Hjem manglet artefaktkolonne/tom
  tilstand, Planlegge hadde 5 konkurrerende CTA-er). Full avviksliste og ombyggingsplan sto i
  «plan-designport-alle-skjermer.md» §Avvik (slettet 17.08.2026 — git-historikk);
  gjeldende plan er `docs/arkiv/paper-port/PORTPLAN.md`.
- **Fase 2 av designporten kjøres i ny økt med Sonnet 5 (Anders 2026-08-04):** token-effektivt,
  uten irrelevante skills/plugins/gammel kontekst. (Fase 1-planen lå i
  «plan-designport-alle-skjermer.md», slettet 17.08.2026 — gjeldende rekkefølge og modellvalg:
  `docs/arkiv/paper-port/PORTPLAN.md` + `docs/arkiv/paper-port/rutefasit.md` §1–2.) Mønsterdokument
  for skjermer uten fasit het `monsterdokument-paper.md` — slettet i opprydding 27.08.2026
  (git-historikk); Train-lock-fasiten (`designsystem/train-lock/`) erstatter den nå.
- **Tema/design (TØMT 2026-07-25, tidsplan LÅST 2026-07-31, OVERSTYRT 2026-08-03):** Gamle
  Presis/FASIT-låser er fortsatt avviklet. Tidsplanen fra 31.07 sa full Paper-port til `src/`
  skulle vente til FØR/UNDER/ETTER-piloten var evaluert — **Anders overstyrte dette eksplisitt
  2026-08-03** etter at steg 1–6 + steg 7 PR1 allerede var merget på løpende «ja» per PR.
  Full skjermport kjører nå aktivt per `docs/arkiv/paper-port/PORTPLAN.md` (én sesjon per mal-fasit,
  aldri merge til main uten Anders' «ja»). `designsystem/paper/` er et
  lokalt speil hentet ned i repoet 02.08.2026 (PR #254, ikke lenger kun på `chore/paper-speil-lokal`)
  — og er siden 12.08.2026 **arbeidsfasiten**, se speilregelen over. (Historikk:
  «gjenstaaende-plan-2026-07-31.md» er slettet 17.08.2026 — git-historikk;
  `docs/for-under-etter-spec.md` §2 står.)
- **[SUPERSEDERT 2026-08-25 — Train-lock vinner nå, se øverst. Beholdt som historikk.]
  Design-kilde (oppdatert 2026-08-05 — PAPER VINNER ALLTID):** **Claude Paper** (Claude Design
  `605a48cc`, skjermer i `fase1/`; Open Design `be6bdcb8-…`) er eneste designfasit — for både
  designarbeid OG produksjonskode. Presis/v2-kanonen er avviklet. Setningen «produksjonskode
  følger fortsatt v2-tokens + C, smalt til post-pilot» sto her frem til 05.08 og er **feil** —
  Anders overstyrte den 03.08, se §Tema/design over. [HISTORIKK — dette avsnittet er selv
  supersedert av Train-lock-beslutningen 25.08.2026 øverst i fila; `monsterdokument-paper.md`
  er slettet i opprydding 27.08.2026, git-historikk.]
  **Konfliktregel:** sier et dokument, en skill eller en kommentar noe annet enn Paper-fasiten,
  vinner Paper-fasiten — og dokumentet skal rettes, ikke følges.
  `docs/design-system/` og `docs/redesign-v2/` er SLETTET 2026-07-31 (git-historikk);
  kun `docs/design-system/TEMA-LYS-MORK.md` står som tema-beskrivelse av *kode*.