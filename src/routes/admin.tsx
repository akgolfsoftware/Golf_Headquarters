import { createFileRoute } from "@tanstack/react-router";
import { AosRest } from "@/components/hq/aos-rest";
import { HjemFasit } from "@/components/hq/hjem-fasit";
import { InnboksFasit, KoFasit, PubliserFasit, StallFasit } from "@/components/hq/aos-flater";
import { KalenderFasit } from "@/components/hq/kalender-fasit";
import { WorkbenchFasit } from "@/components/hq/workbench-fasit";
import { canAdmin } from "@/lib/hq/nav";
import {
  isAdminScreen,
  isUiState,
  type AdminRole,
  type AdminScreenId,
  type UiState,
} from "@/lib/hq/types";

function parseScreen(value: unknown): AdminScreenId {
  if (typeof value === "string" && isAdminScreen(value)) return value;
  return "hjem";
}

function parseRole(value: unknown): AdminRole {
  if (value === "ADMIN" || value === "COACH") return value;
  return "COACH";
}

function parseState(value: unknown): UiState {
  if (typeof value === "string" && isUiState(value)) return value;
  return "normal";
}

const WB_FASIT: AdminScreenId[] = ["workbench", "arsplan", "periode", "maned", "oktbygger", "stall-dag", "live-oversikt"];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    skjerm: parseScreen(search.skjerm),
    rolle: parseRole(search.rolle),
    tilstand: parseState(search.tilstand),
  }),
  component: AdminPage,
  head: () => ({
    meta: [{ title: "AgencyOS" }, { name: "theme-color", content: "#E6E3DD" }],
  }),
});

function AdminPage() {
  const { skjerm, rolle, tilstand } = Route.useSearch();
  const navigate = Route.useNavigate();
  const blocked = !canAdmin(rolle, skjerm);
  const go = (next: AdminScreenId) => {
    void navigate({ search: { skjerm: next, rolle, tilstand }, replace: true });
  };

  if (blocked) {
    return (
      <AosRest screen="oppsett" onScreen={go} />
    );
  }
  if (skjerm === "hjem") return <HjemFasit onScreen={go} />;
  if (skjerm === "stall") return <StallFasit onScreen={go} />;
  if (skjerm === "innboks") return <InnboksFasit onScreen={go} />;
  if (skjerm === "ko") return <KoFasit onScreen={go} />;
  if (skjerm === "publiser") return <PubliserFasit onScreen={go} />;
  if (skjerm === "kalender-uke" || skjerm === "kalender-dag" || skjerm === "kalender-maned" || skjerm === "min-uke") {
    return <KalenderFasit screen={skjerm === "min-uke" ? "kalender-uke" : skjerm} onScreen={go} />;
  }
  if (WB_FASIT.includes(skjerm)) return <WorkbenchFasit screen={skjerm} onScreen={go} />;
  return <AosRest screen={skjerm} onScreen={go} />;
}
