/**
 * 8 CoachHQ stub-skjermer fra Claude Design Batch D (bundle UVrLUCfdvIEV5yap-lh_pw).
 * Hver renderes pixel-perfekt fra rå HTML via dangerouslySetInnerHTML, scoped i .coachhq-stubs-scope.
 */

import { CoachhqStubsShell, type Crumb } from "./shell";
import {
  WORKSPACE_TILDELT_MEG_HTML,
  WAGR_IMPORT_HTML,
  PLAN_TEMPLATES_HTML,
  BOOKINGER_HTML,
  GODKJENNINGER_HTML,
  NOTION_PROSJEKTER_HTML,
  AUDIT_LOG_HTML,
  SETTINGS_HTML,
} from "./_html-bodies";

function ScreenBody({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export function WorkspaceTildeltMegScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Oversikt" },
    { label: "Tildelt meg", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Tildelt meg" crumbs={crumbs}>
      <ScreenBody html={WORKSPACE_TILDELT_MEG_HTML} />
    </CoachhqStubsShell>
  );
}

export function WagrImportScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Stall" },
    { label: "Talent-radar" },
    { label: "WAGR-import", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Talent-radar" crumbs={crumbs}>
      <ScreenBody html={WAGR_IMPORT_HTML} />
    </CoachhqStubsShell>
  );
}

export function PlanTemplatesScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Planlegge" },
    { label: "Plan-maler", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Plan-maler" crumbs={crumbs}>
      <ScreenBody html={PLAN_TEMPLATES_HTML} />
    </CoachhqStubsShell>
  );
}

export function BookingerScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Gjennomføre" },
    { label: "Bookinger", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Bookinger" crumbs={crumbs}>
      <ScreenBody html={BOOKINGER_HTML} />
    </CoachhqStubsShell>
  );
}

export function GodkjenningerScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Innsikt" },
    { label: "Godkjenninger", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Godkjenninger" crumbs={crumbs}>
      <ScreenBody html={GODKJENNINGER_HTML} />
    </CoachhqStubsShell>
  );
}

export function NotionProsjekterScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Admin" },
    { label: "Notion-prosjekter", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Innstillinger" crumbs={crumbs}>
      <ScreenBody html={NOTION_PROSJEKTER_HTML} />
    </CoachhqStubsShell>
  );
}

export function AuditLogScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Admin" },
    { label: "Audit-log", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Innstillinger" crumbs={crumbs}>
      <ScreenBody html={AUDIT_LOG_HTML} />
    </CoachhqStubsShell>
  );
}

export function SettingsScreen() {
  const crumbs: Crumb[] = [
    { label: "CoachHQ", brand: true },
    { label: "Admin" },
    { label: "Innstillinger", current: true },
  ];
  return (
    <CoachhqStubsShell activeLabel="Innstillinger" crumbs={crumbs}>
      <ScreenBody html={SETTINGS_HTML} />
    </CoachhqStubsShell>
  );
}
