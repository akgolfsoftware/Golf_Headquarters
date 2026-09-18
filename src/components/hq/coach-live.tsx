import { SG, STALL, TODAY_PLAYER } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { AdminScreenId, UiState } from "@/lib/hq/types";
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
} from "./ui";

export function CoachLive({
  screen,
  tilstand,
  onScreen,
}: {
  screen: AdminScreenId;
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  switch (screen) {
    case "okt-individuell":
      return <OktInd tilstand={tilstand} onScreen={onScreen} />;
    case "okt-gruppe":
      return <OktGrp tilstand={tilstand} onScreen={onScreen} />;
    case "live-coach":
      return <LiveCoach tilstand={tilstand} onScreen={onScreen} />;
    case "live-gruppe":
      return <LiveGrp tilstand={tilstand} onScreen={onScreen} />;
    case "oppsummering-coach":
      return <OppsumCoach tilstand={tilstand} />;
    case "live-oversikt":
      return <LiveOversikt tilstand={tilstand} onScreen={onScreen} />;
    case "stall":
      return <Stall tilstand={tilstand} onScreen={onScreen} />;
    case "stall-analyse":
      return <StallAnalyse tilstand={tilstand} />;
    default:
      return null;
  }
}

function OktInd({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Øktdetalj · individuell</Kicker>
        <Title>Teknikk · Jonas Five</Title>
        <StatusText>Bekreftet · starter 12:30</StatusText>
        <Lead>Studio 2 · 50 min. Kontakt og lavpunkt jern 7. Video to vinkler.</Lead>
        <PrimaryButton onClick={() => onScreen("live-coach")}>Start gjennomføring</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function OktGrp({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Øktdetalj · gruppe</Kicker>
        <Title>Spillsimulering · GFGK 3</Title>
        <StatusText>Bekreftet</StatusText>
        <Lead>6 spillere. Oppmøte og øvelse registreres hver for seg.</Lead>
        {["Mina Løken", "Iver Sandnes", "Emil Berg", "Nora Tveit"].map((n) => (
          <Row key={n} title={n} meta="ikke møtt" />
        ))}
        <PrimaryButton onClick={() => onScreen("live-gruppe")}>Start gruppe-live</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function LiveCoach({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const shots = useHq((s) => s.shots);
  const add = useHq((s) => s.addShot);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker tone="haste">Gjennomføring · individuell</Kicker>
        <Title>Jonas Five</Title>
        <Lead>Samme mønster som PlayerHQ. Kontekstpanel kan foldes. Coach tetthet.</Lead>
        <Metric label="Registrert" value={String(shots)} hint="ikke 0 ved tomt felt — feltet er 0 forsøk" />
        <PrimaryButton onClick={add}>Registrer</PrimaryButton>
        <GhostButton onClick={() => onScreen("oppsummering-coach")}>Oppsummer</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function LiveGrp({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Gjennomføring · gruppe</Kicker>
        <Title>Oppmøte og øvelse</Title>
        <Row title="Mina Løken" meta="møtt" />
        <Row title="Iver Sandnes" meta="ikke registrert" />
        <Row title="Emil Berg" meta="delvis" />
        <PrimaryButton onClick={() => onScreen("oppsummering-coach")}>Avslutt gruppe</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function OppsumCoach({ tilstand }: { tilstand?: UiState }) {
  const save = useHq((s) => s.save);
  const setSave = useHq((s) => s.setSave);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Oppsummering · coach</Kicker>
        <Title>Lagret er ikke delt</Title>
        <StatusText tone="warn">
          {save === "ukjent" ? "Deling · ukjent utfall · Kontroller" : "Ikke delt"}
        </StatusText>
        <Lead>Førstegangsdeling og oppdatering er ulike feil. Kan gjenopptas.</Lead>
        <div className="flex flex-col gap-3 md:flex-row">
          <PrimaryButton onClick={() => setSave("lagret")}>Lagre</PrimaryButton>
          <GhostButton onClick={() => setSave("ukjent")}>Del med spiller</GhostButton>
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function LiveOversikt({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Live-oversikt</Kicker>
        <Title>Pågående økter</Title>
        <Row
          kicker="pågår"
          title="Mina · nærspill"
          sub="puls 2 min siden"
          onClick={() => onScreen("live-coach")}
        />
        <Row kicker="ukjent" title="Jonas · teknikk" sub="ingen puls" meta="ukjent · ingen puls" />
        <Row kicker="avsluttet" title="Emil · putting" sub="lagring ikke bekreftet" />
      </ScreenStack>
    </StateGate>
  );
}

function Stall({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom stall" emptyBody="Ingen spillere tildelt.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Stall</Kicker>
          <Title>34 er et tall vi ikke later som</Title>
          <Lead>Demoen viser {STALL.length} spillere. Langt navn bryter ikke raden. Kort åpnes uten å miste listen.</Lead>
        </div>
        {STALL.map((p) => (
          <Row
            key={p.id}
            kicker={`HCP ${p.hcp}`}
            title={p.name}
            sub={p.flag ?? p.next}
            onClick={() => onScreen("stall-analyse")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function StallAnalyse({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Mina Løken</Kicker>
        <Title>Stallreise og analyse</Title>
        <Lead>Analyse med manglende kategori vises som {SG.find((s) => s.tone === "ukjent")?.value}.</Lead>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {SG.map((s) => (
            <Metric key={s.cat} label={s.cat} value={s.value} hint={s.tone === "ukjent" ? "mangler" : "30 d"} />
          ))}
        </div>
        <Panel>
          <Seksjon>Siste økt</Seksjon>
          <p className="m-0 text-sm">{TODAY_PLAYER.title} · planlagt i dag</p>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}
