# Designsystem-fasit — AK Golf HQ v2

> **Låst 2026-07-20.** Ved konflikt vinner denne fila + `tokens/v2/tokens.css` i Claude Design
> + `src/lib/v2/tokens.ts` / `--v2-*` i `globals.css`. Aldri gjett farger eller navn.

**Claude Design:** https://claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d  
**Retning:** C «Presis» (valgt 9. juli 2026)

---

## 1. Produkter og tema

| Produkt | Rute | Tema | Bryter? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Alltid lys** | Nei |
| **AgencyOS** | `/admin` | Lys/mørk, standard mørk | Ja (cookie `ak-admin-theme`) |
| **Forelder** | `/forelder` | Lys | Nei |
| **Marketing** | `akgolf.no` | Begge (hero kan være mørk) | N/A |
| **Auth** | `/auth` | Lys | Nei |

- Coach-chrome (sidebar/topbar) i AgencyOS: **alltid forest**, uansett tema.
- «Mørk-først» gjelder **design av v2-komponenter i mørk default** — ikke at PlayerHQ er mørk.

**Navn (låst):** AgencyOS (aldri «CoachHQ»). PlayerHQ. Presisjonsstrategi (aldri «DECADE» i UI).

---

## 2. Tokens (ene kilde)

| Kilde | Bruk |
|---|---|
| Claude Design `tokens/v2/tokens.css` | Design-fasit |
| Prod `src/app/globals.css` `--v2-*` | Runtime |
| Prod `src/lib/v2/tokens.ts` (`T`) | TS/React inline |

**Merkevare (hue, aldri endre uten beslutning):**
- Forest `#005840`
- Lime `#D1F843` (mørk: CTA/valgt; **lys: remappes til forest** — aldri lime-på-lys)
- On-lime: mørk `#0D0E0D` · lys `#FFFFFF`

**Mørk canvas:** `#131513` (`--v2-bg`) — ikke gammel `#0A1F18` / `#0A0B0A`.  
**Lys canvas:** `#F2F1EA` cream.

**Typografi:** Familjen Grotesk (display) · Inter (UI) · JetBrains Mono (tall).  
**Ikoner:** Lucide 1.5px — aldri emoji.  
**Grid:** 8pt. Kort-radius 20px. Piller 9999px.

---

## 3. Visuelle regler (kort)

1. **Én lime-jobb per skjerm** (CTA / valgt fane / aktiv pin) — ikke tre steder.
2. **Data opp/ned** = `--v2-up` / `--v2-down` — aldri lime for delta.
3. **Elevation:** mørk = lysere panel; lys = myk skygge. Ikke borders som elevation i mørk.
4. **Tall:** mono, enhet alltid, «—» for manglende, norsk komma.
5. **Anbefalinger, aldri sperrer** — klarspråk i spillerflater.
6. **HjelpTips («?»)** på alle tall/faguttrykk i v2-skjermer.
7. **Wireframe først** i 390 / 834 / 1280 (+ 1680 AgencyOS) før hi-fi.

---

## 4. Komponentbibliotek (Claude Design)

~**124** navngitte komponenter i `components/` (13 familier):

| Familie | Rolle |
|---|---|
| core | Button, Card, Tag, Icon, ThemeToggle… |
| forms | Input, Select, DatePicker… |
| overlays | Modal, Sheet, Drawer, Toast… |
| structure | Avatar, EmptyState, Skeleton… |
| data | KpiTile, DataTable, charts… |
| domain | AnbefalingsKort, SpillerKort, BookingKort… |
| golfdata | SG/analyse (overgang — nye flater bruker v2) |
| trackman | DispersionPlot, TrajectoryPlot… |
| calendar | DayStrip, UkeKalender, Periodeplan… |
| nav | BottomNav, NavRail, SpillerGruppeVeksler… |
| feedback | AiTipCard, HjelpPopover, ValidationChip… |
| kategori | KategoriStige, TidsPyramide… |
| marketing | FeaturedCard… |

**Ferdig komponent =** default + hover + focus + disabled + loading + empty + error  
(+ drag-over der relevant) × lys + mørk der begge brukes × `.d.ts` + `.prompt.md` + demo.

**Gap-regel:** mangler mønster → ny komponent i systemet først, aldri ad-hoc i én skjerm.

---

## 5. Skjerm-familier (for PlayerHQ + AgencyOS)

| Familie | Eksempel | Mobil | Desktop |
|---|---|---|---|
| Shell | layout + nav | Bunn-nav 5 | Ikon-rail |
| Hub | hjem / cockpit | 1 hero-tall | Grid KPI |
| Liste | stall / runder | Kortliste | Tabell |
| Detalj | spiller 360 | Stack | Split |
| Wizard | ny plan / booking | Full steg | Steg + preview |
| Live | økt / tapper | Fullskjerm | Fullskjerm |
| Analyse | SG-hub / faner | Faner stack | Faner + sidepanel |
| Kalender | uke / måned | Dag + stripe | Uke/måned grid |

---

## 6. Rekkefølge (låst)

1. Designsystem ferdig (denne fasiten + tokens + komponentstatus)  
2. Wireframe per familie  
3. Hi-fi alle PlayerHQ-ruter  
4. Hi-fi alle AgencyOS-ruter  
5. Port til kode bølge for bølge  

Aldri: fikse design bare i prod. Aldri: VibeUI/ekstern stil som kilde.

---

## 7. Skills (etter oppdatering 2026-07-20)

| Skill | Bruk |
|---|---|
| `akgolf-design-system` | Tokens, lovlige farger/navn, review mot fasit |
| `ak-designekspert` | Tenking, wireframe, kritikk, golf-analyse-UI |
| `ak-golf-hq-design` | **Ikke bruk** — utdatert (CoachHQ/Inter Tight) |

---

## 8. Status / gap (2026-07-20)

**Solid:** tokens mørk+lys, ~124 komponenter m/ d.ts/prompt, store ui_kits (v2, playerhq, agencyos), guidelines (tema-bevis, tilstander).

**Ferdig fase 1a (2026-07-20):**
- [x] `FASIT.md` i Claude Design + repo
- [x] `ui_kits/v2/README.md` oppdatert (PlayerHQ alltid lys)
- [x] `KOMPONENTSTATUS.md` (124/124 full trippel)
- [x] Skills v2 + utdatert skill deaktivert
- [x] `docs/redesign-v2` → `docs/arkiv/redesign-v2`
- [x] `SKJERM-FAMILIER.md` + gråtone-wireframe board

**Neste:**
- [ ] Hi-fi per familie (etter wireframe-godkjenning)
- [ ] Alle PlayerHQ-ruter mappet til familie + mockup
- [ ] Alle AgencyOS-ruter mappet til familie + mockup

**Ikke i scope her:** full kodeport av alle skjermer (etter design).
