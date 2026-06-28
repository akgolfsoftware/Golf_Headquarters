# Teknisk plan — 2 komplette Claude Design-prompter (AgencyOS + PlayerHQ)

> To separate Claude Design-prosjekter. Hver prompt er selvstendig og komplett (egne tokens, eget vokabular,
> egne skjermer). Lim PROMPT A i AgencyOS-prosjektet, PROMPT B i PlayerHQ-prosjektet.

---

## PROMPT A — AGENCYOS (coach, MØRKT)

```
Oppdrag: Design KODEKLARE AgencyOS-skjermer (coach-appen, MØRKT terminal-tema) for COACHENS TEKNISKE
UTVIKLINGSPLAN i AK Golf HQ.

HANDOVER-GRADE: INGEN stubs — gå RETT til ferdige, kodeklare skjermer. ALLE tilstander (normal · tom · laster ·
feil · lang tekst). DESKTOP (~1280–1440px) + MOBIL. Eksakte tokens. Realistisk AK-demo-data (coach: Anders
Kristiansen · spiller: Øyvind Rohjan), aldri «Lorem». Norsk bokmål (æ, ø, å). Design PÅ NYTT fra spec —
ikke kopier evt. eksisterende skjermer.

TOKENS (AgencyOS mørkt): bg #0A0B0A · tile #171817 · linje #1B1C1A · tekst #F0F0F0 · dempet #7E807A · lime #D1F843 (KUN signal).
Pyramide-farger (tokens): FYS #005840 · TEK #B8852A · SLAG #2563EB · SPILL #D1F843 · TURN #A32D2D.
Fonter Inter (UI) · Inter Tight (overskrift) · JetBrains Mono (ALLE tall). Lucide (1.5px). 8pt-grid.
Lime KUN som signal. ADHD: én ting i fokus, «hva nå» åpenbart. Venstre AgencyOS-rail + topbar som resten av AgencyOS.

DOMENE-VOKABULAR (eksakt — ikke finn opp):
- Kategori A–K (A = elite, K = nybegynner). Pyramide: FYS · TEK · SLAG · SPILL · TURN.
- L-faser: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO (uten kølle/ball → kølle → ball).
- Fart-soner (ikke absolutt %): Sakte 50–60 · Kontroll 60–75 · Normal 75–90 · Full 90–100 (m/ kalibrert mph bak).
- Miljø-arenaer (stigende realisme): nett/matte · TrackMan-sim · range (⚠ rangeballer upålitelige) · gress/kort hullsbane ·
  bane-trening · bane-resultat · turnering (modus: Trening · Utvikling · Prestasjon).
- Press fra faktorer: tilskuere · konsekvens · gruppe. P-system P1–P10 (Standard); Advanced = desimal P1.1–P1.9.
  PUTTING har IKKE P-posisjoner/club speed. Treningsområder: TEE · INN200/150/100/50 · CHIP/PITCH/LOB/BUNKER · PUTT0–3…40+ · SPILL.

KONSEPT: Repeterbar levering av kølle til ball. P-posisjoner er VERKTØYET, ikke målet.
Data foreslår → coach godkjenner → spiller trener → TrackMan beviser → agent varsler stagnasjon.

SKJERMER (coach):
1. OPPRETT/REDIGER PLAN: navn · MÅLSETTING · startdato · sluttdato · SCOPE (slagtype/avstand, grunnslag vs
   spesialslag) · NIVÅ Standard (P1–P10) eller Advanced (desimal). Tilstander: opprett vs rediger, valideringsfeil.
2. PLAN-OVERSIKT (hovedskjerm):
   - TOPP: planens MÅL + «repeterbarhet»-fremdrift (hvor stabil er leveringen nå vs mål) — STØRST element.
   - NÅSITUASJON-snapshot: gjennomsnitt · TrackMan-data · SG-statistikk · bilder/video.
   - TIDSLINJE: planen mot ÅRSPLAN + PERIODISERING (GRUNN/SPES/TURN/EVAL/FERIE) + KONKURRANSER + TRENINGSSAMLINGER.
   - POSISJONER: P0–P10 (Advanced: desimal-underposisjoner innrykket), hver m/ oppgaver, fremdriftsbar, hovedfokus-markør.
   - FORESLÅTTE OPPGAVER (fra data): kort fra TrackMan/SG/test, f.eks. «faceAngle drifter åpen → oppgave P6» m/ GODKJENN/AVVIS.
   - Tilstander: tom plan, ingen forslag, laster, feil.
3. OPPGAVE-EDITOR (egen skjerm): velg P (auto P1, Advanced desimal) · beskrivelse (tekst + bilde + video) ·
   MÅLBAR METRIKK baseline → mål («hofterotasjon 45° i P4») · FILM-VINKEL (Face on · Down the line · Rear) ·
   REP-MÅL per fase/utstyr i 3 farter DRY/LAV/FULL («bare kropp 1500x») · AK-FORMEL-KODING der feltene vises
   DYNAMISK per pyramide/slagtype (putting uten P/club speed; FYS uten golf-felt) · KOBLE TIL DRILL fra banken.
4. GRUPPE / AI-UTKAST: bruk en plan som MAL på en hel gruppe (bulk, godkjenn-kø per spiller) · AI-UTKAST av plan
   fra spillerens nå-situasjon (coach redigerer/godkjenner). Tilstander: tomt utvalg, genererer, resultat.

LEVERANSE: alle fire kodeklart, mørkt tema, alle tilstander, desktop + mobil. Gjør planens MÅL synlig — ikke bare en P-liste.
```

---

## PROMPT B — PLAYERHQ (spiller, LYST, mobil-først)

```
Oppdrag: Design KODEKLARE PlayerHQ-skjermer (spiller-appen, LYST tema, MOBIL-FØRST) for SPILLERENS TEKNISKE
TRENING i AK Golf HQ.

HANDOVER-GRADE: INGEN stubs — gå RETT til ferdige, kodeklare skjermer. ALLE tilstander (normal · tom · laster ·
feil · lang tekst). MOBIL-FØRST (430px) + desktop. Eksakte tokens. Realistisk AK-demo-data (spiller: Øyvind Rohjan),
aldri «Lorem». Norsk bokmål (æ, ø, å). Design PÅ NYTT fra spec — ikke kopier evt. eksisterende skjermer.

TOKENS (PlayerHQ lyst): bg #FAFAF7 · kort #FFFFFF · tekst #0A1F17 · dempet #5E5C57 · kantlinje #E5E3DD ·
primær #005840 · primær-tekst (på primær) #D1F843 · aksent #D1F843. Aldri ren hvit bg — varm off-white.
Pyramide-farger (tokens): FYS #005840 · TEK #B8852A · SLAG #2563EB · SPILL #D1F843 · TURN #A32D2D.
Fonter Inter (UI) · Inter Tight (overskrift) · JetBrains Mono (ALLE tall). Lucide (1.5px). 8pt-grid.
Lime/aksent KUN som signal — ALDRI lime brødtekst på lys bakgrunn. PlayerHQ-skall (bunn-nav). ADHD: én ting i fokus.

DOMENE-VOKABULAR (eksakt — ikke finn opp):
- Pyramide: FYS · TEK · SLAG · SPILL · TURN. L-faser: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO (uten kølle/ball → kølle → ball).
- Fart-soner (ikke absolutt %): Sakte 50–60 · Kontroll 60–75 · Normal 75–90 · Full 90–100 (m/ kalibrert mph bak).
- P-system P1–P10 (Standard); Advanced = desimal P1.1–P1.9. Reps i 3 farter: DRY (uten ball) · LAV · FULL.
- Film-vinkel: Face on · Down the line · Rear. Treningsområder: TEE · INN · CHIP/PITCH/LOB/BUNKER · PUTT · SPILL.

KONSEPT: Din tekniske plan gjør svingbevegelsen REPETERBAR over tid. Det handler om HVORDAN du leverer kølle til ball —
posisjoner er verktøyet. Du gjør oppgavene, logger reps, og TrackMan viser om endringen sitter.

SKJERMER (spiller, mobil-først):
1. TEKNISK TRENING (i workbench/Plan-fanen): liste over ALLE UFERDIGE tekniske oppgaver på tvers av alle slag,
   gruppert/filtrerbar (per P eller per slag), hver m/ tittel, pyramide-tag, fart-sone, fremdrift (reps gjort/mål) +
   «logg»-knapp. Tilstander: ingen oppgaver, alt fullført, laster, feil.
2. OPPGAVE-GJENNOMFØRING (én oppgave): beskrivelse · video + film-vinkel å sjekke fra · MÅL (baseline → mål, f.eks.
   «hofterotasjon 45° i P4») · stor LOGG-teller for reps i 3 farter/utstyr («bare kropp 1500x» → logg 50/100…) →
   fremdrift oppdateres umiddelbart. Tilstander: ikke startet, pågår, fullført.
3. DIN PLAN (oversikt): din tekniske plan — nåsituasjon (snitt/TM/SG/video) · tidslinje mot sesong/konkurranser ·
   posisjoner P1–P10 m/ oppgaver og fremdrift mot MÅLET (repeterbar levering). Lese + logge, ikke redigere.

LEVERANSE: alle tre kodeklart, lyst tema, mobil-først + desktop, alle tilstander. Gjør MÅLET (repeterbar levering)
og «hva skal jeg gjøre nå» tydelig — ikke bare en liste.
```
