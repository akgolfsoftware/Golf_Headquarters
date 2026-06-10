## OPPDRAG

Bygg **PlayerHQ** — spillerens app i AK Golf HQ — som én sammenhengende, klikkbar prototype.
Slank nybygging, ikke kopi: færrest mulig skjermer, **all planlegging samlet i Workbench**.
Følg designsystemet som er lastet inn, og bruk de opplastede skjermbildene som fasit for utseendet.

## HVA PLAYERHQ ER

Spillerens spørsmål er «hva skal JEG gjøre i dag?». **LYST tema, mobil-først (430px) + desktop.**
Navne-kanon: spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** (alltid fulle navn).
All UI-tekst på norsk bokmål med æ, ø, å. Kun Lucide-ikoner. Ingen emoji.

## STRUKTUR — 5 faste faner (mobil bunn-nav / desktop sidebar)

**Hjem · Planlegge · Gjennomføre · Analysere · Meg.**

**Coach er IKKE en femte fane** — det er en **skuff fra høyre** (utløst av coach-ikon i toppen), med faner:
Meldinger · Planer (→ Workbench) · Videoer · AI-Caddie. Femte fane er **Meg**.

## KJERNEPRINSIPP — Workbench er master

**Planlegge er ETT trykkpunkt → Workbench.** Ingen kort-meny, ingen wizard utenfor.
Workbench er master for ALT som planlegges: årsplan/periodisering, treningsplan, fysplan, mål, drills, ny økt
— som moduser i samme flate. «Planlegg i Workbench», «Se i planen», «svakhet → drill», «Planlegg mot turnering»
fører alle hit.

## SKJERMENE (og hva som slås sammen)

**Hjem** — foto-hero (hilsen + avatar + Performance Pro-pill), KPI-strip, dagens fokus-kort med «Start økt»,
dagens økter, treningspyramide, neste tee/turnering.

**Planlegge** — ett trykk → **Workbench** (master, moduser).

**Gjennomføre** — ÉN flate med faner: **I dag · Kalender · Booking**. «Start nå» → Live-økt.

**Analysere** — ÉN flate: sesong-header (HCP-trend + KPI) + faner **SG · Runder · TrackMan · Tester · Innsikt**.
«Loggfør runde» → Loggfør runde. (Statistikk = sesong-header, ikke egen side.)

**Meg** — profil, abonnement-kort (gratis via Performance Pro / 300 kr — INGEN tier-nivåer, ELITE finnes ikke),
KPI, konto-liste → undersider: Profil · Innstillinger · Helse · Utstyrsbag · Dokumenter · Hjelp · Abonnement.

**Nås inni (egne flater):** Live-økt (fullskjerm: brief → aktiv → logg → oppsummering) · Runde-detalj ·
**Turnering-detalj (NY — se under)** · Drill-detalj · Varsler · Coach-skuff.

**Auth + oppstart:** Logg inn · Registrer · Glemt passord · BankID · Foreldresamtykke (under 18) · Onboarding (5 steg).

## SLÅ SAMMEN (ikke lag duplikater)

- Planlegge-hub (6 kort) + separate Årsplan/Treningsplan/Fysplan/Mål/Ny-økt-wizard → **moduser i Workbench**.
- Statistikk + SG + TrackMan + Runder + Tester + Innsikt (6 sider) → **Analysere (faner)**.
- Kalender + Booking → **faner i Gjennomføre**.
- Dobbeltadresser (/analyse+/analysere, /stats+/statistikk) → **én av hver**.

## TO BESLUTNINGER (lean, godkjent retning)

1. **Økt-rad** (trykk på en økt) → åpne **selve økten** (Live for nå/kommende, oppsummering for ferdig) — IKKE en dagsliste.
2. **Turnering-kort** → bygg **Turnering-detalj** (NY): spillerens visning av én turnering — tee-tid, format,
   feltstørrelse, par/lengde, din status, medspillere i ballen, baneinfo, evt. fellesmelding fra coach,
   CTA «Planlegg mot» (→ Workbench) + «Legg til i kalender».

## LEVERANSE

Én klikkbar prototype der navigasjonen faktisk fungerer (hver knapp peker riktig). Lyst tema gjennomgående,
mobil bunn-nav + desktop sidebar. Mangler du noe, list det under «Åpne spørsmål» — ikke dikt.
