# Design-språk & tokens — eksakte verdier (hybrid)

> Hentet direkte fra den valgte hybrid-mockupen (`D-hybrid.html`). Bygg på disse eksakte verdiene — ikke gjett, ikke «nesten». Lime er låst; resten er den valgte retningen.

## Farger — Editorial lys (PlayerHQ, Forelder, Marketing, galleri-grunn)
| Token | HEX | Bruk |
|---|---|---|
| `--cream` | `#FAFAF7` | Sidebakgrunn (varm, aldri ren hvit) |
| `--cream-2` | `#F4F2EB` | Sekundær flate |
| `--sand` | `#F1EEE5` | Chips, soner |
| `--sand-deep` | `#E8E4D8` | Dypere sand |
| `--paper` | `#FFFFFF` | Kort-bakgrunn |
| `--border` | `#E5E3DD` | 1px kant |
| `--border-soft` | `#EDEBE4` | Hairline / svak deler |
| `--ink` | `#0A1F17` | Primær tekst |
| `--muted` | `#5E5C57` | Sekundær tekst |
| `--muted-2` | `#8A877F` | Tertiær tekst |

## Forest-akse (delt mellom uttrykk)
`--forest #005840` · `--forest-deep #00402F`

## LÅST signal-farge (begge uttrykk)
`--lime #D1F843` · `--lime-deep #B9E022` · `--lime-dim #A9CF2E`
Bruk: primær-CTA, aktiv tilstand, KPI-puls, fokus, positiv delta. Krydder — aldri store flate felt, aldri lime tekst på lime (mørk tekst på lime).

## Status
`--ok/--up #1A7D56` · `--warn #B8852A` · `--urgent/--down #A32D2D` · `--info #2563EB`

## Farger — Terminal mørk (AgencyOS + galleri-mørk)
| Token | HEX | Bruk |
|---|---|---|
| `--t-bg` | `#07100C` | Dypeste bakgrunn |
| `--t-bg-1` | `#0A1410` | Rail/header |
| `--t-bg-2` | `#0D1A14` | Flate |
| `--t-bg-3` | `#11221A` | Kort |
| `--t-bg-4` | `#16291F` | Hevet |
| `--t-line` | `#1C2C23` | Kant |
| `--t-line-2` | `#243A2E` | Sterkere kant |
| `--t-line-soft` | `rgba(180,225,195,.035)` | **Bakgrunns-rutenett = knapt synlig** |
| `--t-fg` | `#EAF2EC` | Tekst |
| `--t-fg-2` | `#9DB0A4` | Sekundær |
| `--t-fg-3` | `#5E726A` | Tertiær |
| `--t-up #4FD08A` (bg `rgba(79,208,138,.10)`) · `--t-down #F0683E` (bg `rgba(240,104,62,.10)`) · `--t-warn #E8B43C` · `--t-info #5AA9F0` |
| `--lime-bg rgba(209,248,67,.10)` · `--lime-bg-2 rgba(209,248,67,.16)` | lime-flater i mørkt |

## Pyramide-akser (mode-invariant, bunn→topp)
`pyr-fys #005840` → `pyr-tek #B8852A` → `pyr-slag #2563EB` → `pyr-spill #D1F843` → `pyr-turn #A32D2D`. Rendres ALLTID Fysisk → Teknisk → Golfslag → Spill → Turnering.

## Radius
`--r-sm 8px` · `--r-md 14px` · `--r-lg 20px` · `--r-xl 28px` · `--r-full 999px`

## Skygger
`--sh-sm 0 1px 2px rgba(10,31,23,.05)` · `--sh-md 0 4px 16px -4px rgba(10,31,23,.08)` · `--sh-lg 0 18px 48px -12px rgba(10,31,23,.18)` · `--sh-forest 0 14px 40px -12px rgba(0,88,64,.45)`

## Typografi
- `--sans 'Inter'` — UI, brødtekst.
- `--disp 'Inter Tight'` — display/hero + editorial italic (`<em>` i overskrift = `--forest`/lime-aksent).
- `--mono 'JetBrains Mono'` — ALLE tall, eyebrows, KPI-labels. Alltid `font-variant-numeric: tabular-nums`.

## Bevegelse
150–250 ms, ease-out inn. Progresjon animeres (fyller seg, teller opp). Skeleton-puls, aldri spinner. Aldri >400 ms utenom hero-reveal. Respekter `prefers-reduced-motion`.

## Tall & casing (norsk)
Komma-desimal `48,3` · mellomrom-tusenskille `1 240 m` · prosent etter mellomrom `48 %` · 24t `14:30`. Overskrifter: setningsstart. Eyebrows/KPI-labels: MONO CAPS.

## Bakgrunns-tekstur
Lys: subtile radial-gradienter (forest 6 % øvre-høyre, lime 10 % øvre-venstre) over cream. Mørk: bakgrunns-rutenett kun som et hint (`--t-line-soft`), hairlines bærer strukturen.
