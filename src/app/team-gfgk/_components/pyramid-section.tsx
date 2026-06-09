"use client";

import { useState } from "react";

interface Layer {
  id: string;
  name: string;
  title: string;
  tier: string;
  color: string;
  labelDark: boolean;
  desc: string;
  ex: string;
}

const layers: Layer[] = [
  {
    id: "fys",
    name: "FYS",
    title: "Fysisk grunnlag",
    tier: "Nederste lag · bredest",
    color: "var(--pyr-fys)",
    labelDark: false,
    desc: "Allsidighet, motorikk, bevegelighet og fysisk kapasitet. Grunnmuren alt annet hviler på.",
    ex: "Koordinasjon · styrke tilpasset alder · skadeforebygging · god bevegelseskvalitet.",
  },
  {
    id: "tek",
    name: "TEK",
    title: "Teknikk",
    tier: "Andre lag",
    color: "var(--pyr-tek)",
    labelDark: false,
    desc: "Solid, repeterbar svingteknikk og godt grunnlag i alle slagtyper. Teknikken som tåler press senere.",
    ex: "Grep, oppsett og sving · putting- og chip-teknikk · ballkontakt · konsistens i grunnslagene.",
  },
  {
    id: "slag",
    name: "SLAG",
    title: "Slagkvalitet",
    tier: "Midtre lag",
    color: "var(--pyr-slag)",
    labelDark: false,
    desc: "Ballflukt, avstandskontroll og kvalitet på det enkelte slaget — å treffe det du sikter på.",
    ex: "Avstandskontroll · ballflukt og kurve · spinn og landing · presisjon mot flagg.",
  },
  {
    id: "spill",
    name: "SPILL",
    title: "Spill på banen",
    tier: "Fjerde lag",
    color: "var(--pyr-spill)",
    labelDark: true,
    desc: "Å sette slagene sammen til lave scorer: banestrategi, valg og temperatur gjennom 18 hull.",
    ex: "Course management · valg av kølle og mål · scoring · spill under varierende forhold.",
  },
  {
    id: "turn",
    name: "TURN",
    title: "Turnering",
    tier: "Øverste lag · smalest",
    color: "var(--pyr-turn)",
    labelDark: false,
    desc: "Konkurranse: rutiner, nerver og prestasjon når det gjelder. Toppen — som krever alt under seg.",
    ex: "Konkurranserutiner · mental ro · turneringsplan · prestere på dagen det teller.",
  },
];

const geom: Record<string, string> = {
  turn: "50,0 60,20 40,20",
  spill: "40,20 60,20 70,40 30,40",
  slag: "30,40 70,40 80,60 20,60",
  tek: "20,60 80,60 90,80 10,80",
  fys: "10,80 90,80 100,100 0,100",
};
const labelPos: Record<string, [number, number]> = {
  turn: [50, 11],
  spill: [50, 30],
  slag: [50, 50],
  tek: [50, 70],
  fys: [50, 90],
};
// render top→bottom, animate bottom-up
const order = ["turn", "spill", "slag", "tek", "fys"];
const byId = Object.fromEntries(layers.map((l) => [l.id, l]));

export function PyramidSection() {
  const [selId, setSelId] = useState("fys");
  const [dim, setDim] = useState(false);
  const sel = byId[selId];

  return (
    <div
      className="cols-split reveal d3"
      style={{ alignItems: "center", marginTop: 8 }}
    >
      <div className="pyr-stage">
        <svg
          className={`pyr-svg${dim ? " pyr-dim" : ""}`}
          viewBox="-2 -2 104 104"
          role="img"
          aria-label="Utviklingspyramide med fem lag"
        >
          {order.map((id) => {
            const l = byId[id];
            const animI = order.length - 1 - order.indexOf(id);
            return (
              <g
                key={id}
                className={`pyr-band${id === selId ? " sel" : ""}`}
                data-i={animI}
                onClick={() => {
                  setSelId(id);
                  setDim(true);
                }}
              >
                <polygon points={geom[id]} fill={l.color} />
                <text
                  className={`pyr-label${l.labelDark ? " dark" : ""}`}
                  x={labelPos[id][0]}
                  y={labelPos[id][1]}
                  textAnchor="middle"
                >
                  {l.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="card card-xl pyr-detail" style={{ minHeight: 300 }}>
        <div className="pyr-meta">
          <span className="swatch" style={{ background: sel.color }} />
          <span>{sel.tier}</span>
        </div>
        <h3 className="display d-3" style={{ marginTop: 14 }}>
          {sel.title}
        </h3>
        <p className="body muted" style={{ marginTop: 14 }}>
          {sel.desc}
        </p>
        <hr className="divider" style={{ margin: "20px 0" }} />
        <p className="eyebrow" style={{ marginBottom: 12 }}>
          Hva vi jobber med
        </p>
        <p className="body" style={{ color: "var(--foreground)" }}>
          {sel.ex}
        </p>
        <p
          className="pyr-hint"
          style={{ marginTop: "auto", paddingTop: 20 }}
        >
          Klikk et lag i pyramiden →
        </p>
      </div>
    </div>
  );
}
