// ============================================================
// KanbanView — ported 1:1 from v10 workbench-views.jsx (KanbanView).
// 5 pyramide-axis columns (FYS/TEK/SLAG/SPILL/TURN) with session
// cards + "+ Slipp her" drop-zone hint per column.
//
// W5b: `cols` is optional. Real Prisma kanban-columns are passed via
// props; absent → v10 demo (KANBAN_COLS).
// ============================================================
import { KANBAN_COLS, type Axis } from "./data";

type KanbanCol = {
  key: Axis;
  lbl: string;
  ct: number;
  cards: { day: string; nm: string; meta: string }[];
};

export function KanbanView({ cols }: { cols?: KanbanCol[] } = {}) {
  const columns = cols ?? KANBAN_COLS;
  return (
    <section className="kanban">
      {columns.map((c) => (
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
