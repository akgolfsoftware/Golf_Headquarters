# Preview-deployene bygger ikke — `DIRECT_URL` mangler i Preview-miljøet

**Skrevet 10.08.2026** som overlevering til en økt på MacBook Air. Alt du trenger står her.
**Produksjon er IKKE rammet.** Ingen hast for brukerne — men skjermbilde-gaten i designporten
står stille til dette er løst.

---

## Symptomet

Hver PR får rød Vercel-sjekk. CI-gaten (`verify`) er grønn på de samme commitene.

| PR | Head | Preview | Produksjon etter merge |
|---|---|---|---|
| #386 galleri | `ab58229` | ERROR | READY |
| #387 Analyse | `7377bbe` | ERROR | READY |
| #388 Konsoll | `5f03baa` | ERROR | READY |
| #389 Innboks | `6e2ea2e` | ERROR | — (ikke merget) |

Mønsteret er entydig: **alle preview-deployer feiler, alle produksjonsdeployer går gjennom.**
Siste grønne prod-bygg er `dpl_9gortAXEZHUspupptpBmL4Xi1A7Z` (main `bf69ca9`, 09:04).

## Rotårsaken

Fra byggeloggen (`dpl_JDCT3yNscVAUhEjYTKvXUK72NT5w`):

```
09:12:53  Failed to load config file "/vercel/path0" as a TypeScript/JavaScript module.
          Error: PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL.
09:12:53  npm error command failed
09:12:53  npm error command sh -c prisma generate
09:12:53  Error: Command "npm install" exited with 1
```

Kjeden:

1. `package.json` har `"postinstall": "prisma generate"` — den kjører under `npm install`,
   altså **før** byggesteget.
2. `prisma generate` laster `prisma.config.ts`.
3. `prisma.config.ts` har `datasource: { url: env("DIRECT_URL") }`. Prisma 7 sin `env()` kaster
   hvis variabelen ikke finnes — den har ingen fallback.
4. `.env.local` finnes ikke på Vercel (den er gitignored), så verdien må komme fra prosjektets
   miljøvariabler.
5. **`DIRECT_URL` er satt for Production, men ikke for Preview.** Derfor: prod bygger, preview dør
   på `npm install`.

Sannsynlig opphav: da secrets ble rotert under prod-incidenten 05.08 (`docs/runbook.md` §2.5,
gotcha «IPv6-only»), ble `vercel env rm` + `add` kjørt mot **production**. Preview fikk aldri de
nye verdiene. Det ble ikke oppdaget fordi nattens sign-off-galleri ble kjørt mot `localhost:3000`,
ikke mot en preview.

---

## Fiks 1 — gi Preview de samme miljøvariablene (dette løser feilen)

**Raskeste vei, i nettleseren:** Vercel → prosjekt `akgolf-hq` → Settings → Environment Variables.
Hver variabel har avkryssing for Production / Preview / Development. Kryss av **Preview** på de
variablene som mangler den. Start med `DIRECT_URL` og `DATABASE_URL`.

**Eller fra terminalen på Mac-en:**

```bash
cd ~/…/akgolf-hq
vercel link                 # hvis .vercel/ mangler
vercel env ls               # se hvilke miljøer hver variabel gjelder for
```

Se etter variabler som står med bare `Production` i miljø-kolonnen. Sett dem for preview uten å
eksponere verdien i shell-historikken (mønster fra gotchas):

```bash
printf '%s' "$DIRECT_URL_VERDI" | vercel env add DIRECT_URL preview
printf '%s' "$DATABASE_URL_VERDI" | vercel env add DATABASE_URL preview
```

**Verifiser verdien FØR du setter den** — spar en deploy-runde:

```bash
node -e '
const {Client} = require("pg");
const c = new Client({connectionString: process.env.DIRECT_URL});
c.connect().then(()=>c.query("select 1")).then(r=>{console.log("OK",r.rows);process.exit(0)})
 .catch(e=>{console.error("FEIL",e.message);process.exit(1)});'
```

Verdiene skal peke på **Shared pooler (Supavisor)**, ikke `db.<ref>.supabase.co` — den er IPv6-only
og nås aldri fra Vercel (gotcha 05.08.2026):

- host: `aws-1-eu-west-2.pooler.supabase.com` (verifiser klyngeindeksen med `dns.resolve4`)
- bruker: `postgres.<project-ref>` — ikke bare `postgres`
- `DATABASE_URL` = transaction mode, port **6543**
- `DIRECT_URL` = session mode, port **5432**

### Ikke bare disse to

Bygget kommer forbi `npm install` med `DIRECT_URL` alene, men previewen blir ubrukelig for
skjermbilder hvis auth mangler. Sjekk at hele settet gjelder Preview:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` (hvis brukt), pluss det `src/lib/env.ts` validerer.

### Én ting å bestemme

Preview vil da snakke med **produksjonsdatabasen**. Det er slik det var før, og det er det
sign-off-galleriet trenger (ekte data å fotografere). Men det betyr at en klikk-verifisering i en
preview skriver til prod. Alternativet er en Supabase-branch som egen preview-DB — mer arbeid, og
da må previewen seedes for å ha noe å vise. **Din avgjørelse.** Anbefaling: samme DB nå, så porten
kommer videre; egen preview-DB som eget spor senere.

---

## Fiks 2 — gjør bygget uavhengig av install-tidsmiljøet (så det ikke skjer igjen)

Fiks 1 løser dagens feil, men neste gang en variabel mangler et miljø ryker `npm install` på nytt.
Selve klientgenereringen trenger ikke databasen — den leser bare `schema.prisma`.

Forslag til `prisma.config.ts`:

```ts
// `prisma generate` trenger ikke en ekte tilkobling — den leser bare schema.prisma.
// Uten fallback kaster env("DIRECT_URL") under `npm install`, og hele bygget dør før
// det har begynt (Vercel preview 10.08.2026). CLI-kommandoer som FAKTISK trenger
// databasen (db execute) leser DIRECT_URL direkte og feiler ærlig hvis den mangler.
const direkte = process.env.DIRECT_URL ?? "postgresql://ugyldig:ugyldig@localhost:5432/ugyldig";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: direkte },
});
```

`prisma.config.ts` er **ask-nivå** i `.claude/hooks/beskytt.mjs`, så dette skal ikke gjøres uten at
du sier ja. Vurder også om `postinstall` i det hele tatt skal kjøre `prisma generate` — `build` og
`verify` gjør det allerede som første steg. Argumentet for å beholde den er at et friskt
`npm ci` + `npm test` da virker uten et byggesteg først.

---

## Verifiser at det er løst

```bash
# 1. Ny deploy av gjeldende PR-gren (tom commit holder, eller redeploy fra dashboardet)
git commit --allow-empty -m "chore: trigger preview-deploy" && git push

# 2. Vent på grønn Vercel-sjekk på PR #389, hent preview-URL fra PR-kommentaren

# 3. Kjør skjermbilde-gaten mot previewen
node scripts/signoff-gallery.mjs "PP-2.2" https://<preview-url>
```

Coach-testbrukeren (`coachtest@akgolf.test`) har 1 spiller og ingen bookinger, så flere av
innboks-pillene viser tom tilstand. `scripts/seed-screentest-coach.ts` finnes hvis bildene trenger
innhold.

## Rekkefølge når du setter deg ned

1. `vercel env ls` — bekreft hypotesen (variabler med kun `Production`).
2. Kryss av Preview / `vercel env add … preview` for de som mangler.
3. Tom commit → grønn preview på #389.
4. Kjør galleriet for PP-2.2 og PP-2.1, se skjermene, kryss av eller si fra.
5. Bestem om Fiks 2 skal inn — og om preview skal ha egen database på sikt.

## Hvorfor dette ikke ble sett før

Sign-off-galleriet ble kjørt mot `localhost:3000`. Da beviser det at skjermen ser riktig ut på
maskinen som kjørte det — ikke at appen bygger og kjører der Anders faktisk ser den. Fire PR-er er
merget med rød preview-sjekk uten at noen stoppet opp ved den.

**Regel som følger av dette:** rød Vercel-sjekk på en PR skal leses, ikke antas å være støy — og
skjermbilde-gaten skal kjøres mot previewen, ikke mot localhost. Det er hele poenget med gaten:
Anders skal se skjermen fra telefonen.
