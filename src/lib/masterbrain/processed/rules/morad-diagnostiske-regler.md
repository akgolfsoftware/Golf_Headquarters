---
title: MORAD diagnostiske regler
type: concept
concept_kind: framework
tags: [morad, mac-ogrady, diagnose, coaching]
created: 2026-05-10
updated: 2026-05-10
---

# MORAD diagnostiske regler

7 strukturerte diagnose-regler som mapper symptom → mest sannsynlig årsak → fix. Direkte ekstrahert fra MORAD-forelesningene. Brukes i AK Golf coaching som første-linje-diagnose før dypere svinganalyse.

## DR001: Inkonsistent kontakt i short game (thin, fat)

**Sannsynlig årsak**:
- Venstre kne-strekking
- Gripp for høyt
- Står for langt fra ballen

**Fix**: Verifiser [[left-knee-flexion]], gripp ned, juster avstand til ball.

## DR002: Tynne bunker-slag

**Sannsynlig årsak**: "Coming up" — venstre kne strekkes ut.

**Fix**: Hold venstre kne bøyd, oppretthold radius. Se [[control-the-radius]] og [[left-knee-flexion]].

## DR003: Driver-inkonsistens

**Sannsynlig årsak**: Hode "flashing" — hodet roterer med skuldrene.

**Fix**: Stabiliser hodet, la skuldrene rotere *under*. Mac-sitat: "Henrik Stenson on that picture, his shoulders are here in the finish, and his head is the opposite. That's why Henrik's always struggled with the driver."

## DR004: Klarer ikke konsistent draw

**Sannsynlig årsak**: Klubbpath går venstre etter impact.

**Fix**: Fortsett path innenfra etter impact, ikke gå venstre.

## DR005: Three Lines ikke korrekt ved finish

**Sannsynlig årsak**: Neck tilt feil.

**Fix**: Hodet må gå bakover og sideveis, rotere 45°. Se C001 (Three Lines) og C002 (Neck Tilt) i [[morad-konseptkatalog]].

## DR006: Hofterotasjon stopper tidlig (kun 45°)

**Sannsynlig årsak**: Neck tilt går venstre, flytter COG.

**Fix**: Tilt nakke 5° til høyre ved oppstilling.

## DR007: Høyre skulder for lav i follow-through

**Sannsynlig årsak**: Høyre kne dropper for lavt — drar hofte og skulder ned.

**Fix**: Hold høyre kne fra å droppe for lavt.

## Bruk i AK Golf coaching-økt

Når en spiller har et symptom i en økt:
1. Identifiser symptomet (matcher det DR001-DR007?)
2. Sjekk mest sannsynlig årsak først (Macs erfaring)
3. Hvis det ikke er årsaken, bruk diagnostisk kjede fra [[2026-01-29-morad-knowledge-graph]] (DC001, DC002, DC003)
4. Fix før du går videre

## Utvidet katalog (10 strukturerte regler, fra fault-drill-mapping)

I tillegg til DR001–DR007 finnes 10 strukturerte fault-regler.

**Drill-kolonnen er fjernet 31. juli 2026.** Drill-banken ble tømt og skal bygges
på nytt — se `knowledge/entities/drills.json`. Deteksjonen står, foreskrivningen
gjør det ikke.

| ID | Symptom | Deteksjon |
|---|---|---|
| over_the_top | Pull, slice, krafttap | P5.0: shoulder_rotation <20°, hip_rotation >20° |
| left_elbow_stall | Tap av armhastighet, dårlig lag | left_elbow_distance >8" fra body |
| incorrect_elbow_position | Kompressjons-tap, inkonsistent kontakt | P7.0: left_elbow_position ≠ 1 |
| poor_spine_alignment | Lav-trajectory, pulls | P1.0: spine_tilt >5° høyre |
| angle_loss_backswing | Klubbskaft wobbler ved topp | 110°-vinkel mellom høyrearm/skaft endres P2.0→P4.0 |
| improper_weight_transfer | Krafttap, dårlig kompresjon | hip_slide <4", weight venstre <70% |
| early_extension | Posture-tap, tynne/topped slag | hip_slide >6" mot ball, hip_rotation <30° |
| casting | Lag-tap, svak impact | P5.0: l_arm_til_clubshaft >60° |
| insufficient_shoulder_turn | Kort backswing, krafttap | P4.0: shoulder_rotation <80° |
| flat_shoulder_plane | Over-the-top tendens | shoulder_tilt <30° |

Disse er **kvantitativt deteksjonsbar** — direkte input til [[akhq-agent-system]] sin Signal-Skill-Agent-pipeline. Se [[2026-05-10-morad-som-akhq-moat]] for strategisk ramme.

## Relasjon til [[ak-golf-taksonomi]]

DR-reglene mapper til feil-kategorier:
- DR001/DR002 → SLAG-kategori CHIP, BUNKER, PUTT
- DR003 → SLAG-kategori TEE
- DR004 → spillemønster (kobling til Trackman path-data)
- DR005-DR007 → biomekaniske grunnfeil

## Relatert

- [[morad-konseptkatalog]]
- [[morad-drill-bibliotek]] — fixer per regel
- [[mac-ogrady]]

## Kilder

- [[2026-01-29-morad-knowledge-base-v1]]
- [[2026-01-29-morad-knowledge-graph]]
