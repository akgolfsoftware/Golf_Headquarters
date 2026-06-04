# Plan — gjenstående ruter og skjermer (2026-06-01)

> Oppdatert etter Fase 0-audit + Fase 1-bygging. Erstatter den eldre plan-resterende-filen
> (som hadde upresise tall: 252/181). Dette er det faktiske bildet.

## Status nå

| Spor | Skjermer | Status |
|---|---|---|
| **PlayerHQ** /portal | 19 (trengte arbeid) | ✅ Ferdig + pushet |
| **AgencyOS** /admin | 26 (trengte arbeid) | ✅ 20 ferdig · ⏳ 6 kjører |

Da er **hele kjerne-appen** (utøver + coach) på athletic-DNA. 91 PlayerHQ/AgencyOS-skjermer var allerede på-brand fra før.

---

## Gjenstår — tre kategorier

### A. Kjør nå (lett, athletic-DNA) — Fase 2

Resten av app-delen. Lite nybygg, mest finpuss.

1. **Foreldreportal** /forelder — 11 skjermer, **4 trenger arbeid** (ukerapport, innstillinger, økonomi, bookinger er stubs). Resten på-brand.
2. **Auth** /auth — 11 skjermer, **3 trenger arbeid** (mest på-brand alt: login, signup, onboarding er fine).

**Sum: ~7 skjermer.** 1–2 agent-batcher. Etter dette er ALT bak innlogging ferdig.

### B. Krever din beslutning først — egen designlinje

Dette er **offentlige sider** (akgolf.no) med en helt annen visuell stil enn app-en. Athletic er app-UI (dashboards, dense data) — det passer *ikke* rett på landingssider og offentlig statistikk.

3. **Stats-plattform** /stats — **45 sider** (DataGolf-aktig: leaderboards, klubber, spillere, turneringer, baner, SG-sammenlign, PGA…). 3 gir i dag 500-feil (fake-data-prototyper).
4. **akgolf.no markedsføring** — **27 sider** (forside, priser, coacher, anlegg, blogg, om-oss, FAQ, juss…). Mest på-brand alt (bruker tokens + Inter Tight).

**Beslutning du må ta:** Skal disse 72 trekkes inn i athletic-DNA, eller beholde sin egen editorial/stats-linje?

> **Min anbefaling:** Behold egen linje, men (a) fiks de 3 stats-500-feilene, (b) harmoniser farger/fonter (forest/lime/cream + Inter Tight) så de ikke kolliderer visuelt med appen. IKKE full athletic-redesign — det ville gjøre landingssider til dashboards. Dette er et eget, mindre prosjekt etter app-en er ferdig.

### C. Venter (uendret)

5. **Elite Fase 2** — 12 skjermer (video 4, mental 5, dispersjon 3). **Mangler design** — må tegnes i Claude Design først. Allerede på [todo.md](todo.md).
6. **Tekniske rester:**
   - Vercel auto-deploy henger → må manuelt `vercel deploy --prod` når redesignet skal live.
   - 3× 500-feil i stats (leaderboards, regions, sammenlign-spillere) — skjul prototyper eller fiks.
   - Skyggede gamle sider (refactor, lav prio, usynlig for brukere).

---

## Anbefalt rekkefølge

```
Fase 1 (pågår)  →  Fase 2 (Foreldre + Auth, ~7)  →  [DEPLOY app til prod]
                                                          ↓
                              BESLUTNING: stats + marketing-linje
                                                          ↓
                        Eget spor: stats-fix + marketing-finpuss (72)
                                                          ↓
                              Elite Fase 2 (når design er klart)
```

**Neste konkrete steg:** Fullfør Fase 1 (6 kjører) → kjør Fase 2 (Foreldre + Auth). Da er alt bak innlogging ferdig, og vi kan deploye hele app-redesignet til prod. Stats/marketing tas som eget spor når du har bestemt retning.
