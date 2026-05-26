/**
 * WBPIc — kompakt Lucide-wrapper for Workbench Plan A.
 * Mappes 1-til-1 mot designets icon-IDs (ic-search, ic-bell, etc.).
 */

import {
  ArrowRight,
  Bell,
  BookmarkPlus,
  Calendar,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FlagTriangleRight,
  Flame,
  Heart,
  History,
  Home,
  Leaf,
  MapPin,
  Moon,
  Plus,
  Search,
  Settings,
  Share2,
  Shuffle,
  Sparkles,
  Target,
  TestTube,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "ic-search": Search,
  "ic-bell": Bell,
  "ic-settings": Settings,
  "ic-history": History,
  "ic-share": Share2,
  "ic-plus": Plus,
  "ic-chevdown": ChevronDown,
  "ic-chevright": ChevronRight,
  "ic-x": X,
  "ic-check": Check,
  "ic-sparkles": Sparkles,
  "ic-trending": TrendingUp,
  "ic-shuffle": Shuffle,
  "ic-copy": Copy,
  "ic-arrow-right": ArrowRight,
  "ic-calendar": Calendar,
  "ic-calendar-plus": CalendarPlus,
  "ic-pin": MapPin,
  "ic-home": Home,
  "ic-leaf": Leaf,
  "ic-flame": Flame,
  "ic-moon": Moon,
  "ic-anchor": BookmarkPlus,
  "ic-trophy": Trophy,
  "ic-flag": FlagTriangleRight,
  "ic-user": User,
  "ic-users": Users,
  "ic-target": Target,
  "ic-beaker": TestTube,
  "ic-video": Video,
  "ic-heart": Heart,
};

export function WBPIc({
  id,
  size = 16,
  stroke = 1.6,
  className,
}: {
  id: string;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const Icon = ICONS[id];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={stroke} className={className} aria-hidden />;
}
