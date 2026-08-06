# Inspirasjonsanalyse — 25 bilder mot Claude Paper-systemet

Analysert 28.07.2026. Kilde: ~/Downloads/Inspirsjonsbilder (25 skjermbilder: Dropset, Timeblok, PulseUp, Focus Score, Eight Sleep-stil søvnscore, StrideGate, GOLFX, Rooune, Golden Suisse, crypto-terminaler, 28-Day program, Level-system, Vihaan Writes).

Målestokk: akhq-tokens.css + brand-guidelines (Anthropic-palett #141413/#FAF9F5, aksent #D97757/#6A9BCC/#788C5D, Poppins/Lora/Plex Mono) + de fire ufravikelige reglene.

## 1. Hovedkonklusjon

Bildene deler ÉN postur: mørk, rolig, monokrom flate der ETT stort mono-tall eller ÉN hvit pille-knapp eier skjermen. Det er strukturelt identisk med Claude Paper — forskjellen er temperatur. Inspirasjonen er kald (ren sort #000, klinisk hvit); Claude Paper er varm (blekk #141413, papir #FAF9F5). Vi tar KOMPOSISJONEN og TALLDISIPLINEN fra bildene, aldri fargetemperaturen. Mørk modus i tokens-filen leverer denne premiumfølelsen ferdig — ingen nye tokens trengs.

## 2. Ni mønstre som tas inn — og hvor

| # | Mønster fra bildene | Claude Paper-oversettelse | Brukes i |
|---|---|---|---|
| 1 | Ett gigantisk mono-tall som helt (32:08-timer, 55,5 kg-hjul, 98-score, 190 lbs) | `--mono`, tabulære sifre, enhet i 0,55em `--muted` ved siden av — aldri tall uten enhet | playerhq-live (timer), diagnose (score), okonomi (sum), alle KPI-er |
| 2 | Én hvit pille-CTA på mørk flate («Get Started», «Verify») | `--cta`/`--on-cta` — blekk i lys, papir i mørk. ÉN primær per skjerm, resten ghost | alle skjermer; bekrefter CTA-regelen |
| 3 | Sjekkliste-rader med sirkulær status foran (Dropset live: gjort/aktiv/gjenstår) | rad med 36px statussirkel: `--up-raw`-fylt hake / `--border`-ring / tom | playerhq-live drill-liste, gjennomføre, ko-rader |
| 4 | «Nå-blokk + Up Next» med progressbar (Timeblok) | nå-kort `--surface` + tynn `--fg`-progress, neste-kort `--soft` | playerhq-dagens-okt, playerhq-live, agencyos-uka |
| 5 | Program-stige med låste steg (28-Day, Level 3 · 55/450XP) | dag/nivå-kort: fullført hake `--up`, aktiv = eneste med CTA, låst = `--muted` + lås. XP-bar i `--soft`/`--fg` | AK-stigen, utviklingsplan, talent-roadmap, feiring |
| 6 | Punktmatrise-historikk (Jan–Mar-treningsprikker, transactions heatmap) | 6–8px prikker: `--soft` tom, `--mid` lav, `--fg` høy (grafikk-unntaket for --mid), aldri farge for intensitet | analyse/treningshistorikk, stall-plus, innsikt |
| 7 | Score-gauge + tre undertall med enhet og vindu (Sleep 98 · Quality 98 % · 8h 10m) | halvsirkel i `--fg` på `--soft`-spor; tre KPI-er under med enhet + tidsvindu som synlig tekst | playerhq-diagnose, ukeslutt (begge flater), kvalitet |
| 8 | AI-recap-kort («Autopilot made 24 adjustments … Deep sleep ↑20 %») | agent-oppsummering i prosa (`--body`/Lora) + deltaer med retning og grunnlag («↑20 % vs forrige uke»). Info-blå ramme KUN hvis analyse | caddie/dispatch-kortene, daily brief, selvjuster |
| 9 | Onboarding: ett spørsmål per skjerm, progress-prikker, store valgknapper (PulseUp) | beholdes 1:1 strukturelt; knapper som `--surface`-kort med `--border`, valgt = `--fg`-ramme | onboarding-01–05 |

I tillegg: hjul-velger for verdier (55,5 kg) → manuell logging (helse, treningslogg); kontekstmeny på rad (Warmup/Dropset/RPE/kopier/slett) → økt-editor; delt editorial login på brede flater (Golden Suisse) → AgencyOS-login på desktop; sosial feed med pålitelighetsmåler (Rooune, lys!) → workbench-sosial/venner — Rooune-bildet beviser at systemet også bærer i lys modus.

## 3. Det vi IKKE tar med

1. Ren sort `#000` og kald grå — alt mørkt er varmt blekk (`#141413`/`#1D1C1A`).
2. Grønn/lime som energifarge (GOLFX-estetikken) — grønn finnes kun som `--up` for positiv data. Golf-innholdet i GOLFX-bildet (AI-tip med «162 yds ±5») er derimot gull: tall + usikkerhet + anbefaling — det er gameplan-innhold, ikke -farge.
3. Oransj/gradient-bannere (400m Repeats «Repeat x5») — gradient finnes ikke; repetisjonsblokk markeres med `--accent` KUN hvis den er skjermens ene jobb, ellers `--soft` + mono-etikett.
4. 3D-soft-skygger og glassknapper (Soft UI Kit-bildet) — Claude Paper er flat med én rolig skygge. Fra det bildet tar vi bare tilstandslogikken (aktiv/inaktiv segment, check-varianter).
5. Glow, pulserende ringer, XP-konfetti — feiring uttrykkes typografisk og med `--up`, ikke med lys.

## 4. Konsekvens for omskrivingen

- Bildene bekrefter kontraktens tall-regler; ingen endring i tokens-filen er nødvendig etter denne analysen. `--r-pill` (godkjent) dekker pille-CTA-ene og dag-velgerne.
- Pulje 1 (dashboard, stall, ko, plan) henter direkte: mønster 1, 2, 3, 6, 8.
- PlayerHQ-puljene henter: 1, 2, 3, 4, 5, 7, 9 + hjul-velger.
- Mørk modus er ikke «invertert lys» — den ER premiumuttrykket fra bildene. Begge moduser leveres likeverdige, som kontrakten krever.
