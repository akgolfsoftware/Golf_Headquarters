# Isolert testdatabase

Denne oppskriften gjelder bare en tom, lokal Cursor Cloud-VM. Den gjelder aldri den hostede databasen, eksisterende data eller `.env.local` på Anders sin Mac. Miljøet og kommandoene er ikke kjørt som del av oppryddingen 10.09.2026.

## Cursor Cloud specific instructions

Standard-kommandoene (dev/build/lint/test/verify) står i `CLAUDE.md` → «Kommandoer». Under er kun det som er ikke-åpenbart for å kjøre appen i Cursor Cloud-VM-en (ingen hostet Supabase / ingen secrets).

### Database + auth = lokal Supabase-stack (Docker)
Repoet har ingen `supabase/`-config og bruker normalt hostet Supabase. I VM-en kjører vi en **lokal Supabase-stack** (Postgres + GoTrue Auth + Storage) via Supabase CLI + Docker. Oppdaterings-scriptet (`npm ci`) installerer KUN npm-avhengigheter — tjenester må startes manuelt:

1. Start Docker-daemon (kjører ikke automatisk ved boot): `sudo dockerd > /tmp/dockerd.log 2>&1 &` og gjør soketen tilgjengelig for `ubuntu`: `sudo chmod 666 /var/run/docker.sock`.
2. Start stacken: `cd /home/ubuntu/supabase-local && supabase start`. Gir API på `54321`, Postgres på `54322`, Studio `54323`, Mailpit `54324`. Data ligger i Docker-volumer og overlever restart av stacken.
3. `.env.local` i repo-roten peker på denne stacken (Supabase-URL/nøkler + `DATABASE_URL`/`DIRECT_URL` mot `127.0.0.1:54322`, `BOOKING_ACTIVE=true`). Filen er gitignored og røres ALDRI av agent-fil-verktøy (blokkert av `.claude/hooks`). Mangler den, må den gjenskapes fra `supabase start`-outputen + `.env.example`.

### Skjema provisjoneres med `prisma db push`, IKKE `migrate deploy`
`prisma/migrations/0_baseline` er en placeholder (`SELECT 1;`) — ekte skjema ble påført hostet Supabase direkte, så migrasjonshistorikken kan IKKE bygge en tom DB fra bunn (senere migrasjoner feiler med f.eks. `type "UserRole" does not exist`). For en fersk lokal DB:
```
npx prisma db push --accept-data-loss   # skaper alle tabeller/enums fra schema.prisma
npm run db:seed                          # locations, service-typer, coacher, grupper, spillere
```
RLS-policyer fra migrasjonene påføres ikke av `db push`, men Prisma kjører som `postgres`-superuser og bypasser RLS lokalt — greit for dev.

### Test-innlogging

Opprett kun syntetiske testbrukere i den isolerte databasen. Bruk et unikt lokalt testpassord; ikke gjenbruk historiske passord fra Git. Koble Auth-brukerens UUID til `users.authId`. Ingen ekte spillerdata skal kopieres hit.

### GOTCHA: CSP blokkerer nettleser-auth mot lokal Supabase
`src/proxy.ts` `buildCsp()` tillater i dev `connect-src` mot origin fra `NEXT_PUBLIC_SUPABASE_URL` (pluss localhost/127.0.0.1). Sett den til Tailscale-IP-en når du åpner appen fra egen maskin, f.eks. `http://100.115.94.1:54321` — **server-side** `DATABASE_URL`/`DIRECT_URL` skal fortsatt peke på `127.0.0.1:54322` på VM-en. Uten dev-CSP-tillegget får nettleseren «Failed to fetch» ved login mot lokal Supabase.

### GOTCHA: ikke source `.env.local` inn i shellen før `npm test`
Enhetstestene leser `process.env` direkte. `NEXT_PUBLIC_APP_URL=http://localhost:3000` fra `.env.local` får `src/lib/security/same-origin.test.ts` til å feile (forventer default `https://akgolf.no`). Kjør `npm test` i et rent miljø.

### Porter
App `3000` · Supabase API `54321` · Postgres `54322` · Studio `54323` · Mailpit `54324`.
