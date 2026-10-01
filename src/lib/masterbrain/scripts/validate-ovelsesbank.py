#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validerer at godkjente driller, øvelser og tester følger AK Golf HQ sin
AK-formel v2. Kandidater valideres ikke som fasit; bare `ovelsesbank/godkjent/`
kan brukes av agenter.

Kjør fra repo-rota: python3 scripts/validate-ovelsesbank.py
"""

import json
import os
import sys

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def les_json(sti):
    with open(os.path.join(ROT, sti), encoding="utf-8") as f:
        return json.load(f)


AK_FORMEL = les_json("knowledge/concepts/treningsomrader-ak-formel-v2.json")
CANON = les_json("knowledge/concepts/canon-methodology.json")

AREA_CODES = {area["code"] for area in AK_FORMEL["areas"]}
AXES = AK_FORMEL["axes"]
PYRAMID_CODES = set(AXES["pyramid_codes"])
CATEGORY_CODES = set(CANON["categories"].keys())
MOTORIKK_CODES = set(AXES["motorikk_codes"])
DIMENSJON_CODES = set(AXES["dimensjon_codes"])
BELASTNING_CODES = set(AXES["belastning_codes"])
PRESS_CODES = set(AXES["press_codes"])
MAALEUTSTYR_CODES = set(AXES["maaleutstyr_codes"])
TRENINGSTYPE_CODES = set(AXES["treningstype_codes"])
ENVIRONMENT_CODES = set(AXES["environment_codes"])
FACILITY_REQUIREMENT_CODES = set(AXES["facility_requirement_codes"])
SAND_TRINN_CODES = set(AXES["sand_trinn_codes"])
ITEM_TYPES = {"DRILL", "OVELSE", "TEST"}
AREA_FAMILY = {area["code"]: area["family"] for area in AK_FORMEL["areas"]}


def feil(errors, path, melding):
    errors.append(f"{path}: {melding}")


def iter_items():
    root = os.path.join(ROT, "ovelsesbank/godkjent")
    for dirpath, _, filenames in os.walk(root):
        for filename in sorted(filenames):
            if not filename.endswith(".json"):
                continue
            path = os.path.join(dirpath, filename)
            rel = os.path.relpath(path, ROT)
            data = les_json(rel)
            if isinstance(data, list):
                items = data
            else:
                items = data.get("items", data.get("drills", data.get("tests", [])))
            for index, item in enumerate(items):
                yield rel, index, item


def validate_item(rel, index, item, seen_ids, seen_names):
    errors = []
    path = f"{rel}[{index}]"

    for key in (
        "id",
        "type",
        "navn",
        "beskrivelse",
        "kilde",
        "status",
        "godkjentAv",
        "godkjentDato",
        "minKategori",
        "maxKategori",
        "environment",
        "fasilitetKrav",
        "treningstype",
        "akFormel",
        "facilityRequirements",
    ):
        if key not in item:
            feil(errors, path, f"mangler `{key}`")

    item_id = item.get("id")
    if item_id:
        if item_id in seen_ids:
            feil(errors, path, f"duplikat id `{item_id}`")
        seen_ids.add(item_id)
        if not all(c.islower() or c.isdigit() or c == "-" for c in item_id):
            feil(errors, path, "`id` skal være kebab-case med små bokstaver")

    name = item.get("navn")
    if name:
        key = name.strip().lower()
        if key in seen_names:
            feil(errors, path, f"duplikat navn `{name}`")
        seen_names.add(key)

    if item.get("type") not in ITEM_TYPES:
        feil(errors, path, "`type` må være DRILL, OVELSE eller TEST")
    if item.get("status") != "GODKJENT":
        feil(errors, path, "`status` må være GODKJENT")
    if item.get("godkjentAv") != "Anders Kristiansen":
        feil(errors, path, "`godkjentAv` må være Anders Kristiansen")
    if item.get("minKategori") not in CATEGORY_CODES:
        feil(errors, path, "`minKategori` må være A-K etter v2-skalaen")
    if item.get("maxKategori") not in CATEGORY_CODES:
        feil(errors, path, "`maxKategori` må være A-K etter v2-skalaen")
    if not item.get("kilde"):
        feil(errors, path, "`kilde` er obligatorisk")
    if item.get("treningstype") not in TRENINGSTYPE_CODES:
        feil(errors, path, "`treningstype` må matche AK Golf HQ DrillPracticeType")

    environment = item.get("environment")
    if not isinstance(environment, list) or len(environment) == 0:
        feil(errors, path, "`environment` må være en ikke-tom liste")
    else:
        for env in environment:
            if env not in ENVIRONMENT_CODES:
                feil(errors, path, f"`environment` har ugyldig verdi `{env}`")

    fasilitet_krav = item.get("fasilitetKrav")
    if not isinstance(fasilitet_krav, list):
        feil(errors, path, "`fasilitetKrav` må være en liste")
    else:
        for krav in fasilitet_krav:
            if krav not in FACILITY_REQUIREMENT_CODES:
                feil(errors, path, f"`fasilitetKrav` har ugyldig verdi `{krav}`")

    formel = item.get("akFormel") or {}
    if not isinstance(formel, dict):
        feil(errors, path, "`akFormel` må være objekt")
        return errors

    if formel.get("pyramidArea") not in PYRAMID_CODES:
        feil(errors, path, "`akFormel.pyramidArea` må være FYS, TEK, SLAG, SPILL eller TURN")
    if formel.get("omraade") not in AREA_CODES:
        feil(errors, path, "`akFormel.omraade` må være en av AK-formel v2 sine 19 områdekoder")
    if formel.get("belastning") not in BELASTNING_CODES:
        feil(errors, path, "`akFormel.belastning` er ugyldig")
    if formel.get("press") not in PRESS_CODES:
        feil(errors, path, "`akFormel.press` er ugyldig")
    if formel.get("maaleutstyr") not in MAALEUTSTYR_CODES:
        feil(errors, path, "`akFormel.maaleutstyr` er ugyldig")

    motorikk = formel.get("motorikk")
    dimensjon = formel.get("dimensjon")
    omraade = formel.get("omraade")
    family = AREA_FAMILY.get(omraade)
    if family == "FULLSVING" and motorikk is None:
        feil(errors, path, "fullsving må ha `akFormel.motorikk`")
    if family != "FULLSVING" and motorikk is not None:
        feil(errors, path, "`akFormel.motorikk` gjelder kun fullsving")
    if family not in {"FYS"} and dimensjon is None:
        feil(errors, path, "`akFormel.dimensjon` er obligatorisk utenom FYS")
    if family == "FYS" and dimensjon is not None:
        feil(errors, path, "FYS skal ikke ha `akFormel.dimensjon`")
    if motorikk is not None and motorikk not in MOTORIKK_CODES:
        feil(errors, path, "`akFormel.motorikk` er ugyldig")
    if dimensjon is not None and dimensjon not in DIMENSJON_CODES:
        feil(errors, path, "`akFormel.dimensjon` er ugyldig")
    sand_trinn = formel.get("sandTrinn")
    if omraade == "BUNKER" and sand_trinn not in SAND_TRINN_CODES:
        feil(errors, path, "BUNKER må ha `akFormel.sandTrinn`")
    if omraade != "BUNKER" and sand_trinn is not None:
        feil(errors, path, "`akFormel.sandTrinn` gjelder kun BUNKER")

    facility = item.get("facilityRequirements") or {}
    if not isinstance(facility, dict):
        feil(errors, path, "`facilityRequirements` må være objekt")
        return errors
    longest = facility.get("longestShotM")
    minimum_length = facility.get("minimumFacilityLengthM")
    kind = facility.get("longestShotKind")
    if not isinstance(longest, (int, float)) or longest < 0:
        feil(errors, path, "`facilityRequirements.longestShotM` må være tall >= 0")
    if not isinstance(minimum_length, (int, float)) or minimum_length < 0:
        feil(errors, path, "`facilityRequirements.minimumFacilityLengthM` må være tall >= 0")
    if isinstance(longest, (int, float)) and isinstance(minimum_length, (int, float)):
        if minimum_length < longest:
            feil(errors, path, "`minimumFacilityLengthM` kan ikke være kortere enn `longestShotM`")
    if kind not in {"NONE", "CARRY", "TOTAL", "PUTT_ROLL", "CHIP_ROLL", "THROW", "RUN", "OTHER"}:
        feil(errors, path, "`facilityRequirements.longestShotKind` er ugyldig")
    if kind == "NONE" and longest != 0:
        feil(errors, path, "`longestShotKind: NONE` krever `longestShotM: 0`")
    if kind != "NONE" and longest == 0:
        feil(errors, path, "`longestShotM` må være > 0 når øvelsen har slag/rull/kast")
    if formel.get("maaleutstyr") in {"TRACKMAN", "FLIGHTSCOPE", "GARMIN_R10", "MEVO_PLUS"}:
        if not isinstance(fasilitet_krav, list) or "RADAR" not in fasilitet_krav:
            feil(errors, path, "måleutstyr med radar krever `RADAR` i fasilitetKrav")

    return errors


def main():
    errors = []
    seen_ids = set()
    seen_names = set()
    count = 0

    for rel, index, item in iter_items():
        count += 1
        errors.extend(validate_item(rel, index, item, seen_ids, seen_names))

    if errors:
        print("STOPP: øvelsesbanken har ugyldige godkjente elementer.")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Øvelsesbank OK: {count} godkjente elementer validert.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
