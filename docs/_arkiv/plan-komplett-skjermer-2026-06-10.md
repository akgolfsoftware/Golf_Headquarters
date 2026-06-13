# Plan — komplett skjerm-paritet (alle produkter, alle bredder)

> Besluttet 2026-06-10. Fortsettelse av PlayerHQ mobil-paritet (9. juni, 5 hovedskjermer → 0 avvik).
> Autoritativ arbeidsplan på tvers av økter. Status spores i `MASTER-SKJERMPLAN.md`.

## Mål
Hver skjerm med fersk Claude Design-fasit portet til **0 avvik** mot fasiten på relevante bredder, kjørt på **ekte data**. I tillegg **net-new mobil-AgencyOS**. **Auto-godkjenning**: kritiker-loop per skjerm uten stopp per skjerm; rapport per pulje.

## Bredder per produkt (Anders-beslutning 2026-06-10)
| Produkt | Mobil 430 | iPad 834 | Desktop 1280 |
|---|---|---|---|
| PlayerHQ | fasit (gjort: 5 hoved) | responsiv-sjekk | fasit |
| AgencyOS | **net-new** (jeg designer) | responsiv-sjekk | fasit |
| Marketing | responsiv | responsiv-sjekk | responsiv |

- **iPad = responsiv-sjekk:** ingen egen fasit (designet har den ikke). iPad bruker nærmeste layout (desktop, ev. mobil) — verifiser at den ikke knekker, fiks responsive brudd. Ikke en «0 avvik»-gate.
- **AgencyOS mobil = net-new:** ingen fasit å måle mot. Bygges fra designsystem + AgencyOS desktop-innhold + PlayerHQ-mobilmønstre (mørkt tema). Selv-review + brand-enforcer i stedet for paritet-gate. Kan trenge Anders-input på IA underveis.

## Gate (per skjerm×bredde MED fasit)
1. Bygg FRA fasit-kilden (les JSX + screenshot, lag element-liste). 2. Screenshot app i riktig bredde. 3. Adversarial kritiker-agent finner avvik. 4. Fiks til **0 avvik**. 5. tsc/eslint grønt → commit. (Følger `.claude/rules/design-porting-gate.md`.)

## Fasit-inventar (det som skal portes)
**PlayerHQ** (playerhq-app, mobil+desktop):
- Hoved (5, mobil ✓): Hjem, Planlegge, Gjennomføre, Analysere, Meg → gjenstår desktop
- Meg-undersider (7): profil, abonnement, innstillinger, helse, utstyr, dokumenter, hjelp
- Auth (6): login, signup, glemt, bankid, samtykke, onboarding
- Øvrig: live-økt (brief/aktiv/oppsummering), round-detail, log-round, varsler, tournaments, coach-panel

**AgencyOS** (agencyos-app, desktop-fasit + mobil net-new): ~26 nav-skjermer — Oversikt, Oppgaver/Tildelt, Stall (spillere/grupper), Talent (radar/sammenligning/WAGR), Workbench, Treningsplaner/Maler/Drills/Turneringer, Kalender/Bookinger/Anlegg/Tilgjengelighet/Tjenester, Stall-analyse/Lag-snitt/Tester, Innboks, m.fl.

**Marketing:** forside + nøkkelsider (lettere fersk sett).

## Faser (hver i puljer à 5–8 skjermer)
- **Fase 0 — Verktøy:** utvid `app-shot.mjs` + `design-shot.mjs` til desktop (1280) + iPad (834). Design-shot desktop = `ph-device=desktop` + sidebar-nav. Engangs.
- **Fase 1 — PlayerHQ desktop:** de 5 hovedskjermene på desktop (HomeDesktop, ExecuteScreen desktop, AnalyzeScreen desktop, MeScreen desktop, Workbench desktop = iframe full Workbench).
- **Fase 2 — PlayerHQ resten (mobil+desktop):** Meg-undersider, auth, live-økt, round-detail, log-round, varsler, tournaments, coach-panel.
- **Fase 3 — AgencyOS desktop:** alle ~26 fra fasit.
- **Fase 4 — AgencyOS mobil (net-new):** prioriter kjerne (Oversikt, Stall, Spiller-detalj, Innboks, Kalender, Workbench), så resten. Designsystem-drevet.
- **Fase 5 — Marketing:** forside + nøkkelsider.
- **Fase 6 — iPad-sveip:** kjør alle portede ruter på 834px, fiks responsive brudd.

## Auto-godkjenning (kjøre-rutine)
Per pulje: bygg alle → gate-loop hver til 0 avvik → tsc/eslint → commit → vis Anders sammendrag + bilder → fortsett neste pulje automatisk. **Stopp kun ved:** manglende data som krever seed-beslutning, eller mobil-AgencyOS IA-valg bare Anders kan ta.

## Verifisering & data
- tsc + eslint (pre-commit hook) per commit; full `npm run build` per fase.
- Utvid `seed-screentest.ts` ved databehov. Coach-data: seed/gjenbruk coach-konto for AgencyOS-skjermer.
- Oppdater `MASTER-SKJERMPLAN.md`-haker per skjerm i samme commit.

## Grovt omfang
~70–80 skjerm-bredder med fasit + ~26 net-new mobil-AgencyOS. Fler-økt program. Rapport per pulje.
