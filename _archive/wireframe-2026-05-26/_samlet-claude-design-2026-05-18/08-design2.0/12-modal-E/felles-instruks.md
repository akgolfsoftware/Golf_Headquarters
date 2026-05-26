# Felles instruks for ALLE arketype-E redesign-sesjoner

**Lim denne inn FØRST i hver Claude Design-sesjon, før den per-skjerm-prompten.**

---

## Hovedregel: ÉN produksjons-skjerm per HTML-fil

Forrige levering hadde alle live/agent/pipeline-skjermer som "state-katalog" — 5-7 captioned mini-mockups side-om-side med titler som "1 — Idle, 2 — Aktiv, 3 — Pause". **Dette skal IKKE skje igjen.**

Hver fil du leverer i denne sesjonen skal være:

- **ÉN fullbleed produksjons-skjerm** klar for screenshot eller iframe-embed
- **Default-state** rendret i full størrelse (minimum 1440×900 for desktop-skjermer, 1024×768 for modal-arketyper)
- **Ingen "1 — X" captioned varianter** på samme side
- **Implementerbar som React-komponent direkte** — pixel-perfekt visuelt mål

## Hvis flere states trengs

Hvis spec ber om å vise andre states (pause, ferdig, error, empty), lever dem som **separate HTML-filer** med klare suffikser:

```
01-live-session-default.html      <- hoved-produksjons-skjerm
01-live-session-pause.html        <- pause-overlay state
01-live-session-ferdig.html       <- siste-rep-completion state
01-live-session-loading.html      <- loading-state
```

ALDRI legg flere states som mini-mockups inni samme HTML.

## Layout-validering før levering

Før du melder fra at en skjerm er ferdig:

1. **Sjekk at tekst ikke overlapper.** Hver tekstlinje/label må ha eget vertikalt rom.
2. **Sjekk at linjer/wires går BAK tekst-bokser** (z-index: -1) — aldri gjennom.
3. **Sjekk at fullscreen-skjermer faktisk fyller hele viewport** — ingen blank margin rundt sentralt innhold.
4. **Sjekk at innhold er konkret** — Markus Roinaas Pedersen som spiller, Anders Kristiansen som coach, 12,4 HCP, "Putte-økt", "Sommer-toppform". Ikke "Tittel her" eller "Lorem ipsum".

## Designsystem (gjelder uansett)

- Norsk bokmål, komma som desimal (12,4), mellomrom som tusenseparator (1 600 kr)
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, stroke 1.75
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic-element (Inter Tight italic) per skjerm — reservert for editorial moment
- Aldri "Welcome back" eller "God morgen, [Navn]" — bruk observasjons-fragment
- Flat farger på avatarer, aldri gradienter
- Bare lime gradient er tillatt: `#D1F843 → #C2EE2F` på progress-bar fill

## Mental model

For hver skjerm, svar på: **"Hva ser brukeren akkurat NÅ, og hva er den ene handlingen?"**

Bygg rundt den ene handlingen. Ikke vis kontekst-info som distraherer fra det brukeren skal gjøre.

## Output-format

Hver levert skjerm:
- 1 HTML-dokument med inline `<style>`
- Bredde minimum 1440px (eller modal-spesifikk)
- Bruker `colors_and_type.css` tokens (lastes opp som system-kontekst)
- Lim design-link tilbake til Claude Code per godkjent skjerm
