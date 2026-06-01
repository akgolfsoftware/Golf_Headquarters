# Startprompt — redesign-sesjon (kopier inn i ny Claude Code-sesjon)

## Steg 1 — Legg handover-en fra Claude Design

**Best: ZIP (komplett pakke — alle skjermer + delt CSS + assets).**

| Format | Legg her |
|---|---|
| **Zip (anbefalt)** | `~/Developer/akgolf-hq/public/design-handover/` eller `~/Downloads/` |
| Enkeltstående HTML | `public/design-handover/{playerhq,agencyos,elite}/` |

Jeg pakker ut zip-en og sorterer skjermene selv.

## Steg 2 — Start Claude Code fra prosjektmappen

```
cd ~/Developer/akgolf-hq && claude
```

## Steg 3 — Lim inn denne meldingen

````
Jeg har lagt en zip med Claude Design-handover i public/design-handover/ (eller ~/Downloads/).

Les først for kontekst:
- docs/skjerm-manifest-playerhq.md + skjerm-manifest-agencyos.md + skjerm-manifest-elite-fase2.md
- Auto-memory: workflow_design_handover_regel.md + project_produktlogikk_playerhq_agencyos.md

KJØR DENNE FLYTEN:

SJEKKPUNKT 1 — Kartlegging (stopp for min OK):
  - Pakk ut zip-en, sorter HTML i playerhq/ agencyos/ elite/.
  - Lag kobling design-fil → rute (mot manifestene).
  - Vis meg oversikten + lett-wireframe. VENT på min godkjenning.

SJEKKPUNKT 2 — Kalibrering på ÉN skjerm (stopp for min OK):
  - Implementer KUN AgencyOS-dashboard (/admin/agencyos) pixel-perfekt fra HTML-en.
  - Bruk KUN eksisterende komponenter (athletic/index.ts), ekte Prisma-data.
  - Ta Playwright-screenshot, vis meg side-ved-side mot design-HTML. VENT på min godkjenning.
  - Dette er kvalitetssjekken så vi IKKE designer alle skjermer feil.

DERETTER — Autonom kjøring (ingen flere stopp, YES til alt):
  - Når jeg har godkjent kalibreringsskjermen: kjør ALLE resterende skjermer autonomt.
  - Parallell fan-ut, batch 4-6 subagenter. Hver agent: les EKSAKT HTML-fil, bruk KUN
    eksisterende komponenter, koble ekte Prisma-data.
  - DONE-gate per skjerm: Playwright-screenshot må matche design-HTML (intern verifikasjon,
    ikke spør meg). Commit fortløpende.
  - Ikke stopp før alle skjermer er ferdige. Oppsummer til slutt.

Designsystem LÅST: forest #005840 / lime #D1F843 / cream #FAFAF7. Inter / Inter Tight /
JetBrains Mono. Ingen nye hex/fonter/emoji. Norsk bokmål. Aldri generert kode fra
Claude Design — JEG porter med våre komponenter.

Start med Sjekkpunkt 1: pakk ut zip og vis meg design→rute-koblingen.
````

## Flyt-oppsummering

```
ZIP → [SJEKKPUNKT 1] kobling + wireframe ──(din OK)──►
      [SJEKKPUNKT 2] ÉN skjerm pixel-perfekt ──(din OK)──►
      [AUTONOM] alle resterende skjermer · YES til alt · screenshot-gate · commit løpende → FERDIG
```

To menneske-stopp (kartlegging + kalibrering), så går resten av seg selv.

## Hva som allerede er klart (forrige sesjon)
- public/design-handover/ ryddet — gamle designs arkivert, mapper playerhq/agencyos/elite/ klare
- Forbudt tokens.ts fjernet, designsystem rent (ÉN token-kilde)
- Manifest + wireframes for PlayerHQ + AgencyOS + Elite Fase 2
- Produktlogikk + arbeidsflyt-regel lagret i minnet
- Claude Design-prompter for elite: docs/agency-build/claude-design-prompts-elite.md
