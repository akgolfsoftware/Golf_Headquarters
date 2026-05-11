# Design 2.0 — Komplett pakke for Claude Design

**Klar for kjøring i claude.ai/design.** Alt du trenger ligger her — system-kontekst, prompts, vedlegg, oppskrift.

## Hva er dette?

Etter forrige runde leverte Claude Design 60 % broken-skjermer (state-katalog). Denne pakka er kompromisset: ren mappestruktur, anti-state-katalog-instruks, 14 mini-batches → 69 produksjons-skjermer.

## Mappestruktur

```
design2.0/
├── 00-system/          ← Lastes opp ÉN gang per Claude Design-sesjon
│   ├── branding-style-guide.html
│   ├── design-system-v2.md
│   ├── felles-instruks.md       ← KRITISK anti-state-katalog
│   └── fonts/ (20 .woff2)
│
├── 01-coachhq-A/       ← Plan-management (360-profil, Plan-builder, etc.)
├── 02-coachhq-B/       ← Operative dashboards (Daglig brief, Facilities, Analytics-v2, Audit, Reports)
├── 03-coachhq-C/       ← Kalender + lister (Kalender, Kapasitet, Lag-snitt, Meldinger, Oppfolgingsko)
├── 04-coachhq-D/       ← Spesial (Talent + Spiller-detalj light)
│
├── 05-playerhq-A/      ← Mål-data (Baner, Mal-detalj, Leaderboard, Test-detalj, TrackMan-analyse)
├── 06-playerhq-B/      ← Coach-samhandling (Coach-detalj, Coaching-planer, Coach-notes, etc.)
├── 07-playerhq-C/      ← Wizards + kalender (Ny-okt-wizard, Onskeligokt, Compose, etc.)
│
├── 08-modal-A/         ← Plan-modaler (7 stk)
├── 09-modal-B/         ← Live Session 2-4 (3 stk)
├── 10-modal-C/         ← Booking-modaler (4 stk inkl. 2 nye)
├── 11-modal-D/         ← Round/Stats/Agent (6 stk inkl. 2 nye)
├── 12-modal-E/         ← Social/Tier/Other (7 stk inkl. 4 nye)
│
├── 13-redesign-A/      ← Live Session-flyten (5 skjermer som var broken)
└── 14-redesign-B/      ← Agenter + pipeline (5 skjermer som var broken)
```

Hver mini-batch-mappe inneholder:
- **`spec.md`** — konsolidert skjerm-spec
- **`prompt.md`** — custom prompt å kopiere inn
- **`vedlegg.txt`** — opplastings-liste (filstier til wireframe/-mappa)
- **`vedlegg/`** — alle HTML-filer du skal laste opp (allerede kopiert hit)

Redesign-mappene har egne `prompt-1-...md`-filer per skjerm (kjøres én av gangen).

---

## Slik bruker du

### Start ny Claude Design-sesjon

**Last opp 23 systemfiler én gang per sesjon** (du kan beholde dem på tvers av mini-batches hvis sesjonen er aktiv):

1. `00-system/branding-style-guide.html`
2. `00-system/design-system-v2.md`
3. `00-system/felles-instruks.md` ← KRITISK
4. Alle 20 .woff2-filer fra `00-system/fonts/`

Skriv i Claude Design: *"Designsystem + felles-instruks lastet. Bekreft at du har lest."*

### Per mini-batch (eks. 01-coachhq-A)

1. **Last opp 7 filer** fra mini-batch-mappa:
   - `01-coachhq-A/spec.md`
   - `01-coachhq-A/vedlegg/` — alle 5 HTML-filer

2. **Kopier promp:** Åpne `01-coachhq-A/prompt.md`, kopier hele PROMPT-blokken, lim inn som første melding

3. **Generer:** Claude Design produserer 5 skjermer

4. **Lim design-link tilbake** til Claude Code (meg) per godkjent skjerm — jeg verifiserer og oppdaterer tracker

---

## Anbefalt 7-dagers plan

| Dag | Mini-batches | Skjermer | Tid |
|---|---|---|---|
| 1 | `01-coachhq-A` + `02-coachhq-B` | 10 | 2 t |
| 2 | `03-coachhq-C` + `04-coachhq-D` | 7 | 1,5 t |
| 3 | `05-playerhq-A` + `06-playerhq-B` | 10 | 2 t |
| 4 | `07-playerhq-C` + `08-modal-A` | 12 | 2 t |
| 5 | `09-modal-B` + `10-modal-C` | 7 | 1,5 t |
| 6 | `11-modal-D` + `12-modal-E` | 13 | 2 t |
| 7 | `13-redesign-A` + `14-redesign-B` | 10 | 2 t |
| **TOTAL** | **14 mini-batches** | **69 skjermer** | **13 t** |

---

## Sjekkliste per godkjent skjerm

For HVER skjerm fra Claude Design, sjekk:

- [ ] Det er ÉN skjerm, ikke state-katalog (`grep -c "cap-title\|data-screen-label"` skal være ≤ 1)
- [ ] Fyller hele viewport (fullscreen-skjermer)
- [ ] Inneholder konkret innhold (Markus, Anders, 12,4, "Putte-økt")
- [ ] Ingen "God morgen, [Navn]" eller "Welcome back" — italic editorial istedet
- [ ] Komma som desimal (12,4 ikke 12.4)
- [ ] Mellomrom som tusenseparator (1 600 kr)
- [ ] Maks 3 lime-elementer synlig
- [ ] Norske tegn rendres korrekt (æ/ø/å)

Hvis et punkt feiler: klikk "Needs work..." og gi feedback.

---

## Stop-condition

**Hvis første mini-batch (`01-coachhq-A`) leverer ≤ 3/5 rene produksjons-skjermer:**

Vi bytter til **Plan B: direkte React-generering med Claude Code**. Sparer Anders flere dager med claude.ai/design-arbeid og gir produksjonskode direkte.

Si fra etter at du har gjennomgått første batch.

---

## Etter alle 14 mini-batches

Claude Code (Anders + jeg) konverterer godkjente HTML-skjermer til React-komponenter i:

- `src/app/admin/*` (CoachHQ-skjermer)
- `src/app/portal/*` (PlayerHQ-skjermer)
- `src/components/modals/*` (alle modaler)
- `src/app/live/*` (redesignede live/agent-skjermer)

**Klart til å starte. Åpne `01-coachhq-A/prompt.md` og gå i gang.**
