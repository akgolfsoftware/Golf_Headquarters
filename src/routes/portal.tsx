import { createFileRoute } from "@tanstack/react-router";
import { PlayerhqFasit } from "@/components/hq/playerhq-fasit";
import { canPortal } from "@/lib/hq/nav";
import {
  isPortalScreen,
  isUiState,
  type PortalRole,
  type PortalScreenId,
  type UiState,
} from "@/lib/hq/types";

function parseScreen(value: unknown): PortalScreenId {
  if (typeof value === "string" && isPortalScreen(value)) return value;
  return "i-dag";
}

function parseRole(value: unknown): PortalRole {
  if (value === "SP" || value === "FO" || value === "GRATIS") return value;
  return "SP";
}

function parseState(value: unknown): UiState {
  if (typeof value === "string" && isUiState(value)) return value;
  return "normal";
}

export const Route = createFileRoute("/portal")({
  validateSearch: (search: Record<string, unknown>) => ({
    skjerm: parseScreen(search.skjerm),
    rolle: parseRole(search.rolle),
    tilstand: parseState(search.tilstand),
  }),
  component: PortalPage,
  head: () => ({
    meta: [{ title: "PlayerHQ" }, { name: "theme-color", content: "#E6E3DD" }],
  }),
});

function PortalPage() {
  const { skjerm, rolle, tilstand } = Route.useSearch();
  const navigate = Route.useNavigate();
  const blocked = !canPortal(rolle, skjerm);
  const view = blocked ? "meg" : skjerm;

  return (
    <PlayerhqFasit
      screen={view}
      onScreen={(next) => {
        void navigate({ search: { skjerm: next, rolle, tilstand }, replace: true });
      }}
    />
  );
}
