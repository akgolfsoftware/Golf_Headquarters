#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
eval-holdout.py — scorer de 15 holdout-casene mot rubrikken i
training-data/eval/RUBRIC.md.

HVA DENNE MÅLER: om fasiten i knowledge/ inneholder det som trengs for å
produsere forventet svar. Den kjører ingen språkmodell. En grønn score betyr
«kunnskapen finnes og er entydig», ikke «agenten svarte riktig».

Kjør fra repo-rota:  python3 scripts/eval-holdout.py
"""

import json
import os
import sys

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def les(sti):
    with open(os.path.join(ROT, sti), encoding="utf-8") as f:
        return json.load(f) if sti.endswith(".json") else f.read()


CANON = les("knowledge/concepts/canon-methodology.json")
SG = les("knowledge/concepts/sg-principles.json")
FAULTS = les("knowledge/entities/faults.json")
DRILLS = les("knowledge/entities/drills.json")
POSISJONER = les("knowledge/entities/positions.json")
TRENINGSOMRADER = les("knowledge/concepts/treningsomrader-ak-formel-v2.json")

INVARIANTER = {i["id"]: i for i in CANON["invariants"]}
BAND = SG["app_band_faults"]


def validate_rag_index():
    indexed = {row["file_path"] for row in les("rag-corpus/index.json")}
    on_disk = set()
    rag_root = os.path.join(ROT, "rag-corpus")
    for dirpath, _, filenames in os.walk(rag_root):
        for filename in filenames:
            if filename.endswith(".md"):
                path = os.path.join(dirpath, filename)
                on_disk.add(os.path.relpath(path, ROT))

    missing_on_disk = sorted(indexed - on_disk)
    not_indexed = sorted(on_disk - indexed)
    if missing_on_disk or not_indexed:
        print("STOPP: rag-corpus/index.json matcher ikke tekstfilene på disk.")
        if missing_on_disk:
            print("Indeksert, men mangler på disk:")
            for path in missing_on_disk:
                print(f"- {path}")
        if not_indexed:
            print("På disk, men ikke i indeks:")
            for path in not_indexed:
                print(f"- {path}")
        return False
    return True


def validate_category_scale():
    categories = CANON["categories"]
    a = categories.get("A", {})
    k = categories.get("K", {})
    if a.get("brutto_score_average") != "under 68" or k.get("brutto_score_average") != "100+":
        print("STOPP: A-K-skalaen matcher ikke v2-fasiten.")
        print("Forventet: A = verdensklasse / under 68, K = nybegynner / 100+.")
        return False
    return True


def validate_period_scale():
    expected = {"GRUNN", "SPESIALISERING", "TURNERING", "EVALUERING"}
    actual = set(CANON["periods"].keys())
    if actual != expected:
        print("STOPP: CANON-periodene matcher ikke v2-fasiten.")
        print(f"Forventet: {', '.join(sorted(expected))}")
        print(f"Fant: {', '.join(sorted(actual))}")
        return False
    return True


def validate_training_areas():
    expected = [
        "TEE_TOTAL",
        "INNSPILL_200",
        "INNSPILL_150",
        "INNSPILL_100",
        "INNSPILL_50",
        "CHIP",
        "PITCH",
        "LOB",
        "BUNKER",
        "PUTT_0_3",
        "PUTT_3_5",
        "PUTT_5_10",
        "PUTT_10_25",
        "PUTT_25_40",
        "PUTT_40_PLUSS",
        "STYRKE",
        "KONDISJON",
        "BEVEGELIGHET",
        "BANE",
    ]
    areas = TRENINGSOMRADER["areas"]
    actual = [area["code"] for area in areas]
    if actual != expected:
        print("STOPP: treningsområder matcher ikke AK Golf HQ sin AK-formel v2.")
        print(f"Forventet: {', '.join(expected)}")
        print(f"Fant: {', '.join(actual)}")
        return False
    for area in areas:
        code = area["code"]
        unit = area.get("unit")
        if code.startswith("PUTT_") and unit != "ft":
            print(f"STOPP: {code} skal bruke ft, fant {unit}.")
            return False
        if code.startswith("INNSPILL_") and unit != "m":
            print(f"STOPP: {code} skal bruke m, fant {unit}.")
            return False
        if code in {"TEE_TOTAL", "CHIP", "PITCH", "LOB", "BUNKER"} and unit != "m":
            print(f"STOPP: {code} skal bruke m, fant {unit}.")
            return False
        if code in {"STYRKE", "KONDISJON", "BEVEGELIGHET", "BANE"} and unit is not None:
            print(f"STOPP: {code} skal ikke ha avstandsenhet, fant {unit}.")
            return False
    return True


def score_pyramid_sum(case):
    sum_ok = sum(v["default_percent"] for v in CANON["pyramid_defaults"].values()) == 100
    if not sum_ok or "inv_5" not in INVARIANTER:
        return 0, "pyramide summerer ikke til 100 i fasiten"
    e = case["expected"]
    krav = [k for k in e if k.startswith("pyramid_") or k.endswith("_percent_max") or k.endswith("_percent_min")]
    for k in krav:
        if k == "pyramid_sum":
            continue
        if not CANON.get("pyramid_rules"):
            return 3, f"{k} kan ikke utledes — pyramid_rules mangler"
    return 5, "pyramid_defaults=100, inv_5 blocking, pyramid_rules finnes"


def score_l_fase(case):
    fase = case["input"].get("player", {}).get("l_fase")
    if fase is None:
        return 5, "ingen L-fase i input — ingen regel å bryte"
    f = CANON["l_faser"].get(fase)
    if not f:
        return 0, f"{fase} finnes ikke i canon"
    mangler = [k for k in ("cs_range", "env_range", "tek_percent", "priority_override") if not f.get(k)]
    if mangler:
        return 3, f"{fase} mangler {', '.join(mangler)}"
    e = case["expected"]
    if "max_recommendations" in e and "inv_4" not in INVARIANTER:
        return 3, "anbefalingstak kan ikke forankres i invariant"
    if "weekly_hours_max" in e and "inv_3" not in INVARIANTER:
        return 3, "aldersregel mangler"
    if e.get("readiness_cap") and "inv_9" not in INVARIANTER:
        return 3, "readiness-regel mangler"
    return 5, f"{fase}: cs={f['cs_range']}, env={f['env_range']}, tek={f['tek_percent']}, override finnes"


def score_primary_weakness(case):
    e = case["expected"]
    forventet = e.get("primary_fault", e.get("fault"))
    if "primary_fault" not in e and "fault" not in e:
        return 5, "casen krever ingen feilkobling"
    if forventet is None:
        # putt skal gi null — korrekt oppførsel
        if SG["sg_to_morad_faults"].get("putt") == []:
            return 5, "putt gir korrekt ingen MORAD-feil"
        return 0, "putt burde gitt null, men har feil koblet"
    if forventet not in FAULTS["entities"]:
        return 0, f"{forventet} finnes ikke i faults.json"
    band = e.get("primary_sg_band")
    if band in BAND:
        if forventet in BAND[band]:
            return 5, f"bånd {band} → {forventet} (båndtabell, hypotese)"
        return 3, f"{forventet} definert, men ikke i båndtabellen for {band}"
    for omr, liste in SG["sg_to_morad_faults"].items():
        if forventet in liste:
            return 5, f"{forventet} er kandidat i {omr} (hypotese, ikke rangert)"
    return 3, f"{forventet} definert, men ikke koblet til noe SG-område"


def score_drill_exists(case):
    e = case["expected"]
    if not DRILLS["entities"]:
        if e.get("drill"):
            return 0, f"casen krever «{e['drill']}» — drill-banken er tom"
        return 0, "drill-banken er tom (bevisst) — dimensjonen kan ikke oppfylles"
    return 5, "drill funnet"


def score_confidence(case):
    r = SG["diagnostic_logic"]["confidence_rules"]
    if r["threshold_for_recommendation"] != 0.7 or "inv_7" not in INVARIANTER:
        return 0, "konfidensregel mangler"
    e = case["expected"]
    if "confidence_max" in e:
        if e["confidence_max"] <= 0.69 and r["below_threshold_display"] == "retningssignal":
            return 5, "retningssignal-regel dekker casen (inv_7)"
        return 3, "konfidenskrav delvis dekket"
    if not all("confidence" in b for b in SG["app_bands"]):
        return 3, "ikke alle APP-bånd har konfidens"
    return 5, "konfidens per bånd + terskel 0.70 + inv_7"


DIM = [
    ("pyramid_sum", score_pyramid_sum),
    ("l_fase_respect", score_l_fase),
    ("primary_weakness_correct", score_primary_weakness),
    ("drill_exists", score_drill_exists),
    ("confidence_honest", score_confidence),
]


def main():
    if not validate_rag_index():
        return 1
    if not validate_category_scale():
        return 1
    if not validate_period_scale():
        return 1
    if not validate_training_areas():
        return 1

    with open(os.path.join(ROT, "training-data/eval/holdout-15.jsonl"), encoding="utf-8") as f:
        caser = [json.loads(l) for l in f if l.strip()]
    assert len(caser) == 15, f"forventet 15 caser, fant {len(caser)}"

    rapport, totalsum, uten_drill_sum = [], 0, 0
    for c in caser:
        scores, notater = {}, []
        for navn, fn in DIM:
            p, hvorfor = fn(c)
            scores[navn] = p
            notater.append(f"{navn}={p} ({hvorfor})")
        tot = sum(scores.values())
        uten_drill = tot - scores["drill_exists"]
        totalsum += tot
        uten_drill_sum += uten_drill
        rapport.append({"case_id": c["id"], "scenario": c["scenario"], "scores": scores,
                        "total": tot, "uten_drill_dim": uten_drill, "notes": notater})

    print(f"{'case':9s} {'scenario':26s} {'pyr':4s}{'lfa':4s}{'fault':6s}{'drill':6s}{'konf':5s} {'sum':>6s} {'u/drill':>8s}")
    print("-" * 82)
    for r in rapport:
        s = r["scores"]
        print(f"{r['case_id']:9s} {r['scenario']:26s} "
              f"{s['pyramid_sum']:<4d}{s['l_fase_respect']:<4d}{s['primary_weakness_correct']:<6d}"
              f"{s['drill_exists']:<6d}{s['confidence_honest']:<5d} {r['total']:>4d}/25 {r['uten_drill_dim']:>6d}/20")

    n = len(rapport)
    print("-" * 82)
    print(f"Snitt: {totalsum/n:.2f}/25   |   uten drill_exists: {uten_drill_sum/n:.2f}/20")
    print(f"Caser ≥20/25 (ship-terskel): {sum(1 for r in rapport if r['total'] >= 20)}/{n}")
    print(f"Caser ≥15/20 uten drill-dimensjonen: {sum(1 for r in rapport if r['uten_drill_dim'] >= 15)}/{n}")
    blokkerende = [r["case_id"] for r in rapport
                   if r["scores"]["l_fase_respect"] == 0 or r["scores"]["pyramid_sum"] == 0]
    print(f"Blokkerende brudd (0 på l_fase_respect eller pyramid_sum): {blokkerende or 'ingen'}")

    ut = os.path.join(ROT, "training-data/eval/siste-kjoring.json")
    with open(ut, "w", encoding="utf-8") as f:
        json.dump(rapport, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"\nFull rapport: {os.path.relpath(ut, ROT)}")

    # Exit-kode, slik at CI faktisk stopper en endring som gjør fasiten dårligere.
    # drill_exists holdes utenfor terskelen: drill-banken er tom med vilje, så
    # den dimensjonen er 0 for alle caser inntil banken er bygget på nytt.
    under_terskel = [r["case_id"] for r in rapport if r["uten_drill_dim"] < 15]
    if blokkerende or under_terskel:
        if blokkerende:
            print(f"\nSTOPP: blokkerende brudd i {', '.join(blokkerende)}")
        if under_terskel:
            print(f"STOPP: under terskel 15/20 i {', '.join(under_terskel)}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
