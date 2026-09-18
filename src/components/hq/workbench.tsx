import { useState } from "react";
import { DRILLS, STALL, WEEK_BLOCKS } from "@/lib/hq/data";
import { FYS_PROGRAMS, H_SKISSE, PERIOD_TYPES } from "@/lib/hq/planning";
import { useHq } from "@/lib/hq/store";
import type { AdminScreenId, UiState } from "@/lib/hq/types";
import { InspectorPortal } from "./admin-shell";
import {
  Axes,
  GhostButton,
  Kicker,
  Lead,
  Meta,
  Panel,
  PrimaryButton,
  Row,
  ScreenStack,
  Seksjon,
  StateGate,
  StatusText,
  Title,
  cn,
} from "./ui";

export function WorkbenchScreens({
  screen,
  tilstand,
  onScreen,
}: {
  screen: AdminScreenId;
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  switch (screen) {
    case "planlegge":
      return <Planlegge tilstand={tilstand} onScreen={onScreen} />;
    case "workbench":
      return <Uke tilstand={tilstand} onScreen={onScreen} />;
    case "publiser":
      return <Publiser tilstand={tilstand} />;
    case "gruppe":
      return <Gruppe tilstand={tilstand} />;
    case "arsplan":
      return <Arsplan tilstand={tilstand} onScreen={onScreen} />;
    case "periode":
      return <Periode tilstand={tilstand} onScreen={onScreen} />;
    case "maned":
      return <Maned tilstand={tilstand} onScreen={onScreen} />;
    case "oktbygger":
      return <Oktbygger tilstand={tilstand} onScreen={onScreen} />;
    case "stall-dag":
      return <StallDag tilstand={tilstand} />;
    case "kalender-uke":
      return <KalenderUke tilstand={tilstand} onScreen={onScreen} />;
    case "kalender-dag":
      return <KalenderDag tilstand={tilstand} onScreen={onScreen} />;
    case "kalender-maned":
      return <KalenderManed tilstand={tilstand} onScreen={onScreen} />;
    case "min-uke":
      return <MinUke tilstand={tilstand} />;
    default:
      return null;
  }
}

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const HOUR_H = 52;

function parseHour(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function Uke({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const player = useHq((s) => s.selectedPlayer);
  const name = STALL.find((p) => p.id === player)?.name ?? "Mina Løken";
  const [sel, setSel] = useState("b2");
  const [serieOpen, setSerieOpen] = useState(false);
  const seriesNote = useHq((s) => s.seriesNote);
  const setSeriesNote = useHq((s) => s.setSeriesNote);
  const block = WEEK_BLOCKS.find((b) => b.id === sel) ?? WEEK_BLOCKS[1];

  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom uke" emptyBody="Ingen blokker. Kopier uke eller sett inn program.">
      <InspectorPortal sheet={Boolean(sel)}>
        <div className="flex h-full flex-col">
          <div className="border-b border-sand-200 px-5 py-4">
            <Meta>Valgt økt</Meta>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <h2 className="m-0 font-display text-xl font-semibold">{block.title}</h2>
            <p className="m-0 text-sm text-grafitt-600">
              {block.day} {block.start}–{block.end} · {block.place} · {block.player}
            </p>
            <StatusText tone={block.pub === "konflikt" ? "haste" : block.pub === "utkast" ? "warn" : "ok"}>
              {block.pub === "konflikt" ? "Konflikt · tett mot forslag" : block.pub === "utkast" ? "Utkast · ikke publisert" : "Publisert"}
            </StatusText>
            <PrimaryButton onClick={() => onScreen("oktbygger")}>Åpne øktbygger</PrimaryButton>
            <GhostButton onClick={() => setSerieOpen(true)}>Gjenta som serie</GhostButton>
            <GhostButton onClick={() => onScreen("publiser")}>Publiser uke</GhostButton>
          </div>
        </div>
      </InspectorPortal>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Workbench · uke 38</Kicker>
          <Title>{name}</Title>
          <Lead>Tidskalender. Stiplet = program. Hel = publisert. Konflikt vises som tekst, ikke farge alene.</Lead>
          <StatusText tone="warn">1 utkast · 1 konflikt · mottaker låst</StatusText>
        </div>
        {seriesNote ? <StatusText>{seriesNote}</StatusText> : null}
        {serieOpen ? (
          <Panel>
            <Seksjon>Apple-serie</Seksjon>
            <Lead>Program først. Ukedager + slutt. Flere serier i samme uke er lov. Kollisjon = advarsel.</Lead>
            <p className="m-0 text-sm">
              {FYS_PROGRAMS[0].title} · {FYS_PROGRAMS[0].sessionsPerWeek} økter/uke · {FYS_PROGRAMS[0].weeks} uker
            </p>
            <PrimaryButton
              onClick={() => {
                setSeriesNote("Serie FYS man/ons/fre × 8 uker · peker på FYS høst. Putting tir/tor kan ligge ved siden av.");
                setSerieOpen(false);
              }}
            >
              Opprett man/ons/fre × 8 uker
            </PrimaryButton>
            <GhostButton onClick={() => setSerieOpen(false)}>Avbryt</GhostButton>
          </Panel>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <GhostButton onClick={() => onScreen("arsplan")}>År</GhostButton>
          <GhostButton onClick={() => onScreen("periode")}>Periode</GhostButton>
          <GhostButton onClick={() => onScreen("maned")}>Måned</GhostButton>
          <GhostButton className="border-grafitt-900">Uke</GhostButton>
          <GhostButton onClick={() => onScreen("oktbygger")}>Økt</GhostButton>
          <GhostButton onClick={() => setSerieOpen(true)}>Gjenta</GhostButton>
        </div>

        <div className="xl:hidden">
          {WEEK_BLOCKS.map((b) => (
            <Row
              key={b.id}
              kicker={`${b.day} ${b.start}–${b.end}`}
              title={b.title}
              sub={`${b.place} · ${b.player}`}
              meta={b.pub}
              onClick={() => setSel(b.id)}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <div className="w-full min-w-full">
            <div className="grid grid-cols-8 border-b border-sand-200 pb-2">
              <span />
              {DAYS.map((d) => (
                <span key={d} className="px-1 font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-600">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-8">
              <div>
                {HOURS.map((h) => (
                  <div key={h} className="h-12 font-meta text-2xs text-grafitt-500">
                    {String(h).padStart(2, "0")}
                  </div>
                ))}
              </div>
              {DAYS.map((d) => (
                <div key={d} className="relative border-l border-sand-200">
                  {HOURS.map((h) => (
                    <div key={h} className="h-12 border-b border-sand-200" />
                  ))}
                  {WEEK_BLOCKS.filter((b) => b.day === d).map((b) => {
                    const start = parseHour(b.start);
                    const end = parseHour(b.end);
                    const top = (start - 7) * 48;
                    const height = Math.max((end - start) * 48 - 4, 36);
                    const dashed = b.pub === "utkast" || b.pub === "plan";
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSel(b.id)}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded-sm border bg-hevet px-1.5 py-1 text-left",
                          b.pub === "konflikt" ? "border-rust-500" : "border-sand-500",
                          dashed && "border-dashed",
                          sel === b.id && "border-grafitt-900",
                        )}
                        style={{ top, height }}
                      >
                        <span className="block truncate font-meta text-3xs text-grafitt-500">{b.start}</span>
                        <span className="block truncate text-xs font-medium">{b.title}</span>
                        <span className="block truncate text-2xs text-grafitt-500">{b.player.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <PrimaryButton onClick={() => onScreen("publiser")}>Publiser uke</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Planlegge({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const selected = useHq((s) => s.selectedPlayer);
  const setPlayer = useHq((s) => s.setPlayer);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Planlegge</Kicker>
          <Title>Velg mottaker</Title>
          <Lead>Mottaker følger med til uke, måned og øktbygger. Skole er lag, ikke sperre.</Lead>
        </div>
        {STALL.map((p) => (
          <Row
            key={p.id}
            title={p.name}
            sub={`HCP ${p.hcp} · ${p.next}`}
            meta={selected === p.id ? "valgt" : undefined}
            current={selected === p.id}
            onClick={() => {
              setPlayer(p.id);
              onScreen("workbench");
            }}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Publiser({ tilstand }: { tilstand?: UiState }) {
  const plan = useHq((s) => s.publishPlan);
  const exec = useHq((s) => s.publishExec);
  const save = useHq((s) => s.publishSave);
  const setPublish = useHq((s) => s.setPublish);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Publiser</Kicker>
          <Title>Tre statuser, ikke én grønn</Title>
          <Lead>Plan, gjennomføring og lagring er separate. Overlapp og «i dag» gir advarsel, ikke auto-stopp.</Lead>
        </div>
        <Panel>
          <Seksjon>Plan</Seksjon>
          <StatusText tone={plan ? "ok" : "warn"}>{plan ? "Plan synlig for spiller" : "Plan · utkast"}</StatusText>
          <GhostButton onClick={() => setPublish("plan", !plan)}>{plan ? "Trekk plan" : "Publiser plan"}</GhostButton>
        </Panel>
        <Panel>
          <Seksjon>Gjennomføring</Seksjon>
          <StatusText>{exec ? "Åpen for live" : "Ikke åpnet"}</StatusText>
          <GhostButton onClick={() => setPublish("exec", !exec)}>Åpne gjennomføring</GhostButton>
        </Panel>
        <Panel>
          <Seksjon>Lagring</Seksjon>
          <StatusText tone={save === "ukjent" ? "warn" : "neutral"}>
            {save === "idle" ? "Ikke bekreftet" : save === "ukjent" ? "Sendt · ukjent utfall · Kontroller" : save}
          </StatusText>
          <div className="flex gap-3">
            <PrimaryButton onClick={() => setPublish("save", "lagret")}>Lagre</PrimaryButton>
            <GhostButton onClick={() => setPublish("save", "ukjent")}>Simuler ukjent</GhostButton>
          </div>
        </Panel>
      </ScreenStack>
    </StateGate>
  );
}

function Gruppe({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Gruppegren</Kicker>
        <Title>GFGK 3 · lørdag</Title>
        <Lead>Gruppeøkt eier tiden. Medlemsøkt kan ha lokal endring. Konflikt vises per spiller.</Lead>
        <Row kicker="10:00" title="Spillsimulering" sub="6 spillere · Onsøy" meta="gruppe" />
        <Row kicker="Mina" title="Lokal merknad: putte først" sub="endrer ikke gruppetiden" meta="lokal" />
        <Row kicker="Iver" title="Kan ikke delta" sub="prikk i stall-dag" meta="ikke delta" />
      </ScreenStack>
    </StateGate>
  );
}

function Arsplan({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const published = useHq((s) => s.yearPublished);
  const publishYear = useHq((s) => s.publishYear);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Årsplan · GolfBox-snitt 85 · H Rekrutt</Kicker>
        <Title>2026 · stiplet skisse</Title>
        <Lead>
          Alder inngår ikke. DataGolf blandes ikke inn. Publiser år = skall. Økter er tomme til du legger serie i uken.
        </Lead>
        <StatusText tone={published ? "ok" : "warn"}>
          {published ? "Skall publisert · økter fortsatt tomme" : "Skisse · ikke publisert"}
        </StatusText>
        {H_SKISSE.map((p) => (
          <Row
            key={p.kode}
            kicker={PERIOD_TYPES.find((x) => x.kode === p.kode)?.navn}
            title={p.spenn}
            sub={p.fokus}
            onClick={() => onScreen("periode")}
          />
        ))}
        <PrimaryButton onClick={publishYear}>Publiser år som skall</PrimaryButton>
        <GhostButton onClick={() => onScreen("workbench")}>Til uke</GhostButton>
      </ScreenStack>
    </StateGate>
  );
}

function Periode({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Periode</Kicker>
        <Title>Sesong · apr–sep</Title>
        <Lead>Skall lagt. Måneder arver mottaker.</Lead>
        <StatusText>Skall lagt</StatusText>
        {["april", "mai", "juni", "juli", "august", "september"].map((m) => (
          <Row key={m} title={m} onClick={() => onScreen("maned")} />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Maned({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Måned</Kicker>
        <Title>September 2026</Title>
        <Lead>Tett uke merkes. Overlapp er tekst.</Lead>
        {["Uke 36", "Uke 37", "Uke 38 · tett", "Uke 39"].map((w) => (
          <Row key={w} title={w} onClick={() => onScreen("workbench")} />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function Oktbygger({
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
          <Kicker>Øktbygger</Kicker>
          <Title>Nærspill 30 m</Title>
          <Lead>Sted først. Dose på øvelse. Ny øvelse uten felt kan ikke lagres.</Lead>
        </div>
        <Panel>
          <Seksjon>Sted</Seksjon>
          <p className="m-0 text-sm">Kortbane · Onsøy</p>
          <Meta>Legg til sted er parkert til eierskap finnes</Meta>
        </Panel>
        <Axes pyramid="TEK" area="CHIP" motor="LAV_HAST" load="TRENINGSOMRAADE" press="ALENE" />
        {DRILLS.slice(0, 2).map((d) => (
          <Row key={d.id} kicker={d.id} title={d.name} sub={`${d.area} · ${d.load}`} />
        ))}
        <GhostButton onClick={() => onScreen("ovelsesbibliotek")}>Hent fra bank</GhostButton>
        <PrimaryButton onClick={() => onScreen("workbench")}>Lagre økt</PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function StallDag({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Stall-dag</Kicker>
        <Title>Fredag 19.09</Title>
        <Lead>Felles ledig tid. Forespørsel er ikke booking.</Lead>
        <Row kicker="07:00" title="Mina · belastning" sub="konflikt mot forslag" meta="tett" />
        <Row kicker="12:30" title="Jonas · teknikk" sub="Studio 2" meta="låst" />
        <Row kicker="16:00" title="Felles ledig" sub="2 spillere uten økt" meta="ledig" />
      </ScreenStack>
    </StateGate>
  );
}

function KalenderUke({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Min kalender · uke</Kicker>
        <Title>Uke 38</Title>
        <Lead>Kollisjon og ledig som tekst. Agenda er standard på 390.</Lead>
        {WEEK_BLOCKS.map((b) => (
          <Row
            key={b.id}
            kicker={`${b.day} ${b.start}`}
            title={`${b.title} · ${b.player}`}
            sub={b.place}
            meta={b.pub === "konflikt" ? "kollisjon" : "ok"}
            onClick={() => onScreen("kalender-dag")}
          />
        ))}
      </ScreenStack>
    </StateGate>
  );
}

function KalenderDag({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Dag</Kicker>
        <Title>Onsdag 17.09</Title>
        <Row kicker="12:30" title="Teknikk · Jonas Five" onClick={() => onScreen("okt-individuell")} />
        <Row kicker="16:00" title="Nærspill · Mina Løken" meta="påbegynt" />
      </ScreenStack>
    </StateGate>
  );
}

function KalenderManed({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Måned</Kicker>
        <Title>September</Title>
        <Lead>Kun tetthet. Ingen GPS, ingen fargekake.</Lead>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onScreen("kalender-dag")}
              className="flex h-11 items-center justify-center rounded-control border border-sand-300 bg-hevet font-meta text-xs"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function MinUke({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <Kicker>Min uke</Kicker>
        <Title>Lesende, privat</Title>
        <Lead>Coachens egen uke. Ikke stallens. Ingen redigering her.</Lead>
        <Row kicker="ons" title="4 økter" meta="tett" />
        <Row kicker="fre" title="1 økt + 1 forespørsel" />
      </ScreenStack>
    </StateGate>
  );
}
