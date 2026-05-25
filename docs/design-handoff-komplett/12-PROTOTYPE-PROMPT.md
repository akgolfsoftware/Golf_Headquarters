# 12 — Prototype-prompt (lim inn i Claude Design)

Dette er den endelige prompten du sender til Claude Design (claude.ai/design) for å få 2 fullt interaktive prototyper.

**Kopier ALT under linja og lim inn i Claude Design:**

---

```
═══════════════════════════════════════════════════════════
AK GOLF HQ — INTERAKTIVE PROTOTYPER (PlayerHQ + CoachHQ)
═══════════════════════════════════════════════════════════

Bygg 2 fullt interaktive prototyper basert på dokumentasjonen i prosjektet.

REFERANSER (les disse først):
- 00-INDEX.md (innholdsfortegnelse)
- 01-BRANDING.md (brand-identity)
- 02-DESIGN-SYSTEM.md (tokens, fonter, spacing, radius, ikoner)
- 03-TONE-OF-VOICE.md (språk + faste termer)
- 04-COMPONENT-INVENTORY.md (alle 71 komponenter)
- 05-LAYOUT-PATTERNS.md (sidebar, topbar, shells)
- 06-INTERACTIONS.md (animasjoner, timing, easing)
- 07-ACCESSIBILITY.md (WCAG 2.1 AA)
- 08-DEMO-DATA.md (Øyvind Rohjan + alle spillere)
- 09-PLAYERHQ-SCREENS.md (~100 PlayerHQ-skjermer)
- 10-COACHHQ-SCREENS.md (~133 CoachHQ-skjermer)
- 11-ROUTES-AND-AUTH.md (Next.js routes + rolle-guards)

═══════════════════════════════════════════════════════════
ABSOLUTT KRAV
═══════════════════════════════════════════════════════════

1. PIXEL-PERFECT på 5 viewports for BÅDE PlayerHQ og CoachHQ:
   - iPhone 14 Pro (393×852)
   - iPad portrait (810×1080)
   - iPad landscape (1180×820)
   - Desktop (1440×900)
   - Desktop wide (1920×1080)

2. KUN LIGHT TEMA i første runde (ingen dark mode-toggle)

3. INGEN UBRUKTE SKJERMER — hver skjerm i 09-PLAYERHQ-SCREENS.md
   og 10-COACHHQ-SCREENS.md må være tilgjengelig fra navigasjon,
   knapper, modaler eller wizards

4. ALLE KNAPPER MÅ VÆRE AKTIVE:
   - Enten gjør noe konkret (navigerer, åpner modal, toggler state,
     sender form med mock-success)
   - Eller eksplisitt DISABLED med tooltip ("Tilgjengelig i full versjon")
   - INGEN "døde" knapper

5. "?"-HJELP-POPUPS på alle komplekse handlinger og termer:
   - Pyramide-vekting, Strokes Gained, RAG-kontekst, Eval-score,
     Foreldresamtykke, m.fl.
   - Format: HelpCircle-ikon → popup med tittel + 2-4 setninger
   - Lukk via X, Esc eller klikk utenfor

6. DUPLIKAT-HÅNDTERING (stopp-punkt):
   - Hvis du finner skjermer med samme funksjon men ulike varianter:
     STOPP og vis screenshots side-by-side (mobile + desktop)
   - Spør Anders hvilken som skal brukes
   - IKKE gjett eller velg automatisk

═══════════════════════════════════════════════════════════
DEMO-DATA (kritisk for konsistens)
═══════════════════════════════════════════════════════════

HOVEDSPILLER: Øyvind Rohjan
- A1-nivå
- HCP: -2.1 (forbedring +0.3 siste 30 dager)
- Tier: PRO
- HomeClub: GFGK
- Neste turnering: Sørlandsåpent 28-30. mai
- Aktiv plan: "Vår 2026 — Spesialisering" (uke 5/8)
- Plan-adherence: 87%
- SG-data: OTT +0.8, APP +0.4, ARG -0.2, PUTT -1.4

DEMO-COACH: Anders Kristiansen (Head Coach)
DEMO-FORELDER: Anders Pedersen (forelder til Markus R.P.)

ANDRE SPILLERE (komplett spec i 08-DEMO-DATA.md):
- Markus Roinaas Pedersen (B1, junior 14 år)
- Sofie Larsen (A2, junior 16 år)
- Tobias Hansen (B2, junior 13 år)
- Liam Simensen (junior 11 år)
- Aksel Eilefsen (junior 11 år, inaktiv 30d)

REGEL: Bruk samme spiller/tall overalt — konsistent gjennom hele prototypen.

═══════════════════════════════════════════════════════════
1. PLAYERHQ-PROTOTYPE
═══════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: Workbench (med Øyvind Rohjan som logget-inn)

ALLE viewports pixel-perfekt.

ALLE prosjekt-skjermer som hører til PlayerHQ må brukes (se 09-PLAYERHQ-SCREENS.md):
- ~100 skjermer
- 8 toppnivå-seksjoner (Auth + 7 hub-områder)
- 6 wizards (Ny økt, Ny booking, Ny test, Logg runde, Egen-test, Egen-challenge)
- 13 modaler
- 7 fullscreen-ruter (Live-økt + Test-utførelse)

FUNKSJONALITET (alle viewports):
- Bottom-nav (mobile) / Sidebar (desktop) bytter mellom 7 seksjoner
- Wizards fungerer steg-for-steg med tilbake-/fortsett-knapper
- Modaler åpner og kan lukkes (Cmd+K søk, Invite-friend, Ny notat, etc.)
- Tabs bytter content
- Live-økt-flyt: brief → active → logger → tapper → summary
- Test-flyt: katalog → tildelt → live → summary
- Drill-detail som slide-in panel (desktop), full-screen modal (mobile)
- "?"-popups overalt på komplekse handlinger
- Tilbake-knapp (ChevronLeft) i Breadcrumb fungerer

═══════════════════════════════════════════════════════════
2. COACHHQ-PROTOTYPE
═══════════════════════════════════════════════════════════

START: Login-skjerm
ETTER LOGIN: AgencyOS (med Anders Kristiansen som logget-inn coach)

ALLE viewports pixel-perfekt — INKLUDERT iPhone (coach på golfbane).

ALLE prosjekt-skjermer som hører til CoachHQ må brukes (se 10-COACHHQ-SCREENS.md):
- ~133 skjermer
- 7 toppnivå-seksjoner (Auth + 6 hub-områder)
- Coach Workbench med modus-toggle (individuelt ⇄ gruppe)
- 12 modaler
- Live-økt-coach-view (3 sider)

FUNKSJONALITET (alle viewports):
- 6 toppnivå-hubs klikkbare: Oversikt · Stall · Planlegge · Gjennomføre · Innsikt · Admin
- Spillervelger (Øyvind Rohjan øverst, søkbar combobox)
- Modus-toggle (individuelt ⇄ gruppe) endrer URL + innhold
- Caddie-chat med Øyvind-kontekst (mock-svar etter 500ms)
- 5 tabs per spiller (I dag · Plan · Analyse · Notater · Kommunikasjon)
- Plan-bygger med drag-drop (touch + maus)
- Kalender uke/måned
- AI-trening admin-skjermer
- "?"-popups overalt

═══════════════════════════════════════════════════════════
LEVERANSER
═══════════════════════════════════════════════════════════

To selvstendige HTML-bundles:

1. playerhq-prototype.zip
   - index.html starter på login
   - Alle ~100 skjermer + assets
   - Fungerer på alle 5 viewports
   - Konsistent state mellom mobile og desktop (localStorage)

2. coachhq-prototype.zip
   - Samme struktur

PLUS 12 RAPPORTER (.md i hver bundle):
- coverage-report.md (hvor er hver skjerm koblet?)
- duplikater-valg.md (Anders' valg + begrunnelse)
- viewport-coverage.md (✓ per 5 viewports per skjerm)
- button-coverage.md (aktiv/disabled per knapp)
- help-popups.md ("?"-popup-innhold per skjerm)
- components-inventory.md (alle gjentakende komponenter)
- tokens-mapping.md (fargenavn-mapping)
- routes-mapping.md (skjerm → Next.js path)
- prisma-mapping.md (skjerm → Prisma-modeller)
- server-actions-spec.md (alle handlinger + signatur)
- auth-guard-matrix.md (rolle per skjerm)
- animations-spec.md (timing + easing)

PLUS _archive/-mappe med skjermer som ble valgt bort.

═══════════════════════════════════════════════════════════
PROSESS
═══════════════════════════════════════════════════════════

1. Les referanse-MD-filene øverst i denne prompten
2. Skann hele prosjektet rekursivt — list alle HTML-filer
3. Identifiser ALLE duplikater + funksjons-likheter
4. STOPP — vis screenshots av varianter (mobile + desktop)
5. Spør Anders per duplikat/likhets-spørsmål
6. Når valgt → bygg prototypene
7. Test på alle 5 viewports
8. Lever begge bundles + 12 rapporter

═══════════════════════════════════════════════════════════
KOMPONENT-NAVNGIVNING (for hand-off til Claude Code)
═══════════════════════════════════════════════════════════

Hver skjerm i prototypen skal være merket med:
- Foreslått Next.js App Router path (eks: /portal/tren/[sessionId])
- Hovedkomponent-navn (eks: SesjonDetalj)
- Hvilke shared komponenter brukes
- Hvilke nye komponenter må lages

Dette gjør Claude Code sin implementering 5-10× raskere.

═══════════════════════════════════════════════════════════
VIKTIGE STILREGLER (re-statert)
═══════════════════════════════════════════════════════════

- Ingen reelle API-kall. Mock data via localStorage.
- Konsistent state mellom viewports.
- Norsk bokmål, "du"-form, ingen emojier.
- Lucide-ikoner kun (stroke 1.5-1.75).
- Premium Scandinavian minimal-stil.
- Maks 8 ord på CTA-knapper.
- Eyebrows: UPPERCASE mono 10px, letter-spacing 0.10em.
- Numbers: JetBrains Mono med tabular-nums.
- Light tema kun (ingen dark mode-toggle i denne runden).
- 8pt-grid (p-2, p-4, p-6, p-8 — ikke p-3, p-5, p-7).
- Border radius: 16px cards, 12px buttons, 8px badges, 999px pills.
- Aldri hardkodede hex-farger (alltid token).
- Aldri "AK GOLF"-tekst i sidebar (bruk SidebarBrand).

═══════════════════════════════════════════════════════════
END OF SPEC
═══════════════════════════════════════════════════════════
```

---

## Slik bruker du prompten

1. **Lim inn referanse-MD-filene** i Claude Design-prosjektet først (00-INDEX → 11-ROUTES-AND-AUTH)
2. **Kopier hele blokken over** ("AK GOLF HQ — INTERAKTIVE PROTOTYPER...")
3. **Lim inn i Claude Design**
4. **Vent på duplikater-spørringer** — svar når du blir spurt
5. **Få leveringen** (2 bundles + 12 rapporter)
6. **Test prototypene** end-to-end på iPhone + iPad + desktop
7. **Send tilbake til Claude Design** hvis noe må justeres

Når godkjent → tilbake til meg så implementerer jeg.
