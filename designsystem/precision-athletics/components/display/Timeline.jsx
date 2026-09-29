import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Timeline({ items = [], dense, className }) {
  let day = null;
  return (
    <ol className={cx("pa-timeline", dense && "pa-timeline--dense", className)}>
      {items.map((it, i) => { const head = it.day && it.day !== day; day = it.day || day; return (
        <React.Fragment key={it.id || i}>
          {head && <li className="pa-timeline__day" aria-hidden="false">{it.day}</li>}
          <li className="pa-timeline__item">
            <time className="pa-timeline__time" dateTime={it.dateTime}>{it.time || "—"}</time>
            <span className={cx("pa-timeline__dot", it.axis && "pa-timeline__dot--" + it.axis, it.hollow && "pa-timeline__dot--hollow")} aria-hidden="true"></span>
            <div className="pa-timeline__content">
              <div className="pa-timeline__title">{it.title}</div>
              {it.body && <div className="pa-timeline__body">{it.body}</div>}
              {it.meta && <div className="pa-timeline__meta">{it.meta}</div>}
              {it.children}
            </div>
          </li>
        </React.Fragment>); })}
    </ol>
  );
}
