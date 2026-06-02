// ============================================================
// WBStatusbar — ported 1:1 from v10 workbench-chrome.jsx
// ============================================================
import { Icon } from "./icon";
import { STATUSBAR_AXES } from "./data";

export function WBStatusbar() {
  return (
    <div className="wb-status">
      <span className="sb-key">UKE 22</span>
      <span className="sb-sep" />
      <span>
        <span className="sb-key">4</span> økter
      </span>
      <span className="sb-sep" />
      <span>
        <span className="sb-key">12,5 t</span> planlagt
      </span>
      <span className="sb-sep" />
      {STATUSBAR_AXES.map((a) => (
        <span className="ax-pill" key={a.lbl}>
          <span className={"d " + a.ax} />
          {a.lbl} {a.hrs}
        </span>
      ))}
      <span className="sb-sep" />
      <span>
        Balanse: <span className="warn">−3 pp SPILL</span>
      </span>
      <span className="pending">
        <Icon n="alert-circle" w={11} h={11} />3 endringer venter coach-godkjenning
      </span>
    </div>
  );
}
