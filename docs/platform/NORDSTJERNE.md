# NORDSTJERNE — AK Golf HQ

> **Hva er dette?** Den ene setningen alt skal måles mot. Les denne først — alltid.
> Ved konflikt: denne fila vinner over all annen dokumentasjon unntatt
> `docs/platform/BUSINESS-RULES.md` (låste forretningsregler).

---

## Produktet

**AK Golf HQ er et komplett coaching-system for golf — ikke en app med funksjoner,
men en digital coachvirksomhet som skal tåle å selges for millionsum.**

Fire produkter, én plattform:
- **PlayerHQ** (`/portal`) — spillerens hjem: plan, økt, analyse, fremgang.
- **AgencyOS** (`/admin`) — coachens kontrolltårn: stall, kø, kalender, innsikt.
- **Booking** (`/booking`) — minst mulig trykk fra «vil ha hjelp» til «betalt økt».
- **Marketing** (`/`) — skal selge coachingen. Én database, ett designsystem, én terminologi.

## Det vi aldri gjør

1. **Anbefalinger sperrer aldri.** Ingenting i appen blokkerer trening. Avvik vises
   i klarspråk; sterkt avvik varsler coach. Dette er en gjeldende produktregel og gjelder
   all logikk, alle agenter, all UI.
2. **Vi gjetter ikke på brukeren.** Data kvalifiserer råd — TrackMan-verifisert,
   GPS-beregnet og selvrapportert er ulike tillitsnivåer og skal merkes slik.
3. **Vi forvirrer ikke spilleren.** Norsk bokmål, klarspråk (nærspill, ikke ARG),
   én primær CTA per skjerm. Vanskelig å forstå = feil design.
4. **Vi bygger ikke to sannheter.** Én SG-beregning, én plan-motor og én sannhetskilde per
   domene. Avledet data regenereres fra kilde — aldri kopier og la dem drive fra hverandre.

## Kvalitetsstandard

God nok er ikke god nok. Hver flate skal tåle gransking fra en krevende coach,
en krevende spiller og en krevende investor. Ved tvil: ville Anders vist dette
frem som bevis på at systemet er bedre enn konkurrentene?

## Design (RETTET 12.09.2026 — nytt system fra blankt lerret)

> Claude Design utvikler AK Golf HQ Design System v0.1 i retningen «Atletisk intelligens».
> Før en versjon er valgt, er eksisterende UI bare funksjons- og implementasjonsgrunnlag. Når
> Anders velger en komplett pakke med `selectedForBuilding: true`, er denne pakkens visuelle
> autoritets-ID eneste visuelle fasit for det avtalte omfanget. Train-lock, Paper og tidligere
> Team Norway-/WANG-uttrykk kan ikke bli liggende som parallelle regler. Én systemgrammatikk kan
> ha sportslig PlayerHQ, operativt rolig AgencyOS og dokumenterte profiler for lag/skole,
> booking, marked og øvrige brukerflater. Kvalitetsstandarden er uendret.

## Forretningsramme

- Abonnement: gratis (prøve/TALENT/pakke/gruppe) eller 299 kr/mnd (2 690 kr/år). Coaching-pakker
  (Performance / Performance Pro) er økt-credits, ikke app-nivåer. ELITE vises aldri. Se
  `docs/platform/BUSINESS-RULES.md` §Abonnement og tilgang for fasit (tre nivåer FULL/TALENT/INGEN).
- **Betaling startet 1. september 2026** (rettet fra "1. august" 02.09.2026 — datoen var feil;
  se `src/lib/feature-flags.ts` `BETALING_STARTER` og `docs/platform/BUSINESS-RULES.md`).
- Detaljer: `docs/platform/BUSINESS-RULES.md`.

## Metodikk

AK-metodikken er plattformens treningsfaglige grunnlag. Gjeldende begreper og
beslutninger eies av treningsfasiten, ordbøkene og Anders. Pyramide, A–K og MORAD
P-system kan brukes som faglige merkelapper, men de tidligere 13 invariantene og
CS-progresjonen er pensjonert og skal ikke gjeninnføres som krav.

Club Speed-beslutningen fra 1. september gjelder: motorikk er AUTO, og «uten ball»
er en egenskap ved øvelsen, ikke et eget motorikksteg. Se
`docs/ordbok-ak-golf-konsept.md` §3.

---

*Denne fila vedlikeholdes av Anders. Endringsforslag går via PR med hans godkjenning.*
*Sist oppdatert: 2026-09-13*
