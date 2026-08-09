# W2-rest 2 — manifest: Filter-sheet · Varsler · Putte-lab

**Kilde:** oppdrag «W2 fil 1–10». Filene 1–7 var allerede levert
(`manifest-w2-analysere.md` + `manifest-w2-rest-analysere-dybde.md`) — denne batchen
lukker de tre gjenstående (8–10). `fase1/` og eksisterende `fase2/`-filer er urørt.

## Konsolideringstabell

| Rute i dag | Forslag | Mal |
|---|---|---|
| Filtrering i `/portal/analysere`, `/portal/mal/runder`, historikkfaner | **Én delt historikk-flate med bunn-sheet** — ikke ett filterpanel per liste. Sheeten er mønsteret alle lister skal gjenbruke | §9 liste + §14 bunn-sheet |
| `/portal` varsler/inbox-fragmenter (coach-melding, timeendring, ufullstendig føring, faktura) | **Én varselflate med kategori-filter** — fangst av alt som venter på spilleren, med «Én ting nå» øverst | §11 hub + fangst |
| Putting spredt i analyse/tester/drills | **Putte-lab som egen dybdeflate under Analyse** (3 faner: Treff % · Distansekontroll · Økter) | §12 detaljside med faner |

## Filer

| Fil | Rute | Mal | Tilstander | Én ting nå |
|---|---|---|---|---|
| `playerhq-historikk-filter-sheet.html` | `/portal/analysere/historikk` | §9 liste + bunn-sheet | Suksess · Tomt filtertreff | Ingen (verktøyflate; «Vis N treff» er ink) |
| `playerhq-hjem-varsler.html` | `/portal/varsler` | §11 fangst-hub | Suksess · Tom (alt lest) · Tom kategori | **«Bekreft 16:30 fredag 22. mai»** — eneste clay på flaten |
| `playerhq-putte-lab.html` | `/portal/analysere/putting` | §12 detalj m/ faner | Suksess · Tom (ærlig datakrav) | Ingen |

## Vedtak og avvik

- **Filter-sheeten har utkast-state:** valg trer i kraft først ved «Vis N treff», nullstilling er ikke-destruktiv. Aktive filtre speiles som chips i listen og kan fjernes enkeltvis.
- **Varsler: maks én clay.** Sekundærhandlinger per varsel er ink/ghost. Bekreftelse endrer varselet i stedet for å fjerne det (spor for spilleren).
- **Putte-lab tom-tilstand oppgir reelle datakrav** (30 putter for treff %, 3 økter for distansekontroll) — ingen oppdiktede drills, lenker til testene som faktisk finnes.
- **Farge:** `--up`/`--dn` og `--up-raw` kun; ingen lime/grønn. Referansestrek er `--hairline`, ikke en tredje farge.
- **Deling av CSS:** de tre filene lenker `w3-base.css` (samme token-verdier som fase1, verbatim) + en liten flate-spesifikk blokk.

## Porte først — topp 5

1. `playerhq-hjem-varsler.html` — fangst av ubesvart er høyest verdi og finnes ikke i dag.
2. `playerhq-historikk-filter-sheet.html` — sheeten er et delt mønster, ett komponentskritt som låser opp alle listene.
3. `playerhq-putte-lab.html` — dypeste SG-gevinst per innsats i spillerdataene.
4. `playerhq-runder-liste.html` + `-runde-detalj.html` (W2-rest 1) — grunnlaget varslene peker på.
5. `playerhq-trackman-liste.html` / `-detalj.html` — importflyten som mater alt over.

## Gjenstår

W2: D-W2-6 Talent-undersider · hjem-rest (venner/utfordringer/fysisk).
Deretter W3 Meg/Booking/Coach · W4 AgencyOS multi-coach · W5 Auth/Forelder · W6 WANG/GFGK.
