# Coaching Recommendation Eval Rubric

Holdout-sett: `holdout-15.jsonl` (ho-001 … ho-015)  
**Ingen overlap** med trenings-IDs ex-001 … ex-055.

## Scoring (per case, 0–5 per dimensjon → max 25)

| Dimensjon | 5 (pass) | 3 (partial) | 0 (fail) |
|-----------|----------|-------------|----------|
| **pyramid_sum=100** | `pyramid_adjustment` summerer nøyaktig 100 | Sum 95–105 med forklaring | Sum ≠ 100 eller mangler |
| **l_fase_respect** | CS/Env/PR og max recs innen L-fase-tabell | Én brudd, resten OK | Flere brudd (f.eks. 3 recs i L-KROPP) |
| **primary_weakness_correct** | Verste SG-bånd + korrekt MORAD fault | Riktig område, feil fault | Feil område eller ignorerer L-fase override |
| **drill_exists** | Drill i morad-fault-drill-mapping for fault | Sekundær drill OK, primær svak | Ukjent drill eller PUTT med MORAD-fault |
| **confidence_honest** | confidence matcher datakilder; <0.7 merket retningssignal | Én kilde, confidence 0.65–0.75 | Overconfident (>0.8) på video-only / 1 runde |

## Pass-threshold

- **Ship:** ≥20/25 på case, ingen 0 på `l_fase_respect` eller `pyramid_sum`
- **Review:** 15–19/25
- **Fail:** <15/25 eller brudd på blocking invariant (inv_1–inv_6)

## Spesialcases

| Case-type | Ekstra krav |
|-----------|-------------|
| `negative_guard` (ho-015) | `recommendations` tom ELLER max 1 med TEK-fokus |
| `junior_volume_cap` (ho-007) | `weekly_hours` ≤ alder, ikke 4+ nye økter |
| `readiness_cap` (ho-006) | PR1, ≤1 session, halvert volum |
| `retningssignal` (ho-008) | confidence ≤0.69, eksplisitt lav-konfidens-tekst |
| `PERIOD_SWITCH` (ho-009) | TEK ≤25%, SPILL ≥30% i turneringsuke |

## Kjøring

```bash
# Valider holdout JSON
python3 -c "
import json
with open('training-data/eval/holdout-15.jsonl') as f:
    rows = [json.loads(l) for l in f if l.strip()]
assert len(rows) == 15
ids = {r['id'] for r in rows}
assert not ids & {f'ex-{i:03d}' for i in range(1,56)}
print('OK', len(rows), 'holdout cases')
"
```

## Rapport-format

```json
{
  "case_id": "ho-003",
  "scores": {
    "pyramid_sum": 5,
    "l_fase_respect": 5,
    "primary_weakness_correct": 4,
    "drill_exists": 5,
    "confidence_honest": 5
  },
  "total": 24,
  "notes": "Riktig 150-200 band, vekttransfer P5"
}
```