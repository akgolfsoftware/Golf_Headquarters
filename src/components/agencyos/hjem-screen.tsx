import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

type SakId =
  | "mina-plan"
  | "nærspill"
  | "iver-utkast"
  | "jonas-tid"
  | "innboks"
  | "jonas-okt";
type Status = "venter" | "rediger" | "utforer" | "utfort" | "avvist" | "feilet";
type Tid = (typeof TIDER)[number];
type Tone = "haste" | "advarsel" | "info" | "dempet";

const TIDER = ["fre 18.09 · 15:00", "lør 19.09 · 10:00"] as const;
const OPPRINNELIG = "lør 19.09 · 15:00";

const NAV: { id: string; label: string; meta?: string; current?: boolean }[] = [
  { id: "hjem", label: "Hjem", current: true },
  { id: "stall", label: "Stall", meta: "34" },
  { id: "kalender", label: "Kalender" },
  { id: "workbench", label: "Workbench" },
  { id: "innboks", label: "Innboks", meta: "3" },
  { id: "godkjenninger", label: "Godkjenninger" },
  { id: "agenticos", label: "AgenticOS" },
  { id: "analyse", label: "Analyse" },
  { id: "oppsett", label: "Oppsett" },
];

const QUEUE: {
  id: SakId;
  kind: string;
  tone: Tone;
  title: string;
  sub: string;
  action: string;
}[] = [
  {
    id: "mina-plan",
    kind: "Godkjenning",
    tone: "haste",
    title: "Ukeplan uke 38 · Mina Løken",
    sub: "Flytter én belastende økt · påvirker spillerens plan",
    action: "Vurder",
  },
  {
    id: "nærspill",
    kind: "Godkjenning",
    tone: "advarsel",
    title: "Øktoppskrift · Nærspill 30 m",
    sub: "Venter siden i går 16:40 · påvirker ikke plan før publisering",
    action: "Vurder",
  },
  {
    id: "iver-utkast",
    kind: "Caddie-utkast",
    tone: "advarsel",
    title: "Tilbakemelding etter runde · Iver Sandnes",
    sub: "Utkast fra AI · ikke sendt til spiller",
    action: "Les utkast",
  },
  {
    id: "jonas-tid",
    kind: "Øktforespørsel",
    tone: "info",
    title: "Jonas Five ønsker ny tid fredag",
    sub: "Fra 14:00 til 16:30 · ledig i kalenderen",
    action: "Svar",
  },
  {
    id: "innboks",
    kind: "Melding",
    tone: "dempet",
    title: "3 uleste i innboksen",
    sub: "Eldste fra foresatt · 2 dager",
    action: "Åpne",
  },
];

const STUB: Record<
  Exclude<SakId, "mina-plan" | "jonas-okt">,
  { tittel: string; tekst: string }
> = {
  nærspill: {
    tittel: "Øktoppskrift · Nærspill 30 m",
    tekst:
      "Venter siden i går 16:40. Påvirker ikke spillerens plan før du publiserer.",
  },
  "iver-utkast": {
    tittel: "Caddie-utkast · Iver Sandnes",
    tekst:
      "Utkast fra AI. Ikke sendt. Godkjenn, rediger eller forkast — «levert» finnes ikke.",
  },
  "jonas-tid": {
    tittel: "Øktforespørsel · Jonas Five",
    tekst:
      "Vil flytte fredag fra 14:00 til 16:30. Kalenderen viser ledig. Ingen melding er sendt ennå.",
  },
  innboks: {
    tittel: "3 uleste i innboksen",
    tekst: "Eldste fra foresatt, 2 dager. Innboks er ikke bygget i denne visningen.",
  },
};

const TONE_DOT: Record<Tone, string> = {
  haste: "bg-rust-500",
  advarsel: "bg-amber-600",
  info: "bg-bla-600",
  dempet: "bg-sand-500",
};
const TONE_TEXT: Record<Tone, string> = {
  haste: "text-rust-500",
  advarsel: "text-amber-600",
  info: "text-bla-600",
  dempet: "text-grafitt-500",
};

function cn(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

function Seksjon({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 text-xs font-semibold uppercase tracking-seksjon text-grafitt-600">
      {children}
    </h2>
  );
}

function Felt({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
      {children}
    </div>
  );
}

function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-meta text-2xs font-medium uppercase tracking-meta text-grafitt-500", className)}>
      {children}
    </span>
  );
}

function Dot({ tone }: { tone: Tone }) {
  return <span className={cn("inline-block size-1.5 rounded-full", TONE_DOT[tone])} />;
}

function PrimaryButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-control bg-grafitt-900 px-5 text-base font-medium text-sand-100 transition-colors duration-200 hover:bg-grafitt-800",
        className,
      )}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  danger,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-control border px-4 text-base transition-colors duration-200",
        danger
          ? "border-sand-500 bg-hevet text-rust-500 hover:border-rust-500"
          : "border-sand-500 bg-hevet text-grafitt-900 hover:border-grafitt-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    venter: { label: "Venter · ikke godkjent", cls: "bg-rust-100 text-rust-600" },
    rediger: { label: "Redigerer tid · ikke lagret", cls: "bg-amber-100 text-amber-700" },
    utforer: { label: "Utfører …", cls: "bg-amber-100 text-amber-700" },
    utfort: {
      label: "Godkjent · ikke synlig for spiller ennå",
      cls: "bg-sand-200 text-grafitt-700",
    },
    avvist: { label: "Avvist · planen uendret", cls: "bg-sand-200 text-grafitt-600" },
    feilet: { label: "Feilet · ingenting tapt", cls: "bg-rust-100 text-rust-600" },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center self-start rounded-sm px-2.5 font-meta text-xs uppercase tracking-etikett",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

function useKlokke() {
  const [klokke, setKlokke] = useState("22:33");
  const [dato, setDato] = useState("torsdag 17. september");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setKlokke(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
      setDato(
        d.toLocaleDateString("nb-NO", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return { klokke, dato };
}

export function AgencyOsHjem() {
  const [sak, setSak] = useState<SakId | null>(null);
  const [status, setStatus] = useState<Status>("venter");
  const [tid, setTid] = useState<Tid>(TIDER[0]);
  const { klokke, dato } = useKlokke();

  const minaFerdig = status === "utfort";
  const ko = QUEUE.filter((row) => !(row.id === "mina-plan" && minaFerdig));
  const koAntall = ko.filter((r) => r.id !== "innboks").length;

  useEffect(() => {
    if (status !== "utforer") return;
    const t = window.setTimeout(() => setStatus("utfort"), 900);
    return () => window.clearTimeout(t);
  }, [status]);

  function apne(id: SakId) {
    setSak(id);
  }

  function lukk() {
    setSak(null);
  }

  const inspectorProps = {
    sak,
    status,
    tid,
    onTid: setTid,
    onClose: lukk,
    onGodkjenn: () => setStatus("utforer"),
    onRediger: () => setStatus("rediger"),
    onAvvis: () => setStatus("avvist"),
    onAngre: () => setStatus("venter"),
    onFeil: () => setStatus("feilet"),
    onRetry: () => setStatus("utforer"),
  };

  return (
    <div className="min-h-dvh bg-flate text-ink">
      <div className="grid min-h-dvh md:grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_372px]">
        <Rail />
        <IconRail />

        <main className="flex min-w-0 flex-col bg-flate">
          <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sand-200 px-4 xl:h-[60px] xl:gap-4 xl:px-7">
            <img src="/ak-golf-logo.svg" alt="" className="h-[26px] w-[30px] md:hidden" />
            <span className="font-display text-md font-semibold uppercase tracking-display text-grafitt-900 md:hidden">
              AgencyOS
            </span>
            <label className="hidden h-[34px] w-[300px] items-center gap-2 rounded-control border border-sand-400 bg-hevet px-3 text-xs text-grafitt-500 xl:flex">
              <span className="size-2.5 rounded-full border-[1.5px] border-grafitt-400" />
              <span className="flex-1">Søk spiller, økt eller sak</span>
              <kbd className="font-meta text-2xs text-grafitt-500">⌘K</kbd>
            </label>
            <span className="ml-auto hidden text-xs capitalize text-grafitt-600 md:inline xl:hidden">
              {dato}
            </span>
            <span className="font-meta text-xs font-medium text-grafitt-900 max-md:ml-auto xl:hidden">
              {klokke}
            </span>
            <span className="size-[30px] rounded-full bg-sand-500 md:hidden" />
            <div className="ml-auto hidden items-center gap-4 xl:flex">
              <span className="text-xs text-grafitt-600">{dato}</span>
              <span className="font-meta text-xs font-medium text-grafitt-900">{klokke}</span>
              <span className="flex items-center gap-1.5 text-xs text-grafitt-500">
                <span className="size-1.5 rounded-full bg-grafitt-600" />
                Synkronisert {klokke}
              </span>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 overflow-auto px-4 py-4 pb-24 md:gap-7 md:px-7 md:py-7 md:pb-9">
            <Naa
              ferdig={minaFerdig}
              onOpen={() => apne(minaFerdig ? "jonas-tid" : "mina-plan")}
            />
            <IDag onOpenOkt={() => apne("jonas-okt")} />
            <Ko rows={ko} antall={koAntall} onOpen={apne} />
            <Agent antall={koAntall} />
            <div className="hidden items-center gap-5 pt-1 xl:flex">
              <span className="text-xs text-grafitt-500">Skriv ut dagsplan</span>
              <span className="text-xs text-grafitt-500">Eksporter uke (CSV)</span>
            </div>
          </div>
        </main>

        <aside className="hidden min-h-0 overflow-auto border-l border-sand-200 bg-hevet xl:block">
          <Inspector {...inspectorProps} />
        </aside>
      </div>

      {sak ? (
        <div
          className="fixed inset-0 z-30 flex items-end bg-grafitt-900/40 xl:hidden"
          onClick={lukk}
          role="presentation"
        >
          <div
            className="flex max-h-[96dvh] w-full flex-col gap-4 overflow-y-auto rounded-t-lg bg-hevet px-4 pb-7 pt-3 shadow-[var(--shadow-overlegg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-[38px] rounded-full bg-sand-400" />
            <Inspector compact {...inspectorProps} />
          </div>
        </div>
      ) : (
        <MobileNav />
      )}
    </div>
  );
}

function Rail() {
  return (
    <aside className="hidden flex-col gap-[26px] border-r border-sand-200 bg-sand-150 px-3.5 py-5 xl:flex">
      <div className="flex items-center gap-2.5 px-2">
        <img src="/ak-golf-logo.svg" alt="AK Golf" className="h-[30px] w-[34px]" />
        <span className="font-display text-md font-semibold uppercase tracking-display text-grafitt-900">
          AgencyOS
        </span>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="AgencyOS">
        <div className="px-2 pb-2">
          <span className="font-meta text-3xs uppercase tracking-merke text-grafitt-500">
            AgencyOS
          </span>
        </div>
        {NAV.map((item) => (
          <span
            key={item.id}
            aria-current={item.current ? "page" : undefined}
            className={cn(
              "flex h-9 items-center justify-between rounded-control px-2.5 text-sm",
              item.current
                ? "bg-grafitt-900 font-medium text-sand-100"
                : "text-grafitt-600",
            )}
          >
            {item.label}
            {item.meta ? (
              <span className="font-meta text-xs text-grafitt-500">{item.meta}</span>
            ) : null}
          </span>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2.5 border-t border-sand-200 px-2.5 pt-3.5">
        <Link
          to="/wang"
          search={{ skjerm: "oversikt" as const, rolle: "SS" as const }}
          className="flex h-9 items-center rounded-control px-2.5 text-sm text-grafitt-600"
        >
          WANG Toppidrett
        </Link>
        <span className="font-meta text-3xs uppercase tracking-merke text-grafitt-500">
          Kontekst
        </span>
        <div className="flex h-11 items-center gap-2.5 rounded-control border border-sand-400 bg-sand-100 px-2.5">
          <span className="size-[26px] rounded-full bg-sand-500" />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-grafitt-900">Sofie Aas</span>
            <span className="text-2xs text-grafitt-500">Coach · AK Golf</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

function IconRail() {
  return (
    <aside className="hidden flex-col items-center gap-4 border-r border-sand-200 bg-sand-150 py-4 md:flex xl:hidden">
      <img src="/ak-golf-logo.svg" alt="AK Golf" className="h-[26px] w-[30px]" />
      {["Hjem", "Stall", "Kalender"].map((label, i) => (
        <span
          key={label}
          aria-current={i === 0 ? "page" : undefined}
          className={cn(
            "writing-vertical font-display text-xs font-semibold uppercase tracking-seksjon",
            i === 0
              ? "border-l-[3px] border-rust-500 pl-1.5 text-grafitt-900"
              : "text-grafitt-600",
          )}
        >
          {label}
        </span>
      ))}
    </aside>
  );
}

function Naa({ ferdig, onOpen }: { ferdig: boolean; onOpen: () => void }) {
  if (ferdig) {
    return (
      <section className="flex flex-col gap-3 border-l-[3px] border-grafitt-600 py-0.5 pl-4 md:pl-5">
        <div className="font-display text-sm font-semibold uppercase tracking-etikett text-grafitt-600 md:text-base">
          Nå · neste prioritet
        </div>
        <h1 className="m-0 max-w-[22ch] font-display text-2xl font-semibold tracking-tight text-grafitt-900 md:text-3xl">
          Svar på øktforespørsel fra Jonas Five
        </h1>
        <p className="m-0 max-w-[66ch] text-pretty text-base text-grafitt-600">
          Fredag 14:00 til 16:30. Kalenderen viser ledig. Ingen melding er sendt ennå.
        </p>
        <div className="flex flex-col gap-3 pt-0.5 md:flex-row md:items-center md:gap-3">
          <PrimaryButton onClick={onOpen} className="w-full md:w-auto">
            Åpne forespørselen
          </PrimaryButton>
        </div>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-3 border-l-4 border-rust-500 py-0.5 pl-3.5 md:gap-3 md:pl-5">
      <div className="font-display text-sm font-semibold uppercase tracking-etikett text-rust-500 md:text-base">
        Nå · haster · ikke godkjent
      </div>
      <h1 className="m-0 max-w-[22ch] font-display text-2xl font-semibold tracking-tight text-grafitt-900 md:text-3xl">
        Vurder ukeplan for Mina Løken
      </h1>
      <p className="m-0 max-w-[66ch] text-pretty text-base text-grafitt-600 md:text-md">
        AgenticOS foreslår å flytte én belastende økt etter to registrerte avvik i
        belastningsloggen. Forslaget er ikke godkjent, og ingenting er sendt til spilleren.
      </p>
      <div className="flex flex-col gap-3 pt-0.5 md:flex-row md:items-center md:gap-3">
        <PrimaryButton onClick={onOpen} className="w-full md:w-auto">
          Åpne forslaget
        </PrimaryButton>
        <GhostButton onClick={onOpen} className="hidden md:inline-flex">
          Se Mina Løken
        </GhostButton>
        <span className="hidden font-meta text-xs text-grafitt-500 md:inline">
          Foreslått 09:12 · AgenticOS Planagent
        </span>
      </div>
    </section>
  );
}

function IDag({ onOpenOkt }: { onOpenOkt: () => void }) {
  return (
    <section className="flex flex-col">
      <div className="flex items-baseline gap-3 pb-3">
        <Seksjon>I dag</Seksjon>
        <span className="text-xs text-grafitt-500">3 økter · 1 fullført</span>
        <span className="ml-auto hidden text-xs text-bla-600 xl:inline">Åpne kalender</span>
      </div>

      <div className="grid grid-cols-[74px_minmax(0,1fr)] items-baseline gap-3 border-t border-sand-200 py-3 xl:grid-cols-[96px_minmax(0,1fr)_auto] xl:gap-4">
        <span className="font-meta text-xs text-grafitt-500 line-through">10:00–10:50</span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm text-grafitt-500 xl:text-base">Innspill 50–80 m · Mina Løken</span>
          <span className="text-xs text-grafitt-500">Studio 1 · 50 min</span>
        </span>
        <span className="hidden items-center gap-1.5 text-xs text-grafitt-600 xl:flex">
          <span className="size-1.5 rounded-full bg-grafitt-600" />
          Fullført
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenOkt}
        className="my-1.5 grid w-full grid-cols-1 gap-2.5 rounded-md border border-sand-500 bg-hevet p-3.5 text-left transition-colors duration-200 hover:border-grafitt-900 xl:grid-cols-[96px_minmax(0,1fr)_auto] xl:items-center xl:gap-4 xl:p-4"
      >
        <span className="flex items-baseline gap-2.5 xl:flex-col xl:gap-1">
          <span className="font-meta text-3xs uppercase tracking-meta text-rust-500">Neste</span>
          <span className="font-meta text-sm font-medium text-grafitt-900 xl:text-base">
            12:30
          </span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-md font-semibold tracking-tight text-grafitt-900 xl:text-lg">
            Teknikk · Jonas Five
          </span>
          <span className="text-xs text-grafitt-500">Studio 2 · 50 min · om 1 t 6 min</span>
        </span>
        <span className="flex h-11 items-center justify-center rounded-control border border-sand-500 bg-sand-100 text-sm text-grafitt-600 xl:h-auto xl:justify-start xl:border-0 xl:bg-transparent xl:p-0">
          Åpne økt
        </span>
      </button>

      <div className="grid grid-cols-[74px_minmax(0,1fr)] items-baseline gap-3 border-t border-sand-200 py-3 xl:grid-cols-[96px_minmax(0,1fr)_auto] xl:gap-4">
        <span className="font-meta text-xs text-grafitt-600">15:00–16:00</span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm text-grafitt-900 xl:text-base">
            Spillsimulering · Gruppe GFGK 3
          </span>
          <span className="text-xs text-grafitt-500">Bane · 60 min · 6 spillere</span>
        </span>
        <span className="hidden text-xs text-grafitt-500 xl:block">Planlagt</span>
      </div>
    </section>
  );
}

function Ko({
  rows,
  antall,
  onOpen,
}: {
  rows: typeof QUEUE;
  antall: number;
  onOpen: (id: SakId) => void;
}) {
  return (
    <section className="flex flex-col">
      <div className="flex items-baseline gap-3 pb-3">
        <Seksjon>Trenger vurdering</Seksjon>
        <span className="text-xs text-grafitt-500">
          {antall} {antall === 1 ? "sak" : "saker"}
        </span>
        <span className="ml-auto hidden text-xs text-grafitt-500 underline xl:inline">
          Åpne godkjenninger
        </span>
      </div>
      {rows.map((row, i) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onOpen(row.id)}
          className={cn(
            "grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-sand-200 py-3.5 text-left xl:grid-cols-[170px_minmax(0,1fr)_auto] xl:gap-4",
            i === rows.length - 1 && "border-b",
          )}
        >
          <span className="hidden items-center gap-2 xl:flex">
            <Dot tone={row.tone} />
            <span
              className={cn(
                "font-meta text-xs uppercase tracking-etikett",
                TONE_TEXT[row.tone],
              )}
            >
              {row.kind}
            </span>
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                "font-meta text-2xs uppercase tracking-etikett xl:hidden",
                TONE_TEXT[row.tone],
              )}
            >
              {row.kind}
            </span>
            <span className="text-base font-medium text-grafitt-900">{row.title}</span>
            <span className="hidden text-xs text-grafitt-500 xl:block">{row.sub}</span>
          </span>
          <span className="hidden h-9 items-center rounded-control border border-sand-500 bg-hevet px-3.5 text-sm text-grafitt-900 xl:inline-flex">
            {row.action}
          </span>
          <span className="text-grafitt-500 xl:hidden">›</span>
        </button>
      ))}
    </section>
  );
}

function Agent({ antall }: { antall: number }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-sand-200 bg-hevet px-5 py-4">
      <div className="flex items-baseline gap-3">
        <Seksjon>AgenticOS</Seksjon>
        <span className="text-xs text-grafitt-500">
          Ingenting er publisert uten din godkjenning
        </span>
        <span className="ml-auto hidden text-xs text-grafitt-500 underline xl:inline">
          Alle kjøringer
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <AgentPill tone="info" label="1 kjører" />
        <AgentPill tone="advarsel" label={`${antall} venter godkjenning`} />
        <AgentPill tone="dempet" label="2 fullført i dag" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-sand-200 pt-3">
        <span className="flex flex-col gap-1">
          <span className="text-base text-grafitt-900">Belastningsanalyse · GFGK-stigen</span>
          <span className="font-meta text-xs text-grafitt-500">
            Startet 11:19 · leser registreringer · ingen data skrevet
          </span>
        </span>
        <span className="text-xs text-bla-600">Kjører</span>
      </div>
    </section>
  );
}

function AgentPill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="inline-flex h-[30px] items-center gap-2 rounded-pill border border-sand-400 px-3 text-xs text-grafitt-900">
      <Dot tone={tone} />
      {label}
    </span>
  );
}

function MobileNav() {
  const items = ["Hjem", "Stall", "Kalender", "Innboks", "Mer"];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid h-[72px] grid-cols-5 border-t border-sand-200 bg-hevet pb-2 md:hidden">
      {items.map((label, i) => (
        <span
          key={label}
          aria-current={i === 0 ? "page" : undefined}
          className={cn(
            "flex h-[52px] items-center justify-center text-sm",
            i === 0
              ? "border-t-[3px] border-rust-500 font-semibold text-grafitt-900"
              : "border-t-[3px] border-transparent text-grafitt-600",
          )}
        >
          {label}
        </span>
      ))}
    </nav>
  );
}

function Inspector({
  sak,
  status,
  tid,
  onTid,
  onClose,
  onGodkjenn,
  onRediger,
  onAvvis,
  onAngre,
  onFeil,
  onRetry,
  compact,
}: {
  sak: SakId | null;
  status: Status;
  tid: Tid;
  onTid: (t: Tid) => void;
  onClose: () => void;
  onGodkjenn: () => void;
  onRediger: () => void;
  onAvvis: () => void;
  onAngre: () => void;
  onFeil: () => void;
  onRetry: () => void;
  compact?: boolean;
}) {
  if (!sak) {
    return (
      <div className="flex h-full flex-col gap-6 p-[22px]">
        <div className="flex flex-col gap-2.5">
          <Felt>Kontekst</Felt>
          <p className="m-0 text-base leading-normal text-grafitt-600">
            Velg en sak eller en økt for å se detaljene her uten å miste listen.
          </p>
        </div>
        <div className="flex flex-col gap-3.5 border-t border-sand-200 pt-5">
          <Felt>Trenger oppfølging</Felt>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            <li className="flex flex-col gap-0.5">
              <span className="text-base font-medium">Mina Løken</span>
              <span className="text-xs leading-normal text-grafitt-500">
                2 avvik i belastningslogg siste 10 dager
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-base font-medium">Iver Sandnes</span>
              <span className="text-xs leading-normal text-grafitt-500">
                Ingen registrering siden 4. september
              </span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-base font-medium">Nora Tveit</span>
              <span className="text-xs leading-normal text-grafitt-500">
                Fysisk test forfalt · 12 dager over
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (sak === "jonas-okt") {
    return (
      <div className="flex h-full flex-col">
        <InspectorBar label="Økt · i dag 12:30" onClose={onClose} compact={compact} />
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-xl font-semibold">Teknikk · Jonas Five</h2>
            <p className="m-0 text-xs text-grafitt-500">
              Studio 2 · 50 min · planlagt · starter om 1 t 6 min
            </p>
          </div>
          <div className="flex flex-col gap-2.5 border-t border-sand-200 pt-4">
            <Felt>Fokus i økten</Felt>
            <p className="m-0 text-sm leading-normal text-grafitt-900">
              Kontakt og lavpunkt med jern 7. Videoopptak fra to vinkler. Følger opp avviket
              fra 4. september.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 border-t border-sand-200 pt-4">
            <Felt>Spillerkontekst</Felt>
            <div className="flex justify-between text-sm">
              <span className="text-grafitt-600">Siste registrering</span>
              <span className="font-meta">9. sept</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grafitt-600">SG Approach · 30 dager</span>
              <span className="font-meta text-rust-500">−0,21</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grafitt-600">Økter fullført · 30 dager</span>
              <span className="font-meta">11 av 14</span>
            </div>
            <p className="m-0 text-2xs leading-normal text-grafitt-500">
              Kilde: egne registreringer. Negative og positive verdier vises med samme skala.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <PrimaryButton>Åpne øktoppskrift</PrimaryButton>
            <GhostButton onClick={onClose}>Tilbake til tidslinjen</GhostButton>
          </div>
        </div>
      </div>
    );
  }

  if (sak !== "mina-plan") {
    const c = STUB[sak];
    return (
      <div className="flex h-full flex-col">
        <InspectorBar label="Sak" onClose={onClose} compact={compact} />
        <div className="flex flex-col gap-4 p-5">
          <h2 className="m-0 font-display text-xl font-semibold">{c.tittel}</h2>
          <p className="m-0 text-base text-grafitt-600">{c.tekst}</p>
          <p className="m-0 font-meta text-2xs text-grafitt-500">
            Samme skall. Full flyt er tegnet på ukeplan-forslaget.
          </p>
        </div>
      </div>
    );
  }

  const visHandlinger = status === "venter" || status === "rediger";

  return (
    <div className="flex h-full flex-col">
      <InspectorBar label="Forslag C-142" onClose={onClose} compact={compact} />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2.5">
          <StatusPill status={status} />
          <h2 className="m-0 font-display text-xl font-semibold">
            Ukeplan uke 38 · Mina Løken
          </h2>
          <span className="text-xs text-grafitt-500">
            Foreslått 09:12 av AgenticOS Planagent
          </span>
        </div>

        {status === "feilet" ? (
          <div className="flex flex-col gap-2.5 rounded-md border border-rust-300 bg-rust-100 p-3.5">
            <span className="text-base font-semibold text-rust-600">
              Endringen ble ikke utført
            </span>
            <p className="m-0 text-xs leading-normal text-rust-600">
              Serveren svarte ikke. Planen til Mina står uendret, og forslaget ligger
              fortsatt i køen — ingenting er tapt.
            </p>
            <div className="flex gap-2.5 pt-0.5">
              <PrimaryButton onClick={onRetry} className="flex-1">
                Prøv igjen
              </PrimaryButton>
              <GhostButton onClick={onAngre} className="flex-1">
                Tilbake til forslaget
              </GhostButton>
            </div>
          </div>
        ) : null}

        {status === "utforer" ? (
          <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-100 p-3.5">
            <span className="text-base font-medium text-amber-700">Utfører endringen …</span>
            <p className="m-0 text-xs leading-normal text-amber-700">
              Endringen er ikke synlig for Mina før den er bekreftet. Ingen melding er sendt
              ennå.
            </p>
          </div>
        ) : null}

        {status === "utfort" ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-md border border-sand-500 bg-sand-150 p-3.5">
              <span className="text-base font-medium">Godkjent. Endringen er utført.</span>
              <p className="m-0 text-xs leading-normal text-grafitt-900">
                Endringen er ikke synlig for Mina før den er bekreftet. Ingen melding er
                sendt ennå.
              </p>
            </div>
            <div className="flex gap-2.5">
              <PrimaryButton onClick={onClose} className="flex-1">
                Tilbake til Hjem
              </PrimaryButton>
              <GhostButton onClick={onAngre} className="flex-1">
                Angre
              </GhostButton>
            </div>
          </div>
        ) : null}

        {status === "avvist" ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-md border border-sand-400 bg-sand-100 p-3.5">
              <span className="text-base font-medium">Avvist</span>
              <p className="m-0 text-xs leading-normal text-grafitt-600">
                Planen står uendret. AgenticOS foreslår ikke samme flytting igjen denne uka.
              </p>
            </div>
            <div className="flex gap-2.5">
              <PrimaryButton onClick={onClose} className="flex-1">
                Tilbake til Hjem
              </PrimaryButton>
              <GhostButton onClick={onAngre} className="flex-1">
                Angre avvisning
              </GhostButton>
            </div>
          </div>
        ) : null}

        {visHandlinger ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Felt>Kilde</Felt>
              <p className="m-0 text-sm leading-normal text-grafitt-900">
                Belastningslogg 1.–10. september · 2 registrerte avvik · egenrapportert
                restitusjon 4/10 (mandag) og 5/10 (onsdag).
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Felt>Begrunnelse</Felt>
              <p className="m-0 text-sm leading-normal text-grafitt-900">
                To harde økter ligger innenfor 36 timer. Å flytte spillsimuleringen gir 48
                timer mellom belastningene uten å endre ukens totale volum.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Felt>Konsekvens</Felt>
              <div className="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-center gap-2.5 rounded-md border border-sand-200 bg-sand-100 p-3">
                <span className="flex flex-col gap-0.5">
                  <span className="font-meta text-xs text-grafitt-500 line-through">
                    {OPPRINNELIG}
                  </span>
                  <span className="text-xs text-grafitt-500">Opprinnelig tid</span>
                </span>
                <span className="text-center text-grafitt-500">→</span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-meta text-xs font-medium text-grafitt-900">{tid}</span>
                  <span className="text-xs text-grafitt-600">Ny tid</span>
                </span>
              </div>
              <p className="m-0 text-xs leading-normal text-grafitt-600">
                Ingen gruppeøkt berøres.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 border-l-2 border-sand-500 bg-sand-100 px-3.5 py-3">
              <Felt>Ved godkjenning</Felt>
              <p className="m-0 text-sm leading-normal text-grafitt-900">
                Økten flyttes i Minas plan og blir synlig for henne. Du kan angre etter at
                endringen er utført.
              </p>
            </div>
            {status === "rediger" ? (
              <div className="flex flex-col gap-2.5 rounded-md border border-sand-500 p-3.5">
                <span className="text-sm font-medium">Velg ny tid før godkjenning</span>
                <div className="flex flex-wrap gap-2">
                  {TIDER.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onTid(t)}
                      className={cn(
                        "h-12 rounded-control border px-3.5 font-meta text-xs",
                        tid === t
                          ? "border-grafitt-900 bg-hevet text-grafitt-900"
                          : "border-sand-400 bg-hevet text-grafitt-900 hover:border-grafitt-500",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-grafitt-500">
                  Valgt: {tid}. Endringen lagres først når du godkjenner.
                </span>
              </div>
            ) : null}
            <div className="flex flex-col gap-2.5 pt-1">
              <PrimaryButton onClick={onGodkjenn}>Godkjenn og utfør</PrimaryButton>
              <div className="flex gap-2.5">
                <GhostButton onClick={onRediger} className="flex-1">
                  Rediger
                </GhostButton>
                <GhostButton danger onClick={onAvvis} className="flex-1">
                  Avvis
                </GhostButton>
              </div>
            </div>
            <button
              type="button"
              onClick={onFeil}
              className="self-start font-meta text-2xs text-grafitt-400 underline-offset-2 hover:underline"
            >
              Simuler serverfeil
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function InspectorBar({
  label,
  onClose,
  compact,
}: {
  label: string;
  onClose: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Meta>{label}</Meta>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-11 items-center rounded-control border border-sand-400 bg-hevet px-3.5 text-sm text-grafitt-900"
        >
          Lukk
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 border-b border-sand-200 px-5 py-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Tilbake"
        className="inline-flex size-8 items-center justify-center rounded-control border border-sand-400 bg-hevet text-base text-grafitt-600 hover:border-grafitt-900"
      >
        ←
      </button>
      <Meta>{label}</Meta>
    </div>
  );
}
