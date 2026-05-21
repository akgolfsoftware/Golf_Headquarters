import type { ReactNode } from "react";

interface PageHeadProps {
  crumb: ReactNode;
  title: ReactNode;
  sub?: string;
  actions?: ReactNode;
}

export function PageHead({ crumb, title, sub, actions }: PageHeadProps) {
  return (
    <header className="tp-page-head">
      <div>
        <div className="crumb">{crumb}</div>
        <h1>{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 8 }}>{actions}</div> : null}
    </header>
  );
}
