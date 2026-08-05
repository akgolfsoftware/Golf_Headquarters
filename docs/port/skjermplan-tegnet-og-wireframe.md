# Skjermplan — tegnede fasitskjermer + wireframe-plan for resten

**Skrevet:** 2026-08-05 (bestilt av Anders samme dag) · **Status:** UTKAST — venter på Anders' godkjenning
**Kilde:** Claude Design-prosjektet **«AK Golf HQ — Claude Paper»** (`605a48cc-81e8-44bd-94d2-07d50a97370a`),
`fase1/` — verifisert direkte mot det levende prosjektet 05.08.2026 (33 HTML-fasitfiler + KONTRAKT/FASE-1/_foundation).
Tallgrunnlag: `docs/port/fasit-liste-paper.md` (05.08). Mønsterregler: `docs/port/monsterdokument-paper.md` (GODKJENT 05.08).

**Prinsippet Anders har bestilt:** de 318 skjermene uten fasit skal IKKE komponeres fritt fra
mønsterdokumentet og kodes direkte. De skal **wireframes/tegnes i Claude Design først**, slik at
enhver skjerm har en tegnet fasit før den kodes — samme skjermbilde-gate («app + fasit side om
side») for alle 343, ikke bare de 25.

---

## Del A — porteringsplan for de 33 tegnede skjermene (25 ruter)

Rekkefølgen følger den godkjente Fase 1-planen. Én PR per skjerm, skjermbilde-gaten på alle
(390px mobil først, lys+mørk, fasit ved siden av, alle fire tilstander, aldri merge uten Anders' ja).

### Pulje 1 — PlayerHQ kjerne (pågår)

| # | Fasitfil(er) | Rute | Status |
|---|---|---|---|
| A | `playerhq-chat-desktop/-mobil.html` | `/portal` (Hjem) | Merget med feil layout (avvik A1) — **ombygging = neste PR** |
| B | `playerhq-plan.html` | `/portal/planlegge` | Merget med avvik A2 — ombygging etter A |
| C | `playerhq-analyse.html` | `/portal/analysere` | Avvik A3 («Én ting nå» mangler) |
| D | `playerhq-meg.html` | `/portal/meg` | Avvik A4 (lydsamtykke-handling mangler) |
| — | `playerhq-booking.html` | `/portal/booking` | PR #281 åpen — skal gjennom skjermbilde-gaten |
| E | `workbench-mobil.html` (Testbatteri-arket) | `/portal/planlegge/workbench` | **Blokkert:** testliste 20/21/25? + TalentHQ i meny? |

### Pulje 2 — Gjennomføre-sløyfa (6 nye fasit 04.08)

| Fasitfil | Rute |
|---|---|
| `playerhq-live-brief.html` | `/portal/(fullscreen)/live/[sessionId]/brief` |
| `playerhq-live-okt.html` | `/portal/(fullscreen)/live/[sessionId]/active` |
| `playerhq-live-summary.html` | `/portal/(fullscreen)/live/[sessionId]/summary` |
| `playerhq-runde-live.html` | `/portal/(fullscreen)/runde/live` |
| `playerhq-runde-logg.html` | `/portal/(fullscreen)/runde/logg` |
| `playerhq-test-gjennomfor.html` | `/portal/(fullscreen)/tren/tester/[testId]/gjennomfor` — deler PR-E-blokkeringen (testliste) |

### Pulje 3 — Workbench (hevstangen: én komponent, to innganger)

| Fasitfil | Rute |
|---|---|
| `workbench-desktop.html` | `/admin/spillere/[id]/workbench` |
| `workbench-mobil.html` | `/portal/planlegge/workbench` (helheten, ikke bare Testbatteri-arket) |

### Pulje 4 — AgencyOS med fasit (steg 8)

| Fasitfil(er) | Rute | Merknad |
|---|---|---|
| `agencyos-konsoll-desktop/-mobil.html` | `/admin/agencyos` | Samme klasse ombygging som Hjem (chat-først vs dashbord) |
| `agencyos-innboks(-mobil).html` | `/admin/innboks` | |
| `agencyos-kalender(-mobil).html` | `/admin/kalender` | |
| `agencyos-spillere(-mobil).html` | `/admin/spillere` | |
| `spillerprofil.html` | `/admin/spillere/[id]` | |
| `agencyos-okonomi.html` | `/admin/agencyos/okonomi` | |
| `agencyos-innstillinger.html` | `/admin/settings` | |
| `agencyos-agenticos.html` | ny samleflate, erstatter 4 ruter | Beslutning tatt 04.08 — adressen velges når PR-en bygges |
| `workbench-turnering.html` | inn i `WorkbenchV2` | Beslutning tatt 04.08 — ikke ombygging av `/admin/tournaments` |

### Pulje 5 — fellesflater

| Fasitfil | Rute |
|---|---|
| `innlogging.html` | `/auth/login` |
| `foreldreportal.html` | `/forelder` |
| `booking.html` | `/booking` (marketing) |

### Utenfor plan (2 filer uten rute — trenger produktbeslutning før de går inn)

`agencyos-ak-stigen.html` (ny juniorflate) · `agencyos-live-session.html` (trolig coach-siden av
live-økt). Spør Anders når pulje 4 nærmer seg. `fangstsheet.html` er komponentkort, ikke skjerm.

---

## Del B — wireframe-plan for de 318 uten fasit

### Prinsipp

**Ingen skjerm kodes uten tegnet fasit.** Wireframene tegnes i Claude Design-prosjektet
`605a48cc`, i en ny mappe **`fase2/`** (fase1/ forblir urørt som de 33 ferdige fasitene).
Samme rammeverk som fase1: `_foundation.css`-tokens, komponentbiblioteket (138 komponenter),
telefonramme 430px / desktop, `data-od-id`, mønsterdokumentets regler. Når en wireframe er
godkjent av Anders, ER den fasit — og skjermen kodes gjennom samme skjermbilde-gate som pulje 1–5.

### Metode per bølge — tre steg før tegning

1. **Konsolideringsgate.** Før et område tegnes, listes skjermene og Anders får forslag om
   hvilke som bør slås sammen eller utgå (Enkelhet-prinsippet: behold funksjonene, kutt
   flatene). Eksempel: PlayerHQ Analysere har 41 skjermer — mange er trolig faner/undervisninger
   som hører hjemme i den ene 5-fane-analyseflaten som allerede har fasit. Hver skjerm som
   konsolideres bort er én mindre å tegne OG én mindre å kode.
2. **Mal-tildeling.** Hver gjenværende skjerm får en mal fra mønsterdokumentet
   (§5 kort/tabeller · §8 skjema/flerstegsflyt · §9 tabell · §10 filter/paginering ·
   §11 dashbord · §12 detaljside). Skjermer som deler mal tegnes som ÉN mal-wireframe +
   én linje per skjerm om avvik fra malen. Kun skjermer med egen informasjonsarkitektur
   (ny interaksjon, unik flyt) får full individuell wireframe.
3. **Tegn og godkjenn i batch.** Design-økt (Fable, i Claude Design) tegner bølgens
   wireframes. Anders godkjenner per batch — ikke per skjerm. Godkjent batch = fasit.

Referansetempo: design-økta 04.08 tegnet 6 fullverdige fasitskjermer (4 tilstander, lys+mørk,
verifisert i Playwright) på én økt. Wireframes med 2 obligatoriske tilstander (Suksess + Tom;
Laster/Feil følger mønsterdokumentets standardmønster) og mal-gjenbruk bør gå raskere —
anslå 8–12 per økt for mal-baserte, 4–6 for unike.

### Bølgene (rekkefølge = kodingens rekkefølge, tegning ligger én bølge foran koding)

Tallene er fra `fasit-liste-paper.md` 05.08 og er **anslag før konsolideringsgaten** — målet
er at hver bølge krymper i steg 1.

| Bølge | Område | Uten fasit (anslag) | Merknad |
|---|---|---:|---|
| W1 | PlayerHQ Gjennomføre-rest + Planlegge-rest | 12 + 23 | `logger`/`tapper` + planleggings-undersider; tegnes FØR pulje 2 kodes ferdig |
| W2 | PlayerHQ Analysere + Hjem-rest | 40 + 1 | Størst konsolideringspotensial — mange er trolig faner i den ene analyseflaten |
| W3 | PlayerHQ Meg + Booking + Talent + Coach + Aliaser | 27 + 6 + 5 + 20 + 5 | «Aliaser» må verifiseres mot kode — trolig redirects, ikke skjermer |
| W4 | AgencyOS alle områder | ~111 | Stall 28 · Admin 18 · Planlegge 18 · Oversikt 16 · Gjennomføre 14 · Innsikt 14 · Min uke 4 · Meg 2 — tegnes FØR pulje 4 kodes |
| W5 | Marketing + Forelder + Auth + System | 40 + 11 + 10 + 7 | Marketing kan ha egen visuell avklaring — spør Anders før W5 tegnes |
| W6 | WANG (`team-wang`) + GFGK (`gfgk-junior`) | ikke telt | MÅ telles og legges inn i regnskapet først — de er ikke med i de 343 |

### Leveranse per bølge

- `fase2/<område>/`-filer i Claude Design (godkjente wireframes = fasit)
- Oppdatert rad i `fasit-liste-paper.md` (dekningsregnskapet vokser fra 25 → mot 343)
- Konsolideringsvedtak dokumentert (hvilke skjermer utgikk/slås sammen, med Anders' ja)

### Åpne valg Anders må ta før W1 starter

1. **Fidelitet:** full Paper-komposisjon (som fase1 — anbefalt: komponentbiblioteket finnes,
   full komposisjon er nesten like raskt som gråbokser og gir direkte brukbar fasit til
   skjermbilde-gaten) — eller enklere gråboks-wireframes først, Paper-versjon etterpå?
2. **Godkjenning per batch** (anbefalt) eller per skjerm?
3. **Konsolideringsmandat:** kan design-øktene foreslå sammenslåinger/kutt aktivt (anbefalt,
   med ditt ja per område), eller skal alle 318 tegnes 1:1 mot dagens ruter?

---

## Forholdet til eksisterende planer

- `docs/port/plan-designport-alle-skjermer.md` — steg-/PR-strukturen (steg 7–10) gjelder
  fortsatt for KODINGEN. Dette dokumentet legger tegne-sporet foran den: ingen skjerm i
  steg 7–9 kodes lenger uten fasit (tegnet i fase1/ eller godkjent wireframe i fase2/).
- `docs/port/monsterdokument-paper.md` — fortsatt regelboka, men rollen endres: fra
  «eneste designkilde for de 318» til **tegnereglene wireframene bygges etter**.
- `docs/port/fasit-liste-paper.md` — dekningsregnskapet; oppdateres per bølge.
