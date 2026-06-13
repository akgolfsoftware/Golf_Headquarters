# PlayerHQ — avviks-tabell (design-fasit vs. faktisk app)

> Laget 5. juni 2026. Sammenligner Claude Designs skjermliste-fasit (`PlayerHQ-skjermliste.html`)
> mot hva appen faktisk gjør i koden i dag. Bruk denne mens du tar skjermopptak: gå fane for fane,
> sjekk om det stemmer, og skriv kommentaren din i siste kolonne / si den høyt i opptaket.
>
> Tegn: ✗ = avvik (må fikses) · ⚠ = delvis · ✓ = stemmer med design.

---

## Det store bildet (les dette først)

Designeren ryddet PlayerHQ ned til **5 rene faner** med all planlegging samlet i Workbench.
Appen har fortsatt den **gamle, store strukturen** (144 sider) under. Knappene peker derfor inn i
det gamle treet i stedet for den rene fasiten. De seks tunge avvikene:

| # | Hva designet sier | Hva appen gjør i dag | Alvor |
|---|---|---|---|
| 1 | 5. fane = **Meg** (profil). Coach = skuff fra høyre | 5. fane = **Coach** (18 egne sider). «Meg» er ikke en fane | ✗ Stor |
| 2 | **Planlegge** = ett trykk → Workbench | Planlegge = **6-korts meny** til 6 gamle sider | ✗ Stor |
| 3 | **Gjennomføre** = én flate med faner (I dag/Kalender/Booking) | Korts-hub til separate sider. «Live-økt»-kortet er ikke engang klikkbart | ✗ Stor |
| 4 | **Analysere** = én flate med faner (SG/Runder/TrackMan/Tester/Innsikt) | Bare pyramide-analyse. Fanene ligger spredt på 6 egne adresser | ✗ Stor |
| 5 | Én adresse per funksjon | **Dobbeltadresser lever:** /analyse+/analysere, /stats+/statistikk+/mal/statistikk, /trackman+/mal/trackman | ✗ Middels |
| 6 | **Meg** = profil + abonnement + 8 konto-rader | Meg er halvtom: ingen konto-liste, ingen «Se coaching-pakken», fakturaer tom | ✗ Middels |

**Konklusjon:** Designet er riktig og ferdig. Jobben er å gjøre appens navigasjon lik fasiten —
ikke å tegne mer.

---

## Fane 1 — HJEM (`/portal`)

**Designet sier:** Foto-hero (hilsen + avatar + Performance Pro-pill) · KPI-strip · dagens fokus-kort ·
dagens økter · treningspyramide · neste tee · neste turnering.

**Appen har:** Foto-hero ✓ · dagens økt-kort ✓ · Strokes Gained-strip ✓ · pyramide ✓ · neste turnering ✓.
Selve skjermen er nær fasiten. Problemet er **hvor knappene fører**:

| Knapp | Skal føre til (design) | Fører faktisk til | Status |
|---|---|---|---|
| «Start økt» | Fullskjerm live-økt (`/portal/(fullscreen)/live/…`) | Gjennomføre-side (`/portal/gjennomfore/{id}`) | ✗ |
| Tom-økt «Se planen» | Workbench (`/portal/planlegge/workbench`) | Planlegge-hub (`/portal/planlegge`) | ✗ |
| Neste turnering-rad | Turneringer | Kalender (`/portal/kalender`) | ✗ |
| Pyramide «FULL» | Workbench/trening | SG-hub (`/portal/mal/sg-hub`) | ⚠ uavklart |
| Avatar | Profil (Meg) | `/portal/meg` | ✓ |

**Se etter i opptaket:** Trykk «Start økt» — havner du i fullskjerm-økten, eller på en mellomside?

---

## Fane 2 — PLANLEGGE (`/portal/planlegge`)

**Designet sier:** ETT trykkpunkt → Workbench. Ingen kort-meny, ingen wizard. All planlegging
(Årsplan, Treningsplan, Fysplan, Mål, Drills, Ny økt) er **moduser inni Workbench**.

**Appen har:** ✗ En **hub med 6 kort** som hver lenker til en egen gammel side:
Årsplan → `/portal/tren/aarsplan` · Treningsplan → `/portal/tren/teknisk-plan` · Fysplan →
`/portal/tren/fys-plan` · Mål → `/portal/mal` · Turneringer → `/portal/tren/turneringer` ·
Drills → `/portal/drills`. I tillegg lever en egen «Ny økt»-wizard (`/portal/ny-okt`).

Desktop-sidebaren viser **akkurat de samme 6 lenkene** som undermeny — stikk i strid med fasiten.

| Avvik | Detalj |
|---|---|
| ✗ Planlegge er en meny, ikke ett trykk | Skal gå rett til Workbench |
| ✗ 6 gamle sider lever som egne skjermer | Skal være foldet inn i Workbench |
| ✗ Sidebar-undermeny med 6 lenker | Skal ikke finnes |
| ⚠ Workbench har «visnings-modus» (Uke/Dag/Kanban), ikke de 6 navngitte modusene fra fasiten | Egen vurdering trengs |

**Se etter i opptaket:** Trykk «Planlegg» i bunn-menyen. Får du Workbench, eller en kort-meny?

---

## Fane 3 — GJENNOMFØRE (`/portal/gjennomfore`)

**Designet sier:** Én flate med faner: **I dag · Kalender · Booking**. «Start nå» → live-økt.
«Endre rekkefølge» → Workbench.

**Appen har:** ✗ En **hub med 5 kort** (I dag, Kalender, Live-økt, Booking, TrackMan) som lenker
ut til separate sider. Verre: **Live-økt-kortet har ingen lenke** — det er ikke klikkbart i det hele tatt.

| Avvik | Detalj |
|---|---|
| ✗ Korts-hub, ikke fane-flate | Kalender + Booking skal være faner her, ikke egne sider |
| ✗ «Live-økt»-kortet er dødt | Ingen `href` — kan ikke startes herfra |
| ✗ «Start nå» → live mangler | Ingen fungerende inngang til fullskjerm-økt |
| ✗ Ekstra header-knapper (Kalender, Ny økt) dupliserer kortene | Ikke i designet |

**Se etter i opptaket:** Trykk på «Live-økt»-kortet. Skjer det noe?

---

## Fane 4 — ANALYSERE (`/portal/analysere`)

**Designet sier:** Én samlet flate: sesong-header (HCP-trend + KPI) øverst, så faner
**SG · Runder · TrackMan · Tester · Innsikt**. Alt på ett sted.

**Appen har:** ✗ `/portal/analysere` viser **bare pyramide-treningsanalyse**. De fem fanene finnes
ikke her — de ligger spredt på 6 egne adresser, nådd via sidebar-undermenyen:
Statistikk → `/portal/analysere` · SG → `/portal/mal/sg-hub` · Runder → `/portal/mal/runder` ·
TrackMan → `/portal/mal/trackman` · Tester → `/portal/tren/tester` · Innsikt → `/portal/analysere/hull`.

**Dobbeltadresser bekreftet (samme funksjon, flere adresser):**
- Analyse: `/portal/analyse` *og* `/portal/analysere`
- Statistikk: `/portal/stats` *og* `/portal/statistikk` *og* `/portal/mal/statistikk`
- TrackMan: `/portal/trackman/[id]` *og* `/portal/mal/trackman`

| Avvik | Detalj |
|---|---|
| ✗ Ingen samlet fane-flate | De 5 fanene er separate sider |
| ✗ 2–3 dobbeltadresser | Velg én av hver, la resten peke videre |

**Se etter i opptaket:** Finnes det faner SG/Runder/TrackMan/Tester/Innsikt på Analysere, eller må du ut i menyen?

---

## Fane 5 — MEG vs. COACH (det største nav-avviket)

**Designet sier:** 5. bunn-fane = **Meg** (`/portal/meg`). Coach er en **skuff som glir inn fra høyre**,
utløst av coach-ikon i toppen, med faner: Meldinger · Planer · Videoer · AI-Caddie.

**Appen har:** ✗ 5. bunn-fane = **Coach** (`/portal/coach`) med 18 egne sider og egen undermeny.
«Meg» er ikke en bunn-fane i det hele tatt. Ingen høyre-skuff for coach finnes.

**Meg-siden (`/portal/meg`) selv er halvtom mot fasiten:**

| Element (design) | I appen | Status |
|---|---|---|
| Profil + avatar + KPI | Finnes | ✓ |
| Abonnement-kort (gratis via Performance Pro) | Egen underside, ikke på Meg | ⚠ |
| Konto-liste: Rediger profil · Innstillinger · Helse · Utstyrsbag · Dokumenter · Foreldre · Hjelp · Feedback | Sidene finnes, men **ingen klikkbar liste** på Meg | ✗ |
| «Se coaching-pakken»-knapp | Mangler | ✗ |
| Fakturaer (3 rader) | Tom liste | ✗ |
| Logg ut | Finnes | ✓ |

**Se etter i opptaket:** Hvilken fane står lengst til høyre i bunn-menyen — «Coach» eller «Meg»?
Og finnes coach-ikonet/skuffen øverst på skjermen?

---

## Hva skjer videre

1. Du tar skjermopptak og går gjennom de 5 fanene med denne tabellen ved siden av.
2. Bekreft/korriger hvert avvik (særlig de jeg har markert ⚠ uavklart).
3. Jeg lager en bygge-plan i samme rekkefølge — vanligvis: fiks nav-strukturen (5. fane Meg,
   Planlegge→Workbench, Gjennomføre-faner, Analysere-faner), så dobbeltadresser, så Meg-siden.
4. Master-skjermplanen oppdateres etter hvert som hver fane lukkes.
