# Sync status

## 17.08.2026 — MCP-sammenligning mot designprosjektet (IKKE en zip)

Kjørt `claude-design`-MCP `list_files depth:-1` mot `605a48cc-81e8-44bd-94d2-07d50a97370a` og
diffet sti + `size` mot speilet. **Zip-en fra 16.08 21:11 var utdatert mot prosjektet.**

| Fil | Speil (zip) | Prosjekt | Status |
|---|---|---|---|
| `kart/rutefasit-for-claude-code.md` | 9 382 B (**v1**, 12.08) | 12 543 B (**v2**, 16.08) | ✅ **synket til v2** |
| `github.md` | 8 186 B | 8 659 B | ✅ **synket** |
| `Rutekart v2 - portering og komponentfasit.html` | mangler | 20 060 B | ⬜ **ikke hentet** |
| `_ds_bundle.js` | 645 078 B | 653 935 B | ⬜ **ikke hentet** (over MCP-ens 256 KiB lesegrense) |
| `_adherence.oxlintrc.json` | 79 333 B | 79 360 B | ⬜ **ikke hentet** |

**Hvorfor v1→v2 betyr noe:** v2 la til en **Komponenter-kolonne** per rute, porteringsstrategi
(token-økonomi), modellvalg per oppgaveklasse og skall-pakker. En hel styringsdimensjon manglet
i zip-en. Repo-kopien ligger i `docs/port/rutefasit.md`.

**Lærdom:** zip mot speil målte «0 avvik» hele tiden — driften lå mellom **zip og prosjekt**.
Kjør én MCP-diff før hver portbølge (se `CLAUDE.md` §Skjermarbeid).

**De tre uhentede** er lavrisiko for portarbeidet (`_ds_bundle.js` + `_adherence` er genererte
artefakter som kun påvirker lokal rendring av fasit-HTML; Rutekart-HTML-en er menneskelesbar
utgave av innhold vi nå har i `.md`). De lukkes ved neste zip-leveranse fra Anders.


- **Zip:** «AK Golf HQ — Claude Paper (1).zip» — levert 16.08.2026 21:11 (839 filer).
  Diffet mot 15:41-speilet: **0 endret, 0 slettet, 20 nye** — speilet er nå byte-identisk
  med zip-en (verifisert med `find`-sammenligning + `diff -r` på `jarvis/`).
  De 20 nye: **`jarvis/` (15 filer)** — 12 `/meg`-skjermer + `jarvis-base.css`/`.js` +
  `claude-code-nattsesjon-prompt.md` — og 5 skjermbilder i
  `design_handoff_rutefasit_agenticos/screenshots/`.
  **Merk:** de 5 skjermbildene ligger på disk, men er `.gitignore`-t (`screenshots/`, linje 123),
  så de er IKKE versjonert. I git er speilet derfor 15 filer større, ikke 20 — det er bevisst
  (repoet versjonerer ikke skjermbilder), men betyr at en fersk `git clone` mangler dem.
  **`jarvis/`-skjermene er IKKE dekket av `docs/port/rutefasit.md`** (den kjenner bare
  `/admin/brief (+ meg/dispatch, meg/morgenbrief)`). De styres av `docs/port/PORTPLAN.md` §S0.
- **Zip (forrige):** AK Golf HQ — Claude Paper.zip — levert 16.08.2026 15:41 (824 filer)
- **Dato i repo:** 2026-08-16 — **full resynk**, sha256-diffet mot forrige speil:
  761 identiske · 0 slettet · 6 metafiler endret (`readme.md`, `github.md`,
  `fase1/FASE-1.md` — økt-ID-eksempler rettet til AK-formel v2, `fase2/manifest-w2-komplett.md`
  — talent-fasit er nå `playerhq-talent.html`, `_ds_bundle.js`, `_adherence.oxlintrc.json`)
  · 57 nye filer
- **Reelt nye fasiter (3):** `fase2/playerhq/playerhq-coach-tilbakemelding.html` ·
  `playerhq-profil.html` · `playerhq-utstyr.html` — med manifest
  `fase2/manifest-w3-komplett.md` (inkl. rutekonsolideringer, se checklist §W3)
- **Handoff-pakke:** `design_handoff_rutefasit_agenticos/` — `agencyos-agenticos-hub.html`
  og `agencyos-agent-detalj.html` der er **byte-identiske** med filene som alt ligger i
  `fase2/agencyos/` og er signert i checklisten. Ingen nye rader. `rutefasit.md`-registeret
  ligger alt i `docs/port/rutefasit.md`.
- **Øvrig nytt:** 6 rot-HTML-analyser/planer (spec-dokumenter, ikke pixel-fasiter — bl.a.
  «Min plan»/IUP og Workbench masterplan), 5 `kart/`-notater, `export/design-zip/`
  (kopi av D1–D6-delleveransen), gfgk-logo-assets
- **Checklist:** `docs/port/PAPER-ZIP-CHECKLIST.md`
- **Plan:** `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` (v2.0)
- **Screen map:** `github.md` (i denne mappa)

## Historikk

- Zip (delleveranse), 14.08.2026 23:07 — 27 filer, D1–D6: 6 endret (workbench-desktop/-mobil,
  agencyos-godkjenninger, forelder-barn, playerhq-hjem-varsler, playerhq-test-detalj),
  8 nye (workbench-stall(-mobil), agencyos-okonomi, playerhq-betaling, playerhq-gapping,
  playerhq-ukesdigest m.fl.). Steg 0: `docs/taksonomi-verifikasjon.md` + `docs/fasit-avvik.md`.
- Zip (3), 09.08.2026 — verifisert byte-identisk med zip (2)-speilet (diff = 0 filer).
  Gap-analyse: `docs/port/PAPER-ZIP2-SYNC-2026-08-09.md`.
