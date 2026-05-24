# E2E smoke-tests (Playwright)

20 kritiske smoke-tester som verifiserer at akgolf-hq fungerer på et grunnleggende nivå — sider rendrer, PWA-assets eksisterer, auth-redirects fungerer, og a11y ikke har critical violations.

## Kjøre tester

```bash
# Lokalt (auto-starter dev-server)
npm run test:e2e

# UI-modus (interaktiv debugger)
npm run test:e2e:ui

# Headed (synlig browser)
npm run test:e2e:headed

# Mot produksjon (Vercel)
PLAYWRIGHT_BASE_URL=https://akgolf-hq.vercel.app npm run test:e2e
```

## Hva som testes

### PlayerHQ-perspektiv (10 tester)

| Fil | Hva den dekker |
|---|---|
| `pages-render.spec.ts` | 10 hovedruter returnerer 200 eller 3xx redirect |
| `landing-page.spec.ts` | Forsiden viser merkevare + CTA-lenker |
| `pwa-manifest.spec.ts` | `/manifest.webmanifest` har name, theme_color, icons (192 + 512) |
| `service-worker.spec.ts` | `/sw.js` returnerer JavaScript |
| `offline-page.spec.ts` | `/offline` rendrer fallback-tekst |
| `meta-tags.spec.ts` | theme-color, apple-touch-icon, manifest-link finnes i `<head>` |
| `accessibility-portal.spec.ts` | Axe-scan på `/` — 0 critical violations |
| `accessibility-landing.spec.ts` | Axe-scan på `/auth/login` + `/priser` — 0 critical violations |
| `viewport-mobile.spec.ts` | viewport-meta er korrekt (`width=device-width`) |
| `og-tags.spec.ts` | `<title>` + description-meta finnes |

### Funksjonelle smoke (10 tester)

| Fil | Hva den dekker |
|---|---|
| `marketing-turneringer.spec.ts` | `/turneringer` rendrer + viser turnerings-innhold |
| `api-health.spec.ts` | `/api/health` returnerer 200 + `{ status: "ok" }` |
| `404-handling.spec.ts` | Tilfeldig URL gir 404 + fallback-side |
| `routes-redirect.spec.ts` | `/admin` + `/portal` redirecter til `/auth/login` |
| `routes-public.spec.ts` | `/auth/login` viser email + password input |
| `static-assets.spec.ts` | favicon-32, favicon-16, apple-touch-icon eksisterer |
| `icons-pwa.spec.ts` | icon-192, icon-512 + maskable-varianter returnerer 200 |
| `splash-screens.spec.ts` | Minst én apple-splash returnerer 200 |
| `robots-sitemap.spec.ts` | robots.txt + sitemap.xml svarer (200 eller 404, ikke 500) |
| `https-redirect.spec.ts` | HSTS + X-Content-Type-Options på prod (skipper lokalt) |

## Helpers

`_helpers.ts` inneholder gjenbrukbare funksjoner:

- `gotoAndWait(page, path)` — naviger + vent på `domcontentloaded`
- `expectNoConsoleErrors(page)` — disposer som failer hvis console.error logges
- `screenshotOnFailure(page, name)` — manuell screenshot
- `isOkOrRedirect(status)` — true ved 200 eller 3xx

## Auth-strategi

Disse smoke-testene kjører **uten innlogging**. Ruter som krever auth (`/portal`, `/admin`, `/coachhq`) verifiseres bare ved at de redirecter til `/auth/login` — det er en gyldig assertion.

Full auth-flyt (innlogging, opprettelse av spiller, booking-flyt) implementeres i **fase 2** og krever en test-bruker i Supabase + en strategi for å mocke eller seede databasen.

## CI

Workflow: `.github/workflows/playwright.yml`

- Kjøres på push + PR til `main`
- Kan trigges manuelt med `workflow_dispatch` for å teste mot en valgfri URL
- Default base URL = `https://akgolf-hq.vercel.app` (prod)
- Browsers: chromium + webkit
- Reports lastes opp som artifact i 14 dager

## Oppdatere når UI endres

1. Endre testen som matcher den nye UI-en (helst med en `data-testid`-selector eller stabil tekst)
2. Kjør lokalt: `npm run test:e2e:headed`
3. Bekreft at testen reflekterer ønsket adferd — ikke bare passerer
4. Commit som `test(e2e): oppdater <fil> for <endring>`

## Notater

- Tester skal kjøre på under 30 sek lokalt (parallelt med 4 workers)
- Bruk `test.skip` med kommentar når en test ikke kan kjøres i den gjeldende konteksten (f.eks. HSTS lokalt)
- Aldri `any` — bruk Playwright-typer eller definer interface
- Hver test må ha minst én `expect`
