import { createFileRoute } from "@tanstack/react-router";
import { WangShell } from "@/components/wang/shell";
import type { Role, ScreenId } from "@/lib/wang/access";
import { SCREEN_ROLES } from "@/lib/wang/access";

const SCREENS = Object.keys(SCREEN_ROLES) as ScreenId[];

function parseScreen(value: unknown): ScreenId {
  if (typeof value === "string" && SCREENS.includes(value as ScreenId)) {
    return value as ScreenId;
  }
  return "oversikt";
}

function parseRole(value: unknown): Role {
  const roles: Role[] = ["SS", "TR", "HJ", "SP", "FO", "EL"];
  if (typeof value === "string" && roles.includes(value as Role)) {
    return value as Role;
  }
  return "SS";
}

export const Route = createFileRoute("/wang")({
  validateSearch: (search: Record<string, unknown>) => ({
    skjerm: parseScreen(search.skjerm),
    rolle: parseRole(search.rolle),
  }),
  component: WangPage,
  head: () => ({
    meta: [{ title: "WANG Toppidrett" }, { name: "theme-color", content: "#17446F" }],
  }),
});

function WangPage() {
  const { skjerm, rolle } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <WangShell
      screen={skjerm}
      role={rolle}
      onScreen={(next) => {
        void navigate({ search: { skjerm: next, rolle }, replace: true });
      }}
      onRole={(next) => {
        void navigate({ search: { skjerm, rolle: next }, replace: true });
      }}
    />
  );
}
