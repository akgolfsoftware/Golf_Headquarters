# Startprompt — redesign-sesjon (kopier inn i ny Claude Code-sesjon)

## Steg 1 — Legg HTML-filene fra Claude Design i riktig mappe

| Skjermtype | Legg HTML her |
|---|---|
| PlayerHQ-skjermer | `public/design-handover/playerhq/` |
| AgencyOS-skjermer | `public/design-handover/agencyos/` |
| Elite Fase 2 (video/dispersjon/mental) | `public/design-handover/elite/` |

Navngi filene beskrivende i kebab-case, f.eks. `workbench-hjem.html`, `agencyos-dashboard.html`, `sikte-planlegger.html`.

## Steg 2 — Start Claude Code fra prosjektmappen

```
cd ~/Developer/akgolf-hq && claude
```

## Steg 3 — Lim inn denne meldingen

````
Jeg har lagt nye Claude Design HTML-filer i public/design-handover/ (undermapper playerhq/,
agencyos/, elite/). Vi skal implementere dem pixel-perfekt.

Les først disse for kontekst:
- docs/skjerm-manifest-playerhq.md
- docs/skjerm-manifest-agencyos.md
- docs/skjerm-manifest-elite-fase2.md
- Auto-memory: workflow_design_handover_regel.md + project_produktlogikk_playerhq_agencyos.md

Følg den faste regelen:
1. Skann alle HTML-filene i public/design-handover/ og lag en oppdatert kobling
   design-fil → rute (mot manifestene). Vis meg oversikten + lett-wireframe FØR koding.
2. Etter min OK: kalibrer på ÉN referanseskjerm (AgencyOS-dashboard) sekvensielt.
   Vis meg resultatet. Vent på godkjenning.
3. Deretter parallell fan-ut (batch 4-6 subagenter). Hver agent: les EKSAKT HTML-fil,
   bruk KUN eksisterende komponenter (athletic/index.ts), koble ekte Prisma-data,
   screenshot-match mot design som DONE-gate.
4. Visuell verifikasjon per skjerm: Playwright-screenshot + /admin/godkjenn-portal/review.

Designsystem er LÅST: forest #005840 / lime #D1F843 / cream #FAFAF7. Fonter Inter /
Inter Tight / JetBrains Mono. Ingen nye hex, ingen nye fonter, ingen emoji. Norsk bokmål.

Start med å skanne handover-mappen og vis meg design→rute-koblingen.
````

## Hva som allerede er klart (forrige sesjon)
- public/design-handover/ ryddet — gamle designs arkivert
- Forbudt tokens.ts fjernet, designsystem rent (ÉN token-kilde)
- Manifest + wireframes for PlayerHQ + AgencyOS + Elite Fase 2
- Produktlogikk + arbeidsflyt-regel lagret i minnet
- Claude Design-prompter for elite: docs/agency-build/claude-design-prompts-elite.md
