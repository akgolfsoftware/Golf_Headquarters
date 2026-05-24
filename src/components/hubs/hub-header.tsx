import type { ReactNode } from "react";

type HubHeaderProps = {
  eyebrow: string;
  title: string;
  titleItalic?: string;
  sub?: string;
  actions?: ReactNode;
  stats?: ReactNode;
};

export function HubHeader({ eyebrow, title, titleItalic, sub, actions, stats }: HubHeaderProps) {
  return (
    <header className="hub-head">
      <div className="hub-head-left">
        <div className="eyebrow">{eyebrow}</div>
        <h1>
          {title}
          {titleItalic ? (
            <>
              {" "}
              <em>{titleItalic}</em>
            </>
          ) : null}
        </h1>
        {sub ? <div className="hub-sub">{sub}</div> : null}
        {stats ? <div className="hub-stats">{stats}</div> : null}
      </div>
      <div className="hub-head-actions">{actions}</div>
    </header>
  );
}

export function HubStatSep() {
  return <i aria-hidden />;
}
