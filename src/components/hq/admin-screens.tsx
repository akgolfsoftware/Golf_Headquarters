import { ADMIN_TITLES, type AdminRole, type AdminScreenId, type UiState } from "@/lib/hq/types";
import { visibleOppsett } from "@/lib/hq/nav";
import { AdminHjem } from "./admin-hjem";
import { BankOps } from "./bank-ops";
import { CoachLive } from "./coach-live";
import { InboxAgent } from "./inbox-agent";
import { WorkbenchScreens } from "./workbench";
import { Kicker, Lead, Row, ScreenStack, Title } from "./ui";

const INBOX: AdminScreenId[] = [
  "innboks",
  "trad",
  "ko",
  "forslag",
  "bekreft",
  "resultat-caddie",
  "forkast",
  "spor",
  "spor-detalj",
];

const WORKBENCH: AdminScreenId[] = [
  "planlegge",
  "workbench",
  "publiser",
  "gruppe",
  "arsplan",
  "periode",
  "maned",
  "oktbygger",
  "stall-dag",
  "kalender-uke",
  "kalender-dag",
  "kalender-maned",
  "min-uke",
];

const LIVE: AdminScreenId[] = [
  "okt-individuell",
  "okt-gruppe",
  "live-coach",
  "live-gruppe",
  "oppsummering-coach",
  "live-oversikt",
  "stall",
  "stall-analyse",
];

export function AdminScreen({
  screen,
  role,
  tilstand,
  onScreen,
}: {
  screen: AdminScreenId;
  role: AdminRole;
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  if (screen === "hjem") return <AdminHjem tilstand={tilstand} onScreen={onScreen} />;
  if (screen === "oppsett") return <Oppsett role={role} onScreen={onScreen} />;
  if (INBOX.includes(screen)) {
    return <InboxAgent screen={screen} tilstand={tilstand} onScreen={onScreen} />;
  }
  if (WORKBENCH.includes(screen)) {
    return <WorkbenchScreens screen={screen} tilstand={tilstand} onScreen={onScreen} />;
  }
  if (LIVE.includes(screen)) {
    return <CoachLive screen={screen} tilstand={tilstand} onScreen={onScreen} />;
  }
  return <BankOps screen={screen} role={role} tilstand={tilstand} onScreen={onScreen} />;
}

function Oppsett({
  role,
  onScreen,
}: {
  role: AdminRole;
  onScreen: (id: AdminScreenId) => void;
}) {
  const groups = visibleOppsett(role);
  return (
    <ScreenStack>
      <div className="flex flex-col gap-3">
        <Kicker>Oppsett</Kicker>
        <Title>Mer, ikke en annen merkevare</Title>
        <Lead>
          Bank, drift og sjeldne flater bor her. Hovedmenyen holder de ni destinasjonene. Rolle: {role === "ADMIN" ? "admin" : "coach"}.
        </Lead>
      </div>
      {groups.map((g) => (
        <section key={g.heading}>
          <Kicker>{g.heading}</Kicker>
          {g.items.map((id) => (
            <Row key={id} title={ADMIN_TITLES[id]} onClick={() => onScreen(id)} />
          ))}
        </section>
      ))}
    </ScreenStack>
  );
}