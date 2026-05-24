# Claude Design-prompts — manglende skjermer

**Bruk:** Lim hver prompt inn i [claude.ai/design](https://claude.ai/design). Når alle er ferdig, eksporter hand-off-bundle og send URL til Claude Code.

**Prioritet 1:** 7 manglende hubs (~1-2 timer)
**Prioritet 2:** Edge-cases (~1-2 timer)

---

## PRIORITET 1 — 7 manglende hubs

### Prompt 1 — CoachHQ Planlegge-hub

```
Design a dashboard hub for AK Golf HQ — Norwegian golf coaching platform.

DESIGN SYSTEM:
- Background: #FAFAF7, Card: #FFFFFF, Foreground: #0A1F17, Muted: #5E5C57
- Primary: #005840 (dark green), Accent: #D1F843 (lime), Border: #E5E3DD
- Inter (body), Inter Tight (headings), JetBrains Mono (numbers/eyebrows)
- 16px card radius, 12px button radius
- Lucide line-icons only — no emojis
- Premium Scandinavian minimal, not sporty

PAGE: CoachHQ — Planlegge hub (the coach's planning command center)

Layout: Sidebar left (256px, dark green) + main content
Header: Eyebrow "COACHHQ · COACH" → breadcrumb "Planlegge" → big italic title "Bygg planer"
Sub-title: "Treningsplaner, plan-maler, teknisk plan og drill-bibliotek på ett sted."

Cards grid (3 columns, responsive):
1. Treningsplaner — icon: CalendarRange — "14 aktive planer · 6 utkast" — CTA: "Se alle →"
2. Plan-maler — icon: FileText — "28 maler · sist brukt 21. mai" — CTA: "Bla i bibliotek →"
3. Teknisk plan — icon: Target — "9 spillere · 7 med aktiv plan" — CTA: "Se spillere →"
4. Drill-bibliotek — icon: Dumbbell — "247 drills · 12 nye denne uka" — CTA: "Utforsk →"
5. Turneringer — icon: Trophy — "3 kommende · neste 14. juni" — CTA: "Planlegg →"
6. Økter — icon: Calendar — "47 totalt · 5 utkast" — CTA: "Se alle →"
7. Videoer — icon: Video — "23 i bibliotek" — CTA: "Bla →"

Each card: small icon container top-left (40x40, secondary bg), eyebrow uppercase mono, title in Inter Tight semibold, border-top separator, primary data line, CTA muted with arrow. Hover: lifts -2px.

Top-right action button: "+ Ny plan" (primary green + lime text, pill).

Norwegian throughout. Premium luxury feel.
```

### Prompt 2 — CoachHQ Gjennomføre-hub

```
[Same design system as Prompt 1]

PAGE: CoachHQ — Gjennomføre hub (operational dashboard)

Eyebrow "COACHHQ · COACH" → breadcrumb "Gjennomføre" → italic title "Daglig drift"
Sub-title: "Kalender, bookinger, anlegg, tilgjengelighet og live-økter."

Cards grid (3 columns):
1. Coach-kalender — icon: Calendar — "5 økter i dag · 23 denne uka" — CTA: "Åpne →"
2. Bookinger — icon: CalendarCheck — "4 kommende · 1 venter på bekreft" — STATUS-PILL: warn-amber
3. Anlegg — icon: MapPin — "3 anlegg · GFGK + 2" — CTA: "Administrer →"
4. Tilgjengelighet — icon: Clock — "Mine åpne timer · 12 t denne uka" — CTA: "Sett →"
5. Kapasitet — icon: Gauge — "2% brukt denne uka" — KPI-BAR: 2% green fill
6. Tjenester — icon: CreditCard — "5 prislister · Stripe aktiv" — STATUS: green dot
7. TrackMan — icon: Radio — "1 aktiv sesjon" — STATUS: pulse-green
8. Live-økter — icon: Activity — "0 aktive nå" — empty state subtle

Action button top-right: "+ Ny booking" (primary)

Same anatomy as Prompt 1. Status-pills brukes der relevant. Mobile responsive.
```

### Prompt 3 — CoachHQ Innsikt-hub

```
[Same design system]

PAGE: CoachHQ — Innsikt hub (analytics command center)

Eyebrow "COACHHQ · COACH" → breadcrumb "Innsikt" → italic title "Innsikt over stallen"
Sub-title: "Stall-statistikk, tester, godkjenninger og rapporter."

Cards grid (3 columns):
1. Lag-snitt — icon: BarChart3 — "Pyramide-snitt · Q2 2026" — VISUAL: mini pyramid bars
2. Tester — icon: ClipboardCheck — "7 overdue · 12 snart-due" — STATUS-PILL: urgent red
3. Godkjenninger — icon: CheckCheck — "8 venter" — STATUS-PILL: warn amber
4. Forespørsler — icon: MessageSquare — "0 ubehandlete" — STATUS: muted gray
5. Rapporter — icon: FileBarChart — "Siste generert: 23. mai" — CTA: "Generer ny →"
6. Runder — icon: Flag — "47 logget · 12 denne mnd"
7. Finance — icon: Wallet — "kr 36 753 · +12% mot forrige" — STATUS: positive green delta
8. Tilstander — icon: Activity — "2 registrerte skader" — STATUS-PILL: warn

Action button: "Eksporter rapport" (primary outline)
```

### Prompt 4 — CoachHQ Admin-hub

```
[Same design system]

PAGE: CoachHQ — Admin hub (system control)

Eyebrow "COACHHQ · HEAD COACH" → breadcrumb "Admin" → italic title "Organisasjon"
Sub-title: "Klubb, team, integrasjoner og innstillinger."

Cards grid (3 columns):
1. Klubb-info — icon: Building — "Gamle Fredrikstad GK" — CTA: "Rediger →"
2. Team — icon: Users — "4 coacher · 2 admin" — CTA: "Administrer →"
3. Integrasjoner — icon: Plug — "6 koblet · 1 ikke koblet (Notion)" — STATUS-PILL: warn-amber on Notion
4. Innstillinger — icon: Settings — "Sist endret 22. mai" — CTA: "Åpne →"
5. AI-agenter — icon: Bot — "3 aktive · Caddie + 2" — STATUS: pulse-green
6. E-postmaler — icon: Mail — "12 maler" — CTA: "Bla →"
7. Audit-log — icon: Shield — "Siste hendelse: 24. mai 04:12" — CTA: "Se aktivitet →"
8. Min profil — icon: User — "Anders K. · Head Coach" — avatar with PRO-pill

Empty state if no data on any card.
```

### Prompt 5 — PlayerHQ Gjennomføre-hub

```
[Same design system]

PAGE: PlayerHQ — Gjennomføre hub

Eyebrow "PLAYERHQ · PRO" → breadcrumb "Gjennomføre" → italic title "Gjør jobben"
Sub-title: "Dagens program, kalender, live-økt og bookinger."

Hero player-card top-right: avatar (60x60 green circle) + "Anders Kristiansen · A1 · HCP -- · Sesong 2026"

Cards grid (2-3 columns):
1. I dag — icon: PlayCircle — "0 økter i dag" — empty state with CTA "Se kalender →"
2. Kalender — icon: Calendar — "5 økter denne uka" — CTA: "Åpne kalender →"
3. Live-økt — icon: Activity — "Ingen aktiv" — empty state — small CTA "Start ny økt"
4. Booking — icon: CalendarCheck — "1 kommende · Markus 28. mai" — CTA: "Se bookinger →"
5. TrackMan — icon: Radio — "Siste sesjon 19. mai" — CTA: "Logg ny →"

Action button: "+ Ny økt" (primary)
```

### Prompt 6 — PlayerHQ Analysere-hub

```
[Same design system]

PAGE: PlayerHQ — Analysere hub

Eyebrow "PLAYERHQ · PRO" → breadcrumb "Analysere" → italic title "Forstå spillet ditt"
Sub-title: "Statistikk, Strokes Gained, runder, TrackMan, tester og AI-innsikt."

Cards grid (3 columns):
1. Statistikk — icon: BarChart3 — "47 runder loggført" — CTA: "Se trender →"
2. Strokes Gained — icon: TrendingUp — "Siste runde SG: +1.2" — STATUS-PILL: ok green
3. Runder — icon: Flag — "47 totalt · 12 denne mnd" — CTA: "Bla →"
4. TrackMan — icon: Radio — "23 sesjoner" — CTA: "Åpne →"
5. Tester — icon: ClipboardCheck — "12/36 gjennomført" — progress-bar
6. AI-Innsikt — icon: Sparkles — "3 nye anbefalinger" — STATUS-PILL: accent lime
7. Baner — icon: Map — "Top 5 spilte"
8. Leaderboard — icon: Trophy — "Din rank: 14/87" — STATUS-PILL: primary green
```

### Prompt 7 — PlayerHQ Meg-hub

```
[Same design system]

PAGE: PlayerHQ — Meg hub

Eyebrow "PLAYERHQ · MIN PROFIL" → italic title "Hei, Anders." → "Bilde, navn og kontaktinfo."

Top hero card: large avatar (100x100, green circle) + name + tier-pill (PRO accent lime) + quick contact info (e-post, telefon, klubb, HCP)
Action button on hero: "Rediger raskt" (outline primary)

Drill-cards grid below (3 columns):
1. Profil — icon: User — "Bilde + navn" — CTA: "Rediger →"
2. Innstillinger — icon: Settings — "Personvern, varsler, språk +5" — CTA: "Åpne →"
3. Sikkerhet — icon: Shield — "2FA aktivert" — STATUS-PILL: ok green
4. Abonnement — icon: CreditCard — "PRO · neste faktura 15. juni · 300 kr" — STATUS-PILL: primary
5. Bookinger — icon: Calendar — "1 kommende · 4 historikk" — CTA: "Se →"
6. Helse — icon: HeartPulse — "Siste logg 22. mai" — CTA: "Logg ny →"
7. Utstyrsbag — icon: Briefcase — "14 køller registrert" — CTA: "Åpne →"
8. Dokumenter — icon: FileText — "3 dokumenter"
9. Hjelp — icon: HelpCircle — "Søk hjelp" — CTA: "Åpne →"
```

---

## PRIORITET 2 — Edge-cases

### Prompt A — 404 + 500 feilsider

```
[Same design system]

Design 404 and 500 error pages for AK Golf HQ.

Layout: centered on dark sage backdrop, generous whitespace.
- Big number "404" or "500" in Inter Tight 144px, ink color muted
- Italic heading: "Siden finnes ikke" (404) or "Noe gikk galt" (500)
- 1 sentence description in body text
- Primary CTA: "Tilbake til forsiden" (#005840 bg, #D1F843 text)
- Secondary link: "Kontakt support →" muted text

Premium luxury, not playful. No emojis, no illustration — just typography + minimal layout.
```

### Prompt B — Loading skeletons

```
[Same design system]

Design 4 skeleton states:
1. Dashboard cards skeleton (grid of 6 cards with shimmer)
2. Table rows skeleton (header + 5 rows)
3. Hero card skeleton (avatar + title + 3 KPI lines)
4. Drill detail panel skeleton (title + meta-grid + tags)

Each: subtle bg #E5E3DD with smooth horizontal shimmer animation (1.5s loop).
Match the layout of the real component but with grayscale placeholders.
```

### Prompt C — Toast / pop-up varsler

```
[Same design system]

Design 4 toast variants:
1. Info (blue accent, Info icon)
2. Success (green accent, CheckCircle icon)
3. Warning (amber accent, AlertTriangle icon)
4. Danger (red accent, AlertCircle icon)

Each: top-right corner, 360px wide, white card, left border 4px in variant color.
Header: bold title (Inter Tight 14px).
Body: 1-2 lines description (muted 13px).
Close X button top-right, auto-dismiss after 5s.
Slide-in from right + fade animation.
```

### Prompt D — Form validation states

```
[Same design system]

Design form validation states:
1. Default state (border #E5E3DD, focus ring #005840)
2. Error state (border #A32D2D, red helper text below: "Telefonnummer må ha 8 siffer")
3. Success state (border #1A7D56, green checkmark icon, no helper text)
4. Warning state (border #B8852A, amber helper text: "Dette vil sende e-post til 47 spillere")

Show in context of a form: 3 fields stacked (name, e-post, telefon) with different states.
Premium minimal aesthetic.
```

### Prompt E — Mørkt tema (verifikasjon)

```
[Same design system, but DARK MODE]

Background: #0F2A22
Card: #163027
Foreground: #F5F4EE
Primary (in dark mode): #D1F843 (lime becomes primary)
Primary-foreground: #0A1F17
Border: #2B4F42

Recreate 4 key pages in dark mode:
1. CoachHQ Hjem (Workbench)
2. PlayerHQ Hjem
3. Drill Library
4. Spiller-detalj

Verify: text contrast WCAG AA (4.5:1 minimum), all icons visible, accent lime pops on dark green background.
```

### Prompt F — Mobile sidemeny (Sheet)

```
[Same design system]

Design mobile sidemeny as a Sheet (slide-in from left).

Trigger: hamburger icon (3 lines) in top-left of mobile topbar.
Sheet width: 80% of viewport (max 320px).
Backdrop: rgba(15, 31, 24, 0.6) blur.

Content:
- Top: AK logo + brand name + close X
- Middle: navigation groups (CoachHQ or PlayerHQ depending on user role)
- Bottom: profile chip (avatar + name + role)

Slide-in animation 220ms ease-out. Tap backdrop closes sheet.

Norwegian throughout.
```

---

## Når alt er ferdig

1. I Claude Design, klikk "Eksporter hand-off bundle"
2. Kopier URL-en
3. Send til Claude Code: "Her er ny bundle-URL: [URL]"
4. Claude Code importerer ny bundle og starter Fase 1 (mapping mot 264 ruter)

**Total tid for deg: 2-4 timer i Claude Design.**

Du trenger ikke kjøre alle på en gang — gjør prioritet 1 først (7 hubs), så prioritet 2 senere hvis du vil.
