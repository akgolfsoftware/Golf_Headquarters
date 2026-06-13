import {
  Activity,
  Banknote,
  BarChart3,
  Bot,
  CalendarCheck,
  CheckCheck,
  ClipboardList,
  FileBarChart,
  Flag,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Play,
  Plug,
  Radar,
  ScrollText,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/**
 * Delt nav-config for AgencyOS — ÉN kilde for desktop-sidebar
 * (agencyos-sidebar.tsx) og mobil-bunn-nav (agencyos-mobile-nav.tsx).
 * Ren TS-modul: ingen React, ingen server-kode. Badge-tallene
 * (SidebarCounts) bygges av AdminShell fra ekte Prisma-tellinger.
 */

export type SidebarCounts = {
  tasks: number;
  assigned: number;
  players: number;
  groups: number;
  bookings: number;
  requests: number;
  approvals: number;
};

export type NavLeaf = {
  key: string;
  label: string;
  href: string;
  /** Ekstra prefikser som også regnes som aktiv (alias-ruter). */
  match?: string[];
  /** Kun eksakt path-match (for hub-leaves med søsken under samme prefiks). */
  exact?: boolean;
  badge?: keyof SidebarCounts;
  badgeCls?: "alert" | "lime";
};

export type NavEntry =
  | (NavLeaf & { type: "item"; icon: LucideIcon; primary?: boolean })
  | {
      type: "group";
      key: string;
      label: string;
      icon: LucideIcon;
      primary?: boolean;
      children: NavLeaf[];
    };

export type NavSection = { label: string; items: NavEntry[] };

export function leafActive(path: string, leaf: NavLeaf): boolean {
  if (path === leaf.href) return true;
  if (leaf.exact) return false;
  if (leaf.href !== "/admin" && path.startsWith(leaf.href + "/")) return true;
  return (leaf.match ?? []).some((m) => path === m || path.startsWith(m + "/"));
}

export function buildAdminNav(workbenchHref: string): NavSection[] {
  return [
    {
      label: "Daglig",
      items: [
        {
          type: "item",
          key: "dashboard",
          label: "Oversikt",
          href: "/admin/agencyos",
          icon: LayoutDashboard,
          primary: true,
        },
        {
          type: "group",
          key: "g-week",
          label: "Min uke",
          icon: CalendarCheck,
          children: [
            { key: "week-board", label: "Ukeoversikt", href: "/admin/workspace", exact: true },
            { key: "tasks", label: "Oppgaver", href: "/admin/workspace/oppgaver", badge: "tasks" },
            { key: "assigned", label: "Tildelt meg", href: "/admin/workspace/tildelt-meg", badge: "assigned" },
          ],
        },
      ],
    },
    {
      label: "Stall & talent",
      items: [
        {
          type: "item",
          key: "players",
          label: "Spillere",
          href: "/admin/spillere",
          icon: Users,
          primary: true,
          badge: "players",
        },
        {
          type: "item",
          key: "groups",
          label: "Grupper",
          href: "/admin/grupper",
          icon: UsersRound,
          badge: "groups",
        },
        {
          type: "group",
          key: "g-talent",
          label: "Talent",
          icon: Radar,
          children: [
            { key: "talent-radar", label: "Talent-radar", href: "/admin/talent/radar", match: ["/admin/talent"] },
            { key: "comparison", label: "Sammenligning", href: "/admin/talent/sammenligning" },
            { key: "wagr", label: "WAGR-import", href: "/admin/talent/wagr-import" },
          ],
        },
      ],
    },
    {
      label: "Operasjon",
      items: [
        {
          type: "item",
          key: "workbench",
          label: "Workbench",
          href: workbenchHref,
          match: ["/admin/coach-workbench"],
          icon: LayoutTemplate,
          primary: true,
        },
        {
          type: "group",
          key: "g-plan",
          label: "Planlegge",
          icon: ClipboardList,
          children: [
            { key: "training-plans", label: "Treningsplaner", href: "/admin/plans" },
            { key: "plan-templates", label: "Plan-maler", href: "/admin/plan-templates" },
            { key: "drills", label: "Drill-bibliotek", href: "/admin/drills" },
            { key: "sessions", label: "Økter", href: "/admin/okter" },
            { key: "technical-plan", label: "Teknisk plan", href: "/admin/teknisk-plan" },
            { key: "tournaments", label: "Turneringer", href: "/admin/tournaments" },
          ],
        },
        {
          type: "group",
          key: "g-do",
          label: "Gjennomføre",
          icon: Play,
          children: [
            { key: "calendar", label: "Kalender", href: "/admin/kalender" },
            { key: "bookings", label: "Bookinger", href: "/admin/bookinger", badge: "bookings" },
            { key: "facilities", label: "Anlegg", href: "/admin/anlegg" },
            { key: "availability", label: "Tilgjengelighet", href: "/admin/availability" },
            { key: "services", label: "Tjenester", href: "/admin/services" },
            { key: "trackman", label: "TrackMan", href: "/admin/trackman" },
            { key: "capacity", label: "Kapasitet", href: "/admin/kapasitet" },
            { key: "recording", label: "Opptak", href: "/admin/recording" },
          ],
        },
      ],
    },
    {
      label: "Analyse",
      items: [
        { type: "item", key: "stable-analysis", label: "Stall-analyse", href: "/admin/analyse", icon: BarChart3 },
        { type: "item", key: "team-average", label: "Lag-snitt", href: "/admin/lag-snitt", icon: TrendingUp },
        { type: "item", key: "tests", label: "Tester", href: "/admin/tester", icon: FlaskConical },
        { type: "item", key: "rounds", label: "Runder", href: "/admin/runder", icon: Flag },
        { type: "item", key: "compliance", label: "Compliance", href: "/admin/analysere/compliance", icon: ShieldCheck },
        { type: "item", key: "reach", label: "Reach", href: "/admin/reach", icon: Activity },
        { type: "item", key: "reports", label: "Rapporter", href: "/admin/reports", icon: FileBarChart },
      ],
    },
    {
      label: "Innboks",
      items: [
        {
          type: "item",
          key: "requests",
          label: "Forespørsler",
          href: "/admin/foresporsler",
          icon: Inbox,
          badge: "requests",
          badgeCls: "alert",
        },
        {
          type: "item",
          key: "approvals",
          label: "Godkjenninger",
          href: "/admin/godkjenninger",
          icon: CheckCheck,
          badge: "approvals",
          badgeCls: "lime",
        },
        { type: "item", key: "messages", label: "Meldinger", href: "/admin/innboks", icon: MessageSquare },
      ],
    },
    {
      label: "System",
      items: [
        { type: "item", key: "finance", label: "Økonomi", href: "/admin/okonomi", icon: Banknote },
        { type: "item", key: "team", label: "Team", href: "/admin/team", icon: UserCog },
        { type: "item", key: "integrations", label: "Integrasjoner", href: "/admin/integrasjoner", icon: Plug },
        { type: "item", key: "agents", label: "AI-agenter", href: "/admin/agents", icon: Bot },
        { type: "item", key: "email-templates", label: "E-postmaler", href: "/admin/email-templates", icon: Mail },
        { type: "item", key: "audit-log", label: "Audit-logg", href: "/admin/audit-log", icon: ScrollText },
        { type: "item", key: "settings", label: "Innstillinger", href: "/admin/settings", icon: Settings },
      ],
    },
  ];
}
