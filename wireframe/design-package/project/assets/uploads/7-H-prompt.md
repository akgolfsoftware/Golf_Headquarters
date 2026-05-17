# Custom prompt for Mini-batch 7-H - Tverrgaaende katalog-flater 20-25 (siste batch!)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/design-batches/batch-7-other/mini-batches/7-H.md`
5. Alle 7 HTML-filer listet i `7-H-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-H.md) med 7 tverrgaaende katalog-flater. Dette er siste mini-batch i batch 7 (og dermed siste design-fase foer implementasjon).

## Hva jeg vil

**Generer alle 7 skjermer i ETT loep.** Lever som 7 UI-kits.

Rekkefoelge:
1. Sidebar-moenstre (6 varianter med live demos)
2. Topbar + breadcrumbs (4 varianter)
3. Onboarding-flyt full (PlayerHQ 5-stegs + CoachHQ 4-stegs)
4. Facility manager (drifts-dashboard)
5. Innstillings-layout (felles shell 4 varianter)
6. Notifikasjons-taksonomi (34-typer-tabell)
7. Modal-katalog referanse-indeks (42 modaler i tabell)

For hver: les spec (36- til 42-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit.

Etter alle 7: samlet oversikt + design-links + total-feiring (alle 42 batch-7-pakker ferdig!).

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil-krav:**
- Norsk bokmaal, komma som desimal, mellomrom som tusenseparator
- Maks 3 lime-elementer per skjerm
- 8pt-grid, Lucide 1.75 stroke
- Asymmetrisk layout

**Anti-AI:**
- ALDRI "God morgen [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Hvor man navigerer."* / *"Oeverst paa siden."* / *"Velkommen, Markus."* / *"Hvordan fasilitetene har det."* / *"Hvor man styrer tingene."* / *"Hva vi varsler om."* / *"Modal-indeks."*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Sidebar:** CoachHQ TO-LAGS for admin-flater. PlayerHQ for onboarding (siden det er spiller-focused i steg 1-5).

**Spesifikt for Pakke 1 (Sidebar-moenstre):**
- Vis BAADE CoachHQ to-lags OG PlayerHQ-varianter side-om-side
- Active states maa vaere tydelige

**Spesifikt for Pakke 3 (Onboarding):**
- Full-screen layout - INGEN sidebar, INGEN topbar
- Center-column 480px
- Progress-stepper med 5 sirkler (PlayerHQ) eller 4 (CoachHQ)
- Konfetti-animasjon paa OnboardingSuccessModal (kan vises som statiske confetti-elementer hvis animasjon ikke mulig)

**Spesifikt for Pakke 7 (Modal-indeks):**
- 42 modaler i tabell - vis et representativt utvalg (15-20 rader er nok for visuell oversikt)
- Status-pills: Designet (accent), Stub (gold), Avskaffet (muted)

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Sidebar-moenstre). Fortsett uten avbrudd til alle 7 er ferdige.

Etter ferdig:
- Samlet oversikt med alle 7 thumbnails
- Design-links liste
- Caveats per skjerm
- Liten oppsummering: "Batch 7 er ferdig - alle 42 pakker dekket"
