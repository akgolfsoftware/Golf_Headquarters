# 02 — PUTTING BRAIN

**Prinsipp:** Putting er **sibling brain** til MORAD fullsving.  
**Forbudt:** mappe putting-feil til P1.0–P10.0.  
**Drills:** ingen putting-drills i `drills.json` før Anders validerer (se fase 3).

---

## 1. Kilder (kun det som finnes)

| Prioritet | Path | Bruk |
|-----------|------|------|
| 1 | `SOURCE/10 - KNOWLEDGE BASE/04 - DRILLS/PUTTING-METHODOLOGY.md` | Framework pillars |
| 2 | `SOURCE/.../EMAIL/.../PUTTING_Drills_1-300ft-Half-Decade-Mastery.md` | Distance program + 5 stages + speed→line |
| 3 | `SOURCE/.../EMAIL/.../PUTTING_Drills_1000-Putts-Dean-Martin-Heels-Together.md` | Volume protocol + heels-together feel (kandidat drill) |
| 4 | HQ `sg-principles.json` → category PUTT | SG kategori + tom `putt: []` map |
| 5 | HQ MANIFEST hull #2 | Bekrefter at putting mangler bevisst |

**Ikke funnet på SOURCE:** egen putting-fault-taxonomi, AimPoint/green-reading system, stroke-path grading, CS for putt.  
**Ikke finn på** det som mangler.

---

## 2. Foreslått fasit: `knowledge/concepts/putting-framework.json`

```json
{
  "id": "putting-framework",
  "version": "0.1.0",
  "status": "UTKAST — venter Anders-godkjenning før FASIT",
  "updated": "2026-08-07",
  "source": [
    "SOURCE/10 - KNOWLEDGE BASE/04 - DRILLS/PUTTING-METHODOLOGY.md",
    "SOURCE/05 - REFERENCE MATERIAL/05 - EMAIL CORRESPONDENCE/E-mail Mac O´Grady /PUTTING_Drills_1-300ft-Half-Decade-Mastery.md"
  ],
  "domain": "PUTTING",
  "sibling_of": "MORAD_FULLSWING",
  "morad_p_positions_apply": false,
  "agent_regel": "Putting diagnostiseres og trenes innenfor dette rammeverket. Bruk aldri P1–P10 for putting-feil.",
  "neurological_systems": [
    {
      "id": "brain_neurons",
      "location": "cerebellum",
      "function": "Pattern recognition, feel storage"
    },
    {
      "id": "motor_neurons",
      "location": "spinal cord",
      "function": "Movement coordination"
    },
    {
      "id": "peripheral_neurons",
      "location": "arms and legs",
      "function": "Sensory feedback, execution"
    }
  ],
  "mastery_timeline": {
    "quote": "To master it may take half a decade or longer.",
    "attribution": "Mac O'Grady",
    "process": ["code", "develop", "master"]
  },
  "pillars": [
    {
      "id": "speed_controls_line",
      "name": "Ball speed controls line",
      "name_no": "Ballhastighet styrer linjen",
      "principle": "Clubhead speed → ball speed → line. Line does not control speed.",
      "source_quote": "control the clubhead speed that's transferred into ball speed, that simply controls the line of the putt"
    },
    {
      "id": "distance_database",
      "name": "Cerebellum distance database",
      "name_no": "Avstandsdatabase i lillehjernen",
      "principle": "Hundreds of putts at every distance expand feel; do not skip distances."
    },
    {
      "id": "five_stages",
      "name": "Five stages of every putt",
      "name_no": "Fem steg per putt",
      "stages": [
        { "id": "read", "name_no": "Les", "en": "Read green slope, grain, speed" },
        { "id": "look", "name_no": "Se på", "en": "Look / visualize the line" },
        { "id": "see", "name_no": "Se inn", "en": "Internalize the target" },
        { "id": "feel", "name_no": "Føl", "en": "Sense required force" },
        { "id": "stroke", "name_no": "Utfør", "en": "Stroke with trust" }
      ]
    },
    {
      "id": "proprioceptive_timing",
      "name": "Proprioceptive updates",
      "note": "Brain-body communication ~20 ms (from PUTTING-METHODOLOGY neurological timing integration)",
      "status": "as_stated_in_source"
    }
  ],
  "distance_bands": [
    {
      "id": "putt_0_3ft",
      "label": "0–3 ft",
      "min_ft": 0,
      "max_ft": 3,
      "training_note": "Make percentage + start of progressive ladder",
      "sg_relevance": "high_make_rate"
    },
    {
      "id": "putt_3_10ft",
      "label": "3–10 ft",
      "min_ft": 3,
      "max_ft": 10,
      "training_note": "Scoring range",
      "sg_relevance": "high"
    },
    {
      "id": "putt_10_25ft",
      "label": "10–25 ft",
      "min_ft": 10,
      "max_ft": 25,
      "training_note": "Lag + two-putt control",
      "sg_relevance": "high"
    },
    {
      "id": "putt_25_50ft",
      "label": "25–50 ft",
      "min_ft": 25,
      "max_ft": 50,
      "training_note": "Distance control primary",
      "sg_relevance": "medium"
    },
    {
      "id": "putt_50_300ft",
      "label": "50–300 ft",
      "min_ft": 50,
      "max_ft": 300,
      "training_note": "Mac extreme-distance feel expansion (not tournament-only practice)",
      "sg_relevance": "training_only"
    }
  ],
  "distance_program": {
    "id": "progressive_1_to_300",
    "status": "UTKAST_PROGRAM_NOT_DRILL_ENTITY",
    "rule": "Hundreds of putts at every foot-distance from 1 ft through 300 ft over time",
    "reps_guidance": "On the order of 100 putts per distance over time (source: methodology + email)",
    "do_not_skip_distances": true,
    "why_extreme": [
      "Expands cerebellum database",
      "Develops touch for all situations",
      "Prevents distance blindness",
      "Builds confidence on any length"
    ]
  },
  "sg_putt_map": {
    "status": "HYPOTESE_ONLY",
    "regel": "SG PUTT alene er ikke diagnose. Koble til hypotese-kandidater i putting-faults når de finnes. Krever bekreftelse: video av stroke, sikte/aim, green-lesing/taktikk.",
    "agent_plikt": "Skriv «SG putting peker mot X — må bekreftes med video, sikte og lesing», aldri «feilen er X».",
    "map": []
  },
  "open_gaps": [
    "Ingen putting-fault entities ennå",
    "Ingen green-reading system i SOURCE fasit-form",
    "Ingen validerte putting-drill IDs",
    "CS-nivå for putting uavklart — ikke bruk CS"
  ]
}
```

**Merk:** `distance_bands` over er **arkitektforslag** basert på kilde + SG-praksis. Macs egen tekst er 1 ft, 2 ft, 3 ft … 300 ft (kontinuerlig). Bånd er for agent-ruting/UI — Anders må godkjenne grensene.

---

## 3. Foreslått fasit: `knowledge/entities/putting-faults.json` (skjelett)

**Status ved leveranse:** filen skal opprettes som **TOM entities** med skjema — **ikke** fyll med oppdiktede feil.

```json
{
  "version": "0.1.0",
  "status": "TOM — SKAL FYLLES MED ANDERS-VALIDERTE FEIL",
  "domain": "PUTTING",
  "morad_p_positions_apply": false,
  "diagnose_regel": {
    "status": "HYPOTESE_IKKE_DIAGNOSE",
    "regel": "SG putting eller miss-mønster alene er ikke diagnose.",
    "kreves_for_bekreftelse": [
      "video av putting stroke",
      "kontroll av sikte/aim",
      "green-lesing og taktisk valg (fart vs linje)"
    ],
    "agent_plikt": "Formuler som hypotese som må bekreftes."
  },
  "skjema_for_ny_fault": {
    "id": "snake_case",
    "name": "",
    "name_no": "",
    "description": "",
    "distance_bands": ["putt_0_3ft", "..."],
    "symptoms": [],
    "correction_principles": [],
    "source": [],
    "never_map_to_p_positions": true
  },
  "entities": {},
  "candidate_themes_from_source_NOT_FAULTS": [
    {
      "theme": "distance_control_deficit",
      "note": "Implied by speed→line and 1–300 program; NOT a formal fault ID until Anders defines it",
      "source": "PUTTING-METHODOLOGY.md"
    },
    {
      "theme": "incomplete_five_stages",
      "note": "Skipping read/look/see/feel before stroke — process error, not MORAD position",
      "source": "PUTTING-METHODOLOGY.md"
    },
    {
      "theme": "stroke_feel_undeveloped",
      "note": "Neurological coding incomplete — training dose issue",
      "source": "email 1-300ft"
    }
  ]
}
```

**Hvorfor tom entities:** SOURCE beskriver *treningssystem* og *prinsipper*, ikke en ferdig feilkatalog med deteksjonskriterier. Å finne på `face_open_putter` e.l. bryter hard law.

---

## 4. SG → putting map (hypotese)

I `sg-principles.json` i dag:

```json
"putt": []
```

**Behold tom til putting-faults har FASIT-IDs.**  
Når Anders godkjenner N faults:

```json
"sg_to_putting_faults": {
  "putt": ["fault_id_1", "fault_id_2"],
  "status": "HYPOTESE_IKKE_DIAGNOSE",
  "ref": "knowledge/entities/putting-faults.json"
}
```

**Ikke** gjenbruk `sg_to_morad_faults.putt` til fullswing-IDs. Egen nøkkel `sg_to_putting_faults` unngår forvirring.

---

## 5. Oppgavetype: `putting-diagnose`

Utvid `hent-kunnskap.ts`:

```ts
| "putting-diagnose"
```

**Ruting (prioritet først):**
1. `putting-framework.json` (pillars, bands, agent_regel)
2. `putting-faults.json` (diagnose_regel + entities — kan være tom)
3. `sg-principles.json` (kun PUTT category + diagnostic_logic confidence — **uten** L-fase fullswing override som plan-driver for putt)
4. `drills.json` filtrert `domain === "PUTTING"` ELLER eksplisitt empty-bank melding

**AKSJON mapping (forslag):**
| Signal / action | Oppgave |
|-----------------|---------|
| SG PUTT crisis / FOCUS putt | putting-diagnose |
| Plan pyramide SPILL putt-blokk | plan-generering + putting-framework snippet (begrenset) |
| DRILL_SUGGEST med skill PUTTING | drill-forslag med domain filter PUTTING |

---

## 6. Diagnose-routing (agent flyt)

```
Input: SG_PUTT, miss pattern, optional video notes
   │
   ├─ Load putting-framework + putting-faults
   ├─ Emit: "hypotese-kandidater" (empty list OK → si mangler)
   ├─ Require confirmation language (video / aim / read)
   ├─ Prescribe: principles + distance_program guidance
   └─ Drill: ONLY if entities has domain=PUTTING drills; else describe WHAT not WHICH named drill
```

**UI-strenger (NO):**
- «SG putting peker mot … — må bekreftes med video, sikte og lesing»
- «Putting-drillbanken er under oppbygging — tren avstandskontroll systematisk (1 ft → …), ikke en oppdiktet drill»

---

## 7. Forhold til short game

| | Putting | Short game (chip/pitch) |
|--|---------|-------------------------|
| Domain | PUTTING | SHORT_GAME / ARG |
| Sibling | ja | ja (egen, senere) |
| P1–P10 | nei | delvis teknikk i e-post, men ikke same brain |
| SOURCE | PUTTING-METHODOLOGY | SHORT-GAME-WET, Seve discs |

Wet-wedge er **ikke** putting-brain.

---

## 8. Valideringssjekkliste (Anders) før FASIT

- [ ] Godkjenne pillars-tekst (speed→line, five stages, neuro systems)
- [ ] Godkjenne distance_bands grenser eller krev fot-for-fot bare
- [ ] Definere 3–8 putting-faults med egne ord (eller si «kun program, ingen faults ennå»)
- [ ] Si ja/nei til heels-together som drill-kandidat
- [ ] Si ja/nei til 300 ft som produkt-anbefaling vs coach-only
- [ ] Bekrefte at ingen P-posisjon brukes i putting-UI

---

*Neste: `03-DRILL-BANK-RESTART.md`*
