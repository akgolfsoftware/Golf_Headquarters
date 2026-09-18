import { useEffect, useState } from "react";
import { CADDIE_QUEUE } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { AdminScreenId, UiState } from "@/lib/hq/types";
import { InspectorPortal } from "./admin-shell";
import {
  GhostButton,
  Kicker,
  Lead,
  Meta,
  PrimaryButton,
  ScreenStack,
  Seksjon,
  StateGate,
  StatusText,
  Title,
  cn,
} from "./ui";

type SakId = "mina-plan" | "nærspill" | "iver-utkast" | "jonas-tid" | "innboks" | "jonas-okt";
const TIDER = ["fre 18.09 · 15:00", "lør 19.09 · 10:00"] as const;

const QUEUE: { id: SakId; kind: string; tone: "haste" | "advarsel" | "info" | "dempet"; title: string; sub: string; action: string }[] = [
  { id: "mina-plan", kind: "Godkjenning", tone: "haste", title: "Ukeplan uke 38 · Mina Løken", sub: "Flytter én belastende økt · påvirker spillerens plan", action: "Vurder" },
  { id: "nærspill", kind: "Godkjenning", tone: "advarsel", title: "Øktoppskrift · Nærspill 30 m", sub: "Venter siden i går 16:40 · påvirker ikke plan før publisering", action: "Vurder" },
  { id: "iver-utkast", kind: "Caddie-utkast", tone: "advarsel", title: "Tilbakemelding etter runde · Iver Sandnes", sub: "Utkast fra AI · ikke sendt til spiller", action: "Les utkast" },
  { id: "jonas-tid", kind: "Øktforespørsel", tone: "info", title: "Jonas Five ønsker ny tid fredag", sub: "Fra 14:00 til 16:30 · ledig i kalenderen", action: "Svar" },
  { id: "innboks", kind: "Melding", tone: "dempet", title: "3 uleste i innboksen", sub: "Eldste fra foresatt · 2 dager", action: "Åpne" },
];

const TONE_DOT = { haste: "bg-rust-500", advarsel: "bg-amber-600", info: "bg-bla-600", dempet: "bg-sand-500" };
const TONE_TEXT = { haste: "text-rust-500", advarsel: "text-amber-600", info: "text-bla-600", dempet: "text-grafitt-500" };

export function AdminHjem({
  tilstand,
  onScreen,
}: {
  tilstand?: UiState;
  onScreen: (id: AdminScreenId) => void;
}) {
  const approval = useHq((s) => s.approval);
  const setApproval = useHq((s) => s.setApproval);
  const moveTo = useHq((s) => s.moveTo);
  const setMoveTo = useHq((s) => s.setMoveTo);
  const [sak, setSak] = useState<SakId | null>(null);

  useEffect(() => {
    if (approval !== "utforer") return;
    const t = window.setTimeout(() => setApproval("utfort"), 800);
    return () => window.clearTimeout(t);
  }, [approval, setApproval]);

  const minaFerdig = approval === "utfort";
  const ko = QUEUE.filter((row) => !(row.id === "mina-plan" && minaFerdig));
  const koAntall = ko.filter((r) => r.id !== "innboks").length;

  return (
    <StateGate tilstand={tilstand} emptyTitle="Tom dag" emptyBody="Ingen økter og ingen kø.">
      <InspectorPortal sheet={Boolean(sak)}>
        <HjemInspector
          sak={sak}
          status={approval}
          tid={moveTo}
          onTid={setMoveTo}
          onClose={() => setSak(null)}
          onGodkjenn={() => setApproval("utforer")}
          onRediger={() => setApproval("rediger")}
          onAvvis={() => setApproval("avvist")}
          onAngre={() => setApproval("venter")}
          onFeil={() => setApproval("feilet")}
          onRetry={() => setApproval("utforer")}
          onOkt={() => onScreen("okt-individuell")}
          onKo={() => onScreen("ko")}
        />
      </InspectorPortal>
      <ScreenStack>
        {minaFerdig ? (
          <section className="flex flex-col gap-3 border-l-[3px] border-grafitt-600 py-0.5 pl-5">
            <Kicker>Nå · neste prioritet</Kicker>
            <Title>Svar på øktforespørsel fra Jonas Five</Title>
            <Lead>Fredag 14:00 til 16:30. Kalenderen viser ledig. Ingen melding er sendt ennå.</Lead>
            <PrimaryButton className="w-full md:w-auto" onClick={() => setSak("jonas-tid")}>
              Åpne forespørselen
            </PrimaryButton>
          </section>
        ) : (
          <section className="flex flex-col gap-3 border-l-4 border-rust-500 py-0.5 pl-5">
            <Kicker tone="haste">Nå · haster · ikke godkjent</Kicker>
            <Title>Vurder ukeplan for Mina Løken</Title>
            <Lead>
              AgenticOS foreslår å flytte én belastende økt etter to registrerte avvik i
              belastningsloggen. Forslaget er ikke godkjent, og ingenting er sendt til spilleren.
            </Lead>
            <div className="flex flex-col gap-3 pt-0.5 md:flex-row md:items-center">
              <PrimaryButton className="w-full md:w-auto" onClick={() => setSak("mina-plan")}>
                Åpne forslaget
              </PrimaryButton>
              <GhostButton className="hidden md:inline-flex" onClick={() => onScreen("stall")}>
                Se Mina Løken
              </GhostButton>
              <span className="hidden font-meta text-xs text-grafitt-500 md:inline">
                Foreslått 09:12 · AgenticOS Planagent
              </span>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-baseline gap-3 pb-3">
            <Seksjon>I dag</Seksjon>
            <span className="text-xs text-grafitt-500">3 økter · 1 fullført</span>
            <button type="button" className="ml-auto hidden text-xs text-bla-600 xl:inline" onClick={() => onScreen("kalender-uke")}>
              Åpne kalender
            </button>
          </div>
          <div className="grid grid-cols-[74px_minmax(0,1fr)] items-baseline gap-3 border-t border-sand-200 py-3 xl:grid-cols-[96px_minmax(0,1fr)_auto]">
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
            onClick={() => setSak("jonas-okt")}
            className="my-1.5 grid w-full grid-cols-1 gap-2.5 rounded-md border border-sand-500 bg-hevet p-4 text-left hover:border-grafitt-900 xl:grid-cols-[96px_minmax(0,1fr)_auto] xl:items-center"
          >
            <span className="flex flex-col gap-1">
              <span className="font-meta text-3xs uppercase tracking-meta text-rust-500">Neste</span>
              <span className="font-meta text-sm font-medium xl:text-base">12:30</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-display text-md font-semibold tracking-tight xl:text-lg">Teknikk · Jonas Five</span>
              <span className="text-xs text-grafitt-500">Studio 2 · 50 min · om 1 t 6 min</span>
            </span>
            <span className="text-sm text-grafitt-600">Åpne økt</span>
          </button>
          <div className="grid grid-cols-[74px_minmax(0,1fr)] items-baseline gap-3 border-t border-sand-200 py-3 xl:grid-cols-[96px_minmax(0,1fr)_auto]">
            <span className="font-meta text-xs text-grafitt-600">15:00–16:00</span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm xl:text-base">Spillsimulering · Gruppe GFGK 3</span>
              <span className="text-xs text-grafitt-500">Bane · 60 min · 6 spillere</span>
            </span>
            <span className="hidden text-xs text-grafitt-500 xl:block">Planlagt</span>
          </div>
        </section>

        <section>
          <div className="flex items-baseline gap-3 pb-3">
            <Seksjon>Trenger vurdering</Seksjon>
            <span className="text-xs text-grafitt-500">{koAntall} saker</span>
            <button type="button" className="ml-auto hidden text-xs text-grafitt-500 underline xl:inline" onClick={() => onScreen("ko")}>
              Åpne godkjenninger
            </button>
          </div>
          {ko.map((row, i) => (
            <button
              key={row.id}
              type="button"
              onClick={() => (row.id === "innboks" ? onScreen("innboks") : setSak(row.id))}
              className={cn(
                "grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-sand-200 py-3.5 text-left xl:grid-cols-[170px_minmax(0,1fr)_auto]",
                i === ko.length - 1 && "border-b",
              )}
            >
              <span className="hidden items-center gap-2 xl:flex">
                <span className={cn("inline-block size-1.5 rounded-full", TONE_DOT[row.tone])} />
                <span className={cn("font-meta text-xs uppercase tracking-etikett", TONE_TEXT[row.tone])}>{row.kind}</span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={cn("font-meta text-2xs uppercase tracking-etikett xl:hidden", TONE_TEXT[row.tone])}>{row.kind}</span>
                <span className="text-base font-medium">{row.title}</span>
                <span className="hidden text-xs text-grafitt-500 xl:block">{row.sub}</span>
              </span>
              <span className="hidden h-9 items-center rounded-control border border-sand-500 bg-hevet px-3.5 text-sm xl:inline-flex">
                {row.action}
              </span>
              <span className="text-grafitt-500 xl:hidden">›</span>
            </button>
          ))}
        </section>

        <section className="flex flex-col gap-3.5 rounded-md border border-sand-200 bg-hevet px-5 py-4">
          <div className="flex items-baseline gap-3">
            <Seksjon>AgenticOS</Seksjon>
            <span className="text-xs text-grafitt-500">Ingenting er publisert uten din godkjenning</span>
            <button type="button" className="ml-auto hidden text-xs text-grafitt-500 underline xl:inline" onClick={() => onScreen("spor")}>
              Alle kjøringer
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {["1 kjører", `${CADDIE_QUEUE.length} venter godkjenning`, "2 fullført i dag"].map((l) => (
              <span key={l} className="inline-flex h-[30px] items-center gap-2 rounded-pill border border-sand-400 px-3 text-xs">
                <span className="size-1.5 rounded-full bg-grafitt-600" />
                {l}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-sand-200 pt-3">
            <span className="flex flex-col gap-1">
              <span className="text-base">Belastningsanalyse · GFGK-stigen</span>
              <span className="font-meta text-xs text-grafitt-500">Startet 11:19 · leser registreringer · ingen data skrevet</span>
            </span>
            <span className="text-xs text-bla-600">Kjører</span>
          </div>
        </section>
      </ScreenStack>
    </StateGate>
  );
}

function HjemInspector({
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
  onOkt,
  onKo,
}: {
  sak: SakId | null;
  status: string;
  tid: string;
  onTid: (t: string) => void;
  onClose: () => void;
  onGodkjenn: () => void;
  onRediger: () => void;
  onAvvis: () => void;
  onAngre: () => void;
  onFeil: () => void;
  onRetry: () => void;
  onOkt: () => void;
  onKo: () => void;
}) {
  const labels: Record<string, string> = {
    venter: "Venter · ikke godkjent",
    rediger: "Redigerer tid · ikke lagret",
    utforer: "Utfører …",
    utfort: "Godkjent · ikke synlig for spiller ennå",
    avvist: "Avvist · planen uendret",
    feilet: "Feilet · ingenting tapt",
  };

  if (!sak) {
    return (
      <div className="flex h-full flex-col gap-6 p-[22px]">
        <div className="flex flex-col gap-2.5">
          <Meta>Kontekst</Meta>
          <p className="m-0 text-base text-grafitt-600">Velg en sak eller en økt for å se detaljene her uten å miste listen.</p>
        </div>
        <div className="flex flex-col gap-3.5 border-t border-sand-200 pt-5">
          <Meta>Trenger oppfølging</Meta>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium">Mina Løken</span>
            <span className="text-xs text-grafitt-500">2 avvik i belastningslogg siste 10 dager</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium">Iver Sandnes</span>
            <span className="text-xs text-grafitt-500">Ingen registrering siden 4. september</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium">Nora Tveit</span>
            <span className="text-xs text-grafitt-500">Fysisk test forfalt · 12 dager over</span>
          </div>
        </div>
      </div>
    );
  }

  if (sak === "jonas-okt") {
    return (
      <div className="flex h-full flex-col">
        <Bar onClose={onClose} label="Økt · i dag 12:30" />
        <div className="flex flex-col gap-5 p-5">
          <h2 className="m-0 font-display text-xl font-semibold">Teknikk · Jonas Five</h2>
          <p className="m-0 text-xs text-grafitt-500">Studio 2 · 50 min · planlagt</p>
          <PrimaryButton onClick={onOkt}>Åpne øktoppskrift</PrimaryButton>
        </div>
      </div>
    );
  }

  if (sak !== "mina-plan") {
    return (
      <div className="flex h-full flex-col">
        <Bar onClose={onClose} label="Sak" />
        <div className="flex flex-col gap-4 p-5">
          <h2 className="m-0 font-display text-xl font-semibold">{QUEUE.find((q) => q.id === sak)?.title}</h2>
          <Lead>{QUEUE.find((q) => q.id === sak)?.sub}</Lead>
          <GhostButton onClick={onKo}>Åpne køen</GhostButton>
        </div>
      </div>
    );
  }

  const vis = status === "venter" || status === "rediger";
  return (
    <div className="flex h-full flex-col">
      <Bar onClose={onClose} label="Forslag C-142" />
      <div className="flex flex-col gap-5 p-5">
        <StatusText tone={status === "feilet" || status === "venter" ? "haste" : "warn"}>{labels[status]}</StatusText>
        <h2 className="m-0 font-display text-xl font-semibold">Ukeplan uke 38 · Mina Løken</h2>
        {status === "feilet" ? (
          <div className="flex flex-col gap-2.5 rounded-md border border-rust-300 bg-rust-100 p-3.5">
            <span className="text-base font-semibold text-rust-600">Endringen ble ikke utført</span>
            <p className="m-0 text-xs text-rust-600">Serveren svarte ikke. Planen står uendret.</p>
            <PrimaryButton onClick={onRetry}>Prøv igjen</PrimaryButton>
          </div>
        ) : null}
        {status === "utforer" ? (
          <div className="rounded-md border border-amber-300 bg-amber-100 p-3.5 text-sm text-amber-700">Utfører endringen …</div>
        ) : null}
        {status === "utfort" ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 text-sm">Godkjent. Endringen er utført. Ikke synlig for Mina ennå.</p>
            <div className="flex gap-2.5">
              <PrimaryButton className="flex-1" onClick={onClose}>Tilbake til Hjem</PrimaryButton>
              <GhostButton className="flex-1" onClick={onAngre}>Angre</GhostButton>
            </div>
          </div>
        ) : null}
        {status === "avvist" ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 text-sm">Avvist. Planen står uendret.</p>
            <GhostButton onClick={onAngre}>Angre avvisning</GhostButton>
          </div>
        ) : null}
        {vis ? (
          <>
            <p className="m-0 text-sm">To harde økter innen 36 timer. Flytt gir 48 timer mellom belastningene.</p>
            <div className="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-center gap-2.5 rounded-md border border-sand-200 bg-sand-100 p-3">
              <span className="font-meta text-xs text-grafitt-500 line-through">lør 19.09 · 15:00</span>
              <span className="text-center text-grafitt-500">→</span>
              <span className="font-meta text-xs font-medium">{tid}</span>
            </div>
            {status === "rediger" ? (
              <div className="flex flex-wrap gap-2">
                {TIDER.map((t) => (
                  <GhostButton key={t} className={tid === t ? "border-grafitt-900" : ""} onClick={() => onTid(t)}>
                    {t}
                  </GhostButton>
                ))}
              </div>
            ) : null}
            <PrimaryButton onClick={onGodkjenn}>Godkjenn og utfør</PrimaryButton>
            <div className="flex gap-2.5">
              <GhostButton className="flex-1" onClick={onRediger}>Rediger</GhostButton>
              <GhostButton className="flex-1" danger onClick={onAvvis}>Avvis</GhostButton>
            </div>
            <button type="button" onClick={onFeil} className="self-start font-meta text-2xs text-grafitt-400">
              Simuler serverfeil
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Bar({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-sand-200 px-5 py-4">
      <button type="button" onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-control border border-sand-400 bg-hevet text-grafitt-600">
        ←
      </button>
      <Meta>{label}</Meta>
    </div>
  );
}
