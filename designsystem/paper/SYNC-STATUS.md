# Sync status

## 20.08.2026 — resynk mot «AK Golf HQ — Claude Paper (1).zip» (3,45 MB, levert av Anders)

Speilet er byte-erstattet med zip-innholdet. **821 filer · 251 HTML** (før: 840 · 254).
Endringen: 51 nye, 101 endret, 71 fjernet — de fjernede er nesten utelukkende
opprydding designprosjektet gjorde selv 20.08 (`export/`,
`design_handoff_rutefasit_agenticos/`, 26 utgåtte `kart/`-ordrer fra juli).
Full linje-for-linje-oversikt: `CHANGELOG.md` på speilets rot (ny fil, bestilt).

**Zip-en leverer fase 2 av treningsplanleggings-planen** — de åtte skjermene fra
`docs/gap-designfasit-workbench-2026-08-20.md`, som «utvid seks, tegn to»:

| Skjerm | Resultat |
|---|---|
| 1 Workbench-kalender | `fase1/workbench-desktop.html` omskrevet: årstidslinje i d1280 OG m390, skall-økter i begge. `workbench-mobil.html` slettet — m390 bor nå i desktop-fila |
| 2 Periodemal | **NY** `fase1/workbench-periodemal.html`. `agencyos-periodemal.html` merket utgått |
| 3 Økt-editoren | `playerhq-okt-detalj.html` + rediger-tilstand, teknikk-dimensjon, motorikk kun på fullsving |
| 4 Teknisk plan | `playerhq-teknisk-plan.html` + målmatrise, rep-telling, statusrapport med tre kontekster |
| 5 Live-økta | `playerhq-live-okt.html` + hurtigtapp, FYS-serier, sone-segmenter, spontan drill · `-live-summary.html` + tre stjernerader, pausetid |
| 6 Gruppeplanlegging | `agencyos-gruppe-detalj.html` + «blir nå din egen», hovedcoach, laster/feil |
| 7 Spillerprofilen | **Avklart:** `fase2/playerhq/playerhq-profil.html` er eneste fasit; `fase1/spillerprofil.html` merket utgått |
| 8 Standard/Tour | `playerhq-innstillinger.html` + Visning-gruppe · **NY** `playerhq-onboarding-tillegg.html` |

**Åtte nye komponenter — BYGGET 20.08.2026** (var savnet i `_ds_bundle.js`, den
Claude Design-kompilerte bundelen): TallStepper, MaalMatrise, HurtigTapper,
SettLogger, SoneSegmentLogger, StjerneRad, DagVelger, MaaleFelt. Kildefiler
(`.jsx` + `.d.ts` + `.prompt.md`, samme trepartsmønster som resten av
`components/`) ligger i `components/actions|data|forms/`, registrert i
`_ds_manifest.json`. Verifisert med `node scripts/bygg-bundle.mjs` — bygger
160 navn fra 155 moduler uten feil (var 152/147). `_ds_bundle.js` selv er
Claude Designs eget kompilat og oppdateres ved neste server-synk, ikke
håndredigert her — porteringssesjonene i fase 3 kan uansett lese komponentene
direkte fra kildefilene. Radene i `docs/port/rutefasit.md` §W8 er derfor
ublokkert.

### MCP-sammenligningen (CLAUDE.md-regelen mot utdatert zip)

Kjørt mot `605a48cc` samme dag. **Zip = prosjekt.** Null filer i prosjektet mangler i
speilet, og de ni filene som først så ut som avvik var kun et tidsvindu: den første
MCP-lista i økten ble hentet før Anders' siste lagringer. Verifisert på nytt mot
`fase2/playerhq` — alle størrelser stemmer eksakt.

Én notis: `playerhq-onboarding-tillegg.html` rapporteres 10 769 B av MCP-en mot 10 709 B
på disk. Innholdet er verifisert identisk (152 linjer, alle seksjoner og `data-od-id`-er
til stede) — differansen er tegnkoding i MCP-ens størrelsesrapport, ikke drift.

De tre uhentede fra 17.08 er nå inne: `_ds_bundle.js`, `_adherence.oxlintrc.json` og
`Rutekart v2 - portering og komponentfasit.html`.

---

## 17.08.2026 — MCP-sammenligning mot designprosjektet (IKKE en zip)

Kjørt `claude-design`-MCP `list_files depth:-1` mot `605a48cc-81e8-44bd-94d2-07d50a97370a` og
diffet sti + `size` mot speilet. **Zip-en fra 16.08 21:11 var utdatert mot prosjektet.**
`kart/rutefasit-for-claude-code.md` lå som v1 (9 382 B) i zip-en mens prosjektet hadde v2
(12 543 B) med en helt ny Komponenter-kolonne — en hel styringsdimensjon manglet.

**Lærdom:** zip mot speil målte «0 avvik» hele tiden — driften lå mellom **zip og prosjekt**.
Kjør én MCP-diff før hver portbølge (se `CLAUDE.md` §Skjermarbeid). Repo-kopien av v2 bor i
`docs/port/rutefasit.md`.
