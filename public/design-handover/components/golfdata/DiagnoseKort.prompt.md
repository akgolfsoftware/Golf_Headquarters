# DiagnoseKort

Analytikerkjeden i ett kort: **Symptom → Bevis → Resept**. Symptomet er dommen i klarspråk, beviset er mini-viz mot navngitt baseline med datagrunnlag alltid synlig, resepten peker på AK-formel-aksen og slutter i «Planlegg dette».

## Bruk
```jsx
<DiagnoseKort
  symptom="Mister 0,8 slag på innspill 100–150 m"
  bevis={{ enhet: "%", spiller: { label: "Deg", verdi: 52 }, baseline: { label: "Kat. A-snitt", verdi: 68 } }}
  grunnlag="14 runder · 62 innspill"
  resept={{ akse: "SLAG", kode: "M2", tekst: "Kravtrening på innspill 100–150 m — tre økter per uke i tre uker." }}
  onPlanlegg={aapneWorkbench}
/>
```

## Domenefasit
- Kjede-rail (dot + strek) binder de tre stegene — dette ER fortellermønsteret score→forklaring→handling, komprimert.
- Bevis: spiller-bar = `--down`-tint (symptom-kontekst), baseline-bar = nøytral referanse. Verdier i mono m/ enhet.
- **Datagrunnlag alltid synlig** — mangler `grunnlag`, rendres «Datagrunnlag mangler — diagnosen er usikker» (ærlig, aldri skjult).
- Resept-chip: pyramide-akse (KANONISK 5) via `--axis-*-soft`/`--axis-*-text` — aldri lime-tekst på lys. Valgfri `kode` (M-arena/CS-nivå).
- CTA «Planlegg dette» = signal-pill 44px (anbefalingskontrakten: handling er primær).

## Progressiv dybde (én kodevei)
`nivaa` gater lag via `NIVA[nivaa]` (NesteFokusKort-mønsteret): **nybegynner** = symptom + resept + CTA · **ovet** = + bevis-viz · **elite** = + fagkode-chip (koder kun i coach-/elite-flater). Datagrunnlaget vises på ALLE nivåer.

## Tilstander
`loading` (skeleton-linjer) · `tomt`/mangler symptom (onboarding: «Ingen diagnose ennå») · normal.

## Komponerer
Åpnes typisk fra `SlagLekkasjeKart.onVelgBaand` (kartet = hvor, dette = hvorfor + hva). `onPlanlegg` → Workbench/økt-komposer.
