# Eksekveringsplan — Design alle PlayerHQ + CoachHQ-skjermer

> Komplett plan for å designe 73 skjermer i Claude Design.
> Total estimat: 8-12 timer aktiv design-tid (eller 3-5 timer med 3 parallelle vinduer).

---

## Slik kjører du det

### Forberedelser (5 min)

1. Åpne 3 Claude Design-vinduer (https://claude.ai/new med design-mode aktivert)
2. Ha åpne disse filene som referanse:
   - `docs/design-prompts/00-shared-spec.md` — limes øverst i HVER prompt
   - Aktuell fil-prompt (eks. `01-treningsplanlegger.md`)
3. Ha denne mappen åpen for å lagre HTML-output:
   - CoachHQ-skjermer → `docs/design-prompts/_outputs/coachhq/`
   - PlayerHQ-skjermer → `docs/design-prompts/_outputs/playerhq/`

### For hver skjerm

1. **Kopier prompt** — Start med hele `00-shared-spec.md`, deretter prompt-blokken fra aktuell fil
2. **Lim inn i Claude Design** og send
3. **Få HTML-output** med inline CSS (1 fil per skjerm)
4. **Lagre** som `XX-YYY-skjermnavn.html` i riktig output-mappe (se navngivning under)
5. **Marker som ferdig** i sjekkliste-tabellen nedenfor (rediger denne filen og endre `☐` til `✓`)
6. **Commit** etter hver sesjon: `git add docs/design-prompts/_outputs/ && git commit -m "design: sesjon N — X skjermer"`

### Navngivning

Format: `{fil}.{prompt}-{slug}.html`

Eksempler:
- `01.1-aarsplan.html` (fra 01-treningsplanlegger.md prompt 1.1)
- `04.2-krysstabell.html` (fra 04-treningsanalyse.md prompt 4.2)
- `08.5-foreldre.html` (fra 08-playerhq-meg.md prompt 8.5)

---

## 10 design-sesjoner

Hver sesjon: 7-8 sammenhengende skjermer. ~1-1,5 timer hver.
**Anbefaling:** Kjør 3 sesjoner parallelt i 3 ulike Claude Design-vinduer.

### SESJON 1 — Kjerneflater (5 skjermer, ~45 min)
**Start her — disse må fungere før resten gir mening.**

| # | Prompt | Skjerm | Område | Status |
|---|---|---|---|---|
| 1 | `04.2` | **Krysstabell** | CoachHQ-analyse | ☐ |
| 2 | `01.1` | Årsplan | CoachHQ-kalender | ☐ |
| 3 | `02.1` | Turneringskalender | CoachHQ-turnering | ☐ |
| 4 | `03.1` | Live session aktiv | PlayerHQ-live | ☐ |
| 5 | `05.1` | Caddie chat | CoachHQ-admin | ☐ |

**Output:** 5 HTML-filer. Få Anders' OK før du fortsetter.

---

### SESJON 2 — Treningsplanlegger kjerne (7 skjermer, ~1t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `01.2` | Månedsplan | ☐ |
| 2 | `01.3` | Ukeplan | ☐ |
| 3 | `01.4` | Dagsplan | ☐ |
| 4 | `01.5` | PeriodeModal | ☐ |
| 5 | `01.6` | VolumResept-editor | ☐ |
| 6 | `01.7` | Faste avtaler (LockedAnchor) | ☐ |
| 7 | `01.8` | Repeterende mønstre | ☐ |

---

### SESJON 3 — Treningsplanlegger detaljer (5 skjermer, ~45 min)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `01.9` | Betingelser (ConditionalRules) | ☐ |
| 2 | `01.10` | SessionEditor | ☐ |
| 3 | `01.11` | FysDrillEditor | ☐ |
| 4 | `01.12` | Mal-bibliotek | ☐ |
| 5 | `03.5` | Coach live-overvåkning | ☐ |

---

### SESJON 4 — Analyse (5 skjermer, ~45 min)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `04.1` | Analyse oversikt | ☐ |
| 2 | `04.3` | Trender | ☐ |
| 3 | `04.4` | SG-kobling | ☐ |
| 4 | `04.5` | FYS-progresjon | ☐ |
| 5 | `04.6` | Plan vs Faktisk | ☐ |

---

### SESJON 5 — Turneringer + Admin start (8 skjermer, ~1t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `02.2` | Turneringsdetalj | ☐ |
| 2 | `02.3` | A/B-vurdering | ☐ |
| 3 | `02.4` | WAGR-benchmark | ☐ |
| 4 | `05.2` | Sesjonsopptak (Whisper) | ☐ |
| 5 | `05.3` | Innstillinger | ☐ |
| 6 | `05.4` | Tilgang & roller | ☐ |
| 7 | `05.5` | MCP API-nøkler | ☐ |
| 8 | `05.6` | E-postmaler | ☐ |

---

### SESJON 6 — Admin slutt + Talent (8 skjermer, ~1t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `05.7` | Integrasjoner | ☐ |
| 2 | `05.8` | Innboks | ☐ |
| 3 | `05.9` | AI-agenter | ☐ |
| 4 | `06.1` | Talent-oversikt | ☐ |
| 5 | `06.2` | Talent-spillerprofil | ☐ |
| 6 | `06.3` | WAGR-import | ☐ |
| 7 | `06.4` | Lag-snitt | ☐ |
| 8 | `06.5` | Rapporter | ☐ |

---

### SESJON 7 — PlayerHQ Coach (8 skjermer, ~1t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `07.1` | Coach-oversikt | ☐ |
| 2 | `07.2` | Planer-liste | ☐ |
| 3 | `07.3` | Plan-detalj | ☐ |
| 4 | `07.4` | Plan-godkjenning | ☐ |
| 5 | `07.5` | Meldinger | ☐ |
| 6 | `07.6` | Notater | ☐ |
| 7 | `07.7` | Videoer | ☐ |
| 8 | `07.8` | AI-coach | ☐ |

---

### SESJON 8 — PlayerHQ Meg (10 skjermer, ~1,5t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `08.1` | Min profil | ☐ |
| 2 | `08.2` | Abonnement | ☐ |
| 3 | `08.3` | Mine bookinger | ☐ |
| 4 | `08.4` | Reschedule | ☐ |
| 5 | `08.5` | Foreldre-tilknytting | ☐ |
| 6 | `08.6` | Helse-logg | ☐ |
| 7 | `08.7` | Dokumenter | ☐ |
| 8 | `08.8` | Min utstyrsbag | ☐ |
| 9 | `08.9` | Innstillinger | ☐ |
| 10 | `08.10` | Sikkerhet | ☐ |

---

### SESJON 9 — PlayerHQ Tren/Mål (9 skjermer, ~1,5t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `09.1` | Trening-oversikt | ☐ |
| 2 | `09.2` | Årsplan (player) | ☐ |
| 3 | `09.3` | Turneringer (player) | ☐ |
| 4 | `09.4` | Øvelser-bibliotek | ☐ |
| 5 | `09.5` | Øvelse-detalj | ☐ |
| 6 | `09.6` | SG-statistikk | ☐ |
| 7 | `09.7` | Leaderboard | ☐ |
| 8 | `09.8` | Milepæler | ☐ |
| 9 | `09.9` | Mål-detalj | ☐ |

---

### SESJON 10 — Live + Sosial (8 skjermer, ~1t)

| # | Prompt | Skjerm | Status |
|---|---|---|---|
| 1 | `03.2` | Live pause/avbryt | ☐ |
| 2 | `03.3` | Live oppsummering | ☐ |
| 3 | `03.4` | Live animasjon (godkjent/bommet) | ☐ |
| 4 | `10.1` | Utfordringer-oversikt | ☐ |
| 5 | `10.2` | Utfordring-detalj | ☐ |
| 6 | `10.3` | Ny utfordring | ☐ |
| 7 | `10.4` | Achievements | ☐ |
| 8 | `10.5` | Varsler | ☐ |

---

## Sammendrag

| Område | Antall | Sesjoner |
|---|---|---|
| **CoachHQ** | 47 | 1, 2, 3, 4, 5, 6 |
| **PlayerHQ** | 26 | 1 (delvis), 7, 8, 9, 10 |
| **Total** | **73** | **10 sesjoner** |

## Tidsestimat

| Modus | Total tid |
|---|---|
| Sekvensiell (1 Claude Design-vindu) | 10-13 timer |
| Parallell (3 vinduer) | 3-5 timer aktiv tid |
| Spredt over uke (1 sesjon/dag) | 10 dager |

## Parallell-strategi (3 vinduer)

**Dag 1 — Foundation (2-3 timer):**
- Vindu A: Sesjon 1 (kjerneflater)
- Vindu B: Sesjon 2 (treningsplanlegger kjerne)
- Vindu C: Sesjon 7 (PlayerHQ Coach)

**Dag 2 — Detaljer (2-3 timer):**
- Vindu A: Sesjon 3 (treningsplanlegger detaljer)
- Vindu B: Sesjon 4 (analyse)
- Vindu C: Sesjon 8 (PlayerHQ Meg)

**Dag 3 — Resten (2-3 timer):**
- Vindu A: Sesjon 5 (turneringer + admin)
- Vindu B: Sesjon 6 (admin slutt + talent)
- Vindu C: Sesjon 9 (PlayerHQ Tren/Mål)

**Dag 4 — Polish:**
- Vindu A: Sesjon 10 (live + sosial)
- Resten av tiden: review + iterere på skjermer som ikke ble bra første gang

---

## Etter design er ferdig

### 1. Verifisering
Bla gjennom alle HTML-filene som batch. Anders vurderer hver:
- ✅ Godkjent — klar for implementering
- 🔄 Iterer — be Claude Design om revisjon
- ❌ Start på nytt — prompt må forbedres

### 2. Implementering
For hver godkjent HTML:

```
Implementer skjermen fra
`docs/design-prompts/_outputs/coachhq/04.2-krysstabell.html`
i `src/app/admin/analyse/page.tsx?view=krysstabell`.

Bruk eksisterende komponenter fra
`src/components/analyse/AnalyseKrysstabell.tsx` der relevant —
denne komponenten finnes allerede (Masterplan B4).

Auth: canAccessMissionControl()
```

Dette kan delegeres til Claude Code-agenter parallelt — ~5-10 implementerings-agenter samtidig.

### 3. Final-review
- Visuell konsistens på tvers av alle skjermer (samme fonter, samme spacing, samme tone)
- E2E-test av kritiske flyter (booking, live session, plan-godkjenning)
- Mobile responsive sjekk

---

## Sjekkliste — du er ferdig når…

- [ ] Alle 73 ☐ over er ✓
- [ ] Alle HTML-filer lagret i riktig output-mappe
- [ ] Commit etter hver sesjon
- [ ] Anders har godkjent visuelt
- [ ] README oppdatert med "designet" status per skjerm
- [ ] Implementerings-fase startet (egen flyt)

## Logg

Når du fullfører en sesjon, legg en linje her med dato + sesjon-nummer + antall skjermer + notater:

- _Eksempel: 2026-05-17 — Sesjon 1 ferdig (5 skjermer). Krysstabell trengte 2 forsøk._
