# NORDSTJERNEN — hva AK Golf HQ er og skal være

> Dette er «hvorfor»-dokumentet. `docs/MASTER-SKJERMPLAN.md` er «hva» (hver
> skjerm + haker), `docs/AGENCYOS-INVENTAR.md` er «hvordan det ser ut nå»,
> `docs/VEIKART-BESTE-VERKTOY.md` er «veien videre». Ved konflikt om
> forretningsregler vinner `docs/platform/BUSINESS-RULES.md`.
> Kvalitetsstandard: produktet skal tåle å selges for millionsum — design,
> ytelse, datasikkerhet, GDPR og funksjon i alle ledd.

## Én plattform, fire ansikter, samme sannhet

Én database, ett designsystem, én terminologi (MORAD/CANON, brutto score,
norsk bokmål med ordboken — «nærspill», aldri «kort spill»).

### For SPILLEREN (PlayerHQ, /portal) — «min utvikling, bevist»
Åpne appen og på sekunder vite: hva trener jeg I DAG (plan), hvordan
gjennomfører jeg det (live-økt, tapper, drills), og blir jeg BEVISELIG bedre
(SG, tester, TrackMan, runder — alltid ekte tall, aldri fabrikkert). Alt appen
sier er en ANBEFALING — ingenting sperrer trening (låst prinsipp). Mindreårige
beskyttes av foreldresamtykke-porten før datainnsamling.

### For COACHEN (AgencyOS, /admin) — «hvem trenger MEG i dag, og hva godkjenner jeg»
Kontrolltårnet som lar én coach drive 50+ spillere med kvalitet. Motoren lager
utkastene (ukeplaner, meldinger, drill-forslag) — coachen BESLUTTER. Alt som
kan gjøres der du ser det, gjøres der du ser det: trykk en tom luke → book;
trykk en økt → endre; dra → flytt.

### For FORELDEREN (/forelder) — trygghet
Lese-først innsyn i barnets utvikling, økonomi og samtykke. GDPR-flyten er en
funksjon, ikke et hinder.

### For FORRETNINGEN (AK Golf Group) — hver time teller
Kapasitet vist som penger, ett-trykks betaling, churn-vern før spillere
slutter, purring som går av seg selv, månedstall per selskap
(Academy/WANG/GFGK/Mulligan). Mål: 500K USD/år fra apper og coachingsystemer —
appen skal både LEVERE coaching og SELGE den.

## De to loopene (alt i appen mater én av dem)

- **Coaching-loopen:** Mål → Plan → Gjennomføre → Måle → Justere → (Plan).
- **Business-loopen:** Lead → Prøvetime → Pakke → Fornyelse/oppsalg → Henvisning.

En skjerm er bare verdifull hvis den (a) gjør en spiller bedre, (b) gjør en
time mer lønnsom, eller (c) sparer coachen for tid. Alt annet er støy.

## Planleggings-pyramiden (verdensledende coach-tidsbruk)

Planlegging skjer OVENFRA og på GRUPPENIVÅ som standard: årsplan/periodisering
settes én gang per gruppe fra maler, periodene ruller automatisk, ukene
genereres i batch, og coachen bruker tiden sin på AVVIKENE — aldri på å taste
40 like uker. Tidsbudsjett-mål: helt år for 4 grupper/40 spillere < 60 min;
ny sesongperiode for én gruppe < 10 min; ukejustering per spiller < 1 min;
ny uke for hele stallen < 15 min (batch-godkjenning).

## Tilgangsskillet (LÅST forretningsregel)

En spiller med KUN PlayerHQ-abonnement (299 kr, uten Academy-tilhørighet) er
SELVBETJENT: ingen coach-tilgang i portalen, og USYNLIG i hele AgencyOS
(stall, cockpit, køer, motor-batch). Låses opp først ved coaching-pakke
(Performance / Performance Pro) eller Academy-/gruppe-tilhørighet.
Selvbetjente møter en «Bli med i AK Golf Academy»-flate (oppsalg), aldri
en blindgate.

## Interaksjonsprinsippene (premium-følelsen, gjelder hver skjerm)

1. **Handle der du ser:** varsel/rad har handlingen inline — aldri «gå et
   annet sted for å gjøre noe med dette». Mål: ≤2 trykk fra cockpit for de
   10 vanligste coach-oppgavene.
2. **Trykkbar tid:** alle kalendere/tidslinjer oppretter ved trykk på tom
   luke (booking/økt/hendelse, tid forhåndsutfylt).
3. **Dra er sant:** vises en drag-affordance, VIRKER den (og lagrer).
4. **Trykk for å endre:** valgt objekt (økt, periode) redigeres inline —
   aldri slett-og-lag-ny.
5. **Aldri blindgate:** hver underside har naturlig tilbake-knapp
   (TilbakeLenke); tomtilstander sier alltid neste steg.
6. **Tall → hvorfor → hva nå:** nøkkeltall kan trykkes; HjelpTips forklarer
   faguttrykk («?»-regelen).
7. **Null døde knapper.** Én adresse per funksjon.
8. **Mobil = handling, desktop = analyse.**

## Sikkerhetsprinsippene (gjelder hver pakke — full liste i gjeldende plan)

- Minste tilgang: rolle-guard + capability-gating (CBAC) + coach-scope;
  tilgangsskillet håndheves av ÉN sentral helper i alle loadere.
- Penger: trekk kun med eksplisitt lagret-kort-samtykke; server-validerte
  beløp; idempotens; AuditLog; webhooks er sannheten.
- Mindreårige/GDPR: samtykke sjekkes før enhver utsendelse; ingen PII i
  agent-logger; innsyn/retting/sletting fungerer ende-til-ende.
- AI muterer aldri direkte: alt lander som utkast i godkjenningskøen, og
  re-valideres mot nå-tilstand ved godkjenning. Kunderettet auto-sending kun
  etter kø-godkjenning (unntak: purring, maks 2, deretter menneske).
- All JSON fra databasen zod-valideres ved lesing. Cron bak CRON_SECRET,
  idempotent, logget.

## Design-kanon

v2 retning C «Presis» — mørk Bloomberg/Linear-presisjon i AK-merkevaren
(forest `#005840` · lime `#D1F843` · cream · graphite). Kun v2-biblioteket
(`src/components/v2`), Lucide (aldri emoji), HjelpTips på faguttrykk, ærlige
tomtilstander. Designdommer (`ak-designekspert`) ≥9/10 på hovedflater før
lansering. Full regel: `.claude/rules/design-system-regel.md`.
