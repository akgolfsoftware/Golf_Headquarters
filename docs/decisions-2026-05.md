# Produktbeslutninger — 2026-05-14

Røde flagg fra Boris ultra-review (`docs/ultra-review-2026-05.md`) avklart med Anders.

---

## H1 — Helse-data: dedikert `HealthEntry`-modell

**Valg:** Ny Prisma-tabell

**Begrunnelse:**
- Søkbart og historiserbart for fremtidig AI-coach
- Fjerner `@ts-expect-error` i `helse-form.tsx`
- Forberedt for tidslinje + trend-grafer

**Implementering:**
```prisma
model HealthEntry {
  id         String   @id @default(cuid())
  userId     String
  date       DateTime @db.Date
  restingHr  Int?
  sleepHours Float?
  weightKg   Float?
  notes      String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, date])
  @@index([userId, date])
}
```

**Migrering:** kjøres som tom tabell (ingen eksisterende data å bevare i preferences-JSON).

---

## H2 — `CoachingSession.messages`: behold JSON

**Valg:** Behold JSON-blob for V1

**Begrunnelse:**
- Atomic guard på plass (commit `ed8dd29`, Serializable + retry)
- Volum lavt (typisk 5–30 meldinger/sesjon)
- Migrering til `Message`-tabell er 4–6 timer arbeid uten gevinst per nå

**Re-evaluering:** når én sesjon har >50 meldinger eller paginering trengs.

---

## H3 — Plassholder-sider: feature-flag

**Valg:** Env-variabler styrer synlighet

**Begrunnelse:**
- Sider med TODO-data skal skjules for brukere før data finnes
- Lar oss skru på når data er klart, uten kode-endringer

**Implementering:**
```env
# .env.example
NEXT_PUBLIC_FEATURE_LEADERBOARD=false
NEXT_PUBLIC_FEATURE_TRACKMAN_DETAIL=false
NEXT_PUBLIC_FEATURE_TALENT=false
```

**Berørte sider:**
- `/portal/mal/leaderboard` → 404 hvis flag = false, sidebar-lenke skjult
- `/portal/mal/trackman/[id]` → 404 hvis flag = false
- `/admin/talent/*` → 404 hvis flag = false, sidebar-gruppe skjult

**Helper:** ny `src/lib/features.ts` med `isFeatureOn(name)`-funksjon.

---

## H4 — Test-minstekrav: pengepaths + auth-guards

**Valg:** Snevert minstekrav for V1

**Begrunnelse:**
- Maksimal beskyttelse mot kritiske bugs uten over-investering
- 80% dekning er ikke realistisk uten 1 uke arbeid

**Påkrevd før launch:**
- 3 E2E Playwright-tester:
  - drop-in booking → Stripe-checkout
  - credit-booking + avbestilling med credit-tilbake
  - auth-guard på `/admin/*` for ikke-autoriserte
- 1 unit-test for Stripe webhook signaturverifisering
- Eksisterende: rate-limit fallback + plan-template-schema (8 tester grønne)

**CI:** Playwright kjøres på hver PR via `.github/workflows/ci.yml`.

---

## Re-evaluering

Disse beslutningene re-vurderes:
- Etter V1 launch (3 mnd) — er volumet vokst slik at H2 trenger ny tabell?
- Når feature-flag-sider får data — skru av flag og verifiser
- Hvis vi får pengetap-bug — øk test-dekningen umiddelbart

---

*Logget 2026-05-14. Implementering pågår i påfølgende commits.*
