# NORDSTJERNE — AK Golf HQ

> **Hva er dette?** Den ene setningen alt skal måles mot. Les denne først — alltid.
> Ved konflikt: denne fila vinner over all annen dokumentasjon unntatt
> `docs/platform/BUSINESS-RULES.md` (låste forretningsregler) og
> `src/lib/masterbrain/rag-corpus/morad/canon-invariants-13.md` (metodikk-invarianter).

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
   i klarspråk; sterkt avvik varsler coach. Dette er CANON-invariant #1 og gjelder
   all logikk, alle agenter, all UI.
2. **Vi gjetter ikke på brukeren.** Data kvalifiserer råd — TrackMan-verifisert,
   GPS-beregnet og selvrapportert er ulike tillitsnivåer og skal merkes slik.
3. **Vi forvirrer ikke spilleren.** Norsk bokmål, klarspråk (nærspill, ikke ARG),
   én primær CTA per skjerm. Vanskelig å forstå = feil design.
4. **Vi bygger ikke to sannheter.** Én SG-beregning, én plan-motor, én kanon per
   domene. Avledet data regenereres fra kilde — aldri kopier og la dem drive fra hverandre.

## Kvalitetsstandard

God nok er ikke god nok. Hver flate skal tåle gransking fra en krevende coach,
en krevende spiller og en krevende investor. Ved tvil: ville Anders vist dette
frem som bevis på at systemet er bedre enn konkurrentene?

## Design (LÅST — Paper vinner alltid)

> UTGÅTT (18.08.2026) — denne seksjonen beskrev tilstanden 25.07.2026, før designet ble låst.
> Gjeldende: **Claude Paper vinner alltid** (CLAUDE.md invariant 2, låst 2026-08-03/05).
> Claude Design-prosjektet «AK Golf HQ — Claude Paper» (`605a48cc`) er eneste designfasit,
> full port kjører nå per `docs/port/GYLDIGHET.md`. «Ingen designregler er låst» stemmer ikke lenger.

## Forretningsramme

- Abonnement: gratis (prøve/pakke/gruppe) eller 299 kr/mnd. Coaching-pakker
  (Performance / Performance Pro) er økt-credits, ikke app-nivåer. ELITE vises aldri.
- Betaling slås på **1. september 2026** (`gratisForAlle`-lanseringsvindu). Før det: produksjonsherding.
  (Rettet 18.08.2026 — sto tidligere som 1. august, se `docs/platform/BUSINESS-RULES.md` §4.)
- Detaljer: `docs/platform/BUSINESS-RULES.md`.

## Metodikk

Coaching-metodikken (AK-metodikken / CANON) er plattformens intellektuelle kjerne:
A–K-kategorier, pyramide-fordeling, CS-progresjon, 13 invarianter, MORAD P-system.
Kilde: `src/lib/masterbrain/` (knowledge/ + rag-corpus/, vendored fra Masterbrain-repoet). Metodikken endres ikke av
tekniske hensyn — den endres av Anders.

---

*Denne fila vedlikeholdes av Anders. Endringsforslag går via PR med hans godkjenning.*
*Sist oppdatert: 2026-07-19*
