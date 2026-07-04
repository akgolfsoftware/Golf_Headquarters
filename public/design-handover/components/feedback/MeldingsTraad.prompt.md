Meldingstråd; bruk for AI-Caddie-chat, innboks-svar og coach↔spiller/forelder-samtaler.

```jsx
<MeldingsTraad label="Samtale med Jonas Haugen">
  <MeldingsTraad.Skille>I går</MeldingsTraad.Skille>
  <MeldingsTraad.Melding fra="dem" navn="Jonas Haugen" tid="18:20">
    Håndleddet kjennes mye bedre. Kan jeg starte lett putting?
  </MeldingsTraad.Melding>
  <MeldingsTraad.Melding fra="meg" tid="18:34">
    Ja — start med 15 min rullekontroll, ingen fulle slag ennå.
  </MeldingsTraad.Melding>
  <MeldingsTraad.Melding fra="ai" tid="18:35">
    Forslag basert på rehab-protokollen:
    <ForslagsKort … />   {/* rike kort legges som children og havner under boblen */}
  </MeldingsTraad.Melding>
  <MeldingsTraad.Skriver navn="AI-Caddie" />
</MeldingsTraad>
```

- **fra**: `meg` (høyre, primary-fill) · `dem` (venstre, kort m/ navn) · `ai` (venstre, sparkles-avatar i signal).
- Ren tekst havner i boblen; element-children (kort, vedlegg) rendres under boblen i full bredde.
- **initialer** utledes av `navn` om utelatt. **tid** vises i meta-raden.
- `Skille` = datoskille med linjer; `Skriver` = animert skriveindikator (respekterer reduced motion).
- Tråden er `role="log"` + `aria-live="polite"` — nye meldinger annonseres.
