# Teknisk plan — forbedring av eksisterende + de 4 nye delene (2026-06-28)

> Vurdert mot faktisk kode: src/components/teknisk-plan/{task-card,p-row,plan-card,sidebar,oppgave-modal,
> page-head}.tsx + teknisk-plan.css + oppgave-modal.css, og rutene /admin/teknisk-plan & /portal/tren/teknisk-plan.
> Vurderingen er kode-basert (skjermene er innlogget-gated, ikke rendret).

## A. DAGENS SKJERMER — vurdering

### Styrker (behold)
- **Sterk komponent-struktur:** `task-card` viser AK-formel som tags (pyramide · område · kølle · L-fase · CS · M · PR)
  + 3-farts rep-progress (DRY/LAV/FULL) med fremdriftsbarer. `p-row`, `plan-card`, `sidebar`, `page-head` er ryddig delt opp.
- **`oppgave-modal`** har «Baseline → Mål»-metrikk (dekker «hofterotasjon 45°»), media, AK-formel-koding.
- Drag-drop-prioritering (`sortOrder`), Lucide-ikoner, norske tall (`toLocaleString("nb-NO")`).
- Dyp, korrekt datamodell bak (se audit).

### Svakheter (forbedres)
1. **Egen CSS med hardkodede hex (designsystem-brudd):** `teknisk-plan.css` + `oppgave-modal.css` bruker ~28
   hardkodede hex ved siden av tokens. Flere er pyramide-farger (#005840/#B8852A/#D1F843/#A32D2D …) som burde
   vært `--pyr-*`-tokens. Vanskelig å vedlikeholde og lett å drifte fra fasiten.
2. **Mistanke om lys-tema-rester:** `#EFEDE6` (cream) i oppgave-modal.css adapterer IKKE til mørkt. Komponenten
   brukes både i PlayerHQ (lyst) og AgencyOS (mørkt) — må verifiseres at den rendrer riktig i `.dark`.
3. **Handover-grade ikke sikret:** må bekrefte alle tilstander (tom plan, ingen oppgaver, laster, feil, lang tekst) + mobil.
4. **UX-fokus:** planen presenteres som «liste av P-posisjoner». Men målet er **repeterbar levering** — posisjoner
   er verktøyet. Gjør planens MÅL og fremdrift mot det mer synlig enn selve P-lista.

### Forbedringer (prioritert)
1. **Token-migrering:** flytt alle hardkodede hex i de to CSS-filene til designsystem-tokens (pyramide-farger →
   `--pyr-*`; fjern cream/lys-rester). Sikre korrekt rendering i `.dark` (AgencyOS) OG lyst (PlayerHQ).
2. **Handover-grade-pass:** alle tilstander + mobil + 8pt + lime kun som signal.
3. **UX-løft:** legg nåsituasjon + tidslinje øverst (de nye delene under), og en tydelig «mål → fremdrift»-topp
   («repeterbarhet»: hvor stabil er leveringen nå vs mål), ikke bare P-lista.

## B. DE 4 NYE DELENE — beste løsning (10/10)

### 1. Standard / Advanced + desimal-P
- Legg `planNivaa` (STANDARD | ADVANCED) på `TechnicalPlan`. Standard = P1–P10.
- Advanced: la coach **bryte ned en P i finere trinn** (P1.1–P1.9) — `pNummer` er alt fri streng, så minimal
  modell-endring. Vis underposisjoner innrykket under hoved-P-en (særlig nærspill: «chip → P2 baksving → P1.1…P1.9»).
- UI: en enkel toggle på planen; i Advanced får hver P en «+ bryt ned»-handling. Ikke overveldende — skjult bak Standard som default.

### 2. Film-vinkel
- Legg `filmVinkel` på `PositionTask` (enum/flervalg: FACE_ON · DOWN_THE_LINE · REAR · evt. flere).
- I oppgaven: tydelig «Film fra»-velger med ikon, koblet til video-opplasting (videoUrl finnes). Slik vet
  spiller/coach hvilken vinkel som skal sjekkes, og loggede klipp merkes med vinkel.

### 3. Scope på plan-nivå
- Legg scope på `TechnicalPlan` (slagtype/avstand + grunnslag vs spesialslag) som **filtrerer/sammenfatter** hvilke
  områder planen gjelder. Vis et tydelig scope-sammendrag øverst («Driver + jern, fulle slag, grunnslag»), og bruk
  det til å foreslå relevante P-er/områder når coach legger til oppgaver.

### 4. Nåsituasjon + tidslinje
- **Nåsituasjon-blokk** øverst: snapshot av snitt + TrackMan-data + SG-statistikk + bilder/video (data finnes per
  oppgave; samle et plan-nivå snapshot). «Her og nå» som planen måles mot.
- **Tidslinje-komponent:** gjenbruk `year-plan-gantt` (athletic/calendars) og legg planen mot **periodisering**
  (`periodBlockId`), **konkurranser** (`TournamentEntry`) og **treningssamlinger** (`TrainingCamp`). Alt finnes som data.

## C. Anbefalt rekkefølge
1. Token-migrering + tema-korrekthet på dagens skjermer (gjør dem handover-klare). 2. Nåsituasjon + tidslinje (størst UX-verdi).
3. Film-vinkel. 4. Standard/Advanced + desimal-P. 5. Plan-scope. Hver via design-gaten (bygg → uavhengig kritikk → 0 avvik).
