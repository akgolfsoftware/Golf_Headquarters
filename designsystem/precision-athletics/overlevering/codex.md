# Overlevering til Codex — AK Golf HQ

Generert 27.09.2026 fra designsystemet «AK Golf Precision Athletics». Mål: Next.js App Router + Tailwind v4 + shadcn/ui i AK Golf HQ.

- Tokens: [tokens.css](tokens.css) (alle variabler, lyst og natt) · kilde `../tokens/*.css`
- Skjermkataloger: se lenke per skjerm under · oversikt: [../oversikt.html](../oversikt.html) · regler: [../readme.md](../readme.md) · ord: [../guidelines/ordmaster.md](../guidelines/ordmaster.md)

**Sluttkontroll 27.09.2026 — klar for Port 7 / Anders-gjennomgang.** Samlet revisjon (`ui_kits/audit.html?w=320,360,390,430,768,834,1024,1180,1280,1440`): 4 110 tilfeller, 0 avvik. Kontrollert: PH-01–26 (lyst og natt), AG-01–24, FO-01–06, AU-01–06, BK-01–03, ST-01–06, GJ-01–02, SY-01 og markedssiden i alle ti bredder og alle fire tilstander; EP-01–06 i 320, 360, 390, 430 og 600, lyst og mørkt, gjest og appbruker. Rettet i sluttkontrollen: markedssidens overskrift og topplinje var 24 px for brede på 320 px (skriftstørrelse 30 px under 380 px, orddeling, logo krymper).

**Lukket 27.09.2026:** én spillerprofil (AG-08, AG-03 lenker dit) · ST-05 ekte PGA-navn og Data Golfs fordeling for egne tall · all betalt booking bekreftes automatisk (offentlig og i appen) · EP-05 klar hos coach innen 24 t · EP-06 én gang etter 14 dager · offentlig booking bekreftes automatisk · gratis avbestilling til 24 timer før (`src/lib/booking/policy.ts`) · GFGK = Gamle Fredrikstad Golfklubb.

## 1. Faste regler Codex ikke kan bryte
1. Primærknapp er grafitt `#141413` (`--primary`) med hvit tekst. Én primærhandling per flate.
2. Rust `#9B2415` (`--signal`) bare som signal: haster eller ødelegger, Live-pillen, tellere som krever coachens handling. Høyst én rust per skjerm.
3. Farge betyr aksen (FYS · TEK · SLAG · SPILL · TURN) og ingenting annet. Øktkort: overflate + 4 px aksestripe til venstre, delt ved flere akser. Fremdrift grafitt. Grønt/gult/rødt bare som status.
4. Bare tokens — ingen hardkodede farger i komponenter eller sider.
5. Ingen sidelengs rulling i noen bredde (`scrollWidth === clientWidth`). Tabeller blir kortrader under 760 px, filtre og faner bryter linje.
6. Fire tilstander på hver skjerm: Data · Tom (neste handling) · Laster (mono-setning, ingen spinner) · Feil (hva gikk galt + Prøv igjen + feilkode i mono).
7. «—» for manglende verdi, aldri 0. Alle måltall har kilde og dato; estimat merkes.
8. Bare demodata med oppdiktede navn i eksempler og seed.
9. Kun brutto score. Til par regnes fra resultatet (brutto minus par for spilte hull), aldri fra banens totale par.
10. Plassering er rangering, aldri persentil (persentil bare for PGA-tall fra Data Golf).
11. Spillere født 2008 eller senere uten samtykke vises aldri. Manglende fødselsår vises ikke. Under 16 år gir forelderen samtykket.
12. «Powered by Data Golf» på alle offentlige statistikkflater og der DataGolf-tall vises.
13. Ingen kartleggingsøkt noe sted.
14. Lyst tema er standard. Natt (`data-theme="night"`) på PH-04–08 og PH-15, valgfritt AG-13.
15. Hurtigknapp bare i AgencyOS, én delt komponent i skallet. Caddie/Jarvis forbereder og sender ingenting selv — alt som går til et menneske er et utkast.
16. Treffmål minst 44 px (56 px på natt/ute). Ingen emoji. Ord og statuser fra ordmasteren (f.eks. «Venter på coach», «Løst», «Følg med», «Book time», «Etterlevelse», P1.0–P10.0, AK-stigen Mini → Basis → Utvikling → Elite med Knøtt ved siden av).

## 2. Tokens

Alle 231 variabler. Fil: `../tokens/<fil>.css`, samlet i [tokens.css](tokens.css). Tailwind v4: legg tokens.css i `@theme`-laget eller som `:root`-variabler og referer med `var(--…)`.

| Token | Verdi | Tema | Fil | Bruk |
|---|---|---|---|---|
| `--sand-100` | `#faf8f3` | lyst | colors | Sand |
| `--sand-150` | `#f1eee8` | lyst | colors | Sand |
| `--sand-200` | `#e6e3dd` | lyst | colors | Sand |
| `--sand-300` | `#ddd9d1` | lyst | colors | Sand |
| `--sand-400` | `#c9c4ba` | lyst | colors | Sand |
| `--white` | `#ffffff` | lyst | colors | Sand |
| `--graphite-900` | `#141413` | lyst | colors | Grafitt |
| `--graphite-800` | `#2a2926` | lyst | colors | Grafitt |
| `--graphite-700` | `#3a3935` | lyst | colors | Grafitt |
| `--graphite-600` | `#46443f` | lyst | colors | Grafitt |
| `--graphite-500` | `#686560` | lyst | colors | Grafitt |
| `--graphite-400` | `#8a8680` | lyst | colors | Grafitt |
| `--rust-600` | `#9b2415` | lyst | colors | Rust |
| `--rust-700` | `#7d1c10` | lyst | colors | Rust |
| `--rust-400` | `#d8553f` | lyst | colors | Rust |
| `--rust-100` | `#fbebea` | lyst | colors | Rust |
| `--night-950` | `#0c0d0c` | lyst | colors | Natt |
| `--night-900` | `#141513` | lyst | colors | Natt |
| `--night-850` | `#1b1c1a` | lyst | colors | Natt |
| `--night-800` | `#232421` | lyst | colors | Natt |
| `--night-700` | `#2f302c` | lyst | colors | Natt |
| `--night-500` | `#6e6c66` | lyst | colors | Natt |
| `--night-300` | `#a9a59d` | lyst | colors | Natt |
| `--night-200` | `#cfcbc2` | lyst | colors | Natt |
| `--green-700` | `#2f6b3a` | lyst | colors | Semantisk rå |
| `--green-50` | `#eaf2ea` | lyst | colors | Semantisk rå |
| `--amber-700` | `#7e6110` | lyst | colors | Semantisk rå |
| `--amber-50` | `#fbf4e4` | lyst | colors | Semantisk rå |
| `--blue-800` | `#1d3557` | lyst | colors | Semantisk rå |
| `--blue-50` | `#e8edf4` | lyst | colors | Semantisk rå |
| `--course-rough` | `#1f2a22` | lyst | colors | Banekart (nattkart) |
| `--course-rough-2` | `#233026` | lyst | colors | Banekart (nattkart) |
| `--course-green` | `#2b4a33` | lyst | colors | Banekart (nattkart) |
| `--course-green-edge` | `#3f6a4a` | lyst | colors | Banekart (nattkart) |
| `--course-bunker` | `#2a2823` | lyst | colors | Banekart (nattkart) |
| `--axis-fys` | `#788c5d` | lyst | colors | Fem treningsakser |
| `--axis-fys-ink` | `#63784a` | lyst | colors | Fem treningsakser |
| `--axis-fys-soft` | `rgba(120,140,93,.13)` | lyst | colors | Fem treningsakser |
| `--axis-tek` | `#b8852a` | lyst | colors | Fem treningsakser |
| `--axis-tek-ink` | `#8a6316` | lyst | colors | Fem treningsakser |
| `--axis-tek-soft` | `rgba(184,133,42,.13)` | lyst | colors | Fem treningsakser |
| `--axis-slag` | `#2563eb` | lyst | colors | Fem treningsakser |
| `--axis-slag-ink` | `#1d4fd0` | lyst | colors | Fem treningsakser |
| `--axis-slag-soft` | `rgba(37,99,235,.13)` | lyst | colors | Fem treningsakser |
| `--axis-spill` | `#c46686` | lyst | colors | Fem treningsakser |
| `--axis-spill-ink` | `#9e4a67` | lyst | colors | Fem treningsakser |
| `--axis-spill-soft` | `rgba(196,102,134,.16)` | lyst | colors | Fem treningsakser |
| `--axis-turn` | `#a32d2d` | lyst | colors | Fem treningsakser |
| `--axis-turn-ink` | `#a32d2d` | lyst | colors | Fem treningsakser |
| `--axis-turn-soft` | `rgba(163,45,45,.13)` | lyst | colors | Fem treningsakser |
| `--surface-page` | `var(--sand-200)` | lyst | colors | Fem treningsakser |
| `--surface-flat` | `var(--sand-100)` | lyst | colors | Fem treningsakser |
| `--surface-card` | `var(--white)` | lyst | colors | Fem treningsakser |
| `--surface-sunken` | `var(--sand-150)` | lyst | colors | Fem treningsakser |
| `--surface-hover` | `var(--sand-150)` | lyst | colors | Fem treningsakser |
| `--surface-inverse` | `var(--graphite-900)` | lyst | colors | Fem treningsakser |
| `--text-primary` | `var(--graphite-900)` | lyst | colors | Fem treningsakser |
| `--text-body` | `var(--graphite-800)` | lyst | colors | Fem treningsakser |
| `--text-secondary` | `var(--graphite-600)` | lyst | colors | Fem treningsakser |
| `--text-muted` | `var(--graphite-500)` | lyst | colors | Fem treningsakser |
| `--text-faint` | `var(--graphite-400)` | lyst | colors | Fem treningsakser |
| `--text-on-primary` | `var(--white)` | lyst | colors | Fem treningsakser |
| `--text-inverse` | `var(--sand-100)` | lyst | colors | Fem treningsakser |
| `--border-hairline` | `var(--sand-300)` | lyst | colors | Fem treningsakser |
| `--border-strong` | `var(--sand-400)` | lyst | colors | Fem treningsakser |
| `--border-control` | `var(--graphite-500)` | lyst | colors | Fem treningsakser |
| `--border-ink` | `var(--graphite-900)` | lyst | colors | Fem treningsakser |
| `--primary` | `var(--graphite-900)` | lyst | colors | Fem treningsakser |
| `--primary-hover` | `var(--graphite-700)` | lyst | colors | Fem treningsakser |
| `--primary-press` | `var(--graphite-800)` | lyst | colors | Fem treningsakser |
| `--signal` | `var(--rust-600)` | lyst | colors | Fem treningsakser |
| `--signal-hover` | `var(--rust-700)` | lyst | colors | Fem treningsakser |
| `--signal-tint` | `var(--rust-100)` | lyst | colors | Fem treningsakser |
| `--signal-ink` | `var(--rust-600)` | lyst | colors | Fem treningsakser |
| `--ok` | `var(--green-700)` | lyst | colors | Fem treningsakser |
| `--ok-tint` | `var(--green-50)` | lyst | colors | Fem treningsakser |
| `--warn` | `var(--amber-700)` | lyst | colors | Fem treningsakser |
| `--warn-tint` | `var(--amber-50)` | lyst | colors | Fem treningsakser |
| `--info` | `var(--blue-800)` | lyst | colors | Fem treningsakser |
| `--info-tint` | `var(--blue-50)` | lyst | colors | Fem treningsakser |
| `--link` | `var(--blue-800)` | lyst | colors | Fem treningsakser |
| `--focus-ring` | `var(--graphite-900)` | lyst | colors | Fem treningsakser |
| `--period-grunn` | `var(--graphite-600)` | lyst | colors | Periodetyper i årsplanen |
| `--period-spesial` | `var(--graphite-500)` | lyst | colors | Periodetyper i årsplanen |
| `--period-turnering` | `var(--graphite-900)` | lyst | colors | Periodetyper i årsplanen |
| `--period-evaluering` | `var(--graphite-400)` | lyst | colors | Periodetyper i årsplanen |
| `--scrim-modal` | `rgba(20,20,19,.44)` | lyst | colors | Periodetyper i årsplanen |
| `--scrim-photo` | `linear-gradient(to bottom,rgba(20,20,19,.5) 0%,rgba(20,20,19,0) 24%,rgba(20,20,19,0) 40%,rgba(20,20,19,.8) 100%)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-fys-fg` | `var(--axis-fys-ink)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-tek-fg` | `var(--axis-tek-ink)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-slag-fg` | `var(--axis-slag-ink)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-spill-fg` | `var(--axis-spill-ink)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-turn-fg` | `var(--axis-turn-ink)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-fys-bg` | `var(--axis-fys-soft)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-tek-bg` | `var(--axis-tek-soft)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-slag-bg` | `var(--axis-slag-soft)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-spill-bg` | `var(--axis-spill-soft)` | lyst | colors | Periodetyper i årsplanen |
| `--axis-turn-bg` | `var(--axis-turn-soft)` | lyst | colors | Periodetyper i årsplanen |
| `--surface-page` | `var(--night-950)` | natt | colors | Mørkt tema |
| `--surface-flat` | `var(--night-900)` | natt | colors | Mørkt tema |
| `--surface-card` | `var(--night-850)` | natt | colors | Mørkt tema |
| `--surface-sunken` | `var(--night-900)` | natt | colors | Mørkt tema |
| `--surface-hover` | `var(--night-800)` | natt | colors | Mørkt tema |
| `--surface-inverse` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--text-primary` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--text-body` | `var(--night-200)` | natt | colors | Mørkt tema |
| `--text-secondary` | `var(--night-300)` | natt | colors | Mørkt tema |
| `--text-muted` | `var(--night-300)` | natt | colors | Mørkt tema |
| `--text-faint` | `var(--night-500)` | natt | colors | Mørkt tema |
| `--text-on-primary` | `var(--graphite-900)` | natt | colors | Mørkt tema |
| `--text-inverse` | `var(--graphite-900)` | natt | colors | Mørkt tema |
| `--border-hairline` | `var(--night-700)` | natt | colors | Mørkt tema |
| `--border-strong` | `var(--night-500)` | natt | colors | Mørkt tema |
| `--border-control` | `var(--night-300)` | natt | colors | Mørkt tema |
| `--border-ink` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--primary` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--primary-hover` | `var(--white)` | natt | colors | Mørkt tema |
| `--primary-press` | `var(--night-200)` | natt | colors | Mørkt tema |
| `--signal` | `var(--rust-600)` | natt | colors | Mørkt tema |
| `--signal-hover` | `#b12a19` | natt | colors | Mørkt tema |
| `--signal-tint` | `rgba(216,85,63,.16)` | natt | colors | Mørkt tema |
| `--signal-ink` | `var(--rust-400)` | natt | colors | Mørkt tema |
| `--ok` | `#7cc48a` | natt | colors | Mørkt tema |
| `--ok-tint` | `rgba(124,196,138,.14)` | natt | colors | Mørkt tema |
| `--warn` | `#e0b050` | natt | colors | Mørkt tema |
| `--warn-tint` | `rgba(224,176,80,.14)` | natt | colors | Mørkt tema |
| `--info` | `#8fb0e6` | natt | colors | Mørkt tema |
| `--info-tint` | `rgba(143,176,230,.14)` | natt | colors | Mørkt tema |
| `--link` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--focus-ring` | `var(--sand-100)` | natt | colors | Mørkt tema |
| `--scrim-modal` | `rgba(0,0,0,.6)` | natt | colors | Mørkt tema |
| `--axis-fys` | `#56c59a` | natt | colors | Mørkt tema |
| `--axis-tek` | `#e8a33d` | natt | colors | Mørkt tema |
| `--axis-slag` | `#84a9ff` | natt | colors | Mørkt tema |
| `--axis-spill` | `#d98aa3` | natt | colors | Mørkt tema |
| `--axis-turn` | `#f2908c` | natt | colors | Mørkt tema |
| `--axis-fys-fg` | `var(--axis-fys)` | natt | colors | Mørkt tema |
| `--axis-tek-fg` | `var(--axis-tek)` | natt | colors | Mørkt tema |
| `--axis-slag-fg` | `var(--axis-slag)` | natt | colors | Mørkt tema |
| `--axis-spill-fg` | `var(--axis-spill)` | natt | colors | Mørkt tema |
| `--axis-turn-fg` | `var(--axis-turn)` | natt | colors | Mørkt tema |
| `--axis-fys-bg` | `rgba(86,197,154,.16)` | natt | colors | Mørkt tema |
| `--axis-tek-bg` | `rgba(232,163,61,.16)` | natt | colors | Mørkt tema |
| `--axis-slag-bg` | `rgba(132,169,255,.16)` | natt | colors | Mørkt tema |
| `--axis-spill-bg` | `rgba(217,138,163,.16)` | natt | colors | Mørkt tema |
| `--axis-turn-bg` | `rgba(242,144,140,.16)` | natt | colors | Mørkt tema |
| `--font-sans` | `"IBM Plex Sans","IBM Plex Sans Fallback",system-ui,sans-serif` | lyst | typography | — |
| `--font-mono` | `"IBM Plex Mono","IBM Plex Mono Fallback",ui-monospace,monospace` | lyst | typography | — |
| `--fs-10` | `10px` | lyst | typography | — |
| `--fs-11` | `11px` | lyst | typography | — |
| `--fs-13` | `13px` | lyst | typography | — |
| `--fs-14` | `14px` | lyst | typography | — |
| `--fs-15` | `15px` | lyst | typography | — |
| `--fs-17` | `17px` | lyst | typography | — |
| `--fs-21` | `21px` | lyst | typography | — |
| `--fs-26` | `26px` | lyst | typography | — |
| `--fs-28` | `28px` | lyst | typography | — |
| `--fs-40` | `40px` | lyst | typography | — |
| `--fs-56` | `56px` | lyst | typography | — |
| `--fs-72` | `72px` | lyst | typography | — |
| `--fw-regular` | `400` | lyst | typography | — |
| `--fw-medium` | `500` | lyst | typography | — |
| `--fw-semibold` | `600` | lyst | typography | — |
| `--lh-tight` | `1.05` | lyst | typography | — |
| `--lh-snug` | `1.25` | lyst | typography | — |
| `--lh-normal` | `1.45` | lyst | typography | — |
| `--tracking-kicker` | `.08em` | lyst | typography | — |
| `--tracking-display` | `-.015em` | lyst | typography | — |
| `--tracking-mono` | `.01em` | lyst | typography | — |
| `--type-display` | `600 var(--fs-40)/var(--lh-tight) var(--font-sans)` | lyst | typography | Roller |
| `--type-title-l` | `600 var(--fs-28)/1.15 var(--font-sans)` | lyst | typography | Roller |
| `--type-title-m` | `600 var(--fs-21)/var(--lh-snug) var(--font-sans)` | lyst | typography | Roller |
| `--type-title-s` | `600 var(--fs-17)/var(--lh-snug) var(--font-sans)` | lyst | typography | Roller |
| `--type-body` | `400 var(--fs-14)/1.5 var(--font-sans)` | lyst | typography | Roller |
| `--type-body-s` | `400 var(--fs-14)/var(--lh-normal) var(--font-sans)` | lyst | typography | Roller |
| `--type-label` | `500 var(--fs-13)/var(--lh-snug) var(--font-sans)` | lyst | typography | Roller |
| `--type-button` | `500 var(--fs-14)/1 var(--font-sans)` | lyst | typography | Roller |
| `--type-kicker` | `600 var(--fs-11)/var(--lh-snug) var(--font-sans)` | lyst | typography | Roller |
| `--type-meta` | `400 var(--fs-11)/var(--lh-snug) var(--font-mono)` | lyst | typography | Roller |
| `--type-num-s` | `500 var(--fs-13)/1.2 var(--font-mono)` | lyst | typography | Roller |
| `--type-num` | `500 var(--fs-15)/1.2 var(--font-mono)` | lyst | typography | Roller |
| `--type-metric` | `600 var(--fs-26)/1 var(--font-mono)` | lyst | typography | Roller |
| `--type-metric-l` | `600 var(--fs-40)/1 var(--font-mono)` | lyst | typography | Roller |
| `--type-clock` | `500 var(--fs-72)/1 var(--font-mono)` | lyst | typography | Roller |
| `--space-1` | `4px` | lyst | spacing | 4/8-rutenett |
| `--space-2` | `8px` | lyst | spacing | 4/8-rutenett |
| `--space-3` | `12px` | lyst | spacing | 4/8-rutenett |
| `--space-4` | `16px` | lyst | spacing | 4/8-rutenett |
| `--space-5` | `20px` | lyst | spacing | 4/8-rutenett |
| `--space-6` | `24px` | lyst | spacing | 4/8-rutenett |
| `--space-8` | `32px` | lyst | spacing | 4/8-rutenett |
| `--space-10` | `40px` | lyst | spacing | 4/8-rutenett |
| `--space-12` | `48px` | lyst | spacing | 4/8-rutenett |
| `--space-16` | `64px` | lyst | spacing | 4/8-rutenett |
| `--space-20` | `80px` | lyst | spacing | 4/8-rutenett |
| `--radius` | `8px` | lyst | spacing | Radius: 8 kort/knapp/felt · 12 modal · 999 badge/status · 0 datamerker |
| `--radius-modal` | `12px` | lyst | spacing | Radius: 8 kort/knapp/felt · 12 modal · 999 badge/status · 0 datamerker |
| `--radius-pill` | `999px` | lyst | spacing | Radius: 8 kort/knapp/felt · 12 modal · 999 badge/status · 0 datamerker |
| `--radius-mark` | `0` | lyst | spacing | Radius: 8 kort/knapp/felt · 12 modal · 999 badge/status · 0 datamerker |
| `--radius-inner` | `4px` | lyst | spacing | Indre flate i tett nesting (ytre 8 − 4) |
| `--shadow-card` | `none` | lyst | spacing | Kort = hairline, ingen skygge |
| `--shadow-raised` | `0 1px 2px rgba(20,20,19,.08)` | lyst | spacing | Skygger |
| `--shadow-pop` | `0 8px 24px rgba(20,20,19,.12),0 1px 2px rgba(20,20,19,.08)` | lyst | spacing | Skygger |
| `--shadow-modal` | `0 24px 64px rgba(20,20,19,.24)` | lyst | spacing | Skygger |
| `--border-w` | `1px` | lyst | spacing | Skygger |
| `--shadow-card` | `none` | natt | spacing | Skygger |
| `--shadow-raised` | `none` | natt | spacing | Skygger |
| `--shadow-pop` | `0 8px 24px rgba(0,0,0,.5)` | natt | spacing | Skygger |
| `--topbar-h` | `56px` | lyst | layout | — |
| `--tabbar-h` | `64px` | lyst | layout | — |
| `--sidenav-w` | `236px` | lyst | layout | — |
| `--inspector-w` | `340px` | lyst | layout | — |
| `--content-max` | `1200px` | lyst | layout | — |
| `--hit-min` | `44px` | lyst | layout | — |
| `--hit-outdoor` | `56px` | lyst | layout | — |
| `--control-h-sm` | `32px` | lyst | layout | — |
| `--control-h` | `40px` | lyst | layout | — |
| `--control-h-lg` | `48px` | lyst | layout | — |
| `--control-h-xl` | `56px` | lyst | layout | — |
| `--dur-press` | `150ms` | lyst | motion | Trykk (better-ui 27.09) |
| `--dur-swap` | `300ms` | lyst | motion | Kontekstuelt ikonbytte |
| `--dur-fast` | `150ms` | lyst | motion | — |
| `--dur-base` | `200ms` | lyst | motion | — |
| `--dur-sheet` | `250ms` | lyst | motion | — |
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | lyst | motion | — |
| `--ease-in-out` | `cubic-bezier(.77,0,.175,1)` | lyst | motion | — |
| `--ease-drawer` | `cubic-bezier(.32,.72,0,1)` | lyst | motion | — |
| `--ease-color` | `ease` | lyst | motion | — |
| `--ease-swap` | `cubic-bezier(.2,0,0,1)` | lyst | motion | Ikonbytte |
| `--press-scale` | `.96` | lyst | motion | Knapp, pille, ikonknapp |
| `--press-scale-card` | `.99` | lyst | motion | Klikkbart kort |
| `--press-scale` / `--press-scale-card` | `1` | natt | motion | Live og utendørs: statisk |
| `--press-scale` / `--press-scale-card` | `1` | redusert bevegelse | motion | Statisk |
| `--dur-sheet` / `--dur-base` | `120ms` | redusert bevegelse | motion | Kortere, ingen transform |
| `--dur-swap` | `0ms` | redusert bevegelse | motion | — |

## 3. Komponenter

Kilde: `../components/<gruppe>/<Navn>.jsx` + `.d.ts` + `.prompt.md`. Bygg som shadcn/ui-komponenter med samme props og klasser mappet til tokens.

| Komponent | Varianter | Tilstander | Brukes av |
|---|---|---|---|
| Button | primary · secondary · ghost · signal (rust) · sm/md/lg/xl | hover, fokus, disabled, loading (mono-tekst) | 70: AG-01, AG-02, AG-03, AG-04, AG-05, AG-06, AG-07, AG-08, AG-09, AG-10, AG-12, AG-13, AG-14, AG-15, AG-16, AG-17, AG-18, AG-19, AG-20, AG-21, AG-22, AG-23, AG-24, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, GJ-01, GJ-02, PH-01, PH-02, PH-03, PH-04, PH-05, PH-06, PH-07, PH-08, PH-09, PH-10, PH-11, PH-12, PH-13, PH-14, PH-15, PH-16, PH-17, PH-18, PH-19, PH-20, PH-21, PH-22, PH-23, PH-24, PH-25, PH-26, ST-04, ST-05, ST-06, SY-01 |
| IconButton | secondary · ghost | hover, fokus, disabled | 8: PH-01, PH-04, PH-05, PH-06, PH-07, PH-10, PH-11, PH-22 |
| Icon | Lucide-navn, størrelse | — | 24: AG-01, AG-02, AG-03, AG-04, AG-15, AG-16, AG-18, AG-19, AG-20, GJ-01, GJ-02, PH-01, PH-11, PH-13, PH-16, PH-17, PH-20, PH-22, PH-24, PH-25, ST-01, ST-02, ST-03, SY-01 |
| Avatar | størrelse | — | 10: AG-04, AG-08, AG-23, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-24 |
| AxisBadge | fys · tek · slag · spill · turn | — | 16: AG-01, AG-02, AG-05, AG-12, AG-13, AG-14, PH-01, PH-02, PH-03, PH-04, PH-05, PH-10, PH-12, PH-13, PH-14, PH-19 |
| Badge | neutral · signal · inverse | skjult ved 0 uten showZero | 2: AG-01, AG-03 |
| Card | flat · interactive | hover, valgt (2 px grafitt innfelt) | 1: PH-18 |
| Sparkline | høyde, etikett | tom verdi = brudd | 11: AG-08, AG-09, FO-01, FO-02, FO-03, PH-14, PH-16, PH-18, ST-01, ST-02, ST-03 |
| DataTable | sorterbar, valgbar rad | tabell ≥ 760 px, kortrader under · «—» i tom celle · valgt rad | 32: AG-06, AG-07, AG-09, AG-10, AG-15, AG-16, AG-17, AG-18, AG-20, AG-22, AG-23, AG-24, AU-04, AU-05, AU-06, FO-04, FO-05, FO-06, PH-07, PH-14, PH-16, PH-17, PH-18, PH-20, PH-25, PH-26, ST-01, ST-02, ST-03, ST-04, ST-05, ST-06 |
| KeyValue | 1 eller 2 kolonner, mono/ikke-mono, hint | null = «—» | 40: AG-02, AG-05, AG-06, AG-08, AG-12, AG-13, AG-16, AG-17, AG-18, AG-19, AG-23, AG-24, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, GJ-01, GJ-02, PH-03, PH-10, PH-12, PH-13, PH-17, PH-18, PH-20, PH-23, PH-24, PH-25, PH-26, ST-04, ST-05, ST-06 |
| Metric | s · m · l, enhet | null = «—» | 4: AG-18, PH-06, PH-07, PH-17 |
| StatusPill | neutral · ok · warn · info · signal · live · solid | — | 58: AG-01, AG-02, AG-04, AG-05, AG-06, AG-07, AG-08, AG-10, AG-12, AG-13, AG-15, AG-17, AG-19, AG-20, AG-21, AG-22, AG-23, AG-24, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-01, PH-02, PH-03, PH-05, PH-06, PH-07, PH-08, PH-09, PH-10, PH-11, PH-12, PH-13, PH-15, PH-17, PH-19, PH-20, PH-21, PH-22, PH-23, PH-24, PH-25, PH-26, ST-01, ST-02, ST-03, ST-04, ST-05, ST-06 |
| Timeline | dense, akseprikk, hul prikk | — | 6: AG-08, FO-04, FO-05, FO-06, PH-01, PH-16 |
| Dialog | tittel, footer | åpen/lukket, fokusfelle, Esc | 13: AG-02, AG-04, AG-06, AG-24, FO-04, FO-05, FO-06, PH-05, PH-06, PH-08, PH-15, PH-23, PH-25 |
| InlineAlert | neutral · info · ok · warn · signal | — | 28: AG-07, AG-08, AG-09, AG-11, AG-14, AG-15, AG-17, AG-20, AG-22, AG-23, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-09, PH-12, PH-25 |
| Sheet | auto · bottom · right · docked | åpen/lukket; nedenfra ≤ 1024, inspektør 340 px over | 15: AG-02, AG-05, AG-06, AG-07, AG-08, AG-10, AG-14, AG-15, AG-21, PH-03, PH-10, PH-13, PH-14, PH-18, PH-23 |
| LoadingState | tekst | Laster-tilstand | 15: AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, GJ-01, GJ-02, ST-01, ST-02, ST-03, SY-01 |
| EmptyState | ikon, tittel, tekst, handling | Tom-tilstand | 63: AG-01, AG-02, AG-03, AG-04, AG-05, AG-06, AG-07, AG-09, AG-10, AG-12, AG-13, AG-14, AG-15, AG-16, AG-17, AG-18, AG-19, AG-20, AG-21, AG-22, AG-24, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, GJ-01, GJ-02, PH-01, PH-02, PH-03, PH-04, PH-05, PH-06, PH-07, PH-08, PH-10, PH-11, PH-13, PH-14, PH-15, PH-16, PH-17, PH-18, PH-19, PH-20, PH-21, PH-22, PH-24, PH-26, ST-01, ST-02, ST-03, ST-04, ST-05, ST-06 |
| ErrorState | tittel, tekst, kode, Prøv igjen | Feil-tilstand | 14: AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, GJ-01, GJ-02, ST-01, ST-02, ST-03 |
| Toast | melding + meta | auto-lukk | skall |
| Checkbox | etikett | hake, fokus, disabled | 14: AG-12, AG-21, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, PH-02, PH-03, PH-26 |
| ChoicePill | mono, valgt | valgt, disabled | 20: AG-14, AG-22, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, PH-03, PH-09, PH-10, PH-17, PH-21, PH-23, ST-04, ST-05, ST-06 |
| FormField | label, hint, feil, påkrevd/valgfritt | feil som hel setning med ikon | 40: AG-04, AG-05, AG-06, AG-07, AG-08, AG-10, AG-11, AG-12, AG-13, AG-14, AG-17, AG-21, AG-23, AG-24, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-07, PH-09, PH-10, PH-12, PH-14, PH-21, PH-25, PH-26, ST-04, ST-05, ST-06 |
| TextInput | mono | fokus, feil, disabled | 35: AG-04, AG-05, AG-06, AG-07, AG-08, AG-10, AG-12, AG-14, AG-17, AG-21, AG-23, AG-24, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-04, FO-05, FO-06, PH-07, PH-10, PH-12, PH-14, PH-21, PH-22, PH-25, PH-26, ST-04, ST-05, ST-06 |
| SearchField | antall treff | tom, med treff, 0 treff | 7: AG-07, PH-09, PH-13, PH-14, ST-01, ST-02, ST-03 |
| Segmented | 2–4 valg, fullWidth | valgt | 28: AG-11, AG-13, AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, BK-01, BK-02, BK-03, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-08, PH-09, PH-10, PH-11, PH-12, PH-13, PH-14, PH-23, PH-25, PH-26, SY-01 |
| SegmentedFilter | enkel/multi, antall | bryter linje | 11: AG-03, AG-05, AG-07, AU-04, AU-05, AU-06, PH-13, PH-16, ST-01, ST-02, ST-03 |
| Select | label, hint | fokus, disabled | 21: AG-05, AG-06, AG-07, AG-08, AG-09, AG-10, AG-11, AG-14, AG-15, AG-17, AG-21, AG-23, AU-04, AU-05, AU-06, PH-11, PH-18, PH-21, ST-01, ST-02, ST-03 |
| Switch | etikett | på/av | 10: AG-05, AG-06, AG-19, AG-23, FO-04, FO-05, FO-06, PH-07, PH-18, PH-25 |
| Breadcrumb | — | — | 2: PH-03, PH-12 |
| MenuBar | brand, meny | åpen/lukket | skall |
| NavDrawer | grupper | åpen/lukket | skall |
| NavRail | grupper, aktiv, teller | aktiv, signalprikk | skall |
| PageHeader | kicker, tittel, sub, meta, actions | handlinger bryter linje | 51: AG-01, AG-02, AG-03, AG-04, AG-05, AG-06, AG-07, AG-08, AG-09, AG-10, AG-12, AG-13, AG-14, AG-15, AG-16, AG-17, AG-18, AG-19, AG-20, AG-21, AG-22, AG-23, AG-24, AU-04, AU-05, AU-06, FO-01, FO-02, FO-03, FO-04, FO-05, FO-06, PH-01, PH-02, PH-03, PH-09, PH-10, PH-11, PH-12, PH-13, PH-14, PH-16, PH-17, PH-18, PH-19, PH-20, PH-21, PH-22, PH-23, PH-25, PH-26 |
| TabBar | PlayerHQ fire faner | aktiv | skall |
| Tabs | antall per fane | bryter linje | 21: AG-02, AG-04, AG-05, AG-06, AG-09, AG-14, AG-15, AG-16, AG-17, AG-18, AG-19, AG-21, AG-22, AG-23, AG-24, ST-01, ST-02, ST-03, ST-04, ST-05, ST-06 |

**Felles skall og hjelpere (ikke i komponentbiblioteket, men må bygges):**
- PlayerHQ-skall (`ui_kits/playerhq/parts.jsx`): TabBar under 1024, NavRail 1024+, nattflate `Focus` uten navigasjon.
- Portal-skall (`ui_kits/agencyos/ag-parts.jsx`): NavRail 1024+, MenuBar + NavDrawer under; `bare`-flater uten meny (konto, booking, statistikk, GFGK, system); `EvCard` (nøytralt kort med aksestripe), `Draft`-merke («Utkast»), `price(ServiceType, timepris)`.
- Hurtigknapp (`ui_kits/_shared/Hurtigknapp.jsx`, flyttet 28.09): 56 × 56 grafitt, radius 2, dras, klemmes 8 px fra kant (+ fanelinjen i PlayerHQ), < 5 px = trykk, meny snur ved kant, husker posisjon per app. Handlinger fra `ui_kits/_shared/ia.js`: AgencyOS fem, PlayerHQ fire. Samme fil har `Bjelle` (rødt tall, åpner innboksen). Ikke på nattflater.
- Informasjonsarkitektur 28.09 (`ui_kits/_shared/ia.js`): PlayerHQ I dag · Plan · Stats · Meg; AgencyOS Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Plassering per skjerm og «Utgår 28.09» i `oversikt.html`.
- Planmotor (`ui_kits/agencyos/PlanParts.jsx`, `planmotor-data.js`): YearCurve (stablede aksesøyler per uke, periodebånd), aksestripe, felles for PH-11 og AG-11.

## 4. Skjermtyper (74)

Hver skjerm har Data · Tom · Laster · Feil. Katalog-lenken åpner skjermen med verktøylinje for bredde og tilstand.

### PlayerHQ (/portal)

**Bredder:** 390: TabBar nederst (I dag · Plan · Analyse · Meg), én kolonne. 768: TabBar, to kolonner der det gir mening. 1024/1280: NavRail 56 px til venstre, to eller tre kolonner. Nattflater: ingen fanelinje, én kolonne, én fullbredde primærhandling nederst, treffmål 56 px.

#### PH-01 · I dag
- **Ruter:** `/portal`
- **Må vise:** Dagens økt, agenda, Caddie-forslag, Start økt
- **Komponenter:** Button, Icon, IconButton, AxisBadge, BarRow, Chart, StatusPill, Timeline, EmptyState, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** dagens økter med tid, akse(r), status · neste booking · Caddie-forslag (utkast) · agenda i dag · inngang «Registrer runde»
- **Tegning:** [ui_kits/playerhq/index.html#PH-01](../ui_kits/playerhq/index.html#PH-01) · kilde `ui_kits/playerhq/screens/PH-01.jsx`

#### PH-02 · Gjør nå
- **Ruter:** `/portal/gjennomfore`, `/portal/tren/wb`
- **Må vise:** Dagens økter og oppgaver, åpne økt
- **Komponenter:** Button, AxisBadge, StatusPill, EmptyState, Checkbox, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** dagens økter og oppgaver med status · åpne økt
- **Tegning:** [ui_kits/playerhq/index.html#PH-02](../ui_kits/playerhq/index.html#PH-02) · kilde `ui_kits/playerhq/screens/PH-02.jsx`

#### PH-03 · Øktark
- **Ruter:** `/portal/gjennomfore/[id]`, `/portal/tren/wb/[sessionId]`
- **Må vise:** Start, fullfør eller hopp over, øvelser med AK-formel
- **Komponenter:** Button, AxisBadge, KeyValue, StatusPill, Sheet, EmptyState, Checkbox, ChoicePill, Breadcrumb, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** økt med øvelser (AK-formel: område, motorikk, belastning, press, teknisk fokus, mengde, restmål) · status start/fullført/hoppet over
- **Tegning:** [ui_kits/playerhq/index.html#PH-03](../ui_kits/playerhq/index.html#PH-03) · kilde `ui_kits/playerhq/screens/PH-03.jsx`

#### PH-04 · Live-økt: brief
- **Ruter:** `/portal/live/[id]/brief`
- **Må vise:** Mål, fokus, øvelser før start
- **Komponenter:** Button, IconButton, AxisBadge, EmptyState
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** øktens mål, fokus og øvelsesliste før start
- **Tegning:** [ui_kits/playerhq/index.html#PH-04](../ui_kits/playerhq/index.html#PH-04) · kilde `ui_kits/playerhq/screens/PH-04.jsx`

#### PH-05 · Live-økt: aktiv
- **Ruter:** `/portal/live/[id]/active`
- **Må vise:** Klokke, øvelsesfremdrift, registrer repetisjoner
- **Komponenter:** Button, IconButton, AxisBadge, StatusPill, Dialog, EmptyState
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** klokke (start, pause) · øvelsesfremdrift · registrerte repetisjoner per øvelse
- **Tegning:** [ui_kits/playerhq/index.html#PH-05](../ui_kits/playerhq/index.html#PH-05) · kilde `ui_kits/playerhq/screens/PH-05.jsx`

#### PH-06 · Slagteller
- **Ruter:** `/portal/live/[id]/tapper`
- **Må vise:** +1/+5 slag, kølle fra bagen, store treffmål
- **Komponenter:** Button, IconButton, Metric, StatusPill, Dialog, EmptyState
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** slag per øvelse (+1/+5) · spillerens bag (køller) · lagres lokalt ved offline
- **Tegning:** [ui_kits/playerhq/index.html#PH-06](../ui_kits/playerhq/index.html#PH-06) · kilde `ui_kits/playerhq/screens/PH-06.jsx`

#### PH-07 · Øktoppsummering
- **Ruter:** `/portal/live/[id]/summary`, `/portal/tren/feiring/[planId]`
- **Må vise:** Slag, tid, pyramidefordeling, del/lagre
- **Komponenter:** Button, IconButton, BarRow, Chart, DataTable, Metric, StatusPill, EmptyState, FormField, TextInput, Switch
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** slag totalt, tid, fordeling per akse for økta · lagre/dele
- **Tegning:** [ui_kits/playerhq/index.html#PH-07](../ui_kits/playerhq/index.html#PH-07) · kilde `ui_kits/playerhq/screens/PH-07.jsx`

#### PH-08 · Runde live
- **Ruter:** `/portal/runde/live`, `/portal/mal/runder/[id]/slag`
- **Må vise:** Hull 1–18, lie, meter til flagg, putter i fot
- **Komponenter:** Button, StatusPill, Dialog, EmptyState, Segmented
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** hull 1–18 eller 1–9 med par per spilt hull · slag per hull · lie · meter til flagg · putter i fot · til par = brutto minus par for spilte hull
- **Tegning:** [ui_kits/playerhq/index.html#PH-08](../ui_kits/playerhq/index.html#PH-08) · kilde `ui_kits/playerhq/screens/PH-08.jsx`

#### PH-09 · Registrer runde
- **Ruter:** `/portal/runde/logg`, `/portal/mal/runder/ny`, `/portal/mal/runder/[id]/hull`
- **Må vise:** Dato, bane, score per hull, brutto
- **Komponenter:** Button, StatusPill, InlineAlert, ChoicePill, FormField, SearchField, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** dato, bane, tee, antall hull (9/18) · slag per hull · par per spilt hull · brutto total
- **Tegning:** [ui_kits/playerhq/index.html#PH-09](../ui_kits/playerhq/index.html#PH-09) · kilde `ui_kits/playerhq/screens/PH-09.jsx`

#### PH-10 · Plan: uke
- **Ruter:** `/portal/planlegge`, `/portal/kalender`, `/portal/kalender/opptatt`
- **Må vise:** Uke/dag/måned, økter per akse, opptatt tid
- **Komponenter:** Button, IconButton, AxisBadge, BarRow, Chart, KeyValue, StatusPill, Sheet, EmptyState, ChoicePill, FormField, TextInput, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** økter per dag med tid, varighet, akse(r) · opptatt tid · konflikt når økt overlapper opptatt tid
- **Tegning:** [ui_kits/playerhq/index.html#PH-10](../ui_kits/playerhq/index.html#PH-10) · kilde `ui_kits/playerhq/screens/PH-10.jsx`

#### PH-11 · Workbench (spiller)
- **Ruter:** `/portal/planlegge/workbench`
- **Må vise:** År → periode → uke → økt på én flate, dra-og-slipp
- **Komponenter:** Button, Icon, IconButton, StatusPill, EmptyState, Segmented, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** årsplan med perioder (uke fra–til, budsjett timer) · planlagte og gjennomførte timer per uke og akse · økter med øvelser per uke · kopier forrige uke
- **Tegning:** [ui_kits/playerhq/index.html#PH-11](../ui_kits/playerhq/index.html#PH-11) · kilde `ui_kits/playerhq/screens/PH-11.jsx`

#### PH-12 · Planbygger
- **Ruter:** `/portal/planlegge/bygger`, `/portal/ai/mal-bygger`
- **Må vise:** Stegviser, mal, SMART-mål
- **Komponenter:** Button, AxisBadge, KeyValue, StatusPill, InlineAlert, FormField, TextInput, Segmented, Stepper, Breadcrumb, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** perioder, maler, turneringskalender · SMART-mål (tekst, måltall, frist, kilde)
- **Tegning:** [ui_kits/playerhq/index.html#PH-12](../ui_kits/playerhq/index.html#PH-12) · kilde `ui_kits/playerhq/screens/PH-12.jsx`

#### PH-13 · Øvelsesbank
- **Ruter:** `/portal/drills`, `/portal/drills/[id]`, `/portal/coach/ovelser`, `/portal/ai/foresla-drill`
- **Må vise:** Liste med filter per akse, øvelsesdetalj, Caddie-forslag
- **Komponenter:** Button, Icon, AxisBadge, KeyValue, StatusPill, Sheet, EmptyState, SearchField, Segmented, SegmentedFilter, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** øvelsesbank filtrert per akse · øvelse med AK-formel-felter · Caddie-forslag som utkast
- **Tegning:** [ui_kits/playerhq/index.html#PH-13](../ui_kits/playerhq/index.html#PH-13) · kilde `ui_kits/playerhq/screens/PH-13.jsx`

#### PH-14 · Tester
- **Ruter:** `/portal/tren/tester`, `/portal/tren/tester/[testId]`, `…/ny`, `…/ny/egen`, `…/team-norway`
- **Må vise:** Protokoller, historikk, registrer resultat
- **Komponenter:** Button, AxisBadge, Sparkline, DataTable, Sheet, EmptyState, FormField, TextInput, SearchField, Segmented, Stepper, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** testprotokoller gruppert · historikk per test · registrer resultat · egen test · test teller bare med alle slag
- **Tegning:** [ui_kits/playerhq/index.html#PH-14](../ui_kits/playerhq/index.html#PH-14) · kilde `ui_kits/playerhq/screens/PH-14.jsx`

#### PH-15 · Test: gjennomfør
- **Ruter:** `/portal/tren/tester/[testId]/gjennomfor`
- **Må vise:** Scorekort, live-registrering
- **Komponenter:** Button, StatusPill, Dialog, EmptyState
- **Tilstander:** Data · Tom · Laster · Feil · natt og lyst
- **Bredder:** 390 · 768 · 1024 · 1280 · nattflate uten fanelinje, primærhandling fullbredde nederst
- **Trenger:** testprotokoll (antall slag, mål) · slag for slag · vitne/attest · teller bare med alle slag
- **Tegning:** [ui_kits/playerhq/index.html#PH-15](../ui_kits/playerhq/index.html#PH-15) · kilde `ui_kits/playerhq/screens/PH-15.jsx`

#### PH-16 · Analyse-hub
- **Ruter:** `/portal/analysere`, `/portal/analysere/historikk`
- **Må vise:** SG per kategori, siste runder/økter, filter
- **Komponenter:** Button, Icon, Sparkline, DataTable, Timeline, EmptyState, SegmentedFilter, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** SG per kategori OTT/APP/ARG/PUTT med baseline og dato · siste runder (brutto, til par) og økter · historikk med kilde · etterlevelse (gjennomført mot planlagt tid siste fire uker)
- **Tegning:** [ui_kits/playerhq/index.html#PH-16](../ui_kits/playerhq/index.html#PH-16) · kilde `ui_kits/playerhq/screens/PH-16.jsx`

#### PH-17 · TrackMan
- **Ruter:** `/portal/analysere/trackman`, `…/[id]`, `/portal/mal/trackman/gapping`, `/portal/mal/sg-hub/equipment`, `/portal/analysere/datagolf/stasjon`
- **Må vise:** Øktliste, spredningskart, gapping, utstyrshelse
- **Komponenter:** Button, Icon, DataTable, KeyValue, Metric, StatusPill, EmptyState, ChoicePill, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** TrackMan-økter per dato/bay · slag per kølle med parametere (engelsk) · gapping · utstyrsstatus · proff-referanse (Data Golf)
- **Tegning:** [ui_kits/playerhq/index.html#PH-17](../ui_kits/playerhq/index.html#PH-17) · kilde `ui_kits/playerhq/screens/PH-17.jsx`

#### PH-18 · Runder og statistikk
- **Ruter:** `/portal/mal/runder`, `…/[id]`, `/portal/statistikk/[metric]`, `/portal/statistikk/runder/[runId]/del`, `/portal/analysere/hull`, `/portal/analysere/turneringer`, `/portal/analysere/datagolf`
- **Må vise:** Scorekort, metrikk over tid, hull-analyse, til-par-kurve, etter-runden-gjennomgang (SG, putting, noter, kilde)
- **Komponenter:** Button, Card, Sparkline, DataTable, KeyValue, Sheet, EmptyState, Select, Switch, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** runder med scorekort per hull (brutto), par per hull · metrikker over tid (FIR, GIR, putter, scrambling) · snitt per hull · sesonger · del-lenke · per runde: `review { status: 'delvis'|'fullført', sg: {ott,app,arg,putt} (null = —), putts, threePutts, notes, source: 'manuell'|'annen_app', sourceDate, pastedRaw? }` · **Lanseringskrav (Port 7, 27.09.2026):** komplett etter-runden-gjennomgang per runde — brutto score, hull for hull (PH-09), slag/lie/avstand der spilleren har dem, SG OTT/APP/ARG/PUTT med fortegn og komma, putter og 3-putter, noter, og manuell innlegging/import fra annen app (lim inn eller skriv tall; ingen API-integrasjon nå). Kilde lagres og vises som «Manuell» eller «Annen app» med dato. Status Delvis lagret / Fullført — spilleren kan lagre delvis og fullføre senere. Aldri netto; manglende verdi «—», aldri 0
- **Tegning:** [ui_kits/playerhq/index.html#PH-18](../ui_kits/playerhq/index.html#PH-18) · kilde `ui_kits/playerhq/screens/PH-18.jsx`

#### PH-19 · Mål og talent
- **Ruter:** `/portal/mal`, `/portal/mal/goal/[id]`, `/portal/mal/leaderboard`, `/portal/talent/*`, `/portal/utviklingsplan`, `/portal/tren/teknisk-plan/[planId]`
- **Må vise:** Mål med fremdrift, talentradar, P1–P10-plan
- **Komponenter:** Button, AxisBadge, StatusPill, EmptyState, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** mål med start, nå, mål, frist, kilde · talentradar fem akser (estimat) mot kategori · P1.0–P10.0-status · utviklingsplan · kategori-veikart
- **Tegning:** [ui_kits/playerhq/index.html#PH-19](../ui_kits/playerhq/index.html#PH-19) · kilde `ui_kits/playerhq/screens/PH-19.jsx`

#### PH-20 · Gameplan og banekart
- **Ruter:** `/portal/gameplan`, `…/[baneId]`, `…/hull/[nr]`
- **Må vise:** Banekart (eksempeldata ved lansering), hull-for-hull, slagvalg
- **Komponenter:** Button, Icon, DataTable, KeyValue, StatusPill, EmptyState, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** banebibliotek (bane, tee, par, lengde) · spillerens spredning per kølle (TrackMan) · **Port 7 (27.09.2026): lanseringsklar som mønster med eksempeldata.** Hullgeometri (bunker, vann, green) er eksempeldata og merkes «Eksempeldata — ikke ekte baneguide». Komplett baneguide, ekte hullkart, kartgrunnlag og full banedatabase kommer **etter lansering** og blokkerer ikke
- **Tegning:** [ui_kits/playerhq/index.html#PH-20](../ui_kits/playerhq/index.html#PH-20) · kilde `ui_kits/playerhq/screens/PH-20.jsx`

#### PH-21 · Coach-kontakt
- **Ruter:** `/portal/coach`, `…/melding`, `…/melding/ny`, `…/sporsmal*`, `…/tilbakemelding*`, `…/videoer`, `…/plans`, `…/sg-hub*`, `/portal/onskeligokt*`
- **Må vise:** Meldingstråd, spørsmål, tilbakemelding, videoer, ønsket økt
- **Komponenter:** Button, StatusPill, EmptyState, ChoicePill, FormField, TextInput, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** meldingstråd med coach · tilbakemelding per økt · videoer fra coach · planer sendt av coach · ønsket økt
- **Tegning:** [ui_kits/playerhq/index.html#PH-21](../ui_kits/playerhq/index.html#PH-21) · kilde `ui_kits/playerhq/screens/PH-21.jsx`

#### PH-22 · Caddie-chat
- **Ruter:** `/portal/coach/ai`, `/portal/ai/foresla-turnering`
- **Må vise:** Chat, forslag som utkast, kilder
- **Komponenter:** Button, Icon, IconButton, StatusPill, EmptyState, TextInput, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** Caddie-samtale · hvert svar med kilde og dato · forslag som utkast som spiller/coach må godta
- **Tegning:** [ui_kits/playerhq/index.html#PH-22](../ui_kits/playerhq/index.html#PH-22) · kilde `ui_kits/playerhq/screens/PH-22.jsx`

#### PH-23 · Booking (spiller)
- **Ruter:** `/portal/booking`, `…/ny`, `…/ny/bekreft`, `…/bekreftet`, `…/[bookingId]`, `…/coach/[coachId]`, `…/anlegg/[anleggId]`, `/portal/meg/bookinger*`
- **Må vise:** Klippekort, tjeneste, tid, bekreft, flytt time
- **Komponenter:** Button, KeyValue, StatusPill, Dialog, Sheet, ChoicePill, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** tjenester (ServiceType: navn, varighet, fast pris eller timepris) · ledige tider · klipp fra coaching-pakke (Performance 2/mnd, Performance Pro 4/mnd) · mine timer, flytt og avbestill · bekreftes med en gang, ingen ventestatus · gratis avbestilling til 24 timer før (fasit `src/lib/booking/policy.ts`)
- **Tegning:** [ui_kits/playerhq/index.html#PH-23](../ui_kits/playerhq/index.html#PH-23) · kilde `ui_kits/playerhq/screens/PH-23.jsx`

#### PH-24 · Meg
- **Ruter:** `/portal/meg`, `…/profil`, `…/utstyr`, `…/resultater`, `…/helse*`, `…/foreldre`, `…/dokumenter`, `/portal/spiller/[id]`, `/portal/venner*`
- **Må vise:** Profil, kategori A–K, bag med 14 køller, helse
- **Komponenter:** Button, Icon, Avatar, KeyValue, StatusPill, EmptyState
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** profil, kategori A–K, bag med 14 køller, helse (bare spilleren selv), foreldre, dokumenter, venner · inngang Utfordringer
- **Tegning:** [ui_kits/playerhq/index.html#PH-24](../ui_kits/playerhq/index.html#PH-24) · kilde `ui_kits/playerhq/screens/PH-24.jsx`

#### PH-25 · Abonnement og innstillinger
- **Ruter:** `/portal/meg/abonnement*`, `/portal/meg/innstillinger/*`, `/portal/meg/sikkerhet/2fa`, `/portal/varsler`, `/portal/meg/help*`, `/portal/meg/feedback`
- **Må vise:** TALENT/FULL, faktura, kort, avbestill, samtykke, varsler, hjelp
- **Komponenter:** Button, Icon, DataTable, KeyValue, StatusPill, Dialog, InlineAlert, FormField, TextInput, Segmented, Switch, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** app-nivå TALENT/FULL (299 kr/mnd, 2 690 kr/år) · fakturaer · betalingskort · avslutningsdato · samtykker · varsler · 2FA
- **Tegning:** [ui_kits/playerhq/index.html#PH-25](../ui_kits/playerhq/index.html#PH-25) · kilde `ui_kits/playerhq/screens/PH-25.jsx`

#### PH-26 · Utenfor banen
- **Ruter:** `/portal/utenfor-banen`, `/portal/fysisk`, `/portal/tren/fys-plan`, `/portal/utfordringer*`, `/portal/trening/*`, `/portal/ukesdigest`, `/portal/tren/turneringer*`
- **Må vise:** FYS-økt, utfordringer, putte-lab, break-tabell, turneringsplan, ukesdigest
- **Komponenter:** Button, BarRow, Chart, DataTable, KeyValue, StatusPill, EmptyState, Checkbox, FormField, TextInput, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** FYS-økt · utfordringer (deltakere fra venner/grupper, høyest/lavest vinner, status Avsluttet) · putte-lab · break-tabell · turneringsplan · ukesdigest · utfordringer teller ikke som trening
- **Tegning:** [ui_kits/playerhq/index.html#PH-26](../ui_kits/playerhq/index.html#PH-26) · kilde `ui_kits/playerhq/screens/PH-26.jsx`

### AgencyOS (/admin)

**Bredder:** 390/768: MenuBar + NavDrawer, én kolonne, detaljer i Sheet nedenfra. 1024: NavRail 56 px, liste + detalj side ved side. 1280/1440: NavRail, opptil tre kolonner. Hurtigknapp 56 × 56 fra skallet på alle skjermer.

#### AG-01 · Hjem (cockpit)
- **Ruter:** `/admin/agencyos`, `/meg`
- **Må vise:** Én ting nå, dagens plan, kø-tellere, AI-dispatch
- **Komponenter:** Button, Icon, AxisBadge, Badge, StatusPill, EmptyState, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** «Én ting nå» (høyest prioriterte sak) · dagens plan · antall i hver kø · Jarvis-forslag med fakta, kilde og hva som går ut
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-01](../ui_kits/agencyos/katalog.html#AG-01) · kilde `ui_kits/agencyos/screens/AG-01.jsx`

#### AG-02 · Kø
- **Ruter:** `/admin/ko`
- **Må vise:** Faner: godkjenninger, agentforslag, tester, dubletter, moderering
- **Komponenter:** Button, Icon, AxisBadge, KeyValue, StatusPill, Dialog, Sheet, EmptyState, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** godkjenninger (plan, endring, fravær, samtykke) · agentforslag · tester til attestering · mulige dubletter med felt fra begge · meldte innlegg
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-02](../ui_kits/agencyos/katalog.html#AG-02) · kilde `ui_kits/agencyos/screens/AG-02.jsx`

#### AG-03 · Oppfølgingskø
- **Ruter:** `/admin/queue`
- **Må vise:** Risiko · Følg med · Sjekk inn · Løst
- **Komponenter:** Button, Icon, Badge, EmptyState, SegmentedFilter, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** oppfølgingssaker med kolonne (Risiko/Følg med/Sjekk inn/Løst), årsak, kilde, hvem satte status og når · forrige kolonne for «Åpne igjen»
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-03](../ui_kits/agencyos/katalog.html#AG-03) · kilde `ui_kits/agencyos/screens/AG-03.jsx`

#### AG-04 · Innboks
- **Ruter:** `/admin/kommunikasjon`, `/admin/email-templates/[id]/rediger`
- **Må vise:** Saker, e-postutkast, maler
- **Komponenter:** Button, Icon, Avatar, StatusPill, Dialog, EmptyState, FormField, TextInput, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** saker/tråder med spiller og forelder · e-postutkast (til, emne, tekst, mal) · e-postmaler med felter · Send bare ved coachens trykk
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-04](../ui_kits/agencyos/katalog.html#AG-04) · kilde `ui_kits/agencyos/screens/AG-04.jsx`

#### AG-05 · Kalender
- **Ruter:** `/admin/kalender`, `/admin/kalender/hendelse/[id]`, `…/ny`, `/admin/availability`
- **Må vise:** Uke/måned/dag, lag, stall-dag, tilgjengelighet
- **Komponenter:** Button, AxisBadge, KeyValue, StatusPill, Sheet, EmptyState, FormField, TextInput, SegmentedFilter, Select, Switch, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** hendelser per dag (lag, privat, opptatt, ledig) med tid, sted, akse(r) · lag · stall-dag per spiller · tilgjengelighet per ukedag og unntak
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-05](../ui_kits/agencyos/katalog.html#AG-05) · kilde `ui_kits/agencyos/screens/AG-05.jsx`

#### AG-06 · Booking (coach)
- **Ruter:** `/admin/bookinger/[id]`, `/admin/bookinger/ny`, `/admin/services`
- **Må vise:** Bookingdetalj, bekreft/avvis booking, ny booking, tjenester og pris
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, Dialog, Sheet, EmptyState, FormField, TextInput, Select, Switch, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** betalte bookinger (offentlig og PlayerHQ) bekreftes automatisk; bekreft/avvis bare for bookinger uten betaling; alle kan avlyses · kilde per booking · bookinger med status (Venter/Bekreftet/Avvist), spiller, forelder, tjeneste, tid, betaling, hvem bekreftet/avviste og begrunnelse · ServiceType-liste · timepris (Avklares: 950 kr er demodata)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-06](../ui_kits/agencyos/katalog.html#AG-06) · kilde `ui_kits/agencyos/screens/AG-06.jsx`

#### AG-07 · Stall
- **Ruter:** `/admin/spillere`, `/admin/spillere/ny`
- **Må vise:** Spillere gruppert etter status, tabell → kortrader
- **Komponenter:** Button, DataTable, StatusPill, InlineAlert, Sheet, EmptyState, FormField, TextInput, SearchField, SegmentedFilter, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** spillere med status, gruppe, kategori, HCP, siste økt, etterlevelse · fødselsår og forelder-e-post ved ny spiller
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-07](../ui_kits/agencyos/katalog.html#AG-07) · kilde `ui_kits/agencyos/screens/AG-07.jsx`

#### AG-08 · Spiller 360
- **Ruter:** `/admin/spillere/[id]`, `…/rediger`, `…/turnering-kobling`
- **Må vise:** Profil, nøkkeltall, fremgang, endringshistorikk
- **Komponenter:** Button, Avatar, Sparkline, KeyValue, StatusPill, Timeline, InlineAlert, Sheet, FormField, TextInput, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** profil, nøkkeltall med kilde, fremgang snitt brutto per måned · endringslogg (hvem, hva, når) · turneringsprofil-kobling (GolfBox-ID) · én spillerprofil: kortet i AG-03 Oppfølgingskø lenker hit
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-08](../ui_kits/agencyos/katalog.html#AG-08) · kilde `ui_kits/agencyos/screens/AG-08.jsx`

#### AG-09 · Spilleranalyse
- **Ruter:** `/admin/spillere/[id]/analyse`, `/admin/analyse`, `/admin/runder`
- **Må vise:** SG, trend, etterlevelse, stall-analyse
- **Komponenter:** Button, Sparkline, DataTable, InlineAlert, EmptyState, Select, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** SG per kategori og trend · planlagt og gjennomført tid per uke (siste fire uker) · runder brutto · kohort-SG per spiller (bare coach)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-09](../ui_kits/agencyos/katalog.html#AG-09) · kilde `ui_kits/agencyos/screens/AG-09.jsx`

#### AG-10 · Teknisk plan
- **Ruter:** `/admin/plan/teknisk`, `/admin/spillere/[id]/plan`, `…/plan/[planId]`
- **Må vise:** P1–P10, oppgaver, TrackMan-mål, treffrate
- **Komponenter:** Button, DataTable, StatusPill, Sheet, EmptyState, FormField, TextInput, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** P1.0–P10.0 med status · oppgaver per posisjon med område, teknisk fokus (eget felt), øvelse, reps, frist · TrackMan-mål med toleranse og treffrate
- **Utvidet 27.09.2026:** se §14 og `overlevering/teknisk-plan-progresjon-2026-09-27.md` (rep per læringssteg og miljø, TrackMan-skala med utgangspunkt/målboks/nå, treffprotokoll, kvalitetssjekk, siste registreringer, AG-TP-01, AG-TP-02, PH-TP-01)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-10](../ui_kits/agencyos/katalog.html#AG-10) · kilde `ui_kits/agencyos/screens/AG-10.jsx`

#### AG-11 · Workbench (coach)
- **Ruter:** `/admin/workbench/[playerId]`, `/admin/grupper/[id]/workbench`
- **Må vise:** Samme motor som spiller, stall-velger og gruppemodus
- **Komponenter:** InlineAlert, FormField, Segmented, Select (+ PH-11-motoren)
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** samme som PH-11 · stall og grupper for velger · publiser uke til spiller eller gruppe
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-11](../ui_kits/agencyos/katalog.html#AG-11) · kilde `ui_kits/agencyos/screens/AG-11.jsx`

#### AG-12 · Øktark (coach)
- **Ruter:** `/admin/gjennomfore/okter/[id]`
- **Må vise:** Økt med spiller, øvelser, notat
- **Komponenter:** Button, AxisBadge, KeyValue, StatusPill, EmptyState, Checkbox, FormField, TextInput, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** økt med spiller, tid, sted · øvelser planlagt/gjort/merknad/gjennomført · coachens notat (flere linjer, lagres ordrett)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-12](../ui_kits/agencyos/katalog.html#AG-12) · kilde `ui_kits/agencyos/screens/AG-12.jsx`

#### AG-13 · Live-tavle
- **Ruter:** `/admin/agencyos/live`, `…/live/[sessionId]`
- **Må vise:** Pågående økter nå, én økt i sanntid
- **Komponenter:** Button, AxisBadge, KeyValue, StatusPill, EmptyState, FormField, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil · natt valgfritt
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** pågående økter nå (start, varighet, øvelse, slag, treff, dagsform) · sanntidsoppdatering · siste TrackMan-slag
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-13](../ui_kits/agencyos/katalog.html#AG-13) · kilde `ui_kits/agencyos/screens/AG-13.jsx`

#### AG-14 · Plan-hub, maler og øvelser
- **Ruter:** `/admin/plan`, `/admin/plan/maler`, `/admin/plan-templates/[id]`, `…/rediger`, `…/ny`
- **Må vise:** Ukemaler, program, standardøkter, aksefordeling, opprett/rediger øvelse
- **Komponenter:** Button, AxisBadge, InlineAlert, Sheet, EmptyState, ChoicePill, FormField, TextInput, Select, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** ukemaler med aksefordeling · program · standardøkter · øvelser med AK-formel v2 (område, motorikk, belastning, press, teknisk dimensjon, mengde, restmål)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-14](../ui_kits/agencyos/katalog.html#AG-14) · kilde `ui_kits/agencyos/screens/AG-14.jsx`

#### AG-15 · Tester (coach)
- **Ruter:** `/admin/tester`, `/admin/tester/benchmarks`, `/admin/tester/tildel/[spillerId]`, `/admin/spillere/[id]/tester`
- **Må vise:** Resultater, nivåstiger, tildel test
- **Komponenter:** Button, Icon, DataTable, StatusPill, InlineAlert, Sheet, EmptyState, Select, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** testprotokoller med nivåstige · resultater med antall registrerte slag · attest · synk til talentprofil · tildel test som Workbench-økt
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-15](../ui_kits/agencyos/katalog.html#AG-15) · kilde `ui_kits/agencyos/screens/AG-15.jsx`

#### AG-16 · Grupper
- **Ruter:** `/admin/grupper`, `/admin/grupper/[id]`, `…/timeplan`, `…/arsplan`, `…/arsplan/skoledata`, `/admin/agencyos/ak-stigen`
- **Må vise:** Medlemmer, faste tider, årsplan, AK-stigen (4 trinn, Knøtt ved siden av)
- **Komponenter:** Button, Icon, DataTable, KeyValue, EmptyState, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** grupper med alder, coach, rolle (Hovedcoach/Assist Coach), faste tider, medlemmer · årsplan · skoledata (bare WANG) · AK-stigen Mini→Basis→Utvikling→Elite, Knøtt og WANG ved siden av
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-16](../ui_kits/agencyos/katalog.html#AG-16) · kilde `ui_kits/agencyos/screens/AG-16.jsx`

#### AG-17 · Turneringer
- **Ruter:** `/admin/turnering`, `/admin/tournaments/[id]`, `/admin/tournaments/ny`
- **Må vise:** Alle, mine spillere, kart, dubletter, ny turnering
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, InlineAlert, EmptyState, FormField, TextInput, Select, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** turneringer med dato, bane, nivå, status, mine spillere · resultater brutto · posisjon for kart · dubletter · DataGolf-tall (bare Anders)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-17](../ui_kits/agencyos/katalog.html#AG-17) · kilde `ui_kits/agencyos/screens/AG-17.jsx`

#### AG-18 · TrackMan og video
- **Ruter:** `/admin/trackman`, `…/[sessionId]`, `/admin/videoer`, `/admin/recording`
- **Må vise:** Økter på tvers av spillere, video, opptak
- **Komponenter:** Button, Icon, DataTable, KeyValue, Metric, EmptyState, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** TrackMan-økter på tvers av spillere med parametere · videoer per økt med merknad · opptak med samtykkestatus
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-18](../ui_kits/agencyos/katalog.html#AG-18) · kilde `ui_kits/agencyos/screens/AG-18.jsx`

#### AG-19 · Caddie / Jarvis
- **Ruter:** `/admin/jarvis`, `/admin/agents/[agentId]`
- **Må vise:** Agentkø, prosjekter, skills, kjøringsdetalj, Caddie-samtale for coach
- **Komponenter:** Button, Icon, KeyValue, StatusPill, EmptyState, Switch, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** agentkjøringer med steg, status, feil og hva som går ut · prosjekter · skills av/på · Caddie-samtale med kilde · utkast
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-19](../ui_kits/agencyos/katalog.html#AG-19) · kilde `ui_kits/agencyos/screens/AG-19.jsx`

#### AG-20 · Økonomi
- **Ruter:** `/admin/agencyos/okonomi`
- **Må vise:** Tall fra Tripletex, per virksomhet, avvik
- **Komponenter:** Button, Icon, DataTable, StatusPill, InlineAlert, EmptyState, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** Tripletex-eksport med dato per virksomhet: inntekt, kostnad, budsjett · avvik over 10 % · forklaringsutkast · «Mangler» når tall mangler (Avklares: alle tall er demodata)
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-20](../ui_kits/agencyos/katalog.html#AG-20) · kilde `ui_kits/agencyos/screens/AG-20.jsx`

#### AG-21 · Oppgaver
- **Ruter:** `/admin/oppgaver`, `/admin/workspace/notion`
- **Må vise:** Prosjekter, rutiner, tildelte oppgaver
- **Komponenter:** Button, StatusPill, Sheet, EmptyState, Checkbox, FormField, TextInput, Select, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** mine oppgaver med prosjekt, frist, fra hvem · prosjekter med fremdrift · rutiner per ukedag · Notion-synk
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-21](../ui_kits/agencyos/katalog.html#AG-21) · kilde `ui_kits/agencyos/screens/AG-21.jsx`

#### AG-22 · Innsikt og talent
- **Ruter:** `/innsyn/talent/radar`, `…/discovery`, `…/sammenligning`, `…/wagr-import`
- **Må vise:** Radar mot peer-snitt, opptil fire spillere side ved side
- **Komponenter:** Button, DataTable, StatusPill, InlineAlert, EmptyState, ChoicePill, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** talentindeks fem akser per spiller og peer-snitt · fødselsår og samtykke · discovery · WAGR-fil
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-22](../ui_kits/agencyos/katalog.html#AG-22) · kilde `ui_kits/agencyos/screens/AG-22.jsx`

#### AG-23 · Oppsett
- **Ruter:** `/admin/oppsett`, `/admin/profile`, `/admin/team/ekstern`, `/admin/team/inviter`, `/admin/marketing`
- **Må vise:** Åtte faner, tilgang, inviter coach, egen profil
- **Komponenter:** Button, Avatar, DataTable, KeyValue, StatusPill, InlineAlert, FormField, TextInput, Select, Switch, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** egen profil · team med rolle og tilgang · invitasjoner · varselvalg · integrasjonsstatus · markedsføringstekster · virksomhetsdata
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-23](../ui_kits/agencyos/katalog.html#AG-23) · kilde `ui_kits/agencyos/screens/AG-23.jsx`

#### AG-24 · Drift (kun admin)
- **Ruter:** `/admin/audit-log`, `/admin/feillogg`, `/admin/gdpr`, `/admin/hjelp`
- **Må vise:** Logg, feil, sletteforespørsler, hjelp
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, Dialog, EmptyState, FormField, TextInput, PageHeader, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280 · 1440
- **Trenger:** revisjonslogg · feillogg · sletteforespørsler med frist og omfang · hjelpeartikler
- **Tegning:** [ui_kits/agencyos/katalog.html#AG-24](../ui_kits/agencyos/katalog.html#AG-24) · kilde `ui_kits/agencyos/screens/AG-24.jsx`

### Forelder (/forelder)

**Bredder:** 390/768: MenuBar + NavDrawer, én kolonne. 1024/1280: NavRail, to kolonner. Ingen hurtigknapp.

#### FO-01 · Forelder i dag
- **Ruter:** `/forelder`, `/forelder/ukerapport`, `/forelder/varsler`
- **Må vise:** Dagens økt, neste booking, uke, ACWR-varsel
- **Komponenter:** Button, Avatar, Sparkline, KeyValue, StatusPill, InlineAlert, EmptyState, ChoicePill, FormField, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** barn koblet til forelder · dagens økt, neste booking, ukeplan · ACWR med kilde · etterlevelse siste fire uker (samme tall som AgencyOS)
- **Tegning:** [ui_kits/forelder/katalog.html#FO-01](../ui_kits/forelder/katalog.html#FO-01) · kilde `ui_kits/forelder/screens/FO-01-03.jsx`

#### FO-02 · Barn
- **Ruter:** `/forelder/barn`, `/forelder/barn/[childId]`
- **Må vise:** Koblede barn, utviklingsprofil
- **Komponenter:** Button, Avatar, Sparkline, KeyValue, StatusPill, InlineAlert, EmptyState, ChoicePill, FormField, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** barnas profil og nøkkeltall · fremgang · coaching-pakke og klipp · helse vises aldri for forelder
- **Tegning:** [ui_kits/forelder/katalog.html#FO-02](../ui_kits/forelder/katalog.html#FO-02) · kilde `ui_kits/forelder/screens/FO-01-03.jsx`

#### FO-03 · Booking for barn
- **Ruter:** `/forelder/bookinger*`
- **Må vise:** Velg barn, tjeneste, tid, bekreft
- **Komponenter:** Button, Avatar, Sparkline, KeyValue, StatusPill, InlineAlert, EmptyState, ChoicePill, FormField, Segmented, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** barn · tjenester med pris fra ServiceType · ledige tider · klipp per barn og pakke · booking sendes til coach for bekreftelse
- **Tegning:** [ui_kits/forelder/katalog.html#FO-03](../ui_kits/forelder/katalog.html#FO-03) · kilde `ui_kits/forelder/screens/FO-01-03.jsx`

#### FO-04 · Økonomi
- **Ruter:** `/forelder/okonomi`, `/forelder/fakturaer`
- **Må vise:** Abonnement, neste trekk, fakturaer
- **Komponenter:** Button, Avatar, DataTable, KeyValue, StatusPill, Timeline, Dialog, InlineAlert, EmptyState, FormField, TextInput, Segmented, Switch, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** abonnement per barn (TALENT/FULL, periode) · neste trekk · kort · fakturaer · avslutning via Stripe med sluttdato
- **Tegning:** [ui_kits/forelder/katalog.html#FO-04](../ui_kits/forelder/katalog.html#FO-04) · kilde `ui_kits/forelder/screens/FO-04-06.jsx`

#### FO-05 · Samtykke
- **Ruter:** `/forelder/samtykke`, `/forelder/samtykke/deling/[childId]`
- **Må vise:** Under 16 år, deling, revisjonshistorikk
- **Komponenter:** Button, Avatar, DataTable, KeyValue, StatusPill, Timeline, Dialog, InlineAlert, EmptyState, FormField, TextInput, Segmented, Switch, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** samtykker per barn under 16 med hva/hvem · revisjonslogg (hvem ga/trakk, når, hvordan)
- **Tegning:** [ui_kits/forelder/katalog.html#FO-05](../ui_kits/forelder/katalog.html#FO-05) · kilde `ui_kits/forelder/screens/FO-04-06.jsx`

#### FO-06 · Coach og innstillinger
- **Ruter:** `/forelder/coach`, `/forelder/innstillinger`
- **Må vise:** Coach, siste melding, egen kontakt
- **Komponenter:** Button, Avatar, DataTable, KeyValue, StatusPill, Timeline, Dialog, InlineAlert, EmptyState, FormField, TextInput, Segmented, Switch, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** coach med kontakt · meldingstråd · forelderens kontaktinfo og varsler
- **Tegning:** [ui_kits/forelder/katalog.html#FO-06](../ui_kits/forelder/katalog.html#FO-06) · kilde `ui_kits/forelder/screens/FO-04-06.jsx`

### Konto

**Bredder:** Uten app-meny. Sentrert kolonne maks 440–520 px i alle bredder.

#### AU-01 · Logg inn
- **Ruter:** `/auth/login`, `/auth/bankid`, `/auth/logget-ut`
- **Må vise:** E-post/passord, Google, BankID-plassholder
- **Komponenter:** Button, InlineAlert, LoadingState, ErrorState, Checkbox, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** innlogging e-post/passord · låsing etter fem forsøk · Google og BankID (Kommer)
- **Tegning:** [ui_kits/konto/katalog.html#AU-01](../ui_kits/konto/katalog.html#AU-01) · kilde `ui_kits/konto/screens/AU-01-03.jsx`

#### AU-02 · Registrer
- **Ruter:** `/auth/signup`, `/auth/check-email`, `/auth/checkout-resume`
- **Må vise:** Pakke, samtykke, sjekk e-post
- **Komponenter:** Button, InlineAlert, LoadingState, ErrorState, Checkbox, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** valgt pakke og periode · konto (navn, e-post) · forelder-e-post under 16 · vilkår · e-postbekreftelse · Stripe
- **Tegning:** [ui_kits/konto/katalog.html#AU-02](../ui_kits/konto/katalog.html#AU-02) · kilde `ui_kits/konto/screens/AU-01-03.jsx`

#### AU-03 · Passord
- **Ruter:** `/auth/forgot-password`, `/auth/reset-password`
- **Må vise:** Be om lenke, nytt passord
- **Komponenter:** Button, InlineAlert, LoadingState, ErrorState, Checkbox, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** e-post for lenke · lenke med utløp (én time) · nytt passord med regler
- **Tegning:** [ui_kits/konto/katalog.html#AU-03](../ui_kits/konto/katalog.html#AU-03) · kilde `ui_kits/konto/screens/AU-01-03.jsx`

#### AU-04 · Onboarding
- **Ruter:** `/auth/onboarding`, `/auth/onboarding/forelder`
- **Må vise:** Stegviser for spiller/coach og forelder
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented, SegmentedFilter, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** rolle (spiller/coach/forelder) · steg per rolle · koblingskode
- **Tegning:** [ui_kits/konto/katalog.html#AU-04](../ui_kits/konto/katalog.html#AU-04) · kilde `ui_kits/konto/screens/AU-04-06.jsx`

#### AU-05 · Samtykke via lenke
- **Ruter:** `/auth/guardian-consent/[token]`, `/auth/lyd-samtykke/[token]`, `/auth/samtykke-venter`, `/inviter/forelder/[token]`
- **Må vise:** Forelder bekrefter, spiller venter
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented, SegmentedFilter, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** samtykkeforespørsel via engangslenke (barn, coach, hva) · svar og tidsstempel · lenken gir ingen annen tilgang
- **Tegning:** [ui_kits/konto/katalog.html#AU-05](../ui_kits/konto/katalog.html#AU-05) · kilde `ui_kits/konto/screens/AU-04-06.jsx`

#### AU-06 · Innsyn (ekstern leser)
- **Ruter:** `/innsyn`, `/innsyn/[spillerId]`
- **Må vise:** Samtykkede resultater per gruppe og spiller
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented, SegmentedFilter, Select, PageHeader
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** ekstern lesers tilgang (gruppe, spillere) · samtykkede resultater brutto og tester
- **Tegning:** [ui_kits/konto/katalog.html#AU-06](../ui_kits/konto/katalog.html#AU-06) · kilde `ui_kits/konto/screens/AU-04-06.jsx`

### Booking (offentlig)

**Bredder:** Egen topplinje. 390/768: én kolonne, sammendrag under. 1024/1280: innhold + sammendrag 300 px til høyre (sticky).

#### BK-01 · Velg tjeneste
- **Ruter:** `/booking`
- **Må vise:** Fire steg i én flyt, pauset-tilstand
- **Komponenter:** Button, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** tjenester (ServiceType) · offentlig booking åpen/pauset
- **Tegning:** [ui_kits/booking/katalog.html#BK-01](../ui_kits/booking/katalog.html#BK-01) · kilde `ui_kits/booking/screens/BK.jsx`

#### BK-02 · Velg tid og betal
- **Ruter:** `/booking/[slug]`, `/booking/[slug]/bekreft`
- **Må vise:** Dag/uke, tidsluker, Stripe, Vipps
- **Komponenter:** Button, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** ledige tider per dag/uke · kunde (navn, e-post, spiller under 18) · betaling Stripe/Vipps
- **Tegning:** [ui_kits/booking/katalog.html#BK-02](../ui_kits/booking/katalog.html#BK-02) · kilde `ui_kits/booking/screens/BK.jsx`

#### BK-03 · Kvittering
- **Ruter:** `/booking/kvittering/[bookingId]`
- **Må vise:** Referanse i mono, .ics, opprett konto
- **Komponenter:** Button, KeyValue, StatusPill, InlineAlert, LoadingState, EmptyState, ErrorState, Checkbox, ChoicePill, FormField, TextInput, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** bookingreferanse · tjeneste, tid, coach, betalt beløp · .ics · bekreftes automatisk når tiden er ledig og betalt · gjest får «Fortsett i PlayerHQ» (pris fra data), innlogget får lenke til bookingen · e-post EP-01
- **Tegning:** [ui_kits/booking/katalog.html#BK-03](../ui_kits/booking/katalog.html#BK-03) · kilde `ui_kits/booking/screens/BK.jsx`

### Statistikk (offentlig)

**Bredder:** Egen topplinje med meny som bryter. Tabeller blir kortrader under 760 px. «Powered by Data Golf» nederst.

#### ST-01 · Stats-hub og søk
- **Ruter:** `/stats`, `/stats/sok`, `/stats/uka`, `/stats/2026`, `/stats/leaderboards`, `/stats/norske`
- **Må vise:** Live-snapshot, innganger, «Powered by Data Golf»
- **Komponenter:** Icon, Sparkline, DataTable, StatusPill, LoadingState, EmptyState, ErrorState, SearchField, SegmentedFilter, Select, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** live-turnering (status, leder, oppdatert) · antall per liste · søk
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-01](../ui_kits/statistikk/katalog.html#ST-01) · kilde `ui_kits/statistikk/screens/ST-01-03.jsx`

#### ST-02 · Liste med filter
- **Ruter:** `/stats/spillere`, `/stats/klubber`, `/stats/baner`, `/stats/turneringer`, `/stats/aargang*`, `/stats/regions`, `/stats/pga/spillere`, `/stats/blogg`, `/turneringer`
- **Må vise:** Tabell → kortrader, filter som bryter linje
- **Komponenter:** Icon, Sparkline, DataTable, StatusPill, LoadingState, EmptyState, ErrorState, SearchField, SegmentedFilter, Select, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** spillere, klubber, baner, turneringer, årganger, regioner, PGA-spillere, blogg · snitt brutto og rangering · fødselsår og samtykke
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-02](../ui_kits/statistikk/katalog.html#ST-02) · kilde `ui_kits/statistikk/screens/ST-01-03.jsx`

#### ST-03 · Profil/detalj
- **Ruter:** `/stats/spillere/[slug]`, `/stats/klubber/[slug]`, `/stats/baner/[slug]`, `/stats/regions/[slug]`, `/stats/tour/[slug]`, `/stats/pga/spillere/[dg_id]`, `/stats/blogg/[slug]`
- **Må vise:** Nøkkeltall, trend, resultater
- **Komponenter:** Icon, Sparkline, DataTable, StatusPill, LoadingState, EmptyState, ErrorState, SearchField, SegmentedFilter, Select, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** profil for spiller/klubb/bane/region/tour med nøkkeltall, trend og resultater brutto
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-03](../ui_kits/statistikk/katalog.html#ST-03) · kilde `ui_kits/statistikk/screens/ST-01-03.jsx`

#### ST-04 · Turnering
- **Ruter:** `/stats/turneringer/[slug]`, `…/statistikk`, `/turneringer/[slug]`
- **Må vise:** Leaderboard live, scorefordeling
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, EmptyState, ChoicePill, FormField, TextInput, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** leaderboard live (plass, runder, brutto, til par fra resultatet, hull) · scorefordeling
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-04](../ui_kits/statistikk/katalog.html#ST-04) · kilde `ui_kits/statistikk/screens/ST-04-06.jsx`

#### ST-05 · PGA-kategori og utforskere
- **Ruter:** `/stats/pga`, `/stats/pga/*` (6 kategorier), `/stats/pga/putt-explorer`, `/stats/sammenlign-spillere`, `/stats/sg-sammenlign*`, `/stats/min-progresjon`
- **Må vise:** Percentil, sammenligning, egne tall
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, EmptyState, ChoicePill, FormField, TextInput, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** PGA-kategorier med verdi, persentil og snitt (Data Golf) · spillersammenligning · egne tall mot Data Golfs ekte fordeling (ingen egen formel, «—» når fordelingen mangler) · ekte PGA-navn fra Data Golf (tegningen har demonavn)
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-05](../ui_kits/statistikk/katalog.html#ST-05) · kilde `ui_kits/statistikk/screens/ST-04-06.jsx`

#### ST-06 · Verktøy og moro
- **Ruter:** `/stats/verktoy*` (6), `/stats/quiz`, `/stats/wrapped/[slug]`
- **Må vise:** Kalkulatorer, quiz, sesongoppsummering
- **Komponenter:** Button, DataTable, KeyValue, StatusPill, EmptyState, ChoicePill, FormField, TextInput, Tabs
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** brutto og par for spilte hull (kalkulator) · quiz · sesongoppsummering (med samtykke)
- **Tegning:** [ui_kits/statistikk/katalog.html#ST-06](../ui_kits/statistikk/katalog.html#ST-06) · kilde `ui_kits/statistikk/screens/ST-04-06.jsx`

### GFGK Junior (offentlig)

**Bredder:** Egen klubbtopp. 390/768: én kolonne. 1024/1280: to kolonner (gruppeplan + kalender, kategorier + artikkel).

#### GJ-01 · GFGK Junior forside og grupper
- **Ruter:** `/gfgk-junior`, `/gfgk-junior/gruppe/[gruppe]`, `/gfgk-junior/treningsplaner`, `/gfgk-junior/kalender`
- **Må vise:** AK-stigen (fire trinn), gruppeplan, kalender
- **Komponenter:** Button, Icon, KeyValue, LoadingState, EmptyState, ErrorState
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** grupper på AK-stigen og Knøtt med alder, trener, tider, antall · kalender · klubb: Gamle Fredrikstad Golfklubb
- **Tegning:** [ui_kits/gfgk/katalog.html#GJ-01](../ui_kits/gfgk/katalog.html#GJ-01) · kilde `ui_kits/gfgk/screens/GJ.jsx`

#### GJ-02 · GFGK veileder
- **Ruter:** `/gfgk-junior/veileder`, `/gfgk-junior/veileder/[slug]`
- **Må vise:** Kategorier, artikkel
- **Komponenter:** Button, Icon, KeyValue, LoadingState, EmptyState, ErrorState
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** veilederkategorier · artikler med forfatter og dato
- **Tegning:** [ui_kits/gfgk/katalog.html#GJ-02](../ui_kits/gfgk/katalog.html#GJ-02) · kilde `ui_kits/gfgk/screens/GJ.jsx`

### System

**Bredder:** Sentrert kort maks 560 px i alle bredder.

#### SY-01 · Systemtilstander
- **Ruter:** `/offline`, `/vedlikehold`, 404, 500
- **Må vise:** Feilkode i mono, hva nå
- **Komponenter:** Button, Icon, LoadingState, Segmented
- **Tilstander:** Data · Tom · Laster · Feil
- **Bredder:** 390 · 768 · 1024 · 1280
- **Trenger:** tilstand (offline, vedlikehold, 404, 500) · feilkode/referanse · ventende endringer ved offline
- **Tegning:** [ui_kits/system/katalog.html#SY-01](../ui_kits/system/katalog.html#SY-01) · kilde `ui_kits/system/screens/SY-01.jsx`

## 5. Uavklarte beslutninger og demodata (7)

| Skjerm | Type | Hva | Blokkerer |
|---|---|---|---|
| ST-05 PGA-kategori og utforskere | Demodata | PGA-navnene er demonavn. I appen brukes ekte navn fra Data Golf | — |
| AG-06 Booking (coach) | Demodata | Timeprisen 950 kr er demodata, ikke ekte pris. Skal ikke porteres | Ekte pris i ServiceType før lansering |
| AG-20 Økonomi | Demodata | WANG-kostnad 33 450 kr er et omtrentlig demotall | Ekte tall og budsjett fra Tripletex |
| AG-20 Økonomi | Demodata | Alle økonomitall er demodata i Tripletex-format, ikke ekte regnskap | Ekte tall og budsjett fra Tripletex |
| PH-20 Gameplan og banekart | Etter lansering | Komplett baneguide (ekte hullkart, kartgrunnlag, full banedatabase) flyttet til etter lansering. Hullkart vises med eksempeldata | — (blokkerer ikke lansering) |
| AG-06 Booking (coach) | Data avklares | 950 kr er demodata) | Ekte pris i ServiceType før lansering |
| AG-20 Økonomi | Data avklares | alle tall er demodata) | Ekte tall og budsjett fra Tripletex |

## 4b. E-poster (EP-01–06)

Kilde: `ui_kits/epost/emails.js` · katalog [../ui_kits/epost/katalog.html](../ui_kits/epost/katalog.html). Bygg som React Email / MJML-maler. **Bevisst unntak:** farger skrives rett inn (e-postprogrammer støtter ikke CSS-variabler), verdiene står i readme under «E-post».

Felles: 600 px, én kolonne, lesbar på 390 px, fungerer uten bilder, systemfonter som reserve, lyst og mørkt e-postprogram (`prefers-color-scheme`), én grafitt hovedknapp, avsender «AK Golf Academy · Bossumveien 6, 1605 Fredrikstad» nederst. Ingen vitnesbyrd eller salgsklisjeer.

- **EP-01 Bekreftelse** — gjest og appbruker. Trenger: tjeneste, dato og klokkeslett, sted, coach, pris eller «Inkludert i abonnement», betalingsreferanse (mono), avbestillingsfrist som dato og klokkeslett (24 timer før), .ics, endre/avbestill-lenke. Gjest: «Fortsett i PlayerHQ» med pris fra data og opprett-konto-lenke med e-post utfylt. Appbruker: lenke til bookingen i PlayerHQ.
- **EP-02 Endret time** — gammel tid overstrøket, ny tid uthevet, ny frist. Ellers som EP-01.
- **EP-03 Påminnelse dagen før** — timen, sted, veibeskrivelse.
- **EP-04 Avbestilling** — hva som er avbestilt, refusjon (beløp til kort eller klipp tilbake), referanse, «Book ny time».
- **EP-05 Takk etter coachingtime** — til kunde uten konto. **Regel:** utkastet ligger klart hos coachen i AG-02 innen 24 timer etter timen, med tidspunkt («Klar til sending — timen var i går kl. 14.00»). Coachen sender. Coachens to–tre linjer (fritekst), tilbud om PlayerHQ, «Book neste time», reservasjonslenke. Lages som **utkast i AG-02 · E-postutkast**; coachen redigerer og trykker «Send» (rust). Ingenting sendes automatisk.
- **EP-06 Oppfølging senere** — **Regel:** sendes én gang, 14 dager etter timen, bare hvis kunden verken har booket ny time eller kjøpt PlayerHQ. Deretter ingenting mer. Reservasjonslenke.

**Konto fra gjestebooking:**
- Alle bookinger bekreftes automatisk når tiden er ledig og betalingen er gjennomført, både offentlig og i appen (PH-23, FO-03). Ingen ventestatus.
- Kontolenken i EP-01, EP-05, EP-06 og BK-03 bruker en **engangskode** (`/opprett-konto?k=<kode>`). E-postadressen står aldri i adressefeltet; den fylles ut fra koden på serversiden. Koden er engangs og utløper.
- Når en flexkunde oppretter PlayerHQ-konto med samme e-post, hentes tidligere bookinger inn på kontoen. Vises som «Bookingene dine følger med inn i kontoen» under kontoknappen (EP-01 gjest, BK-03) og som «Tidligere bookinger» i PH-23.

## 6. Anbefalt byggerekkefølge

0. **Først (kodekontroll 27.09.2026):** `precision-tokens.css` og lyst tema i `/admin` → delte komponenter (StatusPill, KeyValue, DataTable, State/Gate, InlineAlert, kildemerke, SG-format) → PH-25 låst-tilstand med `fra` bevart → PH-18 gjennomgang (etter autorisert skjemaendring) → offline-stripe → videresend `/portal/toppidrett`. Se §8.

1. **Tokens, skall og komponenter** — alt annet bygger på `tokens.css`, de to skallene og komponentene, så de må være ferdige og testet mot de fire tilstandene først.
2. **Konto og samtykke (AU-01–06, FO-05)** — innlogging, roller og samtykkeregelen (2008/16 år) styrer hva hver annen skjerm får vise.
3. **PlayerHQ kjerne (PH-01–03, PH-09–11, PH-16)** — spillerens daglige flyt og planmotoren gir dataene etterlevelse, SG og coachflatene bygger på.
4. **Nattflater (PH-04–08, PH-15)** — live-registrering er utendørs og offline-kritisk, og tester natt-tokens og 56 px treffmål.
5. **AgencyOS kjerne (AG-01–07, AG-11–12)** — coachens kø, kalender, booking og Workbench godkjenner det spillerne sender.
6. **Resten av PlayerHQ og AgencyOS (PH-12–26, AG-08–10, AG-13–24)** — analyse, tester, økonomi og drift gjenbruker komponentene fra trinn 3 og 5. PH-18 etter-runden-gjennomgang (SG, putting, noter, manuell/annen app, delvis lagring) er lanseringskrav og bygges her sammen med PH-09. PH-20 bygges med eksempeldata.
7. **Forelder, booking og e-post (FO-01–04, FO-06, BK-01–03, EP-01–06)** — kjøperflatene og bekreftelsene trenger ServiceType, klipp og Stripe fra de tidligere trinnene.
8. **Offentlige flater (ST-01–06, GJ-01–02, SY-01)** — statistikk og klubbsider leser samme data read-only, og SY-01 kan bygges når som helst.
9. **Etter lansering** — komplett baneguide for PH-20: ekte hullkart, kartgrunnlag og full banedatabase. Byttes inn bak samme mønster uten ny skjerm. Ekte API-import fra andre apper vurderes også her.

## 7. Revisjon

Kjør `ui_kits/audit.html?bad` i designprosjektet for fasiten: scrollWidth === clientWidth, høyst én rust, hurtigknapp bare i AgencyOS. Samme sjekker bør inn i Playwright-testene i AK Golf HQ.

## 8. Kodekontroll mot GitHub (27.09.2026)

Lest: `AGENTS.md`, `START-HER.md`, `docs/FASIT.md`, `docs/PLATTFORM-KART.md`, `docs/design-system/design-autoritet.md`, `docs/platform/BUSINESS-RULES.md`, `docs/platform/AGENT-BRIEF.md`, `designsystem/README.md`, alle `page.tsx` under `src/app`, `src/components` (nivå 1–2), `src/styles`, `src/lib/auth/requirePortalUser.ts`, `src/lib/auth/talent-allowlist.ts`, `src/lib/v2/tema-default.ts`, rundeskjemaet (`runde-ny-form.tsx`, `manuell-sg-felt.tsx`), `OfflineBanner.tsx`, `/offline`, `/portal/toppidrett`, `/portal/live`.

### Dekning
Alle 74 skjermtyper har rute i koden. Ruter uten egen rad er videresendinger (lagt inn i raden de lander i, se skjermliste.md) eller utenfor omfang. Én rute har ingen plass: `/portal/toppidrett`.

### Avvik kode ↔ design (Codex retter)
1. **Tema:** `src/lib/v2/tema-default.ts` starter `/admin` mørkt. Design: lyst er standard overalt; natt bare i Live-økt og slagregistrering ute (PH-04–08, PH-15). `erMorkFlate` skal returnere false for `/admin`.
2. **docs/FASIT.md er utdatert mot designautoriteten:** radius 2, rust på Publiser/Godkjenn/START ØKT og seks AgencyOS-nav. Gjelder nå: radius 8 (ark 12, piller 999), grafitt primær, rust bare signal (maks én), AgencyOS-nav som i AG-rammen. Designautoriteten står øverst i FASIT sin egen kildeorden.
3. **Hardkodede farger i nye flater:** `LivePrecisionView`, `ToppidrettKlient`, `OfflineBanner` bruker hex og Tailwind-farger (`bg-[#FAF8F3]`, `emerald`, `rose`). Bytt til tokens fra `tokens/*.css`.
4. **Offline-stripen** i koden er rosa med blinkende rust. Rust er ikke for offline. Bruk mønsteret i `ui_kits/system/OfflineBanner.jsx`: nøytral stripe, antall lagrede registreringer i mono, Prøv igjen.
5. **`/portal/toppidrett`** er en egen analysemodul (sju faner). Produktregelen sier Analyse er én flate med faner. Videresend til `/portal/analysere` (PH-16) og flytt eventuelle unike visninger inn som faner der.
6. **TALENT-låsing:** `requirePortalUser` sender TALENT fra FULL-flater til `/portal/oppgrader?fra=laast`, men `/portal/oppgrader` videresender uten `fra`. Ta med `fra` og målruten til flyten og vis låst-meldingen fra PH-25 (tom-tilstand). TALENT-listen i PH-25 følger nå `talent-allowlist.ts`.
7. **Oppgraderingsflyten** omtaler «PRO» i koden. Vis alltid FULL/TALENT, aldri GRATIS/PRO/ELITE eller Performance som app-nivå.
8. **PH-18 etter-runden-gjennomgang:** `RundeNyForm` og `ManuellSgFelt` har allerede brutto score, hull for hull, putter/FW/GIR, manuell SG (enkel og avansert) og notat. Behold dem. Det som mangler: kilde (`manuell` | `annen_app`) og kildedato lagret på runden, status Delvis lagret/Fullført, delvis lagring (i dag lagres alt eller ingenting, og kun totalscore krever 18 hull), og at gjennomgangen kan åpnes fra rundedetaljen. Dette krever skjemaendring på `Round` — **be Anders om autorisasjon før migrering** (AGENTS.md).

### Komponenter og tokens som mangler i koden
- Tokens: ingen fil speiler `tokens/*.css` fra dette prosjektet. Lag `src/styles/precision-tokens.css` fra `tokens/colors.css`, `typography.css`, `spacing.css`, `layout.css`, `motion.css` og la den eie `:root` og `[data-theme="night"]`. `ak-hq-tokens.css`, `train-lock-tokens.css` og `ak-golf-ds-tokens.generert.css` blir historikk for disse flatene.
- Komponenter som finnes her, men ikke i `src/components/ui`: StatusPill, KeyValue, DataTable (tabell → kortrader), InlineAlert, Segmented, ChoicePill, Stepper, State (Tom/Laster/Feil med feilkode), TopBar/NavRail/TabBar-rammen og en Gate-omslutning for de fire tilstandene.
- Hjelpere uten DS-komponent: kildemerke («KILDE · DATO», «ESTIMAT») og SG-formattering (fortegn, komma, «—»). Lag dem som små delte funksjoner, ikke per skjerm.

### Tilstander
Alle 74 har Data, Tom, Laster og Feil. Offline er dekket av SY-01 og offline-stripen i Live-flatene. Tilgang nektet: coach/admin-ruter sender til egen forside etter rolle (ingen egen skjerm trengs); TALENT → PH-25 låst; mindreårig uten samtykke → AU-05; innsyn uten tilgang → AU-06 feil 403. Lagrer/Lagret/Feilet: knapp deaktivert med «Lagrer …», så StatusPill «Lagret» + kvittering med klokkeslett, feil beholder tallene («Tallene er beholdt. Prøv igjen.»).

### Grenseflater mot Team Norway og WANG (egne designsystemer, ikke Precision)
- `/portal/tren/tester/team-norway` er del av PH-14 i Precision. `/team-norway/*` tegnes i «Team Norway App».
- WANG: `/team-wang/*` tegnes i «WANG Toppidrett». WANG-elever er PlayerHQ-brukere (FULL via AK-gruppe); PlayerHQ lenker ikke inn i WANG-flaten.
- Samtykke og deling for TN/WANG vises i PH-25 og FO-05 med samme mønster som coach-deling.

### Port 7-status
- **Klar for Anders-gjennomgang:** alle 74 skjermtyper og EP-01–06, PH-20 med eksempeldata.
- **Lanseringskrav:** PH-18 etter-runden-gjennomgang (se punkt 8), PH-25 låst-tilstand for TALENT, lyst tema i AgencyOS, tokens i koden.
- **Etter lansering:** komplett baneguide for PH-20, ekte API-import fra andre apper, markedssidene.
- **Blokkert av produktbeslutning:** ingen i Port 7-omfanget. Utenfor omfanget: coaching-priser for markedssidene (utkastet bruker feil navn og priser). Skjemaendringen for PH-18 venter på autorisasjon, ikke på en produktbeslutning.


## 9. Designpass 27.09.2026 — PlayerHQ, AgencyOS og analyse

Full plan: `overlevering/teknisk-plan-playerhq-agencyos-analyse.md`. Kort:

- **Navigasjon:** BackBar til forrige kontekst (historikk, ellers `parent` på skjermen) i alle ikke-rot-skjermer. ActionBar med lagrestatus (Lagrer / Lagret 14:02 / Kunne ikke lagre / Konflikt). ConfirmDialog for sletting, publisering og ulagrede endringer. UndoToast (8 s) etter flytt, slett, publiser, dupliser, legg til og avvis.
- **Dra-og-slipp:** `@dnd-kit` bak SortableList, DropZone, MoveSheet og ConflictSheet. Workbench (dag, uke, serie, dupliser, konflikt), Øktbygger (bank → oppvarming/hoveddel/avslutning, arbeidskrav), Kalender (ny dag/tid, overlapp), Kø (prioritet), Rapport (seksjoner). Stall, Plan og Live har ingen dra. Alle dra-flater har tastatur og Flytt-ark.
- **Treningsanalyse (PlayerHQ):** PH-A01 Oversikt · A02 Belastning · A03 Øktkvalitet · A04 Slagdata · A05 Nærspill og putting · A06 Runder · A07 Tester · A08 Datagrunnlag. Inngang fra PH-16.
- **Innsikt (AgencyOS):** AG-A01 Oversikt · A02 Spilleranalyse samlet · A03 Grupper (ingen rangering) · A04 Plan mot faktisk · A05 Datakvalitet · A06 Tiltaksverksted · A07 Rapportbygger · A08 Caddie-forslag. Nytt menypunkt «Innsikt».
- **Nye komponenter (19):** ActionBar, BackBar, ConfirmDialog, ConflictSheet, DropZone, MoveSheet, SortableList, UndoToast · AxisVolumeBars, ChartTable, DataQualityBadge, DistributionPlot, EmptyAnalysisState, EvidenceDrawer, FilterChips, InsightCard, PeriodSelector, SourceBadge, TrendChart.
- **Analyseregler:** periode, kilde, dato og n på hvert tall; «—» aldri 0; SG symmetrisk rundt null; ingen «forbedring» ved tynt grunnlag; graf ↔ tabell; hver innsikt har en handling.
- **Bygg først:** `NavigationProvider` (historikk + dirty + undo) → analysekomponentene → dnd-kjernen og `moveSession` → Workbench og Øktbygger → PH-A → AG-A → Kalender, Kø, Stall, Øktark.

**Audit 27.09.2026 (full, fordi Shell og Host ble endret):** PlayerHQ 34 skjermtyper × 4 tilstander × lyst/natt × 390/768/1024/1280/1440 = 1 360 tilfeller, 0 avvik. AgencyOS 32 skjermtyper × 4 tilstander + 9 kit-sider × 5 bredder = 685 tilfeller, 2 avvik funnet og rettet (Øktbygger 390 px: lang øvelseskode brøt ikke linje; Innsikt: to rustelementer — Belastning-pillen er nå gul). Til sammen 2 045 tilfeller. Konflikt-, dra-over-, angre- og lagrer-tilstander er kontrollert for hånd, ikke automatisk.

## 10. Better-ui-polering 27.09.2026

Full liste: `overlevering/better-ui-polish-2026-09-27.md`. Registrerte designsystem-endringer: `--press-scale` .98 → .96, `--dur-press` 120 → 150ms, `--press-scale-card` .99 (ny), statisk trykk i natt, `--radius-inner` 6 → 4px, `--shadow-card` → none, `--dur-swap`/`--ease-swap` (nye). Palett, fonter og akseregler er uendret.

- **Flater:** kort uten skygge, skygge bare for elevation, bildekontur 10 % svart/hvit, konsentrisk radius i tett nesting, datamerker 0.
- **Optikk:** ikonsiden på knapper 2 px mindre padding, play/send 1 px mot høyre, ikonvekt via størrelse (18 px = 1,5 px strek).
- **Motion:** ingen `transition: all` (6 rettet), eksakte egenskaper (8 presisert), trykk .96/150ms, `pa-swap` for status/ikonbytte, temabytte uten crossfade.
- **Treff:** usynlig utvidelse til 44 px på sm-knapp, pille, filter, segment; Live-dialog og pause 56 px; sticky ActionBar skjuler ikke fokus eller toast.
- **Analyse:** InsightCard med kilde/handling-bånd, felles rytme for SourceBadge, DataQualityBadge, EvidenceDrawer og EmptyAnalysisState.
- **Gjenstår:** MEDIUM kort-i-kort (Cockpit, Meg) og fast Lucide-strek i masken; LOW hardkodede radius i eldre skjermfiler, `pa-swap` bare på ActionBar, toppidrett-utkast ikke fullt polert.

**Audit 27.09.2026 etter better-ui (samme dag, kjørt etter at alle endringer var på plass):** PlayerHQ 34 skjermtyper × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 1 360 tilfeller, 0 avvik. AgencyOS 32 skjermtyper (inkl. AG-A01–A08) × 4 tilstander + AgencyOS-kit (Øktbygger, Workbench, Kalender m.fl.) + systemtilstander (offline, 404/500, tomme) × 5 bredder = 700 tilfeller, 0 avvik. Til sammen 2 060 tilfeller, 0 avvik. Sjekket: horisontal rulling og klipping (doc + main), høyst én rust, hurtigknapp bare i AgencyOS.

**Ikke automatisk verifisert:** dra over / slipp / ugyldig mål, ConflictSheet, UndoToast over sticky ActionBar, trykk-skalering og `pa-swap` i bevegelse, temabytte uten crossfade, 44 px treffutvidelse (måles ikke av audit), forelder, booking, konto, statistikk og e-post (ikke kjørt i dette passet; siste kontroll 0 avvik før polering). Disse er kontrollert for hånd i katalogene eller står åpne — ikke regnet som godkjent.

## 11. Workbench-hull rettet 27.09.2026 — fysisk plan og turneringsmodul

Anders fant at Workbench manglet en komplett fysisk plan og en komplett turneringsmodul. Begge er nå egne underflater av Workbench (samme motor for coach og spiller) med egne ID-er:

| ID | Flate | Rute (forslag) | Rolle |
|---|---|---|---|
| AG-WB-FYS | Workbench · fysisk plan | `/admin/workbench/[playerId]?pille=fys` | Coach, spiller- eller gruppemodus |
| AG-WB-TURN | Workbench · turneringer | `/admin/workbench/[playerId]?pille=turn` | Coach |
| PH-WB-FYS | Fysisk plan (spiller) | `/portal/tren/fys-plan` | Les og gjennomfør |
| PH-WB-TURN | Turneringsplan (spiller) | `/portal/tren/turneringer/[id]` | Les, kryss av, evaluer |

Innganger: AG-11 (knappene «Fysisk plan» og «Turneringer»), PH-10 Plan (samme), PH-01 I dag (kort «Neste turnering»), AG-A04 Plan mot faktisk (handlinger), AG-A06 Tiltaksverksted (tiltak kan legges i fysisk plan).

### Fysisk plan
- **Blokk:** navn, mål, uker (6-ukers standard, fritt 4–8), deload-uke, testuke, status (utkast/publisert), kilde og dato. Flere blokker i rekkefølge (Styrke · grunn → Kraft · overgang).
- **Ukevolum:** plan minutter, plan tonnasje, faktisk minutter per uke. Deload og testuke merket.
- **Økter:** Styrke, Kondisjon, Bevegelighet/skadeforebygging, med dag, tid og varighet. Øktene ligger også i ukeplanen som FYS og peker til blokken.
- **Øvelse:** navn, område (underkropp, overkropp, kjerne, kondisjon, bevegelighet, skadeforebygging), serier, reps, kg, RIR, hvile, tempo; for kondisjon varighet og sone/intensitet. Motorikk tvinges ikke inn for FYS.
- **Planlagt mot gjennomført:** sett × reps · kg per øvelse, tonnasje, minutter, RPE og dagsform. Manglende registrering «—» og «Delvis».
- **Handlinger:** Legg til fysisk blokk, Legg til øvelse, Kopier uke, Juster progresjon, Flytt økt, Lagre delvis, Lagre, Publiser til spiller (bekreft), Angre.
- **Dra:** desktop kan dra en fysisk økt mellom dager. Sett, reps og kg endres bare med stepper. Mobil: Flytt-ark. Turneringsdag gir konfliktark.
- **Spiller (PH-WB-FYS):** ser blokk og uke, registrerer sett/reps/kg med stepper, lagrer delvis eller fullfører. Endrer ikke coachens plan.

### Turneringsmodul
- **Årsplan/periode:** liste over turneringer i perioden med uke, dato, bane og type (Trenings-, Utviklings-, Prestasjonsturnering). Konflikter i programmet vises øverst (tre turneringer på tre uker, skoleprøve dagen før).
- **Turnering:** navn, datoer, bane, tee, antall runder, turneringsuke, kilde (GolfBox eller manuell) og status.
- **Forberedelse:** dag for dag i turneringsuka: trening, innspillsrunde, treningsrunde, reise, utstyr, ernæring, søvn/restitusjon, lettere FYS. Hvert punkt kan være synlig eller skjult for spiller.
- **Turneringsdager:** runde 1–4 med dag, tee-tid, start og rutine.
- **Mål og strategi:** prosessmål, resultatmål (brutto), strategi, lenke til gameplan (PH-20, eksempeldata).
- **Etter turnering:** runder med brutto score og til par, SG der det finnes («—» ellers), kilde og dato per runde (GolfBox, manuell, annen app), plassering, coachens evaluering, «Lag tiltak».
- **Handlinger:** Legg til turnering (fra terminliste eller manuelt), Velg turnering, Legg inn forberedelse, Flytt, Lagre delvis, Lagre, Publiser plan (bekreft), Trekk tilbake (bekreft), Angre.
- **Dra:** desktop drar forberedelse mellom dager; turneringsdager er ugyldige mål. Treningsrunde tre dager før eller forberedelse på reisedag gir konfliktark. Mobil: Flytt-ark.
- **Spiller (PH-WB-TURN):** forberedelse dag for dag med egen avkrysning, mål og strategi, etter-turnering med brutto per runde, kilde og notat, lagre delvis eller send til coach.

### Datakontrakter
- `PhysicalBlock { id, playerId|groupId, name, goal, weeks: number[], deloadWeek?, testWeek?, status: "utkast"|"publisert", createdBy, createdAt }`
- `PhysicalWeek { blockId, week, plannedMin, plannedTonnage, doneMin|null, doneTonnage|null, tag?: "deload"|"test" }`
- `PhysicalSession { id, blockId, date, time, kind: "styrke"|"kondisjon"|"bevegelighet", minutes, workbenchSessionId }` — samme økt som FYS i `WorkbenchSession`.
- `PhysicalExercise { id, sessionId, name, area, sets?, reps?, kg?, rir?, rest?, tempo?, durationMin?, zone? }`
- `PhysicalLog { exerciseId, sets|null, reps|null, kg|null, minutes|null, rpe?, form?, status: "delvis"|"fullført", loggedAt }`
- `Tournament { id, name, type: "trening"|"utvikling"|"prestasjon", startDate, endDate, course, tee?, rounds, source: "golfbox"|"manuell"|"wagr"|"datagolf", sourceDate, status }`
- `TournamentPrep { id, tournamentId, date, kind: "trening"|"innspillsrunde"|"treningsrunde"|"reise"|"utstyr"|"ernæring"|"søvn"|"fys", text, minutes?, visibleToPlayer: boolean }`
- `TournamentRound { tournamentId, round, date, teeTime?, start?, gross|null, par, sg: {ott,app,arg,putt,total}|null, source, sourceDate }`
- `TournamentGoals { tournamentId, process: string[], result?, strategy? }` og `TournamentEvaluation { tournamentId, place?, coachNote?, playerNote?, status }`
- Konflikt fra `moveSession` utvides med `kind: "turnering"` og `"skole"`.

### Kalender (AG-05)
Turneringsdager og reise vises som lag «Turnering» i coachkalenderen. Flytting av fysisk økt eller forberedelse inn på turneringsdag gir samme konfliktark som i Workbench.

### Audit 27.09.2026
Målrettet, 390/768/1024/1280/1440, data/tom/laster/feil:
- PlayerHQ PH-01, PH-03, PH-10, PH-11, PH-WB-FYS, PH-WB-TURN × lyst/natt = 240 tilfeller, 0 avvik.
- AgencyOS AG-05, AG-11, AG-A04, AG-A06, AG-WB-FYS, AG-WB-TURN = 120 tilfeller. Første kjøring fant 8 klippinger (dagkolonner for smale på 768 og 1024 i begge nye skjermer). Rettet: 7 kolonner bare fra 1280, ellers kolonner som bryter linje. Andre kjøring 0 avvik.
- Sjekket: horisontal rulling og klipping, høyst én rust, hurtigknapp bare i AgencyOS. Tilbake (BackBar til AG-11/PH-10), Avbryt, Lagre delvis, Lagre og Publiser finnes i begge coachskjermer; Lagre delvis og Fullfør/Send i spillerskjermene.
- **Ikke automatisk verifisert:** dra over / slipp / ugyldig mål, ConflictSheet, UndoToast, stepper-interaksjon, sticky ActionBar på mobil over toast, delvis-tilstand utover de registrerte dataene. Kontrollert for hånd i katalogen, ikke regnet som godkjent.

### Produktspørsmål
1. Skal fysisk plan kunne gis til en hel gruppe med individuelle kg (prosent av 1RM), eller bare felles program? Anbefalt: felles program, individuelle kg per spiller.
2. Skal spilleren selv kunne legge til egne turneringer, eller bare coach? Anbefalt: spilleren kan foreslå, coach godkjenner.
3. Skal forelder se turneringsplanen (reise, ernæring, søvn)? Anbefalt: ja, lesetilgang for spillere under 18.

## 12. Runde-registrering for Strokes Gained 27.09.2026

Full spesifikasjon: `overlevering/round-sg-registration-2026-09-27.md`.

**Datakrav (kort):**
- Runde: spiller, bane, dato, turnering/trening, 9/18 og spilte hull, start-hull, tee-mal, status (kladd/delvis/komplett/importert/manuell SG), brutto, notat, kilde (live/etterregistrering/UpGame CSV/annen app/manuell), kildedato, datakvalitet (total/hullscore/hullscore+detaljer/slag komplett/manuell SG), SG-opprinnelse og lås, lokal kladd.
- Hull: nr, par, lengde (m), brutto, putter, FW (par 4/5), GIR, straff, første putt (ft), bunker/sand save/scrambling.
- Slag (posisjonskjede): hull, par, slagnr, start-lie og -avstand (avledet), resultat (lie + avstand eller i hull), straff (ikke på hole-out), kølle, vind, mental 1–5, notat, sikte- og flaggavstand, utfallskategori (9 verdier), GPS valgfritt.
- Putt (start på green): lengde i fot, break, helling, linjemiss, fart.
- SG manuell/import: totalt, OTT, APP, ARG, PUTT + 16 detaljfelt. Total = sum av fire når alle finnes. Detaljer summeres ikke.

**Skjermer:** PH-RD-01 Velg nivå · 02 Oppsett · 03 Live runde (natt) · 04 Slag-for-slag (natt) · 05 SG hittil (natt) · 06 Etterregistrering · 07 Import · 08 Runde ferdig · 09 Rediger · AG-RD-01 Rundeanalyse · AG-RD-02 Manglende SG-grunnlag.

**Byggerekkefølge:**
1. Datamodell og kontrakt: status, kilde, kildedato, datakvalitet, delvis lagring, import-metadata, SG-opprinnelse og beskyttelse av manuell SG.
2. Én registreringsflyt (PH-RD-01 → 08, med 06/07 som alternativ og 09 for redigering) oppå `RundeNyForm`, `ManuellSgFelt`, `logRoundManual` og `src/lib/domain/sg.ts`.
3. Kjedevalidering på server; SG bare for komplette hull.
4. AG-RD-02, deretter AG-RD-01.

**DB-konsekvenser:** nye kolonner på `Round` (status, source, sourceDate, dataQuality, sgOrigin, sgLocked, importedAt, columnMap), utvidet `RoundHole`, `RoundShot` med alle slag- og puttfelt, `RoundSg` med hoved- og detaljfelt og lås, `RoundRevision`. Skjemaendring — Anders godkjenner før migrering.

**Audit 27.09.2026:** PH-RD-01–09 × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 360 tilfeller, 0 avvik. AG-RD-01–02 × 4 tilstander × 5 bredder = 40 tilfeller, 0 avvik. Totalt 400, 0 avvik. Sjekket: horisontal rulling og klipping (doc + main), høyst én rust (Live-pille på natt), hurtigknapp bare i AgencyOS.

**Rettet etter verifisering 27.09.2026:** avstands- og mental-stepperen i PH-RD-04 var 46–54 px. Ny `Stepper size="xl"` (56 px knapper, `--hit-outdoor`), vind-segment `lg` og straff-bryter med 56 px rad. Andre verifisering fant Mer-arket under 56 px (lukk 44, felt 42, vind 50). Natt-tema (= ute) gir nå 56 px på alle kontroller: felt, select, segment, ikonknapper, ark- og dialog-lukk, knapper og valgpiller. Målt i PH-RD-04 natt med Mer-arket åpent: ingen kontroller under 56 px.

**Ikke automatisk verifisert:** sticky ActionBar over toast/tastatur, kjedefeil («Kjeden stemmer ikke»), sperre for straff på hole-out, sumkontroll i SG-feltene, CSV-kolonnemapping med manglende kolonner, beskyttet manuell SG med bekreftelse, offline-lagring i PH-RD-08. Prøvd for hånd i katalogen, ikke regnet som godkjent.

## 13. Workbench fysisk plan + turnering — produksjonsklar 27.09.2026

Full spesifikasjon: `overlevering/workbench-fys-turnering-2026-09-27.md`. Bygger på §11 (første versjon).

**Skjermer:** AG-WB-FYS · AG-WB-TURN · PH-WB-FYS · PH-WB-TURN. Innganger endret: AG-11 (modulkort med status og neste handling), PH-10 (faner Økter · Fysisk · Turnering), PH-01 (neste fysiske økt og neste turnering), AG-05 (turneringslag med reise og skole + konfliktstripe), AG-A04 (fysisk og turnering i avvik), AG-A06 (tiltak til fysisk plan eller turneringsplan).

**Datamodell (delt demodata i `ui_kits/_shared/data-wb.js` + `data-wb2.js`):** fysiskBlokker, fysiskUker, fysiskOkter, fysiskOvelser, fysiskLogger, turneringer, turneringsForberedelser, turneringsRunder, turneringsMal, turneringsEvaluering, konflikter. Status for blokk: `kladd` · `delvis_lagret` · `publisert` · `endret_etter_publisering` (versjon publisert ≠ versjon i arbeid). Konflikttyper: `turnering`, `reise`, `skole`, `belastning`, `test_for_tett`.

**Byggerekkefølge:**
1. Skjema for fysisk plan og turnering (§11) + `publishedVersion`/`draftVersion` på blokk og turneringsplan. Anders godkjenner migrering.
2. AG-WB-FYS med spiller/gruppe, uke/blokk/sesong, økt- og øvelsesredigering, flytt med konflikt, publiser/trekk tilbake, inspektør (øvelser, belastning, respons, historikk).
3. PH-WB-FYS: logg sett/reps/kg, RPE og dagsform, lagre delvis, offline-kø.
4. AG-WB-TURN: terminliste + manuell, format, reisedager, forberedelse dag for dag med synlighet, flytt turnering (uke) og forberedelse (dag) med konflikt, publiser/trekk tilbake, evaluering → tiltak.
5. PH-WB-TURN: rundeplan, avkrysning, brutto per runde, egen evaluering, send til coach.
6. Innganger: AG-11, PH-10, PH-01, AG-05-lag, AG-A04, AG-A06.

**Kontroller:** tilbake (BackBar), én primær, lagre delvis, publiser med bekreftelse, trekk tilbake med bekreftelse, angre-toast på flytt/legg til/publiser/trekk. Dra bare på desktop med synlig slippsone, tom sone («—») og ugyldig mål (turneringsdag). Mobil: Flytt-ark. Sett/reps/kg bare med stepper.

**Audit 27.09.2026:** PlayerHQ PH-01, PH-10, PH-WB-FYS, PH-WB-TURN × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 160 tilfeller, 0 avvik. AgencyOS AG-05, AG-11, AG-A04, AG-A06, AG-WB-FYS, AG-WB-TURN × 4 tilstander × 5 bredder = 120 tilfeller, 0 avvik. Totalt 280, 0 avvik. Sjekket: sidelengs rulling og klipping, høyst én rust, hurtigknapp bare i AgencyOS.

**Ikke automatisk verifisert:** dra over / slipp / ugyldig mål på uke- og turneringslisten, ConflictSheet (reise, skole, turnering, uke med turnering), MoveSheet for turnering, angre-toast, bekreftelse ved publiser/trekk tilbake, sticky ActionBar over toast og tastatur på mobil, offline-kø, stepper-interaksjon, gruppemodus med individuelle kg. Prøvd for hånd i katalogen, ikke regnet som godkjent.


## 14. Teknisk plan og progresjon 27.09.2026

Full spesifikasjon: `overlevering/teknisk-plan-progresjon-2026-09-27.md`. AG-10 utvidet, tre nye skjermtyper: **AG-TP-01** Oppgaveskjema, **AG-TP-02** Før og nå per posisjon, **PH-TP-01** Teknisk plan (spiller, `/portal/tren/teknisk-plan/[planId]`, lenket fra PH-19). Delte deler i `ui_kits/_shared/tp-parts.jsx`, data i `data-tp.js`.

- Ingen regel sperrer noe: rep-mål, treffprotokoll og kvalitetssjekk viser status og låser aldri neste læringssteg (Anders 27.09.2026).
- AG-TP-02: **Krever tillegg i datamodellen: to daterte bilder per oppgave. I dag finnes ett bilde og én video.**
- Posisjonsnavn: ordmasteren §5 gjelder (`AK_VOCAB.P`), avklart av Anders 27.09.2026. Samme navn i PH-19, AG-10, AG-TP-01, AG-TP-02 og PH-TP-01.
- AK-formelen med flere læringssteg og miljøer: viser steget spilleren er på og hovedmiljøet (avklart av Anders 27.09.2026).
- Ikke tegnet: milepæler mot måldato, mellomposisjoner, ballbane ovenfra.

**Audit:** 144 tilfeller, 0 avvik (AG-10, AG-TP-01, AG-TP-02, AG-WB-TURN, PH-TP-01, PH-19). AG-WB-TURN alene: 20 tilfeller (4 tilstander × 5 bredder), 0 avvik.

**Ikke automatisk verifisert:** dra på delelinjen med mus/finger, piltaster på delelinjen, sticky AK-formel i arket, Stepper xl + «+10/+25» med hansker, kvalitetssjekk-arket i natt.


## 15. Fra testresultat til øvelse i økt · puttebånd 6 (27.09.2026)

Full spesifikasjon: `overlevering/test-til-okt-2026-09-27.md`.

- **AG-15** fikk fanen «Testdetalj» (standardfane): historikk for samme test (dato, verdi, kilde, testforhold; avvikende forhold merkes «Utenfor trenden» og holdes utenfor), testsignal i én setning med periode og antall (under 3 gyldige: «For lite grunnlag», ingen kurve), coachens tre valg med lik vekt (UndoToast), forslag fra øvelsesbanken med «Hvorfor» og kilde, «Legg i økt» → velg økt → utkast i Workbench → «Åpne økten». «Vurder teknisk oppgave» åpner AG-TP-01 med posisjon og område tomme.
- **PH-A07** viser samme historikk og testsignal, coachens valg som status («Anders vurderer planen» · «Ingen endring nå») og «Gjennomfør test på nytt». Spilleren legger ikke øvelser i økt herfra.
- **AG-11** viser kilde på øktkort: «Fra test · Putt 5–10 fot · 24.09» og «Fra teknisk oppgave · P4.0». Trykk åpner kilden.
- Tre merkelapper holdes fra hverandre: Test · måler (legges aldri i økt) · Øvelse i banken · Øvelse i økt · utkast (med mengde og AK-formel).
- Referanseverdi for nivå er ikke vedtatt: «—» og «Referanse ikke satt».
- **Puttebånd: seks**, 0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+ fot. 19 treningsområder. Rettet i `AK_VOCAB`, ordmasteren, AG-14, AG-TP-01, PH-26 putte-lab, PH-A05/PH-A01, SG-detaljfelt (PH-RD) og PH-14.

**Audit 27.09.2026:** 376 tilfeller, 0 avvik (AG-10, AG-11, AG-14, AG-15, AG-TP-01, AG-TP-02 × 4 tilstander × 5 bredder = 120; PH-TP-01, PH-A01, PH-A05, PH-A07, PH-14, PH-26, PH-RD-06, PH-RD-09 × 4 tilstander × lyst/natt × 4 bredder = 256).
