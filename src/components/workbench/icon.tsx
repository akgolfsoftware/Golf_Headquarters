// ============================================================
// Workbench icon mapper
// Maps the v10 lucide id strings (e.g. "calendar-days") to the
// matching lucide-react component. Replaces the v10 `<I n=…/>`
// helper that relied on `data-lucide` + the lucide UMD script.
// ============================================================
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cloud,
  Columns3,
  Flag,
  Gauge,
  GripVertical,
  Layers,
  LayoutGrid,
  List,
  MapPin,
  Minus,
  PencilLine,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

const REGISTRY: Record<string, LucideIcon> = {
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "bar-chart-3": BarChart3,
  bell: Bell,
  "calendar-days": CalendarDays,
  "calendar-range": CalendarRange,
  "check-circle-2": CheckCircle2,
  "check-square": CheckSquare,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "clipboard-check": ClipboardCheck,
  "clipboard-list": ClipboardList,
  clock: Clock,
  cloud: Cloud,
  "columns-3": Columns3,
  flag: Flag,
  gauge: Gauge,
  "grip-vertical": GripVertical,
  layers: Layers,
  "layout-grid": LayoutGrid,
  list: List,
  "map-pin": MapPin,
  minus: Minus,
  "pencil-line": PencilLine,
  play: Play,
  plus: Plus,
  search: Search,
  send: Send,
  "share-2": Share2,
  sparkles: Sparkles,
  target: Target,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  users: Users,
  video: Video,
};

type IconProps = {
  /** v10 lucide id, e.g. "calendar-days" */
  n: string;
  /** width in px (mirrors v10 default of 14) */
  w?: number;
  /** height in px (mirrors v10 default of 14) */
  h?: number;
};

/**
 * Inline icon, drop-in replacement for the v10 `<I />` helper.
 * v10 sized everything via inline width/height, 1.5px stroke is the
 * lucide-react default which matches the design system.
 */
export function Icon({ n, w = 14, h = 14 }: IconProps) {
  const Cmp = REGISTRY[n];
  if (!Cmp) return null;
  return <Cmp width={w} height={h} strokeWidth={1.5} aria-hidden />;
}
