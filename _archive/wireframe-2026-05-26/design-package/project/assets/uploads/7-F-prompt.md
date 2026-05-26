# Custom prompt for Mini-batch 7-F - Tverrgaaende katalog-flater 10-14

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/design-batches/batch-7-other/mini-batches/7-F.md`
5. Alle 5 HTML-filer listet i `7-F-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-F.md) med 5 tverrgaaende katalog-flater.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 UI-kits.

Rekkefoelge:
1. Tilgangskontroll (per-bruker)
2. Import-assistent (4-stegs wizard)
3. Error-modal-katalog (12 moenstre)
4. Loading-skeletons-katalog (14 moenstre, live animasjon)
5. Confirm-dialogs-katalog (8 typer)

For hver: les spec (26-, 27-, 28-, 29-, 30-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit.

Etter alle 5: samlet oversikt + design-links.

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil-krav:**
- Norsk bokmaal, komma som desimal, mellomrom som tusenseparator
- Maks 3 lime-elementer per skjerm
- 8pt-grid, Lucide 1.75 stroke
- Asymmetrisk layout

**Anti-AI:**
- ALDRI "God morgen [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Hvem har tilgang."* / *"Faa data inn."* / *"Mens vi venter."* / *"Er du sikker?"*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Tverrgaaende katalog-flater:**
- Layout: header + filter + grid med eksempler
- Mer kompakt enn faktiske skjermer
- Hero italic editorial fragment

**Sidebar:** CoachHQ TO-LAGS (admin-flate).

**Referanse-personer:** Anders K, Sara, Tom. Markus + 7 andre spillere.

**Spesifikt for Pakke 4 (Loading-skeletons):**
- Skeletons MAA pulse i live preview (pulse 1.4s ease-in-out infinite)
- Toggle "Animer" skal kunne paause animasjon

**Spesifikt for Pakke 5 (Confirm-dialogs):**
- Cancel/Avbryt er ALLTID VENSTRE
- Destructive er ALLTID HOEYRE
- Aldri auto-fokus paa destructive-knapp
- Type-to-confirm: input-felt der bruker maa skrive eksakt ord (case-sensitive)

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Tilgangskontroll). Fortsett uten avbrudd.
