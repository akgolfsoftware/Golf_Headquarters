# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Full historikk (1 207 linjer, alle overstyrte valg): [beslutninger-full.md](../../docs/arkiv/instruks-2026-09-21/beslutninger-full.md). Gamle blokker der er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## Forelder-skallet bruker hamburger, som AgencyOS og PlayerHQ (Anders 23.09.2026, bindende)

**`/forelder` skal ha samme navigasjonsmønster som AgencyOS og PlayerHQ: hamburgermeny på
mobil, topplinje med fire mål + «Mer» på desktop.** `MOBILMENY-BESLUTNING.md` (i Claude
Design-prosjektet «App design», `830e7bce`) navngav tidligere kun AgencyOS og PlayerHQ —
den gjelder fra nå av forelder også.

Bakgrunn: fire designagenter tegnet FO-01 til FO-04 parallelt i samme økt og endte med tre
ulike skall, fordi ingen felles mal fantes — verken i koden (`src/components/v2/shell.tsx`
har i dag fast bunnrad + 64 px ikonskinne for forelder, ikke hamburger) eller i en
beslutning. FO-01 fulgte koden (bunnrad/ikonskinne), FO-02 landet midt mellom (bunnrad på
mobil, topplinje på desktop), FO-03 brukte allerede hamburger/topplinje. FO-02 flagget
sprikET selv og ba om én avgjørelse før retting, i stedet for et tredje gjetteforsøk.

**Skallet skal ligge i én delt modul, ikke dupliseres i hver skjerm** — samme lærdom som
hurtigknappen og mobilmenyen i AgencyOS (`agencyos-handover/ag-mobilmeny.css/.js`,
`ag-hurtigknapp.css/.js`). I Claude Design-prosjektet: `playerhq-handover/fo-skall.js` +
tilhørende del av `ph-flate.css`. I kodeimplementasjonen: samme prinsipp — ett skall
`src/components/v2/shell.tsx` (eller en egen forelder-variant av det) endres én gang, ikke
per side.

**Overstyrer:** dagens faktiske oppførsel i `src/components/v2/shell.tsx` for `/forelder`
(`BunnNavLenker`/`IkonRailNav`), som forblir riktig for `/portal` og er uendret der.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Rett FO-01, FO-02 og FO-04 i Claude Design** til hamburger på mobil / topplinje med
   fire mål + «Mer» på desktop — FO-03 er allerede riktig og kan brukes som fasit. Bygg den
   delte modulen (`fo-skall.js`) i samme slag, ikke etterpå. Mål alle fire på nytt (begge
   rammer, lys og mørk — merk: forelder er lys som standard).
2. **Implementer i kode:** `src/components/v2/shell.tsx` — forelderflaten (`erAgency`/
   `erPlayer` er i dag begge `false` for `/forelder`, se kartleggingen i
   `playerhq-handover/FO-*-manifest.md`) skal rendre samme hamburger/topplinje-mønster som
   AgencyOS/PlayerHQ bruker, ikke `BunnNavLenker`/`IkonRailNav`.
3. **Oppdater `MOBILMENY-BESLUTNING.md`** i Claude Design-prosjektet til å navngi forelder
   som tredje flate under samme mønster.

Port 7 (Anders har sett skjermene) gjelder som for alle andre skjermer — de fire FO-rettingene
er ikke ferdige før det.

## Utfordringer skal leve (Anders 22.09.2026, bindende)

**Utfordringsfunksjonen beholdes og bygges ferdig.** I dag er den død: `opprettUtfordring`
i `src/app/portal/(legacy)/utfordringer/actions.ts` er ferdig skrevet med revisjonsspor og
automatisk deltakelse for eier, men **har ingen kallere** — `/portal/utfordringer/ny` er en
videresending rett tilbake til lista. Ingen kan opprette en utfordring, og finnes det ingen
utfordringer, er hele flaten tom.

- **Deltakere velges fra venner og gruppa, aldri ved delt lenke.** Du huker av hvem som skal
  få utfordringen, og de får varsel i appen. Kilder: `Friendship` med `status = "ACCEPTED"`,
  og `GroupMember` med `endedAt: null` i gruppene du selv er med i. En coach kan i tillegg
  velge fra stallen sin. **Ingen lenke som åpner en utfordring for hvem som helst** — de
  fleste deltakerne er mindreårige, og en delbar lenke omgår samtykket.
- **Scoren får en retning.** `reberegnRanger` sorterer i dag alltid synkende, og skjemaet sier
  «Høyere er bedre». Det gjør «færrest putter» og «kortest samlet avstand» umulig å rangere
  riktig. `DrillChallenge` trenger et felt som sier om høyest eller lavest vinner, satt når
  utfordringen lages.
- **«Opprett utfordring» bærer rust.** Handlingen forplikter: den lager noe andre blir med i
  og rangert i, på linje med Publiser og Send. Dette er en anvendelse av
  §Rust følger handlingen, ikke ordet — ikke et unntak fra den. **Avslutt utfordring er
  grafitt** i et kort med rustkant, som alle avslutninger.
- **En avsluttet utfordring heter «Avsluttet», ikke «Fullført».** Den er avsluttet av eieren;
  den er ikke nødvendigvis fullført av deg.
- **Utfordringer teller ikke som trening.** De går ikke inn i planen, ikke i analysene og ikke
  til coachen. Registrert score lever bare i utfordringen.

Tegningen er PH-15 i Claude Design-prosjektet «App design» (`830e7bce`), med manifest i
`playerhq-handover/PH-15-manifest.md`. Port 7 gjenstår.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bygg `/portal/utfordringer/ny` som ekte skjerm** og kall `opprettUtfordring`. Fjern
   videresendingen i `src/app/portal/(legacy)/utfordringer/ny/page.tsx`. Ferdig når en spiller
   kan lage en utfordring og lande på detaljen for den, som deltaker.
2. **Legg til deltakervelgeren** i ny-skjermen: venner (`Friendship` ACCEPTED) og medlemmer av
   egne grupper (`GroupMember`, `endedAt: null`), med varsel via `notify()` til hver valgt.
   Coach ser i tillegg stallen sin. Ferdig når ingen kan bli med uten å ha blitt valgt.
3. **Gi scoren en retning** i `DrillChallenge` (additiv kolonne via `db execute`, se
   gotchas §Database), og la `reberegnRanger` sortere etter den. Ferdig når en utfordring der
   lavest vinner får riktig resultatliste.
4. **Legg en inngang fra Meg.** `/portal/utfordringer` har tilbakelenke til `/portal/meg`, men
   ingenting i Meg lenker dit — eneste veier inn er Cmd+K og `/portal/utenfor-banen`.
5. **Rett språket:** «Fullført» → «Avsluttet» i `UtfordringerV2` og `UtfordringDetaljV2`;
   manglende plassering vises som tankestrek, ikke bindestrek; fjern «Del utfordringen og
   inviter andre til å bli med» fra tomteksten, som lover noe som ikke finnes.
6. **Notatfeltet over flere linjer.** Et notat på to setninger kan i dag skrives, men ikke
   leses tilbake — feltet er enlinjes og ruller sitt eget innhold.

Port 7 (Anders har sett skjermen) gjelder som for alle andre skjermer.

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

## AK-stigen har fire trinn, og Knøtt får egen gruppe (Anders 22.09.2026, bindende)

**Knøtt (11–12 år) er ikke et trinn i AK-stigen.** Stigen er Mini → Basis → Utvikling →
Elite. Aldersgruppen skal likevel ha sin egen gruppe, og den gruppen hører hjemme **ved siden
av stigen** — sammen med WANG Toppidrett — ikke som et hull i den.

**Rollen ASSISTANT heter «Assist Coach» på skjerm.** Tidligere sto det «Hjelpecoach» og
«Hjelpetrener» om hverandre i koden. Coach heter «Coach», spiller heter «Spiller».

Gjennomført i denne beslutningen: `AK_STIGEN_TRINN` har fire trinn, `vedSidenAv` erstatter
`overStigen` (liste, ikke ett felt), og rolleordene i `GruppeDetaljV2` er rettet. Tegningen er
AG-03c i Claude Design-prosjektet «App design».

**Gjenstår:** gruppen «GFGK Junior Knøtt U12» finnes ikke i basen ennå. Den må opprettes —
enten manuelt, eller ved at den legges inn i `GFGK_BOOTSTRAP_GRUPPER` med egen kanonisk slug.
Uavklart: om den offentlige juniorsiden (`/junior`), som i dag beskriver **fem** trinn med
Knøtt som det andre, skal skrives om. Den endrer publisert markedstekst og venter på Anders.

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
