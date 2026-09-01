# NORDSTJERNE — AK Golf HQ

> **Hva er dette?** Den ene setningen alt skal måles mot. Les denne først — alltid.
> Ved konflikt: denne fila vinner over all annen dokumentasjon unntatt
> `docs/platform/BUSINESS-RULES.md` (låste forretningsregler) og
> `src/lib/masterbrain/rag-corpus/morad/canon-invariants-13.md` (metodikk-invarianter).

> **UTGÅTT (se `.claude/rules/beslutninger.md`, «ALLE TRENINGSPLANREGLER LÅST OPP», 2026-08-18):**
> `canon-invariants-13.md` finnes ikke lenger i repoet — invariant-håndhevingen er slettet fra
> koden. Referansen over er historisk og skal ikke leses som en gjeldende fasit-kilde.

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

## Design (åpent — nytt system under arbeid)

Et komplett nytt designsystem utvikles parallelt i Open Design (2026-07-25).
Den gamle v2-kanonen (retning C «Presis», FASIT, hex-gate, 8pt-grid,
designdommer) er bevisst avviklet — **ingen designregler er låst** inntil det
nye systemet er klart og godkjent av Anders. Det som er bygget i koden gjelder
i mellomtiden; kvalitetsstandarden (skal tåle å selges for millionsum) er uendret.

## Forretningsramme

- Abonnement: gratis (prøve/pakke/gruppe) eller 299 kr/mnd. Coaching-pakker
  (Performance / Performance Pro) er økt-credits, ikke app-nivåer. ELITE vises aldri.
- Betaling slås på 1. august 2026. Før det: produksjonsherding.
- Detaljer: `docs/platform/BUSINESS-RULES.md`.

## Metodikk

> **UTGÅTT (beslutninger.md 2026-08-18):** CS-progresjon og «13 invarianter» er pensjonert —
> ingen regel-håndheving i planlegging lenger. Vokabularet (pyramide, A–K, MORAD P-system) består
> som frie merkelapper, aldri krav.

Coaching-metodikken (AK-metodikken / CANON) er plattformens intellektuelle kjerne:
A–K-kategorier, pyramide-fordeling, CS-progresjon, 13 invarianter, MORAD P-system.
Kilde: `src/lib/masterbrain/` (knowledge/ + rag-corpus/, vendored fra Masterbrain-repoet). Metodikken endres ikke av
tekniske hensyn — den endres av Anders.

---

*Denne fila vedlikeholdes av Anders. Endringsforslag går via PR med hans godkjenning.*
*Sist oppdatert: 2026-07-19*
