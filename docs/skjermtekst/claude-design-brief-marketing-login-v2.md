# Brief til Claude Design — Login + hele marketing-suiten (v2, retning C)

Kopier hele denne inn i «AK Golf HQ Design System»-prosjektet. Den bestiller **ferdige,
komponerbare skjermdesign** i v2-språket (retning C, mørk-først) — ikke løse komponenter.
Bygg av komponentene som finnes i `ui_kits/v2`; **mangler et mønster, meld gapet — ikke
improviser ad-hoc UI.**

---

## Hva du designer

Hele det **offentlige ansiktet** til AK Golf HQ: innloggingsskjermen + hele marketing-suiten
(~22 sider). Dette er det en fremmed møter først — det skal føles som et premium, datadrevet
golf-merke på verdensklassenivå, ikke en generisk SaaS-mal.

**Merket:** AK Golf Group, Fredrikstad. Personlig coaching + en app (PlayerHQ) der spilleren ser
strokes gained, får en plan og følger fremgang koblet rett til coachen. Målgruppe: seriøse
golfspillere (junior til aspirerende Tour) og foreldre som vurderer coaching.

**Jobben til marketing:** på 5 sekunder skal en besøkende forstå *hva dette er* og *hvorfor det er
bedre* — og på 30 sekunder finne veien til «prøv gratis» eller «book tid».

**Uttrykk (låst av dagens shippede forside):** mørk, redaksjonelt, rolig. Near-black flate, store
Familjen Grotesk-overskrifter med kursiv-aksent på nøkkelord, lime kun som ett presist signal per
seksjon. Tenk Linear/Vercel/Whoop-nivå på ro og hierarki — ikke fargerik startup-landing.

---

## Designsystem-fundament (gjelder ALLE skjermene under)

**Modus:** mørk-først (retning C). Marketing + login er mørke. Ingen egen lys-variant kreves i
denne runden.

**Farger (bruk token-verdiene, ikke rå hex i produksjon — verdiene her er for din orientering):**
- Flate/near-black: `--v2-bg` = **#131513** (varm near-black «løftet»). Kort/paneler lysere mørke
  lag (#1c1f1c), elevation gjennom lyshet — **aldri borders som elevation**.
- Merkevare: forest **#005840**. Aksent: lime **#D1F843**.
- **Lime-disiplin:** maks **én** lime-jobb per seksjon (primær-CTA / valgt / ett hero-signal).
  **Primær-CTA og valgt-tilstand = lime-pille** med mørk tekst (`T.onLime`). **Aldri lyse/hvite
  piller på mørk flate.** Sekundær CTA = dempet panel-pille.

**Typografi:**
- Familjen Grotesk — display/overskrifter (kursiv på ett nøkkelord: «Tren på det du *trenger*»).
- Inter — brødtekst/UI.
- JetBrains Mono — alle tall, eyebrows (mono-caps), statistikk.
- Tall alltid tabulær, alltid med enhet + retning der det er data («+1,8 SG», «120+», «4 av 5»).

**Ikoner:** Lucide, tynn strek. **Ingen emoji.** **Grid:** 8pt. **Språk:** norsk bokmål (æ ø å).

**Delte marketing-mønstre (gjenbruk på tvers, design én gang):**
- **Topp-nav:** logo venstre · Hjem/Coaching/PlayerHQ/Priser · «Logg inn» + lime «Kom i gang
  gratis»-pille høyre. Sticky, blur ved scroll.
- **Footer:** «AK Golf Group AS · Fredrikstad» + lenkekolonner (Coaching/PlayerHQ/Priser/Book
  tid/Personvern) + cookie-samtykke-mønster.
- **Seksjonsrytme:** eyebrow (mono-caps) → stor display-tittel (balance) → brødtekst → innhold.
  Rikelig luft mellom seksjoner.
- **Bevis-stripe:** tre store mono-tall med label («120+ AKTIVE SPILLERE», «9 500 ØKTER
  LOGGFØRT», «4 av 5 SENKER SNITTSCOREN FØRSTE SESONG»).
- **Feature-kort:** ikon/eyebrow → tittel → én setning. Tre på rad (Analyse · Plan · Coaching).
- **Alle tilstander er produktet:** hover, focus, loading, empty (tomt blogg-/turneringsarkiv),
  error. En skjerm uten tilstander er en skisse.

---

## DEL 1 — Innloggingsskjermen (`/auth/login`) — høyest prioritet

I dag: venstre merkevare-panel med et svakt «treffsirkel»-motiv, og logo + utsagn forankret i
**bunnen** (skjørt på høye skjermer). Skjemaet til høyre er greit. **Dette skal løftes.**

**Bestilling:**
- **To-delt desktop:** venstre merkevare-panel + høyre innloggingskort (kortet er allerede
  sentrert — behold det).
- **Venstre panel — sentrér merkevare-blokka** (logo + «Hele golfutviklingen din. *Ett sted.*» +
  undertekst «Plan, trening og analyse — koblet rett til coachen din») **vertikalt midtstilt**, ikke
  forankret i bunnen. Balansert på alle skjermhøyder.
- **Legg til et bilde i panelet:** et ekte golf-/spiller-/bane-motiv, behandlet med **mørk
  duotone/overlegg i AK-forest**, så det beholder det mørke redaksjonelle uttrykket og teksten er
  fullt lesbar. Bildet er atmosfære, ikke stock-glans. (Foreslå 2–3 motiv-retninger: bane i
  morgenlys, spiller i sving i silhuett, green ovenfra. Anders velger bildet.)
- **Innloggingskort (høyre):** «Logg inn» (Familjen Grotesk) · «Ny her? Opprett konto» · E-post +
  Passord (vis/skjul-øye) · lime **«Logg inn»**-pille · «ELLER»-skille · «Fortsett med Google» ·
  «Fortsett med BankID» · «Glemt passord?».
- **Alle tilstander:** default, felt-fokus, laster («Logger inn…»), feil (rød innfelling: «Feil
  e-post eller passord.» / «E-posten er ikke bekreftet.»).
- **Mobil (390px):** panelet stables bort; sentrert logo øverst med svak forest-glød, så kortet,
  så mikro-footer «AK Golf Group · Vilkår · Personvern».

---

## DEL 2 — Marketing-suiten (~22 sider)

Design **forsiden først og fullt ut** — den setter tonen; resten bygger på samme visuelle logikk
og de delte mønstrene over. Grupper deretter etter type.

### A. Forsiden (`/`) — flaggskipet

Full story på én skjerm, i denne rekkefølgen (ekte copy fra dagens forside — bruk direkte):
1. **Hero:** eyebrow «AK GOLF» → «Tren på det du *trenger*» → «Strokes gained, plan og coach i
   samme app. Se hvor du taper slag, og få en plan som lukker gapet.» → lime «Kom i gang gratis» +
   sekundær «Se hvordan det virker». Ved siden av: et **SG-signaturpanel** («STROKES GAINED · SISTE
   4 RUNDER», stort mono-tall, sparkline, «STØRST GEVINST Å HENTE» med Nær/Putt/Inn/Tee-barer).
2. **Slik virker det:** tre feature-kort — Analyse · Plan · Coaching.
3. **Bevis-stripe:** 120+ / 9 500 / 4 av 5 (+ «Brukt av spillere fra junior til aspirerende Tour»).
4. **Konvertering:** «Prøv PlayerHQ i én måned, gratis · Ingen binding» → lime «Start gratis
   prøving».
5. Footer.

### B. Produkt- og konverteringssider (samme hero-anatomi som forsiden, tilpasset temaet)

- **PlayerHQ** (`/playerhq`) — spillerappen: SG-analyse, plan, loggføring. Vis app-flater som bevis.
- **Coaching** (`/coaching`) — coaching-tilbudet: Performance / Performance Pro, hva du får.
- **Coacher** (`/coacher`) + **coach-detalj** — teamet (ekte coach «Markus Røinås Pedersen» beholdes).
- **Priser** (`/priser`) — pris-klarhet: PlayerHQ gratis eller **299 kr/mnd**; coaching-pakker.
  Ingen falske tiers (ELITE finnes ikke). Ett tydelig anbefalt valg.
- **Treningsfilosofi** (`/treningsfilosofi`) — metoden (strokes gained + plan + coach).

### C. Bevis- og tillitssider

- **Cases** (`/cases`) + **Suksess** (`/suksess`) — resultater/historier, tall som bevis.
- **Om oss** (`/om-oss`) — AK Golf Group, Fredrikstad, historien.
- **Anlegg** (`/anlegg` + detalj) — fasilitetene (Gamle Fredrikstad GK m.fl.).
- **Junior** (`/junior`) — junior-satsingen (foreldre-vinkel).

### D. Innhold og verktøy (liste + detalj + tomtilstand)

- **Blogg** (`/blogg` + `/blogg/[slug]`) — artikkel-liste + lesevisning.
- **Turneringer** (`/turneringer` + detalj) — turneringskalender/-resultater.
- **Stats** (`/stats` + leaderboards + sg-sammenlign + verktøy/tour-ekvivalent) — offentlige
  golfdata og SG-verktøy. Her lever tall-hierarkiet og dispersjons-språket tydeligst.
- **FAQ** (`/faq`) · **Jobb** (`/jobb`) · **Kontakt** (`/kontakt`).

### E. Booking + juridisk (funksjonelt/enkelt)

- **Booking** (`/booking`) — den offentlige booking-wizarden (Lokasjon → Trener → Tjeneste → Tid →
  betal via Stripe). Fungerer i prod i dag; design skal matche v2, ikke finne opp flyten på nytt.
- **Personvern / Vilkår / Cookies** — rene lesbare dokumentsider, lav visuell kompleksitet, samme
  typografi og footer.

---

## Fasit, tilstander og leveranse

- **Ett accent-signal per seksjon.** Lime skal bety noe. Ser du lime tre steder på en skjerm, er
  én av dem feil.
- **Responsivt:** desktop + mobil (390px) for hver skjerm. Marketing skal være tommelfingervennlig.
- **Alle tilstander** der de finnes (hover, focus, loading, empty, error) — spesielt blogg/
  turneringer (tomt arkiv) og booking (utsolgt/ingen ledig tid).
- **Kontrast:** brødtekst lesbar, kritiske tall høy kontrast.
- **Leveranse:** komponerte skjermer i `ui_kits/v2`, gruppert som over (login først, så forsiden,
  så B–E). Meld hvert komponent-gap i stedet for å improvisere. Foreslå gjerne — men med tydelig
  anbefaling, maks 3 alternativer per åpne valg.

**Åpne valg jeg gjerne vil ha forslag på:**
1. **Login-bildet:** hvilket av de 2–3 motivene, og duotone-styrke.
2. **Forside-hero:** ledes den av utsagnet + SG-panel side-om-side (som i dag), eller et større,
   mer kinematisk hero?
3. **Marketing vs app-mørke:** skal marketing bruke nøyaktig samme near-black som appen, eller en
   hakket dypere/mer redaksjonell mørk for det offentlige ansiktet?
