# Claude Design-brief — Øvelsesbank + Treningsplan-generator (komplett)

> Dyp, kode-forankret Claude Design-brief for to AgencyOS-motorer: ØVELSESBANKEN
> (alle skjermer + funksjoner, inkl. den nye web/YouTube/IG/TikTok-generatoren) og
> TRENINGSPLAN-GENERATOREN (alle kategorier A–K × L-faser + periodisering), pluss et
> kart over alle øvrige funksjoner. Lim blokken under inn i Claude Design.
> Forankret i: ordbok-ak-golf-konsept.md, src/lib/ai-plan/**, drill-/test-modellene,
> admin-nav.ts. Helhets-brief for hele AgencyOS: docs/agencyos-claude-design-brief-komplett.md.

---

```
Oppdrag: Design to motorer i AgencyOS for AK Golf Group (coach: Anders Kristiansen) i
det mørke «terminal»-temaet: (1) ØVELSESBANKEN og (2) TRENINGSPLAN-GENERATOREN — med ALLE
skjermer og funksjoner, og et kart over alle øvrige funksjoner. Norsk bokmål (æ, ø, å).

═══ 0. HANDOVER-GRADE — KODEKLAR, INGEN STUBS (HARDEST REGEL, GJELDER ALT) ═══
- INGEN stub-, placeholder- eller skisse-skjermer. Gå RETT til ferdige, KODEKLARE skjermer i
  HELE Claude Design. Aldri «TODO», grå tomme bokser, «kommer senere» eller halvferdige flater.
- KODEKLAR = klar for direkte handover til Claude Code UTEN mer designarbeid: komplett layout,
  ekte komponenter fra designsystemet, eksakte tokens/farger/fonter/ikoner (ingen gjetting),
  ALLE tilstander (normal, tom, laster, feil, lang tekst), DESKTOP + MOBIL, og interaksjoner +
  navigasjon spesifisert. Demo-data skal være realistisk AK-data — aldri «Lorem».
- HVIS en EKSISTERENDE skjerm eller design ikke allerede er 100 % klar for handover til Claude Code:
  RETT DEN I DENNE RUNDEN. Ikke utsett, ikke lever som «nesten». Oppdater til kodeklar standard nå.
- KVALITETSBAR 10/10 mot AK-fasiten: før HVER skjerm leveres, sjekk mot designsystemet (tokens,
  lime kun som signal, kun Lucide, mono-tall, 8pt-grid, norsk bokmål) og fiks hvert avvik til 0.

═══ FELLES (gjelder alt) ═══
- ADHD-design (HARD): én ting i fokus per skjerm, rolig/ryddig, «hva nå?» alltid synlig,
  lime #D1F843 KUN som signal (aktiv/haster/NÅ), synlig fremdrift, minimal input.
- Mørkt terminal-tema: bg #0A0B0A · tiles #171817 · hårlinjer #1B1C1A · tekst #F0F0F0 ·
  dempet #7E807A · lime #D1F843 (mørk tekst #06100A) · opp #4FD08A · ned #F0683E · varsel #E8B43C.
- Fonter: Inter (UI), Inter Tight (overskrift/italic-aksent), JetBrains Mono (ALLE tall +
  eyebrows). Lucide-ikoner, 1.5px strek. INGEN emoji. Tall i norsk format (komma): «72,4», «+1,8».
- Venstre rail (workspace + ⌘K + nav + «Min stall · nå» + coach-identitet) som resten av AgencyOS.

═══ DOMENE-VOKABULAR (bruk EKSAKT disse — ikke finn opp) ═══
- KATEGORIER A–K: spillernivå fra A (elite/lavest HCP) til K (nybegynner). Vises ofte med
  undernivå (A1, A2 …). NGF bruker A–L; L vises som K. Hver drill/test/mal har et kategori-spenn.
- PYRAMIDEN (5 områder, hver drill/økt tagges med ETT): FYS · TEK · SLAG · SPILL · TURN.
- L-FASER (læring, 5 trinn): L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO. (kode-id uten ø; uttales «kølle»)
- CS (køllehastighet, % av maks): CS50 · CS60 · CS70 · CS80 · CS90 · CS100.
- AK-FORMELEN = 4 akser som koder hver øvelse/oppgave: L-fase × CS × M (miljø M0–M5) × PR (press PR1–PR5).
- PERIODER (periodisering): GRUNN · SPESIALISERING · TURNERING · EVALUERING · FERIE —
  hver med egne grenser (CS-tak, pyramide min/max %, tillatte L-faser, volum/uke, hviledager).
- TRENINGSOMRÅDER (16, etter avstand): TEE, INN200/150/100/50, CHIP, PITCH, LOB, BUNKER,
  PUTT 0–3/3–6/6–10/10–20/20–40/40+, SPILL.
- FYS-TYPER (drillmodus FYS): STYRKE · BEVEGELIGHET · KONDISJON · MOBILITET · AKTIVERING.
- SG (Strokes Gained): OTT · APP · ARG · PUTT, mot benchmark (PGA Tour Top 40 → Scratch).

╔══════════════════════════════════════════════════════════════════╗
║ DEL 1 — ØVELSESBANKEN (alle skjermer + funksjoner)                ║
╚══════════════════════════════════════════════════════════════════╝
1.1 BANK-OVERSIKT (liste/grid): alle driller. Filtrer på pyramide-område, treningsområde,
    kategori A–K, L-fase, CS, miljø, fasilitet, drillmodus (FYS/GOLF), kilde (system/coach/web/YouTube).
    Søk. Hvert kort: navn, pyramide-tag (fargekodet), kategori-spenn, varighet, kilde-merke, video-miniatyr.
1.2 DRILL-DETALJ: video/bilde, beskrivelse, protokoll (reps/sett/avstander/mål), AK-formel-koding
    (L-fase, CS, M, PR), pyramide-område + treningsområde, kategori-spenn, fasilitetskrav.
    Coach-handlinger: legg i plan/økt, PIN/PRIORITER/BLOKK for en spiller, dupliser, rediger.
1.3 OPPRETT/REDIGER DRILL: skjema som bytter felt etter drillmodus —
    GOLF: treningsområde, L-fase, P-posisjoner, miljø. FYS: fys-type, muskelgrupper, sone, reps/sett/kg/tid.
    Felles: navn, beskrivelse, video-URL, pyramide, kategori-spenn, varighet, intensitet.
1.4 ØVELSESBANK-GENERATOR (NY — kjernen Anders vil ha): «Hva leter du etter?»-søk +
    kilde-valg (Web · YouTube · Instagram · TikTok). Agenter søker → live fremdrift per kilde
    (treff-teller) → AI trekker ut hver øvelse strukturert (pyramide, område, varighet, protokoll, AK-formel).
1.5 FORSLAG-KØ / GODKJENNING (NY): kort per kandidat med kilde-badge + miniatyr + AI-uttrekt felt +
    original-lenke. Coach: GODKJENN → inn i banken · REDIGER (juster felt før godkjenning) · AVVIS.
    HARD regel i design: INGENTING havner i banken før Anders godkjenner.
1.6 TESTER-BANK (samme mønster): test-katalog (NGF-test-matrise, kategori A–K), test-detalj
    (protokoll + benchmark PGA Top 40→Scratch), opprett/rediger test, tildel test til spiller,
    og samme web/AI-generator + godkjenning for NYE tester.
1.7 KILDE-/AGENT-INNSTILLINGER: skru kilder på/av (Web/YouTube/IG/TikTok), sett kvalitetsfilter,
    se historikk over genereringer (hva ble funnet, godkjent, avvist).
MERK (gjennomførbarhet — design for dette): bruk LOVLIGE kilder/API-er — YouTube Data API +
web-søk-API gir ekte automatisk innhenting. Instagram/TikTok har ingen åpen API og skraping
bryter deres vilkår; design derfor en «lim inn lenke»-fallback for disse (coach limer URL →
AI trekker ut øvelsen), ikke automatisk skraping. Vis kilde-status ærlig (API-tilkoblet vs lenke-basert).

╔══════════════════════════════════════════════════════════════════╗
║ DEL 2 — TRENINGSPLAN-GENERATOR (alle kategorier A–K)              ║
╚══════════════════════════════════════════════════════════════════╝
2.1 GENERATOR-START: velg spiller (eller gruppe/bulk). Vis spiller-kontekst AI-en bruker:
    kategori A–K, HCP, SG-profil (OTT/APP/ARG/PUTT + kriseområde), mål, valgt periode.
    Velg periode (GRUNN/SPESIALISERING/TURNERING/EVALUERING/FERIE) + tidsrom. «Generer plan»-knapp.
2.2 MAL-VALG: AI starter fra en PlanTemplate (kodifisert coach-erfaring) for (kategori × L-fase).
    Vis hvilken mal som brukes, og la coach bytte mal. Maler per A–K og periode.
2.3 GENERERING (live): AI bygger uke-for-uke plan. Vis fremdrift + at den holder seg innenfor
    periode-grensene (CS-tak, pyramide-fordeling min/max %, tillatte L-faser, volum/uke).
2.4 PLAN-RESULTAT / GJENNOMGANG: ukeplan med økter; hver økt viser pyramide-miks (FYS/TEK/SLAG/SPILL/TURN)
    mot idealfordeling, AK-formel-koding per drill, volum. Vis avvik fra periode-regler tydelig (varsel).
    Coach: rediger økt/drill, bytt drill fra banken, juster fordeling.
2.5 GODKJENN & PUBLISER: coach godkjenner → status DRAFT → PENDING_PLAYER → ACTIVE → publiseres til
    spillerens PlayerHQ. Spiller kan be om justering (PlanAdjustment) → tilbake til coach-godkjenning.
2.6 PERIODISERING / ÅRSPLAN: gantt over sesongen med perioder (fargekodet), L-fase-blokker,
    turneringer, treningssamlinger, ferie. Dra for å justere faser. Kobler til generatoren per blokk.
2.7 BULK / GRUPPE: generer planer for mange spillere samtidig (per kategori), med felles periode,
    og en godkjenn-kø der coach går gjennom hver plan før publisering.
2.8 MAL-BIBLIOTEK: alle PlanTemplates per (kategori A–K × L-fase). Opprett/rediger mal,
    se bruk + effektivitet (PlanEffectiveness).

╔══════════════════════════════════════════════════════════════════╗
║ DEL 3 — ALLE ANDRE FUNKSJONER (kart — design i samme språk)       ║
╚══════════════════════════════════════════════════════════════════╝
DAGLIG: Oversikt (cockpit) · Min uke (oppgaver/tildelt meg).
AI & ARBEID: Agenter (flermodell-chat) · Agent-team (sekvensiell AI på én oppgave) · Prosjekter.
STALL & TALENT: Spillere (stall-tabell) · Utøver-360 (spiller-detalj: daglig/ukentlig trening,
  total belastning, årsplan, turneringer, treningssamling, ferie/skade, skole, helse, SG/form,
  mål, kommunikasjon+oppfølging) · Stall · Grupper · Talent (radar/sammenligning/WAGR).
OPERASJON: Workbench (planlegging per spiller) · Handlingssenter · Planlegge (treningsplaner,
  maler, øvelsesbank, økter, teknisk plan, turneringer) · Gjennomføre (kalender, bookinger,
  anlegg, tilgjengelighet, tjenester, TrackMan, opptak).
ANALYSE: Stall-analyse · Risiko/belastning · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter.
INNBOKS: Forespørsler · Godkjenninger · Meldinger.
SYSTEM: Økonomi · Team · Integrasjoner · AI-agenter (bakgrunn) · E-postmaler · Audit-logg · Innstillinger.

═══ LEVERANSE ═══
Design alt i sammenhengende stil, mørkt tema, desktop ~1280–1440px. Prioritert rekkefølge:
1) Øvelsesbank-generator + forslag-kø (Del 1.4–1.5). 2) Bank-oversikt + drill-detalj (1.1–1.3).
3) Treningsplan-generator-flyt (2.1–2.5). 4) Periodisering/årsplan (2.6) + bulk (2.7).
5) Tester-bank (1.6). 6) Resten (Del 3).
Bruk domene-vokabularet eksakt. Hold ADHD-føringene + lime-disiplin i HVER skjerm.
«Godkjenning fra coach før noe lagres» skal være synlig i både øvelses- og plan-generatoren.
```

---

## Slik bruker du den
1. Kopier blokken over. 2. Lim i Claude Design, send. 3. Send skjermene til meg → portes inn via design-gaten.
