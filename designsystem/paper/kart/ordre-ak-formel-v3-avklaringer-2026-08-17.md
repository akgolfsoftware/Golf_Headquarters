# AK-formel v3 — avklaringer 17.08.2026

**Til:** `kart/ordre-ak-formel-v3-2026-08-03.md` — dette dokumentet lukker 4 av de 5
gjenværende punktene i §4 "Fortsatt åpne", pluss delpunkt 1b. Svarene er fra Anders,
gitt i Cowork-sporet 17.08.2026. Punkt 6 (`STRATEGI_TAKTIKK`-understreket, §5.1) og
tillegget fra §6 (innspill-navnekonvensjon §6.4, putt-bøtter §6.5, P-format §6.6) er
fortsatt åpne — ikke berørt av denne avklaringen.

---

## Lukket 17.08

| # | Punkt | Svar | Konsekvens for §2 |
|---|---|---|---|
| 4 | Putt under TEK/SLAG | **Ja, begge.** Putt trenes under både Teknikk og Golfslag, på lik linje med tee/innspill/nærspill — ingen særbehandling. | Bekrefter allerede-antatt struktur i §2.2. Fjern «antatt, bekreft»-forbeholdet. |
| 8 | P-posisjon på SLAG? | **Område avgjør, ikke pyramide.** P-posisjon gjelder for tee total og alle innspill-områder — uansett om pyramiden er Teknikk eller Golfslag. Ikke TEK-eksklusivt slik §2.4 hittil har vært implementert. | §2.4 og §2.6 må endres: betingelsen `pyramide = TEK OG område ∈ {...}` blir til bare `område ∈ {...}`. Slot-tabellen i §2.6 må gi SLAG på tee/innspill 7 slots (samme som TEK på tee/innspill), ikke 6. |
| 9 | Drillens P vs. planposisjonens P | **Uavhengig.** Drillens P-felt står fritt, arves ikke fra `TechnicalPlanPosition.pNummer`. | Løser det åpne spørsmålet i §2.4 sin siste linje. Ingen strukturendring — bekrefter at drill-nivå P kan avvike fra plan-nivå P uten at det er en feil. |
| 10 | Oppstilling/Grep vs. P1.0 — redundans? | **To gyldige innfallsvinkler, ikke redundans.** P1.0 dekker mange elementer (fotstilling, grep m.fl.) samtidig — Oppstilling og Grep som egne delferdigheter skal IKKE slås sammen med eller fjernes til fordel for P-posisjonen. | Ingen endring i §2.3 sitt delferdighetssett for tee/innspill/nærspill (`OPPSTILLING · GREP · SIKTE · BALLSTART · SKRU · LENGDEKONTROLL`) — alle seks beholdes som distinkte fra P-posisjonen. |
| 1b | FYS-delferdighet for Kondisjon/Spenst/Bevegelighet | **Ingen.** Kun Styrke får delferdighet (`RFD · MAKSSTYRKE · UTHOLDENHET`, uendret fra 03.08). Kondisjon, Spenst og Bevegelighet får INGEN delferdighet-nivå — ikke tre tomme slots som skal fylles senere, men et bevisst "finnes ikke" for disse tre. | §2.3: disse tre FYS-områdene stopper på område-nivå, ingen delferdighet-steg i UI for dem. |

---

## Status etter denne avklaringen

9 av 10 opprinnelige punkter i §4 er nå lukket. Gjenstår: punkt 6 (§5.1,
understrek-problemet i `STRATEGI_TAKTIKK`) og de tre tilleggspunktene fra §6
(innspill-grenser §6.4, putt-bøtter §6.5, P-format §6.6 — alle tre er kodefunn,
ikke domenespørsmål, og krever at noen sammenligner spesifikasjon mot kildekoden
linje for linje, ikke et spørsmål Anders kan svare på fra minnet).

**Fortsatt sant, uendret av denne avklaringen:** v3 er ikke kjørt i kode. Ingen
migrasjon er startet. Prisma-enumene, `taxonomy.ts` og de andre filene i §5.3 er
fortsatt uendret. Denne avklaringen gjør spesifikasjonen mer komplett — den gjør
den ikke implementert.
