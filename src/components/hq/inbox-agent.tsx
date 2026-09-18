import { CADDIE_QUEUE, NOTICES, RUNS, THREADS } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { AdminScreenId, PortalScreenId, UiState } from "@/lib/hq/types";
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

export function InboxAgent({
  screen,
  tilstand,
  onScreen,
}: {
  screen: AdminScreenId;
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  switch (screen) {
    case "innboks":
      return <Innboks tilstand={tilstand} onScreen={onScreen} />;
    case "trad":
      return <Trad tilstand={tilstand} />;
    case "ko":
      return <Ko tilstand={tilstand} onScreen={onScreen} />;
    case "forslag":
      return <Forslag tilstand={tilstand} onScreen={onScreen} />;
    case "bekreft":
      return <Bekreft tilstand={tilstand} onScreen={onScreen} />;
    case "resultat-caddie":
      return <ResultatCaddie tilstand={tilstand} />;
    case "forkast":
      return <Forkast tilstand={tilstand} onScreen={onScreen} />;
    case "spor":
      return <Spor tilstand={tilstand} onScreen={onScreen} />;
    case "spor-detalj":
      return <SporDetalj tilstand={tilstand} />;
    default:
      return null;
  }
}

export function Varsler({
  tilstand,
}: {
  tilstand?: UiState;
  onScreen?: (id: PortalScreenId) => void;
}) {
  const read = useHq((s) => s.noticeRead);
  const mark = useHq((s) => s.markNotice);
  return (
    <StateGate tilstand={tilstand} emptyTitle="Ingen varsler" emptyBody="Tomt er tomt. Ikke «alt i orden».">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Varsler</Kicker>
          <Title>Egen flate, ikke badge-løgn</Title>
          <Lead>Ulest betyr ulest. Vi markerer ikke lest ved å åpne listen.</Lead>
        </div>
        {NOTICES.map((n) => (
          <Panel key={n.id}>
            <Seksjon>{read[n.id] ? "Lest" : "Ulest"}</Seksjon>
            <p className="m-0 text-base font-medium">{n.title}</p>
            <p className="m-0 text-sm text-grafitt-600">{n.body}</p>
            {read[n.id] ? null : <GhostButton onClick={() => mark(n.id)}>Merk som lest</GhostButton>}
          </Panel>
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Innboks({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const filter = useHq((s) => s.inboxFilter);
  const setFilter = useHq((s) => s.setInboxFilter);
  const rows = THREADS.filter((t) => filter === "alle" || t.kind.toLowerCase() === filter);
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tomt filter" emptyBody="Ingen tråder i dette filteret.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Innboks</Kicker>
          <Title>Tre trådtyper</Title>
          <Lead>Spiller, foresatt og system. Systemtråder er ikke samtaler.</Lead>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["alle", "spiller", "foresatt", "system"] as const).map((f) => (
            <GhostButton key={f} className={filter === f ? "border-grafitt-900" : "h-11"} onClick={() => setFilter(f)}>
              {f}
            </GhostButton>
          ))}
        </div>
        {rows.map((t) => (
          <Row
            key={t.id}
            kicker={`${t.kind}${t.unread ? " · ulest" : ""}`}
            title={t.from}
            sub={t.preview}
            meta={t.time}
            onClick={() => onScreen("trad")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Trad({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>TR-7101</Kicker>
          <Title>Mina Løken</Title>
          <StatusText tone="info">Sendt · levert til kø</StatusText>
          <Lead>Kontekst: uke 38, fredagsøkt. Låst mottaker. Du kan ikke bytte spiller midt i tråden.</Lead>
        </div>
        <Panel>
          <p className="m-0 text-sm">Kan vi flytte fredag hvis styrken blir for tett?</p>
          <p className="m-0 text-xs text-grafitt-500">Mina · i dag 09:40</p>
        </Panel>
        <Panel>
          <p className="m-0 text-sm">Utkast fra deg er ikke sendt. Godkjenn i køen først hvis det gjelder planen.</p>
        </Panel>
        <PrimaryButton>Send</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Ko({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const caddie = useHq((s) => s.caddie);
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom Caddie-kø" emptyBody="Ingen utkast venter. Ingenting er auto-sendt.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Godkjenningskø</Kicker>
          <Title>Caddie-utkast</Title>
          <Lead>Hver rad er et forslag. Utførelse skjer først etter bekreftelse.</Lead>
        </div>
        {CADDIE_QUEUE.map((row) => (
          <Row
            key={row.id}
            kicker={`${row.id} · ${caddie[row.id] ?? "venter"}`}
            title={row.title}
            sub={row.sub}
            onClick={() => onScreen("forslag")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Forslag({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>CD-8401</Kicker>
          <Title>Tilbakemelding etter runde · Iver Sandnes</Title>
          <Lead>Grunnlag: runde 12.09 Onsøy, 78 slag. Utkastet er ikke sendt. «Levert» finnes ikke.</Lead>
          <StatusText tone="warn">Utkast · venter menneskelig valg</StatusText>
        </div>
        <Panel>
          <Seksjon>Utkast</Seksjon>
          <p className="m-0 text-sm leading-tekst">
            Approach fra 150 m kostet. To ganger kort-høyre. Anbefalt neste økt: startlinje jern 7, ikke mer volum.
          </p>
        </Panel>
        <div className="flex flex-col gap-3 md:flex-row">
          <PrimaryButton onClick={() => onScreen("bekreft")}>Godkjenn og send</PrimaryButton>
          <GhostButton onClick={() => onScreen("forkast")} danger>
            Forkast
          </GhostButton>
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function Bekreft({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const set = useHq((s) => s.setCaddie);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Bekreft før mutasjon</Kicker>
          <Title>Send til Iver?</Title>
          <Lead>Dette skriver en melding. Relasjon må være aktiv. Allerede behandlet kan ikke kjøres om.</Lead>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <PrimaryButton
            onClick={() => {
              set("CD-8401", "utfort");
              onScreen("resultat-caddie");
            }}
          >
            Bekreft sending
          </PrimaryButton>
          <GhostButton onClick={() => onScreen("forslag")}>Avbryt</GhostButton>
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function ResultatCaddie({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>NTF-8401</Kicker>
        <Title>Resultat</Title>
        <StatusText tone="ok">Utført · audit skrevet</StatusText>
        <Lead>Aktivitet logget. Hvis audit ikke bekreftes vises ukjent, ikke suksess.</Lead>
      </ScreenStack>
    </StateGate>
  );
}

function Forkast({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const set = useHq((s) => s.setCaddie);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Forkast</Kicker>
        <Title>Forkast CD-8401</Title>
        <Lead>Forkast skriver audit. Utkastet forsvinner fra køen. Spilleren får ingenting.</Lead>
        <PrimaryButton
          danger
          onClick={() => {
            set("CD-8401", "forkastet");
            onScreen("ko");
          }}
        >
          Forkast med spor
        </PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Spor({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>AgenticOS-spor</Kicker>
          <Title>Kjøringer i dag</Title>
          <Lead>Forsøkt er ikke bekreftet. Skrevet er ikke publisert.</Lead>
        </div>
        {RUNS.map((r) => (
          <Row
            key={r.id}
            kicker={r.state}
            title={r.name}
            sub={`${r.id} · startet ${r.started} · skrev data: nei`}
            onClick={() => onScreen("spor-detalj")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function SporDetalj({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>KJ-098</Kicker>
        <Title>Ukeplan Mina Løken</Title>
        <StatusText tone="warn">Før godkjenning · ingen mutasjon</StatusText>
        <Lead>Forsøkt mot bekreftet: 1 forslag, 0 skrevet. Avvist ville etterlate planen uendret.</Lead>
        <Panel>
          <Seksjon>Utfall</Seksjon>
          <p className="m-0 text-sm">Venter. Ukjent utfall vises som ukjent, ikke som feil og ikke som suksess.</p>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}
