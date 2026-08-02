# AK Golf HQ — Coaching Recommendations Training Data

## Overview

This directory contains JSONL training examples for the `AiPlanGeneration` coaching recommendation engine. Each line is a self-contained JSON object demonstrating how the system should reason from player input data to a prioritized coaching plan.

**File:** `coaching-recommendations.jsonl`
**Examples:** 55 (all valid JSON, one per line)

---

## JSON Schema

```
{
  "id":        string        — unique identifier (ex-001 … ex-055)
  "input":     InputObject
  "reasoning": ReasoningObject
  "output":    OutputObject
}
```

### InputObject

| Field | Type | Description |
|-------|------|-------------|
| `player.category` | A–K | Skill tier (A = beginner ~54 hcp, K = elite ~+4 hcp) |
| `player.handicap` | number | Current handicap index |
| `player.l_fase` | string | Learning phase: L-KROPP, L-ARM, L-KØLLE, L-BALL, L-AUTO |
| `player.period` | string | Training period: GRUNN, SPESIALISERING, TURNERING |
| `player.cs_level` | 20–100 | Club speed level for drill prescriptions |
| `player.readiness` | 0.0–1.0 | Training readiness (low ≤0.5 → reduced volume) |
| `player.weekly_hours` | number | Available practice hours per week |
| `sg_profile.ott` | number | Strokes gained: off-the-tee |
| `sg_profile.app` | number | Strokes gained: approach (aggregate) |
| `sg_profile.app_granular` | object | SG per distance band: `200+`, `150-200`, `100-150`, `50-100`, `<50` |
| `sg_profile.arg` | number | Strokes gained: around-the-green |
| `sg_profile.putt` | number | Strokes gained: putting |
| `trackman.*` | numbers | Raw TrackMan data: club_speed, ball_speed, smash_factor, attack_angle, club_path, face_to_path, dynamic_loft, spin_loft, carry, total |
| `pyramid_current` | object | Current time allocation %: fys, tek, slag, spill, turn |

### ReasoningObject (5-step chain — MANDATORY)

| Step | Key | Purpose |
|------|-----|---------|
| 1 | `step1_l_fase_filter` | Apply l_fase override rules. State resulting CS/M/PR constraints. |
| 2 | `step2_primary_weakness` | Identify worst SG band using sg_profile + app_granular. Cite TrackMan evidence. |
| 3 | `step3_morad_fault` | Map SG band to MORAD fault and P-position. |
| 4 | `step4_drill_match` | Select drill(s). State CS, M-level, PR-level, volume. |
| 5 | `step5_pyramid_check` | Validate pyramid_adjustment against l_fase + period rules. |

### OutputObject

#### recommendations[] — ordered by priority

| Field | Type | Description |
|-------|------|-------------|
| `priority` | 1–3 | Ranking: 1 = primary, 2 = supporting, 3 = contextual |
| `type` | string | `primary_weakness`, `supporting`, `contextual` |
| `sg_band` | string | Weakest SG band being addressed |
| `fault` | string\|null | MORAD fault (null for putting — no MORAD mapping) |
| `p_position` | string\|null | Swing position where fault occurs (e.g. `P7.0`) |
| `p_target_metric` | object | Measurable target values for the P-position fix |
| `drill` | string | Primary drill name (snake_case) |
| `drill_secondary` | string\|null | Optional secondary drill |
| `volume` | object | `{sessions, balls, reps, cs, env, pr}` |
| `expected_sg_gain` | string | Gain range in SG units (e.g. `"+0.25-0.40"`) |
| `expected_weeks` | string | Timeframe to expected gain (e.g. `"3-4"`) |
| `why` | string | Plain-language rationale shown to coach/player |
| `pyramid_area` | string | Which pyramid pillars are targeted |

#### session_formula

Format: `{DOMAIN}_{FOCUS}_{L_FASE}_{CS}{LEVEL}_{ENV}_{PR}` — optionally suffixed with period or special conditions.

Example: `TEK_APP_L-BALL_CS70_M3_PR2`

#### pyramid_adjustment

Target pyramid allocation summing to 100. Keys: `fys`, `tek`, `slag`, `spill`, `turn`.

---

## Invariants Every Example Must Respect

### L-FASE Overrides (highest priority — override SG data)

| L-FASE | SG Weight | Max SG Recs | TEK % | CS | Env | PR |
|--------|-----------|-------------|-------|----|-----|----|
| L-KROPP | LOW | 1 | 60–80 | 20–40 | M0–M1 | PR1 |
| L-ARM | LOW | 1 | 50–70 | 20–50 | M1–M2 | PR1 |
| L-KØLLE | MEDIUM | 2 | 40–60 | 50–70 | M2–M3 | PR2 |
| L-BALL | HIGH | 3 | 30–50 | 60–80 | M3–M4 | PR2–PR3 |
| L-AUTO | HIGH | 3 | 20–40 | 80–100 | M4–M5 | PR3–PR4 |

### Period Rules

| Period | Pyramid emphasis |
|--------|-----------------|
| GRUNN | FYS ↑, TEK ↑, SPILL ↓, TURN ↓ |
| SPESIALISERING | SLAG ↑, TEK maintained, moderate SPILL |
| TURNERING | SPILL ↑, TURN ↑, FYS ↓, TEK ↓ |

### Readiness Rules

| Readiness | Volume adjustment |
|-----------|------------------|
| 0.9+ | Full or elevated volume |
| 0.7–0.89 | Standard volume |
| 0.5–0.69 | Reduce sessions by 1, halve balls, lower PR by 1 |
| ≤0.5 | Minimum viable: 1 session/week, no ball, PR1 |

### MORAD Fault → Drill Mappings

| Fault | Primary Drill | Secondary Drill |
|-------|--------------|-----------------|
| over_the_top | three_momentum_transfer | hip_lead_drill |
| left_elbow_stall | left_elbow_adduction | humeral_scapula_activation |
| incorrect_elbow_position | knock_down_shot | left_elbow_adduction |
| poor_spine_alignment | spine_alignment_setup | — |
| angle_loss_backswing | right_arm_angle_maintenance | — |
| improper_weight_transfer | three_momentum_transfer | — |
| early_extension | hip_lead_drill | spine_alignment_setup |
| casting | lag_retention_drill | pump_drill |
| insufficient_shoulder_turn | three_momentum_transfer | — |
| flat_shoulder_plane | spine_alignment_setup | shoulder_tilt_drill |

### SG → MORAD Fault Mappings

| SG Area | Candidate Faults |
|---------|-----------------|
| OTT | over_the_top, casting, insufficient_shoulder_turn, flat_shoulder_plane, early_extension |
| APP | incorrect_elbow_position, angle_loss_backswing, poor_spine_alignment, left_elbow_stall, improper_weight_transfer |
| ARG | poor_spine_alignment, casting |
| PUTT | *(no MORAD fault — use putting-specific drills)* |

### Category → CS Mapping

| Category | Handicap | Default CS |
|----------|---------|-----------|
| A | 54+ | 20 |
| B | 45–54 | 20–30 |
| C | 36–44 | 30–40 |
| D | 28–35 | 40–50 |
| E | 22–27 | 50–60 |
| F | 17–21 | 55–65 |
| G | 12–16 | 65–75 |
| H | 8–11 | 70–80 |
| I | 4–7 | 75–85 |
| J | 0–3 | 80–90 |
| K | +4+ | 90–100 |

---

## New examples ex-028 … ex-055 (28 lines)

| Gruppe | IDs | Dekning |
|--------|-----|---------|
| Video+TrackMan fusion | ex-028 … ex-032 | 5× syntetisk video + face_to_path fusion |
| Turneringsuke | ex-033 … ex-037 | 5× PERIOD_SWITCH + mental/spill |
| Junior-guard | ex-038 … ex-042 | 5× under 16, volum-cap |
| Granulær APP | ex-043 … ex-047 | 5× ett bånd hver (200+ … <50) |
| Lav readiness | ex-048 … ex-051 | 4× readiness ≤0.5, PR1 |
| Negativ/feil-case | ex-052 … ex-055 | 4× hva systemet IKKE skal anbefale |

Negativ-case output inkluderer `negative_case: true`, tom `recommendations[]`, og `should_not_recommend[]`.

## Diversity Coverage (55 examples)

| Dimension | Requirement | Achieved |
|-----------|------------|---------|
| L-KROPP | ≥2 | 3 (ex-002, 003, 018) |
| L-ARM | ≥1 | 2 (ex-004, 023) |
| L-KØLLE | ≥2 | 4 (ex-005, 006, 021, 026) |
| L-BALL | ≥5 | 11 (ex-001, 007, 008, 012–016, 019, 025, 027) |
| L-AUTO | ≥3 | 7 (ex-009–011, 017, 020, 022, 024) |
| All 5 APP bands as primary | ✓ | <50 (×6), 50-100 (×3), 100-150 (×2), 150-200 (×3), 200+ (×2) |
| OTT primary | ≥2 | 5 (ex-005, 008, 012, 016, 026) |
| ARG primary | ≥1 | 3 (ex-010, 017, 020) |
| PUTT primary | ≥1 | 3 (ex-009, 011, 024) |
| Low readiness (≤0.5) | ≥1 | 2 (ex-003, 014) |
| GRUNN period | ≥3 | 11 |
| SPESIALISERING period | ≥3 | 10 |
| TURNERING period | ≥3 | 6 |
| Beginner categories A–C | ≥2 | 5 (ex-002, 003, 004, 018, 023) |
| Elite categories H–K | ≥3 | 11 (ex-007, 009–013, 017, 019, 020, 022, 024) |
| All 10 MORAD faults covered | ✓ | All 10 appear as primary or secondary fault |

---

## How to Use These Examples

### As Fine-Tuning Data

Load into your training pipeline as JSONL. Each line is an independent example. The `reasoning` object is the chain-of-thought target; `output` is the structured prediction target.

```python
import json

with open("coaching-recommendations.jsonl") as f:
    examples = [json.loads(line) for line in f if line.strip()]
```

### As Prompt Engineering Templates

Use `reasoning` steps as few-shot examples in system prompts. Demonstrate the 5-step chain to the model before asking it to generate new recommendations.

### As Evaluation Fixtures

Compare model outputs against `output.recommendations` using:
- Fault identification accuracy (does model pick correct MORAD fault?)
- Drill selection correctness (matches fault→drill table?)
- Volume compliance (cs/pr/env within l_fase bounds?)
- Pyramid constraint satisfaction (sums to 100, matches period rules?)

### Invariant Validation Script

```python
def validate_example(ex):
    player = ex["input"]["player"]
    l_fase = player["l_fase"]
    readiness = player["readiness"]
    recs = ex["output"]["recommendations"]
    pyramid = ex["output"]["pyramid_adjustment"]

    # Pyramid must sum to 100
    assert sum(pyramid.values()) == 100, f"{ex['id']}: pyramid != 100"

    # L-KROPP/L-ARM: max 1 recommendation
    if l_fase in ("L-KROPP", "L-ARM"):
        assert len(recs) <= 1, f"{ex['id']}: too many recs for {l_fase}"

    # Low readiness: PR must be PR1
    if readiness <= 0.5:
        for r in recs:
            pr = r["volume"].get("pr")
            assert pr in ("PR1", None), f"{ex['id']}: low readiness but PR={pr}"

    return True
```

---

## File Structure

```
training-data/
├── examples/
│   ├── coaching-recommendations.jsonl   ← 55 training examples
│   ├── live-coach-dialog.jsonl          ← 20 live dialog examples
│   └── README.md                        ← this file
└── eval/
    ├── holdout-15.jsonl                 ← 15 holdout cases (ho-001 … ho-015)
    └── RUBRIC.md                        ← scoring rubric
```
