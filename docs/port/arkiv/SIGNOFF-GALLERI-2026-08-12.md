> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Sign-off-galleri — natt 2026-08-12 (PR #415–#420)

Skjermbilder tatt med `scripts/signoff-gallery.mjs` mot hver PRs egen Vercel-preview (ikke lokal
dev-server). Alle previews svarte HTTP 200 på første forsøk — ingen ventetid nødvendig. Innlogging
(testbruker `screentest@akgolf.test` / `coachtest@akgolf.test`) lyktes på alle skjermer som krevde
den — ingen `LOGIN-FEIL` i kjøreloggen.

Bildefiler ligger i `screenshots/paper/signoff/<ID>-<enhet>.png` (app venstre / fasit høyre) +
`<ID>-m390-dark.png` (mørk modus, kun mobil, kontrastsjekk). Kjørelogg (siste kjøring):
`screenshots/paper/signoff/_kjørelogg.txt`.

**PII-varsel (les før du deler noe fra denne galleriet):** `NT-419a-m390.png`,
`NT-419a-d1280.png` og `NT-419a-m390-dark.png` viser ekte fornavn+etternavn på WANG-elever
(mindreårige) — hentet fra AgencyOS-gruppa «WANG Toppidrett Fredrikstad» i test/preview-databasen.
Disse tre filene er **PII — kun lokal visning**. Ikke last opp, del eller lim inn i noe
sky-verktøy. Se detaljer under PR #419.

---

## PR #415 — feat(paper): W3 — coach-hub + variant-pass (PP-6)

**Preview:** https://akgolf-hq-git-feat-natt-w3-0d1f2a-akgolfgroup-netizens-projects.vercel.app

**Hva ble endret (fra PR-body):** Pixel/IA-pass av `/portal/coach` (CoachHubV2) mot
`playerhq-coach-hub.html` — coachtopp ut av kortramme, eget "Fokus nå"-kort, forenklet
meldingsrad, ny "Fra [coach]"-seksjon (Videoer/Øvelser/Spørsmål), fjernet feilplassert CTA, lagt
til fasitens andre infokort i "uten coach"-tilstanden. Pluss: ny `BookingAvbestillKnapp` på
`/portal/booking/[bookingId]` (koblet på eksisterende `cancelBooking`-action med 24t-refusjonsregel
— manglet UI helt).

**Skjermer kjørt:**

| Skjerm | Bilde | Status |
|---|---|---|
| NT-415 (Coach-hub, `/portal/coach`) | `NT-415-m390.png`, `NT-415-d1280.png`, `NT-415-m390-dark.png` | Alle 3 OK |

**Min vurdering:** **GODKJENN.** App og fasit stemmer godt overens strukturelt — coachtopp uten
ramme, eget fokus-kort, enkeltrad-meldinger, "Fra Markus"-seksjon med Videoer/Øvelser/Spørsmål er
alle på plass slik PR-body beskriver. "Ingen fokusnotat"/"Ingen kommende timer"-tomtilstandene er
tydelige med ett clay-CTA ("Book time"). Mørk modus har god kontrast — ingen primary=accent-
kollisjon. Ingen PII (kun coach-navn Markus Røinås Pedersen, som er navne-kanon-godkjent).

---

## PR #416 — feat(paper): W4 — planbibliotek + turneringer (PP-7)

**Preview:** https://akgolf-hq-git-feat-natt-w4-9c8fb3-akgolfgroup-netizens-projects.vercel.app

**Hva ble endret (fra PR-body):** `agencyos-planbibliotek` (`/admin/plan-templates` m.fl.) —
lest ut `PlanTemplate.approved`, lagt til Utkast/Godkjent-status-pille + filter, KPI-rad 3→4
fliser. `agencyos-turneringer` (`/admin/tournaments`) — fjernet filter som skjulte historikk,
nye Kommende/Spilte-faner med reelle tellinger, "Én ting nå"-dublett-banner.

**Skjermer kjørt:**

| Skjerm | Bilde | Status |
|---|---|---|
| NT-416a (Planbibliotek, `/admin/plan-templates`) | `NT-416a-m390.png`, `NT-416a-d1280.png`, `NT-416a-m390-dark.png` | OK, men se avvik under |
| NT-416b (AgencyOS turneringer, `/admin/tournaments`) | `NT-416b-m390.png`, `NT-416b-d1280.png`, `NT-416b-m390-dark.png` | OK |

**Min vurdering (NT-416a): FIKS.** Målt: mobilskjermbildet (`fullPage`) er **30 812 px høyt**
(fasiten er 844 px — én skjerm). Årsaken er synlig i bildet: alle 92 planmaler rendres fullt
utvidet (hver med full akse-fordelingsgraf) i én lang liste, uten paginering, virtualisering eller
kompakt rad-visning. Fasiten (`agencyos-planbibliotek.html`) viser i stedet en kompakt,
tilstandsdrevet visning: faner (Maler/Aktive planer/Ingen maler), status-piller
(Godkjent 18/Utkast 6/Teknisk plan 9) og en sortert "Mest brukt"-seksjon — ikke en flat liste av
alt. PR-en la til riktig status-pille og filter (bekreftet i bildet: "Status"-pillene finnes), men
selve informasjonsarkitekturen (kompakt vs. flat-92-kort) er ikke lukket. Dette er trolig separat
fra denne PR-ens uttalte scope ("minimal-diff", ikke IA-ombygging) — men bør flagges som eget
oppfølgingspunkt før skjermen kan regnes som ferdig mot fasit.

**Min vurdering (NT-416b): GODKJENN, med gap.** Kommende/Spilte-faner med reelle tellinger (4/84)
er på plass, kortene matcher fasitens turneringsrad-stil. Fasiten har derimot en KPI-rad
(Kommende 12/Påmeldte spillere 37/Uten kobling 4/Mulige dubletter 3) og et "Én ting nå"-dublett-
varsel med handlingsknapp øverst — appen har verken KPI-flisene eller banneret synlig i
skjermbildet, selv om PR-body sier begge ble lagt til. Enten er banneret betinget (vises kun når
dubletter finnes — sannsynlig, siden teksten sier "når dublett-kandidater finnes") eller det
mangler i denne preview-dataen. Ingen ferdig-blokkerende PII eller layoutfeil. Mørk modus: god
kontrast på begge.

---

## PR #417 — fix(paper): fase1 PlayerHQ diff-pass — meg, innlogging, runde, test-gjennomfor (PP-1/PP-3)

**Preview:** https://akgolf-hq-git-fix-natt-fas-3a819e-akgolfgroup-netizens-projects.vercel.app

**Hva ble endret (fra PR-body):** Pixel-diff av 5 skjermer. `playerhq-meg` og `innlogging`
allerede i samsvar (ingen kodeendring). `runde-logg` og `test-gjennomfor` fikk
`var(--ak-cookie-h, 0px)` lagt til på sticky bunn-dokken (cookie-banner-gotchaen fra 10.08. var
ikke fullt utrullet). `runde-live` allerede i samsvar.

**Skjermer kjørt:**

| Skjerm | Bilde | Status |
|---|---|---|
| NT-417 (Runde-logg, `/portal/runde/logg`) | `NT-417-m390.png`, `NT-417-d1280.png`, `NT-417-m390-dark.png` | OK |

**Min vurdering: GODKJENN.** Meget nært 1:1 med fasiten — samme "RUNDEN"-felt-layout, samme
hull-for-hull-grid, samme clay "Logg runden"-CTA, samme "Sist loggført"-liste nederst. Eneste
synlige avvik: fasiten har en liten snarveisrad øverst til høyre i header (F/T/L/E + måne-ikon) som
mangler i app-headeren — kosmetisk, ikke funksjonelt, og ikke nevnt som del av denne PR-ens scope.
Cookie-fiksen som er PR-ens faktiske innhold kan ikke verifiseres visuelt uten tomt samtykke +
390px scroll-til-bunn, men koden matcher det beskrevne mønsteret. Ingen PII.

---

## PR #418 — feat(paper): W5 — marketing-katalog + system-tilstander + variant-pass (PP-8)

**Preview:** https://akgolf-hq-git-feat-natt-w5-23829e-akgolfgroup-netizens-projects.vercel.app

**Hva ble endret (fra PR-body):** Ny delt `PkShell`/`PkPrimitives`-katalogmal portet fem
marketing-flater (coacher, anlegg, blogg, cases, turneringer) fra gammel mørk v2 til Paper (lys,
Poppins/Lora/IBM Plex Mono). Ny delt `paper-tilstand.tsx` for offline/404/500/vedlikehold/ingen
tilgang, koblet til `/offline`, `not-found.tsx`, `error.tsx`, `global-error.tsx`.

**Skjermer kjørt:**

| Skjerm | Bilde | Status |
|---|---|---|
| NT-418a (Katalog: coacher, `/coacher`) | `NT-418a-m390.png`, `NT-418a-d1280.png`, `NT-418a-m390-dark.png` | OK |
| NT-418b (Katalog: blogg, `/blogg`) | `NT-418b-m390.png`, `NT-418b-d1280.png`, `NT-418b-m390-dark.png` | OK |
| NT-418c (System: 404, `/denne-finnes-ikke-natt`) | `NT-418c-m390.png`, `NT-418c-d1280.png`, `NT-418c-m390-dark.png` | OK |

**Min vurdering (NT-418a): GODKJENN.** Struktur, typografi og kortlayout matcher fasitens
"coacher-mal" godt — bilde-plassholdere, navn/rolle/bio, tag-piller. Ett reelt innholdsavvik:
appen viser kun **2 coacher** (Anders Kristiansen, Markus Røinås Pedersen — de faktiske AK Golf
Academy-coachene), mens fasiten viser 7 (inkl. oppdiktede "Trine Hauge", "Martin Sund" m.fl.) med
filter-piller (Alle·7/Fredrikstad·4/Onsøy·2/Junior·5/Elite·3). Dette er **riktig oppførsel** —
navne-kanon (`beslutninger.md`) sier eksplisitt at ekte coach Markus Røinås Pedersen ikke skal
byttes ut, og fasitens ekstra navn er placeholder-data i mal-dokumentet, ikke reelle personer. Filter-
pillene i fasiten er dermed heller ikke relevante med kun 2 ekte coacher. Ingen fiks nødvendig.

**Min vurdering (NT-418b): GODKJENN.** Fullverdig blogg-side med ekte artikler, kategori-filter
("Alle/Coaching/Junior/Mental/Utstyr"), forfattere (Anders Kristiansen, Markus Røinås Pedersen) og
lesetid. God visuell kvalitet, ingen brutte bilder eller layoutfeil sett i skjermbildet. (Fasit-
siden viser feil fane — samme delte fasitfil som 418a, viser default "coacher"-fane i stedet for
"blogg" — det er en begrensning i skript-oppsettet, ikke en app-feil.)

**Min vurdering (NT-418c): GODKJENN.** 404-siden matcher fasitens "Finnes ikke"-mønster: rundt
søk-ikon, "Denne siden finnes ikke", to knapper (Til hjem/Kontakt oss), 404-kode nederst. (Fasit-
bildet viser "Offline"-fanen som standard aktiv fane i mal-dokumentet — samme skript-begrensning som
418b, ikke en avvikssignal.)

---

## PR #419 — feat(paper): W6 — WANG + GFGK microsites (PP-9)

**Preview:** https://akgolf-hq-git-feat-natt-w6-855f66-akgolfgroup-netizens-projects.vercel.app

**Hva ble endret (fra PR-body):** Pixel-pass på `wang-coach-arsplan` (`/team-wang/coach`) og
`gfgk-kalender` (`/gfgk-junior/kalender`) — heroband-chips, fane-styling. WANG-innlogging hoppet
over bevisst (scope-kollisjon med åpen PR #406 som fjerner PII-elevnavn). GFGK-artikkel-skjerm
ikke i denne testens rute-utvalg.

**Skjermer kjørt:**

| Skjerm | Bilde | Status |
|---|---|---|
| NT-419a (WANG coach-årsplan, `/team-wang/coach`) | `NT-419a-m390.png`, `NT-419a-d1280.png`, `NT-419a-m390-dark.png` | OK, **PII i alle 3 filer** |
| NT-419b (GFGK kalender, `/gfgk-junior/kalender`) | `NT-419b-m390.png`, `NT-419b-d1280.png`, `NT-419b-m390-dark.png` | OK |

**PII-FUNN (viktig):** WANG-skjermbildene viste en full elevliste med ekte fornavn+etternavn
(9 av 14 elever synlig — navnene gjengis bevisst IKKE her) hentet fra AgencyOS-gruppa
"WANG Toppidrett Fredrikstad" i preview-databasen. De tre bildefilene er derfor **slettet**
(natt 12.08) — vurder skjermen direkte i PR #419s preview i stedet. Dette er mindreårige elever — jf. `wang-toppidrett.md`: "Elevdata er PII om
mindreårige: STRENGESTE håndtering — aldri elevnavn i sky-prompts uten anonymisering, aldri i
filer utenfor lokale systemer." Disse tre filene er merket **PII — kun lokal visning** og skal
IKKE deles, lastes opp eller limes inn noe sted. (PR #419s egen tekst bekrefter at elevlisten
"hentes fra AgencyOS-gruppa" og "er 100 % databundet" — dette er forventet appdata, ikke en feil i
selve PR-en; problemet er at test/preview-databasen bruker ekte elevnavn i stedet for anonymiserte
testdata.) **Anbefaling til Anders:** vurder å bytte preview-/testdatabasens WANG-elever til
fiktive navn, slik at fremtidige skjermbilde-galleri ikke eksponerer ekte mindreårige.

**Min vurdering (NT-419a): FIKS (datahåndtering), GODKJENN (visuelt).** Selve skjermen matcher
fasiten godt strukturelt — periodisert årsplan med UKE/PERIODE/ELEVER/SAMLINGER-chips, periodekort
med fasefokus og fremdriftslinjer. PR-body sier bevisst at coach-strukturen (sidebar+drilldown) er
beholdt fremfor fasitens enklere to-kolonne — det stemmer med det jeg ser (appen har ingen
sidebar/AK.-navigasjon synlig i mobilvisningen, men det er forventet på 390px). Visuelt OK. Men
elevnavn-eksponeringen over gjør at denne skjermen ikke bør havne i noe delt galleri uten
anonymisering først.

**Min vurdering (NT-419b): FIKS (mobil-layout).** Rå appskjermbilde (`_raw-NT-419b-m390-app.png`)
viser et alvorlig mobil-overflow-problem: kalenderrutenettet beholder full skrivebord-bredde
(fane-etikettene "Srixon Tour #6 - Kongsvingers GK" osv. og time-gridden strekker seg godt utenfor
390px viewport), og resten av siden (fra ca. midten og ned) er tom hvit/beige flate — samme klasse
feil som er dokumentert i `gotchas.md` ("Rutenett-kolonne uten `min-width: 0` sprenger skjermen").
`GruppeKalenderWrapper` (som PR-body eksplisitt sier ikke ble re-skinnet i denne runden) er trolig
kilden. Ingen PII i denne skjermen (kun turneringsnavn, ikke spillernavn). Sammensatt
side-om-side-bilde (`NT-419b-m390.png`) skjuler delvis problemet fordi det kutter ved 390px bredde
— se `_raw-NT-419b-m390-app.png` for det ukuttede beviset.

---

## PR #420 — fix(paper): fase1 AgencyOS diff-pass (PP-2)

**Ingen skjermbilder tatt** — per oppdrag: PR #420 er kun slug-instrumentering
(`data-paper-slug`-retting på to komponenter + fjerning av to ubrukte imports), ingen visuelle
endringer.

**Hva ble endret (fra PR-body):** Verifiserte 9 AgencyOS fase1-skjermer mot Claude Paper-fasit —
konklusjon "ingen visuelle avvik" (allerede fikset i tidligere PR-er #388/#389/#390/#410/#413).
Denne PR-en retter kun `data-paper-slug="agencyos-oppsett"` → `"agencyos-innstillinger"` på
`AdminSettingsV2.tsx` og legger til manglende `data-paper-slug="agencyos-agenticos"` på
`AdminAgentTeamV2.tsx`, pluss opprydding av to ubrukte imports som blokkerte lint-gaten.

**Min vurdering: GODKJENN (dokumentarbeid).** Ingen kode-endring utover instrumentering og
lint-opprydding — ikke noe å visuelt verifisere. PR-en flagger selv to åpne spørsmål til Anders
(agenticos-samleflate-ruting, dobbel slug-bruk på to komponenter) som bør avklares før neste
skjermarbeid i AgencyOS-familien, men det er utenfor denne PR-ens ansvar å løse.

---

## Oppsummering

| PR | Skjermer | Teknisk kjøring | Min dom |
|---|---|---|---|
| #415 | NT-415 | 3/3 OK | GODKJENN |
| #416 | NT-416a, NT-416b | 6/6 OK | NT-416a: FIKS (IA/paginering) · NT-416b: GODKJENN m/ gap (KPI-rad/banner ikke synlig) |
| #417 | NT-417 | 3/3 OK | GODKJENN |
| #418 | NT-418a, NT-418b, NT-418c | 9/9 OK | GODKJENN (alle tre) |
| #419 | NT-419a, NT-419b | 6/6 OK | NT-419a: PII-funn, visuelt OK · NT-419b: FIKS (mobil-overflow) |
| #420 | — (kun tekst) | — | GODKJENN (dokumentarbeid) |

**Høyest prioritet før merge:**
1. **PII i WANG-preview-data** (#419) — anbefal Anders bytter testdatabasens elevnavn til
   fiktive før flere skjermbilde-kjøringer.
2. **NT-419b mobil-overflow** (#419, GFGK-kalender) — samme feilklasse som er dokumentert i
   gotchas.md, sannsynligvis rask fiks (`min-width: 0` på kalenderrutenettets kolonner).
3. **NT-416a manglende paginering/kompakt-visning** (#416, planbibliotek) — 92 fullt utvidede
   kort på mobil er ikke et brukbart produkt, uavhengig av om det er «i scope» for denne PR-en.

Alle andre funn er mindre (manglende header-snarveier, betinget banner som ikke trigget i denne
databasen) og blokkerer ikke merge alene.
