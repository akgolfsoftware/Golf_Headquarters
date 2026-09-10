> **Dokumentstatus 10.09.2026:** dette er et underlag, ikke en bekreftelse på dagens leveranse. Gjeldende status er `docs/STATUS-NÅ.md`, kodekartet er `docs/platform/AGENT-BRIEF.md`, og visuelt design velges i `designsystem/README.md`.

# Knapp-audit — lanseringskjeden

Statisk grep 08.09.2026 mot `feat/lanseringskjede-knapper`. Runtime (innlogget FULL, 390/1280, lys/mørk) kjører i `tests/e2e/lanseringskjede-knapper.spec.ts` når credentials finnes.

## Fikset

| Rute | Knapp | Resultat |
|---|---|---|
| `/portal/booking/coach/[id]` | Tjeneste-rad (`Rad` inni `Link`) | **Fikset.** Tom `onClick={() => {}}` fjernet. Klikk går på lenken til wizarden. |

## Spiller

| Rute | Knapp | Resultat |
|---|---|---|
| `/auth/login` | Logg inn | Virker (submit) |
| `/auth/login` | Fortsett med Google | Virker (onClick) |
| `/auth/login` | Fortsett med BankID | Virker (Link rundt Knapp) |
| `/auth/login` | Glemt passord | Virker (`/auth/forgot-password`) |
| `/portal` I dag | Start økt / Fortsett / Start egen økt | **Kjent: Task 2.** Href er `/portal/tren/wb/…` — eies av annen gren, ikke endret her |
| `/portal` I dag | Godta / Avvis | Virker (`resolvePlayerApproval`). Testen klikker ikke (muterer økt) |
| `/portal/tren/wb/[id]` | Start / Fullfør / Hopp over | Virker (server actions). Testen tar maks ett steg, ikke Fullfør |
| `/portal/live/…/summary` | Recap-lenker | Task 2 eier «Tilbake til I dag». Ikke rørt |
| `/portal/planlegge` | Uke-stripe (dagpiller) | Virker (bytter dag i inneværende uke). Ingen forrige/neste-uke-kontroll på denne skjermen |
| `/portal/planlegge` | Åpne økt / økt-rad | Virker (ekte href) |
| `/portal/analysere` | Gå dypere (TrackMan, runder, tester, …) | Virker (ekte href, ikke fane-UI) |
| `/portal/analysere/trackman` | Økt-rad / Last opp | Virker |
| `/portal/meg` | Coach-raden | Visning, ikke knapp. Coach nås via `/portal/coach` (søk/direkte). Ikke død handler |
| `/portal/meg` | Fakturaer og betalingsmåte | Virker (`/portal/meg/abonnement`) |
| `/portal/coach` | Meldinger / Book | Virker |
| `/portal/booking` | Book time / Se ledige tider | Virker. Testen åpner flyt, stopper før bekreft/betaling |
| `/portal/meg/abonnement` | Priser / Oppgrader | Vises. Testen kjøper ikke |

## Coach

| Rute | Knapp | Resultat |
|---|---|---|
| `/admin/spillere` | Spiller-rad | Virker (`/admin/spillere/[id]`) |
| `/admin/spillere/[id]` | Åpne uke i Workbench | Virker (`/admin/workbench/[id]`) |
| `/admin/workbench/[id]` | Publiser | Virker — åpner bekreft. Testen trykker Avbryt, publiserer ikke |
| `/admin/ko` | Fane-piller | Virker (`?fane=`) |
| `/admin/kommunikasjon` | Fane-piller | Virker |
| `/admin/jarvis` | Fane-piller | Virker. Testen sender ingenting |
| `/admin/profile` | Meg / konto | Virker |

## Logget, ikke fikset (utenfor kjeden)

| Rute | Knapp | Resultat |
|---|---|---|
| `/portal/meg/innstillinger/sprak` | English | «Kommer Q3 2026», `pointer-events: none`. Ikke i lanseringskjeden — språk bygges ikke her |
| `/portal/meg/utstyr` | `#rediger-utstyr` | In-page anker, ikke i kjeden |
| FO-05 Fakturaer | Betal | Bevisst utelatt (designavvik). Ikke i kjeden |
| AO-brytere | Lesestatus | Bevisst ikke lagrende. Ikke i kjeden |

## Statisk grep

Mønstre: `onClick={() => {}}`, `href="#"`, `href=""`. Treff i kjeden etter fiks: **0**.
