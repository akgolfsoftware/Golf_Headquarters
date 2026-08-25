# Overnight coding loop — bølge 2 (Loop 5–14)

Fortsettelse av [OVERNIGHT-CODING-LOOP.md](./OVERNIGHT-CODING-LOOP.md).

**Regel:** start ikke før bølge 1-smoke er dokumentert grønn i `docs/natt/LOOP-4-DONE.md`. Én loop per Claude-session. Train-lock. Norsk. Ingen nye tokens.

Felles prefiks: *«Du er på gren `claude/natt-a1-a4-2026-08-24`. Les OVERNIGHT-CODING-LOOP.md + forrige LOOP-N-DONE.md. Hvis bølge 1-smoke ikke er grønn: STOPP. Commit + LOOP-N-DONE.md + stopp. Ikke start neste loop.»*

## Loop 5 — Måned + år

**Fasit:** A-05, A-06, WB-05, WB-06  
Read-first. Klikk dag → uke. Ingen redigering i årscelle. Ingen stall, ingen Google.  
**Ferdig:** Uke | Måned | År bevarer spiller. Tom måned = norsk empty.  
**Commit:** `feat(workbench): month + year views`

## Loop 6 — Stall

**Fasit:** A-10, WB-09, AG-04  
Spillere som kolonner. UTKAST per celle. Handling = Åpne uke i Workbench. Ingen GROUP-propagate, ingen FY-01.  
**Commit:** `feat(agency): stall day view`

## Loop 7 — Kalender (uten Google)

**Fasit:** KA-01–05, AG-11  
Lag: økter · skole · TURN · test · booking. KA-05 rom-varsel i kalender, ikke Workbench. Ingen Google-API. Player: KA-04 ark, ingen kalender-fane.  
**Commit:** `feat(calendar): week + agenda, no Google sync`

## Loop 8 — Tester live

**Fasit:** TE-04, TE-05, TE-06  
Artefakt over I dag. Gate: 10 prikker OK|Bom + V|H. Ferdig «N OK av 10». PEI to tall. Ikke hele TN-batteriet.  
**Commit:** `feat(tests): live Gate + Innspill artifact`

## Loop 9 — Runde live

**Fasit:** RU-01–04  
Artefakt, aldri fane. Recap V8-hull. Etterregistrering merker SG som EST. PH-12 urørt. Ingen GPS/3D/DataGolf på recap.  
**Commit:** `feat(rounds): live round artifact + recap`

## Loop 10 — Jarvis-merge

**Fasit:** JV-01/02/03  
Jarvis merger aldri. Rød eval = STENGT. Fire sjekker: ACWR 0,8–1,3 · ingen kollisjon · motorer adskilt · drills komplette. Testdata Filip 4/4 åpen / Jonas rød.  
**Commit:** `feat(jarvis): queue + eval gate + merge provenance`

## Loop 11 — AgenticOS

**Fasit:** AO-00, AO-01, AO-02, AO-05, AO-12  
Agent skriver aldri uten godkjenning. Ingen direkte Workbench-write. Ingen `#30D158` her. A3: Godkjenn start når sky / ØKONOMI/PERSONLIG/DRIFT / writeTargets ≠ none. C3 research uten write = Cockpit-badge.  
**Commit:** `feat(agenticos): cockpit queue + approval policy A3/B1/C3`

## Loop 12 — Lys-pass

**Fasit:** B3/B4/B5 + *L  
Kun I dag, Plan-uke, TM-detalj, Workbench-uke, Kalender-uke, Live runde, Gate, Login. `data-v2-tema` only. Scene lys `#FFFFFF`.  
**Commit:** `fix(theme): light pass on launch surfaces`

## Loop 13 — Forelder les

**Fasit:** FO-01  
Lesemodus. Neste økt + rolig status. Ingen chat, ingen SG-dybde, ingen DRAFT. GDPR: fornavn.  
**Commit:** `feat(parent): read-only home`

## Loop 14 — DataGolf + Økonomi

**Fasit:** DG-01, EC-01  
Bland aldri Broadie / DataGolf / PEI. EC: FORFALT = eneste danger. Ingen simulator-omsetning. Ingen Stripe-omlegging.  
**Commit:** `feat(insight): DataGolf player + agency economy read`  
Skriv `docs/natt/NATT-RAPPORT.md` for hele bølge 1+2.

## Fortsatt utenfor også etter bølge 2

Google two-way, PH-07 (UT), GP, BO, S3, GAP, FY-01, Club OS, hele TN-batteriet, GROUP-materialisering til N medlemmer.
