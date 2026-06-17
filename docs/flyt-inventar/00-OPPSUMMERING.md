# Flyt-inventar — oppsummering (døde knapper)

> Kodeverifisert kartlegging av knapper + destinasjoner på tvers av hele appen, 17. juni 2026. Mål: ingen døde knapper i den nye plattformen. Detaljer per flate: `playerhq-1.md`, `playerhq-2.md`, `agencyos.md`, `rest.md`.

## Totalt: ~94 døde knapper

| Flate | Skjermer | Døde knapper |
|---|---|---|
| PlayerHQ del 1 (hjem/analyse/booking/tren) | 32 | 35 |
| PlayerHQ del 2 (coach/talent/meg/live) | 38 | 19 |
| AgencyOS | 64 | 38 |
| Forelder/Auth/Marketing | 45 | 2 (+ noen bevisste stubs) |

**Mønster:** «Ny X»-knapper uten handler, lenker til kuttede legacy-ruter (`/portal/mal/*`, `/admin/plans/templates*`, `/admin/anlegg`), og pynt-chips uten `onClick`. Forelder + Auth er rene.

## Verste funn (må løses i redesign)

**PlayerHQ:**
1. Forsiden (`/portal`): «Logg runde», «Alle mål», «Nytt mål» + mål-kort → døde `/portal/mal/*`. «Se turnering» → rute finnes ikke.
2. `/portal/trening/logg`: «Lagre økt» redirecter til 404 (`/portal/tren` uten page).
3. `/portal/tren/fys-plan`: kan ikke opprette ny plan (`/fys-plan/ny` mangler).
4. `/portal/coach/ovelser`: alle drill-kort → kuttet `/portal/tren/ovelser/{id}`.
5. `/portal/planlegge` (desktop): 11 placeholder-knapper uten handler.
6. Live-økt `active`: «Video/Foto/Notat»-logging har tom onClick.
7. `/portal/booking`: «Oppgrader til Pro» → feil rute (`/portal/abonnement`).

**AgencyOS:**
1. `/admin/grupper/[id]`: ~7 knapper døde — gruppe-detalj kan nesten ingenting.
2. `/admin/workspace/oppgaver`: hele oppgave-flaten uten handlere.
3. `/admin/gjennomfore`: «Ny booking» + «I dag» + live-kort uten handler.
4. `/admin/tester/[id]`: alle 3 handlingsknapper døde (ren visning).
5. Kuttliste-lenker fortsatt aktive: «Anlegg» (sidebar/flere), «Plan-maler» → `/admin/plans/templates*`, «Se alle» → `/admin/approvals`. Ekte typo: `bookings` vs `bookinger`; `/admin/elever` finnes ikke (videoer-bug).

**Marketing (kun 2 ekte):**
1. `/stats/pga` «Lek deg med putt-data» — knapp uten href (skulle gått til `/stats/pga/putt-explorer`).
2. `/stats/spillere` «Sjekk om jeg er her» — `href="#søk"` finnes ikke.

## Bruk i redesign
Hver av disse må enten få en ekte destinasjon eller fjernes. Claude Design får denne lista som fasit, så ingen knapp tegnes uten at den fører et sted.
