# Prompt 07 — Faktureringshistorikk drawer

## Hensikt

Når Markus klikker "Se all historikk" eller en eldre faktura-rad i `/portal/meg/abonnement`, åpnes en drawer som lister alle Stripe-faktureringer kronologisk med direktelenker til invoice.stripe.com.

## Trigger

Klikk på "Se historikk" eller eldre faktura-rad.

## Layout

- Drawer høyre 540 px bred, cream, `p-8`.
- Header: eyebrow `PLAYERHQ · ABONNEMENT · HISTORIKK`, X.
- Tittel Inter Tight 24 px "Faktureringshistorikk".
- Summering-card secondary: total betalt, antall fakturaer, første dato (alle JetBrains Mono).
- Liste: divide-y rader, hver rad:
  - Venstre: Lucide FileText + dato (JetBrains Mono)
  - Midten: "Pro · 300 kr · 1 mnd"
  - Høyre: status-pill (`betalt` lime, `mislyktes` destructive, `refundert` muted) + ArrowUpRight til Stripe
- Filter-rad øverst: "Alle / Betalte / Mislykkede / Refunderte" pill-tabs.

## Komponenter

- `Sheet`, `Button`, `Tabs`
- Lucide: X, FileText, ArrowUpRight, Filter, Download

## Eksempel-data

```
Markus, 11 fakturaer 12. jan – 1. mai 2026
Total: 3300 kr
Filtre: alle aktive
```

## Branding-krav

- JetBrains Mono tabular nums for kroner og dato.
- Status-pills med Lucide Check/X/Undo2.
- Norsk bokmål.

## Tilstander

- **Tom historikk**: empty-state med ikon Receipt.
- **Mislyktes**: rød destructive-banner "1 faktura ble ikke betalt — oppdater kortet ditt".
