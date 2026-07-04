import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — DeltakerListe
 * Deltakerliste for gruppeøkt/Live Session. Rad: avatar + navn + oppmøtestatus.
 * Status via ord + prikk (aldri bare farge). Tomt = «ingen deltakere ennå».
 */
const CSS = `
.ak-dl{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;}
.ak-dl__row{display:flex;align-items:center;gap:11px;padding:10px 14px;}
.ak-dl__row + .ak-dl__row{border-top:1px solid var(--border);}
.ak-dl__av{width:32px;height:32px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:700;font-size:11px;background:var(--surface-2);color:var(--text-2);border:1px solid var(--border);}
.ak-dl__navn{flex:1;font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;color:var(--text);}
.ak-dl__st{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;}
.ak-dl__dot{width:7px;height:7px;border-radius:9999px;flex:none;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-dl-css")) {
  const s = document.createElement("style"); s.id = "ak-dl-css"; s.textContent = CSS; document.head.appendChild(s);
}
const ST = {
  tilstede:  { c: "var(--up)",           t: "Til stede" },
  invitert:  { c: "var(--text-muted)",   t: "Invitert" },
  avslatt:   { c: "var(--down)",         t: "Avslått" },
  kanskje:   { c: "var(--warn, var(--text-muted))", t: "Kanskje" },
};

export function DeltakerListe({ deltakere = [], loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={140} className={className} style={style} />;
  if (!deltakere.length) {
    return (
      <div className={className} role="status" style={{ padding: "22px 16px", textAlign: "center", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)", background: "var(--surface)", ...style }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)" }}>Ingen deltakere ennå — inviter spillere til økta.</span>
      </div>
    );
  }
  return (
    <div className={`ak-dl ${className}`} style={style} role="list" aria-label="Deltakere">
      {deltakere.map((d, i) => {
        const S = ST[d.status] || ST.invitert;
        const ini = d.initialer || (d.navn ? d.navn.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");
        return (
          <div key={i} className="ak-dl__row" role="listitem">
            <span className="ak-dl__av">{ini}</span>
            <span className="ak-dl__navn">{d.navn}</span>
            <span className="ak-dl__st" style={{ color: S.c }}><span className="ak-dl__dot" style={{ background: S.c }} />{S.t}</span>
          </div>
        );
      })}
    </div>
  );
}
