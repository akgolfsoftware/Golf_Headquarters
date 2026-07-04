# DataPreview

Delt hover/scrubber-primitiv. Ett kort for hele systemet: verdien for punktet under pekeren, i JetBrains Mono, med kort label og valgfri delta. Erstatter de bespoke `__tip`-divene komponentene hadde hver for seg.

## Rolle
- **Presentasjonelt.** Forelderen eier hover-geometrien (chart-koordinater, nærmeste punkt, hvilken økt) og posisjonerer kortet via `x`/`y` inne i en `position:relative`-boks. Kortet eier bare utseende + inn/ut-bevegelse.
- **Kanon:** verdi i mono, delta i `--up`/`--down` (tema-aware — aldri lime på lys). Motion 120–320 ms, `prefers-reduced-motion` respektert, ingen dekorativ loop.

## Moduser
1. **Enkeltverdi** — `label` + `value` (+ `unit`, `delta`).
2. **Flerrad** — `rows={[{color,label,value}]}` for SG-akser, AK-formel-sammendrag i kalender, m.m.

## Bruk — scrubber på tidsserie
```jsx
const [scrub, setScrub] = React.useState(null);
const ref = React.useRef(null);
// i <svg onMouseMove>:
const i = nearestIndex(e.clientX, ref.current.getBoundingClientRect(), pts.length);
setScrub(i);
// …
<div style={{ position: "relative" }}>
  <svg ref={ref} onMouseMove={onMove} onMouseLeave={() => setScrub(null)}>…</svg>
  <DataPreview
    visible={scrub != null}
    x={`${(scrub ?? 0) / (pts.length - 1) * 100}%`} y={0}
    label={pts[scrub]?.label} value={fmt(pts[scrub]?.v)} delta={pts[scrub]?.d}
  />
</div>
```

## Bruk — økt i kalender (AK-formel-sammendrag)
```jsx
<DataPreview visible={hover!=null} x={hx} y={hy} placement="top"
  label={okt.title}
  rows={[
    { color: AX[okt.area], label: okt.area, value: okt.csNivaa },
    { label: "Arena", value: arenaNavn(okt.miljo) },
    { label: "Trinn", value: trinnNavn(okt.lFase) },
  ]} />
```

## Props
Se `DataPreview.d.ts`. Kort: `visible`, `x`, `y`, `placement` (top/bottom/left/right), `label`, `value`, `unit`, `delta` (tall ⇒ fortegn utleder retning), `deltaDir`, `rows`, `note`, `accent`.

## Hjelper
`nearestIndex(clientX, rect, count, xFrac?)` — nærmeste punktindeks for scrubbere. `xFrac(i)→0..1` for ujevnt fordelte punkter; utelates ved jevn fordeling.

## Ikke
- Ikke la kortet eie hover-deteksjon — geometrien bor i grafen.
- Ikke montér/avmontér for hver bevegelse hvis du vil ha fade-ut; hold montert og toggle `visible`.
- Ikke bruk lime på delta i lys flate — `--up`/`--down` gjør dette riktig automatisk.
