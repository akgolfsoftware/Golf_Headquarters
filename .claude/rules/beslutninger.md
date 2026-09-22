# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Full historikk (1 207 linjer, alle overstyrte valg): [beslutninger-full.md](../../docs/arkiv/instruks-2026-09-21/beslutninger-full.md). Gamle blokker der er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit og inn i `docs/MASTERPLAN-GJENSTAAENDE.md`).
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## Design (Anders 21.09.2026, bindende)

**AK Golf Design System og Claude Design-prosjektet «App design» gjelder.** Train-lock og Paper er utgående: ingen visuell fasit, bare funksjonsinventar. Spør aldri på nytt om dette. Kilde og ID-er: [design-autoritet.md](../../docs/design-system/design-autoritet.md).
- Kode med Train-lock-/Paper-/`v2`-navn beholdes til funksjonene er flyttet. Navnene gir ingen autoritet.
- Claude Code/Design eier designet; Codex bygger det i appkoden.
- Konkret skjermvariant innen systemet kan Anders fortsatt velge før bygging.
- Ferdig skjerm = funksjonen virker og Anders har sett den (mobil 390 px + desktop, lys og mørk, tom/laster/feil).
- Paper er fjernet fra plattformen; vakten `scripts/check-ingen-paper.mjs` kjører i `npm run verify`.
- Ingen `className="dark"`; tema styres bare av `data-v2-tema` på `<html>`. Mørk er standard på `/portal` og `/admin`, lys på `/auth` og `/forelder` og landingssidene (`src/lib/v2/tema-default.ts`).
- Ikke bruk `accent` som tekstfarge på `primary`; bruk `-foreground`-paret.

## Aldri sidelengs rulling (Anders 22.09.2026, bindende)

Ingen skjerm, flate, rad, liste eller egen struktur skal kreve at brukeren drar skjermen
sidelengs. Gjelder alle områder (`/portal`, `/admin`, `/forelder`, marked, `/auth`, WANG,
Team Norway), alle bredder og alle tilstander — også piller, faner, tabeller, kortrader og
verktøyrader vi bygger selv.

- Løsningen er ombrekking (`flex-wrap`), stabling, kortere kolonner eller oppdeling.
  Aldri `overflow-x:auto` på en rad brukeren må se hele.
- Flex- og grid-beholdere med tekst som ikke brytes MÅ ha `minWidth: 0` (se gotchas §UI).
- Kontrolleres maskinelt per skjerm i begge bredder og hver tilstand: ingen node utenfor
  rammen, og `scrollWidth === clientWidth`. Bevis føres i skjermens manifest, port 4.
- Trengs sidelengs rulling likevel, er det et avvik som legges fram for Anders før det
  bygges — ikke et valg som tas underveis.

## Treningsfag

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk (18.08). Vokabularet består som frie merkelapper. Gjeninnfør aldri en regel uten ny beslutning.
- AK-formel v2: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`. Motorikk UTEN_BALL/LAV_HAST/AUTO, press ALENE/OBSERVERT/KONKURRANSE/TURNERING. L-faser, CS, M0–M5 og PR1–PR5 er utgått. v3 er skrotet.
- Ordbok: `docs/ordbok.md` (erstatter `ordbok-master-trening.md`; `docs/ordbok.json` genereres).
- TrackMan-parametere på engelsk med stor forbokstav (Attack Angle, Club Path, Smash Factor).
- Tester planlegges i Workbench; resultat synkes til talentprofilen.

## Workbench

- Spillerens `WorkbenchV2` er den ene motoren; coach får samme komponent med stall-velger og gruppe-modus. `WorkbenchUke` bygges ikke videre.
- `WorkbenchSession` er den ene økt-tabellen (OW-3).
- Ny uke starter aldri tom: «kopier forrige uke» er standard.
- Flytting av økt skal være ekte dra-og-slipp, også på mobil (17.09).

## Produkt og tilgang

- Nivåer FULL / TALENT / INGEN, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`. FULL: 299 kr/mnd eller 2 690 kr/år. ELITE finnes ikke. Detaljer: BUSINESS-RULES §Abonnement.
- PlayerHQ har fire faner: I dag · Plan · Analyse · Meg. Coach-menyen følger prototypen fra 02.09 (Cockpit, Innboks, Stall, Kalender, Workbench + Mer).
- Én inngang per funksjon: én adresse, gamle adresser blir redirects, ingenting fjernes.
- Coachflaten kalles AgencyOS (`/admin`), aldri CoachHQ. Demo: spiller Øyvind Rohjan, coach Anders Kristiansen.
- Jarvis forbereder alt og sender ingenting. Alt som forlater huset eller endrer noe for et menneske krever Anders' ja.
- Forelderen er kjøperen for juniorer; forelder kan booke for barnet.
- Stripe-live og ekte kjøp verifiseres sist, rett før røyktesten.

## Merke og tekst

- MORAD og Mac O'Grady nevnes aldri offentlig. P-posisjoner som internt fagspråk består.
- Ingen vitnesbyrd, sitater eller stjerner. Vis målingen.
- Kartleggingsøkt er ikke gratis: 90 min til vanlig timepris. Prisen leses fra `ServiceType.priceOre`, aldri hardkodet.
- Mulligan knyttes ikke direkte til AK Golf-merket; AK Golf promoterer bare.
- Ingen «Vi svarer innen én virkedag» før Jarvis er i drift.
- Team Norway: eget Claw-system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*`. Analyse og DataGolf for TN er delte plattformflater.
- WANG har eget system (`src/styles/wang-tokens.css`). Junior Academy og GFGK Junior er ulike ting.

## Data (brytes disse, blir tallene feil)

- Kun brutto. Netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N».
- Til-par fra `public_player_entries.scoreToPar`; par utledes aldri fra baneregisteret.
- `position` er aldri persentil. Aldersstige bare fra 16 år.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri åpent; manglende fødselsår vises ikke.
- Alt appen sier om en spiller skal ha måling, dato og kilde (TruthLayer); estimat merkes.
- Kohortsammenligning er kun coachens verktøy. «Powered by Data Golf» på alle offentlige statistikkflater.
- Økonomitall leses fra Tripletex-eksport, aldri estimert.

## Åpent (ikke besluttet, ikke bygg som fasit)

- FYS-formel og A–K-nivåtall. Dosefelter på `WorkbenchDrill` før OW-3 fase 3.
- WANG-/TN-felles kjerne (menystruktur foreslått av Codex 21.09, ikke vedtatt).
