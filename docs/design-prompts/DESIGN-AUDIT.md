# Design-audit + iterasjons-strategi

> Endring i tilnærming: Vi designer ikke fra null. Vi løfter eksisterende skjermer flere hakk.

## Hvorfor denne tilnærmingen

Vi har **allerede massivt med design** på plass:
- V2-designsystem implementert (`wireframe/design-files-v2/`)
- 80+ ruter i `src/app/` med Tailwind-baserte komponenter
- Sammensatt designspråk: Geist + Instrument Serif + JetBrains Mono, lyst tema med mørk sidebar, pyramide-farger
- 78 fra-null-prompter på lager hvis vi trenger dem

**Problem:** Mange skjermer er funksjonelle men ikke spesielt fine. De ser ut som "AI-generert dashboard" — generic, lik 2×2-rutenett, lite editorial.

**Mål:** Løfte hver skjerm til **produksjonsfin kvalitet** — det Anders kan vise potensielle kunder uten å skamme seg.

---

## Tre kategorier per skjerm

Hver skjerm faller i én av tre bokser:

### 🟢 OK som er — kun mikro-fiks
Skjermer som allerede er pene. Eksempler: PlayerHQ Hjem, AgencyOS, /portal/mal/runder, /admin/elever.
**Aksjon:** Polish-pass (typografi, spacing, ikon-konsistens). Ingen redesign.

### 🟡 Trenger iterasjon — diff-prompt
Funksjonelle skjermer som mangler personlighet, hierarki, eller har feil tone.
**Aksjon:** Lag iterasjons-prompt som peker på eksisterende skjermbilde + beskriver konkrete forbedringer.

### 🔴 Trenger redesign — fra-null-prompt
Skjermer som ikke eksisterer ennå, eller eksisterer som dårlig stub.
**Aksjon:** Bruk eksisterende fra-null-prompter i `01-11-*.md`.

---

## Audit-prosess

For hver skjerm:

### Steg 1: Ta screenshot
```bash
# Bruk Claude Preview (kjør i denne sesjonen):
mcp__Claude_Preview__preview_eval — naviger til /url
mcp__Claude_Preview__preview_screenshot — lagre
```
Lagre som `_audit/screenshots/{skjerm-id}.png`.

### Steg 2: Vurder mot kvalitetskriterier
- [ ] **Hierarki:** Tydelig hva som er viktigst? Eyebrow → titteleditorial-italic → KPI?
- [ ] **Typografi:** Geist + Inter Tight + Instrument Serif (italic) + JetBrains Mono brukt riktig?
- [ ] **Spacing:** 8pt-grid, ingen kvalter? Konsistent padding i kort?
- [ ] **Farger:** Kun semantiske tokens (`bg-card`, `text-foreground`)? Pyramide-farger der pyramide brukes?
- [ ] **Editorial moment:** Maks 1 italic Instrument Serif per skjerm (Anders' anti-AI-regel)
- [ ] **JetBrains Mono med tabular-nums** på ALLE tall, datoer, prosenter
- [ ] **Anti-AI:** Variert layout (ikke 2×2)? Spennende, ikke generic?
- [ ] **Norsk bokmål** med riktig æ/ø/å?
- [ ] **CTA-hierarki:** Primær handling tydelig først?
- [ ] **Edge cases:** Tom tilstand, lang tekst, lite data — sjekket?

### Steg 3: Kategoriser
Skriv inn i audit-skjemaet under: 🟢 / 🟡 / 🔴 + 1-liner notat.

### Steg 4: Hvis 🟡 — lag iterasjons-prompt
Bruk malen nedenfor.

### Steg 5: Hvis 🔴 — bruk fra-null-prompt fra eksisterende fil

---

## Iterasjons-prompt-mal

For 🟡-skjermer, bruk denne strukturen i Claude Design:

```
Du er senior UI/UX-designer for AK Golf HQ — løft denne skjermen flere hakk uten å starte fra null.

[LIM INN 00-shared-spec.md]

## Kontekst
Skjerm: {URL}
Eksisterende: Se vedlagt screenshot.

## Hva som er bra og må beholdes
- {struktur som funker}
- {kompinenter som er solide}

## Hva som må endres (i prioritert rekkefølge)
1. **{problem}**: {hva endringen er}
   - Eks: "Hierarkiet er flatt — alle kort har samme størrelse. Gjør hovedhandlingen 2× større, gjør sekundære smalere."
2. **{problem}**: {hva endringen er}
3. ...

## Mål
Skjermen skal føles som noe Anders kan vise til en topp-spiller eller en investor.
Editorial, ikke generic. Variert layout, ikke 2×2-grid.
Editorial italic-frase plassert med presisjon.

## Lever
Én HTML-fil med inline CSS, 1440px viewport. Behold alle eksisterende data — bare det visuelle skal endres.
```

---

## Audit-skjema — fyll ut etter screenshot-sesjon

### CoachHQ (admin)

| Skjerm | URL | Status | Notat | Tiltak |
|---|---|---|---|---|
| Hub (AgencyOS) | `/admin/agencyos` | ? | _Fyll inn_ | _01-11 prompt-fil eller "polish"_ |
| Kalender (uke) | `/admin/calendar` | ? | | |
| Kalender (masterplan) | `/admin/kalender?view=ar` | ? | | |
| Forespørsler | `/admin/foresporsler` | ? | | |
| Innboks | `/admin/innboks` | ? | | |
| Notion-prosjekter | `/admin/notion-prosjekter` | ? | | |
| Notion-oppgaver | `/admin/notion-oppgaver` | ? | | |
| Spillere (tabell) | `/admin/elever` | ? | | |
| Spillere (tavle) | `/admin/board` | ? | | |
| Treningsplaner | `/admin/plans` | ? | | |
| Anlegg | `/admin/anlegg` | ? | | |
| Tjenester | `/admin/services` | ? | | |
| Turneringer | `/admin/tournaments` | ? | | |
| Analytics | `/admin/analytics` | ? | | |
| Rapporter | `/admin/reports` | ? | | |
| Talent | `/admin/talent` | ? | | |
| WAGR-benchmark | `/admin/talent/wagr-benchmark` | ? | | |
| WAGR-import | `/admin/talent/wagr-import` | ? | | |
| Lag-snitt | `/admin/lag-snitt` | ? | | |
| Økonomi | `/admin/finance` | ? | | |
| AI-agenter | `/admin/agents` | ? | | |
| Videoer | `/admin/videoer` | ? | | |
| Recording | `/admin/recording` | ? | | |
| E-postmaler | `/admin/email-templates` | ? | | |
| Team | `/admin/team` | ? | | |
| Integrasjoner | `/admin/integrasjoner` | ? | | |
| Innstillinger | `/admin/settings` | ? | | |
| Tilgang | `/admin/settings/tilgang` | ? | | |
| API-nøkler | `/admin/settings/api` | ? | | |
| Godkjenninger | `/admin/godkjenninger` | ? | | |
| Bookinger | `/admin/bookinger` | ? | | |
| Hjelp | `/admin/hjelp` | ? | | |
| Økter | `/admin/okter` | ? | | |
| Analyse | `/admin/analyse?view=oversikt` | ? | | |
| Krysstabell | `/admin/analyse?view=krysstabell` | ? | | |
| Trender | `/admin/analyse?view=trender` | ? | | |
| SG-kobling | `/admin/analyse?view=sg` | ? | | |
| FYS-progresjon | `/admin/analyse?view=fys` | ? | | |
| Plan vs Faktisk | `/admin/analyse?view=plan-faktisk` | ? | | |
| Caddie chat | `/admin/agencyos/caddie` | ? | | |

### PlayerHQ

| Skjerm | URL | Status | Notat | Tiltak |
|---|---|---|---|---|
| Hjem | `/portal` | ? | | |
| Mål oversikt | `/portal/mal` | ? | | |
| Runder | `/portal/mal/runder` | ? | | |
| Runde-detalj | `/portal/mal/runder/[id]` | ? | | |
| Statistikk | `/portal/mal/statistikk` | ? | | |
| Trackman | `/portal/mal/trackman` | ? | | |
| Trackman-detalj | `/portal/mal/trackman/[id]` | ? | | |
| Goal-detalj | `/portal/mal/goal/[id]` | ? | | |
| Milepæler | `/portal/mal/milepaeler` | ? | | |
| Leaderboard | `/portal/mal/leaderboard` | ? | | |
| Baner | `/portal/mal/baner` | ? | | |
| Trening-oversikt | `/portal/tren` | ? | | |
| Årsplan | `/portal/tren/aarsplan` | ? | | |
| Kalender (player) | `/portal/tren/kalender` | ? | | |
| Turneringer | `/portal/tren/turneringer` | ? | | |
| Øvelser | `/portal/tren/ovelser` | ? | | |
| Tester | `/portal/tren/tester` | ? | | |
| Coach-oversikt | `/portal/coach` | ? | | |
| Planer | `/portal/coach/plans` | ? | | |
| Plan-detalj | `/portal/coach/plans/[id]` | ? | | |
| Øvelser-coach | `/portal/coach/ovelser` | ? | | |
| Meldinger | `/portal/coach/melding` | ? | | |
| Notater | `/portal/coach/notes` | ? | | |
| Videoer | `/portal/coach/videoer` | ? | | |
| AI-coach | `/portal/coach/ai` | ? | | |
| Min profil | `/portal/meg` | ? | | |
| Abonnement | `/portal/meg/abonnement` | ? | | |
| Bookinger | `/portal/meg/bookinger` | ? | | |
| Foreldre | `/portal/meg/foreldre` | ? | | |
| Helse | `/portal/meg/helse` | ? | | |
| Utstyrsbag | `/portal/meg/utstyrsbag` | ? | | |
| Dokumenter | `/portal/meg/dokumenter` | ? | | |
| Innstillinger | `/portal/meg/innstillinger` | ? | | |
| Sikkerhet | `/portal/meg/sikkerhet` | ? | | |
| Hjelp | `/portal/meg/help` | ? | | |
| Utfordringer | `/portal/utfordringer` | ? | | |
| Utfordring-detalj | `/portal/utfordringer/[id]` | ? | | |
| Varsler | `/portal/varsler` | ? | | |
| Ny økt | `/portal/ny-okt` | ? | | |
| Ønskelig økt | `/portal/onskeligokt` | ? | | |
| Booking | `/portal/booking` | ? | | |
| Booking ny | `/portal/booking/ny` | ? | | |
| Live | `/portal/live/[id]` | ? | | |

---

## Anbefalt rekkefølge

### Fase 1 — Topp 10 (mest synlige, brukes daglig)
1. `/admin/agencyos` (Hub) — Anders' hovedflate
2. `/admin/agencyos/caddie` — AI-assistenten
3. `/admin/kalender?view=ar` — årsplanen
4. `/admin/analyse?view=krysstabell` — kjerneinnsikten
5. `/portal` — PlayerHQ hjem
6. `/portal/mal` — målsetning-oversikt
7. `/portal/tren` — trening-oversikt
8. `/portal/coach` — coach-fanen
9. `/portal/live/[id]` — live session
10. `/portal/meg` — profil

### Fase 2 — Sekundære (10-20 stk)
Resten av kjerneflyt: bookinger, analyse-sub-visninger, planer, øvelser, tester.

### Fase 3 — Admin-detaljer (resten)
Settings, integrasjoner, talent, rapporter.

---

## Verktøyflyt

For å gjøre auditen effektiv:

```bash
# 1. Start dev-server
npm run dev

# 2. Ta screenshot av hver rute manuelt
# eller via:
node scripts/screenshot-all-routes.js   # (lag dette skriptet)
```

Eller — for hver skjerm, bruk Claude Code med Preview-MCP til å navigere og ta screenshot. Jeg kan gjøre det for deg ved å starte preview-serveren.

---

## Hva vi gjør NÅ

**Anbefaling:** Start med Topp 5 fra Fase 1:
1. Ta screenshots av eksisterende
2. Vurder med kvalitetskriteriene
3. Lag iterasjons-prompt per skjerm
4. Kjør i Claude Design → få forbedret HTML
5. Sammenlign med eksisterende — beslutt redesign eller polish

**Da har vi en konkret prosess som ikke avhenger av å designe 73 skjermer fra null.**

Si fra — jeg starter screenshot-runden av topp 5 nå hvis du vil.
