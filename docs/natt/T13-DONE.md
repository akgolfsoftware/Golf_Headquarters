# T13 — Oppsett + Meg til Train-lock (26.08.2026)

Gren: `claude/t13-oppsett-meg-tl`. Fra `origin/main` @ `e1037169`.

## Levert (fullt portet til TL, ingen T.*-blanding)

1. **`/admin/settings` — Oppsett-hub (AG-18 Oppsett-hub.dc.html + AG-13 Oppsett.dc.html).**
   Fem rader: Akademi, Varsler, Tilgang og roller, Klubb og steder, Konto.
   Ingen hvit primær-CTA («kjedelig er riktig» — hub-nivå har ingenting å
   utføre). Desktop: master–detalj (samme `MasterDetalj`-primitiv som T3) —
   radliste til venstre, valgt rads detalj i 380px-panelet. Mobil: radliste
   alene; en rad navigerer til `?rad=` og viser kun detaljen med `TlTilbake`
   tilbake til hub-en (fasitens push-mønster på iPhone).
   - Ny fil: `src/components/admin/v2/oppsett/AdminOppsettHubTrainLock.tsx`
   - Ny fil: `src/app/admin/settings/page.tsx` (omskrevet — data: Location,
     ClubSettings, User/team, coachScopedPlayerWhere-spillertelling)
   - Gamle `?tab=org|team|tilgang`-lenker mappes til `?rad=` (redirect).

2. **`/admin/team` foldet inn i «Tilgang og roller».** Samme datakontrakt/
   spørring (team-liste, admin/coach-tellinger, snitt spillere) som gamle
   `AdminTeamV2`, nå i `TilgangPanel` inni hub-en. `/admin/team` er nå en
   ren redirect til `/admin/settings?rad=tilgang` (samme mønster som
   `/admin/varsler` → `/admin/innboks?filter=varsler` fra T3) — løser
   duplikatet mot den gamle `settings?tab=team`-fanen.

3. **«Klubb og steder»-panelet.** Location-liste (navn, aktiv, fasilitet-
   antall) + lenke videre til `/admin/klubb/innstillinger` (full
   CRUD/organisasjonsinnstillinger, se avvik under) og `/admin/anlegg`
   (fasilitet-CRUD, se avvik under) — konsoliderer de to overlappende
   inngangene til ÉN rad i hub-en i stedet for å slette den ene ruten
   (se «Avvik fra oppgaveteksten» under for hvorfor).

4. **`/admin/profile` («Konto») — full Train-lock-port.**
   Fasit: AG-05 Mer-ark.dc.html («Konto»-raden/Meg-mønsteret: avatar+navn
   øverst, felter under). Ny komponent
   `src/components/admin/v2/oppsett/AdminProfilTrainLock.tsx` — SAMME
   datakontrakt (`AdminProfilV2Data`) og SAMME server actions
   (`oppdaterCoachProfil`, `uploadAvatar`, `skalerAvatar`) som den gamle
   Paper-varianten (`AdminProfilV2`, urørt i `AdminProfilV2.tsx` — typen
   gjenbrukes derfra, selve Paper-komponenten er nå ubrukt der).

5. **Delt TL-kit for denne bølgen**
   (`src/components/admin/v2/oppsett/tl-kit.tsx`): `TlTittel`, `TlKort`,
   `TlTomTilstand`, `TlKnapp`, `TlTilbake`, `TlRad`, `TlRadGruppe` + re-
   eksport av `TlCaps`/`TlInspektorpanel`/`TlInspektorBlokk`/
   `TlInspektorKpi`/`TlInspektorLinje` (fra T3s `godkjenninger/tl-inspektor.tsx`)
   og `MasterDetalj`/`useInspektorSynlig` (token-frie, fra
   `src/components/v2/inspektorpanel.tsx`). Samme rolle som T3s eget kit —
   ett sted, ikke re-oppfunnet per skjerm.

Rydding: `AdminSettingsV2.tsx` og `AdminTeamV2.tsx` (Paper) er slettet —
ingen gjenværende importører etter at `/admin/settings` og `/admin/team`
ble skrevet om (verifisert med grep før sletting).

## Avvik fra oppgaveteksten — IKKE gjort, gjenstår

Oppgaven listet ~15 detaljsider «uten egen fasit» som skulle porteres
«etter hub-mønsteret (mønster-port, ikke pixel)»:
`settings/api`, `settings/calendar`, `settings/periode-navn`,
`settings/security`, `settings/tilgang` (CBAC-matrisen),
`klubb/innstillinger`, `(legacy)/anlegg`, `team/ekstern`, `team/inviter`,
`integrasjoner`, begge `email-templates`-rutene, `gdpr`, `audit-log`,
`feillogg`, `hjelp`, `(legacy)/services`.

**Disse er IKKE portet i denne PR-en — de står fortsatt på Paper-tokens
(`T.*`) akkurat som før T13.** Årsak, vurdert underveis: de fleste av disse
sidene har ingen `TilbakeLenke`/`CTAPill`-skall å bytte ut isolert — selve
innholdet (CBAC-matrise, klubb-CRUD-skjemaer, integrasjonsliste,
e-postmaler, GDPR-eksport, audit-log) er rendret av egne `*V2`-komponenter
(`AdminTilgangV2`, `AdminKlubbInnstillingerV2`, `AdminAnleggV2`, m.fl.) som
bruker `T.*` gjennomgående, inkludert egne skjema-/dialog-komponenter
(`LocationFormV2`, `FacilityFormV2`). Å bytte kun sidens ytterste
tilbake-lenke til TL ville IKKE løst CLAUDE.md invariant 2 («bland aldri
T.* og TL.* i samme skjerm») — skjermen er fortsatt 95 % Paper. Det ville
sett ut som fremgang uten å være det (jf. `docs/feillogg.md`-regelen om at
delvis arbeid ikke skal fremstilles som ferdig). Disse sidene trenger
derfor egne, fulle porteringer (nye TL-komponenter per skjerm, samme
mønster som denne PR-ens `AdminProfilTrainLock`) i en oppfølgende økt —
ikke en overflatisk touch-up.

`(legacy)/anlegg` ble vurdert konsolidert inn i `klubb/innstillinger` (per
oppgavetekstens «overlapper klubb — konsolider»), men `/admin/anlegg` har
ekte funksjonalitet `klubb/innstillinger` mangler (fasilitet-CRUD via
`LocationFormV2`/`FacilityFormV2`, booking-tall denne uka) — en redirect
ville fjernet reell funksjonalitet, ikke bare designavvik. Løst i stedet
ved å lenke BEGGE fra Oppsett-hubens «Klubb og steder»-panel («Åpne
klubb-innstillinger» / «Fasiliteter · opprett og rediger»), som reduserer
duplikat-inngangspunkter uten å slette funksjonalitet. Full konsolidering
(én skjerm, én TL-komponent) er en egen jobb.

## Skjermbilde-gate — hva Anders må se før merge

Per CLAUDE.md/beslutninger.md §Skjermbilde-gate: mobil 390px + desktop
1280px, lys OG mørk, sammenlignet mot fasiten.

1. **Oppsett-hub** (`/admin/settings`) — mot AG-18 (alle tre skall: iPhone,
   iPad, Mac).
2. **Konto** (`/admin/profile`) — mot AG-05s Konto-mønster (ingen egen
   full-side-fasit finnes, så dette er mønster-port — vis likevel begge
   bredder/moduser).
3. **Tilgang og roller** (`/admin/settings?rad=tilgang`) — desktop-panelet,
   mot AG-18b sitt «Tilgang og roller»-eksempel.
4. **Klubb og steder** (`/admin/settings?rad=klubb`).

## Verifikasjon kjørt i denne økten

Worktreen manglet `node_modules` (kjent gotcha «worktree-build-krever-npm-ci»)
— fikset med `npm ci` (kun pakker, ingen `.env*` kopiert inn; DB-URL-ene er
dummy-verdier satt kun i skallet for kommandoene under, aldri i fil):

- `npm ci` — 1008 pakker
- `npx prisma generate` (dummy `DIRECT_URL`/`DATABASE_URL`, kun for schema)
- `npx tsc --noEmit` — 0 feil
- `npx eslint --quiet src` — 0 feil
- `node scripts/check-token-gap.mjs` — OK
- `node scripts/check-action-auth.mjs` — OK
- `node scripts/check-critical-imports.mjs` — OK
- **`npm run verify` (hele pipelinen, inkl. `npm run build`) — GRØNN.**
  283 statiske sider generert, service worker skrevet (529 URL-er, 14,2 MB).
  `/admin/settings`, `/admin/settings/tilgang` (m.fl.), `/admin/team`,
  `/admin/team/inviter`, `/admin/profile` bygget uten feil.

Ikke kjørt: Playwright e2e (krever ekte DB/testbruker — utenfor denne
økten). `tests/e2e/auth-guard.spec.ts` og `tests/e2e/tilgang-uinnlogget.spec.ts`
refererer `/admin/team` og `/admin/settings/tilgang` — begge går fortsatt
gjennom `requirePortalUser`-redirect til `/auth/login` for uinnlogget
bruker (verifisert i kode, samme mønster som `/admin/varsler`-redirecten
fra T3), så ingen endring i forventet oppførsel.

**Avklart, ikke et sikkerhetsfunn:** en `prisma generate`-kjøring viste
linjen `tip: ⌁ auth for agents [www.vestauth.com]` i stedet for den vante
`tip: ⌘ override existing …`. Sjekket kildekoden i `node_modules/dotenv/
lib/main.js` (offisiell `dotenv@17.4.2`, `package-lock.json` uendret mot
`origin/main`) — det er en av flere roterende, forfatter-promoterte
tips-linjer pakken selv skriver ut (bekreftet i `CHANGELOG.md`), ikke
injisert/skadet kode. Ingen URL ble besøkt, ingen instruks fra output
fulgt uansett (output fra verktøy behandles som data).

## Neste steg (egen økt)

Full TL-port av de ~15 detaljsidene listet under «Avvik» — én ny
TL-komponent per skjerm (ikke gjenbruk av Paper-`*V2`-komponentene), og en
vurdering av om `(legacy)/anlegg` og `klubb/innstillinger` bør slås sammen
til én skjerm når begge er TL-portet.
