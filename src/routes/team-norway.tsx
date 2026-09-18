import { createFileRoute } from "@tanstack/react-router";
import { TnShell } from "@/components/tn/shell";
import type { Tilstand } from "@/components/tn/frame-key";
import { TN_SCREEN_ROLES, type Role, type TnScreen } from "@/lib/tn/access";

const SCREENS = Object.keys(TN_SCREEN_ROLES) as TnScreen[];
const ROLES: Role[] = ["SS", "TR", "HJ", "SP", "FO", "EL"];
const TILSTANDER: Tilstand[] = ["suksess", "tom", "laster", "feil"];

function parseScreen(value: unknown): TnScreen {
  return typeof value === "string" && SCREENS.includes(value as TnScreen)
    ? (value as TnScreen)
    : "oversikt";
}

function parseRole(value: unknown): Role {
  return typeof value === "string" && ROLES.includes(value as Role) ? (value as Role) : "SS";
}

function parseTilstand(value: unknown): Tilstand {
  return typeof value === "string" && TILSTANDER.includes(value as Tilstand)
    ? (value as Tilstand)
    : "suksess";
}

export const Route = createFileRoute("/team-norway")({
  validateSearch: (search: Record<string, unknown>) => ({
    skjerm: parseScreen(search.skjerm),
    rolle: parseRole(search.rolle),
    tilstand: parseTilstand(search.tilstand),
  }),
  component: Page,
  head: () => ({
    meta: [{ title: "Team Norway" }, { name: "theme-color", content: "#012B5D" }],
  }),
});

function Page() {
  const { skjerm, rolle, tilstand } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <TnShell
      screen={skjerm}
      role={rolle}
      tilstand={tilstand}
      onScreen={(next) => void navigate({ search: { skjerm: next, rolle, tilstand }, replace: true })}
      onRole={(next) => void navigate({ search: { skjerm, rolle: next, tilstand }, replace: true })}
    />
  );
}
