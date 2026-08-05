# Baneguide — kjøreplan i økter (Fase 1 / MVP)

> Skrevet 2026-08-02. Dette er utførelsesplanen for `docs/baneguide-produktdokument-2026-08-02.md`
> §11–12 (Fase 1), delt i økter à **maks 2 timer** (forbruksregelen). Hver økt er selvstendig:
> den starter fra main, ender med grønn verify, push og PR — og kan fullføres i én session.
>
> **Slik brukes den:** Start terminal i `~/Developer/akgolf-hq`, kjør `claude`, lim inn øktens
> prompt-blokk. Ferdig økt = `/lagre-sesjon` + `/clear`. Én økt om gangen, i rekkefølge.

## Regler som gjelder ALLE øktene (bakt inn i promptene)

1. Egen gren per økt (`feature/baneguide-okt<N>-<navn>`), aldri rett i main.
2. `tsc --noEmit` + `eslint` + `npm test` per steg; full `npm run verify` før push (bygget tar tid —
   kjør det én gang på slutten, jf. memory-notatet «Full bygg kun per PR»).
3. Ingen nye dependencies i Fase 1. Ingen endringer i SG-motoren (`src/lib/domain/sg.ts`).
4. PR opprettes og Anders spør om main — aldri merge rødt.
5. Les FØR koding: produktdokumentet (relevant §), `.claude/rules/gotchas.md`, og skillen
   `playerhq-arkitektur`.
6. Eksisterende gameplan-skjermer og tekstbasert runde-logging skal fungere uendret (regresjonssjekk
   i hver økt som rører delt kode).

## Avhengighetskart

```
Økt 1 (avstander + GPS-hook)
  └→ Økt 2 (banedata-pakke + offline-cache)
       └→ Økt 3 (CourseMap: GPS-prikk, rotasjon, slagmarkør)
            └→ ★ FELT-TEST (Anders, go/no-go — ikke en kodeøkt)
                 └→ Økt 4 (kart-føring i RundeLoggKlient)
                      ├→ Økt 5 (offline slag-kø + synk)
                      ├→ Økt 6 (gameplan-overlay + kolle/planB — DB-endring)
                      └→ Økt 7 (skjematisk offline-fallback + sluttverifisering)
```

---

## Økt 1 — Geometri og GPS-hook (ren logikk, null risiko)

**Leverer:** `src/lib/baneguide/avstander.ts` + tester, `src/lib/baneguide/use-gps.ts`,
`src/components/portal/runde-logg/gps-status-banner.tsx`. (Produktdok §9.1, steg 1.1–1.2.)

**Ferdig når:** enhetstester med kjente koordinater → kjente avstander er grønne; hooken har
accuracy-terskler (≤15 / 15–30 / >30 m) og throttling (maks 1 oppdatering per 2 s); PR er åpen.

**Kopier-lim for å starte økten:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§7.4, §9.1) og .claude/rules/gotchas.md.
Oppgave: Baneguide Økt 1 av 7 — geometri og GPS-hook. Lag gren feature/baneguide-okt1-avstander.
Bygg: (1) src/lib/baneguide/avstander.ts — ren funksjon posisjon × CourseHole/geojson →
{front, midt, bak, tilSikte}-avstander i meter; gjenbruk haversine/bearing fra
src/lib/gameplan/dispersion.ts, ingen nye geo-primitiver. Enhetstester i node:test-mønsteret
(som src/lib/runde-logg/*.test.ts) med kjente koordinater fra en ekte bane i DB-geometrien.
(2) src/lib/baneguide/use-gps.ts — useGpsPosisjon() rundt navigator.geolocation.watchPosition,
enableHighAccuracy, accuracy-terskler 15/30 m, throttle 2 s, stopp ved unmount/skjult fane.
(3) gps-status-banner.tsx — vises kun ved accuracy > 15 m eller avslått tillatelse, v2-tokens.
Ingen nye dependencies. Ikke rør sg.ts eller eksisterende skjermer. tsc/lint/test per steg,
npm run verify til slutt, commit, push, PR. Ikke merge til main uten mitt ja.
```

---

## Økt 2 — Banedata-pakke og offline-cache

**Leverer:** `hentBaneguidePakke(baneId)` server action + zod-schema
(`src/lib/baneguide/actions.ts` + `schema.ts`), `src/lib/baneguide/bane-cache.ts` (IndexedDB).
(Produktdok §7.5 lag 1, §9.2, steg 1.3.)

**Ferdig når:** ett kall gir geojson + hull + spillerens gameplan; data kan skrives/leses fra
IndexedDB; manuell test: forhåndslast → flymodus → hull-data tilgjengelig.

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§7.5, §9.2) og .claude/rules/gotchas.md.
Oppgave: Baneguide Økt 2 av 7 — banedata-pakke og offline-cache. Gren
feature/baneguide-okt2-banecache. Bygg: (1) src/lib/baneguide/actions.ts med
hentBaneguidePakke(baneId): requirePortalUser() + returner Bane.geojson, CourseHole[] og
spillerens GameplanHull/GameplanSone i ett kall (mønster: src/lib/gameplan/actions.ts og
queries.ts). (2) src/lib/baneguide/schema.ts — zod for payload (lat ∈ [-90,90], lng ∈ [-180,180]).
(3) src/lib/baneguide/bane-cache.ts — IndexedDB-lagring/lesing av pakken, mønster fra
src/lib/offline-queue/recording-chunk-queue.ts (rå IndexedDB, ingen idb-pakke). Enhetstest det
som kan testes uten nettleser. Ingen nye dependencies, ingen DB-endringer. tsc/lint/test per steg,
npm run verify til slutt, commit, push, PR. Ikke merge uten mitt ja.
```

---

## Økt 3 — CourseMap-utvidelser (GPS-prikk, rotasjon, slagmarkør)

**Leverer:** utvidet `src/components/gameplan/course-map.tsx` bak nye, valgfrie props:
`gpsPosisjon` (prikk + nøyaktighetsring), `rotasjon` (bearing tee→green opp),
`onSlagMarkert` + flyttbar `SlagMarkoer`. (Produktdok §6.3, steg 1.4.)

**Ferdig når:** nye props er inn; ALLE eksisterende gameplan-skjermer ser identiske ut uten
props (regresjonssjekk i preview); farger kun via `map-colors.ts`.

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§6.2 S1, §6.3) og .claude/rules/gotchas.md.
Oppgave: Baneguide Økt 3 av 7 — CourseMap-utvidelser. Gren feature/baneguide-okt3-coursemap.
Utvid src/components/gameplan/course-map.tsx med valgfrie props: gpsPosisjon {lat,lng,accuracy}
(blå prikk + nøyaktighetsring, oppdatert via setData — ikke re-render), rotasjon (bearing slik at
tee→green peker opp), onSlagMarkert + flyttbar markør (trykk = sett, dra = juster). Nye kartfarger
KUN i src/lib/gameplan/map-colors.ts (dokumentert hex-unntak). Uten de nye propene skal
komponenten oppføre seg eksakt som før — verifiser /portal/gameplan/[baneId] og hull-detalj
visuelt i preview før og etter. Ingen nye dependencies. tsc/lint/test per steg, npm run verify
til slutt, commit, push, PR. Ikke merge uten mitt ja.
```

---

## ★ FELT-TEST — go/no-go (Anders, ikke en kodeøkt)

Etter Økt 3: Onsøy (har geometri), første ledige formiddag. Ta med laser/kjente merker.
Testside: en midlertidig intern rute er IKKE nødvendig — bruk hull-detaljen i gameplan med
GPS-prop aktivert via en enkel dev-toggle som Økt 3 legger inn bak `(internal)`-flagg om ønskelig.

Sjekkliste (fra produktdok §14 krit. 2):
- [ ] 10 stikkprøver: avstand til green midt vs. laser — avvik < 5 m?
- [ ] GPS-fix innen 30 sekunder utendørs?
- [ ] Accuracy-banneret oppfører seg riktig (og forsvinner når GPS er god)?

**Grønt → fortsett til Økt 4. Rødt → stopp; juster §7.4-tersklene eller revurder GPS-forslag
som default (beslutning B2/B3) før mer bygges.**

---

## Økt 4 — Kart-føring i RundeLoggKlient (den store)

**Leverer:** `kart-foring.tsx`, `avstands-kort.tsx`, `kolle-velger.tsx` i
`src/components/portal/runde-logg/`, montert som `kart`-visning ved siden av `foring` i
`RundeLoggKlient`, med toggle. (Produktdok §6.2 S1, steg 1.5.)

**Ferdig når:** en full runde kan logges i kart-modus og gir **identisk `LoggetRunde`-struktur og
SG-resultat** som tekst-modus (automatisert sammenligningstest); tekst-flyten er uendret;
«Logg slag» bruker `--handling` og er skjermens eneste primærhandling.

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§4 flyt B, §6.2 S1, §9.3),
.claude/rules/gotchas.md og skillen playerhq-arkitektur. Oppgave: Baneguide Økt 4 av 7 —
kart-føring i runde-loggingen. Gren feature/baneguide-okt4-kartforing. Bygg i
src/components/portal/runde-logg/: kart-foring.tsx (S1-anatomien: kart øverst med CourseMap +
GPS fra useGpsPosisjon + avstander fra src/lib/baneguide/avstander.ts; avstandskort; kølle-velger
som husker forrige per ShotType; «Logg slag» som primærhandling med --handling-token —
GPS-posisjon forhåndsutfylles som slagpunkt, dra for å justere, putt logges som i dag uten kart),
avstands-kort.tsx og kolle-velger.tsx. Monter som "kart"-visning i RundeLoggKlient ved siden av
"foring", med toggle i tommel-sonen; stegmaskinen (oppsett → foring → oppsummering) og
localStorage-kladden endres IKKE — kart-modusen skriver til samme kladd-state. Skriv en test som
verifiserer at kart-logget og tekst-logget runde gir identisk LoggetRunde og SG (bruk
src/lib/runde-logg/-pipelinen direkte). Avstandskortet skjules ved accuracy > 30 m — aldri vis
tall vi ikke tror på. Regresjonssjekk: tekst-flyten i /portal/runde/live fungerer som før.
Ingen nye dependencies. tsc/lint/test per steg, npm run verify til slutt, commit, push, PR.
Ikke merge uten mitt ja.
```

---

## Økt 5 — Offline slag-kø og synk

**Leverer:** `src/lib/offline-queue/shot-sync-queue.ts` + `synkSlag(roundId, slag[])`-action med
idempotent batch-upsert på `(roundId, holeNumber, shotNumber)`. (Produktdok §7.5 lag 2, steg 1.6.)

**Ferdig når:** flymodus midt i runde → slag legges i kø → synk ved `online`-event; re-send av
samme kø endrer ingenting (idempotens-test); kø-status synlig diskret i UI (antall ventende).

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§7.5, §8.3, §9.2) og .claude/rules/gotchas.md.
Oppgave: Baneguide Økt 5 av 7 — offline slag-kø. Gren feature/baneguide-okt5-slagko. Bygg:
(1) src/lib/offline-queue/shot-sync-queue.ts — kopier mønsteret fra recording-chunk-queue.ts
(objectStore med nøkkel, tomKo(uploadFn), online-event-trigger). (2) synkSlag(roundId, slag[]) i
src/lib/baneguide/actions.ts — zod-validert, requirePortalUser, batch-upsert på Shot-unikheten
(roundId, holeNumber, shotNumber) så re-send er trygt; skriv idempotens-test. (3) Koble køen inn
i kart-foring.tsx: logget slag → kø → UI bekrefter umiddelbart fra køen; diskret indikator for
antall ventende slag. Kladden i localStorage er fortsatt sannhet for runde-state — køen er kun
transport. Ingen nye dependencies, ingen DB-endringer. tsc/lint/test per steg, npm run verify
til slutt, commit, push, PR. Ikke merge uten mitt ja.
```

---

## Økt 6 — Gameplan-overlay + kolle/planB (eneste DB-endring i Fase 1)

**Leverer:** `GameplanHull` får kolonnene `kolle String?` og `planB String?`; overlay av
sikte/soner/siktelinje i kart-føringen; planlegg-modusen får kølle- og plan B-felt.
(Produktdok §8.2, steg 1.7 + del av F2.2.)

**OBS:** DB-endring — additive kolonner via kirurgisk `db execute` (migrate dev/db push er
blokkert, se gotchas §Schema-endringer). **Denne kjøreplanen er forhåndsgodkjenningen** — men
økten skal vise SQL-en før den kjøres, og den rører KUN `gameplan_hull`-tabellen.

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§6.2 S1+S2, §8.2) og .claude/rules/gotchas.md
(§Schema-endringer — VIKTIG). Oppgave: Baneguide Økt 6 av 7 — gameplan-overlay + kolle/planB.
Gren feature/baneguide-okt6-overlay. (1) Legg kolle String? og planB String? på GameplanHull i
schema.prisma; additive ALTER TABLE via prisma db execute mot DIRECT_URL (vis meg SQL-en i svaret
før du kjører den — den skal kun røre gameplan_hull); npx prisma generate; RESTART dev-server
etterpå (gotcha). (2) Utvid lagreSikte/nytt oppdaterGameplanPlan i src/lib/gameplan/actions.ts +
kølle-felt og plan B-linje i GameplanPlanlegger (planlegg-modusen). (3) Overlay i kart-foring.tsx:
siktemarkør, soner og siktelinje fra banedata-pakken (Økt 2) tegnes på live-kartet; uten gameplan
vises kartet rent uten mas. tsc/lint/test per steg, npm run verify til slutt, commit, push, PR.
Ikke merge uten mitt ja.
```

---

## Økt 7 — Offline-fallback og sluttverifisering

**Leverer:** skjematisk SVG-hullvisning fra geojson når kartfliser mangler (steg 1.8);
skjermene målt mot ferdig-definisjonen i `docs/port/plan-designport-alle-skjermer.md` (steg 1.9); full
regresjonsrunde. (Produktdok §7.5 lag 3, §14 teknisk.)

**Ferdig når:** flymodus uten cachede fliser viser hull-formen (fairway/green/bunkere) i stedet
for grått kart; ferdig-definisjonen per skjerm er oppfylt og skjermbildene godkjent av Anders;
`npm run verify && npm test` grønn; alle suksesskriterier §14 punkt 1–8 som kan testes uten
felt er verifisert og listet i PR-beskrivelsen.

**Kopier-lim:**

```
Les docs/baneguide-produktdokument-2026-08-02.md (§7.5 punkt 3, §14) og
docs/port/plan-designport-alle-skjermer.md (§Ferdig-definisjon per skjerm).
Oppgave: Baneguide Økt 7 av 7 — offline-fallback og sluttverifisering. Gren
feature/baneguide-okt7-fallback. (1) Skjematisk hull-fallback: SVG tegnet fra Bane.geojson
(fairway/green/bunkere som former, farger fra map-colors-tankegangen men i CSS/SVG — her KAN
v2-tokens brukes siden det ikke er Mapbox-canvas) som vises i kart-foring.tsx når Mapbox ikke
laster. (2) Mål kart-føringen og de endrede Gameplan-skjermene mot ferdig-definisjonen i
docs/port/plan-designport-alle-skjermer.md — skjermbilder (mobil 390px + desktop, lys og mørk)
til Anders før noe merges. (3) Full
regresjon: npm run verify && npm test, manuell sjekk av /portal/gameplan-flatene og tekst-føring.
List §14-suksesskriteriene punkt 1–8 i PR-beskrivelsen med status. Commit, push, PR.
Ikke merge uten mitt ja.
```

---

## Etter Økt 7 — pilot

1. Anders + 2–3 spillere logger runder i kart-modus (suksesskriterier §14 punkt 1, 4, 5, 9).
2. Læringen avgjør rekkefølgen i Fase 2 (produktdok §11) — «Min bag»-dispersion er default neste.
3. GDPR-notat: utkast til oppdatert behandlingsoversikt skrives UTENFOR repoet (docs/gdpr/ er
   agent-sperret) og leveres Anders før pilot utvides ut over pilotgruppen.

## Estimert totalforbruk

7 kodeøkter à ≤2 t + én felt-test. Øktene 1–3 og 5 er små (trolig ~1 t). Økt 4 er den store —
hvis den sprenger 2-timersgrensen: `/lagre-sesjon` + `/clear` og fortsett med
`/fortsett-sesjon` i ny session; grenen og kladden bærer all state.
