---
name: ak-design-evolution
description: >
  Videreutvikler AK Golf HQ-design mot verdensklasse uten å bytte merkevare.
  Bruk når Anders sier «videreutvikle design», «verdensklasse», «bedre flyt»,
  «design-evolusjon», «Mobbin», «inspirasjon fra andre apper», «finpuss B»,
  eller vil heve craft/UX etter at 0 GAP redesign er på plass.
  Leser ALLTID TEMA-LYS-MORK + FASIT + B-pakke. Låner mønstre, aldri skin.
Versjon: 1 (2026-07-23)
---

# AK Design Evolution

Du hever **opplevelse og flyt** innenfor låst system. Du redesignet ikke merkevare.

## Alltid les først

1. `docs/design-system/TEMA-LYS-MORK.md` — PlayerHQ lys / AgencyOS mørk  
2. `docs/design-system/FASIT.md` §3 + §3b (B-pakke)  
3. `docs/design-system/DESIGN-EVOLUSJON-2026-07-23.md` — bølger V1–V6  
4. Skill `ak-designekspert` + `akgolf-design-system`  
5. `ak-designekspert/references/mesterens-monstre.md`

## Hard regler

- Behold funksjoner. Minst trykk. Super enkelt.  
- Én primær CTA per skjerm.  
- Lån **struktur** fra Whoop/Strava/Linear/Apple/Notion — **ikke** deres farger.  
- Ingen mørk PlayerHQ. Ingen nytt token-sett uten GO.  
- Maks 3 alternativer, én anbefaling.  
- Svar Anders på **enkel norsk**.

## Arbeidsflyt

### A) Diagnose (før kode)

1. Navngi **jobben** på skjermen (én setning).  
2. **5-sekunders-test:** standpunkt + neste steg?  
3. Tell **trykk** til primærjobb. Mål: 1–2.  
4. Sjekk tilstander: tom / laster / feil / suksess.  
5. Squint: ett hierarki eller grøt?

### B) Inspirasjon (Mobbin + mestere)

**Hvis Mobbin MCP er tilgjengelig:**

1. Søk Health & Fitness + Sports (mobile).  
2. Hent 3–5 skjermer for *samme jobb* (home dashboard, logging, plan).  
3. Trekk ut **kun**: layout-rekkefølge, trykk-antall, empty states, tommel-CTA.  
4. Map til AK-komponenter (`Kort`, `CTAPill`, `TallHero`, `TomTilstand` …).

**Hvis Mobbin MCP mangler:**

1. Si det tydelig til Anders.  
2. Bruk mesterens-monstre + DESIGN-EVOLUSJON §3.  
3. Valgfritt: nettleser-Mobbin-kategorier (fitness/sports) som referanse-lenker.

### C) Forslag

- Maks **3** retninger, merket 1 = anbefalt.  
- Hver retning: «hva spilleren/coachen *gjør* på 10 sekunder».  
- Ingen ny app. Én motor, bedre UI.

### D) Implementasjon (etter GO)

- Kun berørte filer (surgical).  
- v2-tokens (`T.*` / `--v2-*`). Lucide, ikke emoji.  
- Verifiser lys PlayerHQ / mørk AgencyOS.  
- Oppdater DESIGN-EVOLUSJON bølge-checkbox ved ferdig.

## Bølger (default rekkefølge)

| ID | Fokus | Si |
|---|---|---|
| V1 | Hjem · Plan · Analyse (dommere) | `GO V1` |
| V2 | Live · runde | `GO V2` |
| V3 | Cockpit · stall · godkjenning · workbench iPad | `GO V3` |
| V4 | Booking · betaling | `GO V4` |
| V5 | Marketing · stats | `GO V5` |
| V6 | Craft-system (motion, hover, states) | `GO V6` |

Uten GO: **kun plan + diagnose**, ikke stor kode.

## Leveranseformat til Anders

1. **Nå:** hva som er bra / svakt (maks 5 punkter)  
2. **Anbefaling:** én bølge  
3. **Etter:** hva som endres for ham (følelse, ikke filnavn)  
4. **Mobbin:** brukt MCP? ja/nei  

## Anti-mål

- «La oss gjøre alt mørkt»  
- «Kopier Whoop 1:1»  
- 50-skjerms redesign-batch  
- Nye features under «design-polish»
