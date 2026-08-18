> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Wave E — validering mot Paper-fasit (2026-08-09)

**Metode:** kode ↔ `designsystem/paper/fase1/{spillerprofil,agencyos-innboks*,foreldreportal}.html`  
**Ikke gjort:** live screenshot side-om-side (krever Mac/prod)

## Scorekort

| Flate | Fasit | Chrome | Pixel-nær | Verdict |
|---|---|---|---|---|
| Spillerprofil (dashboard) | `spillerprofil.html` | ✅ etter fiks | ~75% | **PASS chrome** · layout-dybde gjenstår |
| Spillerprofil (full V2) | samme | ✅ | ~70% | PASS chrome |
| Spillerprofil side | del av profil | ✅ | ~80% | PASS |
| Innboks triage | `agencyos-innboks*.html` | ✅ | ~70% | PASS chrome · filtre mangler |
| Innboks e-post | del av innboks | ✅ | ~65% | PASS chrome |
| Foreldreportal | `foreldreportal.html` | ✅ | ~80% | **PASS** topp |

**Samlet Wave E:** **chrome validert med forbehold** — ikke pixel DONE.

---

## 1. Spillerprofil (`spillerprofil.html`)

### Fasit krever
| Element | Fasit |
|---|---|
| h1 | Spillernavn · **17px / weight 600** |
| Meta | kat · alder · HCP · klubb (mono sub) |
| KPI-rad | sg total · hcp · siste økt · uke/økter |
| Primær CTA | **`.btn.ink`** «**Åpne i Workbench**» (ink, ikke clay `.now`) |
| Tilbake | «Tilbake til Spillere» |
| od-id | `pp-workbench` |
| Kontekst | Artefakt fra Spillere/Konsoll — ikke egen rail-flate |

### Kode før validering
| Sjekk | Før | Etter fiks |
|---|---|---|
| Dashboard h1 17px | ❌ 21/26px | ✅ 17px / 600 |
| CTA-tekst | «Åpne Workbench» | ✅ «Åpne i Workbench» |
| CTA farge | clay (`T.handling`) | ✅ ink (`T.cta`) som fasit `.btn.ink` |
| od-id | `spiller-workbench` | ✅ `pp-workbench` |
| Tilbake-tekst | «Alle spillere» | ✅ «Tilbake til Spillere» |
| wave-e markør | delvis | ✅ dashboard + V2 |
| KPI-strip | ✅ data-drevet | OK (labels fra data) |
| 18 seksjoner / faner | Dashboard faner Oversikt… | ⚠️ annen IA enn fasit-ark; innhold finnes |

### Gjenstår (ikke blokkerende for chrome)
- Full pixel av KPI-rad typografi (fasit `kpirad`)
- Ark/sheet-visning (fasit åpnes som artefakt-overlay) vs full page
- Ghost Analyse/Melding spacing

---

## 2. Innboks (`agencyos-innboks.html` + mobil)

### Fasit krever
| Element | Fasit |
|---|---|
| h1 | «Innboks» · desktop **17px** · mobil **20px** |
| Sub | «**N åpne** · dato/tid» |
| Rail/faner | Konsoll · Innboks · Spillere · Kalender (Wave B) |
| Filtre | mobil `.filtre` gruppe |
| Liste + detail/sheet | split desktop |

### Kode
| Sjekk | Status |
|---|---|
| PaperTopp «Innboks» | ✅ |
| Sub med antall åpne | ✅ |
| Primær CTA 56px clay | ✅ (enTing-handling — OK for «behandle») |
| E-post flate 17px topp | ✅ |
| Filtre chips | ❌ ikke portet som fasit `.filtre` |
| Mobil h1 20px | ⚠️ PaperTopp 17 overalt |
| Liste/detail split e-post | ✅ grid |

### Gjenstår
- Filter-rad (alle / avvik / godkjenning / …)
- Mobil h1 20px valgfritt (paper-mobil fasit)
- Badge-count i rail (Wave B nav)

---

## 3. Foreldreportal (`foreldreportal.html`)

### Fasit krever
| Element | Fasit |
|---|---|
| topp | Avatar-initialer + **h1 barnenavn 17px** |
| sub | **«du er registrert som foresatt»** |
| faner | tablist (Uke/oversikt m.m.) |
| kropp | uke-status, ingen helsedata |

### Kode
| Sjekk | Status |
|---|---|
| Avatar initials | ✅ |
| h1 childName 17px | ✅ |
| sub «du er registrert som foresatt» | ✅ (+ uke) |
| StatusPill samtykke | ✅ |
| Primær clay CTA | ✅ `enTing` |
| Faner som fasit tablist | ⚠️ navigasjon via egne ruter/shell, ikke innebygd faner-strip |
| Helsedata skjult | ✅ (produktregel) |

### Gjenstår
- Eventuell fane-strip pixel-match hvis ønsket én-side
- Sub-skjermer: kun wave-e markør, ikke full topp-audit

---

## 4. Globalt fra Wave E

| Endring | Fasit-relevans | Status |
|---|---|---|
| `CTAPill enTing` → 56px clay | `.btn.now` | ✅ |
| Workbench på profil = **ink** | `.btn.ink` | ✅ etter valideringsfiks |
| Clay kun «Én ting nå» | monopol | ✅ (ikke Workbench ink) |

---

## Konklusjon

| | |
|---|---|
| **Wave E chrome** | **Godkjent med fikser** (dashboard profil ink Workbench, tilbake-tekst, 17px navn) |
| **Pixel DONE** | **Nei** — mangler filtre innboks, seksjons-IA profil, screenshots |
| **Anbefalt neste** | Wave F **eller** innboks-filtre finpuss + Mac screenshot-gate |

### Sjekkliste Anders (prod etter push)
1. `/admin/spillere/[id]` — navn 17px, «Åpne i Workbench» **ink** (mørk), ikke clay  
2. `/admin/innboks` — «Innboks» + N åpne + clay primær  
3. `/forelder` — barnenavn + «du er registrert som foresatt»  
