import { BAG, SOURCES } from "@/lib/hq/data";
import type { PortalScreenId, UiState } from "@/lib/hq/types";
import {
  GhostButton,
  Kicker,
  Lead,
  Metric,
  Panel,
  PrimaryButton,
  Row,
  ScreenStack,
  Seksjon,
  StateGate,
  StatusText,
  Title,
  Unknown,
} from "./ui";

export function DataScreens({
  screen,
  tilstand,
  onScreen,
}: {
  screen: PortalScreenId;
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  switch (screen) {
    case "datakilder":
      return <Datakilder tilstand={tilstand} onScreen={onScreen} />;
    case "forhold":
      return <Forhold tilstand={tilstand} />;
    case "datagolf":
      return <DataGolf tilstand={tilstand} onScreen={onScreen} />;
    case "stasjon":
      return <Stasjon tilstand={tilstand} />;
    case "kurve":
      return <Kurve tilstand={tilstand} />;
    case "talent":
      return <Talent tilstand={tilstand} />;
    case "banegrunnlag":
      return <Banegrunnlag tilstand={tilstand} />;
    case "trackman":
      return <Trackman tilstand={tilstand} onScreen={onScreen} />;
    case "trackman-okt":
      return <TrackmanOkt tilstand={tilstand} />;
    case "bag":
      return <Bag tilstand={tilstand} />;
    default:
      return null;
  }
}

function Datakilder({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Datakilder</Kicker>
        <Title>Status per kilde</Title>
        <Lead>Delvis kildefeil er ikke «ingen data». Ukoblet public-id er ikke tomt arkiv.</Lead>
        {SOURCES.map((s) => (
          <Row
            key={s.name}
            kicker={s.status}
            title={s.name}
            sub={s.detail}
            onClick={s.name === "DataGolf" ? () => onScreen("datagolf") : s.name === "TrackMan" ? () => onScreen("trackman") : undefined}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Forhold({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Manuell forholdssimulering</Kicker>
        <Title>Ikke nåbar fra bekreftet rute</Title>
        <Lead>Standard: still. Endret er merket. Dette er hypotese, ikke målt runde.</Lead>
        <StatusText>Standard · 12 m/s mot · 12 °C</StatusText>
        <GhostButton>Endre vind</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function DataGolf({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>DataGolf</Kicker>
        <Title>Sammenligning med kildemerking</Title>
        <Lead>Proffreferanse er merket. Uten proff vises egen kurve alene.</Lead>
        <Metric label="Approach vs Tour" value="−0,41" hint="kilde: DataGolf 2026" />
        <GhostButton onClick={() => onScreen("stasjon")}>Åpne stasjon</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Stasjon({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Stasjon</Kicker>
        <Title>Lagret utfordring</Title>
        <Lead>Lagret er lokal. Den er ikke en utfordring i gruppen før den deles.</Lead>
        <StatusText>Lagret · ikke delt</StatusText>
      </ScreenStack>
    </StateGate>
  );
}

function Kurve({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Min kurve</Kicker>
        <Title>Egne turneringsrunder</Title>
        <Lead>Ikke koblet til publicPlayerId gir denne teksten, ikke en tom graf som ser ut som null.</Lead>
        <Panel>
          <Seksjon>Tilkobling</Seksjon>
          <p className="m-0 text-sm">
            Public player-id: <Unknown />
          </p>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}

function Talent({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Talent</Kicker>
        <Title>Mitt nivå, roadmap, sammenligning</Title>
        <Lead>Uten kohort vises eget nivå. Anonymisert sammenligning har ikke navn.</Lead>
        <Row title="Mitt nivå" sub="HCP 8,2 · alderskohort på" />
        <Row title="Roadmap" sub="Approach først" />
        <Row title="Sammenligning" sub="anonymisert · 14 i kohort" />
      </ScreenStack>
    </StateGate>
  );
}

function Banegrunnlag({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Banegrunnlag</Kicker>
        <Title>Planlagt kvalitetskontroll</Title>
        <Lead>Manglende tee eller green er merket. Trenerkvittering er planlagt, ikke utført.</Lead>
        <Row title="Onsøy GK" sub="komplett geometri" meta="ok" />
        <Row title="Hankø GK" sub="mangler green 12" meta="mangler" />
        <StatusText tone="warn">Planlagt trenerkvittering · ikke utført</StatusText>
      </ScreenStack>
    </StateGate>
  );
}

function Trackman({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>TrackMan-import</Kicker>
        <Title>Kildeenheter synlig</Title>
        <Lead>Ukjent enhet, duplikat og importfeil er egne tilstander. Vi gjetter ikke klubb.</Lead>
        <Row
          kicker="TM-7301"
          title="Økt 11.09 · Studio 1"
          sub="enhet kjent · 214 treff"
          onClick={() => onScreen("trackman-okt")}
        />
        <Row kicker="ukjent enhet" title="Fil uten serienummer" sub="ikke importert" />
        <PrimaryButton>Velg fil</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function TrackmanOkt({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>TM-7301</Kicker>
        <Title>Studio 1 · 11.09</Title>
        <Metric label="Treff" value="214" />
        <Metric label="Jern 7 bære" value="152 m" hint="kildeenhet meter" />
        <Lead>Klubb-mapping mangler på 11 treff. De vises som ukjent klubb.</Lead>
      </ScreenStack>
    </StateGate>
  );
}

function Bag({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Min bag</Kicker>
        <Title>Uttrykkelig valg</Title>
        <Lead>Uten importert kilde vises manuell. Grunnlagsgrense: vi viser ikke 0 i bære uten treff.</Lead>
        {BAG.map((b) => (
          <Row
            key={b.club}
            kicker={b.source}
            title={b.club}
            sub={`loft ${b.loft}`}
            meta={b.chosen ? "i bag" : "ikke valgt"}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}
