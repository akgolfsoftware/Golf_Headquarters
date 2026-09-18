import { DRILLS } from "@/lib/hq/data";
import { FYS_PROGRAMS } from "@/lib/hq/planning";
import { useHq } from "@/lib/hq/store";
import type { AdminRole, AdminScreenId, UiState } from "@/lib/hq/types";
import { canAdmin } from "@/lib/hq/nav";
import {
  Axes,
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

export function BankOps({
  screen,
  tilstand,
  role,
  onScreen,
}: {
  screen: AdminScreenId;
  tilstand?: UiState;
  role: AdminRole;
  onScreen: (id: AdminScreenId) => void;
}) {
  if (!canAdmin(role, screen) || tilstand === "tilgang") {
    return (
      <StateGate tilstand="tilgang">
        <div />
      </StateGate>
    );
  }
  switch (screen) {
    case "ovelsesbibliotek":
      return <Bibliotek tilstand={tilstand} onScreen={onScreen} />;
    case "ovelse":
      return <Ovelse tilstand={tilstand} onScreen={onScreen} />;
    case "program":
      return <Program tilstand={tilstand} />;
    case "publiser-ovelse":
      return <PubliserOvelse tilstand={tilstand} onScreen={onScreen} />;
    case "moderering":
      return <Moderering tilstand={tilstand} />;
    case "versjon":
      return <Versjon tilstand={tilstand} />;
    case "avpubliser":
      return <Avpubliser tilstand={tilstand} />;
    case "abonnement":
      return <Abonnement tilstand={tilstand} />;
    case "ops-feillogg":
      return <Feillogg tilstand={tilstand} onScreen={onScreen} />;
    case "ops-triage":
      return <Triage tilstand={tilstand} onScreen={onScreen} />;
    case "ops-kontroll":
      return <Kontroll tilstand={tilstand} onScreen={onScreen} />;
    case "ops-restore":
      return <Restore tilstand={tilstand} onScreen={onScreen} />;
    case "ops-resultat":
      return <Resultat tilstand={tilstand} onScreen={onScreen} />;
    case "ops-kvittering":
      return <Kvittering tilstand={tilstand} />;
    default:
      return null;
  }
}

function Bibliotek({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tomt søk" emptyBody="Ingen treff. Banken er ikke tom.">
      <ScreenStack>
        <Kicker>Øvelsesbibliotek</Kicker>
        <Title>Pyramidefilter, ikke 30 chips</Title>
        <Lead>Synlighetskilder: privat, stall, felles. Filter er understrek.</Lead>
        {DRILLS.map((d) => (
          <Row
            key={d.id}
            kicker={d.pyramid}
            title={d.name}
            sub={`${d.area} · ${d.motor}`}
            onClick={() => onScreen("ovelse")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Ovelse({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const d = DRILLS[0];
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>{d.id}</Kicker>
        <Title>{d.name}</Title>
        <Axes pyramid={d.pyramid} area={d.area} motor={d.motor} load={d.load} press={d.press} />
        <Lead>Dose: 12 forsøk. Registreringsform: slag. Putting i fot når putting.</Lead>
        <PrimaryButton onClick={() => onScreen("program")}>Legg i program</PrimaryButton>
        <GhostButton onClick={() => onScreen("publiser-ovelse")}>Publiser til felles</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Program({ tilstand }: { tilstand?: UiState }) {
  const p = FYS_PROGRAMS[0];
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Bank · FYS-program</Kicker>
        <Title>{p.title}</Title>
        <Lead>
          Program lages før kalenderen. {p.sessionsPerWeek} økter/uke · {p.weeks} uker · {p.omrade} · hensikt{" "}
          {p.hensikt}.
        </Lead>
        {p.sessions.map((s) => (
          <Panel key={s.title}>
            <Seksjon>{s.title}</Seksjon>
            {s.exercises.map((e) => (
              <p key={e.name} className="m-0 text-sm">
                {e.name} · {e.planSets}×{e.planReps} @ {e.planKg} kg
              </p>
            ))}
          </Panel>
        ))}
        <StatusText>Lagret i bank · ikke en kalender-serie ennå</StatusText>
        <GhostButton>Ny økt i programmet</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function PubliserOvelse({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Publiser øvelse</Kicker>
        <Title>Til felles bank</Title>
        <Lead>Manglende felt stopper sending. Sendt er ikke godkjent.</Lead>
        <PrimaryButton onClick={() => onScreen("moderering")}>Send til moderering</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Moderering({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom kø" emptyBody="Ingen forespørsler.">
      <ScreenStack>
        <Kicker>Moderering</Kicker>
        <Title>Publiseringsforespørsler</Title>
        <Row kicker="ØV-2105" title="Chip 30 m" sub="Sofie Aas" meta="venter" />
        <GhostButton danger>Avvis med begrunnelse</GhostButton>
        <PrimaryButton>Godkjenn</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Versjon({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Versjonering</Kicker>
        <Title>ØV-2105</Title>
        <Lead>Ny versjon eller privat kopi. Allerede avgjort kan ikke kjøres om.</Lead>
        <Row title="v3 · felles" meta="gjeldende" />
        <Row title="v2 · felles" meta="arkiv" />
        <GhostButton>Lag privat kopi</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Avpubliser({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Eierskap</Kicker>
        <Title>Avpubliser ØV-2105</Title>
        <Lead>Avpublisert forsvinner fra felles. Privat kopi kan bli igjen.</Lead>
        <PrimaryButton danger>Avpubliser</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Abonnement({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Abonnement</Kicker>
        <Title>Oversikt uten regnskap</Title>
        <Lead>Ingen Fiken, ingen trekk. Lesende status.</Lead>
        <Row title="AK Golf Academy" sub="aktiv · 34 plasser" />
        <Row title="WANG Golf" sub="aktiv · se WANG-flate" />
      </ScreenStack>
    </StateGate>
  );
}

function Feillogg({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const health = useHq((s) => s.opsHealth);
  const setHealth = useHq((s) => s.setOpsHealth);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Feillogg</Kicker>
        <Title>Alarmsignal</Title>
        <StatusText tone={health === "ok" ? "ok" : "haste"}>
          {health === "ok" ? "Helse ok" : health === "429" ? "Health 429" : "Helse degraded"}
        </StatusText>
        <Lead>Ingen alarm forsøkt er en tilstand. Rolle avvist stopper her for coach.</Lead>
        <div className="flex flex-wrap gap-2">
          {(["ok", "degraded", "429"] as const).map((h) => (
            <GhostButton key={h} onClick={() => setHealth(h)}>
              {h}
            </GhostButton>
          ))}
        </div>
        <Row kicker="AL-19" title="Skrivekø hopet seg" sub="ingen restore forsøkt" onClick={() => onScreen("ops-triage")} />
      </ScreenStack>
    </StateGate>
  );
}

function Triage({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Triage</Kicker>
        <Title>AL-19</Title>
        <Lead>Klassifiser før noen trykker restore. Restore mot produksjon finnes ikke.</Lead>
        <PrimaryButton onClick={() => onScreen("ops-kontroll")}>Åpne kontrolløkt</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Kontroll({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Kontrolløkt</Kicker>
        <Title>Velg backup</Title>
        <Lead>Ikke valgt backup stopper. Restore skjer mot isolert klon.</Lead>
        <Row title="backup 17.09 21:00" sub="klon-klar" onClick={() => onScreen("ops-restore")} />
        <Row title="backup 16.09 21:00" sub="klon-klar" />
      </ScreenStack>
    </StateGate>
  );
}

function Restore({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Restore</Kicker>
        <Title>Mot isolert klon</Title>
        <Lead>Ugyldig mål avvises. Produksjon er ikke et mål.</Lead>
        <Panel>
          <Seksjon>Mål</Seksjon>
          <p className="m-0 text-sm">klon-restore-19 · isolert</p>
        </Panel>
        <PrimaryButton onClick={() => onScreen("ops-resultat")}>Kjør lokal prøve</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Resultat({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Resultat</Kicker>
        <Title>Lokal prøve</Title>
        <StatusText tone="ok">Lokal prøve bestått</StatusText>
        <Lead>Restore ukjent og restore feilet er egne. Rollback vurderes her.</Lead>
        <GhostButton onClick={() => onScreen("ops-kvittering")}>Skriv kvittering</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Kvittering({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Hendelseskvittering</Kicker>
        <Title>AL-19 lukket</Title>
        <Lead>Audit skrevet. Ingen produksjonsmutasjon i denne flyten.</Lead>
        <StatusText>Kvittert · 17.09</StatusText>
      </ScreenStack>
    </StateGate>
  );
}
