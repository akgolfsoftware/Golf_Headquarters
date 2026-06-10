# Database-drift — ryddeplan

> Kode (`prisma/schema.prisma`) og live-databasen (Supabase) har drevet fra hverandre på 9 tabeller.
> **2 brekker faktisk i dag. 7 er kosmetiske.** Alt rettes med NULL datarisiko ved å tilpasse
> schema til databasen (`@map`) — appen kjører allerede, så databasen er sannheten.
> Opprettet 2026-06-09. Ingenting er endret ennå.

## ⛔ IKKE GJØR (før fiksene under er gjort)
Ikke kjør `prisma migrate dev`, `migrate deploy` eller `db push` mot prod ennå.
Den fulle auto-migrasjonen inneholder `DROP TABLE "fys_ovelse_rader"` → **datatap**.

---

## De 2 som faktisk brekker (navne-mismatch — klienten spør etter noe DB ikke har)

### 1. `push_subscriptions` — web-push-varsler
- **Avvik:** DB har snake_case-kolonner (`user_id`, `user_agent`, `created_at`, `last_used_at`)
  fra håndskrevet migrasjon `20260525010000_push_subscription`. Schema bruker camelCase UTEN `@map`.
- **Konsekvens:** push-skriving/-lesing feiler i prod nå.
- **Fiks (null risiko) — i `model PushSubscription`:**
  ```prisma
  userId     String    @map("user_id")
  userAgent  String?   @map("user_agent")
  createdAt  DateTime  @default(now()) @map("created_at")
  lastUsedAt DateTime? @map("last_used_at")
  ```

### 2. `fys_ovelse_rader` — øvelses-rader i en fysisk treningsøkt
- **Avvik:** DB-tabellen heter `fys_ovelse_rader`, men schema sier `@@map("fys_ovelserader")`.
  `migrate diff` foreslår DROP+CREATE → datatap hvis kjørt.
- **Fiks (null risiko) — i `model FysOvelseRad`:**
  ```prisma
  @@map("fys_ovelserader")   →   @@map("fys_ovelse_rader")
  ```

---

## De 7 kosmetiske (ingen reell runtime-effekt)
| Tabell | Avvik | Vurdering |
|---|---|---|
| `tournaments` | `norskeAntall` NOT NULL → nullable | Trygt (default finnes) |
| `bookings` | mangler additiv indeks | Bare ytelse — kan legges til senere |
| `users` | mangler additiv indeks | Bare ytelse |
| `exercise_definitions` | indeks-rename | Kosmetisk |
| `facility_prefs` | FK Prisma re-emitterer | Ren støy, ingen forskjell |
| `plan_sessions` | FK Prisma re-emitterer | Ren støy |
| `fysiske_planer` | FK Prisma re-emitterer | Ren støy |

---

## Anbefalt rekkefølge
1. **Gjør de 2 `@map`-fiksene i schema** (over). Ingen DB-endring, ingen risiko.
2. **Kjør `npx prisma generate`** + `npx tsc --noEmit` + `npm run build` — verifiser grønt.
3. **Kjør `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`**
   — nå skal kun de 7 kosmetiske igjen (push + fys borte).
4. **De 7 kosmetiske:** valgfritt. Legg evt. til de 2 additive indeksene som en egen, trygg migrasjon
   senere. FK-«støyen» kan ignoreres.
5. **Mål:** når man er klar, lag ÉN ryddig migrasjon for restene slik at `migrate diff` blir helt tom.

## Presedens
Samme `@map`-tilnærming er brukt før i repoet (commit `8b5af262`). Ingen ny risiko.

## Verifisering (når ferdig)
`npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma` skal være TOM.
