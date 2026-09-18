import { COURSES } from "@/lib/hq/data";
import { useHq, type PositionState } from "@/lib/hq/store";
import type { PortalScreenId, UiState } from "@/lib/hq/types";
import {
  GhostButton,
  Kicker,
  Lead,
  Panel,
  PrimaryButton,
  Row,
  ScreenStack,
  Seksjon,
  StateGate,
  StatusText,
  Title,
} from "./ui";

const POS: Record<string, string> = {
  "ikke-forespurt": "Ikke forespurt · vi har ikke spurt om posisjon",
  avvist: "Avvist · appen har ikke posisjon",
  utilgjengelig: "Utilgjengelig · enheten gir ingenting",
  gammel: "Gammel / usikker · sist kjent er for gammel",
};

export function GameplanScreens({
  screen,
  tilstand,
  onScreen,
}: {
  screen: PortalScreenId;
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  switch (screen) {
    case "gameplan":
      return <Bibliotek tilstand={tilstand} onScreen={onScreen} />;
    case "hull":
      return <Hull tilstand={tilstand} onScreen={onScreen} />;
    case "posisjon":
      return <Posisjon tilstand={tilstand} />;
    case "offline":
      return <Offline tilstand={tilstand} />;
    default:
      return null;
  }
}

function Bibliotek({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tomt bibliotek" emptyBody="Ingen baner lastet. Ikke et kart med 0 hull.">
      <ScreenStack>
        <Kicker>Gameplan</Kicker>
        <Title>Banebibliotek</Title>
        <Lead>Tre kilder som tekst: geometri, scorekort, notat. Ingen GPS-løgn.</Lead>
        {COURSES.map((c) => (
          <Row
            key={c.id}
            kicker={`${c.holes} hull`}
            title={c.name}
            sub={c.geo}
            onClick={() => onScreen("hull")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Hull({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Onsøy · hull 7</Kicker>
        <Title>Par 4 · 382 m</Title>
        <Lead>Kart utilgjengelig vises som tekst. Sikte er notat, ikke live overlay.</Lead>
        <Panel>
          <Seksjon>Tre kilder</Seksjon>
          <p className="m-0 text-sm">Geometri: komplett. Scorekort: 4. Notat: «miss høyre rough».</p>
        </Panel>
        <GhostButton onClick={() => onScreen("posisjon")}>Posisjonstilstand</GhostButton>
        <GhostButton onClick={() => onScreen("offline")}>Frakoblet kø</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Posisjon({ tilstand }: { tilstand?: UiState }) {
  const position = useHq((s) => s.position);
  const setPosition = useHq((s) => s.setPosition);
  const shown = tilstand === "feil" ? "utilgjengelig" : position;
  return (
    <StateGate tilstand={tilstand === "feil" ? "normal" : tilstand}>
      <ScreenStack>
        <Kicker>Posisjon</Kicker>
        <Title>Fire tilstander. Ingen geolocation.</Title>
        <StatusText tone="warn">{POS[shown]}</StatusText>
        <Lead>Vi later ikke som at kartet vet hvor du står.</Lead>
        <div className="flex flex-col gap-2">
          {(Object.keys(POS) as PositionState[]).map((k) => (
            <GhostButton key={k} className={shown === k ? "border-grafitt-900" : ""} onClick={() => setPosition(k)}>
              {POS[k]}
            </GhostButton>
          ))}
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function Offline({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Frakoblet</Kicker>
        <Title>Lokal slagkø</Title>
        <Lead>Åpen side uten nett, kald offline og synkfeil er ulike. Ukjent synkutfall = Kontroller.</Lead>
        <Row title="Slag 1 · hull 7" sub="i kø · ikke synket" meta="lokal" />
        <Row title="Slag 2 · hull 7" sub="synkfeil" meta="ukjent" />
        <PrimaryButton>Forsøk synk</PrimaryButton>
        <p className="m-0 text-xs text-grafitt-500">Vi har ikke kart-cache. Bare køen.</p>
      </ScreenStack>
    </StateGate>
  );
}
