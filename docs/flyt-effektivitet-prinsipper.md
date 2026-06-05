# Flyt-effektivitet — prinsippark for AK Golf HQ

> Legges ved ALLE Claude Design-prompter for PlayerHQ og AgencyOS. Målet: fra «hva vil jeg gjøre» til «gjort» på færrest mulig trykk. Hver skjerm bygges etter disse prinsippene fra start — vi fikser ikke friksjon i etterkant.

**Den ene målestokken:** En daglig handling skal være ≤ 2 trykk unna. Hvis du teller flere, er flyten feil.

---

## 1. De åtte kjerneprinsippene (universelle — gjelder hver skjerm)

1. **Én primærhandling per skjerm.** Hver skjerm har ÉN åpenbar «neste ting» — stor, lime, øverst i synsfeltet. Resten er dempet. Brukeren skal forstå hva han skal gjøre på 200 ms uten å lese.
2. **Handling i kontekst — ikke navigér bort.** Kan noe gjøres der brukeren står, gjør det inline. Aldri send noen til en ny side for én liten handling (logg treff på live-skjermen, godkjenn i innboks-raden, rediger mål i panelet).
3. **Systemet foreslår neste steg.** AI og regler peker mot det mest sannsynlige neste, så brukeren BEKREFTER i stedet for å bestemme fra blankt. (Caddie-forslag, «neste planlagte økt», foreslått drill mot svakhet.)
4. **Optimistisk UI — umiddelbar respons.** Handlinger føles ferdige med en gang; lagring skjer i bakgrunnen. Ingen spinner der det ikke trengs. Autolagre framfor «Lagre»-knapp der det er trygt.
5. **Tilstand huskes + dyplenker.** Kom alltid tilbake der du var (zoom-nivå, valgt spiller, fane). Varsler er dyplenker — trykk varselet og du er rett på handlingen, ikke på en forside.
6. **Minimer steg.** Slå sammen wizard-steg der det går. Et 3-stegs skjema som kan være 1 med smarte defaults SKAL være 1. Behold flersteg kun når hvert steg krever en ekte beslutning (live-økt brief→aktiv→logg→oppsummering er ekte; booking 3 steg er ofte 1).
7. **Progressive disclosure.** Vis det enkle først, avansert på forespørsel. Standardbrukeren ser 3 felt; den som vil ha 12 trykker «flere valg».
8. **Smarte standardverdier.** Forhåndsutfyll alt systemet kan vite: dato = i dag, bane = sist brukte, tid = vanlig treningstid, deltakere = alle påmeldte. Brukeren korrigerer unntaket, ikke regelen.

---

## 2. Konkrete mønstre å bruke

| Mønster | Hva det er | Hvor |
|---|---|---|
| **Kommandosentral-hjem** | Alt viktig + neste handling samlet på Hjem/Cockpit, så man sjelden må navigere | PlayerHQ Hjem · AgencyOS Cockpit |
| **Stemme/hurtig-input** | Si tallet i stedet for å taste | Live-økt, runde-logg |
| **Inline-handling i lister** | Godkjenn/avvis/svar/start direkte i raden | Innboks, godkjenninger, økt-lister |
| **Bulk-handling** | Én handling treffer mange (tildel til gruppe, fellesmelding) | AgencyOS planlegging + turneringer |
| **Hurtigsøk / ⌘K** | Hopp til hvem/hva som helst med tastatur | AgencyOS (desktop) |
| **Smart standard + hurtig-logg** | Forhåndsutfylt skjema, fyll detaljer senere | Runde-logg, ny økt, booking |
| **«Innsikt → handling»-bro** | Fra en observasjon rett til handlingen som løser den | SG-svakhet → drill → plan · cockpit-flagg → økt |
| **Swipe / gester (mobil)** | Bla mellom dager/økter, swipe for hurtighandling | PlayerHQ mobil |

---

## 3. PlayerHQ — flyt-mål (mobil-først)

**Reise: «logg dagens økt»** — optimal flyt:
Hjem → «Start dagens økt» (1 trykk) → Live brief → «Start» → tap/si treff/bom under økten → «Avslutt & logg» → «Lagre» → ferdig.
- Dagens økt hentes automatisk fra planen (Workbench), så brukeren slipper å finne den.
- Stemme-logging gjør at hver rep er ett ord, ikke et tastetrykk.

**Reise: «logg en runde»** — optimal flyt:
Hjem/Analysere → «Loggfør runde» (1 trykk) → skjema forhåndsutfylt (dato = i dag, bane = sist, tee = vanlig) → juster scores → «Lagre» (2 trykk totalt for normalsituasjonen).

**Reise: «fra svakhet til plan»** — optimal flyt:
SG-analyse viser svakeste område → trykk foreslått drill → «Legg i plan» → drillen ligger i Workbench. Tre trykk fra innsikt til endret plan.

**Hjem skal være kommandosentral:** dagens økt (start-knapp), neste handling, ett treningsanalyse-glimt («2 SLAG-økter bak»), nøkkel-KPI. Brukeren skal kunne gjøre 80 % av det daglige uten å forlate Hjem.

---

## 4. AgencyOS — flyt-mål (desktop · keyboard-vennlig)

**Reise: «behandle morgenens innboks»** — optimal flyt:
Cockpit → fokus-panel viser de 3 viktigste → AI-forslag-knapp UTFØRER handlingen inline (Book 30 min / Svar / Ring) uten å forlate cockpit. Rutine-forespørsler godkjennes/avvises i selve raden. Bare det kompliserte åpner detalj.

**Reise: «planlegg uka for en spiller»** — optimal flyt:
⌘K → søk spiller (eller veksler) → «Workbench» → sett inn fra mal → juster → tildel. «Tildel» propagerer til spilleren + varsel automatisk. Ingen manuell kopiering.

**Reise: «meld til en hel turnering»** — optimal flyt:
Turneringer → «Fellesmelding» → deltakere forhåndsvalgt → skriv med ferdige blokker + AI-stram → send. Én handling, mange mottakere.

**Power-coach på tastatur:** ⌘K for å hoppe, G1/G2 for grupper, hurtigtaster for de hyppige handlingene (godkjenn, svar, neste). Desktop-coachen skal kunne jobbe nesten uten mus.

**Bulk overalt der det gir mening:** tildel plan/økt/test til en gruppe på én gang, ikke spiller for spiller.

---

## 5. Anti-mønstre — dette UNNGÅR vi

- **Dype menyhierarkier.** Aldri mer enn 3 nivåer dypt uten breadcrumb. Ingen meny-av-valg der ett trykkpunkt holder (jf. gamle 6-kort Planlegge).
- **Bekreftelses-dialoger for reverserbare handlinger.** «Er du sikker?» kun for det destruktive/uopprettelige. Reverserbart = gjør det, tilby «angre».
- **Tomme skjemaer.** Aldri be brukeren fylle noe systemet kunne forhåndsutfylt.
- **Unødvendige «Lagre»-knapper.** Autolagre der det er trygt.
- **Navigere bort for én handling.** Hvis det kan gjøres inline, gjør det inline.
- **Duplikate innganger til samme handling.** Én vei til hver ting (jf. ingen duplikatsider / dobbeltadresser).
- **Steg som ikke krever en beslutning.** Hvert wizard-steg må fortjene sin plass.

---

## 6. Per-skjerm sjekkliste (bygg ikke en skjerm uten å svare på disse)

- [ ] Hva er den ENE viktigste handlingen her? Er den åpenbar på 200 ms?
- [ ] Kan hovedhandlingen gjøres inline, uten å navigere bort?
- [ ] Er alt som kan forhåndsutfylles, forhåndsutfylt?
- [ ] Foreslår systemet et fornuftig neste steg?
- [ ] Husker skjermen tilstand (kommer du tilbake der du var)?
- [ ] Er det noe steg her som kan fjernes eller slås sammen?
- [ ] Er en daglig handling ≤ 2 trykk unna?
- [ ] Tar varsler/lenker hit deg rett til handlingen (dyplenke)?

---

**Tema-påminnelse:** PlayerHQ lyst, AgencyOS mørkt. Lime kun på den ene primærhandlingen og NÅ-markører — det er nettopp lime-disiplinen som gjør at den ene viktige handlingen skiller seg ut. Hvis alt er lime, er ingenting det.
