/**
 * AK Golf HQ — Athletic branded component library
 *
 * Eneste branded-bibliotek for plattformen. UI-primitiver (Button, Dialog, Sheet,
 * Popover, DropdownMenu, Toast, Input osv) ligger i `@/components/ui/`.
 *
 * Tidligere v2/ + designkomponenter fra shared/ er konsolidert hit (M5 i
 * docs/design-system-plan-2026-05.md).
 *
 * Usage:
 *   import { AthleticHero, KpiStrip } from "@/components/athletic";
 *   import { LiveBar, SectionHeader, PhotoHero } from "@/components/athletic";
 */

// ── Atomer ──────────────────────────────────────────────────────
export { AthleticEyebrow } from "./eyebrow";
export { PulseDot } from "./pulse-dot";
export { AthleticBadge } from "./badge";
export { AthleticButton } from "./button";
export { AthleticAvatar } from "./avatar";
export { AthleticHero } from "./hero";
export { AthleticGreeting } from "./greeting";
export { KpiCard, KpiStrip } from "./kpi";
export { Sparkline } from "./sparkline";
export { KpiRing } from "./kpi-ring";
export { FeaturedCard } from "./featured-card";
export { AthleticCard } from "./card";
export { PyramidProgress, type PyramidRow } from "./pyramid-progress";
export { ActionList, type ActionItem } from "./action-list";
export { QueueList, type QueueItemData } from "./queue-item";
export { DayCal, type DayCalEvent } from "./day-cal";
export { TabBar, type TabItem } from "./tab-bar";

export * from "./calendars";
export * from "./data";

// ── Hooks (var: v2/hooks) ──────────────────────────────────────
export * from "./hooks";

// ── Shell ──────────────────────────────────────────────────────
export { default as LiveBar, type LiveBarProps } from "./shell/live-bar";
export { default as Sidebar, type SidebarProps } from "./shell/sidebar";
export { default as Topbar, type TopbarProps } from "./shell/topbar";
export { default as BottomNav } from "./shell/bottom-nav";
export { default as ShellWrapper, type ShellWrapperProps } from "./shell/shell-wrapper";

// ── Hero — photo/detail/page variants ──────────────────────────
export { default as PhotoHero, type PhotoHeroProps } from "./hero/photo-hero";
export { default as DetailHero, type DetailHeroProps } from "./hero/detail-hero";
export { default as PageHero, type PageHeroProps } from "./hero/page-hero";

// ── Itinerary ──────────────────────────────────────────────────
export { default as ItineraryList, type ItineraryListProps } from "./itinerary/itinerary-list";
export {
  default as ItineraryRow,
  type ItineraryRowProps,
  buildDrillHref,
} from "./itinerary/itinerary-row";
export { default as NowLine, type NowLineProps } from "./itinerary/now-line";

// ── Cards ──────────────────────────────────────────────────────
export { default as InsightCard, type InsightCardProps } from "./cards/insight-card";
export { default as PartnerCard, type PartnerCardProps } from "./cards/partner-card";
export { default as TournamentCard, type TournamentCardProps } from "./cards/tournament-card";
export { default as WellnessCard, type WellnessCardProps } from "./cards/wellness-card";
export { default as QuickAction, type QuickActionProps } from "./cards/quick-action";
export {
  default as CoachMessage,
  type CoachMessageProps,
  CoachMessageDetail,
  type CoachMessageDetailProps,
} from "./cards/coach-message";

// ── Editorial ──────────────────────────────────────────────────
export { default as PhotoDivider, type PhotoDividerProps } from "./editorial/photo-divider";
export { default as SectionHeader, type SectionHeaderProps } from "./editorial/section-header";
export { default as GhostNumber, type GhostNumberProps } from "./editorial/ghost-number";

// ── Modals ─────────────────────────────────────────────────────
export { default as StubModal, type StubModalProps } from "./modals/stub-modal";

// ── Patterns (page-level layout patterns) ─────────────────────
export {
  default as GoalsHubPattern,
  type Goal,
  type GoalsHubPatternProps,
} from "./patterns/goals-hub";

export {
  default as NotificationCenterPattern,
  type Notification,
  type NotificationType,
  type NotificationCenterPatternProps,
} from "./patterns/notification-center";

export {
  default as AuditLogPattern,
  type AuditEvent,
  type AuditLogPatternProps,
} from "./patterns/audit-log";

export {
  default as EmailTemplateEditorPattern,
  type EmailTemplate,
  type EmailTemplateEditorPatternProps,
} from "./patterns/email-template-editor";

export {
  default as ImportPattern,
  type ImportColumn,
  type ImportRow,
  type ImportPatternProps,
} from "./patterns/import";

export {
  default as LiveSessionPattern,
  type LiveSessionAxis,
  type LiveSessionPhase,
  type LiveSessionPatternProps,
} from "./patterns/live-session";

export {
  TimelinePattern,
  type Milestone,
  type MilestoneType,
  type MilestoneAxis,
  type TimelinePatternProps,
} from "./patterns/timeline";

export {
  ConsentPattern,
  type ConsentItem,
  type ConsentPatternProps,
} from "./patterns/consent";

export {
  default as LegalPattern,
  type LegalSection,
  type LegalPatternProps,
} from "./patterns/legal";
