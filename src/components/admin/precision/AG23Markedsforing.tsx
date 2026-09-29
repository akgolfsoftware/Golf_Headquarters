"use client";

/**
 * AG-23 Markedsføring i Precision Athletics (AG-mer.jsx, fane Markedsføring,
 * runde 30). Tegningen viser e-postutsendelser; koden har innholdskalender
 * med poster per kanal (MarketingPost). Data og handlinger er uendret
 * (opprettMarketingPost, settMarketingStatus); avviket står i PR-teksten.
 */
import { useMemo, useState, useTransition } from "react";
import { Megaphone, Plus, RefreshCw } from "lucide-react";
import { Knapp, LasterTilstand, FeilTilstand, TomTilstand, StatusPille, Meta } from "@/components/precision/pa";
import { Felt, Kort, KortHode, Ark, InlineVarsel, Tabell, type Kolonne } from "@/components/precision/pa-a5";
import { AG23Hode, TekstFeltStor } from "./AG23Hode";
import { opprettMarketingPost, settMarketingStatus } from "@/lib/admin-marketing/actions";
import { KANAL_NAVN, MARKETING_KANALER, MARKETING_STATUSER, type MarketingKanal, type MarketingStatus } from "@/lib/admin-marketing/konstanter";
import "@/styles/precision-a5.css";

export type AG23MarkedsTilstand = "data" | "tom" | "laster" | "feil";
export type MarketingPostRad = { id: string; tittel: string; kanal: MarketingKanal; datoLabel: string; passert: boolean; brief: string | null; status: MarketingStatus };

const STATUS_LABEL: Record<MarketingStatus, string> = { UTKAST: "Utkast", KLAR: "Klar", PUBLISERT: "Publisert" };
const STATUS_TONE: Record<MarketingStatus, "neutral" | "warn" | "ok"> = { UTKAST: "neutral", KLAR: "warn", PUBLISERT: "ok" };
const neste = (s: MarketingStatus) => MARKETING_STATUSER[(MARKETING_STATUSER.indexOf(s) + 1) % MARKETING_STATUSER.length]!;

function StatusKnapp({ id, status }: { id: string; status: MarketingStatus }) {
  const [lokal, setLokal] = useState(status);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);
  const sykle = () => {
    const n = neste(lokal);
    setLokal(n);
    start(async () => {
      setFeil(false);
      try {
        const res = await settMarketingStatus(id, n);
        if (!res.ok) throw new Error(res.error);
      } catch { setLokal(lokal); setFeil(true); }
    });
  };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
    {feil && <Meta>FEILET, PRØV IGJEN</Meta>}
    <button type="button" onClick={sykle} disabled={pending} title={`Bytt til ${STATUS_LABEL[neste(lokal)].toLowerCase()}`}
      style={{ appearance: "none", background: "transparent", border: 0, padding: 0, minHeight: "var(--hit-min)", minWidth: "var(--hit-min)", cursor: "pointer", opacity: pending ? 0.5 : 1 }}>
      <StatusPille tone={STATUS_TONE[lokal]}>{STATUS_LABEL[lokal]}</StatusPille>
    </button>
  </span>;
}

function NyPost({ open, onClose }: { open: boolean; onClose: () => void }) {
  const iDag = useMemo(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }, []);
  const [tittel, setTittel] = useState("");
  const [kanal, setKanal] = useState<MarketingKanal>("IG");
  const [dato, setDato] = useState(iDag);
  const [brief, setBrief] = useState("");
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const kanLagre = tittel.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dato) && !pending;
  const lagre = () => start(async () => {
    setFeil(null);
    try {
      const res = await opprettMarketingPost({ title: tittel, channel: kanal, scheduledAt: dato, brief: brief.trim() || undefined });
      if (!res.ok) { setFeil(res.error ?? "Noe gikk galt. Prøv igjen."); return; }
      setTittel(""); setBrief("");
      onClose();
    } catch { setFeil("Noe gikk galt. Prøv igjen."); }
  });
  return <Ark open={open} onClose={onClose} kicker="Innholdskalender" tittel="Ny post"
    footer={<><Knapp fullWidth disabled={!kanLagre} loading={pending} onClick={lagre}>Legg i kalenderen</Knapp><Knapp variant="ghost" fullWidth disabled={pending} onClick={onClose}>Avbryt</Knapp></>}>
    <Felt label="Tittel"><TekstFeltStor value={tittel} onChange={(e) => setTittel(e.target.value)} placeholder="Vintertrening i simulatoren" /></Felt>
    <div role="group" aria-label="Kanal" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {MARKETING_KANALER.map((k) => <button key={k} type="button" className="pa-choice" aria-pressed={k === kanal} onClick={() => setKanal(k)}>{KANAL_NAVN[k]}</button>)}
    </div>
    <Felt label="Dato"><TekstFeltStor type="date" value={dato} onChange={(e) => setDato(e.target.value)} /></Felt>
    <Felt label="Brief (valgfritt)">
      <span className="pa-control" style={{ height: "auto", padding: "10px 12px", alignItems: "stretch" }}>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="Vinkling, budskap, bilde eller video" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "inherit", font: "var(--type-body)", resize: "vertical" }} />
      </span>
    </Felt>
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
  </Ark>;
}

export function AG23Markedsforing({ tilstand, poster }: { tilstand: AG23MarkedsTilstand; poster: MarketingPostRad[] }) {
  const [ny, setNy] = useState(false);
  const kommende = poster.filter((p) => !p.passert);
  const tidligere = poster.filter((p) => p.passert);
  const klar = poster.filter((p) => p.status === "KLAR").length;
  const utkast = poster.filter((p) => p.status === "UTKAST").length;
  const kolonner: Kolonne<MarketingPostRad>[] = [
    { key: "tittel", label: "Post", render: (r) => r.tittel },
    { key: "dato", label: "Dato", mono: true, render: (r) => r.datoLabel },
    { key: "kanal", label: "Kanal", render: (r) => KANAL_NAVN[r.kanal] },
    { key: "brief", label: "Brief", render: (r) => r.brief ?? "—" },
    { key: "status", label: "Status", align: "right", render: (r) => <StatusKnapp id={r.id} status={r.status} /> },
  ];
  const nyKnapp = <Knapp size="sm" icon={Plus} iconName="plus" onClick={() => setNy(true)}>Ny post</Knapp>;
  return <div className="pa-side">
    <AG23Hode sted="marketing" kicker="Mer · Oppsett · Markedsføring" tittel="Markedsføring" sub="Innholdskalender og poster per kanal. Ingenting publiseres herfra." />
    {tilstand === "laster" && <LasterTilstand text="Henter innholdskalenderen …" />}
    {tilstand === "feil" && <FeilTilstand icon={Megaphone} title="Kalenderen kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="MARKEDSFØRING · FEIL" retry={<Knapp variant="secondary" icon={RefreshCw} iconName="refresh-cw" onClick={() => window.location.reload()}>Prøv igjen</Knapp>} />}
    {tilstand === "tom" && <TomTilstand icon={Megaphone} title="Ingen planlagte poster" text="Legg den første posten i kalenderen." actions={nyKnapp} />}
    {tilstand === "data" && <div className="pa-a5-stack">
      <div className="pa-a5-stat-grid">
        <div className="pa-a5-stat"><span className="pa-a5-stat__label">Kommende</span><span className="pa-a5-stat__value">{kommende.length}</span></div>
        <div className="pa-a5-stat"><span className="pa-a5-stat__label">Klare</span><span className="pa-a5-stat__value">{klar}</span></div>
        <div className="pa-a5-stat"><span className="pa-a5-stat__label">Utkast</span><span className="pa-a5-stat__value">{utkast}</span></div>
      </div>
      <div>{nyKnapp}</div>
      <Kort><KortHode tittel="Kommende poster" aside={`${kommende.length} ${kommende.length === 1 ? "POST" : "POSTER"}`} />
        <Tabell columns={kolonner} rows={kommende} tomTekst="Ingen kommende poster." /></Kort>
      {tidligere.length > 0 && <Kort><KortHode tittel="Tidligere poster" aside={`${tidligere.length} ${tidligere.length === 1 ? "POST" : "POSTER"}`} />
        <Tabell columns={kolonner} rows={tidligere} /></Kort>}
    </div>}
    <NyPost open={ny} onClose={() => setNy(false)} />
  </div>;
}
