# 05 — AGENT MASTERMIND WIRING

**Bro i HQ i dag:** `src/lib/masterbrain/hent-kunnskap.ts`  
**Fasit-speil:** `src/lib/masterbrain/knowledge/`  
**RAG:** `rag-corpus/` → Supabase `knowledge_chunks` (manuell embed)

---

## 1. Oppgavetyper (nå vs mål)

| Oppgavetype | Status | Fasit-ruting (mål) | Primære agenter / kallere |
|-------------|--------|--------------------|---------------------------|
| `plan-generering` | finnes | CANON*, mikro, LTAD, (+ ak-formel-v2 når FASIT) | `ai-plan/generate.ts`, WEEKLY_PROPOSAL, SESSION_*, PYRAMID_ADJUST, TRAINING_GAP |
| `sg-diagnose` | finnes | SG, faults, positions | `ai/agents/sg-interpretation.ts`, FOCUS_CHANGE, TM_BASELINE_PROPOSE |
| `putting-diagnose` | **mangler** | putting-framework, putting-faults, SG PUTT | ny: putt-fokus i portal + AgencyOS |
| `drill-forslag` | finnes (broken empty-guard i egen agent) | drills, faults|putting-faults by domain, CANON | DRILL_SUGGEST, DRILL_SWAP; **fix** `agents/drill-forslag-agent.ts` |
| `periodisering` | finnes | CANON*, mikro | PERIOD_SWITCH, DELOAD, TAPER, INTENSITY, RECOVERY, REST |
| `terminologi` | finnes | ordbok, positions | Caddie chat / coach tools |

\*CANON må renses for utgåtte L-faser (se 07).

---

## 2. Never-invent guards (per agent)

| Guard | Hvor | Implementasjon |
|-------|------|----------------|
| G1 Empty drill bank | `hent-kunnskap` DRILLS.blokk | finnes — behold |
| G2 Empty drill bank | `drill-forslag-agent.ts` | **mangler — P0** hard return |
| G3 SG hypotese-språk | faults.diagnose_regel + sg-diagnose test | finnes — utvid til putting |
| G4 No P-map for putt | putting-framework.morad_p_positions_apply=false | ny + unit test |
| G5 Only FASIT drill ids | system prompt + JSON schema validate on draft create | ny |
| G6 No dual invent via YT | YouTube only enriches known id | ny |
| G7 Version logging | versjonsnokkel on every agent run | finnes i hent-kunnskap; må logges i agent-runner |
| G8 Missing knowledge | utelatt[] + hull i MANIFEST | si «finnes ikke» — aldri fyll |

### G2 — patch-spesifikasjon (drill-forslag-agent)

Før Claude-kall:

```ts
import drills from "@/lib/masterbrain/knowledge/entities/drills.json";
const n = Object.keys(drills.entities ?? {}).length;
if (n === 0) {
  return {
    ok: false,
    code: "DRILL_BANK_EMPTY",
    message_no:
      "Drill-banken i Masterbrain er under oppbygging. Ingen navngitte drills foreslås før Anders har godkjent dem.",
  };
}
```

System prompt endres til: «Du kan KUN bruke drill-id fra listen. Tom liste = tom array, ingen fritekst-navn.»

---

## 3. Data flow: PlayerHQ vs AgencyOS

```
                    ┌─────────────────────┐
                    │   Masterbrain L1    │
                    │   (knowledge JSON)  │
                    └──────────┬──────────┘
                               │ hentMasterbrainKunnskap
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    AgencyOS agents      PlayerHQ portal      Live / analyse
    /admin/*             /portal/*            workbench
           │                   │                   │
           │ PlanAction        │ ukeplan           │ mid-session
           │ CaddieDraft       │ min golf SG       │ tone (RAG live/)
           │ godkjenninger     │ session generator │
           ▼                   ▼                   ▼
                    ┌─────────────────────┐
                    │ Prisma / Supabase   │
                    │ players, SG, plans, │
                    │ ExerciseDefinition, │
                    │ knowledge_chunks    │
                    └─────────────────────┘
```

| Data | Kilde | Brukes til | Ikke |
|------|-------|------------|------|
| Metodikk, feil, drills, putt-ramme | Masterbrain | hva som er lov å si/anbefale | spillerens tall |
| SG-runder, TrackMan | DB / import | signaler inn i diagnose | erstatte hypotese-regel |
| Video pose scores | pipeline (fremtid) | bekrefte hypoteser | oppdikte fault |
| ExerciseDefinition | DB | operativ øvelsesliste (policy A/B) | kalles ikke «MORAD fasit» |
| RAG chunks | embeddings | prosa-støtte | overstyre L1 |

---

## 4. Signal → oppgave → output

| Signal | Oppgave | Output (tillatt) | Output (forbudt) |
|--------|---------|------------------|------------------|
| SG OTT/APP svak | sg-diagnose | hypoteseliste + bekreft-krav + TEK-fokus | «Feilen er X» + fake drill |
| SG PUTT svak | putting-diagnose | framework + program-guidance + hypotese | P5.0 / over_the_top |
| SG ARG svak | sg-diagnose (midlertidig) + later short-game brain | hypotese; short-game prose RAG | fullswing-only fix som sikker |
| Ukeplan generer | plan-generering | pyramide, volumtak, perioder (oversatt) | L-fase hvis utgått; CS hvis ulåst |
| DRILL_SUGGEST | drill-forslag | FASIT ids only / empty message | Claude-oppdiktede navn |
| Terminologi-spørsmål | terminologi | ordbok terms | Malaska-attribusjon |
| Period switch | periodisering | mikro + canon periods | raw CANON string til Prisma |

---

## 5. Endringer i `hent-kunnskap.ts` (konkret)

1. Importer `putting-framework`, `putting-faults` når filene finnes.  
2. Ny `Oppgavetype = "putting-diagnose"`.  
3. `RUTING["putting-diagnose"] = [PUTTING_FW, PUTTING_FAULTS, SG_PUTT_SLICE]`.  
4. `DRILLS.blokk`: hvis entities > 0, filtrer på `domain` via options `{ domain?: string }`.  
5. `AKSJON_TIL_OPPGAVE`: map putt-relaterte actionTypes.  
6. Fjern eller isoler L-fase-blokker fra CANON.blokk inntil C1 løst (eller inject ak-formel-v2).  
7. Test: putting-diagnose nevner aldri P1–P10 som putt-fault map.

---

## 6. Skills dual-stack audit (L7)

Funn i HQ (grep):

| Path | Risiko |
|------|--------|
| `src/lib/ai/skills/pyramide-taksonomi.ts` | Kan speile CANON — må lese masterbrain eller synkes felt |
| `src/lib/training/skills/morad-fault.ts` | Må bruke faults.json, ikke hardkodet |
| `src/lib/agents/drill-forslag-agent.ts` | invent-brudd |
| Slettet `domain/rules/` | bra (MANIFEST 2026-08-03) |

**Regel:** ingen ny skill-fil med golfmetodikk uten re-export fra masterbrain.

---

## 7. Logging / sporbarhet

Hver agent-resultat skal bære:

```ts
{
  masterbrain_versjonsnokkel: string, // "canon@3.5.0,faults@2.0.0,drills@2.0.0-empty"
  oppgavetype: string,
  utelatt: Kilde[],
  invent_guard: "ok" | "blocked_empty_bank" | "blocked_missing_putting"
}
```

---

## 8. Player-facing NO strings (faste)

| Kode | Tekst |
|------|-------|
| DRILL_BANK_EMPTY | «Drill-banken er under oppbygging. Vi beskriver hva som bør trenes, ikke en oppdiktet øvelse.» |
| HYPOTHESIS_SG | «SG peker mot {x} — må bekreftes med video, sikte og køllevalg.» |
| HYPOTHESIS_PUTT | «SG putting peker mot {x} — må bekreftes med video, sikte og lesing.» |
| PUTTING_NO_P | «Putting vurderes uten MORAD P-posisjoner.» |
| KNOWLEDGE_MISSING | «Denne kunnskapen finnes ikke i fasiten ennå.» |

---

*Neste: `06-MIGRATION-PLAN.md`*
