import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function PageHeader({ kicker, title, sub, breadcrumb, meta, actions, className }) {
  return (
    <header className={cx("pa-pagehead", className)}>
      {breadcrumb}
      <div className="pa-pagehead__row">
        <div className="pa-pagehead__text">
          {kicker && <div className="kicker pa-pagehead__kicker">{kicker}</div>}
          <h1 className="pa-pagehead__title">{title}</h1>
          {sub && <p className="pa-pagehead__sub">{sub}</p>}
          {meta && <div className="pa-pagehead__meta">{meta}</div>}
        </div>
        {actions && <div className="pa-pagehead__actions">{actions}</div>}
      </div>
    </header>
  );
}
