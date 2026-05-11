# Design 2.0 — 14 selvstendige mini-batch-mapper

**Hver mappe inneholder ALT du trenger** — system-filer, fonter, spec, prompt, vedlegg. Cmd+A → drag → ferdig.

## Mappestruktur

```
design2.0/
├── 01-coachhq-A/   (31 filer)  ← CoachHQ Plan-management
├── 02-coachhq-B/   (31 filer)  ← CoachHQ Operative dashboards
├── 03-coachhq-C/   (31 filer)  ← CoachHQ Kalender + lister
├── 04-coachhq-D/   (28 filer)  ← CoachHQ Talent + Spiller-detalj
├── 05-playerhq-A/  (31 filer)  ← PlayerHQ Mål-data
├── 06-playerhq-B/  (31 filer)  ← PlayerHQ Coach-samhandling
├── 07-playerhq-C/  (31 filer)  ← PlayerHQ Wizards + kalender
├── 08-modal-A/     (33 filer)  ← Plan-modaler (7)
├── 09-modal-B/     (29 filer)  ← Live Session 2-4 (3)
├── 10-modal-C/     (30 filer)  ← Booking-modaler (4)
├── 11-modal-D/     (32 filer)  ← Round/Stats/Agent (6)
├── 12-modal-E/     (33 filer)  ← Social/Tier/Other (7)
├── 13-redesign-A/  (33 filer)  ← Live Session-flyten redesign (5)
└── 14-redesign-B/  (35 filer)  ← Agenter + pipeline redesign (5)
```

## Hva inneholder hver mappe

23 systemfiler (identisk i alle mapper):
- `branding-style-guide.html`
- `design-system-v2.md`
- `felles-instruks.md` ← KRITISK anti-state-katalog
- 20 .woff2-fonter (Inter, Inter Tight, JetBrains Mono)

Pluss batch-spesifikke filer:
- `spec.md` — konsolidert skjerm-spec
- `prompt.md` — custom prompt å kopiere inn
- `vedlegg.txt` — opplastings-instruks
- 5-7 HTML-filer (selve skjermene som skal designes)

For redesign-mappene (13, 14): én `prompt-N-{navn}.md` per skjerm, ikke samlet prompt.md.

---

## Slik kjører du én mini-batch (eks. 01-coachhq-A)

### Steg 1 — Last opp alle filer fra mappa

1. Åpne **`design2.0/01-coachhq-A/`** i Finder
2. **Cmd+A** for å markere alle filer
3. **Drag til Claude Design** sin opplastings-area
4. Vent til alle 31 filer er lastet (kan ta 30 sek)

### Steg 2 — Lim inn prompten

1. Åpne `prompt.md` på maskinen din (eller bruk fil-previewet i Claude Design)
2. Kopier **HELE PROMPT-blokken** (alt under `# PROMPT (kopier fra og med denne linja):`)
3. Lim inn som første melding i Claude Design
4. Send

### Steg 3 — Claude Design genererer

5 skjermer kommer i bulk (ingen "neste"-gating). Sjekk per skjerm:
- ÉN produksjons-skjerm (ikke state-katalog)
- Konkret innhold (Markus, Anders, 12,4, "Putte-økt")
- Norske tegn rendres korrekt
- Maks 3 lime-elementer

### Steg 4 — Lim design-link tilbake

For hver godkjent skjerm: kopier design-link og lim tilbake til Claude Code (meg). Jeg verifiserer og oppdaterer tracker.

---

## Anbefalt 7-dagers plan

| Dag | Mappe(r) | Skjermer |
|---|---|---|
| 1 | `01-coachhq-A` + `02-coachhq-B` | 10 |
| 2 | `03-coachhq-C` + `04-coachhq-D` | 7 |
| 3 | `05-playerhq-A` + `06-playerhq-B` | 10 |
| 4 | `07-playerhq-C` + `08-modal-A` | 12 |
| 5 | `09-modal-B` + `10-modal-C` | 7 |
| 6 | `11-modal-D` + `12-modal-E` | 13 |
| 7 | `13-redesign-A` + `14-redesign-B` | 10 |
| **TOTAL** | **14 mini-batches** | **69 skjermer** |

Hver mini-batch tar 30-60 min i Claude Design. **~13 timer over 7 dager.**

---

## Stop-condition

**Hvis `01-coachhq-A` leverer ≤ 3/5 rene produksjons-skjermer** (state-katalog dukker opp igjen):

Si fra umiddelbart. Vi bytter til **Plan B: direkte React-generering med Claude Code**. Sparer flere dager.

---

## Start nå

**Åpne `design2.0/01-coachhq-A/`** og dra alle 31 filer inn i Claude Design. Følg stegene over.
