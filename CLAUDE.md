# CLAUDE.md — AK Golf HQ

B2B SaaS (AgencyOS) + forbruker-app (PlayerHQ). Forretningslogikk og UI-tekst: **norsk bokmål**.

Ved konflikt: `docs/ak-master.md` > denne filen — **unntatt design**: for alt design/look vinner Train-lock-beslutningen (25.08.2026, se invariant 2) + `docs/natt/` over ALLE eldre dokumenter, inkludert ak-master. Paper er slettet fra plattformen 30.08.2026 (Anders) — all Paper-tekst i eldre dokumenter er historikk, aldri byggeordre.

---

## Start her (les i denne rekkefølgen)

1. **`docs/MASTERPLAN-GJENSTAAENDE.md`** — DEN gjeldende, eneste plandokumentet: alt gjenstående arbeid, session-tabeller, status, beslutningskø.
2. **`docs/STATUS-NÅ.md`** — levert / ikke levert (løpende snapshot).
3. **`src/lib/domain/workbench/` + `src/lib/workbench/wb-actions.ts`** — koden er fasit for domain/actions. `docs/natt/workbench/` er kontrakt/arkiv (ACCESS-AND-GROUPS.md gjelder fortsatt for tilgang).
4. **`docs/platform/AGENT-BRIEF.md`** — stack, versjoner, mappestruktur.
5. **`docs/platform/BUSINESS-RULES.md`** — abonnement, GDPR, booking (ikke utledbart fra kode).
6. **`.claude/rules/gotchas.md`** — les FØR koding.
7. **`designsystem/train-lock/README.md` + `PORTING.md`** — designfasiten (invariant 2 under) og hvordan en skjerm faktisk porter til kode. Les FØR du bygger eller endrer UI, ikke bare når «design» nevnes eksplisitt.

Ikke les hele repoet. Åpne filer etter behov. Lange kommandoer → redirect til fil, tail/grep.

---

## Nåværende spor

> **RETTET 02.09.2026:** denne seksjonen beskrev tidligere «A1–A4 (bølge 1)» — en
> smoke-test-gate for en tidlig Workbench-leveranse, med et loop-oppsett og branch-/PR-
> referanser (`claude/agency-workbench-uke-ui-c4d2a4`, PR #577/#575). Verifisert: PR #577 og
> #575 er begge lukket uten merge, `docs/STATUS-NÅ.md` bekrefter «Bølge 1 FERDIG i main» og
> «Bølge 2: … inne» allerede fra 28.08.2026, og «session B2» i `docs/MASTERPLAN-GJENSTAAENDE.md`
> som teksten viste til, finnes ikke lenger (kilden — det gamle LAUNCH-PLAN-dokumentet — er
> slettet 30.08). Seksjonen beskrev altså noe fullført for uker siden som om det var dagens
> spor. Fjernet i stedet for rettet, siden innholdet uansett er dødt.

Nåværende spor er alltid det `docs/MASTERPLAN-GJENSTAAENDE.md` viser som gjenstående — se
«Start her» over. Per 02.09.2026: STEG 15 (AgencyOS «én inngang per funksjon») er 12 av 13
rader levert, STEG 17 (Team Norway Workdesk) er i gang, STEG 16 (datagrunnlag/kjønn/måling)
er stort sett ikke startet.

---

## Harde invarianter

1. **Ingen treningsregler** (2026-08-18). Vokabular (pyramide, formel, perioder) er merkelapper. Gjeninnfør aldri metodikk-sperrer uten Anders' beslutning.
2. **Design — Train-lock er fasit for ALLE skjermer i PlayerHQ OG AgencyOS (Anders 25.08.2026).**
   - **Fasiten ligger i repoet: `designsystem/train-lock/`** (196 skjermfiler, sist synket
     26.08 fra zip (6) — les `DESIGN-SYSTEM.md` der først (look-fasit), finn skjermen i
     `SCREEN-INDEX.md`, og bruk `HANDOFF.md` som IA-/beslutningshistorikk. Ved konflikt:
     HANDOFF vinner på struktur, DESIGN-SYSTEM på visuelle verdier. Porting til kode styres
     av `PORTING.md` samme sted). Scene `#000000` (lys-varianter `#FFFFFF`).
   - **AgencyOS:** Train-lock — alle skjermer.
   - **Paper finnes ikke lenger** (slettet 30.08.2026, Anders). Ingen `designsystem/paper/`,
     ingen `T`, ingen `--p-*`, ingen Paper-CSS. `scripts/check-ingen-paper.mjs` i
     `npm run verify` hindrer at det kommer tilbake.
   - **Tokens finnes i kode (D2 løst 25.08, PR #586):** `src/styles/train-lock-tokens.css`
     (`--tl-*`) med TS-speil `src/lib/v2/train-lock.ts` (`TL`, `TL_BREKK`). Bruk dem —
     `T` finnes ikke lenger. Tokenene ligger lys på `:root` og mørk på
     `html[data-v2-tema="dark"]`.
     **Mørk er default på `/portal` og `/admin`** (Anders 25.08.2026) — regelen bor i
     `src/lib/v2/tema-default.ts`, kalt av både rot-layout og `V2Shell`; bryteren
     (`ak-v2-tema`) vinner over defaulten. `/auth` er fortsatt lys (låst PP-A/A4).
     **`/forelder` skal ha BÅDE lys og mørk modus, som resten av produktet (Anders
     26.08.2026)** — forelder-omfangsspørsmålet (T4) er dermed løst: hele forelder-appen
     porter til Train-lock med toggle, ikke bare ett kort. Default (lys/mørk uten cookie)
     er ikke endret av denne beslutningen — kun at begge moduser MÅ virke. Selve
     skjermporten gjenstår (B8 = Player, bølge T = AgencyOS, forelder-porten ubestemt
     session ennå). Marketing/landingssider har egen fasit (ak-golf-website) og omfattes ikke —
     **UNNTAK (Anders 28.08.2026): hele booking-flyten, også `/booking` på marketing, er
     Train-lock (lys variant).** PR #650 porter den; ny booking-kode leser aldri `T`/`--p-*`-verdier
     direkte (broen i `booking-paper.css` peker dem til `--tl-*`).
   - Ingen nye tokens / parallelle designsystemer uten Anders' ja.
   - **Merkelaget ligger OVER (Anders 31.08.2026):** AK Golf-merkevaresystemet
     (`designsystem/ak-golf/`, STEG 18) eier logo, farge, tone, foto, marked og materiell for
     hele konsernet. Det **overstyrer ikke** denne invarianten: Train-lock er fortsatt fasit
     for hver skjerm i PlayerHQ, AgencyOS og Forelder. Konfliktregel — produktskjerm:
     Train-lock vinner · merket: AK Golf vinner · `/team-norway/*`: Claw vinner.
     Ingen skjerm har to fasiter.
   - Fullført = warm `#B85C3D` + hake. `#30D158` **kun** Godta / PUBLISERT-merke.
   - **DO NOT USE — Presis.** Ny skjermkode = `--tl-*` / `TL` (flate, tekst, handling)
     og `AK` fra `src/lib/v2/ak-palett.ts` (domeneverdier: pyramideakser, tee-farger,
     merkefarger). Ikke Presis-skog/lime. Paper er slettet fra repoet 30.08.2026 og
     kan ikke lenger brukes som few-shot — hverken tokens, CSS eller fasitfiler.

---

## Skill-bruk i AK Golf HQ (fast rekkefølge)

Prosjektfakta som styrer alt: Next.js App Router + Prisma/Postgres (Supabase) + Vercel +
Stripe + Anthropic API. Flater: AgencyOS (`/admin`, coach), PlayerHQ (`/portal`, spiller),
Forelderportal (`/forelder`), Marketing (`/`). Designsystem: **Train-lock** — eneste fasit
(se invariant 2). Repoet (`akgolfsoftware/Golf_Headquarters`) er **offentlig** på GitHub
(verifisert 02.09.2026) — behandle all kode som synlig for hvem som helst.

Pluginene/skillene under er installert på prosjektnivå (`.claude/settings.json`,
`enabledPlugins` + `extraKnownMarketplaces`) — de følger med alle økter i dette repoet,
ikke bare denne maskinen.

### Før hver oppgave
1. **superpowers**: brainstorm → skriftlig plan med maks 3 sjekkbare ferdig-punkter → vent
   på OK fra Anders → deretter test-først (TDD). Ingen kode før planen er godkjent. Gjelder
   ikke rene tekst-/docs-endringer. (Dette er samme prinsipp som den globale «nummerert plan,
   vent på godkjenning»-regelen — superpowers gir verktøyene, regelen var allerede fast.)
2. Scope-endring underveis besvares med kostnad (tid/omfang) før den gjøres.

### Under bygging
3. **security-guidance** kjører automatisk (rene vakter — ingen skill å påkalle) på hver
   endring og ved øktslutt. Alt den flagger rettes i samme økt — aldri utsettes. Ekstra krav
   utover default: all spillerdata bak auth-gate og Supabase RLS; ingen PII i logger,
   feilmeldinger eller commits; hemmeligheter kun i env/Supabase-secrets, aldri i kode.
4. Database: **supabase**-pluginet for RLS, policies, storage, edge functions og for å lese
   faktisk skjema før du skriver spørringer — aldri gjett tabell- eller kolonnenavn, slå opp.
   Namespace `me_*` er privat for Anders og røres ikke fra app-koden.
   **`prisma`-pluginet er IKKE en skill for skjema/migrasjoner — det er to MCP-verktøy**
   (Prisma-Local kjører den samme lokale `prisma`-kommandoen som allerede er blokkert for
   dette prosjektet, se `.claude/rules/gotchas.md` §Schema-endringer; Prisma-Remote er for
   Prismas EGEN hostede database «Prisma Postgres», som dette prosjektet ikke bruker — vi
   kjører på Supabase). **Bruk det aldri til `migrate`/`db push` her.** Skjemaendringer følger
   fortsatt kun den kirurgiske `db execute`-oppskriften i gotchas.md.
5. Stripe: **stripe**-pluginet for alt betalingsrelatert. Kun to nivåer — **TALENT** (gratis)
   og **FULL** (299 kr/mnd eller 2 690 kr/år) — ikke «PRO»/«GRATIS», det er ikke navnene
   koden og BUSINESS-RULES.md bruker. Webhooks skal være verifiserte og idempotente. Ingen
   simulatortid selges — booking er kun coachingtjenester.
6. Frontend: **vercel-react-best-practices** (fra vercel-labs, `.claude/skills/`) for
   datahenting, caching, Server/Client Components og ytelse — merk at `vercel`-pluginets
   egen, lettere `react-best-practices`-skill også kjører automatisk på TSX-filer; de to
   utfyller hverandre, ikke motsier. **frontend-design** + **web-design-guidelines** for UI —
   men Train-lock-tokene (`--tl-*`/`TL`) og designsystemet i `designsystem/train-lock/`
   overstyrer ALLTID skillenes egne designvalg, uendret av dette (invariant 2).
   *Uverifisert: en ordliste-fil nevnt som `akordlistegjennomgang.html` finnes ikke i repoet
   per 02.09.2026 — si fra hvor den ligger, så legges riktig sti inn.*
   Én skjerm om gangen mot referansebilde; aldri batch. Lys modus default, mørk modus toggle,
   desktop/iPad/mobil. «Sim 1/2/3» vises aldri i UI.

### Før commit og PR
7. **commit-commands**: checkpoint-commit minst hvert 30. minutt. Ucommittet arbeid ved
   øktslutt = feilet økt. Dette er for hyppige mellom-commits — selve PR-flyten
   (`/pr`-kommandoen + `verify-og-commit`-skillen, som krever grønn `npm run verify`) er
   uendret.
8. **pr-review-toolkit** på hver PR før den merges. Sjekkliste i tillegg til default: ingen
   nye byggevarsler, tsc grønn, ingen nye avhengigheter uten begrunnelse, ingen endring i
   `vercel.json` uten eksplisitt OK. Dette kommer i TILLEGG til — erstatter ikke — den
   eksisterende `npm run verify`-porten, som fortsatt er obligatorisk før merge.
9. **vercel**-pluginet: deploy kun etter grønn review. Ved feil: les faktiske deploy-/
   runtime-logger via pluginets verktøy FØR du endrer kode — ikke gjett.

### Øktslutt
10. Retro i `docs/feillogg.md` (hva gikk galt, hvilket skill burde fanget det).