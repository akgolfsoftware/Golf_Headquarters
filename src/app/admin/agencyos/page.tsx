/**
 * AgencyOS Cockpit (/admin/agencyos) — v10-design.
 *
 * Rendrer <AgencyCockpit> (v10-fasit fra ag-dashboard) med EKTE data fra
 * loadDailyBrief (Prisma). 3-kolonne Bloomberg-cockpit: dagens timeline,
 * innboks + oppgaver, trenger-oppmerksomhet + 4 business-KPIer.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["ADMIN","COACH"] }).
 *
 * mapCockpitData oversetter den eksisterende DailyBriefProps-shapen til
 * CockpitData. Tom-tilstander bevares (tom timeline/oppgaver/fokus → []).
 * ReactNode-felter (aiContext, focus.reason) flates til ren tekst siden
 * v10-komponenten tar string der.
 */

import { Children, isValidElement, type ReactNode } from "react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { type DailyBriefProps } from "@/components/admin/agencyos/daily-brief";
import {
  AgencyCockpit,
  type CockpitData,
} from "@/components/admin/cockpit/agency-cockpit";

export const dynamic = "force-dynamic";

/** Flat en ReactNode til ren tekst (v10-cockpit tar string der DailyBrief tar node). */
function nodeToText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return Children.toArray(props.children).map(nodeToText).join("");
  }
  return "";
}

/** Oversetter ekte DailyBriefProps → v10 CockpitData. Tom-tilstander bevares. */
function mapCockpitData(d: DailyBriefProps): CockpitData {
  return {
    coachFirstName: d.coachFirstName,
    aiContext: nodeToText(d.aiContext),
    liveLabel: `${d.dateLabel} · ${d.timeLabel}`,
    timelineDateLabel: d.timelineDateLabel,
    now: d.now,
    timeline: d.timeline.map((s) => ({
      id: s.id,
      startMin: s.startMin,
      durMin: s.durMin,
      time: s.time,
      initials: s.initials,
      avatarTone: s.avatarTone,
      playerName: s.playerName,
      title: s.title,
      href: s.href,
    })),
    inboxCount: d.inboxCount,
    inboxUnread: d.inboxUnread,
    inbox: d.inbox.map((it) => ({
      id: it.id,
      initials: it.initials,
      avatarTone: it.avatarTone,
      title: it.name,
      type: it.type,
      typeLabel: it.typeLabel,
      preview: it.preview,
      when: it.when,
      unread: it.unread,
      href: it.href,
    })),
    tasks: d.tasks.map((t) => ({
      id: t.id,
      label: t.label,
      done: t.done,
      tag: t.tag,
      due: t.due,
    })),
    tasksDoneToday: d.tasksDoneToday,
    tasksTotalToday: d.tasksTotalToday,
    focus: d.focus.map((f) => ({
      id: f.id,
      initials: f.initials,
      avatarTone: f.avatarTone,
      name: f.name,
      meta: f.meta,
      alert: f.alert,
      signal: f.signal,
      reason: nodeToText(f.reason),
      actions: f.actions,
    })),
    focusCount: d.focus.length,
    kpis: d.kpis.map((k) => ({
      label: k.label,
      value: k.value,
      unit: k.unit,
      delta: k.delta,
      icon: k.icon,
      spark: k.spark,
    })),
  };
}

export default async function AgencyOSPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const props = await loadDailyBrief({ id: user.id, name: user.name });
  return <AgencyCockpit data={mapCockpitData(props)} />;
}
