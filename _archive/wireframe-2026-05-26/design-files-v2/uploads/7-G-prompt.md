# Custom prompt for Mini-batch 7-G - Tverrgaaende katalog-flater 15-19

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/design-batches/batch-7-other/mini-batches/7-G.md`
5. Alle 5 HTML-filer listet i `7-G-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-G.md) med 5 tverrgaaende katalog-flater. Disse har mye live demo-innhold.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 UI-kits.

Rekkefoelge:
1. Inline-editing-moenstre (7 demos)
2. Eksport-funksjoner (14 typer + historikk-tabell)
3. Mobile gestures-katalog (9 animerte gestures)
4. Empty-states-katalog (12 moenstre med live rendering)
5. Toast-system (4 demo-knapper + spec)

For hver: les spec (31-, 32-, 33-, 34-, 35-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit.

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
- Eksempler: *"Endre uten aa aapne modal."* / *"Faa data ut."* / *"Beroering som fungerer."* / *"Naar det ikke er noe aa vise."* / *"Smaafeedback fra systemet."*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Tverrgaaende katalog-flater:**
- Layout: header + filter + grid med eksempler
- Mer kompakt enn faktiske skjermer
- Hero italic editorial fragment

**Sidebar:** CoachHQ TO-LAGS (admin-flate).

**Spesifikt for Pakke 1 (Inline-editing):**
- Live demo-felter MAA vaere redigerbare (vis edit-mode i en variant)
- Save-state med spinner i en variant

**Spesifikt for Pakke 3 (Mobile gestures):**
- Animerte demos er kjernen - vis animasjon-frames hvis live ikke mulig
- Haptic feedback-info per gesture

**Spesifikt for Pakke 4 (Empty-states):**
- ALDRI rod/destructive paa empty - empty er IKKE feil
- Bruk Lucide-ikoner (24-48px), ALDRI illustrasjoner
- Maks 1 setning + 1 sub-setning + 1 CTA per state

**Spesifikt for Pakke 5 (Toast-system):**
- Plassering: bunn-hoeyre desktop, bunn-midt mobil
- Maks 3 stacked synlige
- Auto-dismiss 3s success / 4s info / 5s warning / manuell error
- Slide-in 200ms ease-out

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer (eller demo-aktivert state)
3. Empty/loading hvor relevant
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Inline-editing). Fortsett uten avbrudd.
