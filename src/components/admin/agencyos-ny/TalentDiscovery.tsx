"use client";

/**
 * Talent · Discovery (/innsyn/talent/discovery) — Precision Athletics, i AgencyOSSkall. Bare for coach.
 * Spillere utenfor talent-tracking: søk, filtrer på HCP og klubb, og legg inn i oppfølgingen.
 * Samme datakontrakt og samme server-handling som før (leggTilITalent).
 */
import { useMemo, useState, useTransition } from "react";
import { leggTilITalent, type LeggTilState } from "@/app/innsyn/talent/discovery/actions";
import { formaterTall } from "@/lib/format-tall";
import { Avatar, Knapp, KnappLenke, Pille, Seksjon, Tom, Varsel } from "./ny";

export interface TalentKandidat {
  id: string;
  navn: string;
  /** Rå HCP for filtrering; null = ukjent. */
  hcp: number | null;
  playingYears: number | null;
  homeClub: string | null;
}

export interface TalentDiscoveryData {
  total: number;
  kandidater: TalentKandidat[];
  /** Unike hjemmeklubber (for filter). */
  klubber: string[];
}

// Speiler NIVAA i server-handlingen (leggTilITalent).
const NIVAA = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
type Niva = (typeof NIVAA)[number];

const HCP_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "0-5", label: "HCP 0–5", min: 0, max: 5 },
  { key: "5-15", label: "HCP 5–15", min: 5, max: 15 },
  { key: "15-30", label: "HCP 15–30", min: 15, max: 30 },
  { key: "30+", label: "HCP 30+", min: 30, max: 999 },
];

function fmtHcp(hcp: number | null): string {
  return formaterTall(hcp, 1, true);
}

function KandidatRad({ k }: { k: TalentKandidat }) {
  const [apen, setApen] = useState(false);
  const [pending, start] = useTransition();
  const [res, setRes] = useState<LeggTilState>({ ok: false });
  const [niva, setNiva] = useState<Niva>("U14");
  const [klubb, setKlubb] = useState(k.homeClub ?? "");
  const [region, setRegion] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const fd = new FormData();
    fd.set("userId", k.id);
    fd.set("niva", niva);
    fd.set("klubb", klubb);
    fd.set("region", region);
    start(async () => setRes(await leggTilITalent({ ok: false }, fd)));
  }

  const aar = k.playingYears != null ? `${k.playingYears} spilte år` : "Spilte år ukjent";
  const id = `td-${k.id}`;

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}>
        <Avatar navn={k.navn} liten />
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", font: "600 15px/1.3 var(--sans)" }}>{k.navn}</b>
          <span className="kilde" style={{ display: "block" }}>{k.homeClub ?? "Ukjent klubb"} · {aar} · HCP <span className="mono">{fmtHcp(k.hcp)}</span></span>
        </span>
        {res.ok ? (
          <Pille tone="ok">Lagt til</Pille>
        ) : (
          <Knapp variant="sek" aria-expanded={apen} aria-controls={id} onClick={() => setApen(!apen)}>{apen ? "Lukk" : "Legg til"}</Knapp>
        )}
      </div>
      {apen && !res.ok && (
        <form id={id} className="kort dempet" onSubmit={submit}>
          <div className="felt">
            <label htmlFor={`${id}-niva`}>Nivå</label>
            <select id={`${id}-niva`} value={niva} onChange={(e) => setNiva(e.target.value as Niva)}>
              {NIVAA.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="felt">
            <label htmlFor={`${id}-klubb`}>Hjemmeklubb</label>
            <input id={`${id}-klubb`} value={klubb} onChange={(e) => setKlubb(e.target.value)} placeholder="F.eks. GFGK" />
          </div>
          <div className="felt">
            <label htmlFor={`${id}-region`}>Region</label>
            <input id={`${id}-region`} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="F.eks. Østfold" />
          </div>
          {res.error && <Varsel tone="advarsel">{res.error}</Varsel>}
          <div className="knapper"><Knapp type="submit" disabled={pending}>{pending ? "Lagrer …" : "Legg til i talent"}</Knapp></div>
        </form>
      )}
    </div>
  );
}

export function TalentDiscovery({ data }: { data: TalentDiscoveryData }) {
  const [sok, setSok] = useState("");
  const [hcpAktiv, setHcpAktiv] = useState<string[]>([]);
  const [klubbAktiv, setKlubbAktiv] = useState<string[]>([]);
  const klubbValg = useMemo(() => data.klubber.slice(0, 16), [data.klubber]);

  const veksle = (arr: string[], set: (v: string[]) => void) => (x: string) =>
    set(arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const valgteRanges = HCP_RANGES.filter((r) => hcpAktiv.includes(r.key));
    return data.kandidater.filter((k) => {
      if (q && !k.navn.toLowerCase().includes(q) && !(k.homeClub ?? "").toLowerCase().includes(q)) return false;
      if (valgteRanges.length > 0) {
        if (k.hcp == null) return false;
        const hcp = k.hcp;
        if (!valgteRanges.some((r) => hcp >= r.min && hcp < r.max)) return false;
      }
      if (klubbAktiv.length > 0 && (k.homeClub == null || !klubbAktiv.includes(k.homeClub))) return false;
      return true;
    });
  }, [data.kandidater, sok, hcpAktiv, klubbAktiv]);

  if (data.kandidater.length === 0) {
    return (
      <Tom
        tittel="Alle spillere er i tracking"
        tekst="Ingen spillere står utenfor talent-oppfølgingen akkurat nå. Se radaren for oppfølging."
        handling={<KnappLenke href="/innsyn/talent/radar">Åpne talent-radar</KnappLenke>}
      />
    );
  }

  return (
    <>
      <div className="teller-rad">
        <div className="teller" style={{ cursor: "default" }}><span className="e">Kandidater</span><b className="t">{data.total}</b></div>
        <div className="teller" style={{ cursor: "default" }}><span className="e">Klubber</span><b className="t">{data.klubber.length}</b></div>
        <div className="teller" style={{ cursor: "default" }}><span className="e">I utvalg nå</span><b className="t">{filtrert.length}</b></div>
      </div>

      <div className="felt">
        <label htmlFor="td-sok">Søk</label>
        <input id="td-sok" type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Spiller eller klubb" />
      </div>

      <div className="felt">
        <span className="etikett">HCP</span>
        <div className="chips" role="group" aria-label="HCP">
          {HCP_RANGES.map((r) => (
            <button key={r.key} type="button" aria-pressed={hcpAktiv.includes(r.key)} onClick={() => veksle(hcpAktiv, setHcpAktiv)(r.key)}>{r.label}</button>
          ))}
        </div>
      </div>

      {klubbValg.length > 0 && (
        <div className="felt">
          <span className="etikett">Klubb</span>
          <div className="chips" role="group" aria-label="Klubb">
            {klubbValg.map((k) => (
              <button key={k} type="button" aria-pressed={klubbAktiv.includes(k)} onClick={() => veksle(klubbAktiv, setKlubbAktiv)(k)}>{k}</button>
            ))}
          </div>
        </div>
      )}

      <Seksjon tittel="Kandidater" kilde={filtrert.length === 1 ? "1 treff" : `${filtrert.length} treff`}>
        {filtrert.length === 0 ? (
          <Tom tittel="Ingen treff" tekst="Fjern filtre eller endre søketeksten." />
        ) : (
          <div className="kort">
            {filtrert.map((k) => <KandidatRad key={k.id} k={k} />)}
          </div>
        )}
      </Seksjon>
    </>
  );
}
