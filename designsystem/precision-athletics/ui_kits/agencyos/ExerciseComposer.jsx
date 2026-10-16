(() => {
const { ChoicePill, Stepper, Button, IconButton, AxisBadge } = window.AKGolfPrecisionAthletics_7d7c29;
const V = window.AK_VOCAB;
const AX = [["fys", "FYS"], ["tek", "TEK"], ["slag", "SLAG"], ["spill", "SPILL"], ["turn", "TURN"]];
const DUR = [10, 15, 20, 30, 45, 60, 90];
const DEF_MIN = { fys: 30, tek: 20, slag: 30, spill: 120, turn: 270 };
const fam = (area) => V.AREA_FAMILY[area];
const pRange = (set) => {
  const n = [...set].map((p) => +p.slice(1)).sort((a, b) => a - b);
  if (!n.length) return "";
  const contiguous = n.every((x, i) => i === 0 || x === n[i - 1] + 1);
  return contiguous && n.length > 1 ? "P" + n[0] + "–P" + n[n.length - 1] : n.map((x) => "P" + x).join(", ");
};
const code = (s) => s.toUpperCase().replace(/CA\. /g, "").replace(/ M$/, "").replace(/ FOT$/, "").replace(/[\s–]+/g, "");

function Group({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span className="kicker" style={{ whiteSpace: "nowrap", flex: "none" }}>{label}</span>{hint && <span style={{ font: "var(--type-meta)", color: "var(--text-faint)", whiteSpace: "nowrap", flex: "none" }}>{hint}</span>}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}
const Pills = ({ opts, value, onPick, mono, size }) => opts.map((o) => <ChoicePill key={o} mono={mono} size={size} selected={value === o} onClick={() => onPick(o)}>{o}</ChoicePill>);

function AreaPicker({ areas, value, onPick }) {
  const groups = [["Fullsving", V.AREAS.fullsving], ["Nærspill", V.AREAS.naerspill], ["Putting", V.AREAS.putting]].map(([l, a]) => [l, a.filter((x) => areas.includes(x))]).filter(([, a]) => a.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {groups.map(([l, a]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ width: 72, flex: "none", font: "500 12px/1 var(--font-sans)", color: "var(--text-muted)" }}>{l}</span>
          {a.map((x) => <ChoicePill key={x} selected={value === x} onClick={() => onPick(x)}>{x.replace("Innspill ca. ", "").replace("Putting ", "")}</ChoicePill>)}
        </div>
      ))}
    </div>
  );
}

function ExerciseComposer({ initialAxis = null, onAdd, onClose, context, keyboard, compact }) {
  const [axis, setAxisRaw] = React.useState(initialAxis);
  const [min, setMin] = React.useState(initialAxis ? DEF_MIN[initialAxis] : 30);
  const [f, setF] = React.useState({ area: "Innspill ca. 100 m", p: new Set(["P6.0", "P7.0"]), motor: "Lav hastighet", dim: "Lengdekontroll", sand: "Med ball", bel: "Treningsområde", press: "Alene", qty: 30, spread: 4, carry: 90, side: 4 });
  const [fys, setFys] = React.useState({ cat: "Styrke", sets: 4, reps: 6, kg: 60, rir: 2, zone: "S2", seg: 4, segMin: 4 });
  const [spill, setSpill] = React.useState({ dim: "Spilleformat", format: "9 hull", holes: 9, bel: "Bane", press: "Observert" });
  const up = (o) => setF((x) => ({ ...x, ...o }));
  const setAxis = (a) => { setAxisRaw(a); setMin(DEF_MIN[a]); if (a === "slag" && fam(f.area) === "fullsving" && !V.DIMENSIONS.innspill.includes(f.dim) && !V.DIMENSIONS.utslag.includes(f.dim)) up({ dim: V.dimsFor(f.area)[0] }); };
  const pickArea = (area) => { const d = V.dimsFor(area); up({ area, dim: d.includes(f.dim) ? f.dim : d[0], qty: fam(area) === "putting" ? 40 : 30, spread: area === "Utslag" ? 15 : area.includes("200") ? 10 : area.includes("150") ? 6 : area.includes("100") ? 4 : area.includes("50") ? 3 : 2, carry: area === "Utslag" ? 230 : +(area.match(/(\d+) m/) || [0, 0])[1] }); };
  const full = fam(f.area) === "fullsving", putt = fam(f.area) === "putting", unit = putt ? "putter" : "slag";

  const build = () => {
    if (axis === "tek" || axis === "slag") {
      const parts = [f.area];
      if (axis === "tek" && full && f.p.size) parts.push(pRange(f.p));
      if (full) parts.push(f.motor);
      const meta = [f.dim, f.area === "Bunker" ? f.sand : null, f.qty + " " + unit, axis === "slag" && !putt ? "±" + String(f.spread).replace(".", ",") + " m" : null, axis === "slag" && full ? "carry " + f.carry + " m · side ±" + f.side + " m" : null, f.bel, f.press].filter(Boolean).join(" · ");
      const formula = [axis.toUpperCase(), code(f.area), full ? V.MOTOR_CODE[f.motor] : null, code(f.bel), code(f.press)].filter(Boolean).join("_");
      return { title: parts.join(" · "), meta, formula };
    }
    if (axis === "fys") {
      if (fys.cat === "Styrke") return { title: "Styrke " + fys.sets + " × " + fys.reps + " @ " + String(fys.kg).replace(".", ",") + " kg", meta: "RIR " + fys.rir, formula: "FYS_STYRKE" };
      if (fys.cat === "Kondisjon") return { title: "Kondisjon · " + fys.seg + " × " + fys.segMin + " min · " + fys.zone, meta: "Intervall · pulssone " + fys.zone, formula: "FYS_KONDISJON_" + fys.zone };
      return { title: "Bevegelighet", meta: min + " min", formula: "FYS_BEVEGELIGHET" };
    }
    if (axis === "spill") return { title: "Banespill · " + (spill.dim === "Spilleformat" ? spill.format : "Strategioppgave"), meta: [spill.dim, spill.holes + " hull", spill.bel, spill.press].join(" · "), formula: ["SPILL", "BANESPILL", code(spill.bel), code(spill.press)].join("_") };
    return null;
  };
  const d = axis && axis !== "turn" ? build() : null;
  const fysMin = fys.cat === "Kondisjon" ? fys.seg * fys.segMin * 2 : null;
  const effMin = axis === "fys" && fysMin ? fysMin : min;
  const add = (over) => { if (!axis) return; const base = over || d; onAdd && onAdd({ axis, min: (over && over.min) || effMin, title: base.title, meta: base.meta, sessionName: base.sessionName || base.title.split(" · ")[0] }); };

  React.useEffect(() => {
    if (!keyboard) return;
    const h = (e) => {
      if (e.key >= "1" && e.key <= "5") { setAxis(AX[+e.key - 1][0]); e.preventDefault(); }
      else if (e.key === "Enter" && axis && axis !== "turn") { add(); e.preventDefault(); }
      else if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const pad = compact ? 20 : 24;
  const envGroups = (val, set) => (<>
    <Group label="Belastning" hint="MILJØ"><Pills opts={V.BELASTNING} value={val.bel} onPick={(v) => set({ bel: v })} /></Group>
    <Group label="Press"><Pills opts={V.PRESS} value={val.press} onPick={(v) => set({ press: v })} /></Group>
  </>);
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--surface-card)", borderRadius: "var(--radius-modal)", border: "1px solid var(--border-hairline)", boxShadow: compact ? "var(--shadow-raised)" : "var(--shadow-modal)", width: "100%", overflow: "hidden", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: pad + "px " + pad + "px 0" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{context || "Ny øvelse"}</div>
          <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)", marginTop: 4 }}>Legg til øvelse</div>
        </div>
        {onClose && <IconButton icon="x" label="Lukk" onClick={onClose} />}
      </div>

      <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 20, overflow: "auto" }}>
        <Group label="Pyramide" hint={keyboard ? "TAST 1–5" : null}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8, width: "100%" }}>
            {AX.map(([a, l], i) => <ChoicePill key={a} axis={a} size="lg" selected={axis === a} kbd={keyboard ? String(i + 1) : null} onClick={() => setAxis(a)} style={{ padding: 0 }}>{l}</ChoicePill>)}
          </div>
        </Group>

        {!axis && <div style={{ padding: "28px 0", textAlign: "center", font: "var(--type-body-s)", color: "var(--text-muted)", border: "1px dashed var(--border-strong)", borderRadius: 8 }}>Velg akse. Feltene tilpasser seg valget.</div>}

        {axis === "turn" && (
          <Group label="Turneringstype" hint="ETT TRYKK LEGGER TIL">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {V.TURN_TYPES.map(([t, sub]) => (
                <button key={t} onClick={() => add({ title: t, meta: "18 hull · brutto score", min: 270, sessionName: t })} className="pa-card pa-card--interactive" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: "14px 16px", textAlign: "left", font: "inherit", boxShadow: "inset 3px 0 0 var(--axis-turn)", minHeight: 64 }}>
                  <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", font: "600 16px/1.2 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{t}</span><span style={{ display: "block", font: "var(--type-body-s)", fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{sub}</span></span>
                  <span style={{ font: "var(--type-num-s)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>4:30 t</span>
                  <span className="pa-icon" style={{ width: 18, height: 18, background: "var(--text-primary)", WebkitMaskImage: "url(https://unpkg.com/lucide-static@0.544.0/icons/plus.svg)", maskImage: "url(https://unpkg.com/lucide-static@0.544.0/icons/plus.svg)" }} />
                </button>
              ))}
            </div>
            <span style={{ font: "var(--type-meta)", color: "var(--text-faint)", whiteSpace: "nowrap" }}>INGEN KØLLER · INGEN TRACKMAN · TO TRYKK</span>
          </Group>
        )}

        {(axis === "tek" || axis === "slag") && (<>
          <Group label="Område"><AreaPicker areas={axis === "tek" ? [...V.AREAS.fullsving, ...V.AREAS.naerspill, ...V.AREAS.putting] : [...V.AREAS.fullsving, ...V.AREAS.naerspill, ...V.AREAS.putting]} value={f.area} onPick={pickArea} /></Group>
          {axis === "tek" && full && (
            <Group label="P-posisjoner" hint="VELG FLERE">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 6, width: "100%" }}>
                {V.P.map(([p, name]) => <ChoicePill key={p} mono title={p + " · " + name} selected={f.p.has(p)} onClick={() => setF((x) => { const s = new Set(x.p); s.has(p) ? s.delete(p) : s.add(p); return { ...x, p: s }; })} style={{ padding: 0 }}>{p}</ChoicePill>)}
              </div>
            </Group>
          )}
          {full && <Group label="Motorikk" hint="KUN FULLSVING"><Pills size="lg" opts={V.MOTORIKK} value={f.motor} onPick={(v) => up({ motor: v })} /></Group>}
          <Group label="Teknisk dimensjon" hint="MAKS ETT FOKUS"><Pills opts={V.dimsFor(f.area)} value={f.dim} onPick={(v) => up({ dim: v })} /></Group>
          {f.area === "Bunker" && <Group label="Sandtrinn"><Pills opts={["Uten ball i sanden", "Med ball"]} value={f.sand} onPick={(v) => up({ sand: v })} /></Group>}
          <div style={{ display: "grid", gridTemplateColumns: axis === "slag" && full ? "repeat(4,minmax(0,1fr))" : axis === "slag" && !putt ? "repeat(2,minmax(0,1fr))" : "minmax(0,220px)", gap: 10 }}>
            <Stepper label={"Antall " + unit} value={f.qty} step={5} min={5} max={300} onChange={(v) => up({ qty: v })} />
            {axis === "slag" && !putt && <Stepper label="Spredningskrav" value={f.spread} step={f.spread < 3 ? 0.5 : 1} min={0.5} max={30} unit="m" format={(v) => "±" + String(v).replace(".", ",")} onChange={(v) => up({ spread: v })} />}
            {axis === "slag" && full && <Stepper label="Carry" value={f.carry} step={5} min={20} max={320} unit="m" onChange={(v) => up({ carry: v })} />}
            {axis === "slag" && full && <Stepper label="Sideavvik" value={f.side} min={1} max={30} unit="m" format={(v) => "±" + v} onChange={(v) => up({ side: v })} />}
          </div>
          {envGroups(f, up)}
        </>)}

        {axis === "fys" && (<>
          <Group label="Område"><Pills size="lg" opts={V.AREAS.fysisk} value={fys.cat} onPick={(s) => { setFys((x) => ({ ...x, cat: s })); setMin(s === "Styrke" ? 30 : 20); }} /></Group>
          {fys.cat === "Styrke" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
              <Stepper label="Serier" value={fys.sets} min={1} max={10} onChange={(v) => setFys((x) => ({ ...x, sets: v }))} />
              <Stepper label="Repetisjoner" value={fys.reps} min={1} max={30} onChange={(v) => setFys((x) => ({ ...x, reps: v }))} />
              <Stepper label="Vekt" value={fys.kg} step={2.5} min={0} max={300} unit="kg" format={(v) => String(v).replace(".", ",")} onChange={(v) => setFys((x) => ({ ...x, kg: v }))} />
              <Stepper label="RIR" value={fys.rir} min={0} max={4} onChange={(v) => setFys((x) => ({ ...x, rir: v }))} />
            </div>
          )}
          {fys.cat === "Kondisjon" && (<>
            <Group label="Pulssone"><Pills mono size="lg" opts={["S1", "S2", "S3", "S4", "S5"]} value={fys.zone} onPick={(z) => setFys((x) => ({ ...x, zone: z }))} /></Group>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, maxWidth: 440 }}>
              <Stepper label="Intervallsegmenter" value={fys.seg} min={1} max={20} onChange={(v) => setFys((x) => ({ ...x, seg: v }))} />
              <Stepper label="Tid per segment" value={fys.segMin} min={1} max={30} unit="min" onChange={(v) => setFys((x) => ({ ...x, segMin: v }))} />
            </div>
          </>)}
        </>)}

        {axis === "spill" && (<>
          <Group label="Teknisk dimensjon" hint="BANESPILL"><Pills size="lg" opts={V.DIMENSIONS.banespill} value={spill.dim} onPick={(v) => setSpill((x) => ({ ...x, dim: v }))} /></Group>
          {spill.dim === "Spilleformat" && <Group label="Spilleformat"><Pills size="lg" opts={["9 hull", "18 hull", "Tiger 5 analyse"]} value={spill.format} onPick={(v) => { setSpill((x) => ({ ...x, format: v, holes: v === "18 hull" ? 18 : 9 })); setMin(v === "18 hull" ? 270 : v === "9 hull" ? 120 : 60); }} /></Group>}
          <div style={{ maxWidth: 220 }}><Stepper label="Antall hull" value={spill.holes} min={1} max={18} onChange={(v) => setSpill((x) => ({ ...x, holes: v }))} /></div>
          {envGroups(spill, (o) => setSpill((x) => ({ ...x, ...o })))}
        </>)}

        {axis && axis !== "turn" && !(axis === "fys" && fys.cat === "Kondisjon") && (
          <Group label={axis === "fys" && fys.cat === "Bevegelighet" ? "Minutter" : "Varighet"}>
            {DUR.map((m) => <ChoicePill key={m} mono selected={min === m} onClick={() => setMin(m)} style={{ minWidth: 56 }}>{m}</ChoicePill>)}
            {!DUR.includes(min) && <ChoicePill mono selected>{min}</ChoicePill>}
            <span style={{ alignSelf: "center", font: "var(--type-meta)", color: "var(--text-faint)" }}>MIN</span>
          </Group>
        )}
      </div>

      {d && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px " + pad + "px", borderTop: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }}>
          <AxisBadge axis={axis} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "600 14px/1.25 var(--font-sans)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
            <div style={{ font: "var(--type-meta)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.formula}>{d.formula}</div>
          </div>
          <Button size="lg" icon="plus" onClick={() => add()} style={{ flexShrink: 0 }}>{"Legg til · " + (window.PM ? window.PM.fmtHM(effMin) : effMin)}</Button>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { ExerciseComposer, DrillComposer: ExerciseComposer });
})();
