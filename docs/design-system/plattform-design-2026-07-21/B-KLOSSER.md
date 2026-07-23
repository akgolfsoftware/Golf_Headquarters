# B-pakke — felles byggeklosser (steg 2)

**Status:** Verifisert 2026-07-22 — finnes i `src/components/v2`.  
**Regel:** Nye PlayerHQ-sider komponerer disse. Ikke finn opp ny hierarki-stil.

| # | Kloss | Jobb | Kode |
|---|---|---|---|
| 1 | Primær CTA | Én grønn handling | `CTAPill` / `Knapp` |
| 2 | Form-kort | SG + trend + status | `Kort` + `TallHero` + `Trend` + `StatusPill` |
| 3 | Plan/økt-kort | Dagens eller valgt økt | `Kort` + `AkseChip` + `Rad` + `StatusPill` |
| 4 | SG-områder | Fire rader; svakest tykkest | `FordelingRad` med `emphasis` |
| 5 | Uke-status | Planlagt / gjort / % | `KpiFlis` + `ProgresjonsBar` / `DagStripe` |
| 6 | Tom / laster / feil | Alltid vei videre | `TomTilstand`, `Skjelett`, feil i `feil-laste` |

## Gap (liten)

| Gap | Handling |
|---|---|
| Dedikert «UkeStatusKort» | Valgfritt senere — i dag = KpiFlis-rad + bar |
| Dedikert «ReseptKort» | Valgfritt — i dag = Kort + Caps + CTAPill (Analyse) |

Ingen blokkerende gap for steg 3.

## Brukes av

- HjemV2 — form + plan + CTAPill  
- AnalysereV2 TabSG — form + områder (emphasis) + resept + Planlegg  
- Workbench / Plan — neste finpuss mot RETNING-PLAN.md (steg 3b)
