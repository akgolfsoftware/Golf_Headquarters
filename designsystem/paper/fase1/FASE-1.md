> ⚠ **UTGÅTT PÅ FLERE PUNKTER 06.08.2026 — historisk leveranserapport, ikke gjeldende fasit.**
> Skrevet 31.07.2026 for de sju første filene. Siden overstyrt av Anders' beslutninger 03.08–05.08:
>
> - **AK-formelen er v2**: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS` — L-faser, CS-nivåer,
>   M0–M5 og PR1–PR5 finnes ikke. Chip-tabellen under §FangstSheet viser utgåtte v1-formler.
> - **Område-slotten** er de 17 områdene i `AkFormelVelger` (komponentbiblioteket), ikke
>   «TEE · INNSPILL · NÆRSPILL · PUTT · BANE» som står under.
> - **Demo-spilleren er Øyvind Rohjan** — «Emma»-referansene under er utgått navnekanon.
> - **AgencyOS-railen** heter Konsoll · Innboks · Spillere · Kalender · Workbench (låst 05.08),
>   ikke «Konsoll · Kø · Spillere · Kalender · Maskinrom».
> - Filene `kalender-desktop.html`, `kalender-mobil.html` og `index.html` finnes ikke lenger —
>   kalenderen ligger i `agencyos-kalender.html` / `agencyos-kalender-mobil.html`.
>
> Gjeldende regler: `KONTRAKT.md` i denne mappa. Beholdt uendret under for sporbarhet.

---

# Fase 1 · AK Golf HQ chat-først

Dato: 31. juli 2026. Sju selvstendige HTML-filer + `index.html` + `_foundation.css` + `_KONTRAKT.md`.

Alt måles, ingenting påstås. Tallene under er kjørt i headless Chromium, ikke anslått.

---

## De tre beslutningene som styrte alt

**1. Radius 12px, ikke 8.** `tokens/akhq-tokens.css` sa `--r: 8px`, Paper-fasiten sa 12. Konflikten har stått i alle 33 gamle skjermer. Låst til `--r: 12px` / `--r-sm: 8px`.

**2. Primærhandlingen fylles med aksent.** Den gamle regelen var «CTA er blekk, oransje kun Én ting nå» — som i praksis ga en oransje etikett over en svart knapp. Det er ikke monopol, det er abstinens: fargen betød ingenting. Nå er `.btn.now` fylt med `#D97757`, og alt annet er `--cta` blekk eller ghost. Én per skjerm, målt.

**3. Standardsvaret på «lag en skjerm» er et artefakt, ikke en flate.** AgencyOS har fem flater (Konsoll · Kø · Spillere · Kalender · Maskinrom), PlayerHQ har fire (I dag · Plan · Analyse · Meg). Ukeplan, analyse, sjekkpunkt, testresultat, booking — alt er artefakter som åpnes fra tråden. Sidepanel på desktop, bunn-ark på mobil.

Én beslutning kom fra deg underveis: område-slotten i AK-formelen er **TEE · INNSPILL · NÆRSPILL · PUTT · BANE**. WEDGE og APP er luket ut av alle filer.

---

## 1. AgencyOS Konsoll — desktop

**Jobben.** Anders åpner AgencyOS og møter et skrivefelt. Han beskriver hva han vil ha gjort, systemet forfatter et utkast med synlig arbeid, han godkjenner.

**Anatomi.** Rail 64px (alltid mørk, fem flater) · tråd med toppbar og ⌘K-hint · artefaktpanel 380px.

**Interaksjoner.**

| Prompt | Systemet svarer med |
|---|---|
| «Lag treningsplan for Filip neste uke» | 4 arbeidslinjer med kilde og varighet → prosa i Lora → `<details>` «Hvorfor dette tallet» → artefaktkort «Ukeplan · Filip · uke 32 — UTKAST» |
| «Hvem har vært stille lengst?» | Tabell i mono: Jonas 9 dager, Mia 4, Emma 1 — med tidsvindu synlig |
| ⌘K → «Start fangst» | Nivå 1, svarer i samtalen uten å bytte flate |

**Én ting nå:** «Godkjenn ukeplan · Emma». Klikk endrer faktisk tilstand — blokka får tidsstempel, køtallet i rail går 7 → 6, artefaktstatus går UTKAST → PUBLISERT, angre-lenke teller ned fra 10 s og reverserer alle fire.

**Artefaktpanelet** har tre statuser. Den tredje, «Endret siden publisering», nås via Publiser → Endre og varsler at Emma fortsatt ser forrige versjon. Det er den som gjør Publiser trygg.

**Tilstander:** tom (tre startforslag), laster (skjelett-tur med pulserende linjer), feil («Modellen svarte ikke innen 30 s. Utkastet ditt er lagret»), suksess.

---

## 2. AgencyOS Konsoll — mobil

**Oversettelsen.** Rail → fem bunnfaner. Artefaktpanel → bunn-ark med grab-håndtak, sveip-ned over 80px lukker, dra opp gir fullskjerm. ⌘K → «Alt»-knapp i toppbaren. Composer fast rett over fanene.

**Den ene avviket fra desktop:** mikrofonknappen (60px, sirkulær) er skjermens aksentflate, ikke godkjenn-knappen. Begrunnelsen står som HTML-kommentar i fila — fangst er den ene handlingen som må virke med tommelen uten at han tenker. Godkjenn blir `.btn.ink` og virker like fullt.

Arbeidslinjer er kollapset bak «viste 4 steg · 4,7 s». `<details>` «Hvorfor dette tallet» beholdes — den er påkrevd uansett flate.

---

## 3–4. PlayerHQ Chat / I dag — desktop og mobil

**Jobben.** Emma spør «hva skal jeg trene i dag?» og får svar. Hun sier «wedgen føltes tung etter slag 12» og det er fanget. Hun ber om «en 25-minutters økt» og får et utkast hun kan starte.

**Eierskapsskillet er skrevet ut i UI.** Emma er ikke eier av coaching-beslutningene:

- Det som endrer ukeplanen: «Dette går til Anders — du trener som planlagt uansett.»
- Hennes egen observasjon: «Din observasjon, dine ord. Jeg tolker den ikke for deg.» Går rett inn, ingen godkjenning, ingen venting.
- Låste økter: hengelås med forklaring **og** knappen «Be Anders flytte økta» — ikke en deaktivert knapp uten vei videre.

Dette er rettelsen av den verste feilen i den gamle pakken, der `etter-okt` sa «Du trenger ikke gjøre mer» og fjernet det eneste spilleren faktisk eide.

**Sløyfen er lenket, ikke skrevet.** FØR/UNDER/ETTER er `<a href="…?steg=…">` som virker både ved direkte åpning og via `pushState`. UNDER er fullskjerm øktvisning med teller som går. ETTER regner varigheten fra den faktiske telleren og «Neste FØR» legger en ny systemtur i tråden med oppdatert kontekst. Hele runden kan kjøres i fila.

**Én ting nå:** desktop = «Start økta», mobil = mikrofonen.

**Tom tilstand:** «Anders har ikke publisert uke 31 ennå» med tre ting hun kan gjøre likevel. Det var den ene tomtilstanden den gamle `playerhq-idag` manglet.

---

## 5. FangstSheet

Komponenten produktet finnes for. Ett komponentkort med ni seksjoner, fire levende instanser.

**Tre kontekster:** composer (bunn-ark, ett trykk rett i opptak) · under økt (fullskjerm, ingen chrome, slag-teller, notat knyttet til slag) · etter økt (over folden, «hva satt du igjen med»).

**Sju tilstander:** hvile · opptak · transkriberer · lagret · ingen mikrofontilgang · offline · for kort opptak. De to siste er de som avgjør om komponenten tåler en simulator med dårlig nett — og de er veier videre, ikke feilmeldinger: chips virker uansett, notatet køes for synk.

**Chips avledes av formelen**, ikke fra en generisk liste. Formelvelgeren i kortet demonstrerer det:

| Formel | Chips |
|---|---|
| `TEK_INNSPILL_50_LAV_HAST_TRENINGSOMRADE_ALENE` | traff målet · for kort · tempo ustabilt · bra kontakt · vondt |
| `TEK_PUTT_3_5_AUTO_TRENINGSOMRADE_OBSERVERT` | startlinjen traff · åpen kølleflate i treff · gikk på autopilot · sto i presset · vondt · sliten |

Regelen: 4–6 chips, alltid minst én positiv, én negativ og én kroppslig.

**Målt gjennomføringstid** med den innebygde stoppeklokka:

| Kontekst | Tid | Mot mål 20 s |
|---|---|---|
| Composer | 5,2 s | innenfor |
| Under økt (inkl. slag-knytting) | 4,7 s | innenfor |
| Etter økt (inkl. chip-valg) | 4,7 s | innenfor |

**Anti-mønstre** står i kortet, med begrunnelse. Kort: aldri en lagre-knapp (et sted flyten kan mislykkes) · aldri la AI gjette observasjonen · aldri kreve nett for at chips skal virke · aldri chrome over feltet · aldri toast som eneste kvittering.

**Datakontrakt for Grok** ligger i kortet: felt, type, eksempelverdi og hvor det havner, mot `Shot`, `TrackManShot` og `TestResult`.

---

## 6. Kalender — desktop og mobil

**Fem funn fra reviewen er lukket:**

| Var | Er nå |
|---|---|
| Éncelle-TimeGrid | Ressurskalender: Sim 1–3 som rader, 07–22 som kolonner. Overlapp regnes per sim; overlapp mellom sims er ikke kollisjon |
| Primærhandling i sidestolpe som forsvant under 1180px | `.btn.now` i sticky dokk i lerretets egen kolonne. Detaljpanelet blir en skuff, forsvinner ikke |
| `valgtId` satt og aldri lest | `select()` → `renderSide()` rendrer spiller, selskap, tid, varighet, sim, status, formel, tre handlinger |
| `visKollisjon: () => {}` | «Vis i lerretet» bytter visning, ruller til blokka, blinker og velger den |
| Belegg skrevet for hånd (68 % mot 19 % i dataene) | `occupancy()` regner det ut og følger filteret |
| Simulatorutleie som premiss | **Rettet 01.08 (Anders): AK selger kun coachingtjenester.** Sim 1–3 er sted, ikke vare. Alle blokker er coachingtimer; ledige luker er bookbare coachingluker |

**Kapasitet 31. juli:** **32 %** av tilgjengelig coachingkapasitet booket, **34 %** etter kollisjonsløsning. Tallet er avledet i `occupancy()` og følger filteret — det står ikke skrevet noe sted.

Kollisjonen er to coachingtimer i samme sim: Emma 16:00–17:30 mot Junior Academy gruppe C 16:30–17:30. Regelen for hvem som viker er **den som ble booket sist** — gruppe C ble booket 29.07 kl. 20:41, Emma 14.07. To utveier regnes ut mot faktisk ledig tid: flytt til ledig sim samme tid, eller til neste luke som er lang nok i samme sim.

**Mobil er tenkt på nytt, ikke skalert.** Ingen horisontal tidsakse — en 15-timers akse på 430px er uleselig uansett. I stedet: sveipbar dagpille-rad (hver dag ≥44px, «i dag» merket med både aksentramme og teksten «i dag») → vertikal agenda med sim som etikett på raden. Nå-linje «nå · 09:12» på riktig plass. Kollisjon som én sammenhengende gruppe med forklaringslinje, ikke overlappende bokser. Uke = syv rader med antall coachingtimer og kapasitet. Måned = rutenett der hver dag er ≥44px og bærer en tetthetsprikk. Filter i bunn-ark, per din instruks.

**Én ting nå:** «Løs kollisjon · Sim 2 kl. 16:00» → to utveier regnet ut mot faktisk ledig tid. Valget flytter hendelsen i datamodellen, tegner lerretet på nytt, fjerner banneret, oppdaterer belegget og bytter knappen til «Legg inn coachingtime».

To ting du bør vite: alternativ-simen lander på Sim 1, ikke Sim 3, fordi Sim 1 faktisk er ledig 16:30–17:30 og velges først. Og kollisjonen navngis etter Emmas starttid 16:00 mens selve overlappet 16:30–17:30 står i bannerteksten.

Selskapsfilteret er AK Golf Academy · Junior Academy · WANG Toppidrett. GFGK er ikke med — jeg fant ingen time i demodataene som naturlig var en klubbtime, og ville ikke dikte opp en. Si fra hvis den skal inn.

---

## Tokens brukt

Kun det som står i `_foundation.css`. Ingen fil har én hex utenfor `:root` og `[data-theme="dark"]`.

Flater `--bg --surface --soft --border` · tekst `--fg --muted --mid` · rail `--rail --rail-fg --rail-on` · handling `--cta --on-cta --accent --accent-soft --accent-fg --on-accent` · data `--up --dn --info` · type `--disp --ui --body --mono` · rom `--s1`…`--s8` · form `--r --r-sm --r-pill --shadow --scrim` · interaksjon `--focus --ease --dur` · trykkflater `--tap 44` `--tap-lg 48` `--tap-capture 60`.

Trykkflate-gulvet gjelder uansett pekertype, ikke bare `pointer:coarse` — du sa ≥44px flatt, så jeg hevet gulvet i stedet for å la det gjelde bare touch.

---

## Målt, ikke påstått

Kjørt i headless Chromium, 1440px og 390px, lys og mørk.

| Fil | Linjer | Hex utenfor tokens | Synlig oransje handling | Attrapper | H-scroll 390px | JS-feil |
|---|---:|---:|---:|---:|---:|---:|
| agencyos-konsoll-desktop | 1 158 | 0 | 1 | 0 | 0 | 0 |
| agencyos-konsoll-mobil | 1 178 | 0 | 1 | 0 | 0 | 0 |
| playerhq-chat-desktop | 1 400 | 0 | 1 | 0 | 0 | 0 |
| playerhq-chat-mobil | 1 394 | 0 | 1 | 0 | 0 | 0 |
| fangstsheet | 1 117 | 0 | 2¹ | 0 | 0 | 0 |
| kalender-desktop | 1 167 | 0 | 1 | 0 | 0 | 0 |
| kalender-mobil | 1 193 | 0 | 1 | 0 | 0 | 0 |

¹ To levende instanser tre seksjoner fra hverandre, aldri samtidig i viewport. Med en kontekst åpen: 1.

«Attrapper» teller `() => {}`, `href="#"` og tomme `onclick`. `data-od-id` finnes på alt interaktivt: 26–84 per fil. Trykkflater under 44px finnes kun på demo-bryterne.

---

## Klart for Grok å kode

Hele DOM-anatomien og all CSS. Tokens er én kilde. Interaksjonskontraktene er entydige: hvilke elementer eier hvilken tilstand, hvilke id-er som muterer ved godkjenning, hvordan de tre artefaktstatusene henger sammen, tastaturmodellen for begge menyer og paletten. Kalenderens datamodell (`EVENTS`, `busy`, `gaps`, `collisions`, `occupancy`) er ren og API-klar. FangstSheets `parseFormula`/`deriveChips` er ren klientlogikk som virker offline. Tilgjengelighetsmønstrene — fokusfelle, Esc, fokusretur, skip-link, `aria-live` — kan overtas som de er.

## Demo-stillas som skal ut

Alt er merket `data-demo-only="true"` der det lot seg merke. Listen:

- `.state-switch`-radene i alle sju filer
- Simulert opptak og ord-for-ord-transkripsjon (`ORD`/`WORDS`-arrayene, `setInterval`) → byttes mot MediaRecorder + transkripsjonsendepunkt
- Stoppeklokka og feltet `capture_ms` — midlertidig telemetri. Ut når tallet er lest, ikke før
- Hardkodede varigheter på arbeidslinjene og innholdet i de simulerte svarene
- Klokkeslett ankret til 31.07.2026 09:12 i stedet for reell tid
- Formelvelgeren i fangstsheet
- Telefonrammen (`.phone`) i mobilfilene — forsvinner allerede under 520px, men wrapperen bør bort ved integrasjon
- `toast()`-kvitteringer som står i stedet for ekte flatebytte for de flatene som ennå ikke finnes
- `MCOUNT`-tallene for 1.–26. juli og `WEEK`-tabellen i kalenderen

En utvikler som ikke kan se forskjellen på ferdig og stillas, koder stillaset. Derfor står listen her og ikke bare i filene.

---

## Fase 1 klar for godkjenning

Alle seks leveranser er bygget, målt og lenket sammen. Det som gjenstår er din dom, ikke mer arbeid.

**Tre ting jeg vil at du ser spesielt på:**

1. **Fangsttiden.** Åpne `fangstsheet.html`, gå gjennom kontekst B, og se om 4,7 s holder når du faktisk står i simulatoren med hanske på. Tallet mitt er målt med mus.
2. **Aksentbeslutningen på mobil.** På AgencyOS mobil eier mikrofonen aksenten og godkjenn er blekk. Er det riktig prioritering for deg, eller vil du ha det motsatt?
3. **Kalenderens mobilgrep.** Jeg kastet den horisontale tidsaksen helt. Det er den mest inngripende beslutningen i Fase 1. Se om agendaen gir deg det samme overblikket som lerretet gjør på desktop.

**Når Fase 1 er godkjent** går jeg videre til Fase 2: Kø, Spillere, Workbench, Plan, Analyse, Live, TrackMan og Booking — designet som støtteflater og artefakter som åpnes fra chatten, ikke som nye flater i navigasjonen.
