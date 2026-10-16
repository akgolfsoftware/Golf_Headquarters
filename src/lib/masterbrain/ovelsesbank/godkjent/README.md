# Godkjent øvelsesbank

Dette er fasit for driller, øvelser og tester som agenter kan bruke.

Regler:

- Bare Anders Kristiansen kan godkjenne.
- Alle elementer må ha `status: "GODKJENT"`.
- Alle elementer må ha AK-formel v2 fra `knowledge/concepts/treningsomrader-ak-formel-v2.json`.
- Alle elementer må ha `facilityRequirements.longestShotM`, slik at appen kan matche mot faktisk fasilitet.
- Gyldige `omraade`-verdier er appens 19 områdekoder, ikke den gamle 17-listen.
- Kategori er A-K: A = verdensklasse, K = nybegynner, basert på brutto score.
- Kandidater med `L` eller gamle områdekoder kan ikke flyttes hit.

Minimumsform:

```json
{
  "id": "kort-putt-startlinje-tee-gate",
  "type": "DRILL",
  "navn": "Kort putt startlinje tee-gate",
  "beskrivelse": "Sett to tees som gate foran ballen og tren startlinje på korte putter.",
  "kilde": "ak-second-brain:ak-golf-treningsfilosofi",
  "status": "GODKJENT",
  "godkjentAv": "Anders Kristiansen",
  "godkjentDato": "2026-09-26",
  "minKategori": "A",
  "maxKategori": "K",
  "environment": ["RANGE"],
  "fasilitetKrav": ["PUTTING_GREEN_KORT"],
  "treningstype": "BLOKK",
  "akFormel": {
    "pyramidArea": "SLAG",
    "omraade": "PUTT_0_3",
    "dimensjon": "BALLSTART",
    "belastning": "TRENINGSOMRAADE",
    "press": "ALENE",
    "maaleutstyr": "UTEN"
  },
  "facilityRequirements": {
    "longestShotM": 1,
    "longestShotKind": "PUTT_ROLL",
    "minimumFacilityLengthM": 2,
    "minimumCeilingHeightM": null,
    "surface": "PUTTING_GREEN"
  }
}
```

Validering:

```bash
python3 scripts/validate-ovelsesbank.py
```
