# Typografi-skalaen — utledet fra Paper-fasiten (2026-08-14)

Kanonisk liste over tillatte fontstørrelser i AK Golf HQ. Utledet ved måling av
`designsystem/paper/` (fase1 + fase2, 752 filer, CRC-identisk med zip (3) per SYNC-STATUS.md) —
ikke fra eldre token-dokumenter. Per CLAUDE.md invariant 2 vinner Paper-fasiten ved konflikt.

## Korreksjon av premisset i AVVIKSRAPPORT-2026-08-13 §Rotårsak 4 (rapporten er slettet 17.08.2026 — git-historikk)

Rapporten målte «2 398 av 3 937 inline fontSize (61 %) utenfor token-skalaen» — mot den gamle
`--text-*`-lista i `globals.css` (11/12/13/14/16/18/20/24/30/36/48/60). Den lista er IKKE
Paper-skalaen. Målt mot fasitens faktiske bruk er fordelingen i appen nesten identisk med
fasitens:

| Topp 5 i fasiten | Topp 5 i appen (inline fontSize) |
|---|---|
| 10px (259) · 13px (224) · 12.5px (194) · 11px (165) · 15px (157) | 13 (729) · 12.5 (512) · 10 (482) · 12 (476) · 11 (433) |

13px og 12.5px «finnes ikke i skalaen» var altså feil skala — de er blant fasitens mest brukte
størrelser. **Reelt avvik mot fasit-skalaen: ~120 deklarasjoner (~2 %),** ikke 2 398.
Rotårsak 4s forslag (lint-vakt + rydding) står — men mot riktig liste, og jobben er liten.

## Kanonisk skala (px)

Halvsteg i UI-sonen, helsteg oppover, fri display-sone:

```
8.5  9  9.5  10  10.5  11  11.5  12  12.5  13  13.5  14  14.5  15  15.5
16  17  18  19  20  22  24  26  28  32  34  36  40
```

- **Display-sone:** verdier ≥ 44px er frie (marketing-heroer, wrapped-slides, 404-tall).
  Fasiten bruker selv 46 og 56 som engangs-display.
- Alle verdier < 44px som ikke står i lista er utenfor skala.
- Maskinlesbar kilde (den vakten leser): `scripts/typografi-skala.mjs`. Endres lista, endres
  den DER — dette dokumentet er forklaringen, ikke kilden.

## Ankerpunkter fra fasiten (monsterdokument §3)

- Body-base 13.5px (AgencyOS) / 14px (PlayerHQ) · `.prose` 14.5px/1.62 (Lora) · `.msg` 15px
- Topplinje-tittel 15px Poppins 600 · `--text-title` 22px · `--text-kpi` 40px mono
- Tabell-headere mono 10px versaler · `.eyebrow` 10px · `.tag` 10.5px · knapper 13px

## Kjente utenfor-skala-verdier i appen (målt 2026-08-14)

| Verdi | Treff | Merknad |
|---|---|---|
| 8px | ~52 | Under fasitens minste (8.5) — løftes til 8.5 eller 9 ved berøring |
| 30px | ~38 | Fasiten bruker 28 eller 32 — velg nærmeste ved berøring |
| 21px | ~10 | → 20 eller 22 |
| 7 / 7.5px | ~12 | Uleselig — løftes til 8.5+ |
| 29px | ~4 | → 28 |

Ryddes skjerm for skjerm når filene likevel berøres (samme regel som fontmigreringen i
CLAUDE.md §Stack) — vakten varsler, den blokkerer ikke.

## Vakten

- `scripts/check-typografi.mjs` — sjekker angitte filer (eller git-diff mot main) for inline
  `fontSize` utenfor skalaen. Warning-modus: exit 0, rapport til stdout.
- `.claude/hooks/kvalitet.mjs` — kjører samme sjekk på hver redigert `.tsx` under `src/` og
  melder treff tilbake som advarsel (blokkerer ikke, i motsetning til eslint-feil).
- Vippes til blokkerende først når restanse-tabellen over er tom.
