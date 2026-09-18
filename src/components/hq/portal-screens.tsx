import type { PortalRole, PortalScreenId, UiState } from "@/lib/hq/types";
import { visibleMeg } from "@/lib/hq/nav";
import { useHq } from "@/lib/hq/store";
import { DataScreens } from "./data-screens";
import { GameplanScreens } from "./gameplan";
import { Varsler } from "./inbox-agent";
import { PortalCore } from "./portal-core";
import { PortalMore } from "./portal-more";
import { Kicker, Lead, Row, ScreenStack, Title, GhostButton } from "./ui";
import { PORTAL_TITLES } from "@/lib/hq/types";

const CORE: PortalScreenId[] = [
  "i-dag",
  "plan",
  "oktoppskrift",
  "live-slag",
  "live-ovelse",
  "oppsummering",
  "analyse",
  "live-desktop",
];

const MORE: PortalScreenId[] = [
  "mal",
  "fremgang",
  "coachkontakt",
  "runder",
  "scorekort",
  "aerlig",
  "utfordringer",
  "utfordring",
  "tek-plan",
];

const DATA: PortalScreenId[] = [
  "datakilder",
  "forhold",
  "datagolf",
  "stasjon",
  "kurve",
  "talent",
  "banegrunnlag",
  "trackman",
  "trackman-okt",
  "bag",
];

export function PortalScreen({
  screen,
  role,
  tilstand,
  onScreen,
}: {
  screen: PortalScreenId;
  role: PortalRole;
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  if (screen === "meg") return <Meg role={role} onScreen={onScreen} />;
  if (screen === "varsler") return <Varsler tilstand={tilstand} />;
  if (CORE.includes(screen)) {
    return <PortalCore screen={screen} tilstand={tilstand} onScreen={onScreen} />;
  }
  if (MORE.includes(screen)) {
    return <PortalMore screen={screen} role={role} tilstand={tilstand} onScreen={onScreen} />;
  }
  if (DATA.includes(screen)) {
    return <DataScreens screen={screen} tilstand={tilstand} onScreen={onScreen} />;
  }
  return <GameplanScreens screen={screen} tilstand={tilstand} onScreen={onScreen} />;
}

function Meg({
  role,
  onScreen,
}: {
  role: PortalRole;
  onScreen: (id: PortalScreenId) => void;
}) {
  const groups = visibleMeg(role);
  const mode = useHq((s) => s.playerMode);
  const setMode = useHq((s) => s.setPlayerMode);
  return (
    <div className="px-4 py-4">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Meg</Kicker>
          <Title>Mina Løken</Title>
          <Lead>
            {mode === "amator"
              ? "Amatør: enkle økter som default. Alle funksjoner er tilgjengelige."
              : "Proff: A–K, perioder og RIR synlig. Samme data som amatør."}
          </Lead>
        </div>
        <div className="flex gap-2">
          <GhostButton className={mode === "amator" ? "border-grafitt-900" : ""} onClick={() => setMode("amator")}>
            Amatør
          </GhostButton>
          <GhostButton className={mode === "proff" ? "border-grafitt-900" : ""} onClick={() => setMode("proff")}>
            Proff
          </GhostButton>
        </div>
        {groups.map((g) => (
          <section key={g.heading}>
            <Kicker>{g.heading}</Kicker>
            {g.items.map((id) => (
              <Row key={id} title={PORTAL_TITLES[id]} onClick={() => onScreen(id)} />
            ))}
          </section>
        ))}
      </ScreenStack>
    </div>
  );
}