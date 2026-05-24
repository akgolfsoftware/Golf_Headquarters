# GDPR behandlingsregister — AK Golf Group

**Behandlingsansvarlig:** AK Golf Group AS (org.nr. under Skarpnord Invest AS)
**Kontaktperson:** Anders Kristiansen, akgolfgroup@gmail.com
**Sist oppdatert:** 2026-05-24

---

## 1. Brukerkontoer og autentisering

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Autentisering, tilgangsstyring, kommunikasjon med bruker |
| **Behandlingsgrunnlag** | Avtale (GDPR art. 6(1)(b)) |
| **Kategorier av personopplysninger** | Navn, e-postadresse, telefonnummer, passord-hash (Supabase), fødselsdato (for mindreårige), profilbilde |
| **Oppbevaringslengde** | Slettes 30 dager etter kontoslett-forespørsel |
| **Mottakere / databehandlere** | Supabase Inc. (EU-region), Vercel Inc. (infrastruktur) |
| **Overføring til tredjeland** | Ja — Supabase og Vercel (USA). DPA på plass med begge. |
| **Automatiserte avgjørelser** | Nei |

---

## 2. Bookinger og betalinger

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Gjennomføre coaching-bookinger, behandle betaling, sende kvitteringer |
| **Behandlingsgrunnlag** | Avtale (GDPR art. 6(1)(b)); regnskapsloven (art. 6(1)(c)) for fakturalagring |
| **Kategorier av personopplysninger** | Navn, e-post, telefon, betalingsreferanser (Stripe Payment Intent ID), tidspunkt, notater fra bruker |
| **Oppbevaringslengde** | 5 år for fakturaformål (regnskapsplikt), kontaktinfo slettes ved kontoslett |
| **Mottakere / databehandlere** | Stripe Inc. (betalingsbehandler, DPA), Resend Inc. (e-post, DPA) |
| **Overføring til tredjeland** | Ja — Stripe og Resend (USA). DPA på plass. |
| **Automatiserte avgjørelser** | Nei |

---

## 3. Coaching-abonnement og credits

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Administrere abonnement, spore coaching-credits, fakturere |
| **Behandlingsgrunnlag** | Avtale (GDPR art. 6(1)(b)) |
| **Kategorier av personopplysninger** | Abonnementsstatus, tier (GRATIS/PRO), credits-saldo, fakturahistorikk |
| **Oppbevaringslengde** | 5 år for fakturaformål |
| **Mottakere / databehandlere** | Stripe Inc. |
| **Overføring til tredjeland** | Ja — Stripe (USA). DPA på plass. |

---

## 4. Treningsdata og utviklingsdata (PlayerHQ)

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Gi spillere personalisert coaching, analysere fremgang, AI-genererte planer |
| **Behandlingsgrunnlag** | Avtale (GDPR art. 6(1)(b)); samtykke (art. 6(1)(a)) for AI-analyse av helse-/prestasjonsdata |
| **Kategorier av personopplysninger** | Treningsøkter, runder, SG-statistikk (Strokes Gained), mål, turneringsresultater, TestMan/TrackMan-data, HCP, treningsplaner, notater fra coach |
| **Helseopplysninger (art. 9)** | Symptom-logg (skader, tretthet) behandles med samtykke |
| **Oppbevaringslengde** | Beholdes så lenge kontoen er aktiv. Slettes 30 dager etter kontoslett. |
| **Mottakere / databehandlere** | Supabase Inc., Anthropic Inc. (AI-analyse, DPA), OpenAI Inc. (AI-analyse, DPA) |
| **Overføring til tredjeland** | Ja — Anthropic og OpenAI (USA). DPA under etablering. |
| **Automatiserte avgjørelser** | AI-genererte treningsplaner og drills. Bruker kan overstyre alle forslag. |

---

## 5. Opptak (coaching-recordings)

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Analysere coaching-økter, gi tilbakemelding på teknikk |
| **Behandlingsgrunnlag** | Samtykke (GDPR art. 6(1)(a)) — eksplisitt start-opptak-handling kreves |
| **Kategorier av personopplysninger** | Lydopptak av coaching-økt, transkripsjon, AI-analyse |
| **Særlige kategorier** | Kan inneholde helseopplysninger — behandles med samtykke |
| **Oppbevaringslengde** | 90 dager. Slettes automatisk av cleanup-cron. |
| **Mottakere / databehandlere** | Supabase Storage, Anthropic Inc. (transkripsjon/analyse) |
| **Overføring til tredjeland** | Ja — Supabase og Anthropic (USA). |

---

## 6. Foreldre og mindreårige

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | GDPR art. 8-samtykke fra foreldre/foresatte for brukere under 16 år, kommunikasjon med foreldre om barnets aktivitet |
| **Behandlingsgrunnlag** | Rettslig forpliktelse (GDPR art. 6(1)(c) + art. 8) |
| **Kategorier av personopplysninger** | Foreldres navn, e-post, relasjon til barn, samtykke-tidsstempel |
| **Oppbevaringslengde** | Beholdes så lenge barnets konto er aktiv. Slettes ved kontoslett. |
| **Mottakere / databehandlere** | Supabase Inc., Resend Inc. (invitasjons-e-post) |

---

## 7. Kommunikasjon (meldinger og varsler)

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Coach–spiller-kommunikasjon, driftsvarsler, booking-påminnelser |
| **Behandlingsgrunnlag** | Avtale (GDPR art. 6(1)(b)); berettiget interesse (art. 6(1)(f)) for driftsvarsler |
| **Kategorier av personopplysninger** | Meldingstekst, tidsstempel, avsender/mottaker, vedlegg |
| **Oppbevaringslengde** | 2 år. Slettes ved kontoslett. |
| **Mottakere / databehandlere** | Supabase Inc., Resend Inc. |

---

## 8. Analysedata (Plausible Analytics)

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Forstå brukeradferd på plattformen, forbedre tjenestene |
| **Behandlingsgrunnlag** | Samtykke (GDPR art. 6(1)(a)) — aktiveres kun etter "Godta alle" i cookie-banner |
| **Kategorier av personopplysninger** | Anonymisert sidevisning, tilnærmet lokasjon (land/by), enhetstype. Ingen IP-lagring. |
| **Oppbevaringslengde** | 12 måneder hos Plausible |
| **Mottakere / databehandlere** | Plausible Analytics OÜ (EU-basert, ingen cookies) |
| **Overføring til tredjeland** | Nei — Plausible er EU-basert |

---

## 9. Revisjonsspor (audit log)

| Felt | Verdi |
|---|---|
| **Behandlingsformål** | Sikkerhet, feilsøking, regeloverholdelse |
| **Behandlingsgrunnlag** | Berettiget interesse (GDPR art. 6(1)(f)) |
| **Kategorier av personopplysninger** | User-ID, handlingstype, tidsstempel, IP-adresse (hashed) |
| **Oppbevaringslengde** | 2 år |
| **Tilgang** | Kun ADMIN-rolle |

---

## Rettigheter

Brukere kan utøve følgende rettigheter ved å kontakte akgolfgroup@gmail.com:

- **Innsyn** (art. 15): Se alle personopplysninger via `/portal/meg/innstillinger/personvern → Last ned mine data`
- **Retting** (art. 16): Endre profil via `/portal/meg/profil/rediger`
- **Sletting** (art. 17): `Slett konto`-funksjon med 30-dagers angre-vindu
- **Dataportabilitet** (art. 20): ZIP-eksport via `Last ned mine data`-funksjonen
- **Innsigelse** mot profilering (art. 21): Kan skru av AI-forslag i innstillinger

---

## Databehandleravtaler (DPA)

| Leverandør | Status |
|---|---|
| Supabase Inc. | DPA på plass (akseptert i Supabase-dashboard) |
| Vercel Inc. | DPA på plass (akseptert i Vercel-dashboard) |
| Stripe Inc. | DPA på plass (akseptert i Stripe-dashboard) |
| Resend Inc. | DPA signert |
| Plausible Analytics OÜ | EU-basert — DPA ikke påkrevd |
| Anthropic Inc. | DPA under etablering |
| OpenAI Inc. | DPA under etablering |

---

## Neste gjennomgang

Behandlingsregisteret skal gjennomgås ved:
- Nye databehandlere legges til
- Nye behandlingsformål
- Endringer i oppbevaringstider
- Minimum én gang per år
