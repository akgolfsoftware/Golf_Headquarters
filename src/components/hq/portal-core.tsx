import { AXES, GOALS, SG, TODAY_PLAYER, UNKNOWN, WEEK_PLAN } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { PortalScreenId, UiState } from "@/lib/hq/types";
import {
  Axes,
  GhostButton,
  Kicker,
  Lead,
  Meta,
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

export function PortalCore({
  screen,
  tilstand,
  onScreen,
}: {
  screen: PortalScreenId;
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  switch (screen) {
    case "i-dag":
      return <IDag tilstand={tilstand} onScreen={onScreen} />;
    case "plan":
      return <Plan tilstand={tilstand} onScreen={onScreen} />;
    case "oktoppskrift":
      return <Oktoppskrift tilstand={tilstand} onScreen={onScreen} />;
    case "live-slag":
      return <LiveSlag tilstand={tilstand} onScreen={onScreen} />;
    case "live-ovelse":
      return <LiveOvelse tilstand={tilstand} onScreen={onScreen} />;
    case "oppsummering":
      return <Oppsummering tilstand={tilstand} onScreen={onScreen} />;
    case "analyse":
      return <Analyse tilstand={tilstand} />;
    case "live-desktop":
      return <LiveDesktop tilstand={tilstand} onScreen={onScreen} />;
    default:
      return null;
  }
}

function sessionTone(status: string) {
  if (status === "pagar") return "haste" as const;
  if (status === "pauset" || status === "delvis") return "warn" as const;
  if (status === "gjennomfort") return "ok" as const;
  return "neutral" as const;
}

function sessionLabel(status: string, tilstand?: UiState) {
  if (tilstand === "pagar") return "Pågår · ikke lagret";
  if (tilstand === "pauset") return "Pauset · forsøk beholdt";
  if (tilstand === "delvis") return "Delvis gjennomført";
  if (tilstand === "gjennomfort") return "Gjennomført · se oppsummering";
  if (status === "pagar") return "Pågår · ikke lagret";
  if (status === "pauset") return "Pauset · forsøk beholdt";
  if (status === "delvis") return "Delvis gjennomført · kan gjenopptas";
  if (status === "gjennomfort") return "Gjennomført · lagret";
  return "Planlagt · ikke startet";
}

function IDag({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const status = useHq((s) => s.sessionStatus);
  const started = status === "pagar" || status === "delvis" || status === "pauset";
  return (
    <StateGate tilstand={tilstand} emptyTitle="Ingen økt i dag" emptyBody="Planen for uken har ingen økt torsdag.">
      <div className="-mx-4 flex flex-col">
        <div className="flex flex-col gap-4 bg-grafitt-900 px-[18px] py-6 text-sand-100">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-handling">
              Torsdag
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-natt-300">
              {started ? "pågår" : "planlagt"}
            </span>
          </div>
          <div className="flex items-end gap-3.5">
            <span className="font-display text-hero font-semibold tabular-nums">16:30</span>
            <span className="pb-1.5 text-sm text-natt-300">om 20 min</span>
          </div>
          <h1 className="m-0 font-display text-display-lg font-semibold uppercase leading-tett">
            {TODAY_PLAYER.title}
          </h1>
          <div className="flex items-baseline gap-2.5 border-t border-natt-700 pt-3">
            <span className="font-display text-xl font-semibold tabular-nums">Onsøy</span>
            <span className="text-sm text-natt-300">{TODAY_PLAYER.time}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (started) onScreen("live-slag");
              else onScreen("oktoppskrift");
            }}
            className="h-[60px] rounded-control bg-rust-500 font-display text-lg font-semibold uppercase tracking-[0.03em] text-hevet transition-colors duration-150 hover:bg-handling"
          >
            {started ? "Fortsett økt" : "Start økt"}
          </button>
          <button
            type="button"
            onClick={() => onScreen("oktoppskrift")}
            className="h-11 rounded-control border border-grafitt-700 bg-transparent text-base text-sand-100"
          >
            Se oppskriften
          </button>
        </div>
        <div className="flex flex-col gap-3.5 px-[18px] py-[18px]">
          <div className="flex flex-col gap-2 rounded-md border border-sand-200 bg-hevet p-3.5">
            <span className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
              Endring i planen din
            </span>
            <span className="text-base">
              Spillsimulering flyttet til <strong className="font-semibold">fredag 18.09 kl 15:00</strong>.
            </span>
            <span className="text-xs leading-normal text-grafitt-600">
              Endret av Sofie Aas i dag 11:24 · 48 timer mellom harde økter.
            </span>
          </div>
          <GhostButton className="w-full" onClick={() => onScreen("plan")}>
            Se hele uken
          </GhostButton>
          <div className="flex flex-col gap-2 rounded-md border border-sand-200 bg-hevet p-3.5">
            <span className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
              Mål i dag
            </span>
            <span className="text-base">{GOALS[1].title} · nå {GOALS[1].now} · mål {GOALS[1].target}</span>
            <span className="text-sm text-grafitt-600">
              Prosess: 2 t innspill 100–150 m denne uken — økten i dag tjener det.
            </span>
          </div>
        </div>
      </div>
    </StateGate>
  );
}

function Plan({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom uke" emptyBody="Ingen publisert plan. Utkast hos coach er usynlig her.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Uke 38 · publisert del</Kicker>
          <Title>Plan</Title>
          <Lead>Fredagsøkten er foreslått flyttet. Du ser den ikke som endret før Sofie godkjenner.</Lead>
        </div>
        <StatusText>Tjener mål: HCP under 7 · innspill 100–125 m</StatusText>
        <section>
          {WEEK_PLAN.map((d) => (
            <Row
              key={d.day}
              kicker={d.day}
              title={d.title}
              sub={d.time}
              meta={d.status === "foreslått-flytt" ? "utkast hos coach" : d.status}
              onClick={d.status === "planlagt" ? () => onScreen("oktoppskrift") : undefined}
            />
          ))}
        </section>
      </ScreenStack>
    </StateGate>
  );
}

function Oktoppskrift({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const start = useHq((s) => s.startSession);
  const status = useHq((s) => s.sessionStatus);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Øktoppskrift · {TODAY_PLAYER.time}</Kicker>
          <Title>{TODAY_PLAYER.title}</Title>
          <Lead>{TODAY_PLAYER.focus}. Registreringsform står på hver øvelse. Putting telles i fot.</Lead>
          <StatusText tone={sessionTone(status)}>{sessionLabel(status)}</StatusText>
        </div>
        <Axes {...AXES} />
        <section>
          <Seksjon>Øvelser</Seksjon>
          {TODAY_PLAYER.drills.map((d) => (
            <Row key={d.id} title={d.name} sub={`${d.dose} · ${d.form}`} />
          ))}
        </section>
        <div className="flex flex-col gap-3 md:flex-row">
          <PrimaryButton
            className="w-full md:w-auto"
            onClick={() => {
              start();
              onScreen(TODAY_PLAYER.drills[0].form === "slag" ? "live-slag" : "live-ovelse");
            }}
          >
            Start økt
          </PrimaryButton>
          <GhostButton className="w-full md:w-auto" onClick={() => onScreen("i-dag")}>
            Tilbake
          </GhostButton>
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function LiveSlag({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const shots = useHq((s) => s.shots);
  const add = useHq((s) => s.addShot);
  const pause = useHq((s) => s.pauseSession);
  const save = useHq((s) => s.save);
  const setSave = useHq((s) => s.setSave);
  const extra = shots > 12;
  const shown = tilstand === "ekstra" ? 13 : tilstand === "pagar" ? 4 : shots;
  const label =
    tilstand === "lagrer" || save === "lagrer"
      ? "Lagrer · ikke bekreftet"
      : tilstand === "offline" || save === "offline"
        ? "Offline · lokal kø"
        : tilstand === "feil" || save === "feilet"
          ? "Lagring feilet · forsøk beholdt"
          : extra || tilstand === "ekstra"
            ? "13+ ekstra · E1"
            : `${shown} av 12 forsøk`;
  return (
    <StateGate tilstand={tilstand === "ekstra" || tilstand === "pagar" ? "normal" : tilstand}>
      <div className="flex flex-col gap-5 text-sand-100">
        <div className="flex flex-col gap-2">
          <span className="font-display text-sm font-semibold uppercase tracking-etikett text-handling">
            Live · slag
          </span>
          <h1 className="m-0 font-display text-2xl font-semibold">{TODAY_PLAYER.drills[0].name}</h1>
          <p className="m-0 text-sm text-natt-300">12 forsøk er dosen. Alt over 12 merkes som ekstra.</p>
          <span className="font-meta text-xs uppercase tracking-etikett text-amber-300">{label}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 border-t border-grafitt-700 pt-3">
            <span className="font-meta text-2xs uppercase text-natt-300">Forsøk</span>
            <span className="font-display text-3xl">{shown}</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-grafitt-700 pt-3">
            <span className="font-meta text-2xs uppercase text-natt-300">I sone</span>
            <span className="font-display text-3xl">{shown === 0 ? "—" : String(Math.max(0, shown - 3))}</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-grafitt-700 pt-3">
            <span className="font-meta text-2xs uppercase text-natt-300">Save</span>
            <span className="font-display text-xl">{save === "idle" ? "—" : save}</span>
          </div>
        </div>
        <button type="button" onClick={add} className="h-[60px] rounded-control bg-rust-500 font-display text-lg font-semibold uppercase text-hevet">
          Registrer slag
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={pause} className="h-12 rounded-control border border-grafitt-600 text-sand-100">
            Pause
          </button>
          <button type="button" onClick={() => onScreen("live-ovelse")} className="h-12 rounded-control border border-grafitt-600 text-sand-100">
            Neste øvelse
          </button>
        </div>
        <button
          type="button"
          className="h-12 rounded-control border border-grafitt-600 text-sand-100"
          onClick={() => {
            setSave("lagrer");
            window.setTimeout(() => setSave("lagret"), 600);
          }}
        >
          Lagre underveis
        </button>
      </div>
    </StateGate>
  );
}

function LiveOvelse({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const series = useHq((s) => s.series);
  const add = useHq((s) => s.addSerie);
  const fysLog = useHq((s) => s.fysLog);
  const addFys = useHq((s) => s.addFysSet);
  const removeFys = useHq((s) => s.removeFysSet);
  const setActual = useHq((s) => s.setFysActual);
  const setRir = useHq((s) => s.setFysRir);
  const nextKg = useHq((s) => s.nextKg);
  const finish = useHq((s) => s.finishSession);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Live · øvelsesføring</Kicker>
          <Title>Plan og faktisk er to kolonner</Title>
          <Lead>4×4 der siste serie er 3 reps lagres som 3. RIR styrer neste serie i denne økten, ikke programmet.</Lead>
        </div>
        <Panel>
          <Seksjon>Benkpress · plan 4×4 @ 100 kg</Seksjon>
          {fysLog.map((s, i) => (
            <div key={s.id} className="flex flex-wrap items-center gap-2 border-b border-sand-200 py-2">
              <span className="w-16 font-meta text-xs">Serie {i + 1}</span>
              <label className="text-xs">
                Reps
                <input
                  type="number"
                  value={s.actualReps}
                  onChange={(e) => setActual(s.id, Number(e.target.value), s.kg)}
                  className="ml-1 h-11 w-16 rounded-control border border-sand-400 px-2"
                />
              </label>
              <label className="text-xs">
                kg
                <input
                  type="number"
                  value={s.kg}
                  onChange={(e) => setActual(s.id, s.actualReps, Number(e.target.value))}
                  className="ml-1 h-11 w-16 rounded-control border border-sand-400 px-2"
                />
              </label>
              <label className="text-xs">
                RIR
                <input
                  type="number"
                  value={s.rir ?? ""}
                  onChange={(e) => setRir(s.id, Number(e.target.value))}
                  className="ml-1 h-11 w-16 rounded-control border border-sand-400 px-2"
                />
              </label>
              <GhostButton onClick={() => removeFys(s.id)}>Fjern</GhostButton>
            </div>
          ))}
          {nextKg != null ? <StatusText>Neste serie: {nextKg} kg (anbefaling)</StatusText> : null}
          <GhostButton onClick={addFys}>Legg til serie</GhostButton>
        </Panel>
        {TODAY_PLAYER.drills
          .filter((d) => d.form === "serie")
          .map((d) => (
            <Panel key={d.id}>
              <Seksjon>{d.name}</Seksjon>
              <p className="m-0 text-sm text-grafitt-600">{d.dose}</p>
              <p className="font-meta text-lg text-grafitt-900">{series[d.id] ?? 0} serier registrert</p>
              <PrimaryButton onClick={() => add(d.id)}>Registrer serie</PrimaryButton>
            </Panel>
          ))}
        <PrimaryButton
          onClick={() => {
            finish();
            onScreen("oppsummering");
          }}
        >
          Avslutt økt · forslag i kø
        </PrimaryButton>
      </ScreenStack>
    </StateGate>
  );
}

function Oppsummering({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const shots = useHq((s) => s.shots);
  const series = useHq((s) => s.series);
  const save = useHq((s) => s.save);
  const finish = useHq((s) => s.finishSession);
  const setSave = useHq((s) => s.setSave);
  const status =
    tilstand === "gjennomfort"
      ? "Gjennomført · lagret"
      : tilstand === "delvis"
        ? "Delvis gjennomført"
        : tilstand === "ukjent"
          ? "Sendt · ukjent utfall · Kontroller"
          : save === "feilet"
            ? "Ikke lagret · forsøk beholdt"
            : shots === 0
              ? "Ingen forsøk registrert"
              : "Klar til å lagre";
  return (
    <StateGate tilstand={tilstand === "gjennomfort" || tilstand === "delvis" || tilstand === "ukjent" ? "normal" : tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Oppsummering</Kicker>
          <Title>{TODAY_PLAYER.title}</Title>
          <StatusText tone={tilstand === "ukjent" || save === "ukjent" ? "warn" : "ok"}>{status}</StatusText>
          <Lead>Lagret er ikke det samme som delt med coach. Deling er et eget steg.</Lead>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Slag" value={String(shots)} hint={shots > 12 ? "inkl. ekstra" : "forsøk"} />
          <Metric label="Putting-serier" value={String(series.d2 ?? 0)} />
          <Metric label="Bunker-serier" value={String(series.d3 ?? 0)} />
          <Metric label="Lagring" value={save === "idle" ? UNKNOWN : save} />
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <PrimaryButton
            className="w-full md:w-auto"
            onClick={() => {
              finish();
            }}
          >
            Lagre økt
          </PrimaryButton>
          <GhostButton
            className="w-full md:w-auto"
            onClick={() => {
              setSave("ukjent");
            }}
          >
            Del med coach
          </GhostButton>
          <GhostButton className="w-full md:w-auto" onClick={() => onScreen("i-dag")}>
            Til I dag
          </GhostButton>
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function Analyse({ tilstand }: { tilstand?: UiState }) {
  return (
    <StateGate tilstand={tilstand} emptyTitle="Mangler data i kategori" emptyBody="Tee er ukjent. Vi viser ikke 0.">
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Analyse</Kicker>
          <Title>Slag spart</Title>
          <Lead>Verdier er MÅLT mot egne runder. ESTIMAT og PLANLAGT står merket. Ukjent er {UNKNOWN}.</Lead>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {SG.map((s) => (
            <Metric
              key={s.cat}
              label={s.cat}
              value={s.value}
              hint={s.tone === "ukjent" ? "ikke grunnlag" : "30 dager"}
            />
          ))}
        </div>
      </ScreenStack>
    </StateGate>
  );
}

function LiveDesktop({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: PortalScreenId) => void;
}) {
  const shots = useHq((s) => s.shots);
  return (
    <StateGate tilstand={tilstand}>
      <ScreenStack>
        <div className="flex flex-col gap-3">
          <Kicker>Live · desktop</Kicker>
          <Title>Samme økt, tre spalter</Title>
          <Lead>Venstre oppskrift. Midten registrering. Høyre kontekst. Ingen ny merkevare — mørk flate er fokus.</Lead>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel>
            <Seksjon>Oppskrift</Seksjon>
            {TODAY_PLAYER.drills.map((d) => (
              <p key={d.id} className="m-0 text-sm">
                {d.name}
              </p>
            ))}
          </Panel>
          <Panel>
            <Seksjon>Registrering</Seksjon>
            <p className="font-display text-3xl">{shots}</p>
            <PrimaryButton onClick={() => onScreen("live-slag")}>Åpne slag</PrimaryButton>
          </Panel>
          <Panel>
            <Seksjon>Kontekst</Seksjon>
            <p className="m-0 text-sm text-grafitt-600">{TODAY_PLAYER.focus}</p>
            <Axes {...AXES} />
          </Panel>
        </div>
      </ScreenStack>
    </StateGate>
  );
}
