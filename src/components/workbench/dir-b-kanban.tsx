// ============================================================
// DirBKanbanBody — ported 1:1 from v10 workbench-dir-b.jsx
// (DirBKanbanBody). B-styled kanban: sticky pyramide-strip on top,
// then 5 axis columns with denser cards (grip + day + title + meta)
// and a dashed "Ny økt" add-button per column. No slide-over.
// ============================================================
import { Icon } from "./icon";
import { DIRB_KANBAN_COLS } from "./data";
import { DirBPyramideStrip } from "./dir-b-tidslinje";

export function DirBKanbanBody() {
  return (
    <>
      <DirBPyramideStrip />
      <section className="wbb-kanban">
        {DIRB_KANBAN_COLS.map((c) => (
          <div className={"wbb-kb-col " + c.key} key={c.key}>
            <div className="wbb-kb-head">
              <span className={"ax-dot " + c.key} />
              <span className="lbl">{c.lbl}</span>
              <span className="ct">{c.ct}</span>
            </div>
            <div className="wbb-kb-body">
              {c.cards.map((card, i) => (
                <div className={"wbb-kb-card" + (card.selected ? " is-selected" : "")} key={i}>
                  <Icon n="grip-vertical" w={10} h={10} />
                  <div className="card-body">
                    <div className="day">{card.day}</div>
                    <div className="nm">{card.nm}</div>
                    <div className="meta">{card.meta}</div>
                  </div>
                </div>
              ))}
              <button type="button" className="wbb-kb-add">
                <Icon n="plus" w={11} h={11} />
                Ny økt
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
