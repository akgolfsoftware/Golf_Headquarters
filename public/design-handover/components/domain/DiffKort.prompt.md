Diff-kort; bruk for AI-foreslåtte plan-endringer, godkjenninger og audit-logg-detalj (før/etter).

```jsx
<DiffKort>
  <DiffKort.Fjernes>
    <DiffKort.Rad akse="SPILL" meta="Lør 09:00 · 4t · CS20">Banespill — 18 hull</DiffKort.Rad>
  </DiffKort.Fjernes>
  <DiffKort.LeggesTil>
    <DiffKort.Rad akse="SLAG" meta="Lør 09:00 · 1,5t · CS50">Innspill 150–175 m</DiffKort.Rad>
    <DiffKort.Rad akse="TEK" meta="Lør 11:00 · 1t · CS50">Teknikk — face-to-path</DiffKort.Rad>
  </DiffKort.LeggesTil>
  <DiffKort.Effekt>
    <DiffKort.Metrikk label="ACWR" fra="1,22" til="1,14" tone="positiv" />
    <DiffKort.Metrikk label="Plan-kvalitet" fra="72" til="87" tone="positiv" />
    <DiffKort.Metrikk label="Volum" fra="12t" til="10,5t" tone="negativ" />
  </DiffKort.Effekt>
</DiffKort>
```

- `Fjernes` (error-tint, gjennomstreket) og `LeggesTil` (signal-tint) — kolonne-context styrer radene.
- **Rad.akse** (FYS/TEK/SLAG/SPILL/TURN) gir semantisk kant-farge fra `--axis-*` og prefikser meta.
- `Effekt` legger metrikker i full bredde under kolonnene; **Metrikk** viser `fra → til`,
  **tone** farger ny verdi: `positiv` (signal) · `negativ` (amber). Mono/tabular på alle tall.
- Kolonnene stables under 560px. Handlingsknapper (Godta/Avvis) eies av omgivelsen, ikke kortet.
