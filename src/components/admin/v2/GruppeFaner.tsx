/**
 * AgencyOS Gruppe-faner — T8 Train-lock.
 *
 * Egne ruter (medlemmer / workbench / årsplan / timeplan / skoledata),
 * ikke client-tabs. Aktiv fane er tilstand (fill), ikke CTA.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";

export type GruppeFaneId = "medlemmer" | "workbench" | "arsplan" | "timeplan" | "skoledata";

const FANER: { id: GruppeFaneId; l: string; href: (groupId: string) => string }[] = [
  { id: "medlemmer", l: "Medlemmer", href: (id) => `/admin/grupper/${id}` },
  { id: "workbench", l: "Workbench", href: (id) => `/admin/grupper/${id}/workbench` },
  { id: "arsplan", l: "Årsplan", href: (id) => `/admin/grupper/${id}/arsplan` },
  { id: "timeplan", l: "Timeplan", href: (id) => `/admin/grupper/${id}/timeplan` },
  { id: "skoledata", l: "Skoledata", href: (id) => `/admin/grupper/${id}/arsplan/skoledata` },
];

export function GruppeFaner({ groupId, aktiv }: { groupId: string; aktiv: GruppeFaneId }) {
  return (
    <div role="tablist" aria-label="Gruppe" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FANER.map((f) => {
        const on = f.id === aktiv;
        return (
          <Link
            key={f.id}
            href={f.href(groupId)}
            role="tab"
            aria-selected={on}
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              height: 30,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: on ? TL.onFill : TL.mute,
              background: on ? TL.fill : "transparent",
              boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
              whiteSpace: "nowrap",
            }}
          >
            {f.l}
          </Link>
        );
      })}
    </div>
  );
}
