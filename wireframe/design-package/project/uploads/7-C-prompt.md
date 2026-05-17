# Custom prompt for Mini-batch 7-C - PlayerHQ help / leaderboard + CoachHQ meldinger / brief / analytics

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-7-other/mini-batches/7-C.md`
5. Alle 5 HTML-filer listet i `7-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-C.md) med 5 spesial-visninger. Mix av PlayerHQ og CoachHQ.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 UI-kits.

Rekkefoelge:
1. PlayerHQ Hjelp (search-driven help-center)
2. PlayerHQ Maal-leaderboard (podium + tabell, Pro-laast)
3. CoachHQ Meldinger (chat 2-kolonne)
4. CoachHQ Daglig brief (morgen-rapport)
5. CoachHQ Analytics V2 (multi-pane med 4 kvadranter)

For hver: les spec (11-, 12-, 13-, 14-, 15-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit, ga til neste.

Etter alle 5: samlet oversikt + design-links.

## Felles regler

**Designsystem:** Eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, komma som desimal (12,4), 24-timer, mellomrom som tusenseparator
- Maks 3 lime-elementer per skjerm
- 8pt-grid, Lucide-ikoner 1.75 stroke
- Asymmetrisk layout

**Anti-AI:**
- ALDRI "God morgen [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Hva lurer du paa?"* / *"Hvor du staar."* / *"Onsdag morgen. 6 oekter venter."*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Sidebar:**
- CoachHQ TO-LAGS: smal moerk rail (56px, #061210) + lys nav (200px, #FAFAF7)
- PlayerHQ: venstre sidebar (desktop) eller bottom-tab-bar (mobil)

**Referanse-personer:**
- CoachHQ: Anders K (hoved), Sara, Tom
- PlayerHQ: Markus Roinaas Pedersen (Elite, HCP +2,4)
- Andre spillere: Henrik, Anna, Mads, Lise, Joachim, Emma, Lina

**Lower-is-better** (puttar, score, HCP): nedgang = SUCCESS
**Higher-is-better** (volum, streak, rang): oppgang = SUCCESS

**Pro-tier-gate:** Free-tier ser blurred preview + sentrert tier-gate-card "Faa X med Pro -> Oppgrader" (lime CTA).

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (PlayerHQ Hjelp). Fortsett uten avbrudd til alle 5 er ferdige.

Etter ferdig: samlet oversikt + design-links + caveats per skjerm.
