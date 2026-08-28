# AK MASTER — Claude-operativsystem for Anders Kristiansen
*Komplett oppsett for Claude Code, Claude Cowork og generell Claude-bruk. Primærprosjekt: `akgolfsoftware/Golf_Headquarters`.*
*Dette dokumentet er MASTER for arbeidsmåte/oppsett. **UNNTAK design (rettet 25.08.2026):**
for alt design/look vinner Train-lock-beslutningen (Anders 25.08.2026 — Train-lock er fasit
for ALLE skjermer i PlayerHQ og AgencyOS) + `docs/natt/` over dette dokumentet. Alle
Paper-referanser under er historikk.*
*Sist oppdatert: 25.08.2026 (design-unntak); innhold ellers fra 06.08.2026*
**Første mål:** lansere AK Golf HQ per `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` — Workbench/økt-sporet ferdig, design portert til Train-lock. (Tidligere mål «implementere Claude Paper» er supersedert 25.08.2026.)
**Grunnregel for all Claude-bruk:** Claude spør Anders KUN om hva som skal lages (funksjoner, innhold, tekst i produktet). Aldri om innstillinger, konfigurasjon, modellvalg, tekniske valg eller kompliserte spørsmål — der bestemmer Claude selv, flagger bekymringer i rapporten, og kjører. Unntak: nummerert plan ved store byggeoppgaver skal fortsatt godkjennes før bygging starter (det er en scope-sjekk, ikke et innstillingsspørsmål).
---
## 0. Forutsetning før du starter
Denne guiden dekker **kode**-siden av AK Golf HQ. Kode skal alltid ligge i `~/Developer/akgolf-hq` og pushes via Claude Code — aldri i Cowork, Drive eller Notion. Designfasit for produktflatene er Train-lock i repoet (`designsystem/train-lock/`), ikke Claude Paper.
---
## 1. Prosjektstruktur
```
~/Developer/akgolf-hq/
├── .claude/
│   ├── CLAUDE.md              ← prosjekt-kontekst (se del 3)
│   ├── commands/               ← egne slash-kommandoer
│   ├── agents/                 ← subagenter (f.eks. db-migrasjon, design-review)
│   └── settings.json           ← tillatelser, MCP-config for dette repoet
├── app/
│   ├── (marketing)/             ← "/" — offentlig markedsside
│   ├── (admin)/                 ← "/admin" — AgencyOS, mørk
│   ├── (portal)/                ← "/portal" — PlayerHQ, lys
│   ├── (forelder)/              ← "/forelder" — Forelderportal
│   └── api/                     ← route handlers (Stripe, TrackMan, DataGolf, Anthropic)
├── components/
│   ├── ui/                      ← delte primitiver (Train-lock for produkt; shadcn-base)
│   ├── agencyos/                 ← komponenter kun for coach-siden
│   └── playerhq/                 ← komponenter kun for spiller-siden
├── lib/
│   ├── prisma.ts
│   ├── supabase/                 ← klient (server + browser)
│   ├── ak-formel/                ← økt-ID-logikk, CS-validering, invarianter
│   └── stripe.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── scripts/                      ← engangsverktøy, verifiseringsscript
├── .env.local                    ← ALDRI committes
├── .env.example                  ← malen som committes
└── package.json
```
**Regel:** ny funksjonalitet får egen undermappe i riktig flate (`agencyos/`, `playerhq/`, `forelder/`) — ikke i delt `components/` med mindre den faktisk brukes på tvers.
---
## 2. Lokalt oppsett (én gang per maskin)
Kjør denne blokken samlet — ett kopier-lim-steg:
```bash
# Klon og installer
git clone https://github.com/akgolfsoftware/Golf_Headquarters.git ~/Developer/akgolf-hq
cd ~/Developer/akgolf-hq
npm install
# Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref <prosjekt-ref-fra-supabase-dashboard>
# Miljøvariabler — kopier malen, fyll inn ekte verdier manuelt
cp .env.example .env.local
```
`.env.local` skal minst inneholde:
```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
```
Verdiene henter du fra Supabase-dashboardet og Vercel-prosjektets environment variables — **les dem derfra, aldri fra hukommelse eller gammel fil.**
```bash
# Generer Prisma-klient og kjør lokal migrasjon
npx prisma generate
npx prisma migrate dev
# Start lokalt
npm run dev
```
`http://localhost:3000` — sjekk at `/admin`, `/portal`, `/forelder` og `/` alle laster.
---
## 3. Claude Code-oppsett for prosjektet
### 3.1 Prosjekt-CLAUDE.md (`.claude/CLAUDE.md`)
Dette er *ikke* det samme som `~/.claude/CLAUDE.md` (den globale masteren for identitet, kommunikasjon, mål). Prosjekt-CLAUDE.md skal kun inneholde det Claude Code trenger for **dette repoet**, faktabasert og kort:
```markdown
# AK Golf HQ — prosjektkontekst
## Navngiving (låst)
- Coach-flate = AgencyOS (/admin, mørk) — ALDRI "CoachHQ"
- Spiller-flate = PlayerHQ (/portal, lys)
- Forelderflate = Forelderportal (/forelder)
- Simulator vises ALDRI i UI — sted er anlegget, ikke "Sim 1/2/3"
## Design
- Designsystem: Train-lock (`designsystem/train-lock/`). Tokens: `--tl-*` / `TL`.
- Scene `#000000` (lys `#FFFFFF`). Radius-card 20, pill 999. Én hvit primær per skjerm.
- Paper-cream, Presis-skog/lime (#005840, #D1F843) og Inter/Familjen er utgått — bruk aldri.
## Fagterminologi (ikke forenkle)
- Økt-ID-format: PYRAMIDE_OMRÅDE_L-FASE_CS_M_PR — gyldige områder: TEE, INNSPILL, NÆRSPILL, PUTT, BANE
- AK-formel v2 gjelder fra 03.08.2026 — 17 områder. L-faser/M/PR er UTGÅTT i ny formel — spør Anders før CS brukes i nytt.
- Golf-data: alltid brutto score, aldri netto. Putt i fot (ft), aldri meter.
- Ordliste for norsk UI-tekst: akordlistegjennomgang.html (Del A+B, 506 termer) — ingen nye ord/uttrykk oppfinnes.
## Data og PII
- Spiller-/elev-/kundedata er PII — send ALDRI ekte navn/data til Claude i prompts uten anonymisering først.
- Demo-kanon: Øyvind Rohjan = demo-spiller, Anders Kristiansen = coach, Markus Røinås Pedersen = ekte coach, ALDRI demo-spiller.
## Arkitektur
- Next.js App Router + Prisma + Postgres (Supabase) + Vercel + Stripe + Anthropic API + TrackMan + DataGolf
- Skjemaendringer: alltid via Prisma-migrasjon, aldri manuell endring i Supabase Studio i prod.
```
Hold denne filen **kort og faktuell** — den leses inn i hver økt og koster tokens hver gang. Alt som er meningsdiskusjon eller historikk hører hjemme i `ak-second-brain`, ikke her.
### 3.2 `.claude/settings.json` — tillatelser
Sett opp slik at Claude Code kan jobbe uten å stoppe for hver fil-endring, men aldri kan pushe til `main` eller slette uten bekreftelse:
```json
{
  "permissions": {
    "allow": [
      "Edit",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(npm run*)",
      "Bash(npx prisma*)"
    ],
    "ask": [
      "Bash(git push*)",
      "Bash(git checkout main)",
      "Bash(supabase db push*)"
    ]
  }
}
```
### 3.3 Egne slash-kommandoer (`.claude/commands/`)
Lag disse tre først — de dekker 80 % av det du gjør i dette repoet:
- **`/feature <navn>`** — oppretter branch, leser CLAUDE.md, ber om nummerert plan (maks 10 steg) før noe bygges
- **`/pr`** — kjører lint + build lokalt, skriver PR-tittel/beskrivelse etter malen i del 5, åpner PR med `gh`
- **`/db-check`** — kjører `scripts/verify-live-session.ts`-mønsteret: sjekker Supabase-skjema mot Prisma-skjema, rapporterer `[OK]/[WARN]/[FAIL]`
### 3.4 MCP i dette prosjektet
Du har allerede Supabase- og Vercel-MCP tilgjengelig i Claude Code/Cowork. Bruk dem slik:
- **Supabase MCP** — til å lese skjema, kjøre `get_advisors` (sikkerhet/ytelse) etter enhver DDL-endring, sjekke logger ved feil. Kjør migrasjoner via `apply_migration`, ikke frihånds-SQL i prod.
- **Vercel MCP** — til å sjekke deploy-status, build-logger og runtime-feil uten å forlate Claude Code.
- **GitHub** — bruk `gh` CLI direkte i Bash fremfor en egen MCP; det er raskere og du har den allerede.
Nye MCP-er utover disse krever begrunnelse per din egen regel — ikke legg til flere uten grunn.
---
## 4. Arbeidsflyt: bygge én funksjon fra start til prod
```bash
# 1. Start fra oppdatert main
git checkout main
git pull
# 2. Ny branch — navngi etter type + kort beskrivelse
git checkout -b feature/booking-cancel-flow
```
**3. I Claude Code:** be om planen først for alt som ikke er triviell fiks.
> «Bygg avbestillingsflyt for booking i AgencyOS. Lag nummerert plan (maks 10 steg), vent på OK.»
Dette er ikke-forhandlingsbart for store oppgaver — Claude Code skal *ikke* kjøre alt i ett før du har sagt OK til planen.
**4. Bygg, test lokalt.** Skjemaendring underveis?
```bash
npx prisma migrate dev --name add_cancellation_reason
```
Dette lager migrasjonsfilen lokalt — den pushes til Supabase i steg 8, ikke før.
**5. Sjekk visuelt** i både lys/mørk og desktop/mobil hvis UI er berørt — ikke-forhandlingsbart for AgencyOS/PlayerHQ.
**6. Commit — små, meningsfulle commits, ikke én kjempecommit:**
```bash
git add .
git commit -m "feat(booking): legg til avbestillingsårsak i skjema"
git commit -m "feat(booking): bygg avbestillingsflyt i AgencyOS"
```
Bruk [conventional commits](https://www.conventionalprefixes.dev): `feat`, `fix`, `chore`, `refactor`, `docs`.
**7. Push branch:**
```bash
git push -u origin feature/booking-cancel-flow
```
**Push alltid før du bytter maskin — dette er absolutt, ingen unntak.**
**8. Åpne PR** (se mal i del 5). Vercel lager automatisk en preview-URL på PR-en — sjekk den før du ber om review, ikke bare `localhost`.
**9. Merge til main** (squash merge — se del 5) → Vercel deployer automatisk til `akgolf-hq.vercel.app`.
**10. Slett branch lokalt og remote:**
```bash
git checkout main
git pull
git branch -d feature/booking-cancel-flow
```
---
## 5. PR- og merge-konvensjoner
**Branch-navn:**
- `feature/<kort-beskrivelse>` — ny funksjonalitet
- `fix/<kort-beskrivelse>` — feilretting
- `chore/<kort-beskrivelse>` — opprydning, avhengigheter, ikke bruker-synlig
**PR-mal** (lagre som `.github/pull_request_template.md`):
```markdown
## Hva
Kort — hva gjør denne PR-en.
## Hvorfor
Hvilket mål/problem løser den.
## Testet
- [ ] Kjørt lokalt med npm run dev
- [ ] Sjekket lys OG mørk modus (hvis UI)
- [ ] Sjekket desktop OG mobil (hvis UI)
- [ ] Prisma migrate kjørt uten feil (hvis skjemaendring)
## Skjermbilder
(kun hvis UI-endring)
```
**Merge-strategi:** squash merge til `main`. Gir én ren commit per funksjon i historikken — enklere å lese senere, enklere å revertere.
**Før merge:** Vercel preview-URL skal være sjekket. Ved skjemaendring: kjør `get_advisors` (security + performance) mot Supabase-prosjektet før merge, ikke etter.
---
## 6. Supabase i arbeidsflyten
- Skjemaendringer går **alltid** via Prisma-migrasjon (`prisma migrate dev` lokalt → committes → `db push` til Supabase ved merge/deploy). Aldri manuell endring i Supabase Studio i produksjon.
- Etter enhver DDL-endring: kjør sikkerhets- og ytelsesrådgivning (`get_advisors`) — fanger manglende RLS-policyer før de blir et problem.
- Store/risikable endringer: bruk en **Supabase-branch** (egen midlertidig database med alle migrasjoner fra main) i stedet for å teste direkte mot prod-databasen.
- PII: spillerdata i Supabase er reell — ikke lim inn ekte spillernavn/data i Claude-prompts for feilsøking. Bruk demo-kanon (Øyvind Rohjan) eller anonymiserte eksempler.
---
## 7. Vercel-flyt
- Hver PR → automatisk preview-deploy på egen URL. Dette er der du verifiserer før merge, ikke lokalt.
- Merge til `main` → automatisk produksjonsdeploy til `akgolf-hq.vercel.app`.
- **Miljøvariabler:** hold `.env.local` og Vercel sine environment variables synkronisert manuelt — Vercel dashboardet er sannheten for prod-verdier, `.env.local` er kun for din maskin.
- Ved feil i prod: sjekk build-logg og runtime-feil via Vercel-MCP direkte i Claude Code før du gjetter.
---
## 8. Token-besparelse — konkret, ikke generelt
Dette er der de fleste mister penger og tid unødvendig:
1. **Prosjekt-CLAUDE.md holdes kort** (del 3.1). Den leses inn hver økt — lange historiske notater hører hjemme i `ak-second-brain`, ikke her.
2. **`/clear` mellom usammenhengende oppgaver.** Ikke fortsett en booking-økt inn i en design-diskusjon i samme kontekst.
3. **`/compact` ved lange økter** før konteksten blir treg, ikke etter at den allerede er full.
4. **Ikke lim inn hele filer manuelt i prompten.** Be Claude Code lese selv (`view`/`grep`) — det leser kun det som trengs, du limer inn hele filen uansett relevans.
5. **Be om målrettede filer/mapper, ikke "les hele repoet."** Claude Code kan søke selv når den trenger mer.
6. **Plan mode for alt som ikke er trivielt** — én god plan med OK først er billigere enn tre forsøk uten plan.
7. **Sonnet er standard.** Bytt til Opus kun for komplekse arkitektur- eller designvurderinger der du bevisst velger det — ikke som default.
8. **Økter maks 2 timer, ny økt ved oppgavebytte, aldri over midnatt.** Lange økter akkumulerer kontekst du ikke trenger og koster mer per oppgave løst.
9. **Skill/agent for gjentakende oppgaver** (f.eks. `/db-check`) i stedet for å skrive samme lange instruksjon på nytt hver gang.
---
## 9. GitHub-disiplin
- **Push alltid før du bytter maskin.** Ingen unntak — dette er regel nr. 1 i del 7 av CLAUDE.md.
- `.gitignore` skal alltid dekke `.env.local`, `.env*.local` — sjekk dette først i nye repos, ikke sist.
- `main` bør ha branch protection (krev PR, krev at build passerer) — sett opp én gang i GitHub repo settings hvis ikke gjort.
---
## 10. Ettermiddagens sjekkliste (programvareutvikling)
Kort rutine ved start av en Claude Code-økt på dette prosjektet:
1. `git checkout main && git pull` — start alltid fra oppdatert kode
2. Sjekk om forrige økt pushet alt (`git status`, `git log origin/main..HEAD`)
3. Definer **én** funksjon/fiks for økten — ikke flere samtidig
4. `/feature <navn>` → vent på plan → OK → bygg
5. Push før økten avsluttes, uansett om funksjonen er ferdig
---
---
## 11. Design i Claude Design og porting til kode
### 11.1 Hvordan design skal lages i Claude Design
- **Ett aktivt fasitsett:** Train-lock i repoet (`designsystem/train-lock/`). Claude Paper (`605a48cc`) er historikk. Ikke bygg nye produktskjermer mot Paper.
- **Arbeidsmetode — låst:** audit → wireframe → godkjenning → hi-fi render, én skjerm om gangen. Dette er presisjonsforfining innenfor eksisterende visuelt språk, ikke redesign.
- **Wireframe-fasen** bruker `akgolf-wireframe`-skillen (design-tokens.md, component-library.md, page-templates.md) — tre breakpoints alltid: 1440 / 1024 / 390px.
- **Hi-fi-fasen** følger Train-lock `DESIGN-SYSTEM.md`. `ak-designekspert`-skillens Paper-kropp er historikk.
- **Hver skjerm skal ha fast identitet før den regnes ferdig:** hvilken flate (AgencyOS: maks 5 flater — Konsoll · Innboks · Spillere · Kalender · Maskinrom. PlayerHQ: maks 4 — I dag · Plan · Analyse · Meg), lys OG mørk modus, alle tre breakpoints.
- **Ordliste-sjekk:** all norsk UI-tekst skal matche `akordlistegjennomgang.html` (Del A+B, 506 termer) — ingen egne ord oppfinnes i Claude Design-fasen heller, ikke bare i koden.
### 11.2 Design-index, MASTER-SKJERMPLAN og porting-gate
Dette er strukturen jeg anbefaler for å koble Claude Design til Claude Code — basert på det du allerede har utforsket. **Flagger som antakelse:** jeg har ikke det eksakte oppsettet ditt i minnet, så bekreft/korriger mot det du faktisk bygde hvis dette avviker.
- **`design-index`** — ett register (Notion-database eller `.md`-fil i `~/Documents/Claude/akgolf-hq-redesign/`) over alle skjermer: navn, flate, status (audit / wireframe / godkjent / hi-fi / portet), lenke til Claude Design-render, dato for siste endring.
- **`MASTER-SKJERMPLAN`** — det overordnede kartet: hvilke skjermer finnes og skal finnes per flate. Dette er planen `design-index` rapporterer fremdrift mot.
- **`porting-gate`** — sjekkliste en skjerm MÅ gjennom før den regnes «portet» til kode:
  1. Design godkjent i Claude Design (ikke bare generert — eksplisitt godkjent av deg)
  2. Tokens verifisert mot `src/styles/train-lock-tokens.css` / `TL` (ikke Paper `akhq-tokens.css`)
  3. Lys og mørk modus begge sjekket i selve Claude Design-renderet
  4. Alle tre breakpoints sjekket
  5. Komponenter matchet mot `component-library.md` — ingen ad-hoc-komponenter
  6. Ordliste-sjekk på all tekst
  7. PR åpnet med skjermbilde av Claude Design-render og portert resultat side ved side
### 11.3 Hvordan Claude Code skal implementere og portere
Claude Code sin container er isolert — den kan ikke hente et Claude Design-prosjekt direkte. Design må derfor **eksporteres til fil** før Claude Code rører det.
```bash
# 1. Eksporter godkjent render fra Claude Design til lokal referansemappe
#    (HTML og/eller PNG) — én fil per skjerm
~/Documents/Claude/akgolf-hq-redesign/renders/<skjerm-navn>.html
~/Documents/Claude/akgolf-hq-redesign/renders/<skjerm-navn>.png
```
**Deretter i Claude Code:**
1. `git checkout -b feature/<skjerm>-ui`
2. Be Claude Code lese rendret referansefil + `design-tokens.md` + `component-library.md` — **aldri** bygg en skjerm fra en verbal beskrivelse alene, alltid fra godkjent render
3. Bygg komponenten i riktig mappe (`components/agencyos/` eller `components/playerhq/`)
4. **Selvverifisering — ikke bare kode-diff:** ta skjermbilde av lokal dev-server og sammenlign visuelt mot referanserenderet før du sier deg ferdig
5. Sjekk lys/mørk + alle tre breakpoints i faktisk nettleser, ikke bare i koden
6. Oppdater `design-index`-status til «portet»
7. PR med skjermbilde av design vs. portert resultat side om side (se PR-mal i del 5)
**Fonter (låst, verifisert i `src/app/layout.tsx`):** Poppins / Lora / IBM Plex Mono. Inter / Familjen Grotesk / JetBrains Mono er fjernet. Ikke sjekk Paper `akhq-tokens.css` for produktflater — sjekk Train-lock + layout.tsx.
### 11.4 Designmål: så likt Claude sin egen app som mulig (iPhone + desktop)
Basert på Claude Design-prosjektet er ambisjonen at AK Golf HQ skal oppleves visuelt og
strukturelt så likt Claude-appen som mulig — Claude sin iPhone-app for mobilflatene
(PlayerHQ/Forelderportal), Claude desktop-appen for skrivebordsflatene (AgencyOS) — så langt
det passer med skjermene som faktisk finnes i produktet. Dette gjelder retning og følelse
(typografi, ro i flatene, spacing, chat-først-mønster, komponentbruk), ikke en 1:1-kopiering
av funksjoner Claude-appen har som AK Golf HQ ikke trenger.
Skjermer som IKKE ennå er designet i Claude Design-prosjektet skal ikke vente på egen
designrunde før de kan bygges — de settes sammen av eksisterende, godkjente komponenter fra
komponentbiblioteket (del 11.2 punkt 5), i samme Claude-nære visuelle språk som de skjermene
som allerede har fasit. Samme prinsipp som porting-gaten (del 30): ingen ny, frittstående
visuell oppfinnelse per skjerm — heller gjenbruk av det som allerede er godkjent.
---
## 12. Strukturere prompts til Sonnet, Opus og Fable — basert på Anthropics anbefalinger
Kilde: Anthropics offisielle prompting-dokumentasjon for Claude 5-familien (se lenker i 12.6). Alle tre modellene er tilgjengelige for deg nå.
### 12.1 Generell transformasjon — fra enkelt prompt til best practice
Uansett modell, gjør denne overgangen:
| Enkelt prompt           | Best practice                                                |
| ----------------------- | ------------------------------------------------------------ |
| «Lag et bookingskjema»  | «Lag et bookingskjema for AgencyOS. Inkluder validering, feilmeldinger på norsk, og alle tilstander (tom, utfylt, feil, sendt inn).» |
| «Fiks denne funksjonen» | «Endre denne funksjonen slik at [konkret utfall].» (handling, ikke forslag) |
| «Ikke bruk markdown»    | «Skriv svaret som sammenhengende prosa i avsnitt.» (si hva den SKAL gjøre, ikke hva den ikke skal) |
Fire grep som virker på alle modeller:
1. **Vær presis om ønsket format/output** — ikke la modellen gjette.
2. **Gi kontekst/hvorfor** — modellen generaliserer bedre fra en begrunnelse enn fra en ordre.
3. **Strukturer med XML-tagger** når prompten blander instruksjon, kontekst og eksempler — `<oppgave>`, `<kontekst>`, `<krav>`.
4. **Be eksplisitt om handling** — «gjør disse endringene», ikke «kan du foreslå endringer» (modellen foreslår bokstavelig hvis du spør sånn).
### 12.2 Sonnet 5 — standardmodellen for produksjonskode
Sonnet 5 følger instruksjoner bokstavelig og konsist. Den utvider ikke vage forespørsler slik eldre modeller gjorde — det du skriver er det du får.
- Be eksplisitt om «gå utover det grunnleggende» hvis du vil ha en fullverdig implementasjon, ellers holder den seg minimal.
- Adaptive thinking er på som standard — ingen manuell budsjett-styring nødvendig fra din side.
- Standardmal for kodeoppgaver i Claude Code:
```
<oppgave>
[Konkret, presis beskrivelse av hva som skal gjøres]
</oppgave>
<kontekst>
[Hvorfor — hvilket mål/hvilken flate/fil dette gjelder]
</kontekst>
<krav>
- [Spesifikt krav 1]
- [Spesifikt krav 2]
</krav>
<verifisering>
Kjør npm run build og test lokalt. Bekreft at det passerer før du sier deg ferdig.
</verifisering>
```
### 12.3 Opus (5) — arkitektur, komplekse vurderinger, forskning
Opus 5 er nyeste Opus (erstattet 4.8 i slutten av juli 2026) — mer effektiv til samme pris, sterk på kode og kunnskapsarbeid, verifiserer eget arbeid automatisk.
- **Ikke** legg til eksplisitte «sjekk arbeidet ditt før du er ferdig»-instruksjoner — Opus 5 gjør dette selv, og gamle verifiseringsinstruksjoner kan gi unødvendig dobbeltsjekking og høyere tokenbruk.
- Standardsvarene er lengre enn tidligere modeller — be eksplisitt om kort svar hvis du vil ha det, effort-nivå endrer ikke nødvendigvis lengden alene.
- Bruk her: arkitekturvalg i AK-formel-logikken, komplekse porting-gate-/designbeslutninger, større Supabase-skjemaendringer.
```
<rolle>
Du er senior arkitekt for AK Golf HQ. Vurder følgende grundig.
</rolle>
<beslutning>
[Hva som skal vurderes]
</beslutning>
<begrensninger>
[Stack, invarianter, eksisterende mønstre som ikke skal brytes]
</begrensninger>
<format>
Svar kort — anbefaling først, begrunnelse i 2-4 setninger.
</format>
```
### 12.4 Fable 5 — store, sammensatte, tvetydige oppgaver
Fable 5 er fundamentalt annerledes å prompte enn Sonnet/Opus — gi mål, ikke steg.
- **Effort:** `high` er standard, `xhigh` kun for de aller viktigste oppgavene.
- **Ikke gjenbruk gamle, preskriptive skills/prompter** bygget for eldre modeller — de kan faktisk forringe resultatet på Fable 5.
- **Ikke** be om «vis chain-of-thought» eller «forklar steg for steg» — kan utløse avslag. Be heller om en oppsummering av hva som ble gjort og hvorfor, ikke tankeprosessen underveis.
- **Bygg et enkelt filbasert minnesystem** for lange prosjekter: én leksjon per fil, kort sammendrag øverst, registrer korreksjoner og validerte fremgangsmåter — unngå duplisering.
- Bruk her: de virkelig store sammenhengende oppgavene — hele Workbench-modulen, en flerdagers porting av alle AgencyOS-skjermer, dyp gap-analyse av CANON v3.5 mot AK-formel v2.
```
Jeg jobber med [større oppgave] for [hvem det er til].
De trenger [hva output skal muliggjøre].
Kontekst: [pek til relevante filer/mønstre — ikke lim inn alt]
Grenser: [hva som IKKE skal endres/berøres]
Når du har nok informasjon til å gå videre, ta en fornuftig beslutning og fortsett.
Oppsummer til slutt hva som ble gjort og hvorfor.
```
### 12.5 Velgetabell
| Oppgavetype                                            | Modell    | Hvorfor                                                 |
| ------------------------------------------------------ | --------- | ------------------------------------------------------- |
| Konkret kodeimplementasjon, enkelt-fil-fiks            | Sonnet 5  | Standard — rask, presis, billig                         |
| Arkitekturvurdering, komplekse beslutninger, forskning | Opus 5    | Balanserer dybde og kost, verifiserer selv              |
| Flerdags/sammensatt porting, dyp metodikk-analyse      | Fable 5   | Lang selvstendig kjøring, sterkest resonnering          |
| Smale, gjentakende fikser                              | Haiku 4.5 | Billigst/raskest — foreløpig ikke i bruk i dette repoet |
### 12.6 Kilder
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
---
---
## 13. Anbefalinger fra Boris Cherny (skaperen av Claude Code)
Hentet fra Chernys egne publiserte workflow-tråder (jan–apr 2026) og howborisusesclaudecode.com. Oversatt til din situasjon:
1. **Hold oppsettet enkelt.** Cherny selv kjører Claude Code nesten uten tilpasning — «det virker godt rett ut av boksen». Din config-audit fant ett års akkumulert drift; dette bekrefter retningen: rydd NED, ikke bygg mer scaffolding. Prosjekt-CLAUDE.md under 500 linjer, helst mye kortere.
2. **Plan mode som standard for alt som skal bli en PR** (shift+tab to ganger). Gå frem og tilbake med Claude til planen er god, bytt så til auto-accept edits — da tar Claude det vanligvis i ett forsøk. «En god plan er virkelig viktig.» Dette er identisk med din eksisterende plan-godkjenningsregel — behold den.
3. **Når noe sporer av: re-planlegg, ikke fortsett å dytte.** Ny plan i stedet for tre nye forsøk i samme retning.
4. **Slash-kommandoer for hver «indre løkke»** — arbeidsflyter du gjør mange ganger daglig. Det er derfor `/feature`, `/pr` og `/db-check` finnes; legg til flere når du merker at du skriver samme instruks to ganger.
5. **CLAUDE.md er et levende dokument («Compounding Engineering»):** hver gang Claude gjør noe feil, legg regelen inn i CLAUDE.md så feilen ikke gjentas. Sjekket inn i git, hele teamet (deg + Claude) bidrar.
6. **Bruk toppmodellen for kode selv om den er tregere.** Chernys begrunnelse: mindre styring + bedre verktøybruk = raskere totalt, selv med større modell. For deg med $1000/mnd i ekstra usage betyr det: Opus 5 i Claude Code som arbeidshest er sannsynligvis BILLIGERE totalt enn Sonnet med tre omganger retting. Se modellruting i del 15.
7. **Auto mode i stedet for babysitting:** tillatelses-spørsmål rutes til en klassifiserer som avgjør om kommandoen er trygg. Slå på i Claude Code — det fjerner avbruddene uten `--dangerously-skip-permissions`.
8. **Effort-dial:** lavere effort = raskere og billigere, høyere = smartere. Standard `high`; skru ned for rutinefikser, opp kun bevisst.
9. **Sørg alltid for at Claude kan verifisere eget arbeid.** Backend: la Claude kjøre serveren og teste ende-til-ende. UI: skjermbilde mot referanse. Dette dobler-tredobler verdien du får ut av modellen.
10. **Parallelle økter når du er klar for det:** 3–5 git worktrees med hver sin Claude-økt (én per funksjon), systemvarsler når en trenger input. IKKE start her — dette er steg to etter at grunnflyten i del 4 sitter. Med karpaltunnel og tale-til-tekst er én velstyrt økt bedre enn fem halvstyrte.
## 14. Anbefalinger fra Andrej Karpathy (agentic engineering)
Karpathy (nå i Anthropic) skiller mellom «vibe coding» (prompt og håp) og «agentic engineering» — disiplinen som gjelder for deg:
1. **Du er engineering manager, ikke murer.** Din jobb er intensjon, kontekst og retning — spesifikasjon, arkitekturvalg, godkjenning av planer, review av resultat. Claudes jobb er all koden. Du har allerede denne modellen; dokumentet her formaliserer den.
2. **Spec først.** Skriv hva som skal bygges og hvorfor FØR agenten starter — det er dette `/feature`-kommandoens plan-steg tvinger frem. Karpathys mønster: én `program.md` med intensjon, begrensninger og mål per større oppgave.
3. **Diff-review er kjernekompetansen din.** Du trenger ikke kunne skrive koden, men du skal lese PR-en: gjør den det planen sa? Vercel preview + skjermbilder i PR-malen finnes for at du skal kunne reviewe visuelt, ikke teknisk.
4. **Verifiserbare signaler > magefølelse.** Tester, build som passerer, visuell sammenligning mot godkjent design — hver oppgave skal ha en definert «sånn vet vi at det er riktig».
5. **Kunnskapsbase-mønsteret:** et versjonskontrollert sett markdown-filer agentene leser og oppdaterer (ditt ak-second-brain/Masterbrain + prosjekt-CLAUDE.md er nettopp dette). Én sannhetskilde, agenten oppdaterer den når noe læres.
6. **Parallellisering av dømmekraft kommer sist.** Karpathy kjører 20 agenter — etter år med erfaring. For deg: mestre én økt med god plan/review-loop først (del 4), utvid til 2–3 parallelle worktrees når det er friksjonsfritt.
## 15. Modellruting og kostnadskontroll — $1000/mnd skal NED
Du bruker i snitt $1000/mnd ekstra usage på toppen av 20x-abonnementet, kun på AK Golf. Hovedmistenkte er: lange økter som aldri ryddes, feil modell på feil oppgave, og retting i flere omganger fordi første prompt var for tynn. Tiltak, i prioritert rekkefølge:
1. **Abonnementet først, API sist.** 20x Max-abonnementet dekker mye — kjør Claude Code på abonnementet, ikke API-nøkkel, der det er mulig. Ekstra usage skal være unntaket.
2. **Modellruting (erstatter «Sonnet som standard»-regelen for kode):**
   - **Claude Code, produksjonskode:** Opus 5 med adaptive thinking som arbeidshest (Cherny-logikken: færre omganger = billigere totalt). Effort `high` standard, `medium/low` for rutinefikser.
   - **Små, veldefinerte fikser og repetitive oppgaver:** Sonnet 5.
   - **Fable 5:** KUN flerdagers sammensatte oppgaver (hele Workbench, full skjermportering, dyp metodikkanalyse) — og kun etter at planen er godkjent. Aldri som default.
   - **Cowork/chat (dette grensesnittet):** modellen som er valgt er god nok — ikke bytt opp uten grunn.
3. **Ny økt ved oppgavebytte + `/clear`** — regel du allerede har; den er også det største enkelt-kostnadstiltaket. En 2-timersøkt som fortsetter inn i neste tema betaler for hele historikken på hver melding.
4. **Prompt-kvalitet er kostnadskontroll.** Én god prompt via prompt-engineer-skillen (del 16) i stedet for tre runder retting er den billigste optimaliseringen som finnes.
5. **Månedlig kostnadssjekk:** første fredag i måneden, se usage-oversikten i Claude-kontoen. Over $500 ekstra → identifiser hvilke økter som dro, juster ruting. Målet er at ekstra usage går mot null når rutingen sitter.
## 16. Prompt-engineer-skillen — alltid aktiv
`ak-golf-prompt-engineer`-skillen (oppdatert versjon ligger i denne leveransen) er broen mellom dine enkle inputs og optimale prompts. Regel som skal inn i både global CLAUDE.md og prosjekt-CLAUDE.md:
> Når Anders gir en enkel/kort instruks for en ikke-triviell oppgave, skal Claude automatisk strukturere den til optimal prompt etter ak-golf-prompt-engineer-skillen (riktig modell, XML-struktur, verifiseringssteg) FØR arbeidet starter — uten å spørre. Vis den strukturerte prompten kun hvis oppgaven er stor nok til å kreve plangodkjenning; ellers bare kjør.
Dette gjelder på tvers: Claude Code, Cowork og chat. Du skal aldri måtte skrive «lag en optimal prompt» — det skjer automatisk.
## 17. Claude Cowork — oppsett og struktur
Cowork er skrivebordsappen for ikke-kode-arbeid. Arbeidsdeling som gjelder:
| Arbeid                                          | Verktøy                                     |
| ------------------------------------------------ | -------------------------------------------- |
| Kode (alt i ~/Developer/)                       | Claude Code                                 |
| Design (produktflater)                          | Train-lock i repoet (`designsystem/train-lock/`) |
| Dokumenter, rapporter, fakturaer, e-post, drift | Cowork                                      |
| Raske spørsmål, planlegging, dispatch           | Claude-chat (mobil/web)                     |
Cowork-oppsett:
1. **Mapper Cowork får jobbe i:** `~/Documents/Claude/` og Google Drive `AK Golf Group/`. ALDRI `~/Developer/` — kode rører Cowork ikke.
2. **Connectors:** Gmail, Google Kalender, Google Drive, Notion er koblet — det dekker dispatch, svar-inbox og dokumentarbeid. Ikke legg til flere uten konkret behov (din egen MCP-regel).
3. **Skills gjelder også i Cowork:** ak-dispatch, svar-inbox, ak-golf-merkevare og prompt-engineer-skillen fungerer her. Samme grunnregel: Cowork spør aldri om innstillinger, bare om innhold.
4. **Leveranser fra Cowork** følger fillagringsreglene: forretningsdokumenter → Drive, notater → ~/Documents/Claude/, aldri kun lokal fil uten lenke til deg.
## 18. Synkronisering — Mac Mini, MacBook Air, Google Drive
Målet: begge maskinene og Drive er ALLTID i samme tilstand, uten at du tenker på det.
**Kode (git er synkmekanismen — eneste):**
- Push før hver øktslutt og hvert maskinbytte er allerede absolutt regel. `/pr`-kommandoen og øktsjekklisten i del 10 håndhever den.
- Startritual på begge maskiner: `git checkout main && git pull` før noe annet — også dette ligger i `/feature`.
- `.claude/`-mappen (CLAUDE.md, commands, settings.json) sjekkes inn i repoet — da følger konfigurasjonen automatisk med git mellom maskinene. Kun maskinspesifikke hemmeligheter (`.env.local`) holdes utenfor og settes opp én gang per maskin (del 2).
**Global Claude-konfig (~/.claude/):**
- Denne ligger utenfor git i dag. Anbefaling: eget privat repo `akgolfsoftware/dotfiles` med `~/.claude/CLAUDE.md`, globale skills og commands — klon på begge maskiner, push ved endring. Dette gjøres som del av config-auditen (del 19), ikke manuelt nå.
**Dokumenter:**
- Alt forretningsinnhold ligger i Google Drive `AK Golf Group/` — Drive for desktop på begge maskiner med «Mirror files» for den mappen, da er den alltid lokal og alltid synket.
- `~/Documents/Claude/` er per i dag lokal per maskin. Innhold som trengs på begge (tokens, renders, fasitfiler for akgolf-hq-redesign) flyttes til Drive eller inn i repoet under config-auditen. Merk konflikten mot «ALDRI iCloud»-regelen: den står — Drive er løsningen, ikke iCloud.
**Sync-sjekk (inn i kveldsrutinen):** `git status` i aktive repoer viser rent tre + «up to date with origin», Drive-ikonet viser ferdig synkronisert. To blikk, ti sekunder.
## 19. Kadens — hva Claude gjør for deg når
Basert på det som er kjent om oppgavene dine i dag. Dette er rammeverket; den komplette auditen (del 20) fyller det ut.
**Flere ganger daglig:**
- Claude Code-økter etter del 4-flyten (ettermiddag er hovedblokken)
- Enkle input → optimal prompt automatisk (del 16)
**Daglig:**
- Morgen: dispatch/morgenbrief (ak-dispatch-skillen) — kalender, forfall, prioritering
- Kveld: kveldsjekk + sync-sjekk (del 18) + push-kontroll
- Coaching-pipeline: voice memo → transkripsjon → Notion + ak-second-brain
**Ukentlig:**
- Innboks-sveip med svar-inbox-skillen (utover daglige raske svar)
- Ukeplanlegging mot Notion Tasks + Prosjekter
- Gjennomgang av åpne PR-er og branches — merge eller lukk, ingen langtlevende branches
**Månedlig:**
- Skarpnord Mureservice-fakturering til JMR Bygg (egen memory-fil finnes)
- Kostnadssjekk Claude-usage (del 15, punkt 5)
- CLAUDE.md-vedlikehold: fjern regler som ikke lenger gjelder (Compounding Engineering går begge veier)
**Årlig/kvartalsvis:**
- Config-audit av hele .claude-oppsettet (den påbegynte auditen fullføres først, deretter kvartalsvis lettversjon)
- Revisjon av dette masterdokumentet mot faktisk praksis
## 20. Neste steg: komplett audit av deg og ditt
Dette dokumentet er rammeverket. Den komplette auditen — alle dine oppgaver på tvers av AK Golf Academy, WANG, Mulligan, GFGK, Skarpnord og privat, kartlagt mot kadensen i del 19 og automatisert der det gir mening — er en egen leveranse. Den kjøres som egen Cowork-økt med tilgang til Notion, Gmail og Kalender, etter at første mål (AK Golf HQ ryddet + design implementert) er i gang. Ikke start auditen før kickoff-prompten i del 21 er kjørt.
## 21. Kjøreplan — første mål
1. Legg de seks filene fra `akgolf-hq-claude-files/` inn i repoet (kopier-lim-blokken fulgte med leveransen).
2. Start ny Claude Code-økt i `~/Developer/akgolf-hq`. Modell: **Opus 5** (endret fra Sonnet 5-anbefalingen tidligere i chatten — Cherny-logikken i del 13 pkt. 6 og rutingen i del 15 gjelder nå).
3. Lim inn `kickoff-prompt.md` som første melding. Den rydder .claude-oppsettet, løser fontkonflikten, verifiserer build og åpner PR — uten å spørre deg om annet enn innholdsbeslutninger.
4. Når PR-en er merget: neste økt er første design-portering fra Claude Design etter porting-gaten i del 11 — start med én skjerm fra AgencyOS Konsoll, ikke ti.
---
## 22. Anti-antagelser — Claude Code skal aldri gjette
Basert på Anthropics offisielle prompting-dokumentasjon (investigate-before-answering-mønsteret, anti-hardkoding) og mønstre fra Claude Code-teamets egne workflows. Denne blokken skal inn i prosjekt-CLAUDE.md (den oppdaterte CLAUDE.md-filen i denne leveransen har den allerede):
```markdown
## Aldri antagelser
- Spekuler ALDRI om kode du ikke har åpnet. Refereres en fil: les den FØR du svarer.
  Ingen påstander om kodebasen uten å ha undersøkt — grunngitte, hallusinasjonsfrie svar.
- Eksakte verdier (farger, stier, navn, tabellnavn, env-nøkler) LESES fra kilden hver
  gang, aldri fra hukommelse. Usikker på en verdi → slå opp, ikke tipp.
- Mangler kritisk informasjon som kan finnes i repoet, docs eller via verktøy (Supabase
  MCP, Vercel MCP, web): HENT den. Spør Anders kun når svaret faktisk ikke finnes.
- Skriv generelle løsninger, aldri hardkoding mot testcaser. Er en test feil eller
  oppgaven urimelig: si det, ikke jobb rundt.
- Er to kilder i konflikt (dokument vs. kode, gammel regel vs. ny): stopp, rapporter
  konflikten med begge kildene sitert, foreslå hvilken som vinner — ikke velg stille.
- Hver oppgave har definert verifisering (build, test, visuell sammenligning). Uten
  bestått verifisering er oppgaven ikke ferdig — «ser riktig ut» teller ikke.
```
Prompt-mønstre fra populære Claude Code-repos som forsterker dette i praksis:
- **«Grill me»:** etter en plan eller løsning — «Grill meg på disse endringene og ikke lag PR før jeg består testen din.» Tvinger modellen til å finne hull i stedet for å anta at alt er greit.
- **«Scrap and redo»:** etter en middelmådig fiks — «Med alt du vet nå: skrot dette og implementer den elegante løsningen.» Billigere enn å lappe videre på en antagelse.
- **Re-planlegg ved avsporing** (Cherny): når noe går galt to ganger, er antagelsen i planen feil — ny plan, ikke tredje forsøk.
- **Fasewise gated plan** (claude-code-best-practice-repoet): store oppgaver deles i faser med tester per fase — ingen fase starter før forrige er verifisert.
## 23. Global ~/.claude/CLAUDE.md — optimalisert versjon
Din globale fil speiler i dag hele AI OPERATIVSYSTEM-dokumentet — mye av det er kontekst for chat/Cowork, ikke regler Claude Code trenger i hver økt. Anthropics og Chernys anbefaling er lik: kort, faktabasert, kun det som endrer adferd. Filen `global-CLAUDE.md` i denne leveransen er den optimaliserte versjonen (~60 linjer, ned fra ~130). Prinsippene bak kuttene:
- **Behold:** identitet i én setning, kommunikasjonsregler, aldri-spør-regelen, anti-antagelse-reglene, fillagring, modellruting, ikke-forhandlingsbare regler.
- **Flytt til prosjekt-CLAUDE.md:** alt AK Golf HQ-spesifikt (allerede gjort).
- **Flytt til ak-second-brain/Masterbrain:** faglig grunnlag (CANON, AK-formel, MORAD-detaljer) — Claude Code henter det ved behov i stedet for å bære det i hver økt. Dette alene sparer tusenvis av tokens per økt.
- **Fjern:** forretningsbeskrivelser, mål-lister og bakgrunn som ikke endrer hvordan Claude jobber i en kodeøkt.
Byttet gjøres av kickoff-økten hvis `~/.claude/CLAUDE.md` er tilgjengelig, ellers manuelt: erstatt innholdet med `global-CLAUDE.md`.
## 24. Vercel: $300+/mnd i build minutes — diagnose og fiks
Jeg leste deploy-loggen for akgolf-hq-prosjektet direkte (06.08.2026). Funn:
**Diagnose: ~20 deploys på under 6 timer.** Hver eneste push til hver eneste branch bygger en full preview-deploy — inkludert rene dokumentasjons-commits («docs(gotchas)», «docs(port)», flytting av launch.json) som ikke endrer appen i det hele tatt. I tillegg går flere redeploys av samme commit. Med parallelle økter som pusher ofte, betaler du full Next.js-build (Prisma generate + Turbopack + testinfrastruktur) mange titalls ganger daglig. Det er hele kostnaden.
**Fiks, i prioritert rekkefølge — legges inn av neste Claude Code-økt:**
1. **Ignored Build Step (størst effekt, null ulempe).** `vercel.json` i repo-roten får en `ignoreCommand` som avbryter builds når ingen app-relevante filer er endret:
```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- ':!*.md' ':!docs/' ':!.claude/' ':!designsystem/' ':!kart/'"
}
```
Kommandoen avbryter builden (exit 0) hvis diffen kun rører markdown, docs, .claude eller design-speilmapper. Med dagens commit-mønster forsvinner anslagsvis en tredjedel av alle builds umiddelbart — dokumentasjons- og speil-commits er en stor andel av loggen.
2. **Push sjeldnere per branch.** Regelen «push før øktslutt/maskinbytte» står — men innenfor en økt committes lokalt og pushes samlet når noe faktisk skal verifiseres i preview. Fem pushes på en time = fem builds; én samlet push = én. Denne regelen er lagt inn i CLAUDE.md-filen.
3. **Ikke redeploy manuelt uten grunn.** Loggen viser redeploys av uendrede commits — hver koster full build. Preview-URL-en fra første build er den samme appen.
4. **Månedlig sjekk utvides:** Vercel usage inn i samme første-fredag-sjekk som Claude-usage (del 15 pkt. 5). Mål: under $50/mnd i build minutes på dette prosjektet.
**To alvorligere funn fra samme logg — utenfor det du spurte om, men de kan ikke stå urapportert:**
1. **Repoet `Golf_Headquarters` står som PUBLIC på GitHub.** Hele kodebasen — forretningslogikk, AK-formel-implementasjon, dokumentasjon med spillernavn i commit-meldinger — er åpent tilgjengelig for hvem som helst. Med PII-reglene dine og forretningsverdien i koden skal dette være private. Fiksen er ett valg i GitHub repo settings → Danger Zone → Change visibility → Private. Kickoff-prompten er oppdatert til å be deg bekrefte dette som første punkt (det er en forretningsbeslutning, derfor spørres du — eneste unntaket).
2. **Repoet heter `Golf_Headquarters`, ikke `akgolf-hq`.** Alle filer i denne leveransen er rettet til riktig navn. Ikke rename repoet nå — Vercel-koblingen peker på det, og rename midt i aktiv utvikling gir mer støy enn gevinst.
---
## 25. De fem gjentakende feilene — regler som hindrer dem
Dokumentert 06.08.2026 etter en økt som gikk med til å reparere alle fem. Reglene under er lagt inn i prosjekt-CLAUDE.md og håndheves av hver økt — de er ikke råd, de er porter.
**1. Beslutning uten fasit-oppdatering.**
AK-formel v2 ble vedtatt 03.08; byggekontrakten påbød v1 i tre dager etterpå. Regel: **en beslutning er ikke tatt før fasiten er oppdatert.** Når Anders vedtar noe, er Claudes FØRSTE handling å finne og oppdatere alle filer som håndhever den gamle regelen (grep etter den gamle verdien i hele repoet), i samme økt. «Notert» uten fasit-endring er en ikke-handling og skal aldri rapporteres som fullført.
**2. To kilder som driver fra hverandre.**
Regel: **én kilde, alt annet er speil som peker dit — og hvert speil deklarerer kilden sin øverst.** Claude Design (605a48cc) er designkilden; designsystem/paper er speil. Demodata har ÉN kanonisk fil for navn (Øyvind Rohjan-kanonen). Før en økt endrer noe i et speil: sjekk om kilden er endret først. Nytt innhold opprettes ALDRI som kopi to steder — det opprettes i kilden og speiles med referanse.
**3. Historiske dokumenter uten UTGÅTT-stempel.**
Regel: **når et dokument avløses, får det `> UTGÅTT <dato> — avløst av <fil/kilde>` som FØRSTE linje** — i samme commit som avløseren. Dato i filnavn er ikke nok. Claude skal aldri bruke et dokument som fasit uten å sjekke om noe nyere avløser det, og skal selv stemple dokumenter den oppdager er avløst.
**4. Minnefiler som vokser til de blir dyre.**
70 KB prosjektfil + 19 KB gotchas = ~60 000 tokens betalt før første melding, i hver økt. Regel: **prosjektfila er «hvor er vi + neste steg», maks 5 KB.** gotchas.md maks 5 KB — kun feller som fortsatt er aktive. Alt historisk flyttes til `arkiv/`-mappe som ALDRI lastes automatisk (ikke referert fra CLAUDE.md, ikke i hooks). Månedlig sjekk (del 19) inkluderer størrelseskontroll: `du -k .claude/ ak-brain/prosjekter/ | sort -n` — alt over 5 KB som lastes per økt, krymper eller arkiveres.
**5. Parallelle økter i samme mappe.**
En økt byttet gren under en annen og tok med seg ucommittet arbeid. Regel: **maks 3 samtidige økter, og hver økt kjører i sin egen worktree** (se del 26 for hva det er). Hovedmappa (`~/Developer/akgolf-hq`) er kun for én-økt-arbeid. Åpnes økt nummer to: `git worktree add` først, alltid. Env-lenke-hooken som allerede finnes (.claude/hooks/env-lenke.mjs) gjør at worktrees får miljøvariablene automatisk.
**6. (Modellvalget) Feil modell på feil oppgave.**
Fable 5 med seks tunge agenter på ren tekstopprydding er det dyreste enkeltvalget som er gjort. Presisert ruting — erstatter og skjerper del 15 pkt. 2:
| Oppgave                                                      | Modell       | Agenter                                                |
| ------------------------------------------------------------ | ------------ | ------------------------------------------------------ |
| Tekst-/docs-opprydding, rename, speil-synk, enkle fikser     | **Sonnet 5** | Ingen subagenter                                       |
| Produksjonskode, funksjonsbygging, feilsøking                | Opus 5       | Subagenter kun ved reelt parallelle arbeidsstrømmer    |
| Korte designøkter, flerdagers sammensatte bygg (kun etter godkjent plan) | Fable 5      | Maks 2 subagenter uten eksplisitt begrunnelse i planen |
Subagent-demping (fra Anthropics offisielle veiledning, lagt i CLAUDE.md): «Bruk subagenter kun når oppgaver kan kjøre parallelt eller trenger isolert kontekst. For enkle oppgaver, sekvensielt arbeid og enkeltfil-endringer: jobb direkte.» Seks agenter på tekstopprydding skal aldri skje igjen — hver subagent er en egen modellkjøring du betaler for.
## 26. Branch, PR, merge, worktree — forklart uten teknisk språk
Tenk på repoet som **permen med hele oppskriftsboka til AK Golf HQ**. GitHub er bankboksen der originalen ligger; hver maskin har en kopi.
**Branch (gren)** = en kladdekopi av hele permen. Du sier «lag en gren for booking-fiksen», og Claude jobber i kladden mens originalen (`main`) står urørt. Går kladden galt, kaster du den — originalen er like hel. Derfor jobbes det aldri rett i `main`: originalen skal alltid være den som fungerer og ligger ute på akgolf-hq.vercel.app.
**Commit** = et lagringspunkt i kladden med en beskjed om hva som ble endret («la til avbestillingsårsak»). Mange små lagringspunkter gjør det mulig å spole tilbake til akkurat før noe gikk galt.
**Push** = å sende lagringspunktene til bankboksen (GitHub). Før push finnes arbeidet bare på den ene maskinen — derfor regelen om push før maskinbytte. Men: hver push får Vercel til å bygge en forhåndsvisning, som koster. Derfor: lagre (commit) ofte, send (push) samlet.
**PR (pull request)** = kladden legges frem for godkjenning: «her er endringen, her er hvorfor, her er beviset på at den virker». Vercel lager automatisk en forhåndsvisningsside av kladden — det er den du ser på og godkjenner, ikke koden. PR-en er kvalitetsporten din: din jobb er å se på forhåndsvisningen og si ja eller nei.
**Merge** = godkjent kladd føres inn i originalen. Vi bruker «squash merge»: alle småpunktene i kladden slås sammen til ETT ryddig punkt i originalens historikk — én funksjon, én linje i loggen. Etter merge deployer Vercel originalen til produksjon automatisk, og kladden slettes.
**Worktree** = i stedet for at to personer krangler om samme fysiske perm, får hver økt **sitt eget skrivebord med sin egen kopi av permen**. Alle skrivebordene deler samme bankboks, men det som skjer på skrivebord A rører aldri papirene på skrivebord B. Det var dette som manglet 06.08: to økter delte ett skrivebord, den ene byttet kladd mens den andre skrev, og ucommittet arbeid ble revet med. Regel: én økt = én worktree, alltid.
**Flyten i én setning:** ny kladd (branch) → jobb og lagre (commits) → send samlet (push) → legg frem med bevis (PR + forhåndsvisning) → du godkjenner → føres inn i originalen (merge) → ut i produksjon automatisk → kladd slettes.
---
## 27. Hvor jobbes hva — cloud, Mac Mini, iPhone
Tre steder å kjøre Claude Code, hver med sin jobb. Regelen: **oppgaven bestemmer stedet, ikke hvor du tilfeldigvis er.**
| Sted                                             | Hva det er                                                   | Brukes til                                                   |
| ------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| **Cloud (default-vinduet)**                      | Anthropics midlertidige maskin med fersk kopi fra GitHub. Når IKKE filene på Mac-ene dine. | Alt som kun trenger repoet: tekst-/docs-opprydding, rename, speil-synk, isolerte funksjoner uten UI-verifisering, tester, PR-arbeid. Sonnet 5. |
| **Mac Mini (Remote Control eller ved maskinen)** | Din egen maskin med ALT: lokale filer (~/Documents-tokens og renders, ~/.claude), dev-server, database-tilkobling. | Alt som trenger lokale filer eller øynene dine: design-portering (renders + visuell sjekk i nettleser), Prisma-migrasjoner, funksjonsbygging med UI, lange Opus-/Fable-økter. |
| **iPhone**                                       | Fjernkontroll og godkjenningsflate — aldri primær arbeidsflate. | Starte cloud-økter, godkjenne planer, svare på spørsmål fra økter, se PR-forhåndsvisninger, styre Mac Mini via Remote Control. |
**Ny funksjon — standardflyten:**
1. **Beskriv ønsket** hvor som helst (chat/Cowork/iPhone): «jeg vil at spillere skal kunne X». Claude strukturerer det til plan.
2. **Godkjenn planen** (iPhone er fint til dette).
3. **Bygging: Mac Mini-økt** — fordi verifisering (dev-server, lys/mørk, tre breakpoints, sammenligning mot render) krever lokal maskin. Bygging uten verifisering er gjetting, og gjetting er forbudt (del 22).
4. **Review PR-en** fra hvor som helst — Vercel-forhåndsvisningen er laget for at du skal se, ikke lese kode.
Unntak: en funksjon helt uten UI og uten lokale avhengigheter (ren API-logikk med tester) kan bygges i cloud.
## 28. Claudes rolle: veileder og coach — aldri rot-mulighet
Lagt inn i global og prosjekt-CLAUDE.md. Kjernen:
**Anders forklarer HVA han ønsker — på sitt språk, på intensjonsnivå. Claude eier HVORDAN, helt.**
Det betyr at spørsmål som «Basert på funksjonene vi har i PlayerHQ nå, hvordan kan vi utvikle AgencyOS med eksisterende eller nye funksjoner for å gjøre det enda bedre?» er en fullverdig arbeidsordre. Claude skal da selv: lese faktisk kodebase for hva PlayerHQ har i dag (aldri anta), holde det mot AgencyOS' fem flater og chat-først-modellen, og komme tilbake med en anbefaling og plan — ikke be Anders presisere tekniske detaljer han ikke har forutsetninger for å presisere.
Reglene:
1. **Forklar alltid enkelt og tydelig.** Hverdagsspråk, teknisk ord oversettes i samme setning, aldri anta at Anders vet hvor/hvordan noe gjøres (hvilket vindu, hvilken knapp, hvilken maskin). Forklar hvor ting skjer.
2. **Skap aldri rot-muligheter.** Gi aldri Anders et valg eller et manuelt steg som kan ødelegge noe hvis det gjøres feil. Farlige operasjoner gjøres av Claude med verifisering, eller deles opp så feiltrinn er umulig. Ett manuelt steg = én kopier-lim-blokk som er trygg å kjøre uansett.
3. **Veileder-plikt:** ser Claude at Anders er i ferd med å gjøre noe suboptimalt (feil modell, feil sted, unødvendig kostnad), skal Claude si fra og foreslå riktig vei — som en coach ville gjort — ikke lydig utføre.
4. **Intensjonsspørsmål besvares med undersøkelse først:** åpne spørsmål om produktretning starter alltid med å lese faktisk tilstand (kodebase, design-fasit, Notion) før anbefaling gis.
---
## 29. Aldri mist arbeid igjen — sjekkpunkt-regler
Tapt arbeid som må gjøres på nytt er den dyreste feilen av alle. Årsakene er kjent: ucommittet arbeid revet med av grenbytte, økter som dør med alt i minnet, «begynne på nytt» i stedet for å hente tilbake. Regler (lagt i CLAUDE.md):
1. **Commit etter hvert fullført delsteg** — ikke ved øktslutt. Et delsteg er «noe som fungerer»: en komponent som rendrer, en test som passerer. Maks 30 minutter mellom commits i aktivt arbeid.
2. **Commit FØR enhver risikabel operasjon** (grenbytte, migrasjon, stor refaktorering, `git`-kommandoer som flytter ting). Koster ingenting, redder alt.
3. **«Begynne på nytt» er forbudt uten gjenopprettingsforsøk først.** Git glemmer nesten aldri: committet arbeid kan alltid hentes tilbake (`git reflog` finner selv «slettede» commits). Claude skal ALLTID forsøke gjenoppretting og rapportere hva som fantes, før noe bygges på nytt. «Jeg starter på nytt» uten reflog-sjekk er et regelbrudd.
4. **Ved øktkrasj/avbrudd:** ny økt starter med `git status` + `git stash list` + `git reflog -20` — tre kommandoer som viser alt som kan reddes.
5. **Fremdriftsfil ved lange oppgaver:** oppgaver over én økt skriver `FREMDRIFT.md` i arbeidsmappa (hva er gjort, hva er neste, hvilke filer er rørt) — oppdatert ved hvert delsteg, committet. En ny økt leser den og fortsetter der forrige slapp i stedet for å begynne forfra.
## 30. Design-samsvar — hvorfor skjermene ikke ble som i Claude Design, og porten som fikser det
Rotårsaken til at portert kode ikke matcher designet: verifiseringen har vært «ser riktig ut» i stedet for målt samsvar, og fasiten har vært flere steder samtidig (port 2). Skjerpet porting-gate — erstatter sjekkliste-punkt 7 i del 11.2:
1. **Renderet er kontrakten.** Den godkjente HTML-/PNG-eksporten fra Claude Design (605a48cc) er juridisk bindende for økten: hver avstand, farge, font og tilstand skal matche. «Inspirert av» finnes ikke.
2. **Målt sammenligning, ikke skjønn.** Etter bygging tar Claude skjermbilde av lokal dev-server (Playwright finnes allerede i stacken) i samme viewport som renderet, og sammenligner side ved side — element for element: typografi, spacing, farger (mot tokens-fila, ikke mot øyet), alle tilstander (tom/fylt/feil/lastet), lys og mørk, tre breakpoints.
3. **Avviksliste før «ferdig».** Claude rapporterer hvert avvik den finner med [MATCH]/[AVVIK]-format. Null avvik = klar for PR. Avvik = fikses før PR, ikke «tas senere».
4. **PR-en viser beviset:** render og skjermbilde side ved side. Din godkjenning er visuell — ser de like ut for deg, merges det. Gjør de ikke det, avvises PR-en uten diskusjon.
5. **Fasit-endring stopper porting.** Oppdages det underveis at renderet selv er utdatert mot en nyere beslutning: STOPP, oppdater fasiten i Claude Design først (port 1), eksporter på nytt, fortsett. Aldri port mot en fasit du vet er feil.
## 31. Feilmønster-audit — finn hva du faktisk gjør oftest
Tre måneder overtid er ikke tilfeldig — det er mønstre, og mønstrene ligger i data du allerede har. Auditen leser fire kilder som ikke kan lyve:
1. **Git-historikken:** andel `fix`-commits av totalen, samme fil rettet 3+ ganger (= noe er uavklart der), reverterte commits, «på nytt»-formuleringer i commit-meldinger. Høy fix-andel på ett område = kravene der var uklare før bygging startet.
2. **PR-historikken:** PR-er som ble gjenåpnet/fulgt av fix-PR innen 48 timer, PR-er som aldri ble merget (bortkastet arbeid), tid fra åpnet til merget.
3. **gotchas.md + .claude/rules/:** hver oppføring der er en feil som har skjedd — grupper dem, tell kategoriene.
4. **Vercel-deployloggen:** builds som feilet, redeploys av samme commit.
Kjøres med `/retro`-kommandoen (ny, i denne leveransen) — første gang nå, deretter månedlig i første-fredag-sjekken (del 19). Output: topp 5 feilmønstre med tall, og for hvert mønster ETT konkret tiltak som legges rett inn i CLAUDE.md (port-formatet fra del 25). Slik vokser regelverket fra dine faktiske feil, ikke fra generiske råd — det er Compounding Engineering i praksis.
De fem portene i del 25 kom fra én dags observasjon. `/retro` mot tre måneders git-historikk vil finne mønstrene bak overtiden — sannsynligvis: bygging startet før krav var låst (fix-andel viser det), og porting mot drivende fasit (del 30 stopper det).
---
## 29. Feillogg-systemet — slik finner vi feilene dine, automatisk
Tre måneder ekstra tid skyldes ikke uflaks — det skyldes mønstre som gjentar seg uten å bli fanget. Fra i dag fanges de slik:
**1. Øktslutt-retro (viktigste mekanismen — lagt inn i CLAUDE.md og /pr):**
Hver Claude Code-økt avsluttes med tre linjer i `docs/feillogg.md`:
```
<dato> | <hva gikk galt / hva kostet ekstra tid> | <rotårsak> | <regel som hindrer gjentakelse (eller «regel finnes: port N»)>
```
Ingen feil i økten → én linje: «<dato> | ren økt». Dette koster ti sekunder og er datagrunnlaget for alt annet.
**2. Månedlig mønsteranalyse (inn i første-fredag-sjekken, del 15/19):**
Claude leser feillogg.md + git-loggen (commit-meldinger med `fix`/`docs(gotchas)` dokumenterer incidenter, som IPv6-nedetiden 05.08) + gotchas.md, grupperer etter rotårsak, og rapporterer: «dine tre hyppigste feil denne måneden + foreslåtte regelendringer». Regler som aldri utløses fjernes — regler som stadig brytes skjerpes eller automatiseres (hook/CI i stedet for tekst).
**3. Historisk baseline (engangs, del av den komplette auditen):**
Én Cowork-økt leser chat-historikk, git-logg og gotchas bakover og etablerer topp-10-listen over hva som faktisk har kostet deg de tre månedene. Det du allerede har navngitt + det jeg ser i historikken gir tre nye porter under.
## 30. Port 6–8 — de tre feilene som kostet tre måneder
**Port 6: Arbeid skal aldri kunne gå tapt.**
Rotårsak observert: ucommittet arbeid revet med av parallell økt; økter avsluttet uten lagring. Regel: **checkpoint-commit minst hvert 30. minutt og FØR hvert risikabelt steg** (grenbytte, migrasjon, større refaktorering). Committet arbeid kan alltid hentes tilbake — ucommittet arbeid er det eneste som kan dø. Claude committer selv uten å spørre (lokale commits er gratis og trygge; push er fortsatt samlet). En økt som avsluttes med ucommittet arbeid er en feilet økt og loggføres i feillogg.md.
**Port 7: Design godkjennes i små biter, mot eksempel — aldri i batch, aldri mot beskrivelse.**
Rotårsak observert i historikken: designspråket byttet underveis (Presis → Claude Paper) mens gamle fasitfiler fortsatt pekte på det gamle; 18 skjermer wireframet før konsolidering krympet dem til 11; batch-godkjenninger av wireframes uten at hi-fi var sett. Regler:
- **Én skjerm godkjennes fullt (wireframe → hi-fi → dine øyne på renderet) før neste startes.** Aldri «godkjenn disse 18».
- **Før en skjerm designes: Claude viser ett referansebilde** («den skal se ut som dette, i Train-lock») og du sier ja/nei til retningen FØR timer brukes på render. Misliker du resultatet, er det retningen som var feil — da er det billig å snu.
- **Ord som «premium» og «bedre» er ikke krav.** Claude oversetter ønsket ditt til konkrete, sjekkbare punkter (hvilke elementer, hvilken tetthet, hvilket forbilde) og bekrefter listen før generering. Design-misnøye = kravet var utydelig, og det er Claudes jobb å gjøre det tydelig — ikke din.
**Port 8: «Ferdig» er definert FØR arbeid starter — og scope-endring er en ny beslutning, ikke en glidning.**
Rotårsak observert: «ferdig» har flyttet seg (redesign ble til presisjonsforfining ble til full Paper-port), og hver flytting kostet uker. Regler:
- Hver funksjon/skjerm får en **ferdig-definisjon i planen** (maks 3 sjekkbare punkter). Når de tre er grønne, ER den ferdig — forbedringsideer går i backlog, ikke inn i samme oppgave.
- Vil du endre scope underveis: Claude svarer med kostnaden («dette legger X til, alternativet er å fullføre som planlagt og ta det som neste oppgave») FØR den utfører. Du bestemmer — men alltid informert.
- Månedlig: Claude rapporterer oppgaver som har vart over to uker uten å bli ferdige — de deles opp eller avsluttes.
---
*Denne guiden er kode-workflowen. For design: Train-lock (`designsystem/train-lock/`). For drift/status: Notion. For metodikk/MORAD: ak-second-brain/Masterbrain.*
