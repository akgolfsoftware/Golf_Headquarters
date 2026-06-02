// ============================================================
// KanbanView — ported 1:1 from v10 workbench-views.jsx (KanbanView).
// 5 pyramide-axis columns (FYS/TEK/SLAG/SPILL/TURN) with session
// cards + "+ Slipp her" drop-zone hint per column.
// ============================================================
import { KANBAN_COLS } from "./data";

export function KanbanView() {
  return (
    <section className="kanban">
      {KANBAN_COLS.map((c) => (
        <div className={"kb-col " + c.key} key={c.key}>
          <div className="kb-head">
            <span className={"ax " + c.key} />
            <span className="lbl">{c.lbl}</span>
            <span className="ct">{c.ct} økter</span>
          </div>
          <div className="kb-body">
            {c.cards.map((card, i) => (
              <div className={"kb-card " + c.key} key={i}>
                <div className="day">{card.day}</div>
                <div className="nm">{card.nm}</div>
                <div className="meta">{card.meta}</div>
              </div>
            ))}
            <div className="kb-add">+ Slipp her</div>
          </div>
        </div>
      ))}
    </section>
  );
}
