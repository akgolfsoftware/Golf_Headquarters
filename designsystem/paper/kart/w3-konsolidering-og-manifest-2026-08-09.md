# W3 — konsolideringsgate og manifest (Meg · Booking · Talent · Coach), 2026-08-09

Anders valgte W3 som neste bølge (W7-spørsmålet, 09.08). Anslaget i planen var **63**
(27 + 6 + 5 + 20 + 5 aliaser). Verifisert mot kode på `main`: **63 ruter finnes**, men bare
**17 er reelle skjermer**, og de dekkes av **6 maler**.

## Konsolideringsgate — vedtak til Anders

### 1. Legacy-coach: 10 ruter er ikke skjermer
`src/app/portal/(legacy)/coach/*` — alle ti filene er 169–191 byte, altså rene
redirect-stubber til v2-rutene (`[coachId]`, `melding/[id]`, `melding/[id]/vedlegg`, `notes`,
`notes/[noteId]`, `ovelser/[id]/rediger`, `ovelser/ny`, `plans/[planId]`,
`plans/[planId]/ny-okt`, `plans/perioder`). **Tegnes ikke, kodes ikke.** Dette er hele
«Coach 20» minus de 10 v2-rutene. — *Anbefalt ja.*

### 2. Tre Meg-ruter er også redirects
`meg/innstillinger/eksport` (378 B), `meg/sikkerhet` (439 B), `meg/abonnement/oppgrader`
(332 B). Stubber til hhv. personvern, innstillinger/sikkerhet og oppgrader/flyt.
**Utgår som skjermer.** — *Anbefalt ja.*

### 3. Innstillinger: 9 ruter → ÉN mal
Hub + `varsler` · `sprak` · `okter` · `anlegg` · `ai-coach` · `personvern` · `sikkerhet` ·
`integrasjoner` deler informasjonsarkitektur fullstendig (tilbakelenke → gruppert liste av
brytere/valg → info-stripe, alt lagres umiddelbart). Én mal-wireframe + én avvikslinje hver.
— *Anbefalt ja.*

### 4. Hjelpesenteret: 4 ruter → 0 nye
`meg/help` · `help/kategori/[slug]` · `help/artikkel/[slug]` · `help/kontakt` er
prosa/liste-flater identiske i oppbygning med **GFGK veileder-artikkel** (tegnet i W6) og
§10-listemalen. Gjenbrukes med byttet chrome. — *Anbefalt ja.*

### 5. Booking: 7 ruter → 1 veiviser + 2 kvitteringsvarianter
`booking/ny` er hele flyten (query-drevet: `?service=` → steg 2, `&dato=` → steg 3).
`ny/bekreft`, `bekreftet`, `[bookingId]`, `coach/[coachId]`, `anlegg/[anleggId]` er
oppsummerings-/detaljkort på §12-malen. Uten coaching-pakke redirecter `booking/ny` til
`/coaching` — ikke skjerm. — *Anbefalt ja.*

### 6. Talent: 5 ruter → 2 skjermer
`mitt-niva` (fem akser + kohort) og `roadmap` (faser + turneringer + milepæler) er de to
med egen IA. `talent` (hub) og `min-plan` er sammenstillinger av de samme dataene;
`sammenligning` er kohorttabellen på §9-malen. Alle tre gate-es av `FEATURES.TALENT`
(av → `notFound`). — *Anbefalt ja, med forbehold:* hub-en bør sees mot PR-E
(TalentHQ-i-meny) før koding.

### 7. Aliasene (5) er redirects
Bekreftet: ingen av dem har egen `page.tsx` med innhold. **Utgår.** — *Anbefalt ja.*

**Netto: 63 anslått → 17 reelle → 6 tegnede maler.** 46 ruter faller bort som stubber,
redirects eller mal-gjenbruk.

## Tegnet i denne økten (6 wireframes + 2 delte filer)

| Fil | Rute(r) den er fasit for | Mal | Tilstander |
|---|---|---|---|
| `playerhq-innstillinger.html` | `/meg/innstillinger` + 8 undersider | §8 skjema | Suksess · Under 16 (venter samtykke) · Laster |
| `playerhq-abonnement.html` | `/meg/abonnement` (+ faktura, kort/ny, avbestill, oppgrader/flyt) | §12 detalj | Gratis via pakke · Kan oppgradere · Betaling feilet · Tom |
| `playerhq-helse.html` | `/meg/helse` (+ symptom/ny som ark) | §8 skjema + §11 tall | Suksess · Samtykke avslått · Tom |
| `playerhq-booking-ny.html` | `/booking/ny` (+ bekreft, bekreftet, [bookingId]) | §8 flerstegs | Steg 1 · Steg 3 · Credits brukt opp · Ingen tjenester |
| `playerhq-coach-hub.html` | `/coach` + `/coach/melding` (+ ai, ovelser, plans, videoer, sporsmal) | §11 hub + tråd | Hub · Tråd · Uten coach (I0) · Tom tråd |
| `playerhq-talent.html` | `/talent/mitt-niva` + `/talent/roadmap` (+ hub, min-plan) | §12 detalj | Mitt nivå · Roadmap · Ikke i programmet · Tom sesongplan |
| `w3-base.css` | — | tokens + delt skall | akhq-tokens v3.1 **verbatim** |
| `w3-demo.js` | — | delt demo-rigg | tilstandsbryter + tema |

**Avvik fra W1-formen:** W1-filene har tokens inline. W3 er 6 filer med identisk skall, så
tokens + skall ligger i `w3-base.css` — verdiene er kopiert verbatim og uendret. Endres
tokens, må fase1-filene og denne endres samtidig.

Alle seks: `data-od-id` på alt interaktivt, norsk bokmål, 44/48 px trykkflater, lys + mørk
via `data-theme`, én aksenthandling per skjerm (kontrakt §3), 430 px ramme som fyller
skjermen under 641 px og går til 720 px kolonne over 1024 px.

## Avvikslinjer — undersider som følger malene

**Innstillinger:** `varsler` = kun varselgruppa · `sprak` = radioliste (nb/en) ·
`okter` = standardvarighet + påminnelsestid · `anlegg` = liste med hjemmeanlegg først ·
`ai-coach` = tone + hvor mye den foreslår + av/på · `personvern` = samtykker + eksport +
sletting (destruktiv handling nederst, aldri aksentfarge) · `sikkerhet` = passord + 2FA ·
`integrasjoner` = tilkoblede tjenester med status per rad.

**Abonnement:** `faktura/[id]` = kvitteringsdetalj, nedlastbar PDF · `kort/ny` =
kortskjema (Stripe-element) · `avbestill` = bekreftelse med hva du mister og når ·
`oppgrader/flyt` = pakkevalg → betaling.

**Coach:** `ai` = chat på trådmalen med AI-avsender · `ovelser`/`videoer` = §10 liste ·
`plans` = periodeliste · `sg-hub` = §9 tabell · `sporsmal` + `[id]` + `ny` = liste + tråd +
skjema.

## Åpne punkter til Anders

1. **Talent-hub vs. mitt-niva:** bør `/portal/talent` bli en ren redirect til `mitt-niva`?
   De viser i praksis samme tall. Tegnet som om hub-en består — si fra hvis den skal ut.
2. **PR-E henger fortsatt:** TalentHQ-i-meny og testantall (20/21/25). Påvirker
   talent-skjermene og tester-huben fra W1.
3. **FYS-formelen:** helse-skjermen viser FYS-score som «—» med plassholder-merknad, samme
   flagg som W1s fys-plan. Uendret til formelen er vedtatt.
4. **Hjelpesenteret:** vedtak 4 gjenbruker GFGK-artikkelmalen med PlayerHQ-chrome. Vil du
   heller ha en egen tegnet variant, sier du fra — det er én ekstra fil.

## Regnskap

W6 la +10 ruter (343 → 353). W3 tegner 6 nye fasitfiler; dekningen går fra 25 fasit +
11 (W1) + W2-batchen + 4 (W6) til **+6**. `fasit-liste-paper.md` oppdateres ved porting.
