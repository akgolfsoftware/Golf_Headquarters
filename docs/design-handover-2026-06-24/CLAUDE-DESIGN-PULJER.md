# Claude Design — puljer (lim inn ÉN av gangen, etter master-prompten)

> **Bruk:** Lim master-prompten (`CLAUDE-DESIGN-PROMPT-V2.md`) inn ÉN gang. Deretter limer du inn én pulje
> under, lar Claude Design fullføre den, sjekker at den treffer, og går videre til neste. Aldri alle på
> én gang — da driver den. Treffer en skjerm ikke: svar «følg del 0.5-reglene strengere på [skjerm]».

---

## Pulje 1 — PlayerHQ kjerne (spiller, lyst)
```
Design nå disse PlayerHQ-skjermene (lyst tema) i 375 OG 1280, fire tilstander hver (innhold/tom/laster/feil), tett men organisert per del 0.5. Annotér hver knapp med destinasjon fra kartet:
- Hjem /portal
- Analyse /portal/analysere (med faner SG/Runder/TrackMan/Tester/Innsikt)
- Plan/Workbench /portal/planlegge (zoom År/Uke/Økt)
- Gjør /portal/gjennomfore + Live fullskjerm /(fullscreen)/live/[id] brief→active→summary
Diagnosen/tallet er helten. Start her før resten av PlayerHQ.
```

## Pulje 2 — PlayerHQ resten
```
Design resten av PlayerHQ (lyst) i 375 OG 1280, fire tilstander, samme komponenter som pulje 1:
- Meg /portal/meg + Abonnement /meg/abonnement (GRATIS / PRO 300 kr/mnd, ingen årlig)
- Coach-hub /portal/coach (Oversikt·Planer·Øvelser·Videoer·SG-hub·Meldinger·AI)
- Mål /mal · Tester /tren/tester · Drills /drills · Turneringer /tren/turneringer
- Varsler /portal/varsler · Innstillinger (varsler/integrasjoner/personvern/AI + MER: anlegg/apparater)
```

## Pulje 3 — AgencyOS kjerne (coach, MØRK terminal + lys-variant)
```
Design AgencyOS i MØRKT tema (vis også lys-variant) i 768 OG 1280 — tett cockpit, høy datatetthet, mono-tall, hårfine linjer. Vis også mobil bunn-nav (Oversikt·Stall·Kalender·Innboks·Mer). Fire tilstander:
- Cockpit /admin/agencyos + fane-rad (I dag·Live·Uka·Spillere·Økonomi·Caddie)
- Stall/Spillere /admin/spillere
- Spiller-detalj /admin/spillere/[id] (faner Profil·Fremgang·Tester·Tildel test·Workbench·Plan)
- Handlingssenter /admin/handlingssenter
- Workbench /admin/coach-workbench
«Hvem trenger meg nå»-køen er helten på cockpit.
```

## Pulje 4 — AgencyOS resten
```
Design resten av AgencyOS (mørkt + lys-variant) i 768 OG 1280, samme cockpit-tetthet, fire tilstander:
- Planlegge-gruppa: Treningsplaner /plans · Plan-maler · Drill-bibliotek · Økter · Teknisk plan · Turneringer
- Gjennomføre-gruppa: Kalender · Bookinger · Anlegg /admin/anlegg (KANON) · Tilgjengelighet · Tjenester · TrackMan · Opptak
- Analyse-gruppa: Stall-analyse · Risiko · Lag-snitt · Tester (+Foreslåtte/Fasiter) · Runder · Compliance · Reach · Rapporter
- Innboks: Forespørsler · Godkjenninger · Meldinger
- System: Økonomi · Team · Integrasjoner · AI-agenter · E-postmaler · Audit-logg · Innstillinger
```

## Pulje 5 — Forelder + Auth (lyst)
```
Design Forelder-portalen (lyst, organisert-tett lesemodus) i 375 OG 1280, fire tilstander. Barnets neste økt synlig ved innlogging (0 trykk):
- Hjem /forelder · Barn /barn/[id] · Bookinger · Fakturaer · Økonomi · Ukerapport · Varsler · Innstillinger · Samtykke /samtykke (GDPR per barn)
Pluss Auth (lyst): Login /auth/login · Registrer · Glemt/Reset passord · Logget ut /auth/logget-ut · Onboarding-wizard (profil→mål→nivå-test→SG→kohort→plan) · Foreldresamtykke /auth/guardian-consent/[token]
```

## Pulje 6 — Marketing (akgolf.no, lyst)
```
Design Marketing-sidene (akgolf.no, lyst, moderne) i 375 OG 1280, fire tilstander der relevant. Header: Coaching·Slik trener vi·PlayerHQ·Priser·Anlegg·FAQ·Om oss (+CTA Logg inn·Book tid). Footer: Tjenester·AK Golf·Ressurser (Blogg/Cases/Suksesshistorier/Junior)·Kontakt:
- Forside / · Coaching /coaching · Slik trener vi /treningsfilosofi · PlayerHQ-landing /playerhq · Priser /priser · Anlegg /anlegg · Om oss /om-oss · FAQ /faq · Kontakt /kontakt
- Booking-flyt: /booking → /booking/[slug] → bekreft → Stripe → kvittering (med «opprett konto»-bro)
Turneringer + stats er UTE av v1 — ikke design dem.
```

---

*Rekkefølge anbefalt: 1 → 2 → 3 → 4 → 5 → 6. Kjerneflatene (pulje 1 + 3) gir mest verdi raskest.*
