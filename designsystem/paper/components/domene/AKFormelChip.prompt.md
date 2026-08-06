# AKFormelChip

Formelen som chip. Fargeløs. Viser — formaterer aldri.

```jsx
<AKFormelChip parts={["TEK", "TEE", "60 min"]} dataOdId="okt-formel" />
<AKFormelChip formula="TEK_TEE_60" filled />
```

- FARGELØS er bindende: AK-vokabularet fargekodes aldri (StatusBadge-
  regelen). Chippen er border + muted mono — aldri pyramidefarger, aldri
  oransje.
- Formatet eies av CANON/appen: **AK-formel v2** —
  `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks.
  `TEK_INNSPILL_50_LAV_HAST_TRENINGSOMRADE_OBSERVERT`. Chippen er
  formatnøytral. (Bibliotekets eldre v1-eksempler ble rettet 06.08.2026 —
  konflikten fra `kart/status-2026-08-03.md` er lukket.)
- Ren visning: aldri klikkbar. Skal formelen redigeres, skjer det i
  økt-editoren — en chip i løpende tekst er ikke et treffmål.
- Klippes den, ligger hele formelen i `title`.
