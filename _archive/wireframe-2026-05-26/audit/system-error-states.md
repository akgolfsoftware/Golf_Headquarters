# Audit: System — Error-states (katalog)

**HTML:** `screen-deck/system/error-states.html`
**URL:** (system, ingen route — designsystem-katalog)
**Antall klikkbare elementer:** 23 (sidebar + demo-knapper i 12 error-cards)

## Klikkbare elementer

### Sidebar (samme som loading-states)

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| 9 sidebar-lenker (Hub, Elever, Plans, Bookings, Approvals, Analytics, Finance, Facilities, Innstillinger) | Skjerm | per `/admin/*` | OK |

### Demo-knapper i error-cards

| Card | Knapp | Type | Mål |
|---|---|---|---|
| 404 | "Til forsiden" | Skjerm | `/` eller rolle-default |
| 500 | "Prøv igjen" | State-change | Re-fetch |
| 500 | "Rapporter" | Modal | Bug-report-modal (mangler i tracker) |
| Offline | (badge "OFFLINE", ikke klikkbar) | Visuell | — |
| 403 | "Be om tilgang" | Modal eller skjerm | Access-request-modal (mangler) |
| Data-load failed | "Prøv igjen" | State-change | Re-fetch |
| Resource not found | "Til elever" | Skjerm | `/admin/elever` |
| Empty list | "+ Legg til elev" | Modal | Add-elev-modal (mangler) |
| Empty list | "Importer" | Modal | Import-assistent (cross-cutting #15) |
| Validation | (input + inline-feil) | State-change | Inline form-state |
| Toast-error | (auto-dismiss, ikke klikkbar) | Transient | — |
| Modal-error (sync-feil) | "Se logg og prøv på nytt" | Skjerm/modal | Audit-log med filter |
| Modal-error | "Hopp over og fortsett" | State-change | Lukk modal, fortsett |
| Modal-error | "Avbryt sync helt" | State-change | Avbryt operasjon |
| Rate-limit | (countdown, ikke klikkbar) | Visuell | — |
| Maintenance | (info, ikke klikkbar) | Visuell | — |

## Error-mønstre dokumentert (12 stk)

1. **404** — side mangler (CTA: "Til forsiden")
2. **500** — server-feil (CTA: "Prøv igjen", "Rapporter")
3. **Offline** — ingen nettforbindelse (badge)
4. **403** — permission denied (CTA: "Be om tilgang")
5. **Data-load failed** — ECONN_RESET o.l. (CTA: "Prøv igjen")
6. **Resource not found** — slettet/ugyldig deep-link (CTA: "Til [parent]")
7. **Empty list** — første gang / 0 treff (CTA: "+ Legg til", "Importer")
8. **Validation inline** — felt-feilmelding under input
9. **Toast-error** — transient (auto-dismiss 5s)
10. **Modal-error destruktiv** — sync-feil med 3 valg
11. **Rate-limit** — countdown
12. **Maintenance** — planlagt nedetid

## States som må designes

- 4 illustrasjons-varianter: warn (gul), danger (rød), muted (grå), info (blå)
- Toast: success / error / warning / info varianter (kun error vist her)
- Modal-error: destruktiv-variant (rød border-left + 3 valg-mønster)
- Inline-input-error: 1.5px solid danger border + danger-tekst med dot
- Empty-state: skiller mellom "ingen data ennå" vs "filter ga 0 treff" (samme komponent, ulik tekst)
- Offline-banner: persistent topbar når offline + bufret-indicator
- Rate-limit countdown: live-tikkende mm:ss i tabular nums
- Maintenance-skjerm: kan være full-page takeover
