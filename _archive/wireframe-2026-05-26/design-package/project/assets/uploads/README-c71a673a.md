# Batch 8 — Web (akgolf.no)

**Antall pakker:** 30 web-sider (offentlige markedsføringssider)
**Status:** Klar for claude.ai/design
**Estimert tid:** 6–8 timer (delt i 6 mini-batches à 5 sider)

## Hvorfor denne batchen nå

Web er ansiktet utad — alt fra første Google-treff til signert kontrakt går
gjennom akgolf.no. Mens batch 1–7 dekker selve produktet (CoachHQ, PlayerHQ),
er Batch 8 marketing-laget som driver folk INN i produktet. Designsystem-tokens
er allerede etablert, men web krever en egen estetikk: mørk landing-hero,
editorial typografi, og marketing-tone som er varm uten å være formell.

Når denne batchen er ferdig kan akgolf.no bygges parallelt med booking.akgolf.no
i eget repo (`akgolf-website`).

---

## WEB-arketypen — felles spec (gjelder alle 30 sider)

Web-sider skiller seg fundamentalt fra app-skjermer i batch 1–7. Disse
mønstrene skal være konsistente på tvers av alle offentlige sider.

### Layout-grunnmønster

```
+-----------------------------------------------+
|  Top-nav (sticky, hvit, 64px)                 |
|  Logo · Om · Tjenester · Coaches · Anlegg ... |
+-----------------------------------------------+
|                                               |
|  HERO (mørk #0A0A0A eller subhero #0A1F18)    |
|  Eyebrow (mono, lime) + Editorial title       |
|  Italic accent på nokkelord                   |
|  Sub + 2 CTAs (lime primary + outline)        |
|                                               |
+-----------------------------------------------+
|                                               |
|  LYS SEKSJON (#FAFAF7) — 96px padding         |
|  Section-eyebrow + section-title + lede       |
|  Feature-cards / grid / editorial content     |
|                                               |
+-----------------------------------------------+
|                                               |
|  SOSIAL BEVIS (testimonials / partners)       |
|                                               |
+-----------------------------------------------+
|                                               |
|  CTA-BAND (lime eller mørk)                   |
|                                               |
+-----------------------------------------------+
|  FOOTER (mørk #0A1F18, 4 kolonner)            |
+-----------------------------------------------+
```

### Komponenter som ALLTID må designes

| Element | States å designe |
|---|---|
| Top-nav link | default, hover (primary), active page (underline lime) |
| CTA primary (lime pill) | default, hover (lift + shadow), active, focus, disabled |
| CTA outline (light) | default, hover (fill white 10%), focus |
| CTA primary-web (mørkegrønn) | default, hover, active, focus |
| Hero-title | display-vekt + italic på keyword (Inter Tight) |
| Section-title | 48px display, italic på et ord, max 700px bredde |
| Feature-card | default, hover (lift 2px + border tint) |
| Testimonial-card | quote + cite med navn + tittel |
| Footer-link | default, hover (white) |
| Mobile burger | closed, open (drawer fra høyre) |

### Mørke vs lyse seksjoner

- **Mørk hero #0A0A0A** brukes kun på landingssider (forside, tjenester, B2B-pitch)
- **Subhero #0A1F18 → #143027 gradient** brukes på underside-headers (om, blogg, FAQ)
- **Lyse seksjoner #FAFAF7** er default for content
- **Mørkt CTA-band #0A1F18** mot slutten av sider
- **Footer alltid mørk #0A1F18** med 4 kolonner

### Typografi (web-spesifikt)

- **Inter Tight** (display) — alle h1, h2, h3, hero-titles
- **Inter** (sans) — body, nav, knapper, feature-card body
- **JetBrains Mono** (mono) — eyebrows (`AK GOLF ACADEMY · NORGES LEDENDE`), tall, datoer
- **Italic** brukes editorial på keywords i hero og section-titles: `*smartere*`, `*faktisk*`, `*på ekte*`
- Aldri Geist på web — det er app-fonten. Web bruker Inter Tight + Inter.

### Lime-bruk på web

Mer liberal enn i app — lime fungerer som signal-farge på CTAs og hero-aksenter.
Men: **maks 2 lime-elementer i view samtidig** (én CTA + én italic-keyword).
Hero-eyebrow er lime-tekst (mono), ikke counted som "element".

### SEO-vennlig struktur

- Hver side har én `<h1>` (i hero)
- Underseksjoner bruker `<h2>` (section-title)
- Feature-cards bruker `<h3>`
- Aldri hopp over heading-nivåer
- Alt-tekst på bilder: norsk, beskrivende
- Meta-title: `<sidetittel> — AK Golf` (60 tegn maks)
- Meta-description: 150–160 tegn, unik per side

### Footer (alltid samme på alle 30 sider)

4 kolonner mørk #0A1F18:

| Kolonne | Innhold |
|---|---|
| 1 (2fr) | Logo + tagline + nyhetsbrev-signup (mini) + sosiale ikoner |
| 2 | Tjenester: 1:1, Junior, Talent, Bedrift, Klubb, Camps |
| 3 | Selskap: Om, Coaches, Anlegg, Cases, Blogg, Karriere, Kontakt |
| 4 | Juridisk: Personvern, Vilkår, Cookies, FAQ |

Bunn-rad: `(C) 2026 AK Golf Group AS · Org. 920 117 824 · Fredrikstad`

### Top-nav (alltid samme)

Sticky hvit 64px. Logo venstre, nav midt, "Logg inn" + "Kom i gang" høyre.
Nav-items: Om · Tjenester · Coaches · Anlegg · Priser · Blogg · Kontakt
Mobile (<768px): logo + burger. Drawer fra høyre med samme items + CTAs.

### Marketing-tone — viktig

- **Varm, ikke formell.** "Vi" og "du", aldri "vår institusjon" eller "klienten".
- **Konkret, ikke abstrakt.** "Du logger 12 økter på 4 uker" slår "kontinuerlig progresjon".
- **Editorial italic-fragments.** *"Coaching som faktisk flytter deg fremover."* slår "Velkommen til AK Golf".
- **Ingen corporate-floskler.** Aldri "synergi", "best in class", "world-class".
- **Norsk bokmål med æ/ø/å.** Komma som desimal, mellomrom som tusenseparator.
- **Aldri "Velkommen!" eller "God dag, kjære kunde"** — vis verdi i første setning.

### Reelle navn og priser (bruk disse)

| Type | Verdi |
|---|---|
| CEO | Anders Kristiansen |
| Head Coach | Anders Kristiansen |
| Coaches | Julie Solem, Markus R. Pedersen, Emil Halvorsen, Sara Lien |
| Klubb-partnere | Bossum, Fredrikstad GK (GFGK), Mulligan Indoor, Drobak GK |
| Tech-partnere | TrackMan, Mizuno |
| Bank-partner | Sbanken |
| Skole-partner | WANG Toppidrett Fredrikstad |
| 1:1 coaching | 1 600 kr/time |
| Pro-abonnement | 299 kr/mnd |
| Elite-abonnement | 799 kr/mnd |
| Junior (alle inkludert) | 1 200 kr/mnd |
| Trial | 7 dagers gratis |

### Mobil-versjon (< 768px)

- Hero-title: 48px (fra 84px)
- Section-title: 32px (fra 48px)
- Padding: 64px 24px (fra 96px 48px)
- Grid-3 -> stable vertikalt
- Footer-grid: 1 kolonne med dividere
- Top-nav: logo + burger; CTAs flyttes til drawer

### Responsive breakpoints

- Desktop: >=1024px — full layout
- Tablet: 768–1023px — grid-3 blir grid-2, padding 80px 40px
- Mobil: <=767px — alt stables, padding 64px 24px

---

## Per-skjerm-pakker (30)

### Landingssider med mørk hero (#0A0A0A)
1. `01-web-index.md` — Hjemmeside (`Tren smartere. Spill bedre.`)
2. `15-web-for-klubber.md` — B2B klubb-pitch
3. `16-web-for-bedrifter.md` — Bedriftsavtaler
4. `17-web-talent.md` — Talentprogram
5. `18-web-junior.md` — Junior-program

### Subhero-sider (#0A1F18 gradient)
6. `02-web-om.md` — Om AK Golf
7. `03-web-coaches.md` — Coach-liste
8. `04-web-coach-profil.md` — Public coach-profil
9. `05-web-tjenester.md` — Tjeneste-oversikt
10. `06-web-tjeneste-detalj.md` — Tjeneste-detalj
11. `07-web-anlegg.md` — Anlegg-liste
12. `08-web-anlegg-detalj.md` — Anlegg-detalj
13. `09-web-priser.md` — Tier-sammenligning
14. `10-web-kontakt.md` — Kontakt
15. `11-web-blogg.md` — Blogg-liste
16. `12-web-blogg-artikkel.md` — Long-form artikkel
17. `13-web-cases.md` — Suksesshistorier
18. `14-web-case-detalj.md` — Case-detalj (STAR-format)
19. `19-web-sponsorer.md` — Sponsorer/partnere
20. `20-web-jobb.md` — Karriere
21. `21-web-sammenlign.md` — Sammenlign tjenester

### Innholds-/hjelpe-sider (lys default)
22. `22-web-faq.md` — FAQ med kategorier
23. `23-web-personvern.md` — GDPR
24. `24-web-vilkar.md` — Brukervilkår
25. `25-web-cookies.md` — Cookie-policy

### Feilstander
26. `26-web-404.md` — 404-side
27. `27-web-500.md` — 500-error

### Komponenter (gjelder på tvers)
28. `28-web-footer-mega.md` — Mega-footer
29. `29-web-header-nav.md` — Public top-nav
30. `30-web-newsletter.md` — Newsletter-signup-modul

## Mini-batches (6)

| Mini-batch | Pakker | Tema |
|---|---|---|
| 8-A | 1–5 | Forside, om, coaches, tjenester |
| 8-B | 6–10 | Tjeneste/anlegg-detail, priser, kontakt |
| 8-C | 11–15 | Blogg, cases, B2B-klubb |
| 8-D | 16–20 | B2B-bedrift, talent, junior, sponsorer, jobb |
| 8-E | 21–25 | Sammenlign, FAQ, legal |
| 8-F | 26–30 | 404/500, footer, nav, newsletter |

Hver mini-batch har 3 filer:
- `8-X.md` — samlet spec for alle 5 pakker
- `8-X-prompt.md` — copy-paste-prompt til claude.ai/design
- `8-X-vedlegg.txt` — liste over HTML-filer som må lastes opp

## Slik bruker du hver pakke

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (engang per session)
2. Per mini-batch: åpne `8-X.md`, last opp 5 HTML-wireframes fra `8-X-vedlegg.txt`,
   kopier `8-X-prompt.md` inn i claude.ai/design, vent på alle 5 design-forslag
3. Lim design-link tilbake til Claude Code

## Gate

Alle 30 pakker må være `APPROVED` før akgolf-website-repo bygges.
