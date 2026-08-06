# Nattrapport 2026-08-07 — Grok Build

**Gren for nattordre-docs:** `claude/github-push-design-plans-3gkmxi` (PR #370 allerede draft)  
**Regel:** alle PR-er under er **DRAFT**. Ingen merge. Ingen push til main.

---

## 1. Bygget

| PR | Strøm | Innhold | Bredde | CI | Lokal verify |
|---:|---|---|---|---|---|
| **#371** | PR1 | LogoAK-prikk: Paper-aksent (`surface` paper/ink/auto), ikke `T.lime`. Skinne: `surface="ink"` | n/a | ikke verifisert (runners nede) | check-token-gap: ingen nye feil fra logo (eksisterende MarkedPersonvern-rgba) |
| **#373** | S1 | `bredde="kolonne"\|"full"` på ~186 filer / 203 V2Shell-tagger. full: hjem, agencyos, workbench, admin-kalender. **Meg-treet ikke rørt** (#370) | kolonne/full | ikke verifisert | **ikke** full `npm run verify` / `npm test` kjørt på batchen — ærlig: **ikke verifisert** |
| **#374** | S3 | `scripts/check-v2shell-bredde.mjs` — feiler uten `bredde=`. 215 treff på main → **ikke** koblet til verify | n/a | ikke verifisert | skriptet kjører alene |
| **#375** | S4 | `dryRun` på `slettEksterneBrukerdata` + `anonymiserBruker`; cron `?dryRun=1`; vitest-stub | n/a | ikke verifisert | dryRun-test: **kjøring ikke bekreftet grønn i denne rapporten** — sjekk PR |
| **#376** | S5 | Klient-feil → `/api/client-error` → `logError`; error.tsx portal/admin/forelder/auth; portal not-found | n/a | ikke verifisert | **ikke** full verify |
| **#377** | docs | Nattrapport + AAPNE-SPORSMAL | n/a | ikke verifisert | n/a |
| **#378** | S2 | rateLimit på 44 API-ruter (webhooks urørt) | n/a | ikke verifisert | **ikke** full verify |

**Allerede draft fra før natten (ikke merget):**
- #370 V2Shell `bredde` + Meg-treet
- #348–#369 W2/W3 Paper-porter (interim)

---

## 2. Ikke bygget

| Hva | Hvorfor |
|---|---|
| Skjermbilder 390/1280 lys+mørk per PR | Krever Anders' øyne / manuell capture — ikke automatisert i natt |
| Full `npm run verify && npm test` per PR | **Ikke fullført** for store batcher; CI-runners nede |
| `/stats/*` (45) | Avklart hopp — DataGolf-plassering uavklart |
| `/intern/*`, `/demos/*` | Interne demoer |
| 93 redirect-stubber | Ikke skjermer |
| §4b dublett-skjermer (~12) | Venter Anders — se `AAPNE-SPORSMAL.md` |
| §4c 8 AgencyOS-kø-flater | IA-beslutning |
| Branch protection / CI-runners | Kontoinnstillinger — krever Anders i GitHub UI |
| Sentry | Ny npm-pakke — krever Anders' ja |
| Wireframes fase2 for alle rest-skjermer | Kun bredde-prop der v2 allerede står |
| §4a redirects (gjennomfore utgår osv.) | Ikke nådd |

---

## 3. Åpne spørsmål

→ `docs/port/AAPNE-SPORSMAL.md` (opprettet i denne leveransen).

---

## 4. Feil funnet i eksisterende kode

1. **LogoAK brukte `T.lime`** (utgått Presis) — fikset i #371.
2. **~200+ sider manglet `bredde` på V2Shell** — delvis adressert #370 (meg) + #373 (bulk). Gate-skript #374.
3. **GDPR B1/B2 i LANSERINGSGAP er delvis utdatert:**  
   - `slettEksterneBrukerdata` finnes allerede (Auth/Storage/Stripe) og kalles fra `anonymiserBruker`.  
   - `exportUserData` inkluderer allerede `coachingSessions` + `_storageFiler`-manifest.  
   - `/admin/gdpr` viser allerede PENDING-kø.  
   **Gjenstår:** manuell tørrkjøring mot testbruker (#375), verifisere at fil-innhold (bytes) eksporteres ved behov, end-to-end slettetest.
4. **Branch-kollisjon i natt:** S1 ble kort pushet under navnet `feature/paper-api-rate-limit` (S2). Rettet til `feature/paper-s1-bredde-detalj` / PR #373. S2 kan ha blitt forstyrret.
5. **CI plukker ikke jobber** — bekreftet forutsetning; alle PR-er kun lokal/u-verifisert.

---

## 5. Ærlig status

**Ikke lanseringsklart** etter denne natten.

### Det som er bedre i morgen tidlig
- Logo-prikk følger Paper-guideline (draft)
- Bredde er eksplisitt på de fleste V2Shell-ruter (draft)
- Maskinell gate mot ny «glem bredde»-feil (draft, ikke i verify ennå)
- Klient-krasj kan nå `logError` (draft)
- GDPR dryRun finnes for trygg manuell verifisering (draft)

### Det som mangler før «ja» til merge
- Anders ser skjermbilder (logo + sample kolonne-sider)
- Grønn lokal `npm run verify && npm test` på hver PR som skal merges
- S2 rate-limit ferdig og reviewet
- S4 dryRun kjørt mot **testbruker** av Anders
- Produktbeslutninger i AAPNE-SPORSMAL
- CI + branch protection

### Prioritet for Anders i morgen
1. Se #371 logo (prikkfarge) → ja/nei  
2. Spot-sjekk #373 (booking, settings, hjem, agencyos) → ja/nei  
3. Tørrkjør #375 mot test  
4. Les #376 feilfangst  
5. Aktiver branch protection på main (selv — ikke agent)

**Én setning:** Natten leverte **trygge draft-PR-er** og ærlig dokumentasjon — ikke produksjonsklart, ikke self-merge, ikke «alt ferdig».
