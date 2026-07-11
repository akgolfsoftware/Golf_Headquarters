---
chunk_id: morad-009
tags: ["morad", "drill", "bank"]
topics: ["drill", "prescription"]
relevance: agent-rag
word_count: 120
---

# MORAD Drill Bank (kjerne)

| Drill | Pyramid | CS | Primære faults |
|-------|---------|-----|----------------|
| left_elbow_adduction | TEK | 20-80 | left_elbow_stall, incorrect_elbow_position |
| three_momentum_transfer | TEK | 30-90 | over_the_top, improper_weight_transfer |
| spine_alignment_setup | TEK | 20-80 | poor_spine_alignment, flat_shoulder_plane |
| knock_down_shot | TEK+SLAG | 50-80 | incorrect_elbow_position |
| right_arm_angle_maintenance | TEK | 40-90 | angle_loss_backswing |
| hip_lead_drill | TEK | 30-80 | early_extension, over_the_top |
| lag_retention_drill | SLAG | 40-90 | casting |
| pump_drill | TEK | 40-80 | casting |
| humeral_scapula_activation | TEK | 20-50 | left_elbow_stall |

## Valg-regel
1. Match fault → drill (morad-fault-drill-mapping)
2. Respekter L-fase CS/PR-cap
3. PUTT: gate_drill, distance_control — ingen MORAD-fault