/**
 * Mapper: ekte Notification-rader (Prisma) → v10 VarslerData.
 *
 * Oversetter den eksisterende notifications-shapen (type/title/body/link/
 * readAt/createdAt) til prop-shapen <Varsler> forventer: dag-grupper med
 * ferdig-resolvet ikon/tone/eyebrow/relativ-tid per varsel.
 *
 * Tom-tilstand bevares: tom rad-liste gir tomme grupper og ulestAntall 0 —
 * ingen liksom-data. Per varsel-type velges DS-token-tone + lucide-ikon +
 * mono-eyebrow (samme idiom som det gamle AGENT-oppslaget).
 */

import {
  BarChart3,
  Bell,
  BotMessageSquare,
  Calendar,
  CreditCard,
  Info,
  MessageSquare,
  Receipt,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type {
  VarselTone,
  VarslerData,
  VarselGroup,
} from "@/components/portal/varsler/varsler";

/** Ekte rad fra prisma.notification.findMany (kun feltene vi bruker). */
export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type Presentation = { icon: LucideIcon; tone: VarselTone; eyebrow: string };

/** Oppslag per varsel-type → ikon + DS-tone + mono-eyebrow (agent/kilde). */
const PRESENTATION: Record<string, Presentation> = {
  plan: { icon: Zap, tone: "plan", eyebrow: "Plan-vakten" },
  drill: { icon: Target, tone: "drill", eyebrow: "Coach" },
  melding: { icon: MessageSquare, tone: "melding", eyebrow: "Coach" },
  turnering: { icon: Trophy, tone: "turnering", eyebrow: "Turnering-agent" },
  achievement: { icon: Trophy, tone: "milepael", eyebrow: "Milepæl" },
  runde: { icon: BarChart3, tone: "runde", eyebrow: "Runde-agent" },
  trackman: { icon: Zap, tone: "runde", eyebrow: "TrackMan" },
  booking: { icon: Calendar, tone: "melding", eyebrow: "Booking" },
  credit: { icon: CreditCard, tone: "credit", eyebrow: "Credit" },
  betaling: { icon: CreditCard, tone: "credit", eyebrow: "Betaling" },
  faktura: { icon: Receipt, tone: "runde", eyebrow: "Fakturaer" },
  ai: { icon: BotMessageSquare, tone: "milepael", eyebrow: "AI-caddie" },
  system: { icon: Bell, tone: "system", eyebrow: "System" },
};

const FALLBACK: Presentation = { icon: Info, tone: "system", eyebrow: "System" };

function presentation(type: string): Presentation {
  return PRESENTATION[type] ?? FALLBACK;
}

// ── Tids-gruppering (mandag som ukestart) ───────────────────────
type GroupKey = "i-dag" | "i-gar" | "denne-uka" | "eldre";

const GROUP_ORDER: GroupKey[] = ["i-dag", "i-gar", "denne-uka", "eldre"];

const GROUP_LABEL: Record<GroupKey, string> = {
  "i-dag": "I dag",
  "i-gar": "I går",
  "denne-uka": "Denne uka",
  eldre: "Eldre",
};

function getGroup(d: Date, now: Date): GroupKey {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  const dow = (startOfToday.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - dow);

  if (d >= startOfToday) return "i-dag";
  if (d >= startOfYesterday) return "i-gar";
  if (d >= startOfWeek) return "denne-uka";
  return "eldre";
}

/** Relativ tid i mono-stil: «Nå», «12 min siden», «5 t siden», «3 d siden». */
function relativeTime(d: Date, now: Date): string {
  const min = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (min < 1) return "Nå";
  if (min < 60) return `${min} min siden`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} t siden`;
  return `${Math.floor(hours / 24)} d siden`;
}

/**
 * Ekte rader → VarslerData. Grupper «I dag / I går / Denne uka» vises direkte;
 * «Eldre» foldes bak harEldre + eldreHref (peker tilbake på siden selv, som
 * preview). Tom rad-liste ⇒ tomme grupper, ulestAntall 0, harEldre false.
 */
export function mapVarslerData(rows: NotificationRow[]): VarslerData {
  const now = new Date();
  const buckets: Record<GroupKey, VarselGroup["items"]> = {
    "i-dag": [],
    "i-gar": [],
    "denne-uka": [],
    eldre: [],
  };

  for (const n of rows) {
    const p = presentation(n.type);
    buckets[getGroup(n.createdAt, now)].push({
      id: n.id,
      icon: p.icon,
      tone: p.tone,
      eyebrow: p.eyebrow,
      title: n.title,
      body: n.body ?? undefined,
      time: relativeTime(n.createdAt, now),
      unread: n.readAt === null,
      href: n.link ?? undefined,
    });
  }

  const grupper: VarselGroup[] = GROUP_ORDER.filter(
    (g) => g !== "eldre" && buckets[g].length > 0,
  ).map((g) => ({ label: GROUP_LABEL[g], items: buckets[g] }));

  return {
    ulestAntall: rows.filter((n) => n.readAt === null).length,
    grupper,
    harEldre: buckets.eldre.length > 0,
    eldreHref: "/portal/varsler",
  };
}
