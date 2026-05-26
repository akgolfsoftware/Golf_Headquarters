# Batch 7 mini-batches

Batch 7 leveres i **8 mini-batches** for å holde hver claude.ai/design-sesjon innenfor rimelig kontekst-budsjett (~5-7 pakker per sesjon).

## Oversikt

| Mini-batch | Pakker | Tema | Anslag tid |
|---|---|---|---|
| 7-A | 1-5 | CoachHQ kalender/kapasitet/finance/facilities/reports | 60-80 min |
| 7-B | 6-10 | Audit/locations/oppfolgingsko/PlayerHQ kalender/baner | 60-80 min |
| 7-C | 11-15 | PlayerHQ help/leaderboard + CoachHQ meldinger/brief/analytics | 60-80 min |
| 7-D | 16-20 | Spiller-detalj + tverrgaaende 1-4 | 60-80 min |
| 7-E | 21-25 | Tverrgaaende 5-9 (CBAC, datakilder, signal, plan-aksjon, tokens) | 60-80 min |
| 7-F | 26-30 | Tverrgaaende 10-14 (tilgang, import, error, loading, confirm) | 60-80 min |
| 7-G | 31-35 | Tverrgaaende 15-19 (inline, eksport, gesture, empty, toast) | 60-80 min |
| 7-H | 36-42 | Tverrgaaende 20-25 (sidebar, topbar, onboarding, facility, settings, notif, modal-indeks) | 80-100 min |

## Slik bruker du hver mini-batch

1. Start ny claude.ai/design-sesjon
2. Last opp **system-kontekst** (kun engang per sesjon):
   - `wireframe/brain/for-claude-design/branding-style-guide.html`
   - `wireframe/brain/for-claude-design/design-system-v2.md`
   - Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
3. Last opp **mini-batch-spec**: `7-X.md` (f.eks. `7-A.md`)
4. Last opp **HTML-vedlegg** listet i `7-X-vedlegg.txt`
5. Kopier prompt fra `7-X-prompt.md` og send som foerste melding
6. La Claude Design generere alle skjermer i mini-batchen i samme sesjon
7. Lim design-links tilbake til Claude Code i tracker

## Hvorfor 8 mini-batches?

- 5-7 skjermer per sesjon holder Claude Design fokusert og kontekst stabil
- Lettere aa pause/resume mellom mini-batches
- Hver mini-batch har koherent tema (relaterte skjermer = mindre context-switch)
- Tverrgaaende katalog-flater er litt enklere per stk, saa 7-D til 7-H har fleksible fordelinger

## Anti-AI-regler (gjelder ALLE mini-batches)

- ALDRI "God morgen, [Navn]" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. 38 spillere venter."* / *"Hva lurer du paa?"* / *"Er du sikker?"*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Norsk bokmaal med AE/OE/AA, komma som desimal (12,4), mellomrom som tusenseparator (1 600 kr)

## Referanse-personer (bruk konsekvent)

- **CoachHQ:** Anders Kristiansen (hovedcoach), Sara Pedersen (coach), Tom Olsen (junior-coach)
- **PlayerHQ:** Markus Roinaas Pedersen (Elite, HCP +2,4)
- **Andre spillere som vises:** Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg, Lina Hellesund

## Output per skjerm

For hver skjerm i en mini-batch, lever:
1. Hovedskjerm i lyst tema (default)
2. Moerkt tema
3. Hover/aktive states paa kritiske elementer
4. Empty/loading hvor relevant
5. Mobil-versjon hvis layout endres dramatisk

## Etter alle 8 mini-batches

Naar alle 42 pakker har design-links og er APPROVED:
- Design-fasen er ferdig (alle 62 wireframe-skjermer dekket)
- Implementasjon kan starte i de 4 produkt-repoene
- Final design-tokens-eksport til kode-base
