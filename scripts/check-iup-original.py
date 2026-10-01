#!/usr/bin/env python3
"""Kontroller den inncheckede spørsmålskatalogen mot de to lokale originalene.

Leser bare det godkjente spørsmålsarket; eksporterer aldri elevsvar eller kontaktark.
Ingen avhengigheter utenom Python-standardbiblioteket. Endrer ingen filer.
"""

import argparse
import hashlib
import json
from pathlib import Path
import posixpath
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
VERSJONER = {
    "iup-2025": "25d4e7466697fd231ebf6fb511c44174ad27f0f06fe9374bbe0fec21b04d886e",
    "iup-2027": "6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222",
}
ARK = "9. Utviklingssjekk 5 Prosesser"
KATEGORIER = {"Sosial", "Mentalt", "Fysisk", "Strategisk", "Teknisk", "Golfutvikling", "Neste trinn"}
KOLONNER = [("UNG", "A", "C"), ("JUNIOR", "M", "O"), ("AMATOR", "Y", "AA"), ("PROFESJONELL", "AK", "AM")]


def les_sporsmal(fil: Path, versjon: str) -> dict:
    innhold = fil.read_bytes()
    if hashlib.sha256(innhold).hexdigest() != VERSJONER[versjon]:
        raise ValueError(f"{versjon}: originalens kontrollsum er endret. Ny kilde krever en egen vurdering.")
    with ZipFile(fil) as z:
        strenger = ["".join(t.itertext()) for t in ET.fromstring(z.read("xl/sharedStrings.xml"))]
        ark = ET.fromstring(z.read("xl/workbook.xml"))
        ark_id = next(s.attrib[REL_ID] for s in ark.findall("s:sheets/s:sheet", NS) if s.attrib["name"] == ARK)
        relasjoner = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        target = next(r.attrib["Target"] for r in relasjoner if r.attrib["Id"] == ark_id)
        sti = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
        celler = {}
        for celle in ET.fromstring(z.read(sti)).findall(".//s:sheetData/s:row/s:c", NS):
            verdi = celle.find("s:v", NS)
            if celle.attrib.get("t") == "s" and verdi is not None:
                celler[celle.attrib["r"]] = strenger[int(verdi.text)].strip()
            elif celle.attrib.get("t") == "inlineStr":
                celler[celle.attrib["r"]] = "".join(celle.find("s:is", NS).itertext()).strip()

    nivaaer = {}
    for niva, kategorikolonne, sporsmaalskolonne in KOLONNER:
        kategori = None
        sporsmal = []
        for rad in range(4, 100):
            etikett = celler.get(f"{kategorikolonne}{rad}")
            if etikett in KATEGORIER:
                kategori = etikett
            adresse = f"{sporsmaalskolonne}{rad}"
            tekst = celler.get(adresse, "")
            if not tekst or tekst in {"Spørsmål", "Spörsmål"}:
                continue
            if kategori is None:
                raise ValueError(f"{versjon}: spørsmål uten kjent kategori i {adresse}")
            sporsmal.append({"id": f"{versjon}-{niva.lower()}-{adresse.lower()}", "celle": adresse, "kategori": kategori, "tekst": tekst})
        nivaaer[niva] = sporsmal
    return nivaaer


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--iup-2025", required=True, type=Path)
    parser.add_argument("--iup-2027", required=True, type=Path)
    args = vars(parser.parse_args())
    katalogsti = Path(__file__).resolve().parent.parent / "src/lib/iup/utviklingssjekk-kilder.json"
    katalog = json.loads(katalogsti.read_text(encoding="utf-8"))
    try:
        for versjon, sha in VERSJONER.items():
            kilde = katalog[versjon]
            if kilde["sha256"] != sha or kilde["ark"] != ARK or kilde["skala"] != {"min": 1, "maks": 5}:
                raise ValueError(f"{versjon}: kildemetadata avviker")
            if les_sporsmal(args[versjon.replace("-", "_")], versjon) != kilde["nivaaer"]:
                raise ValueError(f"{versjon}: katalogen avviker fra originalens spørsmål, kategorier eller celler")
            antall = sum(len(s) for s in kilde["nivaaer"].values())
            print(f"OK: {versjon}, {antall} spørsmål identiske med originalfilen.")
    except (OSError, ValueError, KeyError, StopIteration):
        # Ingen originalinnhold eller private filstier i kontroll-loggen.
        print("IUP-kontrollen feilet: kontroller lokal original, kontrollsum og spørsmålskatalog.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
