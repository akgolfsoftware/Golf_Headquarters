# AgencyOS — godkjent byggespesifikasjon (5. juni 2026)

> Godkjent av Anders 5. juni 2026 etter gjennomgang av knapp→skjerm-tabellen
> (`docs/kobling-godkjenning/agencyos.html`). Dette er nå fasiten AgencyOS bygges mot.
> Overstyrer eldre AgencyOS-struktur der det er konflikt.

## Lean-struktur (mål)

**Fra ~26 design-skjermer / 134 app-ruter → 6 seksjoner + Spiller-Workbench-master + drift/detalj.**

Sidebar-seksjoner: **Oversikt (Cockpit) · Stall · Planlegge · Gjennomføre · Innsikt · Admin.**
**Spiller-Workbench er master** for all per-spiller-planlegging.

## De 5 nøkkel-endringene (godkjent)

1. **Stall: klikk på spiller → rett inn i spillerens Workbench.** Ingen profil-mellomside.
   (`/admin/spillere/[id]/workbench`, ikke `/admin/spillere/[id]`.)
2. **Cockpit: bygg fokus-spiller med manuell pin + 3 AI-forslag** (haster / ubesvart / frafall-fare).
   Designet finnes i `coach-flows/`; port det inn i hovedflaten.
3. **Topbar: spiller↔gruppe-veksler fast på ALLE skjermer** (finnes bare i Workbench i dag).
4. **Planlegge: fjern «Ny plan»- og «Ny økt»-wizardene.** Plan/økt lages inni Spiller-Workbench.
5. **Turneringer: fullfør Fellesmelding-flyten** (modal finnes, men Send sender ingenting):
   velg turnering → deltakere → skriv → kanaler → send → bekreftelse.

## Slås sammen (godkjent)

- Per-spiller planlegging (Treningsplaner, Teknisk-plan, Plan-detalj) → **Spiller-Workbench**.
- Plan-maler + Drill-bibliotek = **bibliotek (byggeklosser)** som brukes INN i Workbench.
- Dashboard-varianter (`dashboard`, `board`, `queue`) → **én Cockpit**.
- Dobbeltadresser → én av hver:
  `analyse`/`analysere`/`analytics` · `calendar`/`kalender` · `innboks`/`messages`/`foresporsler` ·
  `spillere`/`agencyos-spillere`/`stall` · `godkjenninger`/`approvals` · `finance`/`okonomi`.

## Fjernes

Ny plan-wizard · Ny økt-wizard · `board` (redirect) · dobbeltadresse-sidene ·
«CoachHQ»-rester i tekst (130+ steder → «AgencyOS»).

## Bygges nytt

- Fokus-spiller pin + AI-forslag (Cockpit).
- Fellesmelding-flyt fullført (Turneringer).
- Spiller↔gruppe-veksler fast i topbar (globalt).

## Behold som i dag (designer = riktig)

Grupper · Talent-radar · Sammenligning · WAGR-import · Bookinger · Anlegg · Tilgjengelighet ·
Tjenester · Stall-analyse · Lag-snitt · Tester · Forespørsler · Godkjenninger · Rapporter · Admin.

## Drift/detalj-skjermer som forblir egne

Cockpit · Kalender (drift) · Bookinger · Live-økt · (per-spiller) Spillerprofil som *visning* der nødvendig.
