# AK Golf Platform — CoachHQ — Sesjon Opptak (Deepgram pipeline)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/sesjon/opptak/:id`
- **Arketype:** E — Fullscreen / Live (recording + pipeline)
- **Tier-gating:** Pro coach-tier
- **HTML-referanse:** `wireframe/screen-deck/coachhq/sesjon-opptak.html`
- **Audit:** `wireframe/audit/coachhq-sesjon-opptak.md`
- **Tilhørende modaler:** `AgentFeedbackModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Sesjonsopptak er CoachHQs fullscreen-flate hvor coach starter et lyd-opptak under en coaching-økt. Deepgram transkriberer i sanntid; en pipeline kjører deretter for å trekke ut nøkkelpunkter, koble dem til spillerens plan, og foreslå oppdateringer. Skjermen viser opptaksstatus (REC + tid), live-transkripsjon nederst (subtle scroll), og pipeline-progress (Transkriberer → Analyserer → Foreslår oppdateringer). Resultater går automatisk inn i Godkjenninger-koen.

## Layout — UNIKT for denne skjermen

Bruker arketype-E-felles-spec. **Fullscreen, ingen sidebar.** Bakgrunn `#0A1F18` med subtil noise-grain.

### Topp-bar (56px)

- **Venstre:** Rød pulserende REC-prikk + "REC 12:34" JetBrains Mono 14px
- **Senter:** "Markus R Pedersen — TEK · Driver" Geist 14px + spiller-avatar 24px
- **Høyre:** Lukk-X 40×40px (med bekreftelse)

### Senter — pipeline-visualisering

Sentrert horisontalt 3-stegs-pipeline:

```
[ ] Transkriberer  ──→  [ ] Analyserer  ──→  [ ] Foreslår oppdateringer
   12:34 (live)         vente                vente
```

- **Aktivt steg:** Lime border + glow + spinner-ring
- **Ferdig steg:** Lime check-ikon + tekst dempet
- **Venter steg:** Grå dempet + dot-icon

Under pipelinen: stor sentrert wave-form (audio-visualisering, lime accent når lyd detekteres, dempet når stille). 200px høy.

### Live-transkripsjon (subtle scroll, nederst over bunn-bar)

Container `max-height: 200px`, scroll-y, fader øverst. Nyeste linje nederst.

```
[14:32] ... og så slo jeg en ny ball som gikk
[14:32] ... 240 meter, ganske rett
[14:33] ... tror grepet føles bedre nå
```

Geist Mono 13px, muted-foreground for eldre, foreground for de 2 nyeste.

### Bunn-bar (88px)

- Venstre 50%: `Pause opptak` (secondary, 56px) — slår av REC-prikk men beholder pipeline
- Høyre 50%: `Avslutt og analyser` (primary lime, 88px) — stopper REC og kjører full pipeline

## States å designe

| State | Beskrivelse |
|---|---|
| Idle (klar til start) | Pipeline alle 3 steg grå, "Trykk for å starte opptak" sentrert |
| Recording (aktiv) | REC pulserer, transkripsjon ruller, wave-form lever |
| Paused | REC dempet, pipeline pauset, "PAUSE" italic Instrument Serif overlay |
| Analyserer (etter avslutt) | Steg 2 aktivt med spinner, transkripsjon frosset |
| Foreslår oppdateringer (steg 3) | Steg 3 aktivt, "Periodiserings-agent jobber ..." muted |
| Ferdig | Alle 3 steg checked, sentrert kort "3 forslag sendt til Godkjenninger →" + CTA |
| Error (Deepgram fail) | Rød ring rundt steg 1, "Opptaket ble brutt — prøv igjen ↺" |

## Klikkbare elementer

| Element | States |
|---|---|
| Pause opptak | default, hover, klikk → REC dempes |
| Avslutt og analyser | default, hover, loading (pipeline kjører) |
| Pipeline-steg | hover → tooltip med steg-detaljer, klikk → ingen handling |
| Lukk-X | klikk → bekreftelse "Avslutt uten å lagre?" |
| Wave-form | static visual, ingen interaksjon |
| Transkripsjon-linje | hover → tidsstempel-tooltip |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (Deepgram kobler til):** Spinner + "Kobler til Deepgram ..."
- **Error mikrofon:** Sentrert kort med `MicOff`-ikon + "Ingen mikrofon-tilgang. Sjekk innstillinger →"
- **Error pipeline:** "Analyse feilet — opptaket er lagret, prøv igjen ↺"
- **Tier-gate:** Sentrert overlay "Pro: AI-drevet sesjonsanalyse → Oppgrader"

## Ønsket output fra Claude Design

1. Idle-state — klar til å starte
2. Recording aktiv — REC pulser, transkripsjon ruller, wave-form lever
3. Pause-state med "PAUSE"-overlay
4. Analyserer (steg 2 aktivt med spinner)
5. Ferdig — alle 3 checked + "3 forslag sendt"-CTA
6. Mobil — pipeline vertikalt stacket, transkripsjon full bredde

## Ikke-mål

- Ikke designe `AgentFeedbackModal` (egen pakke)
- Ikke designe transkripsjon-redigerings-skjerm
- Ikke designe Deepgram-konfig
- Ikke designe Godkjenninger-koen (det er pakke 3 i batch-2)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
