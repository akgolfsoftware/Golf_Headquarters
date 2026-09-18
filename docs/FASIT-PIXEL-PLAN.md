# Fasit og pixel-plan

Kilde: Claude Design-pakkene i `attachments/` (lest 18.09.2026).
Pakken sier selv `selectedForBuilding: false` — ikke juridisk vurdert, ikke app-testet. Vi bruker den likevel som **visuell fasit**. Kode i Golf_Headquarters (Next.js) er et annet repo; denne Grok-appen speiler fasiten her.

## Tre kilder — ikke bland

| Zip | Hva det er | Brukes til |
|---|---|---|
| **AgencyOS Hjem designsystem (2)** | 105 skjermkontrakter, prototyper, 390/834/1440 | AgencyOS + PlayerHQ + marked/konto |
| **Claw Design — Team Norway Golf (1)** | ~40 `templates/*.dc.html` | Bare `/team-norway` |
| **WANG Toppidrett - Software** | ~50 flater × desktop+mobil | Bare `/wang` |
| AgencyOS Design System (1) | Tokens, skall, merkevare | Ikke skjermer |
| Team Norway Golf Design System | Merkevare/kommunikasjon | Ikke app |
| AK Golf HQ komponenter | Atomer (knapp, chip…) | Byggeklosser, ikke sider |

Én visuell autoritet per flate: AgencyOS/PlayerHQ = atletisk intelligens. Team Norway = Claw. WANG = WANG-zip.

Workbench-fasit i pakken: `prototype/AgencyOS Workbench v0.12.dc.html` (ikke v0.2 som noen kontrakter fortsatt peker på).

---

## Tegnet fasit (105 kontrakter)

### AgencyOS — bygg først (coach)

| ID | Skjerm | 390 | 1440 | Status i design |
|---|---|---|---|---|
| AOS-01 | Hjem | ja | ja | klikkprøvd |
| AOS-02 | Kalender dag | ja | ja | klikkprøvd |
| AOS-12 | Kalender uke/måned | — | via WB | klikkprøvd |
| AOS-09 | Stall og spillerkort | ja | ja | klikkprøvd |
| AOS-13 | Stallreise + Analyse | ja | ja | klikkprøvd |
| INB-01/02 | Innboks + tråd | ja | ja | klikkprøvd |
| CAD-01–05 | Godkjenning / Caddie-utkast | ja | ja | klikkprøvd |
| WB-01 | Planlegge / spillervalg | ja | ja | klikkprøvd |
| WB-05 | Årsplan | nei | ja | klikkprøvd |
| WB-06 | Periode | nei | ja | klikkprøvd |
| WB-07 | Måned | nei | ja | klikkprøvd |
| **WB-08** | **Uke tidskalender** | ja | ja | klikkprøvd — **påbegynt i kode** |
| WB-09 | Øktbygger | nei | ja | klikkprøvd |
| WB-10 | Stall-dag | nei | ja | klikkprøvd |
| WB-11 / AOS-08 | Live-oversikt | nei | ja | klikkprøvd |
| WB-03 | Publiser | ja | ja | klikkprøvd |
| WB-04 | Gruppe-gren | ja | ja | klikkprøvd |
| AOS-03–07 | Øktdetalj + live + oppsummering coach | ja | ja | klikkprøvd |
| CAL-01 / UKE-01 | Min kalender / min uke | delvis | ja | klikkprøvd |
| ØVB-01–03 | Øvelsesbank | ja | ja | klikkprøvd |
| PUB-01–04 | Publiser øvelse | nei | ja | klikkprøvd |
| AGO-01/02 | AgenticOS-spor | ja | ja | klikkprøvd |
| ABO-01 | Abonnement (uten regnskap) | ja | ja | klikkprøvd |
| OPS-01–06 | Drift/restore | ja | ja | klikkprøvd — lav produktprioritet |

### PlayerHQ — etter Workbench-skallet

PHQ-01 Plan · PHQ-02 I dag · PHQ-03 Øktoppskrift · PHQ-04a/b Live · PHQ-05 Oppsummering · PHQ-06 Analyse · LIV-01/02 · MAL-01/02 Mål · VAR-01 · UTF-01/02 · RND-01–03 · TM-01/02 · BAG-01 · GP-01–04 · PHD-01–07 data/forhold/DataGolf · CK-01 coachkontakt.

### Team Norway — Claw-templates (ikke AOS-look)

Oversikt (+mobil), skall (+mobil mer), år, periode, måned, kalender, workbench (+mobil), evaluering, grupper, samling, tester, IUP (i dag/modulkart/samtale), måltavle, prosessmål, protokoll (bibliotek/detalj), rangliste, referansenivåer, fellestesting, gruppeposter, post enkeltspiller, uttak, turneringer (+manuell), trenere, skoler, college, systemkart, samtykke, dokumentdeling, workdesk.

Registeret har bare TN-01–04. Claw-zipen er den faktiske skjermfasiten (40+ sider).

### WANG — egen zip (ikke AOS-look)

Registeret har WNG-01–04. Zipen har **parvis desktop+mobil** for elev (~18), trener (~22), admin (~6), eier, foresatt. Det er den faktiske fasiten.

### Marked / konto / foresatt

MKT-01–06, BOK-01/02, KTO-01–03, DEL-01, FOR-01, SAM-01. Etter kjerneapp.

---

## Mangler i design (ikke tegnet ferdig)

**Ikke tegnet / uavklart i registeret**

- **AOS-10** AgenticOS som egen destinasjon (`ikke-tegnet`) — AGO-01/02 er spor, ikke «hjem for agenten»
- **AOS-11** Økonomi (`beholdt-uavklart`) — ABO-01 er bevisst uten Tripletex
- **FEL-01** Testprotokoller for spiller (`beholdt-uavklart`)

**Tegnet desktop, mangler 390-fasit**

- WB-05 År, WB-06 Periode, WB-07 Måned, WB-09 Øktbygger, WB-10 Stall-dag, WB-11 Live
- PUB-01–04 bare 1440
- CAL-01 bare 1440 (agenda på 390 finnes som WB-08-agenda)

**Tegnet delvis / bevisst utelatt**

- Checkout-kortskjema (bevisst)
- Caddie-chat, dashbord, agentkonfig (kun utkastflyt CAD-01–05)
- Gameplan live-GPS, Round-kobling, offline-kø (GP-*)
- DataGolf/GolfBox produksjonsimport og bag-lagring av filtrert TrackMan
- TEK-02 i PlayerHQ 390 med video (K8 rest)
- «Legg til sted» (K4, venter eierskap)
- FYS-bank 390 og testdag som blokk (K5/E)

**Pakken selv:** v0.10 på 390 skulle godkjennes før `selectedForBuilding: true`. Det skjedde ikke i filen.

---

## Hvordan vi jobber (ellers går det i ring)

1. **Én ID.** Du peker, eller vi tar neste i køen. Ingen ny zip, ingen loop på alt.
2. **Fasit = prototype-skjerm + screenshot i pakken.** Ikke «tolk tokens». Ikke Claw på AgencyOS.
3. **Desktop 1440 og mobil 390 i samme leveranse.** Mangler 390 i design: agenda/sheet/bunnnav som på WB-08, ikke krympet 7-kolonnegrid.
4. **Jeg koder, du svarer med avvik (maks 5 punkter) eller «lik». Neste ID først da.**
5. **Skall først, så innhold.** AgencyOS toppnav (som fasitbildet) på alle AOS-skjermer. PlayerHQ eget skall. TN = Claw-skall. WANG = WANG-skall.
6. **Ikke merge inn i Golf_Headquarters Next.js** før en flate er godkjent her.

### Kø (AgencyOS, produkt)

1. WB-08 Uke — påbegynt, tettes mot v0.12 + 390-agenda  
2. AOS-01 Hjem  
3. WB-05 År → WB-06 Periode → WB-07 Måned  
4. WB-09 Øktbygger  
5. AOS-09 Stall  
6. INB-01/02  
7. CAD-01 kø  
8. WB-03 Publiser + WB-04 Gruppe  
9. PlayerHQ PHQ-02 I dag → PHQ-03 → Live  
10. Resten etter det

Team Norway og WANG er **egne køer**, ikke innskudd i AOS-køen.
