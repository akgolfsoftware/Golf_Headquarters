# Fase-spesifikasjon — PlayerHQ 10/10 (V1, Fase 0–5)

> **To lesere, ett dokument.** Hver fase har **Design-brief** (Claude Design) + **Bygg-brief** (koding).
> PlayerHQ er **alltid LYST tema**. Video-verktøy ligger i V2. Flere faser deler motor med AgencyOS — se
> `spesifikasjon-faser-agencyos.md` for backend-detaljer; her er spillerens *visning*.
> Generert 2026-06-30. Krever ja før koding.

---

# DEL A — Delt design-kontekst (gjelder alle PlayerHQ-faser)

**Alle skjermene under er PlayerHQ = LYST tema.**

## Tokens (lyst — `:root` i `globals.css`, autoritativt i `.claude/rules/designsystem.md`)
| Rolle | HEX | Token |
|---|---|---|
| Side-bakgrunn | `#FAFAF7` | `bg-background` |
| Tekst primær | `#0A1F17` | `text-foreground` |
| Tekst sekundær | `#5E5C57` | `text-muted-foreground` |
| Kort | `#FFFFFF` | `bg-card` |
| Primær (CTA, forest) | `#005840` | `bg-primary` |
| Tekst på primær (lime) | `#D1F843` | `text-primary-foreground` |
| Accent (lime, highlights/badges) | `#D1F843` | `bg-accent` |
| Tekst på accent (forest) | `#005840` | `text-accent-foreground` |
| Sand / chips | `#F1EEE5` | `bg-secondary` |
| Border | `#E5E3DD` | `border-border` |
| OK | `#1A7D56` | `text-success` |
| Advarsel | `#B8852A` | `text-warning` |
| Feil | `#A32D2D` | `text-destructive` |
| Info | `#2563EB` | `text-info` |

**Lime-disiplin i lyst tema (hard regel — `theme-light-dark-rule`):** *aldri lime-på-lys flate.* Lime er
highlight/badge på mørke/farge-flater, eller tekst på forest (`text-primary-foreground`). Primær CTA = **forest #005840 med lime tekst**, ikke lime knapp. Alt på PlayerHQ skal være lyst.

## Fonter/ikoner/spacing
Som AgencyOS: Inter / Inter Tight (`font-display`) / JetBrains Mono (tall). Kun Lucide. 8pt-grid; PlayerHQ er
mer luftig enn AgencyOS (mobil-først, `max-w-[430px]`-kolonne), men data-tette analyse-flater kan tettne.

## Mobil-først (viktig)
PlayerHQ er **mobil-først** (430px referanse). Hver skjerm designes for mobil-kolonne + 5-fane bunnbar, så
desktop. Undersider bruker global PortalShell-topbar (hamburger + PLAYERHQ).

## Gjenbruk FØRST
Komponentbibliotek: [`komponenter.md`](komponenter.md). PlayerHQ har `athletic/tab-bar`, `shared/sheet`,
PyramidProgress, KpiStrip, kalender-delsystemet. **Flere nye komponenter deles med AgencyOS** (samme komponent,
lyst tema) — merket under.

## IA-rammen — 5 faner + 4 sidespor
**Hjem · Planlegge · Gjennomføre · Analysere · Meg** (bunnbar) + sidespor **Coach · Booking · Talent(utsatt) · Varsler**.

## Porting-gate + unntak
Ingen låst gate-regel akkurat nå (fjernet 2026-07-03 — design under aktiv utvikling, se `CLAUDE.md`). De
dokumenterte PlayerHQ-unntakene (profilbilde+tier-pill i hero, pill-knappestil, delt shell-topbar på undersider)
lever videre i [`.claude/rules/design-produktbeslutninger.md`](../../.claude/rules/design-produktbeslutninger.md) —
disse er stående beslutninger, uavhengig av handover. Hver skjerm: states tom/laster/feil/fylt.

## Nye komponenter som må DESIGNES
| Komponent | Fase | Deles med AgencyOS | Kort |
|---|---|---|---|
| Percentil-meter + nivå-score-badge | 1 | Ja (#2,#3) | Din percentil + 5-trinns nivå, spiller-vennlig |
| Fordelings-radar (consumer) | 1 | Ja (#2) | Deg mot kohort, 5 SG-akser |
| «Jobb med dette»-kort | 2 | Ja (#1) | Svakhet → 1–2 driller på Hjem |
| Streak/motivasjon-blokk | 2 | Nei | Streak + milepæler + framgang |
| Framgangsfeiring | 2 | Nei | Mestrings-/milepæl-feiring |
| Plan-endring-godta-kort | 3 | Delvis (#4) | «Planen er justert fordi… [Godta]» |
| Delbart spillerkort | 4 | Nei | Eksporterbart bilde (nivå/percentil/framgang) |
| Wellness self-log | 5 | Ja (#9) | Daglig søvn/sårhet/stress |
| Live-puls (consumer) | 5 | Ja (#10) | Følg deg selv/lagkamerater live |
| Dispersion-banekart | 5 | Ja (#11) | Spredning + strategi per hull |

---

# DEL B — Fasene

## Fase 0 — Fundament & opprydding *(S, delt med AgencyOS)*
**Design:** Ingen nye skjermer. Claude Design får IA-fasiten (5 faner + sidespor) + token/komponent-kontekst,
og kan starte på **Hjem** og **Analysere** (de endrer seg mest av nye data). Rydd dublett-ruter er en
IA-/kode-oppgave, ikke design.
**Bygg:** Intelligence-API-kobling (delt), IA-lås skriftlig, rydd dubletter, planlegg additiv datamodell.
**Ferdig når:** IA låst, dubletter ryddet, datakobling på plass.

## Fase 1 — Datainntak + benchmark-visning *(M)* → P2, P3
**Design (LYST):**
| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Analysere → SG-fane | Din percentil per akse + slag-gap + nivå-badge | **percentil-meter**, **nivå-score-badge**, **fordelings-radar** | tom (for få runder) / fylt |
| Gjennomføre → Logg runde | Enkelt skjema (fairway/GIR/putts) + live SG-preview | ui/input + SG-preview-kort | tom / utfylt / lagret / feil |
| Analysere → Import | GolfBox/UpGame-import-flyt med forhåndsvisning | import-wizard (gjenbruk) | velg / forhåndsvis / importert |

**Bygg:** Benchmark-motoren bygges i AgencyOS Fase 1 (delt); her: spiller-`loggRunde`-flyt, `importFromGolfBox`/
`importUpGameShots` → auto-SG, spiller-visning av `benchmark_cache`. Charts leser `lib/design-tokens.ts`.
**Ferdig når:** Spiller ser egen percentil/nivå fra ekte data + kan logge runde selv.

## Fase 2 — Personlig fokus + motivasjon *(M)* → P1, P5
**Design (LYST, fane Hjem):**
| Blokk | Hva vises | Komponenter | States |
|---|---|---|---|
| «Jobb med dette i dag» | Din største svakhet + 1–2 driller, «Start»/«Legg i plan» | **«Jobb med dette»-kort** | tom (alt bra) / fokus |
| Motivasjon | Streak, neste milepæl, framgang siden sist | **streak/motivasjon-blokk** | ingen streak / aktiv |
| Feiring | Mestring/milepæl nådd | **framgangsfeiring** | skjult / feirer |

**Bygg:** Fokus-motor delt med AgencyOS #1 (svakhet → drill). Motivasjon: streak-/milepæl-beregning fra
økt-/runde-historikk. Feiring trigges av milepæl-event.
**Ferdig når:** Hjem viser proaktivt fokus + motivasjon.

## Fase 3 — Plan tilpasser seg *(M)* → P4
**Design (LYST, Planlegge/Hjem):**
| Blokk | Hva vises | Komponenter | States |
|---|---|---|---|
| Plan-justering | «Planen er endret fordi [signal] → [Godta/Spør coach]» | **plan-endring-godta-kort** | ingen / venter / godtatt |

**Bygg:** Spiller-siden av adaptiv loop (motor = AgencyOS Fase 3): `godtaPlan`, `createPlanChangeRequest`,
`beOmEndring`. Vis begrunnelse fra signalet.
**Ferdig når:** Spiller forstår + kan godta plan-tilpasninger.

## Fase 4 — Vekst & abonnement *(M, kan starte tidlig)* → P6
**Design (LYST):**
| Skjerm | Hva vises | Komponenter | States |
|---|---|---|---|
| Hjem/Meg → Delbart kort | «Trading card»: nivå/percentil/framgang, del-knapp | **delbart spillerkort** (eksporterbart bilde) | låst (for lite data) / klar |
| Meg → Abonnement | Ekte betaling/faktura, ryddet oppgrader/avbestill-flyt | abonnement-panel (gjenbruk) | gratis / pro / utløpt |

**Bygg:** Delbart kort = bilde-generering (nivå/percentil/framgang) + delingslenke til akgolf.no-funnel. Stripe
delt med AgencyOS #5. Slå sammen oppgrader-stubs.
**Ferdig når:** Spiller kan dele kort + ekte abonnement fungerer.

## Fase 5 — Differensierende delspor *(L, parallelle)* → P7–P10
| # | Fane | Blokk | Nye komponenter | States |
|---|---|---|---|---|
| P7 | global Caddie | MORAD-forankret + proaktiv chat | (utvid chat m/ kilde-sitat) | tom/svar/feil |
| P8 | Meg/Hjem | Daglig wellness + belastning | **wellness self-log** + ACWR-graf (delt) | tom/logget/risiko |
| P9 | Hjem/Analysere | Live-puls deg + lagkamerater + ukeresultat | **live-puls** (delt) | før/live/etter |
| P10 | Analysere/Baneguide | Spredning + strategi per hull | **dispersion-banekart** (delt) | tom/kart |

**Bygg:** Alle deler backend med AgencyOS Fase 5 (#8–#11); her er spiller-visning + at spiller er logge-kilde for P8.
**Ferdig når:** Hvert delspor levert isolert.

---

# V2 — Video *(eget prosjekt)*
| # | Fane | Hva | Komponenter |
|---|---|---|---|
| V2-1 | Gjennomføre/Coach | Selv-opptak → send → annotert svar | video-opptak + annotering |
| V2-2 | Analysere/Caddie | AI-svinganalyse P1–P10 på egen video | CV-overlay + MORAD-feedback |

---

## Arbeidsdeling design ↔ kode
- **Claude Design** starter på **Hjem** + **Analysere** (Fase 0-kontekst holder), så fasene i rekkefølge.
- **Backend deles med AgencyOS** — bygg motoren én gang der, lag PlayerHQ-visningen (lyst) her.
- Nye komponenter designes mot LYST token-tabell i Del A; gjenbruk athletic/ui.

## Neste steg
1. Du godkjenner faseinnholdet.
2. Fase 0 detaljeres til nummerert byggeplan (felles med AgencyOS Fase 0).
3. Dette + `spesifikasjon-faser-agencyos.md` gis til Claude Design som komplett brief for begge apper.
