import {
  Armchair, ArrowLeftRight, Bell, BookUser, CalendarCheck, CalendarDays, CalendarPlus, CalendarRange,
  ChartBarBig, ChartColumn, ChartLine, CircleUser, ClipboardList, Contact, Dumbbell, Flag, FolderClosed,
  GraduationCap, Handshake, IdCard, ListChecks, ListOrdered, Mail, Megaphone, Newspaper, NotebookPen,
  Plane, Route, Search, Send, Settings, SquareCheck, Sun, Sunrise, Timer, Trophy, UserPlus, Users, UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { WangIkon } from "@/lib/wang/wang-ruter";

/**
 * Den faste ikontabellen for WANG-trenerflaten. Tegningen bruker Phosphor
 * (light); dette er nærmeste Lucide. Nytt ikon i rutekartet krever en linje her,
 * og TypeScript sier fra hvis den mangler.
 */
const IKONER: Record<WangIkon, LucideIcon> = {
  Armchair, ArrowLeftRight, Bell, BookUser, CalendarCheck, CalendarDays, CalendarPlus, CalendarRange,
  ChartBarBig, ChartColumn, ChartLine, CircleUser, ClipboardList, Contact, Dumbbell, Flag, FolderClosed,
  GraduationCap, Handshake, IdCard, ListChecks, ListOrdered, Mail, Megaphone, Newspaper, NotebookPen,
  Plane, Route, Search, Send, Settings, SquareCheck, Sun, Sunrise, Timer, Trophy, UserPlus, Users, UsersRound,
};

export function WangIkonTegn({ navn, storrelse = 20 }: { navn: WangIkon; storrelse?: number }) {
  const Ikon = IKONER[navn];
  return <Ikon size={storrelse} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} />;
}
