# OBLIGATORISK LES FØRST
`docs/platform/AGENT-BRIEF.md` — full plattformkontekst på 5 min. Les dette før du rører en eneste fil.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Master-skjermplan — les FØR skjerm-arbeid
`docs/MASTER-SKJERMPLAN.md` er den autoritative lista over alle skjermer i appen + status (Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker). Før du bygger/endrer/kobler en skjerm: finn raden, jobb mot den, oppdater hakene i samme commit. Ingen skjerm er ferdig før alle 6 er grønne. Alt Claude Design har tegnet skal kobles — sjekk drop-off-lista.

# Enkelhet (LÅST 2026-07-21)
Behold alle funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å forstå = feil design. Se `docs/design-system/FASIT.md` §3.

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

### Test-innlogging (for portal/admin end-to-end)
Seed lager Prisma-brukere med placeholder-`authId`. For å logge inn må en Supabase Auth-bruker kobles: opprett auth-bruker via service-role (`supabase.auth.admin.createUser`, `email_confirm:true`) og sett `UPDATE public.users SET "authId"=<uuid> WHERE email=...`. Etablert test-coach: **anders@akgolf.no / Passord123!** (rolle COACH → lander på `/admin/agencyos`).

### GOTCHA: CSP blokkerer nettleser-auth mot lokal Supabase
`src/proxy.ts` `buildCsp()` hardkoder `connect-src ... https://*.supabase.co` og har ingen env-hook. Nettleseren blokkerer derfor `supabase-js`-login mot `http://127.0.0.1:54321` («Failed to fetch»). Ikke endre app-koden for å fikse dette i en setup-jobb. For UI/e2e-login lokalt: kjør Playwright med `bypassCSP: true` (samme rammeverk som repoets e2e), eller bruk en ekte hostet Supabase. Server-side render, Prisma-data og offentlige sider (`/`, `/booking`, `/stats`) fungerer uten dette.

### GOTCHA: ikke source `.env.local` inn i shellen før `npm test`
Enhetstestene leser `process.env` direkte. `NEXT_PUBLIC_APP_URL=http://localhost:3000` fra `.env.local` får `src/lib/security/same-origin.test.ts` til å feile (forventer default `https://akgolf.no`). Kjør `npm test` i et rent miljø.

### Porter
App `3000` · Supabase API `54321` · Postgres `54322` · Studio `54323` · Mailpit `54324`.
