# AK Golf HQ — Alle Claude Design-prompter (iPhone-vennlig)

**Bruk:** Lim inn én prompt om gangen i Claude Design. Hver er paste-ready.
**Sortert per modul.** Bokmerke denne filen i Google Drive → bla på iPhone.

---

## Innhold

- DEL 1 — PlayerHQ Auth + Onboarding (13)
- DEL 2 — PlayerHQ etter login (18)
- DEL 3 — Live Session (4)
- DEL 4 — AgencyOS Dashboard + Stallen (7)
- DEL 5 — AgencyOS resterende (6)
- DEL 6 — Coach-Workbench dybde (5)
- DEL 7 — Booking 5-stegs (5)
- DEL 8 — Foreldre + Marketing + Misc (6)

**Total: 64 skjermer over 8 deler.**

---

> **Note:** Denne filen lister bare Claude Design-prompts.
> For full kontekst (wireframes + komponenter + states), se SKJERMER-RUNDE-1 til SKJERMER-RUNDE-8 i samme mappe.

---


# SKJERMER-RUNDE-1-AUTH-ONBOARDING.md

## 1. /onboarding/velkommen — Splash

### Claude Design-prompt
```
Design en mobil splash-skjerm (430px bredde) for AK Golf HQ.

Layout:
- Full-bleed foto-hero som fyller skjermen (foto: golfbane golden hour, AK Golf-bibliotek)
- To gradient-overlay: top from-black/40 to-transparent (status-bar legibility), bottom from-transparent to-black/55 (tekst-legibility)
- AK-logo white-on-dark 56px, plassert sentralt nær toppen
- Eyebrow lime: "AK GOLF · SIDEN 2014" (mono caps 10px, tracking 0.12em)
- Display-tittel: "Hvor langt slår du egentlig?" Inter Tight 36px, italic-aksent på "egentlig" i lime
- Sub-tekst: "Verktøyet for spillere som vil bli bedre. Bygd av coacher." (Inter 14px, white/70)
- To CTA nederst: "Logg inn" (ghost-light) + "Kom i gang →" (lime pill primary)
- Footer-tag: "38 AKTIVE SPILLERE · 2014" (mono caps 10px nederst)

Bruk components-featured som basis. Hold DS-tokens: forest #005840, lime #D1F843, ingen hardkoda hex.
```

---

## 2. /onboarding/konto — Opprett konto

### Claude Design-prompt
```
Design /onboarding/konto for PlayerHQ (mobil-first 430px, desktop sentrert 480px kort).

Header:
- "← Tilbake" tekst-link (Lucide ChevronLeft + tekst, muted)
- Progress: "STEG 1 AV 7" (mono caps, muted)

Innhold:
- Display-tittel: "Opprett kontoen din" (Inter Tight, italic på "din" i primary)
- Sub-tekst om hvorfor e-post (Inter 14px, muted)
- Form med to inputs (components-inputs):
  1. E-postadresse (label mono caps, placeholder "din@e-post.no", type=email)
  2. Passord (label mono caps, Eye/EyeOff toggle høyre, type=password, "Minst 8 tegn" hint)
- "ELLER"-divider (hr + sentert "ELLER"-tekst mono)
- "Fortsett med Google" (secondary outline + Google-ikon)
- "Fortsett →" (primary CTA, lime pill)

Inline validering under hvert felt. Norsk feilmeldinger.
DS-tokens kun. 8pt-grid.
```

---

## 3. /onboarding/personalia — Navn + foedselsdato

### Claude Design-prompt
```
Design /onboarding/personalia. Bygg på samme mønster som steg 1.

Form:
- Fornavn (text input)
- Etternavn (text input)
- Fødselsdato (date input, format DD.MM.ÅÅÅÅ)
- Kjønn (radio: Mann/Kvinne/Annet — valgfritt, merket med "(valgfritt)" mono caps)

Bruk components-inputs.html som referanse. Samme header-mønster som steg 1 (← Tilbake + STEG 2 AV 7).
```

---

## 4. /onboarding/foresatt — Foresatt-verifisering (<18, GDPR-hard-gate)

### Claude Design-prompt
```
Design /onboarding/foresatt — GDPR-hard-gate for spillere under 18.

Layout:
- Eyebrow: "STEG 2.5 · KREVES FOR UNDER 18" (mono caps, warning-color)
- Display-tittel: "Vi trenger foresatt sin godkjenning." (italic på "godkjenning")
- Forklarende tekst om GDPR
- Form: foresattes e-post + foresattes navn (components-inputs)
- Info-card (components-compliance mønster, lime venstre-border) med forklaring av godkjennings-flyten
- CTA "Send forespørsel →" (primary)

Bekreftelses-state (etter send):
- Check-circle ikon
- "Forespørsel sendt"
- "Foresatt har 7 dager på å godkjenne"
- "Du kan ikke logge inn før godkjenning er bekreftet"

DS-tokens.
```

---

## 5. /onboarding/profil-type — Mosjon vs konkurranse

### Claude Design-prompt
```
Design /onboarding/profil-type. To store kort som er klikkbare og velgbare.

Hvert kort (components-onboarding-mønster):
- Stor Lucide-ikon i primary-color (Activity for mosjon, Trophy for konkurranse)
- Lime eyebrow: "MOSJONSGOLFER" eller "KONKURRANSEUTØVER"
- Display-tittel: "Bli en bedre spiller" / "Sats på prestasjoner"
- Forklarende tekst
- 3 features med Check-ikon

Klikk på kort = velger profil (hover: subtle lift + lime border).

Konsekvens-info nederst (kort tekst, kursiv): "Du kan endre senere i innstillinger."
```

---

## 6. /onboarding/nivaa — HCP + treningsfrekvens + mål

### Claude Design-prompt
```
Design /onboarding/nivaa.

Form:
- HCP-slider (components-drag-slider, range -5 til 54, snap 0.1, default 12.4)
- Sjekkboks "Jeg har ikke handicap ennå" (disabler slider hvis valgt)
- Treningsfrekvens (radio, 3 valg)
- Mål (textarea, valgfritt, placeholder med eksempel)

Tall i JetBrains Mono tabular-nums. Norsk komma (12,4).
```

---

## 7. /onboarding/fasilitet — Fasilitets-profil

### Claude Design-prompt
```
Design /onboarding/fasilitet med 5 meter-sliders.

Layout: 5 sliders stack-vertikalt. Hver slider har:
- Mono caps label ("PUTTING-GREEN — LENGSTE PUTT")
- Track med thumb i primary
- Verdi over thumb (mono caps "15 m")
- Snap til 5m

Range per slider:
- Putting green: 0-30m
- Lengste chip: 0-30m  
- Lengste pitch: 0-50m
- Lengste bunkerslag: 0-20m
- Lengste slag range: 50-300m

Under sliders: checkbox-gruppe "ANDRE FASILITETER" med 5 valg (TrackMan, Vektstang, Trapbar, Løpebane, Medisinball).

Hopp-over-link øverst høyre. CTA nederst.

Mobil-optimalisert: store touch-targets (44px+) på thumb og checkboxer.
```

---

## 8. /onboarding/abonnement — 3 abonnement-kort

### Claude Design-prompt
```
Design /onboarding/abonnement. Tre abonnement-kort stack-vertikalt.

Per kort (components-subscription):
- Tittel (mono caps eyebrow)
- Pris (Inter Tight 32px, "300 kr / mnd")
- Beskrivelse (Inter 14px muted)
- Features-liste (Check/X-ikoner Lucide)
- "Velg →" knapp (primary)

Performance-kortet får "⭐ POPULÆR" badge øverst høyre (accent pill).

Info-banner nederst om gratis gruppe-invitasjon (info-color venstre-border).

Mobil-stack vertikalt. Desktop: 3 cols side-by-side.
```

---

## 9. /onboarding/aktivering — AI-genererer plan

### Claude Design-prompt
```
Design /onboarding/aktivering — loader/celebration-skjerm mens AI bygger startplan.

Layout:
- AK-logo primary 56px sentralt
- Stort Check-circle ikon (Lucide, lime, 88px)
- Success-badge "✓ AKTIVERT"
- Velkomst-tittel "Velkommen, [Fornavn]" italic på navn
- Forklarende tekst
- Skeleton-shimmer-loader (mock progress)
- Mono "Estimat: 30 sekunder"

Auto-redirect til /portal etter 30 sek. Hvis det går lengre: vis "Tar litt lengre tid... fortsett å vente" etter 60 sek.
```

---

## 10. /auth/login

### Claude Design-prompt
```
Design /auth/login.

Layout:
- AK-logo primary 56px sentralt (klikkbar — gå til marketing forside)
- Lime eyebrow: "AK GOLF · LOGG INN"
- Display-tittel: "Velkommen tilbake" (italic på "Velkommen")
- Form: e-post + passord m/ Eye-toggle
- Rad: "☐ Husk meg" + "Glemt passord? →" (høyrejustert text-link)
- Primary CTA "Logg inn →" (forest fyld + lime tekst)
- "ELLER"-divider
- "Fortsett med Google" (secondary outline + Google-ikon)
- Footer-tekst med lime accent på "Book gratis kartleggings-økt →"

Error-state: AthleticBadge urgent "Feil e-post eller passord" over CTA.

Mobil + desktop. Bruk components-inputs + components-buttons.
```

---

## 11. /auth/forgot-password

### Claude Design-prompt
```
Design /auth/forgot-password. Samme stil som /auth/login.

Layout:
- "← Tilbake til login" (text-link top)
- Lime eyebrow: "BISTAND · PASSORD"
- Display-tittel: "Glemt passord? Det skjer de beste." (italic på "Glemt")
- E-post input
- "Send lenke →" primary
- "← Tilbake til login" ghost-light

Success-state (etter send):
- AthleticBadge "✓ E-POST SENDT" (ok)
- "Sjekk innboksen din. Lenken varer i 30 min."

Mobil + desktop.
```

---

## 12. /auth/bankid — Placeholder

### Claude Design-prompt
```
Design /auth/bankid som placeholder-side.

Layout:
- ShieldCheck Lucide-ikon 88px primary
- Lime eyebrow: "BANKID · KOMMER POST-BETA"
- Display-tittel: "Verifiser med BankID" (italic på "BankID")
- Forklarende tekst
- Primary CTA "Tilbake til vanlig login →"

Enkel og kort. Mobil + desktop.
```

---

## 13. /auth/logget-ut — Bekreftelse

### Claude Design-prompt
```
Design /auth/logget-ut — success-confirmation.

Layout:
- AK-logo primary 56px
- CheckCircle Lucide 88px lime
- Lime eyebrow: "AK GOLF · TAKK FOR DENNE GANG"
- Display-tittel: "Vi ses snart" (italic på "ses")
- Forklarende tekst
- To CTA: "Logg inn på nytt →" (primary) + "Tilbake til akgolf.no" (ghost)
- Footer: feedback-tekst med e-post

Mobil + desktop.
```

---


# SKJERMER-RUNDE-2-PLAYERHQ-HOVEDSKJERMER.md

## 1. /portal — Hjem (dashboard)

### Claude Design-prompt
```
Design /portal — PlayerHQ Hjem dashboard. Mobil-first 430px.

Layout (vertikal stack):
1. Foto-hero (player-mobile): 320px høyde, golden-hour fairway, dark gradient overlay
   - Eyebrow lime caps: "ONS 28 MAI · OSLO GK" + pulse-dot + vær-info
   - Greeting italic: "God morgen, [Fornavn]"
   - Display 28px italic-aksent: "Innspill er der det skjer i dag." (italic på "der", primary)

2. Featured card (components-featured): forest-gradient + lime ball blur
   - Eyebrow med pulse-dot: "DAGENS ØKT · 14:30"
   - Tittel italic-aksent
   - Meta: "60 min · 4 drills · CS 80"
   - CTA "Start økt →" (lime pill)

3. KPI-strip (components-kpi): 2-col mobil, 4 KPI:
   - SG App: +0,42 (↑ +0,18 vs forrige)
   - Drive: 268 m (↑ Tour+4)
   - Fairway: 71 % (↓ −3 %)
   - Putt 3m: 52 % (↑ Tour+4)
   "Se alt →" lenke

4. Pyramide-card (components-pyramid): UKE 22-eyebrow + 5 horisontale bars (TURN/SPILL/SLAG/TEK/FYS) + "↑ 4 punkt"-trend

5. Neste tee-card (daycal-rad): dato-blokk + bane + tid + spiller-ref + chevron

6. Bunn-nav: 4 tabs (Hjem/Plan/Stats/Profil), Hjem aktiv

Tomstate (ingen data): forenklet hero uten vær, "Vi har laget en startplan"-melding, KPI alle "—", pyramide tom + forklarende tekst, "Book time"-CTA på Neste tee.

DS-tokens. 8pt-grid. Tabular-nums på alle tall. Norsk komma.
```

---

## 2. /portal/planlegge/workbench — Workbench (kalender)

### Claude Design-prompt
```
Design /portal/planlegge/workbench for mobil 430px.

Topbar:
- Hamburger (åpner sidemeny som slide-over)
- "WORKBENCH · UKE 22" mono caps
- "+" knapp (ny økt)
- Plan A/B toggle under

Zoom-bar:
- Pills: År / Mnd / Uke (aktiv) / Dag
- Naviger uke: ← Uke 22 →

Uke-grid (vertikal stack på mobil — én dag per blokk):
- Hver dag: dato-eyebrow + økt-cards
- Økt-card: venstre border 3px pyramide-akse-farge + tittel + meta + "Start økt →"
- Gruppetreninger: gruppe-badge (WANG/GFGK/AKA) + godkjenn/avslå-knapper
- Turneringer: full-bredde med Flag-ikon + turnerings-navn
- Hviledag: muted "Ingen økt"

Sidemeny (slide-over fra venstre):
- 7 dropdown-seksjoner: Sesong-tre, Planer A/B, Standardøkter (drag), Turneringer, Treningsplaner, Mål, Stats/pyramide
- Bruker components-workbench-sidebar mønster

Klikk på økt → /portal/tren/[id] (separat skjerm)

DS-tokens. Pyramide-aksefarger på økt-borders.
```

---

## 3. /portal/stats — Stats-oversikt (default)

### Claude Design-prompt
```
Design /portal/stats — default landing på Stats-tab.

Header:
- Eyebrow lime: "STATS · 2026 · 14 RUNDER"
- Display 28px italic-aksent: "HCP −2,6 siden januar." (italic på "−2,6", primary)

Tab-bar (components-tabbar):
- 5 tabs: Oversikt (aktiv) / Strokes Gained / TrackMan / Tester / Runder
- Mobil: scroll-horiz, accent-underline aktiv

KPI-strip 2x2 mobil:
- HCP 4,2 (↓ −2,6 i år)
- SG Total +0,95 (↑ +0,3 trend)
- Runder 14 (siste 90 d)
- Snitt 73,2 (↓ −1,4 vs 25)

HCP-trend-card:
- Sparkline SVG, 6 punkter (Jan-Jun), siste = lime dot
- Stort tall høyre: "4,2"
- Klikkbare punkter (popover med dato + score + bane)

SG-fordeling-card:
- 4 horisontale bars (OTT/APP/ARG/PUTT)
- Bars går fra senter (0) — positive høyre primary, negative venstre destructive
- Tall + delta-pil høyre
- Klikk på bar → drill-down til kategori (slide-over panel)

Broadie-kontekst-card:
- "HCP 4,2 → SG Total ≈ −4,0"
- Hvor taper mest: APP/OTT/ARG/PUTT med prosentbars

Bunn-nav: Stats aktiv.

DS-tokens. Mono tabular-nums.
```

---

### Claude Design-prompt
```
Design 4 undertabs av /portal/stats. Hver bruker samme topbar + tab-bar fra hovedskjermen, kun innholdet under endrer seg.

1. /portal/stats/sg (Strokes Gained):
   - Radar 4 akser (OTT/APP/ARG/PUTT) — components-stats-sg
   - Granulære bøtter (klikkbare bars per kategori med drilldown)
   - Sammenligning mot PGA/KFT/HCP-snitt

2. /portal/stats/trackman:
   - Dispersion-plot (components-trackman-dispersion) — scatter med ellipse
   - Stability-tabs (Bag/Stabilitet/Trend/Sammenlign — components-trackman-stability)
   - Trend per kølle (components-trackman-trend)
   - Drift-deteksjon 12 uker

3. /portal/stats/tester:
   - Tester-liste (components-queue mønster) m/ filter per pyramide-akse
   - Hver test-rad: navn, akse-farge, siste verdi, delta, progresjon-bar
   - Klikk → utvider inline med historikk + sparkline
   - "PLANLAGT · KOMMENDE TESTER"-seksjon nederst

4. /portal/stats/runder:
   - Runde-liste (components-queue) m/ "+ Legg til runde"-CTA top
   - Hver runde: dato + bane + score + SG + ★ for beste
   - Klikk → utvider inline med hull-for-hull SG-fordeling (components-sg-waterfall)
   - "Se slag-for-slag →"-lenke for detaljert kart (components-course-heatmap)

Hver undertab har samme topbar/tab-bar som /portal/stats. Bunn-nav: Stats aktiv.
```

---

## 8. /portal/meg — Profil-oversikt

### Claude Design-prompt
```
Design /portal/meg — Profil-landing.

Header (player-mobile):
- Avatar 80px sirkulær
- Navn (Inter Tight 24px)
- Meta: "HCP 4,2 · GFGK · Pro 2/4 credits"
- Subscription-badge: "Performance Pro · 1300 kr/mnd"

KPI 3-col: Runder / Beste / Snitt

Liste av klikkbare rader (queue-mønster):
1. Innboks (med badge-tall hvis uleste)
2. Fakturaer (med tall hvis utestående)
3. Bookinger (neste booking-info)
4. Innstillinger
5. Abonnement

Footer:
- "Logg ut" ghost button destructive-farge

Hver rad har Lucide-ikon venstre + tittel + meta-info + chevron-right.

Bunn-nav: Profil aktiv.
```

---

### Claude Design-prompt
```
Design 4 profil-undersider. Hver har topbar med "← Profil" + tittel.

1. /portal/meg/innboks:
   - Filter-pills: Alle / Godkjenning / Forespørsel / Råd / Melding
   - Innboks-rader (queue): type-ikon Lucide + avsender + emne + tid + ulest-dot
   - Klikk = inline expand med full melding + svar-felt + handlingsknapper

2. /portal/meg/fakturaer:
   - Filter: Alle / Utestående / Betalt
   - Faktura-rader: ref + beskrivelse + beløp (mono) + status-badge
   - Klikk = åpne faktura-detalj

3. /portal/meg/abonnement:
   - Gjeldende plan-card (subscription-mønster) med pris + features
   - Credit-saldo (credit-indicator) "2 av 4 credits"
   - "Endre plan →" lenke til abonnement-velger
   - "Avbestill abonnement" (ghost-destructive nederst)

4. /portal/meg/innstillinger:
   - Seksjoner: Profil (navn/e-post/bilde), Fasiliteter (drag-slidere), Varsler (checkboxer), Personvern (lenke til GDPR-side)

Alle med "← Profil" tilbake-link top. Bunn-nav: Profil aktiv.
```

---

## 13. /portal/runder/ny — Legg til runde (modal)

### Claude Design-prompt
```
Design /portal/runder/ny som modal/full-screen-skjerm på mobil.

Topbar: ✕ + "LEGG TIL RUNDE"

Form:
- Bane (autocomplete-input m/ Lucide Search)
- Dato (date input)
- Score per hull (9+9 grid med numerisk input)
- Auto-beregnet: Score til par (mono)
- SG-input (valgfri, 4 felt for OTT/APP/ARG/PUTT)
- Notat (textarea)

"Lagre runde →" primary CTA nederst.

Tastatur-optimalisert: numerisk keyboard på score-felt. Stor touch-target per felt.
```

---

## 14. /portal/runder/[id] — Runde-detalj

### Claude Design-prompt
```
Design /portal/runder/[id] — runde-detalj.

Topbar: ← Runder

Header:
- Eyebrow lime: "LARVIK GK · 18 MAI 2026"
- Display: "72 (−1)" + AthleticBadge "★ Beste" hvis aktuelt

SG-fordeling-card: 4 verdier + total

SG-waterfall:
- 18 vertikale bars (én per hull), bars over/under 0-linje (positive/negative)
- Kumulativ linje overlay
- Front/Back-toggle
- Hover på hull = SG-bryting (tee/app/arg/putt) + hva som skjedde

Bane-heatmap:
- Mini-heatmap-rekke (18 hull som små greens) med SG-tap fargekodet
- Hover/klikk = forhåndsvisning av hullet

Footer-actions:
- "Se slag-for-slag →" (primary, åpner detaljert kart)
- "Del runde" + "Eksporter" (secondary/ghost)

Bruk components-sg-waterfall + components-course-heatmap.
```

---

### Claude Design-prompt
```
Design /portal/drills (bibliotek) + /portal/drills/[id] (detalj).

Bibliotek:
- Header: tittel + tall (67 DRILLS)
- Søkefelt
- Filter-rad: pyramide-akse-pills (Alle/FYS/TEK/SLAG/SPILL/TURN) + vanskelighet + anlegg
- Drill-cards: venstre-border pyramide-farge + tittel + meta + rating-stars
- CHS-kobling-badge ("⚡ Sterk CHS-kobling") for relevante FYS-drills
- Klikk = /portal/drills/[id]

Detalj (components-okt-detail mønster):
- Topbar: ← Bibliotek + drill-navn
- Hero: pyramide-akse-farge banner + tittel italic-aksent + meta
- Beskrivelse-tekst
- Trinn-liste (numerisk)
- Media: foto/video hvis tilgjengelig
- Parametere-tabell: reps, tid, CS, kølle, miljø
- "Legg til i plan →" primary CTA
- Coach-notater hvis tilgjengelig

Filtrer drills basert på spillerens fasilitets-profil (skjul/dim de som krever utstyr de ikke har).
```

---

## 17. /portal/tournament/[id] — Turnering-detalj

### Claude Design-prompt
```
Design /portal/tournament/[id] — turnering-detalj.

Header:
- ← Turneringer
- Trophy-ikon + navn
- Dato + bane

Featured-banner med foto.

Status-card: PÅMELDT (ok-badge) + start-tid

Din status-card: klasse, tee, forventet HCP-effekt

Forberedelse-checklist (interaktiv — krysse av etter hvert som ting gjøres)

Historisk-card: hvis spilleren har spilt turneringen før, vis tidligere resultater

Footer: "Avmeld" (ghost destructive) + "Se starttid" (primary)
```

---

## 18. /portal/varsler — Varsel-senter

### Claude Design-prompt
```
Design /portal/varsler — varsel-senter.

Topbar: ← Tilbake + "VARSLER · 7 NYE"

Grupper varsler per tid: I DAG / I GÅR / DENNE UKA / ELDRE.

Varsel-card (components-notifications):
- Agent-ikon Lucide (Zap for plan-vakt, Trophy for turnering, BarChart3 for runde, etc.)
- Agent-navn (mono caps eyebrow)
- Beskrivelse av varselet
- Tidsstempel relativt
- Ulest-dot lime hvis ulest

"Vis eldre →" footer-lenke.

Klikk på varsel = utfører handling (se plan, åpne runde, etc.)
```

---


# SKJERMER-RUNDE-3-LIVE-SESSION.md

## 1. /portal/tren/[id] — Økt-intro (preview før start)

### Claude Design-prompt
```
Design /portal/tren/[id] — Økt-intro før start. Mobil 430px, fullscreen modus.

Bakgrunn: Forest #005840 full. Cream #FAFAF7 tekst.

Topbar: tilbake-pil venstre, "ØKT-INTRO" mono caps midtstilt, [Lukk ✕] høyre.

Hero-block:
- Eyebrow lime caps mono: "ONS 28 MAI · 14:30 · INNSPILL"
- Display 32px Inter Tight italic-aksent: "Innspill er der det skjer i dag." — "der" italic
- Meta-rad mono 14px: "60 min · 4 drills · CS 80 · 165 reps planlagt"

PLAN-seksjon (eyebrow + horisontal linje):
- 4 drill-rader (components-okt-detail). Hver rad:
  - Stort tall venstre (Inter Tight 24px, lime), nummer-prefix
  - Kategori-eyebrow mono caps: OPPVARMING / TEKNIKK / KAMP / NEDTRAPPING
  - Tittel cream 18px
  - Meta-rad muted: "25 reps · 50m PW"
  - Drag-handle (⋮) høyre — rearrange
- Bakgrunn: forest-tint card (#0A6A50), 12px radius, 8pt-grid spacing

MÅL-seksjon: bullets cream, små tall lime venstre

CTA-footer (sticky bunn):
- Stort lime pill "START ØKT →" full bredde 56px høyde
- Forest tekst, semibold
- Subtil hint under: "Spar batteri · wake-lock på"

States:
- Default: alle aktive
- Hoppet over drill: strikethrough + opacity 50%
- Offline-banner sticky topp: grå pill med wifi-off-ikon
```

---

## 2. /portal/tren/[id]/live — Aktiv drill (timer + rep-knapper)

### Claude Design-prompt
```
Design /portal/tren/[id]/live — Aktiv drill, fullscreen mobil 430px.

KRITISK: Dette er hovedskjermen — må fungere i sollys, med svette hender, mens spilleren slår.

Bakgrunn: Forest #005840. Wake-lock på.

Topbar:
- ← tilbake (åpner "Avbryt økt?"-modal)
- Senter: "DRILL 3 AV 4 · KAMP" mono caps cream
- Høyre: [Pause ⏸] sirkulær 40px + [✕] tett

Progresjon-bar (4px, lime): viser hvor langt i hele økta (drill 3 av 4 = 50–75%)

Drill-hero:
- Eyebrow lime caps: "KAMP · UP&DOWN 50-80m"
- Display 36px Inter Tight italic: "Up & Down 50–80m" — "Up & Down" italic

Timer-blokk midtstilt:
- Stor JetBrains Mono 80px tall i lime: "08:42"
- Under: "av 25:00 · drill" muted cream 12px
- "TOTAL 24:18" mono 14px under det igjen

Rep-tracker:
- Label venstre "REPS" mono caps + tall høyre "42 / 60" stor mono lime
- Lime progress bar 6px med prosent ("70 %") høyre
- TRE SIRKULÆRE rep-knapper på rad: +5, +10, +25
  - 56px diameter, lime fyll, forest tekst, JetBrains Mono semibold 18px
  - Skygge subtil for press-feedback, haptic-tap
  - Gap 24px mellom knappene, sentrert
- Under: "− 1 rep angre" liten sekundær link cream-muted

Logg-rad: 3 firkant-knapper 48px (Video/Foto/Notat)
- Ikon Lucide 24px + label under
- Cream på forest-tint #0A6A50, 8px radius

Footer:
- "NESTE: NEDTRAPPING · Følelse-putt · 50 reps" eyebrow mono muted
- "FERDIG MED DRILL →" lime pill full bredde 56px

States:
- Default: alle aktive, timer teller
- Paused: 60% opacity + stor "FORTSETT"-pill overlay
- Over-compliance (reps > planlagt): tall lime-pulse animasjon
- Offline-toast: dark pill bunn "Lagres lokalt — synker senere"

Touch-targets minimum 56px. Ingen tekst under 14px. Kontrast WCAG AA.
```

---

## 3. /portal/tren/[id]/live — Drill-overgang (mini-oppsummering)

### Claude Design-prompt
```
Design /portal/tren/[id]/live mellom drills — Drill-overgang. Mobil 430px fullscreen.

Bakgrunn: Forest #005840.

Topbar: ← tilbake, "DRILL FULLFØRT" mono caps midt, [✕] høyre.

Progresjon-bar topp: lime 4px, viser 75 % (3 av 4 ferdig).

Hero-block midtstilt:
- Stor lime sjekkmark Lucide Check 72px, animert i fra scale 0.6 til 1.0
- Eyebrow lime caps: "KAMP · UP&DOWN 50-80m"
- Display 40px Inter Tight italic: "Ferdig med drill 3" — "Ferdig" italic-aksent

KPI-grid 2x2 (components-kpi):
- Cards forest-tint #0A6A50, 12px radius
- Hver card: label mono caps muted + stor tall lime mono + delta mono cream
- 1: REPS 62/60 ↑ +2 over plan
- 2: TID 24:18 av 25:00
- 3: COMPLIANCE 103 % ↑ over mål
- 4: LOGGET 1 video, 2 notater
- Gap 8px, 8pt-grid

NESTE DRILL-seksjon:
- Eyebrow mono caps "NESTE DRILL"
- components-okt-detail rad samme stil som intro-skjerm

Footer:
- Primær: lime pill "START NESTE DRILL →" full bredde 56px
- Under: to sekundære ghost-knapper side-by-side, "Pause" + "Hopp over"

States:
- Default: animert fade-in (sjekkmark først, KPI etter 200ms)
- Under-compliance <70%: piler rød + hint
- Auto-advance: 5 sek countdown-ring rundt START-knapp (kan kanselleres)

Total visningstid forventet: 5–15 sek. Ikke distraherende, men feirende.
```

---

## 4. /portal/tren/[id]/oppsummering — Økt-fullført (totalsummering + achievements)

### Claude Design-prompt
```
Design /portal/tren/[id]/oppsummering — Økt-fullført feiring og totalsummering. Mobil 430px.

Bakgrunn: Forest #005840. Subtil radial gradient lime fra topp (15% opacity).

Topbar: kun [Lukk ✕] høyre — ingen tilbake (økta er ferdig).

Hero-block (midtstilt, romslig):
- Stor lime stjerne Lucide Star fyll 96px, animert puls (scale 1.0 ↔ 1.05 sakte)
- Eyebrow lime caps mono: "ONS 28 MAI · INNSPILL"
- Display 44px Inter Tight italic: "Økt fullført i dag." — "fullført" italic-aksent

TOTAL KPI-grid 2x2 (components-kpi):
- Cards forest-tint #0A6A50, 12px radius, 8pt-grid
- 1: TID 58:42 av 60:00
- 2: REPS 167/165 ↑ +2 over plan
- 3: COMPLIANCE CS 84 ↑ +4 over mål
- 4: DRILLS 4/4 ✓ Alle fullført

ACHIEVEMENTS-seksjon (kun hvis utløst):
- Eyebrow mono caps lime "ACHIEVEMENTS"
- Card-rad: ikon emoji eller Lucide 32px + tittel cream semibold + sub-tekst muted
- Eksempler: "Ny CS-rekord i innspill" / "Første video-logg"
- Achievement med CTA-link (send til coach) får lime accent-border venstre

PER DRILL-tabell:
- Eyebrow mono caps "PER DRILL"
- 4 kompakte rader, mono-tall, sjekkmark høyre
- Format: "1 · Pendel-svinger    25/25  ·  10:02  ·  CS 100  ✓"
- Tabular numbers, JetBrains Mono

NESTE ØKT-card (components-okt-detail kompakt):
- Eyebrow mono "NESTE ØKT"
- Dato + kategori + drill-navn + varighet

Footer (sticky bunn):
- Primær lime pill "LAGRE OG DEL MED COACH →" full bredde 56px
- Sekundær under: "Bare lagre" ghost-link

States:
- Vellykket: stjerne + alle deltas grønne
- Lav CS <70%: dempet ikon, ingen achievements, hero "Økt loggført"
- Avbrutt: "Økt avbrutt" + "Fortsett senere?"-CTA
- Offline: banner topp "Lagret lokalt — synkes når du er online"

Tone: feirende men profesjonell. Ingen confetti. Lime + stjerne + tall som snakker.
```

---


# SKJERMER-RUNDE-4-AGENCYOS-DASHBOARD-STALLEN.md


# SKJERMER-RUNDE-5-AGENCYOS-RESTERENDE.md

### Claude Design-prompt

```
Design /admin/bookinger for AK Golf HQ — AgencyOS desktop 1440px.

Layout: mørk forest-900 sidebar 240px med cream-tekst, hovedflate cream
#FAFAF7. Padding 32px, max-width 1200px.

Header: H1 "Bookinger" (Inter Tight 32px/40px forest-900), subtitle "Alle
bookinger på tvers av coacher og anlegg" (Inter 14px forest-600). Høyre:
primær CTA "+ Ny booking" (lime #D1F843 bg, forest-900 tekst, 40px høyde,
16px radius).

Filter-rad: hvit kort, 16px padding, border forest-200. Fra venstre:
Periode-dropdown (Denne uke), Coach-dropdown (Alle coacher), Status-
dropdown (Alle status), søkefelt "Søk spiller". Høyre: treff-teller
"42 treff" (Inter 13px forest-500).

Tabell: hvit kort, border forest-200, 24px radius. Header-rad: forest-50
bg, Inter 12px uppercase forest-700, padding 12px 16px. Kolonner:
Spiller (200px), Dato (100px), Tid (80px), Coach (120px), Type (100px),
Credits (140px), Status (140px), Actions (60px). Datarad: hover forest-50,
border-bottom forest-100, padding 16px. Spiller-cell: avatar 32px +
navn (Inter 14px forest-900). Credits-cell: "1/12" (JetBrains Mono 13px)
+ status-prikk (●bekreftet forest-700, ◐avventer gold #B8975C, ✕mangler
red-500). Actions: tre-prikk-meny (rediger, kanseller, sende SMS).

Paginering nederst: forest-600 tekst "Viser 1-20 av 42", sidesveksler høyre.

Inline ny-booking form (ekspanderer når "+ Ny" klikkes): lime-tint
bakgrunn (rgba(209,248,67,0.08)), border lime, padding 24px, 16px radius.
Grid 2 kolonner med 24px gap. Felt: Spiller (autocomplete med spiller-
hint som viser navn + plan + credits), Coach, Dato, Tid, Type økt, Anlegg.
Credit-sjekk-rad: ikon-prikk + tekst "Tilgjengelig (1 credit gjenstår)".
Toggle "Betal upfront (Stripe)". Footer: Avbryt + Bekreft booking-knapp
(disabled hvis credits=0 og ikke upfront).

Bruk components-agency-bookings, components-credit-indicator,
components-inputs, components-buttons fra preview-biblioteket.
```

---

### Claude Design-prompt

```
Design /admin/bookinger/ny for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream. Padding 48px,
max-width 960px sentrert.

Topp: tilbake-lenke "← Tilbake til bookinger" (forest-600 14px), H1
"Ny booking" Inter Tight 32px, undertittel "Steg 3 av 5 — Velg tid".

Steg-progress: 5 prikker forbundet med linjer. Aktiv = lime-fyll forest-
900 border + cream tekst, ferdig = forest-900 fyll med checkmark,
kommende = forest-200 fyll. Tekst-label under: Spiller, Anlegg, Coach,
Tid, Bekreft (Inter 12px forest-700 / forest-400).

Context-kort: lime-tint bakgrunn, viser valg fra forrige steg "Emma
Larsen · Onsøy GK · Anders Kristiansen, 1/12 credits gjenstår".

Uke-kalender (steg 4): 7 kolonner (Man-Søn), 12 rader (08:00-20:00).
Header: dag + dato. Cell-tilstander: ledig = cream bg + forest-100 border,
opptatt = forest-200 bg med diagonal stripe-tekstur cursor not-allowed,
valgt = lime fyll forest-900 border 2px, utenfor tilgjengelighet =
forest-50 bg 50% opacity. Hover: forest-100 bg. 64x40px per slot.

Forrige/Neste uke-knapper øverst i kalender.

Valgt-rad under kalender: "Valgt: fredag 12. jun kl 14:00 — 60 min"
(Inter 16px forest-900 medium).

Footer: venstre Tilbake-knapp (outline forest-600), høyre Fortsett-knapp
(lime fyll), disabled hvis ingen slot valgt.

Steg 5: sammendrag-kort med rader, [Endre]-lenker høyre per rad,
warning-banner gul-tint hvis credits lave, notat-textarea 80px høyde,
to checkboxes (SMS, kalender), CTA "Bekreft og send booking".

Bruk components-onboarding, components-agency-bookings,
components-credit-indicator, components-inputs.
```

---

### Claude Design-prompt

```
Design /admin/tester for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1200px.

Header: H1 "Tester" Inter Tight 32px forest-900, undertittel "Spillere
× tester — ytelse-matrise" forest-600 14px. Høyre: CTA "+ Definer test"
outline forest-600.

Filter-kort: hvit bg, padding 16px, border forest-200, 16px radius.
Innhold: Gruppe-dropdown, Tidsrom-dropdown, søkefelt, og legende-rad
til høyre med fargeprikker (forest-700 = over mål, gold #B8975C = nær
mål, red-500 = under mål, forest-200 hule = ikke testet).

Matrise-tabell: hvit kort, sticky første kolonne (spiller-navn 200px),
sticky header-rad (test-navn + enhet). Test-kolonner 80px hver. Padding
12px per celle.

Celle-design: tall i JetBrains Mono 14px medium + fargeprikk 8px diameter
foran. Bakgrunn cell: forest-700 = light forest-100 bg, gold = light
gold-50, red = light red-50, ikke testet = forest-50 hul sirkel.
Hover: hele cellen forest-100 bg, tooltip fade in.

Siste kolonne "+Test": kun [+]-ikon-knapp (24x24px lime-tint bg, lime
border, forest-900 ikon).

Under tabell: helpe-tekst "Klikk celle for historikk · Klikk [+] for å
tildele test" Inter 12px forest-500.

Nederst: to KPI-kort side om side (50/50). Venstre "Gruppe-snitt"
viser test-snitt + endring i lime/red. Høyre "Trender" lister antall
spillere i bedring/stagnasjon/tilbakegang.

Tildel-test-modal: 480px bredde, sentrert, padding 32px, hvit bg, 24px
radius. Felt: Test (dropdown), Mål (number), Frist (datepicker),
Lokasjon (dropdown), Notat (textarea 80px). Footer: Avbryt outline +
Tildel-knapp lime fyll.

Bruk components-agency-tests, components-inputs, components-kpi,
components-buttons.
```

---

### Claude Design-prompt

```
Design /admin/drift for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Header: H1 "Drift" Inter Tight 32px forest-900, undertittel
"Innstillinger, team og operasjonelle verktøy" forest-600 14px.

Accordion-seksjoner: hvit kort hver, 24px radius, border forest-200,
mb 16px. Header-rad: padding 24px, klikkbar, hover forest-50. Layout:
chevron 16px (▸ lukket / ▾ åpen) + tittel Inter Tight 20px forest-900
+ subtitle Inter 13px forest-600. Høyre: "Se alle X →" lenke
forest-700 medium.

Body når åpen: padding 0 24px 24px 24px. Animasjon: 200ms ease.

Team-seksjon body: liste av coach-rader. Hver rad: avatar 32px +
navn (Inter 14px medium) + rolle-badge (ADMIN = lime fyll forest-900
tekst, INSTRUCTOR = forest-100 fyll forest-900 tekst) +
capabilities-pills (forest-50 fyll forest-700 tekst, font-mono 11px).
Footer-rad: "+ Inviter coach"-knapp lime outline.

Plan-maler-seksjon body: 4-kolonne grid. Hver mal-card: hvit bg,
forest-100 border, 16px radius, padding 16px. Innhold: tittel "Junior
Sesong" Inter Tight 16px + meta "16 uker" forest-600 13px +
pyramide-fordeling "40/30/20/10" JetBrains Mono 14px lime-tinted bg-pill.
Hover: lime border, scale 1.02. "+ Ny mal"-knapp som ekstra card,
dashed lime border, lime-tint bg.

CBAC: dim/skjul seksjoner basert på rolle.

Bruk components-agency-drift, components-buttons, components-kpi.
```

---

### Claude Design-prompt

```
Design /admin/drift/team for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Topp: tilbake-lenke "← Tilbake til Drift" forest-600 14px. H1 "Team"
Inter Tight 32px, undertittel "Coacher, roller og capabilities"
forest-600. Høyre: primær CTA "+ Inviter coach" lime fyll.

Filter-kort: hvit bg padding 16px, border forest-200. Tre felt:
Rolle-dropdown, Status-dropdown, søkefelt.

Team-tabell: hvit kort, border forest-200, 24px radius. Header-rad:
forest-50 bg, kolonner Coach (300px), Rolle (140px), Capabilities (flex),
Sist sett (120px). Datarad: padding 20px, border-bottom forest-100,
hover forest-50, cursor pointer.

Coach-cell: status-ikon 12px (◉ aktiv forest-700, ○ pending gold,
✕ inaktiv red-500) + avatar 32px + navn (Inter 14px medium forest-900)
+ e-post under (Inter 12px forest-500).

Rolle-cell: badge-pill. ADMIN = lime #D1F843 fyll, forest-900 tekst.
INSTRUCTOR = forest-100 fyll, forest-900 tekst. Pending = gold-50 fyll,
gold tekst. Inaktiv = red-50 fyll, red-700 tekst. Inter 12px medium,
padding 4px 8px, 6px radius.

Capabilities-cell: enten "Alle (12)" for ADMIN, eller liste av pills
(forest-50 fyll, forest-700 tekst, JetBrains Mono 11px, padding 2px 6px,
4px radius), maks 3 synlige + "..." for flere.

Sist sett-cell: relativ tid (i dag, i går, 3 d, 1 uke, aldri) Inter 13px
forest-500.

Invite-modal: 520px bredde, padding 32px, hvit bg, 24px radius.
Felt: Navn, E-post, Telefon. Rolle-radio: to kort side om side i en
kontainer med border forest-200 padding 16px, valgt = lime border 2px.
Capabilities-checkboxes: kun synlig hvis INSTRUCTOR valgt. Footer:
Avbryt outline + Send invitasjon lime fyll.

Bruk components-agency-drift, components-onboarding, components-inputs,
components-buttons.
```

---

### Claude Design-prompt

```
Design /admin/drift/plan-maler for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1200px.

Topp: tilbake-lenke "← Tilbake til Drift". H1 "Plan-maler" Inter Tight
32px, undertittel "Forhåndsdefinerte sesongplaner for ulike nivåer".
Høyre: CTA "+ Ny mal" lime fyll.

Filter-kort: hvit, padding 16px, border forest-200. Kategori-dropdown,
Sortér-dropdown, søkefelt.

Mal-grid: 4 kolonner, 16px gap. Hver mal-card: hvit bg, 20px radius,
border forest-200, padding 20px, hover lime border + scale 1.02
transition 150ms.

Card-innhold (top to bunn):
- Tittel "Junior Sesong" Inter Tight 18px forest-900 bold
- Meta "16 uker" Inter 13px forest-600
- Pyramide-visualisering: 4 rader á 10 kolonner, der hver firkant
  representerer 10% av ukene. Turnering rad 1 = forest-700 fyll
  (40%), Turn.lik rad 2 = lime-tint fyll (30%), Standard rad 3 =
  forest-100 fyll (20%), Restitusjon rad 4 = forest-50 fyll (10%).
  Kompakt 6x6px per firkant.
- Fordeling-tekst "40/30/20/10" JetBrains Mono 13px forest-700 i
  lime-tint pill.
- Footer: skapt av "Anders K." + dato "12. mai" Inter 12px forest-500.

Siste card i grid = "+ Ny mal" som dashed lime border, lime-tint bg,
sentrert "+" 32px + "Ny mal"-tekst Inter 14px medium.

Slide-over (når mal klikkes): 480px fra høyre, hvit bg, 24px radius
venstre, padding 32px. Innhold: tittel + meta + brukt-av-rad + ukestruktur-
liste (hver uke = rad med type-badge og økt-tall) + CTA-stack nederst
(forhåndsvis, dupliser, rediger, bruk på spiller — primær lime fyll).

Bruk components-agency-drift, components-kpi, components-buttons,
components-inputs.
```

---


# SKJERMER-RUNDE-6-COACH-WORKBENCH-DEEPDIVE.md

### Claude Design-prompt

```
Design /admin/spillere/[id]/workbench for AK Golf HQ — AgencyOS desktop
1440px.

Layout: 3 søyler. Venstre forest-900 sidebar 240px (standard AgencyOS-nav).
Midt-flate cream #FAFAF7 (variable bredde). Høyre inspector hvit bg 320px
med 1px forest-200 border-left.

Spiller-context-bar (over hele midt-flaten): hvit kort, sticky top,
forest-200 border-bottom, padding 16px 32px. Viser: avatar 40px + navn
"Emma Larsen" Inter Tight 20px medium + meta "Pro · 14 år · WAGR 412"
forest-600 13px. Høyre: [Bytt spiller ▾]-dropdown og [Åpne profil →]-
lenke forest-700.

Workbench-hovedrad: H1 "Workbench — Emma Larsen" Inter Tight 28px,
breadcrumb-style subtitle "Sesong-tre · Planer · Standardøkter · Mål ·
Stats" forest-600 13px.

Sidemeny 280px (venstre i midt-flaten): hvit bg, forest-200 border-right.
Padding 16px. Tre-struktur med expandable seksjoner: Sesong-tre, Planer,
Standardøkter, Turneringer, Treningsplaner, Mål, Stats. Hver seksjon:
chevron + tittel (Inter 14px medium forest-900) og barn (Inter 13px
forest-700 indented 16px). Aktiv barn: lime-tint bg + lime accent 3px
left.

Kalender (uke-view): top-toolbar [Uke ▾]-velger (Sesong/Måned/Uke/Dag),
[‹][›]-navigering, [Inspector ▶/◀]-toggle. Under: 7 kolonner Man-Søn,
14 rader 06-20. Bakgrunn cream, forest-100 separatorer. Økt-blokker
fyller relevante tidsslots med farge per type: putt=lime, range=forest-
700, spill=gold, mental=forest-400. Tekst i blokk: Inter 12px medium,
truncated.

Inspector høyre 320px: hvit bg, padding 24px. Innhold gruppert i
seksjoner med 24px gap:
1. Plan-godkjenning: status-pill + Godkjenn (lime) + Returnér (outline)
2. Avvik fra plan: stat "14% under planlagte økter" rød tekst + bar-chart
   mini
3. Ønsker veiledning: kortere meldings-snippet + Svar-CTA outline
4. Tildel oppgave: + Ny-knapp dashed-border-card

Coach-handlinger-knapper er kraftige lime CTAs eller forest-700 outline.

Bruk components-workbench-sidebar, components-workbench-week,
components-workbench-day, components-agency-player-panel.
```

---

### Claude Design-prompt

```
Design /admin/spillere/[id]/workbench (mobil 430px) for AK Golf HQ —
AgencyOS mobil-variant.

Layout: 1 kolonne, ingen sidebar synlig. Header 56px med hamburger
venstre + AK Golf HQ-tittel + varsel-bjelle høyre. Padding 16px.

Søk-bar under header: hvit kort, lime border når aktiv, viser valgt
spiller eller "[Søk spiller...]". Dropdown viser nylige 5 + søk.

Spiller-context-rad: avatar 40px + navn Inter Tight 18px + meta forest-
600 13px. Ingen "Åpne profil" på mobil (tap navn → profil).

H1 "Workbench" Inter Tight 24px.

Uke-toolbar: [Uke ▾] selector + [‹] [›]-piler + uke-label "Uke 24" Inter
14px medium. Horisontal scroll hvis nødvendig.

Dag-stack: vertikal kjede av dag-kort. Hvert kort:
- Header-rad: dag + dato "Man 8/6" Inter 14px medium forest-900,
  forest-50 bg
- Body: liste av økter, hver = farge-prikk + tid (JetBrains Mono 13px) +
  type-navn + varighet (Inter 13px forest-700)
- Tom dag: "(Ingen økter)" forest-500 italic 13px
- Restitusjon-dag: lime-tint bg over hele kortet

Bunn-CTA: ekspanderbart kort "▾ Coach-handlinger (3)" — tap ekspanderer
til bunn-sheet med tre handlinger:
1. Godkjenn ukentlig plan (lime CTA)
2. Svar på melding (outline)
3. Tildel oppgave (outline)

Hamburger-slide-over: 320px bredde, hvit bg, slide-in 250ms. Innhold =
tre-struktur identisk med desktop sidebar (Sesong, Standardøkter,
Turneringer, Treningsplaner, Mål, Stats). Tap kategori = expand barn.

Bruk components-workbench-sidebar (mobil), components-workbench-week,
components-agency-player-panel (mobil), components-inputs.
```

---

### Claude Design-prompt

```
Design /admin/spillere/[id]/varsler for AK Golf HQ — AgencyOS desktop
1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 900px.

Topp: tilbake-lenke "← Emma Larsens profil" forest-600 14px. H1
"Varsler — Emma Larsen" Inter Tight 28px, undertittel "Alle hendelser
som krever oppmerksomhet for denne spilleren" forest-600 14px.

Filter-kort: hvit, padding 16px, border forest-200. Tre dropdowns
(type, periode, sortering) + meta-tekst høyre "7 uleste · 23 totalt"
JetBrains Mono 13px.

Varsel-liste gruppert per tid: section-header "I dag", "I går",
"Tidligere", "Kommer opp" — Inter 12px uppercase forest-500 medium,
mb 8px.

Varsel-kort: hvit bg, forest-200 border, 16px radius, 16px gap mellom.
Hver rad i et kort: padding 16px, border-bottom forest-100 (siste:
ingen border).

Rad-struktur (left to right):
- Ulest-prikk 8px (lime for uleste, rød for avvik, transparent for leste)
- Tid (Inter 12px JetBrains Mono forest-500) + type-tag (forest-100 fill
  forest-700 tekst 11px uppercase) — i header
- Tittel/beskrivelse (Inter 14px forest-900 for ulest = medium, forest-
  600 for lest)
- Handlings-knapper (small outline, Inter 12px medium)

Per varsel-type, ulike handlinger:
- Avvik: [Se planen] [Send påminnelse]
- Ønsker veiledning: [Svar] [Marker som lest]
- Booking: [Se booking]
- Test: [Se historikk]
- Foreldre: [Svar foresatt]
- Kommende: [Se test/gruppen]

Klikk en rad (utenfor knapp) = slide-over åpner med full context.

Bruk components-notifications, components-buttons, components-inputs.
```

---

### Claude Design-prompt

```
Design /admin/coach-til-coach for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1400px.

Topp: H1 "Coach-til-coach" Inter Tight 28px, undertittel "Interne
spørsmål og veiledning mellom coachene" forest-600 14px. Høyre: CTA
"+ Ny tråd" lime fyll.

To-pane layout (62/38 split eller 380/rest): venstre pane = tråd-liste,
høyre pane = valgt tråd.

Venstre pane (tråd-liste, 380px): hvit bg, forest-200 border, 24px
radius. Topp: "Innboks · 3 ubehandlet" Inter 13px medium. Liste av rader:
ulest-prikk 8px + avatar 32px + (avsender Inter 13px medium + snippet
Inter 12px forest-600 truncated 2 linjer + "Om: [spiller-navn]" forest-
500 11px italic + dato 11px JetBrains Mono høyre). Padding 12px, border-
bottom forest-100, hover forest-50 cursor pointer. Valgt rad: lime-tint
bg.

Separator-rad "── Tidligere ──" Inter 11px uppercase forest-500.
Lukkede tråder under, dim opacity 0.7.

Høyre pane (valgt tråd): hvit bg, forest-200 border, 24px radius,
padding 0 (innhold har egen padding).

Tråd-header: padding 24px, forest-200 border-bottom. Tittel "Sondre
Olsen → Anders Kristiansen" Inter Tight 18px + meta "Om: Tobias Olsen ·
28. mai 14:32" forest-600 13px.

Tråd-body: scrollable. Meldinger som chat-bobler: avatar venstre +
boble (forest-50 bg for mottatt, lime-tint bg for sendt) med tekst Inter
14px + meta-fot "Sondre Olsen · 28. mai 14:32" Inter 11px forest-500.
Padding 16px boble, 12px radius.

Embedded spiller-context-kort i tråd: forest-50 bg, lime-accent left 3px,
padding 12px, 8px radius. Innhold: bullet-liste med spiller-meta
(navn, alder, plan, coach, mål). Footer: "[Åpne Tobias' workbench →]"
lenke lime-tint pill.

Composer (bunn av tråd): padding 16px, forest-100 border-top. Textarea
80px høyde, placeholder "Svar Sondre...". Action-rad: venstre [📎 Vedlegg]
[Marker løst] outline-knapper, høyre [Send] lime fyll.

Bruk components-agency-inbox, components-notifications, components-
buttons, components-inputs.
```

---

### Claude Design-prompt

```
Design /admin/spillere/[id]/historikk for AK Golf HQ — AgencyOS desktop
1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Topp: tilbake-lenke "← Emma Larsens profil". H1 "Historikk — Emma
Larsen" Inter Tight 28px, undertittel "Alle coach-handlinger og endringer
på denne spilleren". Høyre: [Eksporter]-knapp outline forest-700.

Filter-kort: hvit bg padding 16px. Type-dropdown, Coach-dropdown,
Periode-dropdown, søkefelt. Høyre: hendelse-teller "142 hendelser"
JetBrains Mono 13px forest-500.

Tidsserie-graf: hvit kort, padding 24px, border forest-200, 16px radius.
Tittel "Tidsserie" Inter Tight 16px. Bar-chart av antall hendelser per
uke. Y-akse 0-30, x-akse ukenummer 18-28. Forest-700 fyll, lime accent
for "denne uka". Høyde 120px.

Historikk-liste gruppert per dag: section-header "Idag · 28. mai 2026"
Inter Tight 16px forest-700 medium, mb 8px.

Hver dag = hvit kort med rader. Rad-struktur:
- Tid 14:23 (JetBrains Mono 13px forest-500, 60px width)
- Type-badge "Plan godkjent" (forest-100 fill forest-700 tekst, Inter
  12px medium, 6px radius, 4px 8px padding, 140px width)
- Coach (avatar 24px + navn Inter 13px forest-900, 140px)
- Beskrivelse (Inter 13px forest-700, flex)

Type-badges fargekodede:
- Plan = forest-700 bg / cream tekst
- Booking = lime fyll / forest-900 tekst
- Test = gold #B8975C bg / cream tekst
- Notat = forest-100 fill / forest-700 tekst
- Oppgave = forest-200 fill / forest-700 tekst
- Melding = blue-tint bg
- Foreldre = pink-tint bg

Hover rad: forest-50 bg, cursor pointer. Klikk = slide-over åpner.

Lazy-load: "Vis flere..." outline-knapp nederst når man scroller.

Eksport-modal: 480px, padding 32px. Format-velg radio (PDF, CSV, JSON),
datointervall, [Last ned]-CTA lime.

Bruk components-notifications, components-kpi, components-buttons,
components-inputs.
```

---


# SKJERMER-RUNDE-7-BOOKING.md

### Claude Design-prompt

```
Design /booking (steg 1: lokasjon) for AK Golf HQ — mobil-first 430px,
også støtte desktop.

Layout: enkel kolonne, padding 16px mobil / 32px desktop. Forest #005840
brand color, lime #D1F843 accent, cream #FAFAF7 bg.

Header: 56px høyde. Venstre tilbake-pil + tittel "Book privatime" Inter
14px medium, høyre ✕-lukk. Forest-900 ikoner, hvit bg + forest-100
border-bottom.

Steg-progress: 5 prikker forbundet med linjer. Aktiv = lime fyll forest-
900 border, kommende = forest-200 fyll. Tekst-label under: Lokasjon,
Coach, Tid, Bekreft, Betal — Inter 11px forest-700 (aktiv) / forest-
400 (kommende). Inter 12px medium tekst-label sentralt aktiv.

H2 "Steg 1 av 5" Inter 13px forest-600 uppercase. H1 "Hvor vil du
spille?" Inter Tight 24px forest-900 medium.

View-toggle: pill med to alternativer "Liste ▾" / "Kart 🗺". Aktiv =
forest-900 fyll cream tekst, inaktiv = transparent forest-700 tekst.
Padding 6px 12px, 16px radius outer.

Lokasjons-kort (liste-view): hvit bg, forest-200 border, 20px radius,
padding 20px, mb 12px. Innhold:
- Radio-prikk venstre top (◯ tom 16px forest-300, ◉ valgt lime fyll
  forest-900)
- Navn "Onsøy GK" Inter Tight 18px forest-900 medium
- Sted "Onsøy, Fredrikstad" Inter 14px forest-600
- Stats-rad med ikoner og tekst Inter 13px forest-700:
  · "3 coacher tilgjengelig"
  · "⌚ Neste ledig: i morgen"
  · "📍 12 km fra deg"
- Velg-knapp høyre nedre hjørne, lime fyll forest-900 tekst, 40px høyde,
  Inter 14px medium

Hover/tap: forest-50 bg, lime border.

Valgt-tilstand: ◉ lime + lime border 2px + sticky CTA "Fortsett →" i
bunn (full-width mobil, høyre desktop).

Kart-view (toggle): Mapbox-kart 60vh høyde, 16px radius, forest-pinner.
Under kart: valgt-lokasjons-detalj-rad + CTA "Velg [navn] →".

Bruk components-onboarding, components-buttons, components-inputs.
```

---

### Claude Design-prompt

```
Design /booking/coach (steg 2) for AK Golf HQ — mobil-first 430px.

Layout: samme rammeverk som steg 1. Padding 16px mobil.

Steg-progress: prikk 1 og 2 aktive (lime fyll), 3-5 kommende.

Breadcrumb-rad: "Onsøy GK · endre" Inter 13px forest-600 + forest-700
underline på "endre". Mb 16px.

H2 "Steg 2 av 5" + H1 "Hvem vil du trene med?".

Coach-kort: hvit bg, 24px radius, forest-200 border, padding 20px,
mb 16px. Layout:
- Top-rad: foto 64x64px sirkulær venstre (forest-100 fallback-bg + i
  niitial) + tittel-stack høyre (navn Inter Tight 18px medium + rolle
  Inter 13px forest-600).
- Spesialitet-rad: "Spesialitet: Elite & Junior" Inter 13px forest-700
  medium.
- Bio: italic Inter 13px forest-600, 2-3 linjer, truncated.
- Stats-rad (vertikal stack med 8px gap):
  · ⌚ Neste ledig: ... (forest-700)
  · ⭐ rating + antall vurderinger (gold #B8975C ikon)
  · 💰 fra-pris / 60 min (forest-900 medium)
- Velg-knapp høyre nedre, lime fyll, 40px høyde.

"Vis meg første ledige tid"-kort: forest-50 bg, lime border 1px dashed,
samme radius, padding 16px. Layout: tittel + meta + "→"-pil høyre.
Tap = system velger første coach med ledig slot innen 7 dager.

Bruk components-onboarding, components-buttons, components-eyebrow.
```

---

### Claude Design-prompt

```
Design /booking/tid (steg 3) for AK Golf HQ — mobil-first 430px.

Layout: padding 16px mobil. Forest brand, lime accent.

Steg-progress: prikk 1-3 aktive, 4-5 kommende.

Breadcrumb-rad: "Onsøy GK · Anders K · endre" Inter 13px forest-600.

H2 "Steg 3 av 5" + H1 "Når passer det?".

Type-økt-tabs: 3 pill-knapper i grid 3-kolonne. Hver: tittel "60 min"
Inter 14px medium + pris "1 200 kr" Inter 12px forest-600. Valgt = lime
fyll forest-900 tekst + lime accent 3px under. Inaktiv = hvit bg
forest-200 border. Test-tab: pris "-" (tildeles av coach).

Uke-velger: horisontal scrollbar, snap-to-day. Hver dag = mini-pill 48x64px:
ukedag forkortelse "Man" Inter 11px uppercase forest-600 + dato "8" Inter
Tight 18px medium forest-900. Valgt = lime fyll, forest-900 tekst. Pile
‹/› venstre/høyre for forrige/neste uke.

Dag-tittel: "Mandag 8. juni — ledige tider" Inter Tight 16px medium
forest-900, mb 12px.

Slot-liste: hvit kort, forest-200 border, 16px radius. Hver slot = rad
56px høyde, padding 16px, border-bottom forest-100:
- Status-prikk venstre: ● lime (ledig), ○ forest-300 tom (opptatt),
  ◉ lime fyll med ring (valgt)
- Tidsspan "09:00 - 10:00" Inter 14px medium forest-900 (JetBrains Mono
  alternativ for tall)
- Status-label "Ledig" / "Opptatt" / "Valgt" Inter 12px forest-600
  høyre

Opptatt-rad: opacity 0.5, cursor not-allowed.
Valgt-rad: lime-tint bg.

Tom-state ved ingen ledige: forest-50 bg-kort, padding 32px sentrert,
ikon 32px forest-400, "Ingen ledige tider mandag" + "Prøv neste dag →"
outline-knapp.

Sticky bunn-CTA "Fortsett til bekreft →": lime fyll 48px høyde,
disabled gray hvis ingen slot valgt.

Bruk components-onboarding, components-buttons, components-eyebrow,
components-inputs.
```

---

### Claude Design-prompt

```
Design /booking/bekreft (steg 4) for AK Golf HQ — mobil-first 430px.

Layout: padding 16px mobil. Forest brand, lime accent.

Steg-progress: prikk 1-4 aktive, 5 kommende.

H2 "Steg 4 av 5" + H1 "Sjekk og bekreft".

Sammendrag-kort: hvit bg, 24px radius, forest-200 border. Padding 0
(rader har egen padding). Rader vertikalt:
- Padding 16px 20px
- Label (Inter 12px uppercase forest-500 medium) + Endre-lenke
  (Inter 12px forest-700 underline, høyre)
- Verdi (Inter 14px forest-900 medium, mb 0)
- Border-bottom forest-100 mellom rader (siste: ingen)

Pris-kort: separat kort under sammendrag, samme stil. Items + Totalt-rad
med JetBrains Mono 16px for tall, forest-900 bold. Mva inkl.-meta Inter
12px forest-500.

For Pro-saldo: items viser "1 credit" + Saldo-rad "Saldo etter: 1/12 →
0/12" med pil-ikon mellom JetBrains Mono.

Lav saldo varsel: gold-tint bg, gold #B8975C accent-bar venstre 3px,
ikon ⚠ + tekst "Siste credit i denne måneden" Inter 13px gold-800.

Notat-felt: label "Notat til Anders (valgfritt)" Inter 13px medium.
Textarea 80px høyde, hvit bg, 16px radius, padding 12px, placeholder
italic forest-400.

Påminnelse-checkbox: large 20px checkbox + tekst "Send meg påminnelse
24 t før (SMS + e-post)" Inter 14px forest-700.

Sticky bunn-CTA "Fortsett til betaling →" / "Fortsett — trekk 1 credit
→": lime fyll, 48px høyde.

Avbestillingspolicy-rad: under CTA, Inter 12px forest-500, max 3 linjer.

Bruk components-onboarding, components-credit-indicator,
components-buttons, components-inputs.
```

---

### Claude Design-prompt

```
Design /booking/betal (steg 5 + success) for AK Golf HQ — mobil-first
430px.

Layout: padding 16px mobil. Forest brand, lime accent.

== Betalings-form ==

Steg-progress: alle 5 prikker aktive.

H2 "Steg 5 av 5" + H1 "Betal og fullfør".

"Du betaler"-kort: hvit bg, forest-200 border, 24px radius, padding 20px.
Pris-rad: "Totalt" Inter 13px forest-500 + "1 200 kr" JetBrains Mono 24px
forest-900 bold. MVA-meta forest-500.

Betalingsmetode-toggle: 2 radio-knapper i hvit kort. ◉ Kort / ○ Vipps.
Valgt = lime border 2px + lime-tint bg.

Stripe Elements-kort (custom-styled): hvit bg, forest-200 border, padding
0 (felt har egen padding). Felt:
- Kortnummer: label uppercase 11px forest-500 + input 16px JetBrains Mono
  med iconpacks (Visa/Mastercard auto-detect)
- Utløp + CVC: to-kolonne 50/50 grid, label + input som over
- Navn på kortet: full bredde
Border-bottom forest-100 mellom felt.

Sikkerhets-rad: 🔒-ikon forest-700 + "Sikker betaling via Stripe" Inter
12px forest-500.

Sticky bunn-CTA "Betal 1 200 kr": lime fyll forest-900 tekst, 48px
høyde, Inter Tight 16px medium. Spinner ved sending. Tekst nedenfor:
"Ved å betale godtar du våre vilkår" Inter 11px forest-500 underline-
lenke.

== Success-skjerm ==

Erstatter hele betalings-skjermen. Sentrert layout.

Hero: ✓-ikon i lime sirkel 80x80px, forest-900 ikon, sentrert.

H1 "Booking bekreftet" Inter Tight 28px medium, sentrert.

Body-tekst: "Du er booket inn med Anders Kristiansen mandag 8. juni 2026
kl 14:00." Inter 16px forest-700, sentrert, max 320px linje-bredde.

Ordre-detalj-kort: hvit bg, forest-200 border, 24px radius. Rader:
Ordrenummer (JetBrains Mono "AKG-2487"), Coach, Sted, Tid, Betalt.
Hver rad: label venstre forest-500 + verdi høyre forest-900 medium.

Kalender-knapp-stack: 3 outline-knapper full-bredde:
- "Legg til i Google Calendar 📅"
- "Legg til i Apple Calendar 📅"
- "Last ned .ics-fil"
Hver: 48px høyde, forest-700 outline + forest-700 tekst.

E-post-bekreftelse-meta: "Vi har sendt en bekreftelse til emma@example.
no" Inter 13px forest-600, sentrert.

CTA-stack:
- Primær "Gå til mine bookinger →" lime fyll
- Sekundær "Book en til time" text-link forest-700
- Tertiær "Tilbake til forsiden" text-link forest-500

Confetti-animasjon: lime + gold partikler faller 2s ved page-load.

Bruk components-onboarding, components-credit-indicator, components-
inputs (Stripe), components-buttons, components-featured.
```

---


# SKJERMER-RUNDE-8-FORELDRE-MARKETING-MISC.md

### Claude Design-prompt

```
Design /forelder for AK Golf HQ — mobil-first 430px (foreldre-portal).

Layout: padding 20px mobil. Forest brand med varmere accent — mer luftig
enn AgencyOS, mer spacing.

Header: 56px, kompakt. Logo "AK Golf · Forelder" Inter Tight 14px medium
forest-900 + profil-ikon høyre 32px.

Hilsen-blokk: H1 "God morgen, Anne" Inter Tight 28px forest-900 medium.
Subtitle "Her kan du følge med på treningen til barna dine" Inter 15px
forest-600. Mb 32px.

Seksjons-tittel "Dine barn" Inter 12px uppercase forest-500 medium,
letter-spacing 0.08em, mb 12px.

Barn-card: hvit bg, 24px radius, forest-200 border, padding 20px, mb 16px.
Layout:
- Top-rad: foto 56x56px sirkulær venstre + tittel-stack høyre (navn Inter
  Tight 18px medium + meta "13 år · Junior" Inter 13px forest-600).
- Meta-rad: "Gruppe: Junior-elite" + "Coach: Anders Kristiansen" Inter
  13px forest-700, mb 16px.
- Neste-økt-kort embedded: lime-tint bg, 12px radius, padding 12px.
  Label "Neste økt" Inter 11px uppercase forest-700 medium + dato/tid
  Inter 14px forest-900 medium + sted Inter 13px forest-600.
- Ulest-meldinger-rad: ● lime-prikk + tekst "2 uleste meldinger fra
  Anders" Inter 13px forest-700 medium.
- CTA "Se [barn] →" høyre nedre hjørne, lime fyll forest-900 tekst,
  40px høyde.

Snarveier-blokk: seksjon-tittel "Snarveier" + 3-kolonne grid av tiles.
Hver tile: hvit bg, forest-200 border, 16px radius, padding 16px,
sentrert innhold. Ikon 24px forest-700 + label Inter 13px medium
forest-900. Aspect-ratio 1:1 så de blir kvadratiske.

Forfalt-tile: lime-tint bg + rød "1 forfalt"-badge øvre høyre.

Bruk components-foreldre, components-eyebrow, components-buttons,
components-notifications.
```

---

### Claude Design-prompt

```
Design /forelder/[barn-id] for AK Golf HQ — mobil-first 430px (foreldre-
portal).

Layout: padding 20px mobil. Varm forest-tone, lime accent, cream bg.

Header: 56px, tilbake-pil venstre + barn-navn "Lukas Larsen" Inter 14px
medium + profil-ikon høyre.

Hero-blokk: foto 80x80px sirkulær sentrert + navn "Lukas Larsen" Inter
Tight 28px medium + meta "13 år · Junior-elite" + "Coach: Anders
Kristiansen" Inter 13px forest-600. Mb 24px.

Denne-uka-kort: lime-tint bg, 20px radius, padding 20px. Tittel "Denne
uka" Inter 13px uppercase forest-700. Fremgangs-bar: 7 firkanter 24x24px,
fylte (5) lime forest-900 border, ufylte (2) cream forest-200 border.
Tekst "5 av 7 økter" Inter 14px medium. Fokus-rad: "Fokus: putting +
range" Inter 13px forest-700.

Ukentlig oppsummering-seksjon: seksjons-tittel "Ukentlig oppsummering"
Inter 12px uppercase forest-500 mb 12px. Kort hvit bg forest-200 border
24px radius padding 20px. Inneholder uke-label + sitat italic Inter 15px
forest-700 + signatur "— Anders K., søndag 7. juni" forest-500 13px.

Kommunikasjon-seksjon: kort med 2 meldings-rader (avatar 32px + navn
+ snippet truncated + tid). Ulest = ● lime-prikk. "Se alle meldinger →"
text-link under.

Godkjenningssaker-seksjon: lime-tint bg + lime border 2px. Tittel +
beskrivelse + frist + to knapper [Avslå] outline + [Godkjenn →] lime
fyll.

Fakturaer-seksjon: kort med faktura-rader (måned + pris + status-prikk +
status-tekst). ● = betalt forest-700, ○ = pending gold, ✕ = forfalt
red-500.

Samtykke-seksjon: kort med liste av samtykke-rader (✓/✗ ikon + tekst).
"Oppdater samtykke →"-knapp outline.

Bruk components-foreldre, components-kpi, components-notifications,
components-buttons.
```

---

### Claude Design-prompt

```
Design / (marketing forside akgolf.no) for AK Golf — desktop-first
1440px med mobil-fallback.

Layout: full-bredde med max-width 1440px. Cream bg generelt, forest-900
bg på stats-seksjon.

Header (sticky): 80px høyde, hvit bg + 1px forest-100 border-bottom.
Logo "AK GOLF" Inter Tight 20px medium forest-900 venstre. Nav-lenker
sentralt: Trening, Coacher, Planer, Om oss (Inter 14px medium forest-700,
hover lime underline). Høyre: [Logg inn] text-link + [Book →] primær
lime fyll knapp.

=== HERO (over the fold) ===
2-kolonne grid 50/50, padding 80px 64px, høyde 600px.
Venstre: H1 "GOLF-TRENING SOM ENDRER SPILLET DITT." Inter Tight 56px/64px
medium forest-900. Subtitle Inter 18px forest-700, 2 linjer. CTA-stack:
[Book privatime →] lime fyll + [Se planene] text-link forest-700.
Høyre: stort hero-foto 600x600 cover, 24px radius, av Anders eller
spiller i swing. Dramatisk lys.

=== MANIFEST ===
Padding 80px 64px. Eyebrow "MANIFEST" Inter 12px uppercase letter-spacing
0.12em forest-700. 3-kolonne grid med 48px gap. Hver kolonne: title
Inter Tight 24px forest-900 (DATADREVET / INDIVIDUELT / HELE ÅRET) +
body Inter 15px forest-700 4-5 linjer. Lime-tint accent-strek 4x40px
under title.

=== STATS SHOWCASE ===
Full-bredde forest-900 bg, padding 96px 64px. Tekst cream.
Eyebrow "STATISTIKK SOM SNAKKER FOR SEG SELV" Inter 12px uppercase
lime tekst.
4-kolonne grid av store tall. Hver: tall Inter Tight 72px medium lime
(eks "142", "+6.4", "12 år", "97%") + label Inter 14px cream
(Aktive spillere, Snitt-handicap-forbedring, Yngste junior, Spillere
som fornyer).
Citat under: "Vi måler det som teller — og leverer på det vi måler."
Inter Tight 24px italic cream + signatur "— Anders K." gold #B8975C.

=== MØT COACHENE ===
Padding 80px 64px. Eyebrow "MØT COACHENE". 2-kolonne grid 50/50.
Hver coach-blokk: foto-portrett 480x600 venstre, 24px radius. Tekst-
stack høyre/under: navn "ANDERS KRISTIANSEN" Inter Tight 32px medium +
tittel Inter 16px forest-700 + bio 4-5 linjer Inter 15px forest-600 +
CTA [Book med Anders →] lime fyll.

=== PLANER ===
Padding 80px 64px. Eyebrow "PLANER". 3-kolonne grid av abonnement-cards.
Hver card: hvit bg, forest-200 border, 24px radius, padding 32px, høyde
560px. Innhold: navn "PRO" Inter Tight 24px + pris "1 990 kr/mnd"
JetBrains Mono 36px forest-900 + feature-bullet-liste Inter 14px (✓ ikon
forest-700) + CTA-knapp nederst.
PRO-card: lime border 2px + "Mest populær"-pill lime fyll øvre høyre +
★ ikon før navn.

=== FOOTER ===
Forest-900 bg, padding 48px 64px, tekst cream/forest-300. 3 rader
informasjon: top-rad logo + lokasjons-liste (Onsøy, GFGK, Larvik,
Miklagard). Mid-rad lenker (Personvern, Vilkår, Kontakt) i horisontal-
liste. Bunn-rad copyright.

Mobil-variant (430px): alt stacker vertikalt, padding 24px, hero
fullbredde med foto under tekst, manifest enkolonne, stats 2x2 grid,
coaches stack, planer enkolonne med scroll-snap.

Bruk components-featured, components-eyebrow, components-kpi,
components-buttons.
```

---

### Claude Design-prompt

```
Design /404 for AK Golf HQ — mobil-first 430px + desktop 1440px.

Layout: full-skjerm sentrert. Cream bg.

Header: 56px (mobil) / 80px (desktop), logo venstre, kompakt nav høyre
([Hjem] knapp mobil, [Logg inn] + [Book →] desktop).

Hero-blokk: sentrert, max-width 480px. Stor "4 0 4" Inter Tight 144px/
160px medium forest-900 med lime accent-strek 4x80px under. På mobil:
96px.

H1 "Vi fant ikke den siden" Inter Tight 32px medium forest-900. Subtitle
"Lenken kan ha endret seg, eller siden er flyttet." Inter 16px forest-
700, mb 32px.

Primær CTA "Tilbake til hjem →" lime fyll forest-900 tekst, 48px høyde,
full-bredde mobil.

Sekundære CTAs i grid 2-kolonne: [Book privatime] [Se planene] outline
forest-700.

Tertiær-rad (mobil): "Eller logg inn:" + 3 små pill-knapper [Spiller]
[Coach] [Forelder] som rute til respektive innloggings-flater.

Helt-skjerm height (calc(100vh - header)). Innhold vertikalt sentrert.

Bruk components-featured, components-buttons.
```

---

### Claude Design-prompt

```
Design /500 for AK Golf HQ — mobil-first 430px + desktop 1440px.

Layout: full-skjerm sentrert. Cream bg. Tone: beroligende, ikke alarm.

Header: kompakt, samme som /404.

Hero-blokk: ⚠-ikon i forest-100 sirkel 80x80px sentrert, ikon-farge
gold #B8975C 32px.

H1 "Noe gikk galt" Inter Tight 32px medium forest-900. Subtitle "Vi
jobber med saken og er tilbake snart. Vennligst prøv igjen om litt."
Inter 16px forest-700, mb 24px.

Feilkode-blokk: forest-50 bg-card, padding 16px, 12px radius. Innhold:
"Feilkode: AKG-500-d8a3" JetBrains Mono 13px forest-700 + "Tidspunkt:
28. mai 14:23" Inter 13px forest-500.

Primær CTA "Prøv igjen" lime fyll, 48px høyde.
Sekundær CTA "Sjekk drift-status →" outline forest-700, åpner status.
akgolf.no.

Footer-rad: "Trenger du hjelp?" Inter 14px forest-700 + "support@akgolf.
no" Inter 14px lime-tint link.

Bruk components-featured, components-buttons.
```

---

### Claude Design-prompt

```
Design /portal/tomstate-eksempler (intern referanse) for AK Golf HQ —
desktop 1440px.

Layout: sidebar 240px forest-900 (AgencyOS-stil), hovedflate cream
padding 32px, max-width 1200px.

Header: H1 "Tomstate-eksempler · intern referanse" Inter Tight 28px,
undertittel "Felles mønster for alle tomstates på tvers av PlayerHQ +
AgencyOS" forest-600 14px.

Mønster-spec-kort: lime-tint bg, padding 20px, 16px radius. Bullet-liste
av regler (ikon 48px, tittel-stil, body-stil, CTA-stil, padding).

3-kolonne grid av tomstate-eksempler. Hver eksempel-card: hvit bg,
forest-200 border, 20px radius, padding 32px, sentrert innhold:
- Tilstand-tittel øverst Inter 11px uppercase forest-500 letter-spacing
  0.08em (eks "Stats (0 runder)")
- Ikon 48px sentrert (forest-400 nøytral)
- Hoved-tittel Inter Tight 18px medium forest-900 sentrert
- Body Inter 14px forest-600 sentrert, max 3 linjer
- CTA-knapp (lime fyll eller outline) eller "(ingen CTA)"-placeholder
  italic forest-400

Hver tomstate har sin egen ikon (emoji eller Phosphor-ikon konsekvent).

Padding mellom rader 24px. Layout justeres til 9 eksempler i 3x3 grid.

Bruk components-onboarding, components-buttons.
```

---


---

**Slutt på samlefil.** Komplett dokumentasjon i SKJERMER-RUNDE-1 til -8.
