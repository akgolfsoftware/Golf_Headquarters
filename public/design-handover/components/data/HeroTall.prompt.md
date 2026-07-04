Hero-tall; bruk i topplinjer og hero-soner — spesielt de to kanon-tallene.

```jsx
{/* To tall, aldri blandet — hver med egen eyebrow */}
<div style={{ display: "flex", gap: 48 }}>
  <HeroTall label="Plan-kvalitet" verdi="87" enhet="av 100" size="lg"
    delta={<DeltaIndikator verdi="+5" />} />
  <HeroTall label="Gjennomføring" verdi="92" enhet="%" size="lg" />
</div>
```

- Naken lockup (ingen kort-ramme) — for tall i kort, bruk `KpiTile`.
- **size**: `md` 36 · `lg` 48 (default) · `xl` 60 px — alltid tabulær mono, line-height 1.
- Verdien settes i `--text` (dagslys-porten): aldri muted på kritisk data.
- **delta** tar en node — sett inn `<DeltaIndikator>`.
- Kanon: PLAN-KVALITET (0–100) og GJENNOMFØRING (%) er alltid to separate HeroTall.
