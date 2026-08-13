/**
 * AgencyOS Gruppe-faner — variant av fasit `agencyos-gruppe-detalj.html`
 * (§«faner på samme flate»). Ruten er egne Next.js-sider (medlemmer/arsplan/
 * timeplan/skoledata), ikke client-state — derfor server-drevne lenker
 * stylet identisk med PillTabs (samme mønster som AdminSettingsV2 sin
 * FaneLenke / /admin/plans/[planId]).
 *
 * Workbench-fanen i fasiten er bevisst utelatt her (STOP, se W4-rapport):
 * drag-drop-periode-canvaset er en egen flate, ikke pixel-passbar som fane.
 */

import Link from "next/link";
import { T } from "@/components/v2";

export type GruppeFaneId = "medlemmer" | "arsplan" | "timeplan" | "skoledata";

const FANER: { id: GruppeFaneId; l: string; href: (groupId: string) => string }[] = [
  { id: "medlemmer", l: "Medlemmer", href: (id) => `/admin/grupper/${id}` },
  { id: "arsplan", l: "Årsplan", href: (id) => `/admin/grupper/${id}/arsplan` },
  { id: "timeplan", l: "Timeplan", href: (id) => `/admin/grupper/${id}/timeplan` },
  { id: "skoledata", l: "Skoledata", href: (id) => `/admin/grupper/${id}/arsplan/skoledata` },
];

export function GruppeFaner({ groupId, aktiv }: { groupId: string; aktiv: GruppeFaneId }) {
  return (
    <div role="tablist" aria-label="Gruppe" style={{ display: "flex", gap: 6, flexWrap: "wrap", overflowX: "auto" }}>
      {FANER.map((f) => {
        const on = f.id === aktiv;
        return (
          <Link key={f.id} href={f.href(groupId)} role="tab" aria-selected={on} style={{ textDecoration: "none" }}>
            <span
              className="v2-press v2-focus"
              style={{
                display: "inline-block",
                padding: "8px 15px",
                borderRadius: 9999,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 600,
                color: on ? T.onLime : T.fg2,
                background: on ? T.lime : T.panel2,
                border: `1px solid ${on ? "transparent" : T.border}`,
                whiteSpace: "nowrap",
              }}
            >
              {f.l}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
