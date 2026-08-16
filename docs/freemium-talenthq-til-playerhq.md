# Freemium-flyt: TalentHQ → PlayerHQ (spec, utkast 2026-07-31)

> ⚠ **ERSTATTET 2026-08-16 — IKKE BYGG MOT DENNE.** Anders besluttet en annen
> gate enn spec-en foreslår: den gratis, låste profilen åpner KUN
> testregistrering (CANON-protokollene), stats-/analyse-lesing,
> SG-/runderegistrering, DataGolf-sammenligning, talent-flatene, booking og
> konto — ikke spec-ens «3 gratis økter»-modell. Gjeldende fasit:
> `docs/platform/BUSINESS-RULES.md` §Abonnement og tilgang (nivået TALENT),
> `src/lib/feature-flags.ts` (resolveTilgang) og
> `src/lib/auth/talent-allowlist.ts` (rutekontrakten).
> Fila beholdes kun som historikk for utredningen bak beslutningen.

**Status:** FORSLAG — venter på Anders' godkjenning før implementering.
**Forfatter:** Kimi Code, på bakgrunn av arkitektur-beslutninger 2026-07-31.

## 1. Mål

TalentHQ er gratis for spiller, WANG og Team Norway. Det skal drive salg av
PlayerHQ-abonnement: spilleren får automatisk tilgang til PlayerHQ med et
nyttig, men begrenset gratisnivå, og kan låse opp resten med abonnement.

## 2. Utgangspunkt (verifisert i kode)

- **Delt Supabase Auth** mellom TalentHQ og HQ: én konto, én innlogging.
  Redirect-URLs for begge domener er på plass (2026-07-31).
- **Tier-modellen finnes allerede:** `User.tier` (GRATIS/PRO — ELITE er død),
  `Subscription` (Stripe, `monthlyCredits`/`creditsRemaining`),
  `/portal/meg/abonnement` leser faktisk tier fra DB
  (`src/lib/portal-abonnement/abonnement-data.ts`).
- **Ingen provisjonering på tvers ennå:** en TalentHQ-bruker har ikke
  automatisk en `public.users`-rad i HQ før den opprettes (lazy eller ved
  første innlogging).

## 3. Flyt

1. Spiller oppretter konto i TalentHQ (via WANG/Team Norway-invitasjon eller
   selvregistrering på akgolf.no).
2. Første gang spilleren åpner PlayerHQ: `public.users`-rad opprettes lazy
   (samme supabase_uid/e-post), tier = GRATIS.
3. Gratisnivået: spilleren SER alle funksjoner, kan bruke workbench til å
   planlegge inntil 3 aktive treningsøkter. Alt annet er låst med
   oppgraderings-CTA som peker på Stripe Checkout.
4. Ved kjøp: Stripe webhook setter tier = PRO, alt låses opp.

## 4. Forslag: hva er gratis vs. låst

| Funksjon | Gratis (TalentHQ-spiller) | PRO |
|---|---|---|
| Se egen profil, SG og statistikk (les) | ✓ | ✓ |
| Workbench — planlegg inntil 3 aktive økter | ✓ | ✓ (ubegrenset) |
| Workbench — flere enn 3 økter | Låst (CTA) | ✓ |
| Treningshistorikk/logg eldre enn 30 dager | Låst (CTA) | ✓ |
| Analyse utover topplinje (SG-detalj, TrackMan, spredning) | Låst (CTA) | ✓ |
| AI-coach / minne / credits | Låst (CTA) | ✓ (credits) |
| Booking av coaching/fasiliteter | ✓ (ubegrenset — salgskanal) | ✓ |
| Sammenligning mot DataGolf-proffer | ✓ (det er TalentHQs lokke) | ✓ |

Prinsipp: gratisnivået skal være nyttig nok til at spilleren bygger en vane
(3 økter = en ukes trening), men såpass begrenset at den som trener
strukturert over tid trenger PRO.

## 5. Teknisk design

- **Én sannhetskilde:** `User.tier` (som i dag), lest server-side. Ingen ny
  entitlement-tabell — GRATIS er bare standardverdien.
- **Gate-helper:** `krevPro(feature)`-server helper + `ProGate`-komponent for
  UI-låsing (vis funksjonen nedtonet med lås + CTA, aldri skjul helt —
  gratisnivået skal vise hva man får).
- **3-økts-regel:** håndheves server-side ved oppretting av planlagt økt
  (tell aktive/fremtidige økter for brukeren; >3 og tier=GRATIS → 403 med
  oppgraderingspayload). Aldri kun klient-side.
- **Lazy provisjonering:** ved første PlayerHQ-treff uten `public.users`-rad:
  opprett med tier=GRATIS. TalentHQs `dashboard.akgolf_user_links` kan
  gjenbrukes som idempotent koblingspunkt.
- **Stripe:** én PRO-price (måned). Webhook finnes (`src/lib/payments/`).

## 6. Personvern / GDPR

Ingen ny datainnsamling — samme konto, samme base. Gratisnivået endrer ikke
behandlingsgrunnlaget. TalentHQ-spillere som aldri åpner PlayerHQ får ingen
`public.users`-rad (lazy = ingen spekulative profiler).

## 7. Åpne avgjørelser (Anders må ta stilling)

1. Er 3 aktive økter riktig grense? (Alternativ: 5, eller ubegrenset antall
   men kun 1 uke frem i tid.)
2. Er gating-tabellen i pkt. 4 riktig — spesielt at analyse og historikk er
   låst, mens DataGolf-sammenligning er gratis?
3. Skal WANG/Team Norway-spillere ha gratis PRO så lenge de er aktive i
   gruppa (org-sponsede plasser), eller er PRO alltid personlig kjøp?
4. Pris på PRO/måned og om det finnes egne ungdomspriser.

## 8. Implementeringssteg (etter godkjenning)

1. `krevPro`/`ProGate` + tier-lesing server-side (bak `User.tier`).
2. 3-økts-regel i workbench-oppretting + tester.
3. Lås analyse/historikk/AI-coach bak ProGate med CTA-flyt til Stripe.
4. Lazy provisjonering av HQ-bruker ved første PlayerHQ-treff.
5. Ende-til-ende-test: TalentHQ-konto → gratis PlayerHQ → Stripe-testkjøp → PRO.
