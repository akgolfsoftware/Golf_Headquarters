import { useEffect, useState } from "react";
import type { AdminScreenId } from "@/lib/hq/types";
import { AgencyosChrome } from "./agencyos-chrome";
import { cn } from "./ui";

type SakId = "mina-plan" | "nærspill" | "iver-utkast" | "jonas-tid" | "innboks" | "jonas-okt";
type Status = "venter" | "rediger" | "utforer" | "utfort" | "avvist" | "feilet";
type Tone = "haste" | "advarsel" | "info" | "dempet";

const QUEUE: { id: SakId; kind: string; tone: Tone; title: string; sub: string; action: string }[] = [
  { id: "mina-plan", kind: "Godkjenning", tone: "haste", title: "Ukeplan uke 38 · Mina Løken", sub: "Flytter én belastende økt · påvirker spillerens plan", action: "Vurder" },
  { id: "nærspill", kind: "Godkjenning", tone: "advarsel", title: "Øktoppskrift · Nærspill 30 m", sub: "Venter siden i går 16:40", action: "Vurder" },
  { id: "iver-utkast", kind: "Caddie-utkast", tone: "advarsel", title: "Tilbakemelding etter runde · Iver Sandnes", sub: "Utkast fra AI · ikke sendt", action: "Les utkast" },
  { id: "jonas-tid", kind: "Øktforespørsel", tone: "info", title: "Jonas Five ønsker ny tid fredag", sub: "14:00 til 16:30 · ledig", action: "Svar" },
  { id: "innboks", kind: "Melding", tone: "dempet", title: "3 uleste i innboksen", sub: "Eldste fra foresatt · 2 dager", action: "Åpne" },
];

const DOT: Record<Tone, string> = { haste: "bg-rust-500", advarsel: "bg-amber-600", info: "bg-bla-600", dempet: "bg-sand-500" };
const TXT: Record<Tone, string> = { haste: "text-rust-500", advarsel: "text-amber-600", info: "text-bla-600", dempet: "text-grafitt-500" };

export function HjemFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const [sak, setSak] = useState<SakId | null>("mina-plan");
  const [status, setStatus] = useState<Status>("venter");

  useEffect(() => {
    if (status !== "utforer") return;
    const t = window.setTimeout(() => setStatus("utfort"), 800);
    return () => window.clearTimeout(t);
  }, [status]);

  const ferdig = status === "utfort";
  const ko = QUEUE.filter((r) => !(r.id === "mina-plan" && ferdig));

  return (
    <AgencyosChrome current="hjem" path="/admin/hjem" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-6 pb-8">
          <section className={cn("mb-8 border-l-[3px] py-1 pl-5", ferdig ? "border-grafitt-600" : "border-rust-500")}>
            <div className={cn("font-display text-[13px] font-semibold uppercase tracking-etikett", ferdig ? "text-grafitt-600" : "text-rust-500")}>
              {ferdig ? "Nå · neste prioritet" : "Nå · haster · ikke godkjent"}
            </div>
            <h1 className="m-0 mt-2 max-w-[22ch] font-display text-[32px] font-semibold tracking-tight">
              {ferdig ? "Svar på øktforespørsel fra Jonas Five" : "Vurder ukeplan for Mina Løken"}
            </h1>
            <p className="m-0 mt-2 max-w-[62ch] text-[15px] text-grafitt-600">
              {ferdig
                ? "Fredag 14:00 til 16:30. Kalenderen viser ledig. Ingen melding er sendt ennå."
                : "AgenticOS foreslår å flytte én belastende økt. Forslaget er ikke godkjent, og ingenting er sendt til spilleren."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSak(ferdig ? "jonas-tid" : "mina-plan")}
                className="h-11 rounded-lg bg-grafitt-900 px-5 text-[15px] font-medium text-white"
              >
                {ferdig ? "Åpne forespørselen" : "Åpne forslaget"}
              </button>
              <button type="button" onClick={() => onScreen("stall")} className="hidden h-11 rounded-lg border border-sand-400 px-4 text-[15px] md:inline-flex md:items-center">
                Se Mina Løken
              </button>
            </div>
          </section>

          <h2 className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-seksjon text-grafitt-600">I dag · 3 økter</h2>
          <div className="mb-2 grid grid-cols-[88px_1fr] gap-3 border-t border-sand-200 py-3 text-[14px]">
            <span className="font-meta text-grafitt-400 line-through">10:00–10:50</span>
            <span>Innspill 50–80 m · Mina Løken</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSak("jonas-okt");
              onScreen("okt-individuell");
            }}
            className="mb-2 grid w-full grid-cols-[88px_1fr] gap-3 rounded-lg border border-sand-400 bg-hevet p-3 text-left"
          >
            <span>
              <span className="block font-meta text-[10px] uppercase tracking-etikett text-rust-500">Neste</span>
              <span className="font-semibold">12:30</span>
            </span>
            <span>
              <span className="block font-display text-[18px] font-semibold">Teknikk · Jonas Five</span>
              <span className="text-[12px] text-grafitt-500">Studio 2 · 50 min</span>
            </span>
          </button>
          <div className="mb-8 grid grid-cols-[88px_1fr] gap-3 border-t border-sand-200 py-3 text-[14px]">
            <span className="font-meta text-grafitt-500">15:00–16:00</span>
            <span>Spillsimulering · Gruppe GFGK 3</span>
          </div>

          <h2 className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-seksjon text-grafitt-600">
            Trenger vurdering · {ko.length}
          </h2>
          {ko.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => (row.id === "innboks" ? onScreen("innboks") : setSak(row.id))}
              className="flex min-h-12 w-full items-center justify-between gap-3 border-t border-sand-200 py-3 text-left"
            >
              <span>
                <span className={cn("font-meta text-[10px] uppercase tracking-etikett", TXT[row.tone])}>{row.kind}</span>
                <span className="block text-[15px] font-medium">{row.title}</span>
              </span>
              <span className={cn("size-1.5 rounded-full", DOT[row.tone])} />
            </button>
          ))}
        </main>

        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 lg:flex">
          <HjemInspector
            sak={sak}
            status={status}
            onGodkjenn={() => setStatus("utforer")}
            onRediger={() => setStatus("rediger")}
            onAvvis={() => setStatus("avvist")}
            onAngre={() => setStatus("venter")}
            onKo={() => onScreen("ko")}
          />
        </aside>
      </div>
    </AgencyosChrome>
  );
}

function HjemInspector({
  sak,
  status,
  onGodkjenn,
  onRediger,
  onAvvis,
  onAngre,
  onKo,
}: {
  sak: SakId | null;
  status: Status;
  onGodkjenn: () => void;
  onRediger: () => void;
  onAvvis: () => void;
  onAngre: () => void;
  onKo: () => void;
}) {
  const label: Record<Status, string> = {
    venter: "Venter · ikke godkjent",
    rediger: "Redigerer · ikke lagret",
    utforer: "Utfører …",
    utfort: "Godkjent · ikke synlig for spiller ennå",
    avvist: "Avvist · planen uendret",
    feilet: "Feilet · ingenting tapt",
  };
  return (
    <div className="flex h-full flex-col p-5">
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kontekst</div>
      <h2 className="m-0 mt-2 font-display text-[22px] font-semibold">
        {sak === "mina-plan" ? "Ukeplan uke 38 · Mina" : sak === "jonas-okt" ? "Teknikk · Jonas" : "Velg en sak"}
      </h2>
      <p className="m-0 mt-2 text-[12px] text-grafitt-500">{label[status]}</p>
      {sak === "mina-plan" ? (
        <div className="mt-4 flex flex-col gap-2">
          {status === "avvist" ? (
            <button type="button" onClick={onAngre} className="h-10 rounded-lg bg-grafitt-900 text-[13px] font-medium text-white">
              Angre avvisning
            </button>
          ) : (
            <>
              <button type="button" onClick={onGodkjenn} className="h-10 rounded-lg bg-grafitt-900 text-[13px] font-medium text-white">
                Godkjenn
              </button>
              <button type="button" onClick={onRediger} className="h-10 rounded-lg border border-sand-400 text-[13px]">
                Rediger tid
              </button>
              <button type="button" onClick={onAvvis} className="h-10 rounded-lg border border-sand-300 text-[13px] text-handling">
                Avvis
              </button>
            </>
          )}
          <button type="button" onClick={onKo} className="h-10 text-[12px] text-grafitt-500">
            Åpne godkjenninger
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-grafitt-500">Velg en sak i køen. Listen forsvinner ikke.</p>
      )}
    </div>
  );
}
