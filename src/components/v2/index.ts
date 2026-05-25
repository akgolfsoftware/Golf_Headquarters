/**
 * V2 component library barrel export.
 *
 * Usage:
 *   import { LiveBar, SectionHeader, PhotoHero } from "@/components/v2";
 */

// ── Hooks ──────────────────────────────────────────────────────
export * from "./hooks";

// ── Shell ──────────────────────────────────────────────────────
export { default as LiveBar, type LiveBarProps } from "./shell/live-bar";
export { default as Sidebar, type SidebarProps } from "./shell/sidebar";
export { default as Topbar, type TopbarProps } from "./shell/topbar";
export { default as BottomNav } from "./shell/bottom-nav";
// Note: BottomNav takes no props
export { default as ShellWrapper, type ShellWrapperProps } from "./shell/shell-wrapper";

// ── Hero ───────────────────────────────────────────────────────
export { default as PhotoHero, type PhotoHeroProps } from "./hero/photo-hero";
export { default as DetailHero, type DetailHeroProps } from "./hero/detail-hero";
export { default as PageHero, type PageHeroProps } from "./hero/page-hero";

// ── Data ───────────────────────────────────────────────────────
export { default as StatTile, type StatTileProps } from "./data/stat-tile";
export { default as PyramidBar, type PyramidBarProps } from "./data/pyramid-bar";
export { default as SgBar, type SgBarProps } from "./data/sg-bar";
export { default as HcpTrend, type HcpTrendProps } from "./data/hcp-trend";

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
