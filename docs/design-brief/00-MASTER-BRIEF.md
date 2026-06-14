# AK Golf HQ — Master-brief for Claude Design

> **Hva dette er:** Inngangsdokumentet for et NYTT Claude Design-prosjekt som skal generere **eksakte, lanseringsklare prototyper** for hele AK Golf HQ. Les denne først, deretter `01-DESIGNSYSTEM.md`, så produkt-briefen for flaten du jobber på (`02`–`05`).
>
> **Forfatter-rolle:** Disse dokumentene er skrevet som en spesifikasjon fra en senior app-/webdesigner. Følg dem presist. Der noe er uklart: velg det enkleste, mest konsistente alternativet — ikke finn opp nye mønstre.

---

## 1. Mandatet (les nøye — dette styrer alt)

1. **Behold de eksisterende komponentene. Ikke bygg på nytt.** Plattformen har allerede 52 modne «athletic»-komponenter (se `01-DESIGNSYSTEM.md`). Du skal **gjenbruke** dem, og **utbedre** dem der `01` peker på en refinement. Ikke lag en parallell komponent som gjør det samme.
2. **Refinements, ikke revolusjon.** Målet er å løfte et allerede godt design til lanseringskvalitet — strammere tilstander, konsistens, tilgjengelighet — ikke et nytt visuelt språk.
3. **Lanseringsklart, ikke skisse.** Hver skjerm skal være produksjonsklar: ekte innholdsstruktur, alle tilstander (tomt/laster/feil), responsivt. Ingen «lorem», ingen placeholder-bokser.
4. **Flyt før skjerm.** En vakker skjerm i en ødelagt flyt er verdiløs. Hver skjerm må svare på «hva er neste steg» og koble til der brukeren skal videre.
5. **≤ 2 trykk for kjernehandlinger.** Spiller: start dagens økt ≤2 trykk, logg resultat 1 trykk. Coach: planlegg & tildel til gruppe ≤2 trykk, handle på en forespørsel inline.

---

## 2. Plattformen — fire flater

| Flate | Rute | Enhet | Tema | Modenhet i dag |
|---|---|---|---|---|
| **Marketing** (akgolf.no) | `/` | desktop + mobil | lyst, editorial | UI-kit finnes, trenger ferdige sider |
| **Booking** | `/booking` | mobil-først | lyst | nesten ikke designet — prioritet |
| **PlayerHQ** | `/portal` | **mobil-først** | **alltid lyst** | 10 skjermer i v2 |
| **AgencyOS** | `/admin` | **desktop-først** (+ mobil) | **alltid mørkt** (`.dark`) | 10 skjermer i v2 |

Alle fire deler **ett** designsystem (`01`). Workbench er en delt kjerne som finnes i både PlayerHQ og AgencyOS.

---

## 3. Designfilosofi (master-nivå — gjelder alle flater)

- **Editorial sport-analytics.** Ankeret er «DataGolf møter The Athletic, hvis de møttes på Linear». Datadrevet, rolig, presist. Tall først. Aldri gymsalg-hype.
- **Tall er helter.** KPI-er og statistikk i JetBrains Mono, tabulære tall, norsk formatering (komma-desimal, mellomrom-tusenskille, `48,3 %`).
- **Lime er krydder, aldri tapet.** Accent-lime (#D1F843) brukes KUN på signatur-øyeblikk (primær-CTA-tekst, aktiv tilstand, KPI-puls, fokus). Aldri store flate lime-felt.
- **Foto, ikke fyll.** Hero-seksjoner bruker atmosfærisk golffoto (golden hour / overskyet morgen) med gradient-lag — aldri solid-farge-hero.
- **Tetthet med pusterom.** AgencyOS tåler Bloomberg/Linear-tetthet (data-tette tabeller). PlayerHQ er luftigere, mobil-først, tommelvennlig.
- **Bevegelse er rask og rolig.** 150–250 ms, ease-out inn. Ingen scale/lift på hover utenom feature-kort. Skeleton-puls, ikke spinners.

---

## 4. Låste produktbeslutninger (IKKE endre — design rundt disse)

Disse er forretnings-/IA-beslutninger, ikke designvalg. De overstyrer alt visuelt.

- **Navn:** Coach-appen heter **AgencyOS** — aldri «CoachHQ» i tekst.
- **Tema:** PlayerHQ alltid lyst, AgencyOS alltid mørkt. **Ingen tema-toggle.**
- **Planlegging = Workbench.** «Planlegge» er ÉTT trykkpunkt til Workbench, ikke en meny av kort. Gjelder både coach og spiller. Workbench har tre zoom-nivåer: **År (Gantt-periodisering) → Uke → Økt**. Bibliotek (maler, drills, turneringer) er ressurser man henter inn FRA Workbench, ikke egne planleggings-faner.
- **Analyse samlet.** Analysere + TrackMan + Runder + SG + Tester er ÉN flate med faner — ikke separate moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Demo-navn (alltid fulle navn):** spiller = **Øyvind Rohjan** (initialer ØR), coach = **Anders Kristiansen**. Avatar-initialer avledes fra navnet. NB: ekte coach «Markus Røinås Pedersen» på markedssider beholdes.
- **Abonnement:** gratis (prøveperiode / coaching-pakke / gruppe) eller 300 kr/mnd. «Performance / Performance Pro» er **coaching-pakker, ikke app-nivåer** — vis dem aldri som app-nivå. **ELITE vises ALDRI** (dødt nivå).
- **Tier-pill i hero:** «PlayerHQ · {tier}» (+ «· HCP {hcp}» på desktop). `{tier}` = GRATIS eller PRO.
- **FYS-testresultater:** vis plassholder-tall. Ingen hardkodede referanseverdier (formelen er ikke låst ennå).

---

## 5. Slik bruker du dokumentpakka

1. Les `01-DESIGNSYSTEM.md` — det kanoniske byggesettet. Alt komponeres herfra.
2. Åpne produkt-briefen for flaten: `02-PLAYERHQ`, `03-AGENCYOS`, `04-BOOKING`, `05-MARKETING`.
3. For hver skjerm i briefen: bygg fra komponent-listen som er angitt, følg flyten, dekk alle tilstander.
4. Lever interaktiv prototype (desktop + mobil der flaten krever begge).

## 6. Iterer-loopen (etter første generering)

1. Anders ser prototypen, tar opp skjermopptak og forklarer ønskede endringer.
2. Analysen gjøres mot dette briefet + datamodellen + ≤2-trykk-prinsippet.
3. Konkrete **follow-up-prompts** gis til Claude Design, som gjør endringen.
4. Når en flyt er godkjent: **lås den** og gå videre. Ferdig betyr ferdig.

## 7. Definisjon av «lanseringsklar» (per skjerm)

- [ ] Bygget av eksisterende komponenter (ingen duplikat-komponent).
- [ ] Alle tilstander: innhold · tomt · laster (skeleton) · feil.
- [ ] Responsiv på riktig enhet (PlayerHQ/Booking mobil; AgencyOS desktop+mobil; Marketing begge).
- [ ] Kjernehandling ≤ 2 trykk, og det er tydelig hva neste steg er.
- [ ] Norsk bokmål, riktig tall-/casing-formatering, ingen emoji, kun Lucide-ikoner.
- [ ] Følger låste beslutninger (§4).
