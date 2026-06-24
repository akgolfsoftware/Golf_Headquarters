# AK Golf HQ — Hybrid designsystem (Claude Design-syncbart)

Dette er det nye designsystemet som **ekte kilde**, strukturert slik at det kan dyttes opp til et Claude Design design-system-prosjekt via `/design-sync`. Når det er synket, designer du skjermer i Claude Design **oppå disse komponentene** — og eksporten lander nær rett i appen.

## Struktur
```
design-system/
├── tokens.css                     # kanoniske tokens (lys + .dark terminal). Lime låst.
├── components/<gruppe>/<navn>.html  # ett preview-kort per komponent, med @dsCard-markør
└── README.md
```

Hver `<navn>.html` starter med en markør som Claude Design bygger kort-indeksen fra:
`<!-- @dsCard group="Handling" -->`

Grupper følger komponent-spec-en: Fundament · Identitet · Tall/KPI · Kort · Hero · Data-viz · Notion-visninger · Gamification · Kalender · Tilstander · Coach.

## Slik synker du opp (når systemet er klart + claude.ai-tilgang gitt)
```
cd ~/Developer/akgolf-hq/design-system
claude
› /design-sync
```
Synker inkrementelt, én komponent om gangen — aldri «erstatt alt».

## Regler
- Bygg ALT fra `tokens.css` — ingen hardkodet hex.
- Lime #D1F843 kun som signatur (CTA, aktiv, puls, fokus) — aldri lime tekst på lime.
- Tall i `--mono`, norsk format. Ingen emoji — Lucide-ikoner. Norsk bokmål.
- Hver komponent skal ha alle tilstander der relevant: innhold · tom · laster · feil.

## Kilde for utseendet
`software/akgolf-hq/design-retninger/D-hybrid.html` (retning) + `E-komponent-lab.html` (interaktive komponenter) på Drive — disse er fasit for hvordan kortene skal se ut.
