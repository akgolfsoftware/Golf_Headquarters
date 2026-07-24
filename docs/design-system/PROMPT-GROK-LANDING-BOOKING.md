# Grok 4.5-prompter — landingsside, booking og tjenester

**Laget 2026-07-24.** Tre ferdige prompter du kan lime rett inn i Grok 4.5 (eller en
annen frontier-modell). De er bygget på det som faktisk finnes i dette repoet —
tokens, komponenter, ruter, ekte tjenester og ekte bilder — så svaret blir kode som
passer inn, ikke en frittstående demo som må skrives om.

## Slik bruker du dem

1. Lim inn **Blokk 0 (felles kontekst)** først. Den er lik for alle tre oppgavene.
2. Lim inn **én** av oppgaveblokkene (1, 2 eller 3) rett etter.
3. Be om filer, ikke forklaringer. Blokkene avslutter allerede med en output-kontrakt.
4. Kjør resultatet gjennom `npm run verify` før noe merges.

**Hvorfor er prompten så lang?** Kvaliteten på en generert side følger kvaliteten på
konteksten den får. Modellen kan ikke gjette designtokens, ordboken eller hvilke
tjenester dere selger. Alt den ikke får vite, finner den på — og da må du skrive om
alt etterpå. Research-notatet nederst forklarer hvilke prompt-mønstre dette bygger på.

---

## BLOKK 0 — Felles kontekst (lim inn først)

```text
You are a senior product designer and front-end engineer. You have 20 years of
experience shipping data-dense web applications and marketing sites that convert.
You write production TypeScript/React, not demos.

<oppdrag>
AK Golf Group is a Norwegian golf coaching company in Fredrikstad. They sell
coaching (in person) and include a training app (PlayerHQ) with the coaching
packages. The website must sell COACHING first; the app is the proof that the
coaching is systematic, not the main product.
</oppdrag>

<teknisk-kontekst>
- Next.js 16 (App Router, TypeScript strict, Turbopack), React 19.
- Tailwind CSS v4, CSS-first via @theme in globals.css. There is NO tailwind.config.ts.
- Components live in src/components. Marketing pages use their own chrome
  (MRamme/MNav/MFot from src/components/marketing/v2/marked-ramme.tsx), NOT the app shell.
- The design system is "v2, retning C (Presis)": dense, precise, Linear/Notion-like
  rhythm in AK brand colours.
- All colour, spacing and type come from design tokens exposed as the object `T`
  (src/lib/v2/tokens.ts) and CSS variables --v2-*. RAW HEX IS FORBIDDEN and blocked
  by a CI gate (scripts/check-no-hex.mjs). Use T.bg, T.panel, T.panel2, T.panel3,
  T.border, T.borderS, T.fg, T.fg2, T.mut, T.lime, T.forest, T.up, T.down, T.warn,
  T.ui, T.disp, T.mono, T.gap, T.rRow. rgba() and color-mix() are allowed.
- Motion classes are static, in src/styles/v2/motion.css. Never inject CSS at runtime.
  Existing classes: v2-press, v2-focus, v2-fade-in, v2-sheet-in, v2-backdrop-in,
  m-avslor (scroll reveal), m-parallaks, m-klebrig (sticky scene).
- Icons: lucide-react ONLY, via the local <Icon name="..." /> wrapper. Never emoji.
- Reusable primitives already exist and MUST be reused instead of rebuilt:
  Kort (card), Rad (row), TallHero (big number), Trend (sparkline), FordelingRad,
  AkseBar, SgKategorier (diverging strokes-gained bars), StatusPill, CTAPill, Knapp,
  Caps (eyebrow), Tittel, InnsiktChip (insight strip), TomTilstand (empty state),
  BunnArk (bottom sheet), HjelpTips ("?" explainer), Skjerm (real app frame),
  Inndata/Velger/TekstOmraade (form fields).
</teknisk-kontekst>

<merkevare>
- Colours: forest green (dark base), lime accent, cream, graphite. Dark-first on
  marketing. Lime is reserved for the ONE primary action and for live/now states —
  never decorative.
- Typography: Familjen Grotesk (display, tight tracking, italic for the accented
  word), Inter (UI), JetBrains Mono (numbers and labels, tabular-nums).
- Tone: calm, factual, Norwegian. We never oversell and never use fear.
</merkevare>

<harde-regler>
1. ALL user-facing text in Norwegian bokmål with æ, ø, å. No English in the UI.
2. Vocabulary is fixed: "nærspill" (never "kortspill"), "trening" (never "øving"),
   "økt" for a session. Never write "Performance"/"Performance Pro" as app tiers —
   they are COACHING PACKAGES (number of sessions per month). "ELITE" does not exist.
3. Recommendations never block. Never write copy or code that says a user "cannot"
   train something, or that a rule "cannot be broken". We advise, we do not gate.
4. ONE primary call to action per screen. Everything else is ghost or a quiet text
   link. If two lime buttons can be seen at once, the design is wrong.
5. Every number or jargon term a user could wonder about gets a "?" explainer
   (HjelpTips), and the text comes from the shared text bank — never ad hoc.
6. Accessibility is not optional: every control has an accessible name, focus is
   visible, contrast ≥ 4.5:1, targets ≥ 44px, and all motion is disabled under
   prefers-reduced-motion. Zero critical axe violations.
7. Never invent facts: no fake testimonials, no invented statistics, no prices that
   are not supplied to you. If a number is missing, write "mangler" or leave the
   element out — do not guess.
8. Mobile is the primary device (390px). Design it there first, then desktop.
</harde-regler>

<ekte-innhold>
Coaching services actually sold (use these, do not invent new ones):
- Flex-økt, 20 / 50 / 90 min — drop-in session with a coach, one topic or in depth.
- Performance, 60 min — structured session: TrackMan, analysis, plan into PlayerHQ.
- Performance Pro, 90 min — TrackMan, video, dispersion, written plan.
- Gruppe-økt, 60 min, up to 6 players — level-adapted group training.
Subscription packages: Performance (2 sessions/month), Performance Pro (4/month).
Package always includes PlayerHQ at no extra monthly cost. Price is agreed in the
conversation and depends on setup and travel — DO NOT print package prices.
Public coach on marketing pages: Markus Røinås Pedersen, Head Coach, AK Golf Academy.

Real photographs available (use them, never stock or AI images):
/images/akademy/coach-observerer.jpg      coach watching a player swing
/images/akademy/coaching-tripod.jpg       coach filming a swing on a tripod
/images/akademy/putting-data.jpg          putting practice with measuring gear
/images/akademy/bunker-shot.jpg           bunker shot, sand spray
/images/akademy/utslag-fairway.jpg        tee shot from the fairway
/images/akademy/walking-bag.jpg           player walking with the bag
/images/akademy/hull-ovenfra.jpg          hole seen from above
/images/akademy/putting-vann.jpg          putting green by water
/images/anlegg/gfgk-hero.jpg              home club, wide
/images/anlegg/miklagard-hero.jpg         second venue, wide
/images/akgolf/AK-Golf-Academy-1..42.webp academy photo library

Routes that exist: / (front), /coaching, /playerhq, /priser, /booking, /coacher,
/om-oss, /kontakt, /stats/sg-sammenlign (public strokes-gained comparison),
/auth/signup, /auth/login, /portal/* (player app), /admin/* (coach app).
</ekte-innhold>

<designretning>
Reference: the Starlink site. What we take from it:
- Full-bleed photography that carries the message; the type sits ON the image.
- Very few words per screen. One statement, one action, then scroll.
- Generous vertical rhythm — each section owns the viewport instead of competing.
- Restrained motion: things fade and rise as they enter; nothing bounces or spins.
- A single, repeated call to action rather than a menu of choices.
What we do NOT take: their cold corporate palette, their sci-fi copy, or a
video-heavy hero that costs the user megabytes on mobile data at a golf course.
</designretning>
```

---

## BLOKK 1 — Landingsside (Starlink-følelse, coaching først)

```text
<oppgave>
Design and build the front page (/) of akgolf.no as a scroll-told story that sells
coaching. Deliver production React/TSX for Next.js 16 using the components and
tokens described above.
</oppgave>

<struktur>
Section 1 — Hero.
  Full-bleed real photograph (coach-observerer.jpg) with a gradient scrim so the
  type keeps contrast on both sides. The photo drifts slower than the scroll
  (subtle parallax, max 20% of scroll distance). Eyebrow, a two-line display
  headline where ONE word is italic lime, a two-sentence lead, the coach's name and
  role with an avatar, then exactly one primary action ("Book en samtale") and one
  ghost link. Nothing else. The hero must read in five seconds.

Section 2 — What coaching with us actually is.
  The four real services as cards, each with a real photograph and its duration.
  No prices. Reveal them in sequence as they enter the viewport (60–120 ms apart).
  Below: the two subscription packages, with a quiet "?" note explaining that a
  package is a number of sessions per month, not an app tier.

Section 3 — The app, shown as the app.
  A sticky scene: on desktop the phone frame stays fixed while the text column
  scrolls past it, and the screen inside switches between Hjem, Plan and Analyse as
  the reader moves. Build the phone screens from the real product components
  (Skjerm, TallHero, Trend, FordelingRad, Rad, AkseBar) so it is the actual UI, not
  a drawing of it. On mobile, stack the three screens instead of pinning.

Section 4 — The numbers, compared.
  Show a player's strokes gained against the PGA Tour baseline using the existing
  diverging chart (SgKategorier): centre line is the baseline, bar left means shots
  lost. Beside it: what can be compared (tour · national level · your own history)
  and an honest note about where the data comes from. Link to /stats/sg-sammenlign.

Section 5 — Proof, then the same single action again.
  One line of social proof, three real numbers, then the booking card. End with one
  quiet link for people who only want to look at the app.
</struktur>

<bevegelse>
- Reveal: opacity 0 → 1 and translateY 18px → 0 over ~620ms, cubic-bezier(.2,.7,.2,1),
  triggered once by IntersectionObserver, staggered per card.
- Parallax and the sticky scene update through requestAnimationFrame, never on every
  scroll event directly.
- Under prefers-reduced-motion: no transitions, no listeners attached, everything
  visible from first paint. The page must be fully readable with JavaScript off.
- No scroll hijacking, no autoplay video, no cursor effects, no confetti.
</bevegelse>

<akseptansekriterier>
The work is done when ALL of these are true:
1. A non-golfer understands what we sell within five seconds of the hero.
2. Exactly one lime button is visible in any single viewport.
3. Zero critical axe violations at 390px and 1440px; contrast passes AA.
4. No raw hex anywhere; every colour is a token.
5. All copy is Norwegian bokmål, follows the vocabulary rules, and invents no facts.
6. Largest Contentful Paint under 2.5s on a simulated 4G mobile connection —
   images are sized, lazy below the fold, and the hero image is the only eager one.
7. The page works, and reads well, with animation disabled.
</akseptansekriterier>

<output>
Return, in this order and nothing else:
1. A one-paragraph statement of the idea behind your design.
2. The complete file(s), each in a fenced code block with its path as the first line
   comment. Full files, not fragments, not diffs.
3. A short list of every assumption you made and every place you needed content that
   was not supplied.
Do not explain React. Do not add commentary between the files.
</output>

<selvsjekk>
Before you answer, re-read your own output and check it against
<harde-regler> and <akseptansekriterier>. Fix what fails. If you cannot satisfy a
rule, say so explicitly in the assumptions list rather than quietly breaking it.
</selvsjekk>
```

---

## BLOKK 2 — Bookingsystem

```text
<oppgave>
Design the booking flow for AK Golf: from a visitor deciding to book, to a confirmed
session in the calendar. Deliver production React/TSX for Next.js 16 using the
components and tokens described above. The goal is the fewest possible taps without
hiding anything the user needs to decide.
</oppgave>

<flyten>
Step 1 — Choose what.
  The real services, grouped so the choice is obvious: drop-in (Flex 20/50/90),
  structured (Performance, Performance Pro), group. Each shows duration and price —
  price comes from the database, so treat it as a prop, never a literal. A card is
  one tap; there is no "next" button on this step.
Step 2 — Choose who and when.
  Coach, then day, then free time slots. Show a week at a time with the days as a
  horizontal strip on mobile. Times are Europe/Oslo, always. A day with no capacity
  must say so honestly and offer the next day that has it — never an empty grid.
Step 3 — Confirm.
  One summary card: service, coach, date, time, place, price. One primary action.
  Below it, in quiet text: what happens if you need to cancel.
Step 4 — Receipt.
  Confirmation with a calendar link, and ONE next action — not a menu.

Cross-cutting:
- The whole flow keeps state in the URL so a refresh or a shared link resumes it.
- Every step is reachable and readable on a 390px screen with one thumb: primary
  actions sit at the bottom of the viewport, navigation at the top.
- Errors are written in plain Norwegian and say what to do next, never a code.
- A slot that disappears while the user is deciding must be handled gracefully:
  say it was taken, and show the nearest alternatives.
</flyten>

<tilstander>
Design every one of these, not just the happy path:
- Loading (skeletons, never a spinner over the whole page)
- No availability this week
- Fully booked coach
- Payment declined
- Already booked at that time
- Cancelled by coach
- Offline / lost connection mid-flow
</tilstander>

<akseptansekriterier>
1. A returning customer can book a known service in three taps or fewer.
2. Nothing about the price or the cancellation terms is hidden until after payment.
3. Every state above has a designed screen with one clear way forward.
4. Times are unambiguous: weekday, date and Oslo time, never a bare "14:00".
5. Zero critical axe violations; the entire flow is operable by keyboard alone.
6. No raw hex; all Norwegian bokmål; one primary action per step.
</akseptansekriterier>

<output>
Same output contract as Blokk 1: idea, then full files with paths, then assumptions.
</output>
```

---

## BLOKK 3 — Tjenestesiden

```text
<oppgave>
Design the coaching services page (/coaching) — the page a visitor lands on when
they want to understand what they get and what it costs them in time and money.
Deliver production React/TSX using the components and tokens described above.
</oppgave>

<innhold>
- Open with the outcome, not the product: what changes for a player who trains with
  us. One photograph, one sentence, the coach.
- Then the four real services in a comparison that can be read across, not four
  brochures side by side: duration, what happens in the session, what you leave
  with, who it fits. Use a real photograph per service.
- Then the two subscription packages, with the honest note about what a package is.
- Then how a session actually runs: arrive, measure, work, plan. Four steps, real
  photographs, no stock imagery.
- Then the questions people actually ask before buying: do I need my own clubs, how
  far in advance must I book, what if I have to cancel, is this for beginners.
  Write them as a plain accordion, not marketing copy.
- Close with the same single action as everywhere else: book a conversation.
</innhold>

<akseptansekriterier>
1. A visitor can tell, in under a minute, which service fits them and why.
2. Nothing implies that the app replaces the coach, or that a package is an app tier.
3. Every claim on the page is true and traceable to something the company does.
4. One primary action; the page never asks the visitor to choose between two loud
   buttons.
5. Zero critical axe violations, all Norwegian bokmål, no raw hex.
</akseptansekriterier>

<output>
Same output contract as Blokk 1.
</output>
```

---

## Hvorfor prompten ser slik ut (research-notat)

Mønstrene under er hentet fra gjeldende praksis for prompting av frontier-modeller
(juli 2026) og tilpasset dette repoet:

| Grep | Hvorfor |
|---|---|
| **Rolle + erfaring først** | Setter kvalitetsnivået modellen sikter mot. «Senior designer som skriver produksjonskode» gir andre valg enn «lag en nettside». |
| **XML-lignende seksjoner** (`<oppdrag>`, `<harde-regler>`) | Claude- og Grok-familiene følger avgrensede blokker langt mer presist enn løpende prose. Det er også lettere for deg å endre én blokk senere. |
| **Ekte inventar i prompten** | Modellen kan ikke gjette tokens, ordbok, tjenester eller bildefiler. Alt den ikke får, dikter den opp — og da må du skrive om resultatet. |
| **Forbud er like viktige som ønsker** | «Ingen rå hex», «aldri emoji», «aldri oppdiktede tall» fjerner de vanligste feilene i generert markedsføringskode. |
| **Akseptansekriterier med tall** | «Under 2,5 s LCP», «0 critical axe», «tre trykk» kan etterprøves. «Moderne og lekkert» kan det ikke. |
| **Tilstands-liste for booking** | Generert kode dekker nesten alltid bare happy path. Å be om tomme, feilede og opptatte tilstander eksplisitt er forskjellen på en demo og et system. |
| **Output-kontrakt** | Hele filer med sti, ingen forklaringer mellom. Sparer deg for opprydding. |
| **Selvsjekk til slutt** | Modellen leser sitt eget svar mot reglene før den svarer. Fanger en god del brudd gratis. |

**Kilder:**
- [Prompt Engineering: A Practical Guide for Builders (MLQ)](https://mlq.ai/guides/introduction-to-prompt-engineering/) — strukturert kontekst og output-skjema framfor «clever wording»; XML-tagger som standard for Claude-familien.
- [20 Best AI Prompts to Build a Landing Page (Rocket)](https://www.rocket.new/blog/best-ai-prompts-to-build-a-landing-page-guide-for-creators) — spesifikk seksjonsliste i prompten gir side som ser designet ut, ikke mal-aktig.
- [Testing the Big Five LLMs: Which AI Can Better Redesign My Landing Page? (jampa.dev)](https://www.jampa.dev/p/should-i-get-a-designer-an-llm-benchmark) — sammenligning av modellenes designresultat på samme oppgave.
- [Full-bleed image hero patterns (HeroGrids)](https://herogrids.com/layout/full-bleed-image/) — én verdiproposisjon, én CTA, bildet bærer budskapet.
- [Parallax scrolling-eksempler (Colorlib)](https://colorlib.com/wp/parallax-scrolling-websites/) — scroll-utløste avsløringer i ulik hastighet, brukt nøkternt.

**Merk:** Blokk 1 beskriver i praksis forsiden som allerede er bygget i dette repoet
(`MarkedForsideV2`). Den er tatt med fordi den er den beste referansen på hva vi
mener med «bra» — bruk den til å be Grok om alternative retninger å sammenligne mot,
ikke for å bygge den samme siden på nytt.
</content>
