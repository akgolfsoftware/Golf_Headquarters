# Beta-readiness — hva gjenstår for å lansere for beta-brukere (10. juli 2026)

**Viktig kontekst:** Appen ER allerede deployet og fungerer (`akgolf-hq.vercel.app`).
Kjernen (PlayerHQ + AgencyOS) er bygget og datakoblet med DAGENS (gamle) design. v2-redesignet
er en presentasjons-omskriving oppå en app som allerede virker. Beta handler derfor om to
adskilte lag — design og funksjonell readiness — ikke om å bygge appen fra bunn.

## Lag 1 — Design (v2)

- Workbench-ombygging = siste mockup. Etter Anders' godkjenning er DESIGNET ferdig.
- Bygge v2 inn i appen = byggeplanen (`byggeplan.md`). For beta trengs minst **Bølge 1
  (PlayerHQ) + Bølge 2 (Workbench)** hvis beta skal ha det nye uttrykket. Resten kan rulle
  under beta. ELLER: kjør beta på dagens design og rull v2 ut løpende.

## Lag 2 — Funksjonell beta-readiness (uavhengig av v2-design)

De fleste P0-blokkererne er allerede LØST (abonnement/gratis-logikk, soft-delete-login,
dataeksport, deploy-rutine). Reelle gjenstående blokkere for ekte brukere:

1. **E-postleveranse** (P0 #6): Resend SPF/DKIM ikke verifisert → signup/passord-reset kan
   havne i spam. **Reell blokker** — brukere må kunne registrere seg og få e-post. *(DNS/Resend-panel — Anders)*
2. **Domene** (P0 #7): `akgolf.no` peker 100 % til Acuity, ikke appen. For beta: bruk
   `akgolf-hq.vercel.app` (fungerer nå), ELLER pek et beta-subdomene (f.eks. `app.akgolf.no`)
   til Vercel. *(DNS/registrar — Anders)*
3. **Booking:** går midlertidig via Acuity (`akgolfgroup.as.me`). Beta kan bruke Acuity, eller
   vente på HQ-booking (Bølge 4). Beslutning.
4. **Stripe** (P0 #3): live-nøkler kun i Vercel. Betaling starter 1. aug uansett — gratis for
   alle til da (`gratisForAlle()`), så IKKE en beta-blokker nå.
5. **Demo-data → beta-data:** rydde demo-spillere, invitere ekte beta-brukere (spillere +
   coacher), seed reelle grunndata (baner, tjenester, grupper).
6. **Datakvalitet på flater beta-brukere treffer:** AgencyOS mock-flater (godkjenninger,
   økonomi, innboks, analytics — UI bygget, ikke full datakobling) og foreldreportal
   (11 ruter, datakvalitet ikke verifisert). Verifiser/koble der beta faktisk går.
7. **Feedback-kanal:** enkel måte for beta-brukere å melde feil (in-app eller e-post/Notion).

## De to funksjonene som SKAL med (Anders 10. juli)

8. **Utviklingsplan-merge** + **fysisk logging** — bygges i Bølge 2 (Workbench). Additive
   datamodell-tillegg. Del av lanseringen, ikke utsatt.

## UTSATT til under/etter beta

- AI-golf-coach (agent-ekspertene + video). Post-lansering.
- Full datakobling av alle AgencyOS-mock-flater som beta ikke treffer.

## Nøkkelvalg for Anders (styrer tidslinjen)

**A) Beta med v2-design:** bygg Bølge 1 + 2 (+ de to funksjonene) → lukk lag 2 (e-post/domene/
beta-data) → beta. Riktig førsteinntrykk (tour-ambisjon), men lengre til beta.

**B) Beta raskt på dagens app:** lukk kun lag 2 (e-post/domene/beta-data/feedback) → beta nå
på gammelt design → rull v2 ut bølge for bølge UNDER beta. Lærer av ekte bruk raskest.

Anbefaling: **A for kjernen (PlayerHQ + Workbench), B-tempo for resten** — bygg de to
viktigste flatene nytt, lanser beta på dem, rull resten av v2 ut mens beta pågår. Da får
beta-brukerne det nye førsteinntrykket der det teller mest, uten å vente på alle 6 bølgene.
