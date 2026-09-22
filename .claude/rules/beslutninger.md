# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Full historikk (1 207 linjer, alle overstyrte valg): [beslutninger-full.md](../../docs/arkiv/instruks-2026-09-21/beslutninger-full.md). Gamle blokker der er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (Anders 22.09.2026, bindende)

**Det skarpe Team Norway-språket eier `/team-norway/*`. Claw er utgående for appen.** Fasit blir et nytt Claude Design-prosjekt «Team Norway App», avledet av «Team Norway Golf Design System» (`3416f258`): Jost display, Lato brødtekst, IBM Plex Mono på tall, hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar, lukket ikonsett på 20.

- **Rød er `#D70232`** — målt fra logofilen. Kommunikasjonssystemets `#d40e3a` gjelder ikke i appen og rettes ved avledningen. Navy `#012B5D` er uendret i begge.
- **Sidemenyen er full navy `#012B5D`**, hvit tekst, lysere navy bak aktiv rad, rød markør. Den bor bare i `TnShell`/`TnRail` — aldri bygget på nytt per side.
- «Team Norway Golf Design System» beholder kommunikasjonsflatene (brev, e-post, plakat, presentasjon, rapport, sosiale). App-UI hører ikke hjemme der; dets egen beslutningslogg forbyr det.
- Claw (`a03bf94a`) og speilet `designsystem/team-norway/` er funksjonsinventar og historikk for appen, ikke visuell fasit. Spør ikke om dette på nytt.

**Overstyrer:** «Team Norway: eget Claw-system» under §Merke og tekst, og `designsystem/team-norway/LES-MEG.md` §Myndighet. Rødverdien er uendret fra 30.08.2026.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. Nytt prosjekt «Team Norway App»: tokens avledet av `3416f258` med rød rettet, skall TN-01 med navy sidemeny, mobil 390 px.
2. De fire internskjermene (Venter på meg, Analyse, Lisens og økonomi, Organisasjonsoppsett) tegnes om mot skallet — tokens i stedet for ~150 hardkodede farger, responsiv i stedet for fast 1440 px, menypunkter som matcher `tnHovedmeny`.
3. `src/styles/team-norway-tokens.css`: skrifter, hjørner, skygger, farger. Jost og Lato lastes i `src/app/team-norway/layout.tsx` i stedet for Schibsted Grotesk.
4. `src/components/team-norway/core.tsx`: de 18 `radius.full`-formene blir firkantede, avataren kvadratisk, `TnRail` navy.
5. Fem skjermer bygger skallet for hånd og spriker — `/team-norway`, `[groupId]`, `[groupId]/dokumenter`, `spiller/[spillerId]`, `tilgang`: to organisasjonsnavn, fire undertitler, tre innholdsbredder. Alle over på `TnShell`.
6. Maskinell måling av alle 21 TN-ruter i 390 px og desktop, tom/laster/feil: ingen sidelengs rulling, ingen node utenfor rammen, treffmål minst 44 px, kontrast godkjent på navy.
7. Rett `designsystem/team-norway/LES-MEG.md` og `ak-merkevare`-skillen — begge peker i dag på Claw for TN.

Ferdig skjerm krever fortsatt at Anders har sett den (port 7).

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

## Rust følger handlingen, ikke ordet (Anders 22.09.2026, bindende)

**Rust `#9B2415` bæres av den bekreftende handlingen på skjermen — uansett hva den heter.**
Merge, Send, Legg i kalenderen, Publiser, Godkjenn og START ØKT er samme handling med riktig
navn, og alle bærer rust. Dette avløser formuleringen «rust kun på Publiser, Godkjenn og
START ØKT», som beskrev de tre stedene regelen var prøvd, ikke prinsippet bak den.

Bakgrunn: køen (`/admin/ko`) har ulike handlingsord per kilde, hentet fra
`AdminGodkjenningerTrainLock.tsx`. Å kalle alt «Godkjenn» for å få rust ville skjult at et
Caddie-utkast faktisk sender en e-post ut av huset.

- **Alt annet er grafitt.** Test: gjør knappen det saken ber om, eller noe annet? Åpne økt,
  Fortsett økt, Prøv igjen, Lagre, Kjør og Slå sammen avgjør ingenting — de er grafitt.
- **Sletting bærer aldri rust.** Rust betyr godkjenn; en sletting er det motsatte. Den
  bekreftende knappen i en sletting er grafitt i et kort med rustkant.
- **Én rust per skjerm.** Står to bekreftende handlinger synlig samtidig, bærer den valgte
  saken rust og resten grafitt.
- Domenefarge blir aldri en handling. Signalfargene bærer aldri lesbar tekst alene.

Krever ingen kodeendring nå — regelen styrer designarbeidet i Claude Design «App design»
(`SKILL.md` §Rust). Den gjelder appkoden når AgencyOS-skjermene bygges.

## Hurtigknappen gjelder alle AgencyOS-skjermer (Anders 22.09.2026, bindende)

Den flyttbare svarte hurtigknappen skal finnes på **alle skjermer i AgencyOS**, ikke bare Hjem.
Fire hurtighandlinger: ny økt i Workbench · ny melding til spiller · registrer runde · spør
Jarvis.

- Den bor i **én delt modul**, ikke som kopiert kode per skjerm: i designprosjektet
  `agencyos-handover/ag-hurtigknapp.css` og `.js`. Bygges den i appen, skal den være én
  komponent brukt av skallet — ikke én per side.
- Faste regler: 56 × 56 px grafitt, radius 2 · kan dras hvor som helst og klemmes 8 px fra
  hver kant · drag åpner ikke menyen (under fem piksler er et trykk) · menyen snur når den
  ellers ville gått utenfor flaten.
- **Ikke avklart: om den også gjelder PlayerHQ.** Legg den ikke på spillerflaten før Anders
  har sagt det.

Byggeoppgave når AgencyOS-skallet bygges: knappen hører til skallet (`src/components/v2/shell.tsx`),
ikke til den enkelte siden. Ferdig når den står på hver `/admin`-side, husker posisjonen sin,
og ikke kan dras ut av syne.

## Treningsfag

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk (18.08). Vokabularet består som frie merkelapper. Gjeninnfør aldri en regel uten ny beslutning.
- AK-formel v2: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`. Motorikk UTEN_BALL/LAV_HAST/AUTO, press ALENE/OBSERVERT/KONKURRANSE/TURNERING. L-faser, CS, M0–M5 og PR1–PR5 er utgått. v3 er skrotet.
- Ordbok: `docs/ordbok.md` (erstatter `ordbok-master-trening.md`; `docs/ordbok.json` genereres).
- TrackMan-parametere på engelsk med stor forbokstav (Attack Angle, Club Path, Smash Factor).
- Valgtreet fra årsplan til øvelse (åtte trinn) eies av `docs/treningsplanlegging-og-sprak-gjennomgang.md` (22.09). Puttingavstand i fot, meter kan vises i parentes. Måleutstyr er en fast liste (TrackMan og annen radar). Teknisk fokus per område er eget felt på oppgaven i teknisk plan.
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
- Team Norway: eget system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*` — visuell fasit er §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, ikke Claw. Analyse og DataGolf for TN er delte plattformflater.
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
