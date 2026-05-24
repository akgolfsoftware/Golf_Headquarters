# Datasikkerhets-audit — Runde 2 (komplementær til runde 1)

**Dato:** 2026-05-24
**Reviewer:** Claude Opus 4.7 + 5 nye spesialiserte agenter
**Scope:** Klasser av sårbarheter som IKKE ble dekket i runde 1
**Status:** **2 nye KRITISKE funn + 8 nye HØY-prioritet funn**

---

## 1. Sammendrag — nye kritiske funn

| # | Område | Alvorlighet | Estimat |
|---|---|---|---|
| **K-6** | **Next.js 16.2.4 har 6 HIGH CVE-er** (SSRF CVSS 8.6, middleware bypass CVSS 8.1) → upgrade til 16.2.6 | KRITISK | 30 min |
| **K-7** | **Open redirect i OAuth-callback** — `?next=https://evil.com` fungerer som phishing-vektor | KRITISK | 30 min |
| **K-8** | **`dangerouslySetInnerHTML` på DB-data** i workbench-modaler (3 steder) — XSS hvis coach-konto kompromitteres | KRITISK | 1 t |
| **H-7** | **`signOut()` uten global scope** — tapte enheter beholder tilgang via andre sessions | HØY | 5 min |
| **H-8** | **`notion-sync/route.ts:15` invertert CRON_SECRET-guard** — tom secret = fri passasje i prod | HØY | 5 min |
| **H-9** | **66/96 server-actions mangler zod-validering** — DoS via 10 MB-input + bryter CLAUDE.md-regel | HØY | 6-8 t |
| **H-10** | **Notion OAuth-callback mangler CSRF state-validering** (Google Cal gjør det riktig) | HØY | 30 min |
| **H-11** | **MCP Bearer-token uten rate-limit** — brute-force på korte API-keys | HØY | 30 min |
| **H-12** | **`cancelBooking` setter status CANCELLED selv om Stripe-refund feiler** — bruker tror pengene kommer | HØY | 1 t |
| **H-13** | **Booking race condition** — dobbel-klikk → 2 PENDING for samme slot (ingen DB-unique) | HØY | 1 t |
| **M-8** | **4 `href={url}` fra DB uten `javascript:`-sjekk** (videoUrl, dokumenter, ressurser, drill) | MEDIUM | 1 t |
| **M-9** | **Email enumeration på signup** — "E-post finnes allerede" lar angriper kartlegge konti | MEDIUM | 15 min |
| **M-10** | **PII-sanitering mangler i `error-tracking.ts`** — rå meta logges til Vercel + Slack | MEDIUM | 1 t |
| **M-11** | **`as unknown`-cast i `recordInvoice:220`** skjuler Stripe-type-feil | LAV | 30 min |

**Sum nye fixes: ~14 t.** Lagt til Sprint S → total: **~44 t (5-6 dager).**

---

## 2. KRITISKE funn — detaljer

### K-6. Next.js 16.2.4 → 16.2.6 (sikkerhetspatcher)

**Estimat: 30 min** · Kilde: `npm audit`

`next@16.2.4` har **6 HIGH** + **4 MODERATE** + **2 LOW** kjente CVE-er. De alvorligste:

| CVE | CVSS | Tittel |
|---|---|---|
| GHSA-c4j6-fc7j-m34r | 8.6 | SSRF via WebSocket upgrades |
| GHSA-492v-c6pp-mqqv | 8.1 | Middleware/Proxy bypass via dynamic route params |
| GHSA-267c-6grr-h53f | 7.5 | Middleware/Proxy bypass via segment-prefetch routes |
| GHSA-26hh-7cqf-hhc6 | 7.5 | Segment-prefetch bypass (follow-up) |
| GHSA-mg66-mrh9-m8jx | 7.5 | DoS via connection exhaustion (Cache Components) |
| GHSA-8h8q-6873-q5fj | 7.5 | DoS med Server Components |
| GHSA-ffhc-5mcf-pf4q | 4.7 | **XSS i CSP nonces** (særlig ironisk — vi planlegger CSP med nonce!) |

I tillegg: `fast-uri ≤3.1.1` med CVSS 7.5 host confusion.

**Fix:**
```bash
npm install next@^16.2.6 fast-uri@latest
npm install              # regenerate lockfile
npm run build            # verify
```

I `package.json`: bytt `"next": "16.2.4"` → `"next": "^16.2.6"` så future patches hentes automatisk.

### K-7. Open redirect i OAuth-callback

**Estimat: 30 min** · Kilde: agent 3 + 5

**Fil:** `src/app/api/auth/oauth-callback/route.ts:10,75` + `src/app/auth/login/login-form.tsx:30,38`

```ts
const next = url.searchParams.get("next") ?? "/portal";
return NextResponse.redirect(new URL(next, url.origin));
```

`new URL("https://evil.com", origin)` returnerer `https://evil.com` (ikke relativ). Magic-link med `?next=https://phishing.no` lander bruker på angriper-side etter login.

**Fix:**
```ts
const raw = url.searchParams.get("next") ?? "/portal";
const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/portal";
return NextResponse.redirect(new URL(next, url.origin));
```

### K-8. `dangerouslySetInnerHTML` på DB-data

**Estimat: 1 t** · Kilde: agent 1 + 3 (samme funn)

**Fil:** `src/app/portal/(fullscreen)/tren/workbench-modaler.tsx:3429,3438,4312`

`ev.focus` og `ev.goal` er textarea-felter fra coach-UI som rendres direkte via `dangerouslySetInnerHTML`. Type er `string` uten sanitering. Kompromittert coach-konto kan plante stored XSS mot alle spillere som ser planen.

**Fix-alternativer:**
1. **Trygt:** Bytt til `{ev.focus || "—"}` (ren tekst) — hvis HTML-formatering ikke er nødvendig
2. **Hvis HTML trengs:** Installer `dompurify` + `@types/dompurify`, wrap med `DOMPurify.sanitize()` server-side ved lagring (ikke ved rendering)

---

## 3. HØY-prioritet — detaljer

### H-7. `signOut()` uten global scope

**Estimat: 5 min** · Kilde: agent 5

**Fil:** `src/lib/auth/logout.ts:8`

```ts
await supabase.auth.signOut();  // default 'local'
```

Tapte/stjålne enheter behold tilgang via andre sessions. **Fix:**
```ts
await supabase.auth.signOut({ scope: 'global' });
```

### H-8. Invertert CRON_SECRET-guard

**Estimat: 5 min** · Kilde: agent 2

**Fil:** `src/app/api/cron/notion-sync/route.ts:15`

```ts
if (process.env.CRON_SECRET && auth !== expectedAuth)  // FEIL: tom secret = passering
```

**Fix:**
```ts
if (!process.env.CRON_SECRET || auth !== expectedAuth)  // RIKTIG: tom secret = avvis
  return new NextResponse("Unauthorized", { status: 401 });
```

### H-9. Zod-validering mangler i 66 server-actions

**Estimat: 6-8 t** · Kilde: agent 3

Av 96 `actions.ts`-filer bruker kun 30 zod. Eksempel:
- `src/app/portal/meg/profil/rediger/actions.ts` — `name`, `phone`, `homeClub`, `ambition` har ingen `max()`. Bruker kan sende 10 MB.
- Av 40 API-routes bruker kun 8 zod.

**Fix:** Lag delt `lib/validation/schemas.ts` med vanlige skjemaer (`emailSchema`, `phoneNorwaySchema`, `shortTextSchema = z.string().max(200)`). Migrer actions inkrementelt, start med profil, kontakt, booking, plan.

### H-10. Notion OAuth-callback mangler CSRF state

**Estimat: 30 min** · Kilde: agent 5

**Fil:** `src/app/api/notion/oauth/callback/route.ts`

Google Calendar-callbacken gjør det riktig med HMAC-signert state (`src/app/api/google-calendar/callback/route.ts:36-55`). Bruk samme mønster på Notion.

### H-11. MCP Bearer-token uten rate-limit

**Estimat: 30 min** · Kilde: agent 5

**Fil:** `src/lib/mcp/auth.ts`

`authenticateMcpRequest()` har ingen rate-limit. Brute-force-risiko mot korte API-keys. **Fix:** Legg til `rateLimit()` keyed på IP, throw 429 etter 10 feilforsøk per minutt.

### H-12. `cancelBooking` ignorerer Stripe-refund-feil

**Estimat: 1 t** · Kilde: agent 4

**Fil:** `src/app/portal/meg/bookinger/actions.ts:33-45`

Hvis `stripe.refunds.create` kaster, settes booking til CANCELLED likevel og bruker får "Refusjon underveis"-melding. **Fix:** Throw på Stripe-feil ELLER legg til `refundStatus: "PENDING" | "FAILED"` på Booking-modellen.

### H-13. Booking race condition

**Estimat: 1 t** · Kilde: agent 4

**Fil:** `src/app/(marketing)/booking/[slug]/bekreft/actions.ts:43-98`

Ingen DB-unique på `(serviceTypeId, startAt, coachId)`. Race-vindu mellom `isSlotStillAvailable` og INSERT. **Fix:**
```prisma
@@unique([serviceTypeId, startAt, coachId])
```
+ catch Prisma `P2002` i `createBookingCheckout` og returner brukervennlig feil.

---

## 4. MEDIUM — kortform

| # | Fil + linje | Fix |
|---|---|---|
| M-8 | `ShotAnnotationPopover.tsx:216`, `dokumenter/page.tsx:111`, `drill-detail.tsx:142`, `talent/ressurser/page.tsx:276` | Lag `safeUrl()` util som krever `https://` prefix på DB-URL-er |
| M-9 | `src/app/auth/signup/signup-form.tsx:283` | Returner nøytral melding: "Hvis e-posten ikke er i bruk, kan du registrere deg" |
| M-10 | `src/lib/error-tracking.ts` | PII-sanitering på `meta`-felt før logging — strip `email`, `password`, `token`, `dateOfBirth`, `phone` |
| M-11 | `src/lib/payments/record.ts:220` | Bytt `as unknown` til korrekt `Stripe.Invoice`-type-guard |

---

## 5. RENT — verifisert OK i denne runden

- **0 raw Prisma queries** (`$queryRawUnsafe` etc.)
- **0 `eval(`**, **0 `new Function(`**, **0 runtime `child_process`**
- **0 markdown-rendering** (`react-markdown`, `marked`, `remark` ikke i deps)
- **0 fs/path-traversal** med user-input
- **0 iframes** med dynamisk src
- **0 PAN/CVV** gjennom backend (kun tokenized Stripe-IDs)
- **0 hardkodede live secrets** (Stripe demo-tokens er obfuskert, test-files merket dummy)
- **Stripe webhook signature verifisert korrekt** (raw body + `constructEvent`)
- **Pris hentes server-side fra DB** (ingen client-manipulasjon mulig)
- **24t-refund-regel håndheves server-side**
- **Credits bruker atomisk transaction** (`where: { creditsRemaining: { gt: 0 } }`) — double-spend-sikker
- **`ApiKey`-modellen er solid** (SHA-256 hash, revoke, expires)
- **Google Calendar OAuth-callback** har korrekt HMAC state-validering (referanse for Notion-fix)
- **Glemt-passord-flyten OK** (nøytral melding via Supabase)
- **`.env.local.backup-*` IKKE i git-historikk** (kun `.env.example` listet)
- **Vercel auto-injecter Supabase cookies med HttpOnly+Secure+SameSite=Lax** (men appkoden setter ikke eksplisitt — biblioteksrisiko ved oppgradering)

---

## 6. Nye CLAUDE.md-regler foreslått

Legg disse til prosjektets `CLAUDE.md` under "Kjente gotchas":

1. **`dangerouslySetInnerHTML` forbudt på DB-data.** Eneste lovlige unntak: `JSON.stringify` for JSON-LD-tagger og statisk HTML fra designverktøy. For DB-strenger: bruk `{verdi}` plain text eller `DOMPurify.sanitize()` server-side ved lagring.

2. **`next`-param fra query-string MÅ valideres mot open-redirect.** Bruk: `const safe = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/portal"`. `new URL(next, origin)` er IKKE tilstrekkelig.

3. **`supabase.auth.signOut()` skal alltid kalles med `{ scope: 'global' }`** i produksjonskode.

4. **Alle cron-route-handlers MÅ bruke `if (!process.env.CRON_SECRET || auth !== expected)`.** Aldri det inverterte mønsteret.

5. **OAuth-callbacks MÅ validere HMAC-signert state-parameter mot CSRF.** Bruk Google Calendar-callbacken som referanseimplementasjon.

6. **Refund-flows: ekstern feil → ikke endre status stille.** Enten throw eller lagre `refundStatus: FAILED` for manuell oppfølging.

7. **Server-actions MÅ validere alle input-felter med zod.** Bruk `lib/validation/schemas.ts` for delte skjemaer. Aldri ta raw `string` uten `max()`-grense.

---

## 7. Oppdatert Sprint S — komplett liste (runde 1 + runde 2)

### Dag 0 — Sikkerhetspatcher (1 t):
- [ ] **S-0** `npm install next@^16.2.6 fast-uri@latest` + `npm run build` (K-6)

### Dag 1 — Kvikke kritiske fixes (~5 t):
- [ ] **S-1** `import "server-only"` i 5 filer (K-3 runde 1) — 15 min
- [ ] **S-2** Fiks `throw err` i `admin/messages/actions.ts:98` — 30 min
- [ ] **S-3** RLS på `error_logs`, `webhook_failures`, `test_sessions` — 30 min
- [ ] **S-4** CSRF origin-validering på 3 POST-routes — 1 t
- [ ] **S-5** AdminShell → eksplisitt `requirePortalUser` — 1 t
- [ ] **S-7a** Open-redirect-fix i oauth-callback + login-form (K-7) — 30 min
- [ ] **S-7b** `signOut({ scope: 'global' })` (H-7) — 5 min
- [ ] **S-7c** Fiks invertert CRON_SECRET-guard i notion-sync (H-8) — 5 min

### Dag 2 — Headers + rate-limit + XSS (~7 t):
- [ ] **S-6** CSP i `next.config.ts` med nonce (K-4) — 2 t
- [ ] **S-8** Rate-limit på 7 høyrisiko-routes + MCP-rate-limit (H-2 + H-11) — 4 t
- [ ] **S-9** Sanitiser `dangerouslySetInnerHTML` i workbench-modaler (K-8) — 1 t

### Dag 3 — RLS + Booking-race (~9 t):
- [ ] **S-10** RLS-policies på 10 sensitive deny-all tabeller — 6-8 t
- [ ] **S-11** 4 INSERT-policies WITH CHECK — 30 min
- [ ] **S-12** Booking DB-unique + race-fix (H-13) — 1 t

### Dag 4 — GDPR + cookie + zod-validering (~12 t):
- [ ] **S-13** DOB-steg + guardian-consent-gate (K-1) — 5 t
- [ ] **S-14** Cookie-banner v1 (K-5) — 2 t
- [ ] **S-15** MIME magic-bytes + chunk-grense — 2 t
- [ ] **S-16** Zod-validering på topp 20 server-actions (H-9 delvis) — 3 t

### Dag 5 — Verifisering + dokumentasjon (~8 t):
- [ ] **S-17** Behandlingsregister + fjern Utkast-banner + DPO (H-5) — 3 t
- [ ] **S-18** Notion OAuth CSRF state (H-10) — 30 min
- [ ] **S-19** `cancelBooking` refund-failure-håndtering (H-12) — 1 t
- [ ] **S-20** PII-sanitering i error-tracking (M-10) — 1 t
- [ ] **S-21** `safeUrl()` util + email-enum-fix + recordInvoice-typing (M-8, M-9, M-11) — 1 t
- [ ] **S-22** `scripts/security-lint.sh` + CI-integrasjon — 2 t
- [ ] **S-23** Re-kjør runde 1 + 2 audit-pipeline for å verifisere

**Sum: ~42-44 t intern + 1 advokat-time = ~5-6 kalenderdager.**

---

## 8. Etterslep (post-launch, ikke blokkerende)

- M-2: Cron for `processPendingFailures()` (P3) — 30 min
- M-3: Utvid `auditLog()` til admin/spillere, coaching, okonomi — 2 t
- M-4: Sentry-integrasjon (J4) — 2 t
- M-5: DPIA-dokument for AI-coaching — 4 t
- M-6: Penetrasjonstest (ekstern) — kjøp inn
- M-7: Vipps Login + Signering (Fase 2) — 12-16 t
- H-9 forts: Zod på resterende 46 server-actions — 4-6 t
- M-1: RLS-policies på resterende 45 deny-all tabeller — 6 t
- `.npmrc` med `engine-strict=true` — 5 min
- Rydd `.worktrees/`-lockfiler — 15 min
- `googleapis`-pakke: vurder slankere subset — 2 t
- Dokumenter Supabase cookie-defaults — 15 min
- Idempotency på Stripe event.id (ProcessedWebhookEvent-tabell) — 2 t
- Cron rydder PENDING via Stripe-session-retrieve i stedet for kun varsel — 1 t
