# Teknisk plan — komplett Claude Design-prompt (v2, kanonisk)

> Erstatter prompt-blokken i teknisk-plan-komplett-byggeplan-2026-06-28.md §6.
> Rettet: to-produkt/to-tema-split (coach mørkt / spiller lyst), «design på nytt» (ikke «rett dagens»),
> fullt domene-vokabular, tilstander + mobil per skjerm.

```
Oppdrag: Design KODEKLARE skjermer for den VIDEREUTVIKLEDE TEKNISKE PLANEN i AK Golf HQ.

VIKTIG — TO PRODUKTER, TO TEMA (design hver skjerm i riktig tema, angitt under):
- COACH-skjermer bor i AgencyOS = MØRKT terminal-tema.
- SPILLER-skjermer bor i PlayerHQ = LYST tema.

HANDOVER-GRADE (gjelder alt): INGEN stubs — gå RETT til ferdige, kodeklare skjermer. ALLE tilstander
(normal · tom · laster · feil · lang tekst). DESKTOP + MOBIL. Eksakte tokens. Realistisk AK-demo-data
(spiller: Øyvind Rohjan · coach: Anders Kristiansen), aldri «Lorem». Norsk bokmål (æ, ø, å).
Dagens teknisk-plan-skjermer har designsystem-avvik (hardkodede hex + lys-tema-rester) — IKKE kopier dem;
DESIGN PÅ NYTT fra denne spec-en til ren designsystem-standard.

TOKENS:
- AgencyOS (mørkt): bg #0A0B0A · tile #171817 · linje #1B1C1A · tekst #F0F0F0 · dempet #7E807A · lime #D1F843 (signal).
- PlayerHQ (lyst): bg #FAFAF7 · kort #FFFFFF · tekst #0A1F17 · dempet #5E5C57 · kantlinje #E5E3DD · primær #005840 · aksent #D1F843.
- Pyramide-farger (begge tema, som tokens): FYS #005840 · TEK #B8852A · SLAG #2563EB · SPILL #D1F843 · TURN #A32D2D.
- Fonter Inter (UI) · Inter Tight (overskrift) · JetBrains Mono (ALLE tall). Lucide-ikoner (1.5px). 8pt-grid.
  Lime KUN som signal (aktiv/NÅ/haster). ADHD: én ting i fokus, «hva nå» åpenbart.

DOMENE-VOKABULAR (bruk EKSAKT — ikke finn opp):
- Kategori A–K (spillernivå; A = elite, K = nybegynner). Pyramide: FYS · TEK · SLAG · SPILL · TURN.
- L-faser: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO (uten kølle/ball → kølle → ball).
- Fart-soner (i stedet for absolutt %): Sakte 50–60 · Kontroll 60–75 · Normal 75–90 · Full 90–100 — m/ kalibrert mph bak.
- Miljø-arenaer (stigende realisme): nett/matte · TrackMan-sim · range (⚠ rangeballer upålitelige) · gress/kort hullsbane ·
  bane-trening · bane-resultat · turnering (modus: Trening · Utvikling · Prestasjon).
- Press fra konkrete faktorer: tilskuere (ingen→foreldre→gruppe→publikum) · konsekvens (ingen→score→turnering) · sosialt.
- P-system P1–P10 (Standard); Advanced = desimal P1.1–P1.9 (bryt ned, særlig nærspill). PUTTING har IKKE P-posisjoner / club speed.
- Treningsområder: TEE · INN200/150/100/50 · CHIP · PITCH · LOB · BUNKER · PUTT 0–3…40+ · SPILL.

KONSEPT (styrer alt): Repeterbar levering av kølle til ball. P-posisjoner er VERKTØYET, ikke målet.
Data foreslår → coach godkjenner → spiller trener → TrackMan beviser → agent varsler stagnasjon.

═══ COACH-SKJERMER (AgencyOS · MØRKT) ═══
1. OPPRETT/REDIGER PLAN: navn · MÅLSETTING · startdato · sluttdato · SCOPE (slagtype/avstand, grunnslag vs
   spesialslag) · NIVÅ Standard (P1–P10) eller Advanced (desimal). Tilstander: opprett vs rediger, valideringsfeil.
2. PLAN-OVERSIKT (hovedskjerm):
   - TOPP: planens MÅL + «repeterbarhet»-fremdrift (hvor stabil er leveringen nå vs mål) — STØRST element.
   - NÅSITUASJON-snapshot: gjennomsnitt · TrackMan-data · SG-statistikk · bilder/video.
   - TIDSLINJE: planen mot ÅRSPLAN + PERIODISERING (GRUNN/SPES/TURN/EVAL/FERIE) + KONKURRANSER + TRENINGSSAMLINGER.
   - POSISJONER: P0–P10 (Advanced: desimal-underposisjoner innrykket), hver m/ oppgaver, fremdriftsbar, hovedfokus-markør.
   - FORESLÅTTE OPPGAVER (fra data): kort fra TrackMan/SG/test, f.eks. «faceAngle drifter åpen → oppgave P6» m/ GODKJENN/AVVIS.
   - Tilstander: tom plan (ingen posisjoner/oppgaver), ingen forslag, laster, feil.
3. OPPGAVE-EDITOR (egen skjerm): velg P (auto P1, Advanced desimal) · beskrivelse (tekst + bilde + video) ·
   MÅLBAR METRIKK baseline → mål (f.eks. «hofterotasjon 45° i P4») · FILM-VINKEL (Face on · Down the line · Rear) ·
   REP-MÅL per fase/utstyr i 3 farter DRY/LAV/FULL (f.eks. «bare kropp 1500x») · AK-FORMEL-KODING der feltene
   vises DYNAMISK per pyramide/slagtype (putting uten P-posisjoner/club speed; FYS uten golf-felt) · KOBLE TIL DRILL fra banken.
4. GRUPPE / AI-UTKAST: bruk en plan som MAL på en hel gruppe (bulk, godkjenn-kø per spiller) · AI-UTKAST av plan fra
   spillerens nå-situasjon (coach redigerer/godkjenner). Tilstander: tomt utvalg, genererer, resultat.

═══ SPILLER-SKJERMER (PlayerHQ · LYST, mobil-først) ═══
5. TEKNISK TRENING (i spillerens workbench): alle UFERDIGE tekniske oppgaver på tvers av alle slag · logg reps →
   fremdrift AUTO-oppdateres · etter TrackMan-import: vis om endringen SITTER (mål-protokoll) + STAGNASJON-varsel.
   Tilstander: ingen oppgaver, alt fullført, laster, feil.
6. SPILLERENS PLAN-VISNING: les egen teknisk plan (posisjoner, oppgaver, video, mål) + fremdrift. Lese + logge, ikke redigere.

LEVERANSE: alle SEKS skjermene kodeklart, RIKTIG tema per skjerm (coach mørkt / spiller lyst), alle tilstander,
desktop + mobil. Gjør planens MÅL (repeterbar levering) synlig — ikke bare en P-liste.
```
