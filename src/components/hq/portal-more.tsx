import { CHALLENGES, GOALS, ROUNDS, SCORECARD } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { PortalScreenId, PortalRole, UiState } from "@/lib/hq/types";
import { canPortal } from "@/lib/hq/nav";
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

export function PortalMore({
  screen,
  tilstand,
  role,
  onScreen,
}: {
  screen: PortalScreenId;
  tilstand?: UiState;
  role: PortalRole;
  onScreen: (id: PortalScreenId) => void;
}) {
  if (!canPortal(role, screen) || tilstand === "tilgang") {
    return (
      <StateGate tilstand="tilgang">
        <div />
      </StateGate>
    );
  }
  switch (screen) {
    case "mal":
      return <Mal tilstand={tilstand} onScreen={onScreen} />;
    case "fremgang":
      return <Fremgang tilstand={tilstand} />;
    case "coachkontakt":
      return <Coachkontakt tilstand={tilstand} role={role} />;
    case "runder":
      return <Runder tilstand={tilstand} onScreen={onScreen} />;
    case "scorekort":
      return <Scorekort tilstand={tilstand} />;
    case "aerlig":
      return <Aerlig tilstand={tilstand} />;
    case "utfordringer":
      return <Utfordringer tilstand={tilstand} onScreen={onScreen} />;
    case "utfordring":
      return <Utfordring tilstand={tilstand} />;
    case "tek-plan":
      return <TekPlan tilstand={tilstand} />;
    case "varsler":
      return null;
    default:
      return null;
  }
}

function Mal({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const draft = useHq((s) => s.goalDraft);
  const setDraft = useHq((s) => s.setGoalDraft);
  return (
    <StateGate tilstand={tilstand} emptyTitle="Første mål" emptyBody="Ingen startverdi ennå. Vi later ikke som 0.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Mål</Kicker>
          <Title>Liste, opprett, endre</Title>
          <Lead>MÅLT, ESTIMAT og PLANLAGT er ulike. Bland dem ikke i samme tall.</Lead>
        </div>
        {GOALS.map((g) => (
          <Row
            key={g.id}
            kicker={g.kind}
            title={g.title}
            sub={`start ${g.start} · nå ${g.now} · mål ${g.target}`}
            onClick={() => onScreen("fremgang")}
          />
        ))}
        <Panel>
          <Seksjon>Nytt mål</Seksjon>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Skriv målet med egne ord"
            className="h-12 rounded-control border border-sand-400 bg-hevet px-3 text-base"
          />
          <GhostButton disabled={!draft} onClick={() => setDraft("")}>
            Lagre utkast
          </GhostButton>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}

function Fremgang({ tilstand }: { tilstand?: UiState }) {
  const g = GOALS[0];
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>{g.kind}</Kicker>
        <Title>{g.title}</Title>
        <Lead>For lite grunnlag vises som manglende, ikke som flat linje i null.</Lead>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Start" value={g.start} />
          <Metric label="Nå" value={g.now} />
          <Metric label="Mål" value={g.target} />
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function Coachkontakt({ tilstand, role }: { tilstand?: UiState; role: PortalRole }) {
  if (role === "GRATIS") {
    return (
      <StateGate tilstand="tilgang">
        <div />
      </StateGate>
    );
  }
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>TR-7101</Kicker>
        <Title>Melding til Sofie Aas</Title>
        <StatusText>Låst mottaker</StatusText>
        <Lead>Du kan ikke bytte coach i tråden. Ingen tildelt coach gir egen tomtilstand, ikke denne.</Lead>
        <Panel>
          <p className="m-0 text-sm">Kontekst: nærspill 30 m · uke 38.</p>
        </Panel>
        <PrimaryButton>Send</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Runder({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Ingen runder" emptyBody="Tomt arkiv. Ikke 0 i scoring.">
      <ScreenStack>
        <Kicker>Runder</Kicker>
        <Title>Nivåvalg kommer etter runden</Title>
        {ROUNDS.map((r) => (
          <Row
            key={r.id}
            kicker={r.date}
            title={r.course}
            sub={r.score == null ? "ufullstendig · —" : `${r.score} · ${r.toPar}`}
            meta={r.status}
            onClick={() => onScreen("scorekort")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Scorekort({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>R-6201</Kicker>
        <Title>Onsøy · 12.09</Title>
        <Lead>Korrigering er egen handling. Duplikat og ukjent utfall vises som tekst.</Lead>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="font-meta text-2xs uppercase tracking-meta text-grafitt-500">
                <th className="py-2">Hull</th>
                <th>Par</th>
                <th>Slag</th>
                <th>Putt</th>
              </tr>
            </thead>
            <tbody>
              {SCORECARD.map((h) => (
                <tr key={h.hole} className="border-t border-sand-200">
                  <td className="py-2">{h.hole}</td>
                  <td>{h.par}</td>
                  <td className="font-meta">{h.score}</td>
                  <td className="font-meta">{h.putts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <GhostButton>Korriger hull 5</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Aerlig({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Ærlig analysegrunnlag</Kicker>
        <Title>Detaljnivå styrer kravet</Title>
        <Lead>Uten FIR på par 3 vises tomt felt, ikke false. Ufullstendig runde er ikke skjult som 0.</Lead>
        <Row title="Full detalj" sub="krever putt per hull" />
        <Row title="Score only" sub="ingen SG" />
      </ScreenStack>
    </StateGate>
  );
}

function Utfordringer({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Ingen utfordringer" emptyBody="Gruppen har ingen aktive.">
      <ScreenStack>
        <Kicker>Gruppe</Kicker>
        <Title>Utfordringer</Title>
        {CHALLENGES.map((c) => (
          <Row
            key={c.id}
            kicker={c.group}
            title={c.title}
            sub={c.ends}
            meta={c.joined ? "påmeldt" : "åpen"}
            onClick={() => onScreen("utfordring")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Utfordring({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>UTF-4407</Kicker>
        <Title>12 putter fra 2 m</Title>
        <Lead>Avmeldt er en tilstand. Deltakere vises med navn, ikke anonyme poengtavler.</Lead>
        <Row title="Mina Løken" meta="8 / 12" />
        <Row title="Emil Berg" meta="—" />
        <GhostButton danger>Meld av</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function TekPlan({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Teknisk plan · les</Kicker>
        <Title>Video og bilde, ikke redigering</Title>
        <Lead>PlayerHQ 390. TrackMan-mål redigeres av coach. PEI-test som kilde er parkert.</Lead>
        <Panel>
          <Seksjon>Nåværende nøkkel</Seksjon>
          <p className="m-0 text-sm">Lavpunkt foran ball · jern 7. Sist oppdatert 9. sept.</p>
        </Panel>
        <Panel>
          <Seksjon>Video</Seksjon>
          <p className="m-0 text-sm text-grafitt-600">Kilde finnes. Avspilling er lokal. Ingen autoplay.</p>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}
