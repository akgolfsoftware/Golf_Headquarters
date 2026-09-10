# AK Golf HQ

Plattform for coaching, spillerutvikling og booking. Ett Next.js-prosjekt samler offentlig nettsted, booking, PlayerHQ og AgencyOS, med egne foreldre-, klubb- og skoleflater.

**[Start her](START-HER.md)** for gjeldende status, designarbeid og neste arbeid. **[Prosjektkart](docs/vedlikehold/prosjektkart.md)** forklarer alle mapper.

| Flate | Adresse | Kode |
|---|---|---|
| Nettsted | `/` og offentlige undersider | `src/app/page.tsx`, `src/app/(marketing)/` |
| Booking av coaching | `/booking`, `/portal/booking` | booking-rutene og `src/lib/booking/` |
| PlayerHQ | `/portal` | `src/app/portal/` |
| AgencyOS | `/admin` | `src/app/admin/` |
| Forelder | `/forelder` | `src/app/forelder/` |
| WANG / Team Norway | `/team-wang`, `/team-norway` | de respektive rutemappene |

## Lokal utvikling

Node-versjonen står i [.nvmrc](.nvmrc). Bruk npm og den innlåste [package-lock.json](package-lock.json).

```bash
npm ci
npm run dev
```

Et nytt lokalt oppsett trenger miljøvariablene beskrevet i [.env.example](.env.example). Bevar en eksisterende `.env.local`; ikke overskriv den med malen. Bruk en isolert testdatabase når du skal teste skriving. Ingen dataimport eller migrasjon inngår i vanlig oppstart.

## Kontroller

```bash
npm run prosjekt:sjekk
npm run verify
npm test
```

`verify` kontrollerer typer, kildekode, designregler og bygg. Det beviser ikke en komplett kundereise, produksjonsbetaling eller visuell godkjenning. Nettlesertester beskrives i [docs/testing.md](docs/testing.md); skjermmåling i [tests/visual/README.md](tests/visual/README.md).

## Kilder

[Produktregler](docs/platform/BUSINESS-RULES.md) · [design per flate](designsystem/README.md) · [dokumentoversikt](docs/README.md) · [sikkerhet](SECURITY.md) · [drift](docs/runbook.md).
