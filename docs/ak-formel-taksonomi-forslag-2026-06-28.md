# AK-formel — foreslått taksonomi (fra Anders' metodikk, 2026-06-28)

> Strukturert fra Anders' egen beskrivelse av hvordan han trener spillere. Forslag til å
> seksjonere club speed, teknisk progresjon (L-faser), miljø (arenaer) og press. Bekreftes/justeres
> av Anders før det låses og kodes. Bygger på eksisterende enums (LFase/CSNivaa/MMiljo/PRPress).

## 1. CLUB SPEED — navngitte soner med BÅND (ikke absolutt). Anbefalt.
Ikke absolutte 70/80/90/100 (umulig å treffe eksakt, false precision), men FÅ navngitte fart-soner,
der hver sone = et %-bånd + (kalibrert) mph-bånd. «Tallet bak, følelsen foran.»

| Sone | %-bånd | Når |
|---|---|---|
| (ingen fart) | — | Posisjon/statisk, uten kølle |
| Sakte | 50–60 % | Rolig bevegelse, føl plan |
| Kontroll | 60–75 % | Kontrollert, lett treff |
| Normal | 75–90 % | Vanlig treningsfart |
| Full | 90–100 % | Nær/full fart |

mph bak hver sone (kalibrert per kølle fra TrackMan-max) gir presisjon der det trengs.

## 2. TEKNISK PROGRESJON — to akser (i stedet for én flat L-fase)
**Akse 1 — INNLÆRINGSSTEG (hva er med):** (≈ eksisterende L_KROPP→L_AUTO, men eksplisitt)
1. **Posisjon (statisk)** — kropp, uten armer/kølle. Siktepinne på skulder + i belte, speil. Plan + rotasjon.
2. **Bevegelse** — kropp/armer, fortsatt uten ball (sakte → øk fart).
3. **Kølle** — kølle inkludert (skumball / uten ball), lav fart.
4. **Ball** — slå ball, alle køller gradvis.
5. **Bane / auto** — overføring til spill.

**Akse 2 — FART-SONE:** Statisk → Sakte → Kontroll → Normal → Full (fra §1).

**Regler (guardrails — håndhever hovedmålet «ikke lære ny bevegelse for fort»):**
- Steg 1 = kun statisk (ingen fart, ingen kølle/ball).
- Steg 2 = Sakte → Kontroll, uten ball.
- mph/CS gjelder KUN fra steg 3 (når kølla er med).
- Ball først fra steg 4.
- Advar/lås hvis valgt fart-sone > anbefalt for innlæringssteget.

## 3. MILJØ — arena-stige (ekte arenaer, stigende realisme/overføring)
**INNENDØRS:**
- **Nett/matte** (tørr-sving, speil) — best for posisjon/bevegelse. Ingen ballflight.
- **TrackMan simulator** — ball + data, kontrollert.
**UTENDØRS:**
- **Range / performance studio** — matte, flatt. ⚠ Rangeballer er inkonsistente → upålitelig ballflight,
  som kan «lure» teknikken. Flagg ball-kvalitet; bruk TrackMan/gress for ballflight-basert feedback.
- **Treningsområde** — kort hullsbane / gressflate (ekte gress + ekte ball).
- **Bane, trening** — spill på bane, øve slag (ikke score).
- **Bane, resultat** — spill på bane for score.
- **Turnering** — med tre modus:
  - **Trening** — trene teknikk på bane i konkurranse-kontekst.
  - **Utvikling** — prøve nye ting (mentale øvelser, kosthold, rutine, ny caddie …).
  - **Prestasjon** — prestasjonen står i fokus.

(Behold en underliggende ordinal «realisme/overføring 0–N» for formelen; arenaene er det coachen velger.)

## 4. PRESS — avledet fra KONKRETE faktorer (ikke abstrakt gjetting)
Press kodes fra faktorer coachen faktisk kjenner igjen, ikke et tall i løse lufta:
- **Tilskuere:** ingen → coach/foreldre ser på → gruppe → publikum (10+).
- **Konsekvens:** ingen → mål/krav → score teller → turnering-stakes.
- **Sosialt:** alene → i gruppe.
Arena setter et baseline-press; faktorene justerer det opp. Output = en ordinal 1–5 til formelen,
men coachen koder via faktorene («gruppe + foreldre ser på + score teller» → automatisk høyt press).

## 5. SLIK HENGER DET SAMMEN I KODINGEN
En øvelse kodes nå: **Pyramide → treningsområde → Innlæringssteg → Fart-sone (m/ mph) → Arena →
Press-faktorer**, innenfor **kategori A–K** + **slag-begrensninger**. UI styrer lovlige valg
(fart skjult på steg 1–2, ball fra steg 4, fart-tak per innlæringssteg, arena begrenset av spillerens fasiliteter).

Dette beholder dybden i AK-formelen, men gjør den **tydeligere, mer konkret og umulig å kode feil**.
