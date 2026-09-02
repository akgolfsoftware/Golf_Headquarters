# Player HQ Train lock — prosjektinstruks

Dette prosjektet er designfasiten for AK Golf HQ. ~200 skjermfiler i Train-lock-stil.

**Før du endrer eller lager noe:**
1. Les `DESIGN-SYSTEM.md` — tokens, geometri, type, komponent-matrise, knappe-matrise, forbud.
2. Finn skjermen i `SCREEN-INDEX.md` og åpne nærmeste eksisterende fil som mal.
3. `HANDOFF.md` er IA- og beslutningshistorikk. Ved konflikt: HANDOFF vinner på struktur, DESIGN-SYSTEM på visuelle verdier.

**Faste regler i dette prosjektet:**
- Norsk bokmål i all UI-tekst. «Økt», ikke «session».
- Alle stiler inline. Ingen CSS-klasser, ingen nye tokens.
- ASCII i filnavn (`Okt`, `Okonomi`) — æ/ø/å bryter batch-verktøy.
- Én hvit primær CTA per ramme. `tabular-nums` på alle tall.
- Ny eller endret fil → oppdater raden i `SCREEN-INDEX.md` og legg en linje i `HANDOFF.md`.
- Store revisjoner: ny fil med suffiks (`... v2.dc.html`), behold originalen.
