/**
 * AgencyOS Gruppe-faner — T8 Train-lock.
 *
 * Egne ruter (medlemmer / workbench / årsplan / timeplan / skoledata),
 * ikke client-tabs. Aktiv fane er tilstand (fill), ikke CTA.
 */

import Link from "next/link";

export type GruppeFaneId = "medlemmer" | "workbench" | "arsplan" | "timeplan" | "skoledata";

const FANER: { id: GruppeFaneId; l: string; href: (groupId: string) => string }[] = [
  { id: "medlemmer", l: "Medlemmer", href: (id) => `/admin/grupper/${id}` },
  { id: "workbench", l: "Workbench", href: (id) => `/admin/grupper/${id}/workbench` },
  { id: "arsplan", l: "Årsplan", href: (id) => `/admin/grupper/${id}/arsplan` },
  { id: "timeplan", l: "Timeplan", href: (id) => `/admin/grupper/${id}/timeplan` },
  { id: "skoledata", l: "Skoledata", href: (id) => `/admin/grupper/${id}/arsplan/skoledata` },
];

export function GruppeFaner({ groupId, aktiv }: { groupId: string; aktiv: GruppeFaneId }) {
  return <nav className="group-nav" aria-label="Gruppe">
    {FANER.map((f) => <Link key={f.id} href={f.href(groupId)} aria-current={f.id === aktiv ? "page" : undefined}>{f.l}</Link>)}
  </nav>;
}
