# Claude Design-prompter: COACHHQ ADMIN (9 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.

---

## Prompt 5.1 — Caddie chat-side full

```
Du er senior UI/UX-designer for AK Golf HQ. Design CADDIE-skjermen i full-view — Anders' personlige agent som svarer på spørsmål om porteføljen og foreslår handlinger.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Caddie

URL: /admin/agencyos/caddie
Bruker: Coach Anders

### Layout — fire-panel
- Venstre: CoachHQ dark sidebar 256px (mørk #061210, "AgencyOS · Caddie" aktiv)
- Kolonne 2: Samtaleliste 240px (hvit, border-right)
- Kolonne 3: Chat-tråd flex-1 (sentrert content 720px max)
- Høyre: Approval-kø 280px (lyst grå #FAFAF7, sticky)

### Samtaleliste (240px)
- Søk-felt øverst ("Søk samtaler...")
- "+ Ny samtale"-knapp (primary, full bredde)
- 12 samtale-rader, sortert etter tid:
  1. **Markus R · uke 19-status** (aktiv, lime venstre-kant)
     - "Hvor mye TEK siste 7d?"
     - 14 min siden
  2. **Periodisering Emma S** — i går
  3. **Deload-vurdering Joachim** — i går
  4. **WAGR-import 27 spillere** — 2 dager
  5. **Eskalering Lina H · skade** — 3 dager
  6. **Sesong-prognose A1-gruppen** — 4 dager
  7. **Faktura-purring mai** — 5 dager
  8. **Sponsor-rapport Q1** — 1 uke
  9-12. flere eldre, dempet

Hvert kort: tittel, snippet (12 ord ellipsis), tid mono 10px

### Chat-tråd (sentrert)

#### Header
- Tittel: "Markus R · uke 19-status"
- Sub: "Caddie · GPT-5 · 14 verktøy tilgjengelig"
- Knapper øverst-høyre: [Del] [Eksporter] [Slett]

#### Meldinger (5 stk, alternerende align)

**1. Anders (user, høyre, mørk grønn boble)**
"Gi meg ukes-status på Markus. Er han på sporet mot Oslo Open?"
Mono 10px tid: 10:42

**2. Caddie (assistant, venstre, hvit kort med border)**
- Avatar: liten lime sirkel med "C" (mono)
- Streaming-indikator (3 prikker pulserer) — vis som ferdig
- Tekst: "Henter status på Markus R for uke 19."
- Tool-call-kort under (kollapsbar):
  ```
  ▸ getPlayerStatus("markus-r", { weeks: 1 })
    ✓ 230ms · 4 økter · 16.2t trent
  ```

**3. Caddie (svar, fortsetter)**
- Brødtekst: "Markus har trent 16.2 av 18 planlagte timer denne uka (90%). Pyramide-fordeling matcher SPESIALISERING-perioden (TEK 38%, SLAG 27%). Approach 100-150m er hovedfokus — 6t 45min siste 30d, suksess 81%."
- Inline KPI-strip (tre tall, mono):
  - 16.2 / 18 t · TEK 38% · 9 uker til Oslo Open
- Editorial line italic Instrument Serif 16px: *"Han er der han skal være."*

**4. Anders (user)**
"Foreslå justering for uke 20 hvis det trengs."

**5. Caddie (svar)**
- "Basert på myelin-status (TURN 28 dager kald) anbefaler jeg å legge inn én TURN-økt søndag 18. mai. Skal jeg booke?"
- Tool-call-kort:
  ```
  ▸ proposeSessionInsert({
      player: "markus-r",
      pyramide: "TURN",
      slot: "2026-05-18 10:00",
      duration: 60
    })
    ⚠ Krever godkjenning
  ```
- Action-knapper inline: [Godkjenn] [Endre detaljer] [Avvis]

#### Input-rad (sticky bunn)
- Textarea: "Spør Caddie..."
- Knapper høyre: [@] verktøy-velger · [Send] (primary, lime accent på hover)
- Hjelpetekst: "Shift+Enter for ny linje · Caddie kan utføre handlinger som krever godkjenning"

### Approval-kø høyre (280px)
- Header: "Venter godkjenning" + tall-badge "3"
- 3 approval-kort:
  1. **TURN-økt søndag** (Markus R)
     - "Caddie foreslår å legge inn 60 min turnering-øvelse"
     - Tid: nå
     - [Forhåndsvis] [Godkjenn] [Avvis]
  2. **Faktura-purring** (4 spillere)
     - "Send purring til Emma, Joachim, Lina, Mads"
     - Tid: 2 min
     - [Forhåndsvis]
  3. **Eskalering til foreldre** (Joachim)
     - "Send melding om skade-status"
     - Tid: 18 min

Approval-modal preview (annen state i samme HTML-fil, vises som ekstra seksjon nederst):
- Modal max-width 720px, mørk bakdrop
- Header: "Godkjenn handling"
- Forhåndsvisning av eksakt hva som skjer (full session-payload som JSON eller naturlig språk)
- [Avbryt] [Godkjenn og utfør] (primary)

### Editorial moment
Eyebrow: `COACHHQ · AGENCYOS · CADDIE`
Tittel: "Caddien som *kjenner porteføljen.*"

Lever som én HTML-fil med all inline CSS, både hovedvisning og approval-modal som ekstra seksjon.
```

---

## Prompt 5.2 — Sesjonsopptak

```
[LIM INN 00-shared-spec.md]

## Skjerm: Sesjonsopptak

URL: /admin/recording

### Layout — tre-panel
CoachHQ sidebar + RecordingSidebar 280px + Innhold

### RecordingSidebar
- Filter: Spiller-dropdown ("Alle 6 spillere ▾")
- Periode-chips: Siste 7d · 30d · 90d · Egendefinert
- Status-filter: ☑ Transkribert ☑ Pågår ☐ Feilet
- Storage-bruk: "12.4 GB / 50 GB" med bar
- "+ Ny opptak"-knapp (lime accent)

### Hovedinnhold

#### Header
- Eyebrow: `COACHHQ · OPPTAK · SISTE 30 DAGER`
- Tittel: "Stemmen *etter økten.*"
- Sub: "47 opptak · 38t 12min · 44 transkribert · 2 pågår · 1 feilet"

#### KPI-strip (4 kort)
1. Totalt opptak: 47
2. Transkribert: 44 (94%)
3. Snitt-lengde: 8 min 45s
4. Whisper-tid siste 24t: 12 min

#### Opptak-tabell (full bredde, sticky header)

| Tid | Spiller | Økt | Lengde | Status | Handlinger |
|---|---|---|---|---|---|
| 8. mai 11:32 | Markus R | TEK Approach 150m | 12:04 | ✓ Transkribert | [Åpne] |
| 8. mai 14:48 | Emma S | SLAG 1-1 | 7:22 | ✓ Transkribert | [Åpne] |
| 8. mai 17:05 | Joachim T | FYS Stretching | 4:15 | ◐ Pågår 60% | — |
| 7. mai 10:18 | Markus R | SLAG Bunker | 9:48 | ✓ Transkribert | [Åpne] |
| 7. mai 14:32 | Lina H | TEK Putting | 11:02 | ✓ Transkribert | [Åpne] |
| 6. mai 09:15 | Mads R | SLAG Driver | 8:30 | ✗ Feilet | [Prøv igjen] |
| 6. mai 16:00 | Markus R | SPILL Bossum 9 hull | 24:18 | ✓ Transkribert | [Åpne] |
| 5. mai 11:00 | Henrik N | TEK Approach | 6:45 | ✓ Transkribert | [Åpne] |

Vis 8 rader synlig, "Last flere"-link nederst.

Status-pills (chip-style, mono uppercase):
- ✓ Transkribert: lime bg, mørk grønn tekst
- ◐ Pågår: gul/oransje
- ✗ Feilet: rød

#### Detalj-panel (vises når en rad er klikket — vis som "valgt" tilstand)
Slide-in panel høyre, 480px, dekker høyre del:

**Header:**
- Spiller-avatar + "Markus R · TEK Approach 150m"
- "8. mai 2026 · 11:32 · 12 min 04 sek"
- Lukk (×)

**Audio-spiller:** waveform 320px bredt, play/pause, scrub

**Transkripsjon (scrollbar, 12 min ren tekst):**
Vis 3 chunks med tidskoder mono:
```
00:00:12  Anders
"Vi tester gate-drill på 150m. Markus, hvor føler du stand-up er
i takeaway?"

00:00:38  Markus
"Litt for åpen i hoftene tror jeg. Strike er ikke ren."

00:01:15  Anders
"Jeg ser det på trackman — launch-vinkel 18°, du vil ha 14-16.
Prøv P1 med vekt 60% på framfoten."
```

**Chunks-liste (kollapsbar):** 18 chunks, hver 40-80 sek

**Footer:** [Send til Notion] [Eksporter txt] [Slett opptak]

### Editorial moment
Eyebrow: `COACHHQ · OPPTAK`
Tittel: "Stemmen *etter økten.*"

Lever som én HTML-fil med både liste og detalj-panel synlig (panel åpen for Markus' opptak).
```

---

## Prompt 5.3 — Innstillinger

```
[LIM INN 00-shared-spec.md]

## Skjerm: Innstillinger

URL: /admin/settings

### Layout
CoachHQ sidebar + innhold (ingen midt-panel)

### Innhold

#### Header
- Eyebrow: `COACHHQ · INNSTILLINGER`
- Tittel: "Slik du *vil ha det.*"
- Sub: "Anders Kristiansen · ak@akgolfgroup.com · ADMIN"

#### Tab-strip (5 faner)
[Profil] [Varsling] [Integrasjoner] [API-nøkler] [Fakturering]
"Profil" aktiv (2px underline #005840, mørk tekst). Andre dempet grå.

#### Profil-innhold (aktiv fane)

**Seksjon: Personalia (kort, 24px padding)**
- Profilbilde 96×96 sirkel + "Bytt bilde"-link
- Felter i 2-kolonne:
  - Fullt navn: [Anders Kristiansen]
  - E-post: [ak@akgolfgroup.com] (verifisert badge ✓)
  - Telefon: [+47 412 34 567]
  - Tittel: [CEO · Hovedcoach]
  - Tidssone: [Europe/Oslo ▾]
  - Språk: [Norsk bokmål ▾]

Save-state nederst (sticky):
- Status: "Endret · ikke lagret" (gul prikk) ELLER "✓ Lagret 14:32"
- Knapper: [Avbryt] [Lagre endringer] (primary)

**Seksjon: Passord (kort)**
- "Sist endret: 12. januar 2026"
- [Endre passord]-knapp (sekundær)
- "2FA aktivert via Authenticator"-rad med toggle (ON)

**Seksjon: Profil-detaljer (kort)**
- Bio (textarea): "PGA-trener siden 2014. Spesialisering i talent-utvikling og periodisering."
- Sertifiseringer (chips): [PGA Norge] [TPI Level 2] [TrackMan Certified]

#### Tab-preview for de andre fanene (vis som inaktive seksjoner under, slik at designet er komplett):

**Varsling-fane (kort-grid 2 kolonner):**
- E-post-varsling: ON
- Push-varsling (mobil): ON
- Lyd ved approval-request: OFF
- Daglig sammendrag 07:00: ON

**Fakturering-fane (forhåndsvis):**
- Plan: "AK HQ Pro · 1 290 kr/mnd"
- Neste faktura: 15. mai 2026
- [Endre plan] [Last ned fakturaer]

### Editorial moment
Eyebrow: `COACHHQ · INNSTILLINGER`
Tittel: "Slik du *vil ha det.*"

Lever som én HTML-fil — Profil-fane aktiv, andre faner synlig som tab-headers.
```

---

## Prompt 5.4 — Tilgang og roller

```
[LIM INN 00-shared-spec.md]

## Skjerm: Tilgang og roller

URL: /admin/settings/tilgang

### Layout
CoachHQ sidebar + innhold

### Innhold

#### Header
- Eyebrow: `COACHHQ · INNSTILLINGER · TILGANG`
- Tittel: "Hvem ser *hva.*"
- Sub: "12 aktive brukere · 5 roller · siste invitasjon 2 dager siden"

#### Action-rad
- Søk: "Søk brukere..."
- Rolle-filter: chips [Alle] [Admin] [Coach] [Player] [Parent] [Guest]
- Knapper høyre: [Eksporter audit-logg] [+ Inviter bruker] (primary)

#### Brukertabell (full bredde)

| Bruker | E-post | Rolle | Sist innlogget | Status | Handlinger |
|---|---|---|---|---|---|
| Anders Kristiansen | ak@akgolfgroup.com | ADMIN ▾ | Nå | Aktiv | — |
| Henrik Søberg | henrik@akgolf.no | COACH ▾ | 12 min siden | Aktiv | [Endre] [Suspender] |
| Markus Roinås-Pedersen | markus@gmail.com | PLAYER ▾ | 2 t siden | Aktiv | [Endre] |
| Anne Roinås (mor) | anne@gmail.com | PARENT ▾ | I går | Aktiv | [Endre] |
| Emma Sørli | emma@gmail.com | PLAYER ▾ | 3 t siden | Aktiv | [Endre] |
| Joachim Toresen | joachim@gmail.com | PLAYER ▾ | I går | Aktiv | [Endre] |
| Lina Hansen | lina@gmail.com | PLAYER ▾ | 4 dager | ⚠ Inaktiv | [Endre] |
| Mads Risberg | mads@gmail.com | PLAYER ▾ | 1 uke | Aktiv | [Endre] |
| Henrik Nilsen | henrik.n@gmail.com | PLAYER ▾ | 5 t siden | Aktiv | [Endre] |
| Bjørn Lund | bjorn@wang.no | COACH ▾ | 1 dag | Aktiv | [Endre] |
| Sponsor demo | demo@sponsor.no | GUEST ▾ | 14 dager | ⚠ Utløper 3d | [Forny] |
| Marie Sørli (mor) | marie@gmail.com | PARENT ▾ | 2 dager | Pending invitasjon | [Send på nytt] |

Rolle-dropdowns viser farge-pills:
- ADMIN: mørk grønn bg, hvit tekst
- COACH: lime bg, mørk tekst
- PLAYER: hvit bg, mørk grønn border
- PARENT: lyst grå bg, mørk tekst
- GUEST: oransje/gul bg

Hover på rolle-pill: dropdown med 5 valg, "Endre til..."-tekst

#### Invitasjon-modal-preview (kort under tabellen, vis som inline ekspandert)

**Tittel:** "Send invitasjon"
- E-post: [ ]
- Rolle: [PLAYER ▾]
- Spillerkobling (kun hvis PLAYER): [Velg spiller-profil ▾]
- Foreldrekobling (kun hvis PARENT): [Velg barn ▾]
- Tilgangsperiode: ◉ Permanent ◯ 30 dager ◯ Egendefinert
- Melding (valgfri textarea): "Hei Marie, her er din tilgang til PlayerHQ for Emma..."
- [Avbryt] [Send invitasjon] (primary)

#### Audit-logg (kort, full bredde, nederst)

**Header:** "Audit-logg · siste 20 hendelser" + [Vis alle →]

Tabell:
| Tid | Bruker | Handling | Detalj |
|---|---|---|---|
| 14:32 i dag | Anders | LOGIN | IP 84.211.x.x |
| 11:08 i dag | Anders | ROLLE_ENDRET | Henrik Søberg: PLAYER → COACH |
| 09:45 i dag | Henrik S | LOGIN | iPhone Safari |
| I går 19:32 | Anders | INVITASJON_SENDT | marie@gmail.com (PARENT) |
| I går 14:20 | System | TILGANG_UTLØPT | Sponsor demo (forlenget 14 dager) |
| 2 dager | Markus R | LOGIN | iOS app |
| 3 dager | Anders | BRUKER_SUSPENDERT | (reaktivert samme dag) |
| 4 dager | Anders | API_KEY_GENERERT | akg_prod_*** |

Tabell-styling: mono 11px tid, lett alternating row bg.

### Editorial moment
Eyebrow: `COACHHQ · INNSTILLINGER · TILGANG`
Tittel: "Hvem ser *hva.*"

Lever som én HTML-fil.
```

---

## Prompt 5.5 — MCP API-nøkler

```
[LIM INN 00-shared-spec.md]

## Skjerm: API-nøkler

URL: /admin/settings/api

### Layout
CoachHQ sidebar + innhold

### Innhold

#### Header
- Eyebrow: `COACHHQ · INNSTILLINGER · API`
- Tittel: "Nøkler som *snakker for deg.*"
- Sub: "MCP-nøkler for å koble AK Golf HQ til Claude, ChatGPT eller egne agenter."

#### Info-banner (kort, lyst grønn bg)
"Nøkler vises kun én gang når de genereres. Lagre dem trygt — vi kan ikke vise dem igjen."
Ikon: shield-check (Lucide)

#### Action-rad
- Søk: "Søk nøkler..."
- Status-filter: chips [Aktive 4] [Suspendert 1] [Utløpt 2]
- Knapp høyre: [+ Generer ny nøkkel] (primary)

#### Nøkkel-tabell (full bredde)

| Navn | Nøkkel | Tilganger | Sist brukt | Opprettet | Utløper | Handlinger |
|---|---|---|---|---|---|---|
| Claude Desktop · Anders | akg_prod_aB••••••gK | Les · Skriv · Caddie | 14 min siden | 12. mars 2026 | Aldri | [Roter] [Slett] |
| ChatGPT GPT · Spillerstøtte | akg_prod_xY••••••2c | Kun les | 2 t siden | 1. april 2026 | 1. apr 2027 | [Roter] [Slett] |
| iOS-app (Anders) | akg_prod_mN••••••8q | Les · Skriv | I dag 09:12 | 28. april 2026 | Aldri | [Roter] [Slett] |
| Notion-sync | akg_prod_pQ••••••rT | Les · Skriv (begrenset) | 6 t siden | 1. mai 2026 | 1. nov 2026 | [Roter] [Slett] |
| Demo for sponsor (Skarpnord) | akg_demo_zZ••••••wW | Kun les · sandboks | 3 dager | 15. april 2026 | 15. mai 2026 ⚠ | [Forny] [Slett] |
| Henrik Søberg (iPad) | akg_prod_hH••••••5f | SUSPENDERT | 14 dager | 20. mars 2026 | — | [Aktiver] [Slett] |
| Gamle agent-test | akg_prod_dD••••••9j | UTLØPT | 28 dager | 10. feb 2026 | 10. mai 2026 | [Slett] |

Nøkkel-format mono 12px, midt-del maskert med bullet.

Sist brukt mono 11px, rød hvis >30d, grå hvis aldri.

#### Generer ny nøkkel-modal (vis som ekstra seksjon nederst)

**Modal max-width 640px, hvit bg, mørk bakdrop**

**Header:** "Generer ny API-nøkkel"

**Skjema:**
- Navn: [Claude Desktop · Markus] (kreves)
- Beskrivelse (valgfri textarea): "For Markus' personlige Claude Desktop-bruk"
- Tilganger (checkbox-liste):
  - ☑ Les spillerdata (egne)
  - ☑ Skriv øktnotater (egne)
  - ☐ Les portefølje (alle spillere) — kun ADMIN/COACH
  - ☐ Skriv på tvers av spillere — kun ADMIN
  - ☐ Caddie-verktøy
- Miljø: ◉ Produksjon ◯ Sandbox
- Utløper: ◉ Aldri ◯ 30 dager ◯ 90 dager ◯ 1 år ◯ Egendefinert
- IP-begrensning (valgfri): [ ] "F.eks. 84.211.0.0/16"
- Rate limit: [60] req/min ▾

**Footer:** [Avbryt] [Generer nøkkel] (primary)

#### Success-state (vis som ekstra modal-variant)

**Header:** "✓ Nøkkel generert" (sjekk-ikon, lime)

**Nøkkel-visning (stor mono-blokk, kopier-knapp):**
```
akg_prod_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
[Kopier til utklippstavle]
```

Advarsel-banner (gul bg):
"⚠ Dette er eneste gang nøkkelen vises. Lagre den i passordmanager nå."

**Footer:** [Last ned som .env-fil] [Ferdig]

### Editorial moment
Eyebrow: `COACHHQ · INNSTILLINGER · API`
Tittel: "Nøkler som *snakker for deg.*"

Lever som én HTML-fil med tabell + generer-modal + success-state alle synlige som adskilte seksjoner.
```

---

## Prompt 5.6 — E-postmaler

```
[LIM INN 00-shared-spec.md]

## Skjerm: E-postmaler

URL: /admin/email-templates

### Layout — tre-panel
CoachHQ sidebar + Mal-liste 320px + Editor flex-1

### Mal-liste (320px, hvit, border-right)

#### Filter-rad
- Søk: "Søk maler..."
- Kategori-chips: [Alle 12] [Onboarding 3] [Faktura 4] [Coaching 3] [Marketing 2]
- "+ Ny mal"-knapp (primary)

#### Mal-rader (12 stk, scrollbar)
Hver rad:
- Kategori-pill (mono 10px, fargekodet)
- Tittel (Geist 14px medium)
- Snippet 1 linje (12 ord ellipsis, muted)
- Mono 10px: "Sist endret 12. mai · brukt 47x"

1. **Onboarding** · Velkommen ny spiller — "Hei {{spiller.navn}}, velkommen til AK Golf..." · 47x
2. **Onboarding** · Foreldre-intro — "Kjære {{forelder.navn}}, her er din tilgang..." · 12x
3. **Onboarding** · Coach-velkomst — "Hei {{coach.navn}}, klar for sesongen..." · 4x
4. **Faktura** · Faktura sendt — "Faktura {{faktura.nr}} på {{faktura.belop}} kr..." · 142x
5. **Faktura** · Purring 1 (vennlig) — "Hei {{spiller.navn}}, vi savner..." · 18x (aktiv editor)
6. **Faktura** · Purring 2 (formell) — "{{spiller.navn}}, faktura forfalt 14 dager..." · 6x
7. **Faktura** · Inkasso-varsel — "Siste varsel før inkasso..." · 1x
8. **Coaching** · Ukentlig oppsummering — "Markus, her er ukas økter..." · 32x
9. **Coaching** · Periodisering oppdatert — "Ny SPESIALISERING-periode klar..." · 8x
10. **Coaching** · Test-påminnelse — "Tid for SG-test..." · 12x
11. **Marketing** · Månedlig nyhetsbrev — "Mai-nyheter fra AK Golf..." · 1x
12. **Marketing** · Sponsor-rapport Q1 — "Sponsor-oppdatering..." · 1x

Rad 5 har lime venstrekant — markerer aktiv i editor.

### Editor (flex-1)

#### Header
- Eyebrow: `COACHHQ · E-POSTMALER · FAKTURA · PURRING 1`
- Tittel: "Når noen *glemmer å betale.*"
- Sub: "Sendt 18 ganger · sist 5. mai · åpningsrate 84%"

#### Toolbar-rad
- Save-state: "✓ Lagret 14:32" (lime prikk) ELLER "Endret"
- Knapper høyre: [Forhåndsvis] [Send testmail] [Slett mal] [Lagre] (primary)

#### Editor-grid (50/50)

**VENSTRE — Mal-felter**

**Emne:**
[Vi savner betalingen for {{faktura.maaned}}]

**Avsender-navn:**
[Anders Kristiansen]

**Avsender-e-post:**
[ak@akgolfgroup.com ▾]

**Body (textarea-stil rich editor, 480px høyde):**
```
Hei {{spiller.fornavn}},

Vi ser at faktura {{faktura.nr}} på {{faktura.belop}} kr
fortsatt står åpen. Forfallsdato var {{faktura.forfall}}
og det er nå {{faktura.dager_forsent}} dager siden.

Kan du sjekke om dette har blitt oversett?

Betalingsdetaljer:
- Beløp: {{faktura.belop}} kr
- Kontonr: 1234.56.78901
- KID: {{faktura.kid}}

Gi meg gjerne en lyd hvis noe har skjedd — vi hjelper
gjerne med å finne en løsning.

Vennlig hilsen,
{{coach.navn}}
AK Golf Academy
```

Variabel-velger (chips under editor):
[{{spiller.fornavn}}] [{{spiller.etternavn}}] [{{faktura.nr}}] [{{faktura.belop}}] [{{faktura.forfall}}] [{{faktura.dager_forsent}}] [{{faktura.kid}}] [{{coach.navn}}] [+ Ny variabel]

**HØYRE — Forhåndsvisning (live-render)**

**Header:** "Forhåndsvisning · Test-data: Markus R"

**E-post-kort (etterligner Gmail-look):**
```
Fra: Anders Kristiansen <ak@akgolfgroup.com>
Til: markus@gmail.com
Emne: Vi savner betalingen for april

──────────────────────────────────────────

Hei Markus,

Vi ser at faktura 2026-0142 på 3 200 kr fortsatt
står åpen. Forfallsdato var 30. april 2026 og det
er nå 8 dager siden.

Kan du sjekke om dette har blitt oversett?

Betalingsdetaljer:
- Beløp: 3 200 kr
- Kontonr: 1234.56.78901
- KID: 142000026

Gi meg gjerne en lyd hvis noe har skjedd — vi
hjelper gjerne med å finne en løsning.

Vennlig hilsen,
Anders Kristiansen
AK Golf Academy
```

**Test-data-velger (dropdown):**
"Render med data fra: [Markus R ▾]"

**Statistikk-kort under preview:**
- Sendt: 18 ganger
- Åpnet: 15 (83%)
- Klikket lenke: 9 (50%)
- Betalt etter purring: 16 (89%)

### Editorial moment
Eyebrow: `COACHHQ · E-POSTMALER`
Tittel: "Når noen *glemmer å betale.*"

Lever som én HTML-fil med liste + editor + live-preview.
```

---

## Prompt 5.7 — Integrasjoner

```
[LIM INN 00-shared-spec.md]

## Skjerm: Integrasjoner

URL: /admin/integrasjoner

### Layout
CoachHQ sidebar + innhold

### Innhold

#### Header
- Eyebrow: `COACHHQ · INTEGRASJONER`
- Tittel: "Alt som *snakker sammen.*"
- Sub: "10 koblede tjenester · 4 aktive · 2 trenger oppmerksomhet · sist sync 8 min"

#### KPI-strip (4 kort, mono-tall)
1. Koblet: 4 / 10
2. Sync siste 24t: 1 248 hendelser
3. Feilet siste 7d: 3 (forsøker på nytt)
4. Data-volum mai: 4.2 GB

#### Connector-grid (5 kolonner × 2 rader = 10 kort)

Hver kort:
- Kvadratisk-ish layout (220×260px)
- Logo øverst (40×40 placeholder med firma-navn-initial i mørk grønn sirkel)
- Tittel (Geist 16px medium)
- Status-pill mono 10px (lime "TILKOBLET" / grå "IKKE KOBLET" / oransje "TRENGER OPPMERKSOMHET")
- Sub-tekst muted 12px (2 linjer): hva integrasjonen gjør
- Sist synket mono 11px
- Action-knapp i bunn (full bredde): [Koble til] / [Konfigurer] / [Reauth]
- Toggle ON/OFF øverst-høyre (kun for koblede)

**Kortene:**

1. **Gmail** — TILKOBLET (toggle ON, lime)
   - "Sender automatisk faktura og purring fra ak@akgolfgroup.com"
   - Sist synket: 8 min siden
   - [Konfigurer]

2. **Google Calendar** — TILKOBLET (ON)
   - "Synker økter til Anders' personlige kalender"
   - Sist synket: 14 min siden
   - [Konfigurer]

3. **Notion** — TILKOBLET (ON)
   - "Speil av spillerprofiler og økt-notater"
   - Sist synket: 2 t siden
   - [Konfigurer]

4. **Stripe** — TRENGER OPPMERKSOMHET (oransje pill)
   - "Webhook feilet 3 ganger siste 24t. Re-autentiser."
   - Sist synket: 18 t siden
   - [Reauth] (oransje knapp)

5. **Linear** — IKKE KOBLET (grå pill)
   - "Send tasks til ditt eget Linear-prosjekt"
   - [Koble til]

6. **Slack** — IKKE KOBLET
   - "Få varsler i Slack-kanal når noe krever godkjenning"
   - [Koble til]

7. **Google Drive** — TILKOBLET (ON)
   - "Lagre opptak og rapporter i AK Golf Group-mappe"
   - Sist synket: 32 min siden
   - [Konfigurer]

8. **Figma** — IKKE KOBLET
   - "Hent design-tokens og komponentbibliotek"
   - [Koble til]

9. **Vercel** — TILKOBLET (ON)
   - "Deploy-status og runtime-logger"
   - Sist synket: 5 min siden
   - [Konfigurer]

10. **Supabase** — TRENGER OPPMERKSOMHET (oransje)
    - "Service role key utløper om 9 dager. Roter nå."
    - Sist synket: nå
    - [Roter nøkkel]

#### Aktivitets-feed (kort, full bredde, nederst)

**Header:** "Sync-aktivitet · siste 20 hendelser" + [Vis full logg →]

Tabell (mono-tider):
| 14:32 | Gmail | ✓ Sendte faktura-purring til 4 spillere |
| 14:18 | Calendar | ✓ Synket 12 økter til neste uke |
| 13:45 | Notion | ✓ Oppdaterte spillerprofil Markus R |
| 12:30 | Stripe | ✗ Webhook timeout (forsøker igjen) |
| 11:05 | Drive | ✓ Lastet opp opptak (4.2 MB) |
| 10:48 | Vercel | ✓ Deploy success: akgolf-platform |
| 09:15 | Supabase | ⚠ Service role key utløper snart |
| 08:32 | Gmail | ✓ Sendte velkomstmail til Marie Sørli |
| ... |

### Editorial moment
Eyebrow: `COACHHQ · INTEGRASJONER`
Tittel: "Alt som *snakker sammen.*"

Lever som én HTML-fil.
```

---

## Prompt 5.8 — Innboks

```
[LIM INN 00-shared-spec.md]

## Skjerm: Innboks

URL: /admin/innboks

### Layout — tre-panel
CoachHQ sidebar + InnboksSidebar 320px (liste) + Innhold (utvidet visning)

### InnboksSidebar (320px)

#### Tab-strip øverst
[Meldinger 12] [Godkjenninger 3] [Forespørsler 5]

"Meldinger" aktiv (2px underline).

#### Filter-rad
- ☑ Vis kun uleste
- Sortering: [Nyeste først ▾]
- [Marker alle som lest]

#### Meldings-liste (12 rader)

Hver rad:
- Avatar 32×32 (sirkel)
- Avsender (Geist 14px medium) + tid mono 10px høyre
- Snippet (2 linjer ellipsis, muted)
- Tags chips (kategori, prioritet)
- Ulest-prikk: lime venstre-kant

**Rader (varierte tilstander):**

1. **Markus R** · 14 min · ULEST · [SPILLER]
   "Hei Anders, kan vi flytte torsdagens økt til 11:00 i stedet? Jeg har..." (aktiv valgt — lime kant + lyst bg)

2. **Anne Roinås (mor)** · 1 t · ULEST · [FORELDER]
   "Spørsmål om Markus' utstyrsliste — hvilken driver bruker han nå?"

3. **Henrik Søberg (coach)** · 2 t · ULEST · [TEAM] · [HØY]
   "Bossum vil ha tilbakemelding på sponsoravtalen — kan du ringe..."

4. **System** · 3 t · ULEST · [AUTOMAT]
   "Faktura 2026-0148 sendt til 4 spillere. Total 12 800 kr."

5. **Emma Sørli** · I går · LEST · [SPILLER]
   "Tusen takk for økten i dag. Jeg merker virkelig forskjell på..."

6. **Joachim T** · I går · LEST · [SPILLER]
   "Kneet er bedre i dag, prøvde løping uten smerte."

7. **Marie Sørli (mor)** · 2 dager · LEST · [FORELDER]
   "Spørsmål om sommer-camp — kan Emma være med 15-17. juli?"

8. **Lina Hansen** · 3 dager · LEST · [SPILLER]
   "Ferdig med rehab! Klar for å begynne forsiktig..."

9. **System** · 4 dager · LEST · [AUTOMAT]
   "Stripe-payout 14 230 kr ble overført i dag."

10. **Bjørn Lund (WANG)** · 5 dager · LEST · [SAMARBEID]
    "Markus var super-engasjert på samlingen i går..."

11-12. Eldre, dempet.

### Hovedinnhold (utvidet visning for valgt melding)

#### Header
- Avatar 48×48 + "Markus Roinås-Pedersen"
- Sub: "markus@gmail.com · spiller siden 12. mars 2024"
- Tid mono 11px: "Mottatt 8. mai 2026 · 11:18"
- Knapper høyre: [Svar] [Videresend] [Marker som ulest] [Slett]

#### Tags-rad
Chips: [SPILLER] [Markus R] [Booking-endring] [+ Legg til tag]

#### Innhold-kort (hvit bg, 24px padding)
```
Hei Anders,

Kan vi flytte torsdagens økt til 11:00 i stedet?
Jeg har fått en tannlege-time som ble lagt inn etter at
vi avtalte, og jeg klarer ikke å bytte den.

Hvis 11:00 ikke funker, kan jeg ta økten på fredag
morgen i stedet?

Mvh,
Markus
```

#### Caddie-forslag (kort under, lime kant)
**Header:** "Caddie foreslår" + sparkle-ikon

"Markus har TEK-økt torsdag 10:00-11:30. Flytting til 11:00 vil kollidere med Emma S sin 14:00-økt hvis økten varer 90 min. Forslag: flytt til fredag 09:00-10:30 — slot er ledig."

Knapper:
- [Foreslå fredag 09:00] (primary)
- [Foreslå annet alternativ]
- [Svar manuelt]

#### Svar-felt (kollapsbar, åpen)
Textarea: "Skriv svar..."
Mal-velger: [Velg fra mal ▾]
Bunn-rad: [Vedlegg] [Send senere] [Send] (primary)

### Tab-preview for de andre fanene (vis som inaktive headers nederst):

**Godkjenninger-fane:** "3 handlinger venter fra Caddie og system-agenter"
**Forespørsler-fane:** "5 forespørsler fra spillere/foreldre (prøvetimer, sommer-camp, fakturatvil)"

### Editorial moment
Eyebrow: `COACHHQ · INNBOKS`
Tittel: "Alt på *ett sted.*"

Lever som én HTML-fil — Meldinger-fane aktiv, Markus' melding åpen i hovedvisning med Caddie-forslag.
```

---

## Prompt 5.9 — AI-agenter

```
[LIM INN 00-shared-spec.md]

## Skjerm: AI-agenter

URL: /admin/agents

### Layout
CoachHQ sidebar + innhold (ingen midt-panel)

### Innhold

#### Header
- Eyebrow: `COACHHQ · AGENTER`
- Tittel: "Agentene som *jobber i bakgrunnen.*"
- Sub: "4 agenter · 247 kjøringer siste 30d · 12 venter godkjenning"

#### KPI-strip (5 kort, mono-tall)
1. Aktive agenter: 4 / 6
2. Kjøringer siste 24t: 18
3. Suksess-rate: 96% (231/240)
4. Venter godkjenning: 12
5. Estimerte timer spart: 38 t/mnd

#### Agent-grid (2 kolonner × 2 rader, store kort)

Hver kort 480×320px med:
- Header: avatar/ikon + tittel + status-pill
- KPI-rad mono
- Siste-kjøring-snippet
- Trigger-info
- Action-knapper i bunn

**Kort 1: Caddie**
- Avatar: lime sirkel med "C"
- Tittel: "Caddie · Personlig agent"
- Status: AKTIV (lime pill)
- KPI: 142 kjøringer · 98% suksess · sist 14 min
- Siste output: "Foreslo TURN-økt for Markus søndag 18. mai"
- Trigger: "Manuell via chat eller @mention"
- Verktøy: 14 (getPlayerStatus, proposeSession, sendEmail, ...)
- Knapper: [Åpne chat →] [Konfigurer] [Logger]

**Kort 2: Periodisering-agent**
- Avatar: mørk grønn sirkel med "P"
- Tittel: "Periodisering · Sesongplanlegging"
- Status: AKTIV
- KPI: 47 kjøringer · 100% suksess · sist 6 t
- Siste output: "Generert SPESIALISERING-periode for Joachim T (uke 19-30)"
- Trigger: "Når ny spiller legges til eller hver søndag kl 18:00"
- Knapper: [Trigger nå] [Konfigurer] [Logger]

**Kort 3: Deload-agent**
- Avatar: mørk grønn sirkel med "D"
- Tittel: "Deload · Restitusjon-detektor"
- Status: AKTIV
- KPI: 28 kjøringer · 93% suksess · sist 18 t
- Siste output: "Foreslo deload uke 21 for Markus R (CS-snitt > 85% i 3 uker)"
- Trigger: "Hver natt kl 02:00 · scanner alle spillere"
- Knapper: [Trigger nå] [Konfigurer] [Logger]

**Kort 4: Eskalering-agent**
- Avatar: oransje/rød sirkel med "E"
- Tittel: "Eskalering · Foreldre og varsler"
- Status: AKTIV
- KPI: 30 kjøringer · 90% suksess · sist 2 dager
- Siste output: "Sendte skade-varsel til Anne Roinås (Joachims mor)"
- Trigger: "Når skade-flagg settes eller CS faller >20% på 7d"
- Knapper: [Trigger nå] [Konfigurer] [Logger]

#### Inaktive agenter (kort-rad, dempet, 3 kort)

5. **Sponsor-rapport-agent** — IKKE AKTIV (grå pill)
   - "Genererer månedlig sponsor-rapport med stats og bilder"
   - [Aktivér]
6. **Talent-scout-agent** — IKKE AKTIV
   - "Watcher WAGR og NGF-rangering for nye talenter"
   - [Aktivér]

#### Kjørings-historikk (kort, full bredde, nederst)

**Header:** "Siste kjøringer · alle agenter" + Filter: [Alle ▾] + [Vis full logg →]

Tabell mono-tider:
| Tid | Agent | Input | Output | Status | Varighet |
|---|---|---|---|---|---|
| 14:32 | Caddie | "uke 19-status Markus" | Returnerte status + foreslo TURN-økt | ✓ | 2.4s |
| 09:18 | Caddie | "Faktura-purring mai" | Foreslo 4 mottakere | ✓ | 1.8s |
| 06:00 | Deload | (auto) | 6 spillere skannet, 1 forslag | ✓ | 12s |
| 06:00 | Periodisering | (auto) | 0 endringer (alle perioder OK) | ✓ | 8s |
| I går 23:18 | Eskalering | (auto) | Sendte skade-varsel · 1 mottaker | ✓ | 4s |
| I går 18:00 | Periodisering | (auto søndag) | Re-balanserte 2 spillere | ✓ | 18s |
| I går 14:32 | Caddie | "Hvor mye TEK siste 30d?" | Returnerte stats | ✓ | 1.2s |
| 2 dager 02:00 | Deload | (auto) | 1 forslag (Markus) | ✓ | 11s |
| 3 dager 19:32 | Eskalering | (auto) | ⚠ Sendt feil mottaker | ✗ | 6s |

Status-pills: ✓ lime, ✗ rød, ⚠ oransje.

#### Action-rad nederst
- Knapper: [+ Trigger ny kjøring] [Eksporter logg] [Agent-innstillinger globalt]

### Editorial moment
Eyebrow: `COACHHQ · AGENTER`
Tittel: "Agentene som *jobber i bakgrunnen.*"

Lever som én HTML-fil.
```
