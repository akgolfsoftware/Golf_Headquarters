# PlayerHQ /portal/meg — skjermkort (kode-verifisert 2026-06-29)

33 ruter under `/portal/meg/*` (profil, abonnement, innstillinger, helse, hjelp, bookinger, dokumenter, utstyrsbag, sikkerhet, foresatte). Dominerende mønster: server component + `requirePortalUser`, port mot fersk Claude Design via det delte `MeSub/SetGroup/SetRow`-skallet (`src/components/portal/meg/meg-sub.tsx`). Største gjeld: **to konkurrerende chrome-idiomer** lever side om side — det moderne MeSub-skallet (eyebrow + display-tittel + lead, ingen tilbake-pil) vs. en eldre «ChevronLeft Tilbake + PlayerHero»-stil på mange innstillinger-undersider; og **duplisert sikkerhet** (`/meg/sikkerhet` vs `/meg/innstillinger/sikkerhet`, ulik score-logikk). Abonnement/ELITE-gating er ren og korrekt (se eget funn nederst).

---

### /portal/meg
- Fil: `src/app/portal/meg/page.tsx`
- Flate: PlayerHQ (lyst)
- Rolle/gating: `requirePortalUser` (implisitt via `getCurrentUser` + `hentProfil`)
- Jobb: «Meg»-hjem — profilhode + snarveier til alle undersider.
- Data vist: navn/initialer/avatar/hcp/hjemmeklubb → `hentProfil()`+User; `tier` → `user.tier ?? "GRATIS"`; streak → `trainingPlanSessionLog` siste 30 d via `computeStreak`/`aktivStreak`; antallRunder → `prisma.round.count`; preferences → `hentProfil`.
- Komponenter: `./meg-hybrid` (MegHybrid, lokal client); actions `./actions` (`hentProfil`/`oppdaterPreferences`/`logout`).
- Layout og hierarki: profilkort øverst, deretter navigasjons-/preferanse-seksjoner; primær handling = naviger videre; logout via action.
- Tilstander: loading/empty/error — `.catch(() => …)`-fallbacks for streak/runder (degraderer til 0); ingen eksplisitt loading/empty UI sett i page.
- Interaksjoner: undersider-lenker; toggle preferences (server action); logg ut.
- AK-domene vist: tier (GRATIS), streak, runde-antall.
- Designfil-referanse: «hybrid» nevnt i page-kommentar; konkret .dc.html UVERIFISERT.
- Nåværende designkvalitet: ferdig (hybrid, ekte data).
- Redesign-prioritet: P2

### /portal/meg/profil
- Fil: `src/app/portal/meg/profil/page.tsx`
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: rediger egen profil (det coachen + topplister ser).
- Data vist: name/email/phone/hcp/homeClub/avatarUrl → User; gruppe → `groupMember.group.name` (read-only); dominant hånd finnes IKKE i Prisma → tomt placeholder-felt (lagres ikke, per kommentar).
- Komponenter: `MeSub` (delt); `./profil-rediger-form` (client, avatar-opplasting via lib/storage/avatar); action `../actions` (`oppdaterProfil`).
- Layout og hierarki: MeSub-header (MEG · PROFIL / «Rediger profil.») → avatar 72px + «Bytt bilde» → skjema-grid (1 kol mobil / 2 kol md) → «Lagre endringer» + «Avbryt».
- Tilstander: success via action; loading/empty/error MANGLER eksplisitt i page (i form).
- Interaksjoner: lagre/avbryt; bytt bilde.
- AK-domene vist: hcp, gruppe.
- Designfil-referanse: ph-screens.jsx (ProfilScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/profil/rediger
- Fil: `src/app/portal/meg/profil/rediger/page.tsx`
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: alternativ/eldre profil-rediger-inngang (henter `tier` m.m. fra DB).
- Data vist: User-felter inkl. `tier: dbUser?.tier ?? "GRATIS"`.
- Merknad: **mulig duplikat** av `/profil` — to redigerings-ruter for samme datasett. Verifiser om begge er lenket fra nav (kandidat for konsolidering). 69 linjer.
- Tilstander: UVERIFISERT i detalj.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (sannsynlig overlapp med /profil).
- Redesign-prioritet: P2 (rydd duplikat)

---

## Abonnement (gating-fokus)

### /portal/meg/abonnement
- Fil: `src/app/portal/meg/abonnement/page.tsx` (398 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`; tilstands-gating på tier/credits/status (se nederst).
- Jobb: abonnement-hub — viser app-tilgangsstatus (gratis via pakke vs PRO 300 kr/mnd) + handlinger + fakturaer.
- Data vist: `getAbonnementData(user.id)` (`src/lib/portal-abonnement/abonnement-data.ts`) → `erPro` (fra `user.tier`), `status`, `nesteTrekk` (`subscription.currentPeriodEnd`), `monthlyCredits`/`creditsRemaining`, `fakturaer` (`payment` SUCCEEDED, take 12). Banners fra `searchParams` (ok/cancelled/avbestilt) + `PAST_DUE` fra DB.
- Komponenter: `MeSub/SetGroup/SetLinkRow/SetRow` (delt); `AthleticBadge`; lokale `ProUpgradeCard`/`ProStatusCard`/`GratisCard`/`PlanerListe`.
- Layout og hierarki: status-banners → ÉN hybrid-kort (velges av tilstand) → «Planer»-liste (Gratis 0 kr / Kun PlayerHQ 300 kr, «Nå»-pill) → HVA SOM INNGÅR → HANDLINGER (betinget) → FAKTURAER (≤5) → «Administrer pakke».
- Tilstander: success/cancelled/avbestilt-banners; `PAST_DUE` alert m/ «Endre kort»; empty (ingen fakturaer → seksjon skjules). Loading MANGLER eksplisitt.
- Interaksjoner: «Start PRO · 300 kr/mnd» → `/oppgrader/flyt`; «Endre kort» → `/kort/ny`; «Avbestill» → `/avbestill`; faktura-rad → `/faktura/[id]`.
- AK-domene vist: tier (GRATIS/PRO), credits/coaching-pakke (Performance/Performance Pro avledet av credits), abonnement-status.
- Designfil-referanse: «PlayerHQ Meg Abonnement (hybrid).dc.html» (nevnt i header-kommentar).
- Nåværende designkvalitet: ferdig — sterkt portet, korrekt gating, ærlige data.
- Redesign-prioritet: P3

### /portal/meg/abonnement/oppgrader
- Fil: `src/app/portal/meg/abonnement/oppgrader/page.tsx` (8 linjer)
- Stub: ren `redirect("/portal/meg/abonnement/oppgrader/flyt")` (historisk mailto-BETA-rute beholdt for eksterne lenker).
- Redesign-prioritet: P3 (ikke en skjerm)

### /portal/meg/abonnement/oppgrader/flyt
- Fil: `src/app/portal/meg/abonnement/oppgrader/flyt/page.tsx`
- Flate: PlayerHQ (mobil-først 430px)
- Rolle/gating: `requirePortalUser`; redirect til `/abonnement` hvis `erPro` ELLER `status === "PAST_DUE"` (unngår dobbel-abonnement i Stripe).
- Jobb: PRO-checkout-flyt (verdi → betaling → Stripe Checkout).
- Data vist: `getAbonnementData` (kun `erPro`/`status` for gating).
- Komponenter: `./oppgrader-flyt-wizard` (OppgraderFlytWizard, client).
- Layout og hierarki: wizard; CTA åpner Stripe Checkout.
- Tilstander: gating-redirect; resten i wizard.
- AK-domene vist: PRO 300 kr/mnd (ELITE eksplisitt utelukket i kommentar).
- Designfil-referanse: UVERIFISERT (kode-port, ikke .dc.html-navngitt).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/abonnement/avbestill
- Fil: `src/app/portal/meg/abonnement/avbestill/page.tsx` (174 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: «siste bekreftelse»-skjerm før avbestilling av PRO.
- Data vist: `subscription.currentPeriodEnd` → `proAktivTil`/`dagerIgjen`; konsekvenser er **statisk hardkodet liste** (`KONSEKVENSER`).
- Komponenter: `./avbestill-buttons` (client); lucide; ingen MeSub (egen sentrert hero-layout).
- Layout og hierarki: danger-ring-hero → «Pro aktiv til»-dato → «Dette mister du» (5 rader) → lime «pause i 1 mnd»-banner → avbestill-knapper → esc/tilbake-fotnote.
- Tilstander: ingen empty/error; antar aktivt abonnement (fallback +31 dager hvis ingen subscription).
- Interaksjoner: avbestill (action i buttons); «Pause →»-knapp er **ikke-funksjonell** (button uten handler); tilbake.
- AK-domene vist: AI-coach/credits/videoanalyse/historikk/familiekonto-konsekvenser (illustrativt).
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig visuelt, men inneholder **inline hex/rgba** (`rgba(163,45,45,…)`, `rgba(209,248,67,…)`) i style-props — bryter «ingen hardkodet hex»-regelen; «Pause» er død knapp.
- Redesign-prioritet: P1 (token-rydding + død knapp)

### /portal/meg/abonnement/kort/ny
- Fil: `src/app/portal/meg/abonnement/kort/ny/page.tsx` (137 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser` + redirect hvis ingen subscription eller status ∉ {ACTIVE, PAST_DUE, TRIALING}.
- Jobb: åpne Stripe Customer Billing Portal for kort-administrasjon (lagrer aldri kortdata).
- Data vist: `subscription.currentPeriodEnd`/`status`; «Neste belastning 300 kr» (pris hardkodet tekst), neste dato fra DB.
- Komponenter: `./aapne-stripe-portal` (client, POST `/api/stripe/portal`); lucide.
- Layout og hierarki: tilbake → header «Administrer kort» → Stripe-portal-knapp + «vi lagrer aldri kort» → neste belastning → sikkerhet (PCI-DSS/3DS).
- Tilstander: gating-redirect; loading/error i client-knapp.
- AK-domene vist: 300 kr/mnd PRO.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/abonnement/faktura/[id]
- Fil: `src/app/portal/meg/abonnement/faktura/[id]/page.tsx` (285 linjer)
- Flate: PlayerHQ (max-w-820px, utskriftsvennlig)
- Rolle/gating: `requirePortalUser`; henter kun brukerens egen `payment` (`findFirst userId`).
- Jobb: full faktura-detalj med MVA-splitt, status, last ned/send.
- Data vist: `payment` (amountOre/status/paidAt/createdAt/type/description/stripeChargeId/stripeInvoiceId); netto/mva utledet (80/20-split → 25 % MVA); forfall = +14 d.
- Komponenter: `PrintButton` (shared); `./faktura-actions` (`LastNedPdfKnapp`/`SendEpostKnapp`); lokale `MetaBlock`/`MetaMini`/`TotalRow`.
- Layout og hierarki: tilbake → faktura-hero + status-pill + handlinger → meta-grid → fakturalinje-tabell → totaler → betalingsinfo (kun hvis betalt) → footer m/ support-lenke.
- Tilstander: **empty/not-found** håndtert (FileX-kort); betalt/refundert/feilet/venter status-labels.
- AK-domene vist: ingen (rent finans).
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig — solid, ærlig not-found.
- Redesign-prioritet: P3

---

## Innstillinger

### /portal/meg/innstillinger
- Fil: `src/app/portal/meg/innstillinger/page.tsx` (179 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: innstillings-hub (varsler, integrasjoner, app, sikkerhet, AI, personvern).
- Data vist: `lesPreferences(user)`; integrasjons-chips fra ekte tellinger (`trackManSession.count`, `round.count`); språk fra prefs.
- Komponenter: `MeSub/SetGroup/SetLinkRow/SetRow/SetVal` (delt); `./varsler-toggles` (client); `Toggle`; `AthleticBadge`; `buttonClasses`.
- Layout og hierarki: VARSLER (toggles) → INTEGRASJONER (TrackMan/Garmin/Golfbox) → APP (Enheter/Språk/Mørk modus-låst-AV) → SIKKERHET (passord/BankID/enheter) → AI (→ ai-coach) → PERSONVERN (GDPR-inngang).
- Tilstander: chips «På/Av» fra ekte data; «Mørk modus» bevisst låst AV («Kommer senere») — PlayerHQ alltid lyst (låst beslutning); «Aktive enheter» = «—» (ærlig, ingen liksom-tall).
- Interaksjoner: toggles lagrer; rader lenker til undersider.
- AK-domene vist: integrasjonsstatus (TrackMan/Golfbox).
- Designfil-referanse: ph-screens.jsx (InnstillingerScreen 678–707) per kommentar. PERSONVERN-seksjon er bevisst tilføyelse (review-funn B1, GDPR).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/innstillinger/varsler
- Fil: `src/app/portal/meg/innstillinger/varsler/page.tsx` (51 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: detaljert varsel-styring + push-tillatelse.
- Data vist: `lesPreferences` av `user.preferences`.
- Komponenter: `../notif-toggles` (NotifToggles); `PushToggle` (shared client).
- Layout: **eldre chrome** — ChevronLeft «Tilbake til innstillinger» + PlayerHero-aktig header (mono eyebrow «PlayerHQ · Meg · Innstillinger · Varsler» + italic display-tittel), IKKE MeSub. Kort med rounded-lg (ikke 2xl).
- Tilstander: auto-lagring; ingen empty/error.
- AK-domene vist: ingen.
- Designfil-referanse: UVERIFISERT (eget idiom, ikke MeSub-port).
- Nåværende designkvalitet: inkonsistent — annet header-/kort-idiom enn MeSub-skjermene.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/sprak
- Fil: `src/app/portal/meg/innstillinger/sprak/page.tsx` (57 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: velg språk (no/en); region/format = «kommer Q3 2026».
- Data vist: `lesPreferences(...).spraak`.
- Komponenter: `./sprak-toggle` (SpraakToggle, client).
- Layout: samme eldre idiom (ChevronLeft + pill-eyebrow + italic display) som /varsler; stiplet «kommer senere»-kort.
- Tilstander: empty/«kommer» via stiplet kort.
- AK-domene vist: ingen.
- Nåværende designkvalitet: inkonsistent (samme avvik som /varsler).
- Redesign-prioritet: P2

### /portal/meg/innstillinger/sikkerhet
- Fil: `src/app/portal/meg/innstillinger/sikkerhet/page.tsx` (218 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: sikkerhetsoversikt — score, passord, 2FA, økter.
- Data vist: `user.email` → ærlig heuristisk score (80 m/ e-post, ellers 55); `lastLoginAt` (nevnt i kommentar).
- Komponenter: lokale; lucide. Ikke MeSub.
- Layout: ChevronLeft + display-header; score-stat; passord-/2FA-/enhets-rader (enhetsliste markert V2/«under utvikling»).
- Merknad: **dupliserer `/portal/meg/sikkerhet`** (egen score-logikk: her 80/55, der 65/40). To sikkerhetsskjermer for samme bruker — bør konsolideres.
- Tilstander: ærlig «under utvikling» i stedet for falske rader.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig men duplisert + avvikende score-tall.
- Redesign-prioritet: P1 (konsolider med /meg/sikkerhet)

### /portal/meg/innstillinger/integrasjoner
- Fil: `src/app/portal/meg/innstillinger/integrasjoner/page.tsx` (523 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: koble til/administrere eksterne datakilder (TrackMan, Garmin/Apple, Golfbox m.fl.).
- Data vist: ekte tilkoblings-status (tilkoblet vs tilgjengelig-seksjoner med tellinger).
- Komponenter: lokale `IntegrationCard`/`SectionHead`; svg-logoer inline.
- Layout: «Tilkoblet (N aktive / ingen enda)» → «Tilgjengelig». `IntegrationCard` har valgfri **PRO-badge** (accent-pill) — markerer PRO-eksklusive integrasjoner (app-nivå PRO, konsistent med 300 kr-modellen, ikke ELITE).
- Tilstander: tilkoblet/ledig; teller-drevet.
- AK-domene vist: PRO-gating på enkelte integrasjoner; TrackMan/Golfbox.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig (rikeste innstillings-skjerm).
- Redesign-prioritet: P3

### /portal/meg/innstillinger/ai-coach
- Fil: `src/app/portal/meg/innstillinger/ai-coach/page.tsx` (144 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: «kommer snart»-teaser for AI-coach V2.
- Data vist: ingen (statisk).
- Layout: ChevronLeft + info-badge «Kommer snart · V2» + display-header «AI…».
- Tilstander: ren «kommer»-tilstand.
- Merknad: bruker `var(--color-primary)` i inline style — sjekk om token-navnet finnes (de fleste skjermer bruker `hsl(var(--primary))`/`text-primary`). Mulig feil token-referanse.
- Nåværende designkvalitet: ferdig (teaser) men mulig token-navn-avvik.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/anlegg
- Fil: `src/app/portal/meg/innstillinger/anlegg/page.tsx` (62 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","PARENT","COACH","ADMIN"] })`
- Jobb: registrer tilgjengelig utstyr/anlegg → filtrerer drill-bibliotek + AI-plan.
- Data vist: `user.tilgjengeligeFasiliteter` (`DrillFasilitet[]`).
- Komponenter: `./fasilitet-profil-form` (client).
- Layout: breadcrumb (ChevronLeft Innstillinger / Mitt treningsanlegg) + mono-eyebrow + display-tittel + form. Eget idiom (ikke MeSub).
- Tilstander: tom liste = ingen valgte.
- AK-domene vist: drill-fasiliteter (kobling til drill/AI-plan).
- Nåværende designkvalitet: ferdig men inkonsistent chrome.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/okter
- Fil: `src/app/portal/meg/innstillinger/okter/page.tsx` (54 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: aktive sesjoner / apparater — **ren tom-tilstand**, «Apparat-oversikt kommer Q3 2026».
- Komponenter: `EmptyState` (shared); lucide. Eget idiom (ChevronLeft + display + mono-eyebrow).
- Tilstander: kun empty/«kommer».
- AK-domene vist: ingen.
- Nåværende designkvalitet: stub/«kommer» — ærlig.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/personvern
- Fil: `src/app/portal/meg/innstillinger/personvern/page.tsx` (120 linjer)
- Flate: PlayerHQ (max-w-1240px — bredt admin-aktig)
- Rolle/gating: `requirePortalUser`
- Jobb: GDPR — dataeksport (art. 15) + kontosletting (art. 17).
- Data vist: ingen (handlings-skjerm).
- Komponenter: `PageHeader` (eldre shared header); `PersonvernActions` (client, kind="export"/delete); lucide.
- Layout: PageHeader → eksport-kort → destruktivt slett-kort.
- Tilstander: action-drevet.
- Merknad: `/innstillinger/eksport` redirecter hit. `PageHeader`-bruk + 1240px = enda et tredje header-idiom.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig men chrome-avvik (bred + PageHeader).
- Redesign-prioritet: P2

### /portal/meg/innstillinger/eksport
- Fil: `src/app/portal/meg/innstillinger/eksport/page.tsx` (8 linjer)
- Stub: `redirect("/portal/meg/innstillinger/personvern")`.
- Redesign-prioritet: P3 (ikke en skjerm)

---

## Sikkerhet (toppnivå — duplikat-kandidat)

### /portal/meg/sikkerhet
- Fil: `src/app/portal/meg/sikkerhet/page.tsx` (163 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: sikkerhetsoversikt — score, 2FA-lenke, økter/innloggings-historikk («kommer snart»).
- Data vist: `user.email` → score (her **65/40**, jf. innstillinger/sikkerhet sin 80/55 — avvik).
- Komponenter: lokale; lucide. Egen topbar (ChevronLeft «Profil»).
- Layout: topbar → score-stat → 2FA → økter/historikk.
- Merknad: **direkte duplikat** av `/portal/meg/innstillinger/sikkerhet`. To inngangsdører, ulik score-formel — én bør vinne.
- Tilstander: ærlig «kommer snart».
- Nåværende designkvalitet: ferdig men duplisert.
- Redesign-prioritet: P1 (konsolider)

### /portal/meg/sikkerhet/2fa
- Fil: `src/app/portal/meg/sikkerhet/2fa/page.tsx` (31 linjer)
- Flate: PlayerHQ (max-w-1240px)
- Rolle/gating: `requirePortalUser`
- Jobb: aktiver tofaktor (TOTP) — 3-stegs flyt.
- Komponenter: `PageHeader` (PlayerHero alias); `./twofa-client` (TwoFaClient).
- Layout: tilbake → PageHeader → wizard.
- Tilstander: i client.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig (ekte TOTP); 1240px-bredde avviker fra 480px-sikkerhetsskjermene den lenkes fra.
- Redesign-prioritet: P2

---

## Helse

### /portal/meg/helse
- Fil: `src/app/portal/meg/helse/page.tsx` (174 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: helse & readiness — KPI-er + uke-status + skade + logg-inngang.
- Data vist: `healthEntry` siste 14 d (hvilepuls/søvn/vekt); `leave` (aktiv/tidligere skade, isInjury); `hentFysScore(user.id)` (`lib/fys-data`); søvn-snitt siste 7 d utledet.
- Komponenter: `MeSub/SetGroup/SetRow/SetVal` (delt); `KpiCard` (athletic); `AthleticBadge`; `./helse-form` (client).
- Layout: MeSub-header → 3-KPI-grid (FYS-score / Hvilepuls / Søvn) → DENNE UKA (Søvn/Belastning/HRV) → SKADE & STATUS → accent-disclaimer → logg-form.
- Tilstander: «—» når data/formel mangler (FYS, Belastning, HRV — ærlige plassholdere, aldri liksom-tall); «Ingen aktive skader/Frisk»-empty.
- AK-domene vist: **FYS-score** (stall-relativ testbatteri-form 0–100, Anders' formel 2026-06-22), antall FYS-tester.
- Designfil-referanse: ph-screens.jsx (HelseScreen 710–734) per kommentar.
- Nåværende designkvalitet: ferdig — eksemplarisk ærlig plassholder-disiplin.
- Redesign-prioritet: P3

### /portal/meg/helse/symptom/ny
- Fil: `src/app/portal/meg/helse/symptom/ny/page.tsx` (36 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: 3-stegs symptom-wizard (kroppskart → intensitet/varighet → triggere/notat).
- Komponenter: `./wizard` (SymptomWizard, client, `logSymptom`); topbar ChevronLeft «Helse».
- Layout: topbar → wizard.
- Tilstander: i wizard.
- AK-domene vist: symptom/skade-logg.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

---

## Hjelp

### /portal/meg/help
- Fil: `src/app/portal/meg/help/page.tsx` (100 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: hjelp & support-hub — FAQ + kontaktkanaler + feedback-CTA.
- Data vist: statisk `FAQ` (4 par, inkl. korrekt «300 kr/mnd, ingen nivåer»-svar).
- Komponenter: `MeSub/SetGroup/SetRow` (delt); `./faq-accordion` (client).
- Layout: MeSub → OFTE STILTE SPØRSMÅL (accordion) → TA KONTAKT (chat/e-post/veiledninger) → full-bredde «Send forslag eller meld feil».
- Interaksjoner: → `/help/kontakt`, mailto, → `/help/kategori/komme-i-gang`, → `/feedback`.
- AK-domene vist: prismodell-svar i FAQ.
- Designfil-referanse: ph-screens.jsx (HjelpScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/help/kontakt
- Fil: `src/app/portal/meg/help/kontakt/page.tsx` (48 linjer)
- Flate: PlayerHQ (max-w-720px)
- Rolle/gating: `requirePortalUser`
- Jobb: kontakt support-skjema med svartid-indikator.
- Data vist: `user.name`/`user.email` forhåndsutfylt; `searchParams.ticket` → kvitterings-banner.
- Komponenter: `PageHeader` (PlayerHero alias); `./kontakt-support-form` (client).
- Layout: PageHeader → live svartid-pill (~4t) → ticket-banner → skjema.
- Tilstander: success (ticket-id).
- Merknad: bruker PageHeader, ikke MeSub (chrome-avvik fra /help-hubben det lenkes fra).
- Nåværende designkvalitet: ferdig men inkonsistent chrome.
- Redesign-prioritet: P2

### /portal/meg/help/artikkel/[slug]
- Fil: `src/app/portal/meg/help/artikkel/[slug]/page.tsx` (287 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: enkelt hjelpe-artikkel (slug-basert).
- Data vist: artikkel-innhold (UVERIFISERT om DB eller statisk innholds-map — 287 linjer tyder på statisk content).
- Tilstander: not-found UVERIFISERT.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (ikke fullt lest).
- Redesign-prioritet: P2

### /portal/meg/help/kategori/[slug]
- Fil: `src/app/portal/meg/help/kategori/[slug]/page.tsx` (448 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: hjelp-kategori-oversikt (slug-basert, lister artikler).
- Data vist: kategori + artikkel-liste (UVERIFISERT kilde; 448 linjer → trolig stort statisk innholds-map).
- Tilstander: not-found UVERIFISERT.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (ikke fullt lest).
- Redesign-prioritet: P2

### /portal/meg/feedback
- Fil: `src/app/portal/meg/feedback/page.tsx` (35 linjer)
- Flate: PlayerHQ (max-w-640px)
- Rolle/gating: `requirePortalUser`
- Jobb: app-feedback (bug/forslag/ros) + historikk.
- Data vist: `searchParams.takk` → takke-banner; historikk fra `FeedbackHistorikk` (client).
- Komponenter: `PageHeader` (PlayerHero alias); `./app-feedback-form`; `./feedback-historikk`.
- Layout: PageHeader → takke-banner → skjema → historikk.
- Tilstander: success-banner.
- Nåværende designkvalitet: ferdig men PageHeader-chrome (avvik fra MeSub-hubben).
- Redesign-prioritet: P2

---

## Øvrige

### /portal/meg/bookinger
- Fil: `src/app/portal/meg/bookinger/page.tsx` (64 linjer)
- Flate: PlayerHQ (max-w-1240px)
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`
- Jobb: egne bookinger (kommende/historikk) + ny-booking-inngang.
- Data vist: `booking` m/ serviceType+location; `subscription.monthlyCredits>0` → academy-kunde → `nyBookingHref` (`/portal/booking/ny` vs `/booking`).
- Komponenter: `PageHeader` (PlayerHero alias); `./bookinger-tabs` (client).
- Layout: PageHeader + «Ny booking»-CTA → tabs (kommende/historikk).
- Tilstander: filtrert kommende/historikk; empty UVERIFISERT (i tabs).
- AK-domene vist: credits → academy-kunde-gating av booking-rute.
- Nåværende designkvalitet: ferdig men PageHeader/1240px-chrome.
- Redesign-prioritet: P2

### /portal/meg/bookinger/reschedule/[bookingId]
- Fil: `src/app/portal/meg/bookinger/reschedule/[bookingId]/page.tsx` (155 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`; redirect ved <24t-regel (`?error=24t`) eller avbestilt (`?error=cancelled`).
- Jobb: bytt tid på en eksisterende booking.
- Data vist: booking-detaljer; tilgjengelige tider (UVERIFISERT kilde).
- Layout: PageHeader «PlayerHQ · Bytt tid».
- Tilstander: error-redirect (24t/cancelled).
- AK-domene vist: 24-timers reschedule-regel.
- Nåværende designkvalitet: ferdig (forretningsregel håndhevet).
- Redesign-prioritet: P3

### /portal/meg/dokumenter
- Fil: `src/app/portal/meg/dokumenter/page.tsx` (130 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: samlede avtaler/samtykker/fakturaer som dokument-liste.
- Data vist: `document` (delte `userId:null` + egne); kind → ikon/chip/label via maps.
- Komponenter: `MeSub` (delt); `AthleticBadge`; lucide.
- Layout: MeSub → ÉN liste med dokument-rader (ikon-chip + tittel + dato/type + chip + chevron, åpner `d.url` i ny fane).
- Tilstander: **empty** håndtert («Ingen dokumenter ennå.»).
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/utstyrsbag
- Fil: `src/app/portal/meg/utstyrsbag/page.tsx` (49 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`
- Jobb: registrer køllesett/ball/spesifikasjoner (TrackMan-kalibrering).
- Data vist: `equipmentBag` (driver/woods/hybrids/irons/wedges/putter/ball/bag/notes).
- Komponenter: `MeSub` (delt); `./utstyrsbag-view` (client, gjenbruker UtstyrsbagForm + `lagreUtstyrsbag`).
- Layout: MeSub → kølle-rader → BALL & ØVRIG → knapper («Legg til kølle» + «Se TrackMan-tall»).
- Tilstander: tomt bag → undefined-felter (form håndterer).
- AK-domene vist: utstyr ↔ TrackMan-kobling.
- Designfil-referanse: ph-screens.jsx (UtstyrScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/foreldre
- Fil: `src/app/portal/meg/foreldre/page.tsx` (64 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER"] })` (kun spiller ser egne foresatte)
- Jobb: vis koblede foresatte/verger.
- Data vist: `parentRelation` (childId=user) → parent name/email/relationship; `relasjonLabel` normaliserer far/mor/verge.
- Komponenter: `ForeldreInfo` (`components/portal/meg/foreldre-info`, eier all layout); page rendrer kun mappet data.
- Layout: helt i ForeldreInfo-komponenten (ikke MeSub i page).
- Tilstander: tom-tilstand (stiplet kort) når ingen foresatte — aldri dummy.
- AK-domene vist: forelder-relasjon.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3
