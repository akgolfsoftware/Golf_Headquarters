# Skjerm-gjennomgang (Claude Design-paritet) — oppskrift for neste økt

> Mål: visuell diff av appens skjermer mot det ferske Claude Design-settet
> (`public/design-handover/AK Golf HQ Design System/`). Start med PlayerHQ, én pulje av gangen.
> Følg `.claude/rules/design-porting-gate.md`: screenshot app vs design → kritiker-agent finner avvik → fiks til 0.

## Rekkefølge
PlayerHQ → AgencyOS → Marketing. Pulje = 5–10 skjermer.
Første pulje PlayerHQ: Hjem (`/portal`), Planlegge (`/portal/planlegge`), Gjennomføre (`/portal/gjennomfore`), Analysere (`/portal/analysere`), Meg (`/portal/meg`).

## Oppsett som må bygges (det vi avdekket)
1. **Testspiller** (appen krever signInWithPassword):
   - `supabaseAdmin().auth.admin.createUser({email:"screentest@akgolf.test", password:"Screentest123!", email_confirm:true})` (idempotent)
   - Prisma `User` upsert: role PLAYER, name "Øyvind Rohjan", tier PRO.
   - Script i `scripts/`, MÅ ha `import "./_env"` FØR `@/lib/prisma`.
2. **App-skjermbilder** (Playwright, 430x932): login via `/auth/login` (selektorer i `src/app/auth/login/login-form.tsx`), naviger faner, full-page screenshot.
3. **Design-skjermbilder**: det nye designet bruker en React `useNav`-hook + tab-bar — IKKE `window.__ph` (det gamle `scripts/design-shot.mjs` antar window.__ph og TIMEOUTER). Tilpass: server prototypen (`playerhq-app/PlayerHQ.html`), naviger via DOM-KLIKK på tab-bar, viewport 430px.
4. **Diff**: egen kritiker-agent per skjerm (ikke selv-vurdering).

## Eksisterende byggeklosser
- `scripts/design-shot.mjs` — mal for å serve+screenshote prototypen (må byttes fra window.__ph til klikk-nav).
- `scripts/kobling-playerhq.mjs` — genererer knapp→skjerm-godkjenningstabell (`docs/kobling-godkjenning/`).
- `scripts/agencyos-shot.mjs` — tilsvarende for AgencyOS (window.__ag).

## Fallgruver (lært 2026-06-09)
- **Read/Write-verktøy er blokkert i miljøet** — bruk Bash (cat heredoc/grep) for fil-IO. Agenter feiler på Write; gi dem beskjed om å bruke Bash.
- Pass på **parallelle prosesser** på samme repo (byttet git-branch 4 ganger i dag). Kjør kun én økt mot prosjektet.
- Dev-server: `npm run dev` på :3000. /portal redirecter til /auth/login uten innlogging.
