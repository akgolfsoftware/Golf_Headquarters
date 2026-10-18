/**
 * Fanene i PlayerHQ og hvilken fane en adresse hører til. Delt mellom PlayerHQSkall (klient)
 * og PlayerHQSkallLaster (server, brukes i loading.tsx). Ingen "use client".
 */
import { CalendarDays, ChartNoAxesColumn, Sun, User } from "lucide-react";

export const PLAYERHQ_FANER = [
  { href: "/portal", label: "I dag", icon: Sun, name: "sun" },
  { href: "/portal/planlegge", label: "Plan", icon: CalendarDays, name: "calendar-days" },
  { href: "/portal/analysere", label: "Stats", icon: ChartNoAxesColumn, name: "chart-no-axes-column" },
  { href: "/portal/meg", label: "Meg", icon: User, name: "user" },
] as const;

function erTestDetalj(path: string) {
  if (!path.startsWith("/portal/tren/tester/")) return false;
  const rest = path.slice("/portal/tren/tester/".length);
  if (rest === "ny" || rest.startsWith("ny/") || rest.startsWith("team-norway") || rest.includes("/gjennomfor")) return false;
  return true;
}

export function erAktivFane(path: string, href: string) {
  if (href === "/portal") {
    // Booking med coach utelater aktiv. Det gamle skallet utleder da I dag.
    return path === "/portal" || path.startsWith("/portal/booking/coach");
  }
  // Coach, ny målsetning (før målbyggeren) og enkeltmål hørte til Meg (aktiv="meg").
  if (href === "/portal/meg") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/coach") || path === "/portal/mal/ny" || path.startsWith("/portal/mal/goal");
  }
  // Øvelser, ny booking, testdetalj og FYS-plan markerte Plan. aktiv="gjor" og /ny skal ikke lyse noen fane.
  if (href === "/portal/planlegge") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/drills") || path === "/portal/booking/ny" || path.startsWith("/portal/booking/ny/") || erTestDetalj(path) || path === "/portal/tren/fys-plan" || path.startsWith("/portal/tren/fys-plan/");
  }
  // Analyse, gameplan, ny runde og gapping markerte Analyse.
  if (href === "/portal/analysere") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/statistikk") || path.startsWith("/portal/gameplan") || path.startsWith("/portal/mal/runder") || path.startsWith("/portal/mal/trackman");
  }
  return path === href || path.startsWith(href + "/");
}
