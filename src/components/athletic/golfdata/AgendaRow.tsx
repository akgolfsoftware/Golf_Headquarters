"use client";

import React from "react";
import { Icon } from "./Icon";
import { DataPreview, type DataPreviewRow } from "./DataPreview";

/**
 * AK Golf HQ — AgendaRow
 * Portet 1:1 fra design-handover v13 (components/calendar/AgendaRow.jsx).
 * Én agendalinje: tid til venstre, hairline-blokk til høyre med ledende ikon,
 * tittel + undertekst og varighet. Disiplin: blokkene er nøytrale; live/nå-økten
 * får lime-aksent + pulserende prikk (lime er signal, ikke kategori-palett).
 * CSS: ./golfdata.css (.ak-agenda).
 */

export type AgendaAkFormel = {
  arena?: React.ReactNode;
  trinn?: React.ReactNode;
  cs?: React.ReactNode;
  axis?: string;
};

export type AgendaRowProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Starttid, f.eks. "16:00". */
  time?: React.ReactNode;
  /** Ledende Lucide-ikonnavn eller node. */
  icon?: string | React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Varighet, f.eks. "60 min". */
  duration?: React.ReactNode;
  /** "upcoming" (default) · "live" (lime-aksent + puls) · "done" (dempet + check). */
  state?: "upcoming" | "live" | "done";
  /** Valgfritt AK-formel-sammendrag i hover (fra jsx-kilden, utover .d.ts). */
  akFormel?: AgendaAkFormel;
  onClick?: React.MouseEventHandler;
};

export function AgendaRow({
  time,
  icon = "dumbbell",
  title,
  subtitle,
  duration,
  state = "upcoming", // "upcoming" | "live" | "done"
  akFormel, // { arena, trinn, cs, axis } — valgfritt AK-formel-sammendrag i hover
  onClick,
  className = "",
  style,
  ...rest
}: AgendaRowProps) {
  const interactive = !!onClick;
  const [hover, setHover] = React.useState(false);
  const akRows: DataPreviewRow[] = [];
  if (akFormel) {
    if (akFormel.axis) akRows.push({ label: akFormel.axis, value: akFormel.cs || "—" });
    if (akFormel.arena != null) akRows.push({ label: "Situasjon", value: akFormel.arena });
    if (akFormel.trinn != null) akRows.push({ label: "Trinn", value: akFormel.trinn });
  }
  const cls = [
    "ak-agenda",
    state === "live" ? "ak-agenda--live" : "",
    state === "done" ? "ak-agenda--done" : "",
    interactive ? "ak-agenda--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style} {...rest}>
      <div className="ak-agenda__time">{time}</div>
      <div
        className="ak-agenda__block"
        onClick={onClick}
        role={interactive ? "button" : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ position: "relative" }}
      >
        <span className="ak-agenda__ic">
          {state === "done" ? <Icon name="check" size={18} /> : typeof icon === "string" ? <Icon name={icon} size={18} /> : icon}
        </span>
        <div className="ak-agenda__body">
          <div className="ak-agenda__title">
            {title}
            {state === "live" && <span className="ak-agenda__live" />}
          </div>
          {subtitle != null && <div className="ak-agenda__sub">{subtitle}</div>}
        </div>
        {duration != null && <div className="ak-agenda__dur">{duration}</div>}
        {akRows.length > 0 && (
          <DataPreview visible={hover} x="22%" y={-4} placement="top" label={title} rows={akRows} />
        )}
      </div>
    </div>
  );
}
