# W3 — manifest: Meg · Booking · Coach (komplett)

11 flater. `fase1/` urørt. Alle lenker `w3-base.css` (tokens verbatim) + `w3-demo.js`
(tilstandsbryter merket `data-demo-only`, fjernes ved integrasjon).

| # | Fil (`fase2/playerhq/`) | Rute | Mal | Tilstander | Én ting nå |
|---|---|---|---|---|---|
| 1 | `playerhq-booking-ny.html` | `/portal/booking/ny` | §8 veiviser | Steg 1–3 · bekreft · fullt | Neste steg |
| 2 | `playerhq-booking-mine.html` | `/portal/booking` + `/[id]` | §9 liste + detalj | Suksess · Tom · Avbestilling | — |
| 3 | `playerhq-coach-hub.html` | `/portal/coach` + `/melding` | §11 hub + tråd | Suksess · Tom | — |
| 4 | `playerhq-coach-tilbakemelding.html` | `/portal/coach/tilbakemelding/[oktId]` | §12 prosa-detalj | Skrevet · Venter på coach | **Send svar** |
| 5 | `playerhq-helse.html` | `/portal/meg/helse` | §12 + skjema | Suksess · Samtykke avslått · Tom | Logg i dag |
| 6 | `playerhq-abonnement.html` | `/portal/meg/abonnement` | §12 hero | 3 tier-tilstander | Oppgradering |
| 7 | `playerhq-betaling.html` | `/portal/meg/betaling` | §9 liste + klipp | Betalt · Forfalt · Tom | **Betal forfalt faktura** |
| 8 | `playerhq-profil.html` | `/portal/meg/profil` | §8 skjema | Komplett · Ufullstendig | Lagre profilen |
| 9 | `playerhq-utstyr.html` | `/portal/meg/utstyr` | §9 tabell + trapp | Bag registrert · Tom | — |
| 10 | `playerhq-innstillinger.html` | `/portal/meg/innstillinger` + 8 undersider | §10 MAL | Suksess | — |
| 11 | `playerhq-talent.html` | `/portal/talent/mitt-niva` + `/roadmap` | §12 m/ faner | Suksess · Ikke plassert | — |

## Konsolidering

| Rute i dag | Forslag | Mal |
|---|---|---|
| 8 innstillings-undersider (`varsler`, `sprak`, `okter`, `anlegg`, `ai-coach`, `personvern`, `sikkerhet`, `integrasjoner`) | **Én mal, åtte instanser** — `playerhq-innstillinger.html` er fasit for alle | §10 |
| `/portal/meg/profil`, `/meg/konto`, `/meg/kontakt` | **Slått sammen** til én profilflate | §8 |
| `/portal/meg/betaling`, `/meg/kvitteringer`, `/meg/klipp` | **Slått sammen** til én betalingsflate; klipp er en modul øverst | §9 |
| `/portal/meg/utstyr`, `/meg/bag`, `/meg/lengder` | **Slått sammen**; lengdetrapp er en modul, ikke en rute | §9 |
| `/portal/coach/notat/[id]`, `/coach/video/[id]`, `/coach/oppsummering` | **Slått sammen** til én tilbakemeldingsflate; video er en modul | §12 |
| `/portal/talent/*` undersider | Faner i én flate | §12 |

## Vedtak

- **Timeklipp ≠ app-tier** står eksplisitt i UI på `playerhq-betaling.html`, med lenke til Abonnement — skillet må ikke slås sammen ved integrasjon.
- **HCP er lesefelt** i profilen (eies av forbundet/Golfbox). Feil tall meldes til klubben, ikke rettes i appen.
- **Utstyr viser målte lengder**, ikke ønsketall. Kølle med for få slag viser `—` og stiplet søyle — ingen gjetting.
- **Video i tilbakemelding er plassholder** — ingen oppdiktet klipp-innhold.
- **Coach-tilbakemelding er prosa i Lora**, ikke datakort: det er coachens ord, og «Tre ting å ta med» er den deterministiske delen.
- **Maks én clay per tilstand.** Kun flate 4 (Send svar) og 7 (forfalt faktura) har solid clay; helse/profil bruker clay på den ene lagre-handlingen i sin tilstand.
- **Duplikat ryddet:** `playerhq-talent-stige.html` (skrevet i W2-batchen) er slettet — `playerhq-talent.html` er fasit for talent.

## Porte først — topp 5

1. `playerhq-betaling.html` — forfalt-tilstanden er den eneste flaten som stopper inntektstap
2. `playerhq-booking-ny.html` + `-mine.html` — hele bookingløkka, høyest daglig volum
3. `playerhq-innstillinger.html` — én mal som erstatter åtte legacy-sider
4. `playerhq-coach-tilbakemelding.html` — bærer coaching-verdien mellom timene
5. `playerhq-profil.html` + `-utstyr.html` — mater gameplan og TrackMan-lengder

## Neste

W4 AgencyOS multi-coach legend + wizard · W5 Auth/Forelder · W6 WANG/GFGK (2–4 nøkler).
