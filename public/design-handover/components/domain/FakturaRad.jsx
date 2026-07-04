import React from "react";
import { Tag } from "../core/Tag.jsx";

/**
 * AK Golf HQ — FakturaRad
 * Invoice row for Forelder and AgencyOS finance views.
 * Amount right-aligned in tabular mono. Status: paid · pending · overdue · void.
 */

const STATUS = {
  paid:    { variant: "up",      label: "Betalt"    },
  pending: { variant: "neutral", label: "Venter"    },
  overdue: { variant: "down",    label: "Forfalt"   },
  void:    { variant: "outline", label: "Kreditert" },
};

const CSS = `
.ak-fakturarad{
  display:flex;align-items:center;gap:12px;
  padding:12px 16px;
  border-bottom:1px solid var(--border);
  width:100%;text-align:left;background:transparent;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-fakturarad--interactive{cursor:pointer;}
.ak-fakturarad--interactive:hover{background:var(--surface-hover);}
.ak-fakturarad__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.ak-fakturarad__title{font-size:var(--text-14);font-weight:500;color:var(--text);}
.ak-fakturarad__sub{font-size:var(--text-12);color:var(--text-muted);}
.ak-fakturarad__amount{
  font-family:var(--font-mono);font-size:var(--text-14);font-weight:600;
  color:var(--text);font-variant-numeric:tabular-nums;flex-shrink:0;
  white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-fakturarad-css")) {
  const s = document.createElement("style");
  s.id = "ak-fakturarad-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function FakturaRad({
  title,
  subtitle,
  amount,
  currency = "kr",
  status = "pending",
  onClick,
  className = "",
  style,
}) {
  const s_ = STATUS[status] || STATUS.pending;
  const El = onClick ? "button" : "div";
  const elProps = onClick ? { type: "button", onClick } : {};
  return (
    <El
      className={`ak-fakturarad${onClick ? " ak-fakturarad--interactive" : ""} ${className}`}
      style={style}
      {...elProps}
    >
      <div className="ak-fakturarad__body">
        <div className="ak-fakturarad__title">{title}</div>
        {subtitle && <div className="ak-fakturarad__sub">{subtitle}</div>}
      </div>
      <span className="ak-fakturarad__amount">{amount} {currency}</span>
      <Tag variant={s_.variant} size="sm">{s_.label}</Tag>
    </El>
  );
}
