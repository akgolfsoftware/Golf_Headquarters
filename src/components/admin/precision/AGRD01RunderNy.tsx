"use client";

/**
 * AG-RD-01 Rundeanalyse i nytt design (pakke 6).
 * Fasit: docs/design-system/utkast-agencyos/teknisk.html, skjerm «AG-RD-01 Runder».
 * Rute: /admin/runder. Stil: src/styles/agencyos-ny-teknisk.css.
 * Funksjoner som før: nyeste 50 runder i stallen, søk, filter på datagrunnlag, raden åpner
 * Spiller 360 › Stats › Snittscore. Brutto score, snitt bare på tellende runder.
 *
 * Avvik:
 *   - «Forslag fra rundene» (utkast i Workbench) finnes ikke i koden ennå og vises ikke.
 *   - Kilde (PlayerHQ eller GolfBox) lagres ikke per runde; raden viser Turnering eller Trening.
 *   - «Delvis» betyr hullkort uten slag. Runder uten SG-grunnlag behandles i Innboks › Datakvalitet.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Feil, Laster, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import { desimal, sg, tilPar } from "@/lib/admin-spiller/spiller360-visning";
import "@/styles/agencyos-ny-teknisk.css";

export type RundeRad = {
  id: string;
  spiller: string;
  spillerId: string;
  hcp: string | null;
  bane: string;
  dato: string;
  brutto: number;
  tilPar: number;
  hull: number | null;
  sg: number | null;
  type: "Turnering" | "Trening";
  grunnlag: "Slag for slag" | "Hullkort" | "Scorekort";
};

export type RunderData = {
  vist: number;
  total: number;
  spillere: number;
  snittBrutto: number | null;
  snittTilPar: number | null;
  tellende: number;
  beste: { brutto: number; tilPar: number; spiller: string; bane: string } | null;
  sgSnitt: number | null;
  sgRunder: number;
  kilde: string;
  runder: RundeRad[];
};

type Kval = "alle" | "full" | "delvis" | "score";
const KVAL: Record<RundeRad["grunnlag"], Exclude<Kval, "alle">> = { "Slag for slag": "full", Hullkort: "delvis", Scorekort: "score" };
const KVAL_NAVN: Record<Kval, string> = { alle: "Alle", full: "Slag for slag", delvis: "Delvis", score: "Bare score" };

export function AGRD01RunderNy({ tilstand, data }: { tilstand: "data" | "tom" | "laster" | "feil"; data: RunderData }) {
  const [sok, setSok] = useState("");
  const [spiller, setSpiller] = useState<string | null>(null);
  const [kval, setKval] = useState<Kval>("alle");

  const spillere = useMemo(() => [...new Map(data.runder.map((r) => [r.spillerId, r.spiller])).entries()], [data.runder]);
  const forSpiller = useMemo(() => data.runder.filter((r) => !spiller || r.spillerId === spiller), [data.runder, spiller]);
  const antall = (k: Kval) => (k === "alle" ? forSpiller.length : forSpiller.filter((r) => KVAL[r.grunnlag] === k).length);
  const rader = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return forSpiller.filter((r) => (kval === "alle" || KVAL[r.grunnlag] === kval) && (!q || r.spiller.toLowerCase().includes(q) || r.bane.toLowerCase().includes(q)));
  }, [forSpiller, kval, sok]);
  const full = antall("full");
  const utenSg = data.runder.filter((r) => r.grunnlag !== "Slag for slag").length;

  return <div className="agn-s">
    <Topp dato="Stall · runder" tittel="Runder" />
    {tilstand === "laster" ? <Laster tekst="Henter rundene …" hoyder={[44, 72, 72, 72]} />
      : tilstand === "feil" ? <Feil tittel="Rundene kunne ikke hentes" tekst="Ingen runder er endret. Prøv igjen." kode="FEIL · RUNDER" />
      : tilstand === "tom" || data.total === 0 ? <Tom tittel="Ingen runder" tekst="Runder fra PlayerHQ og GolfBox kommer hit, med brutto score og datagrunnlag." />
      : <>
        {spillere.length > 1 && <div className="chips" role="group" aria-label="Spiller">
          <button type="button" aria-pressed={spiller == null} onClick={() => setSpiller(null)}>Hele stallen</button>
          {spillere.map(([id, navn]) => <button key={id} type="button" aria-pressed={spiller === id} onClick={() => setSpiller(id)}>{navn}</button>)}
        </div>}
        <div className="chips" role="group" aria-label="Datakvalitet">
          {(Object.keys(KVAL_NAVN) as Kval[]).map((k) => <button key={k} type="button" aria-pressed={kval === k} onClick={() => setKval(k)}>{KVAL_NAVN[k]} <b>{antall(k)}</b></button>)}
        </div>
        <div className="felt"><label htmlFor="rd-sok">Søk etter spiller eller bane</label><input id="rd-sok" type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Navn eller bane" /></div>
        <div className="to-del bred-v">
          <Seksjon tittel={`Runder · ${rader.length}`} kilde={`Nyeste ${data.vist} av ${data.total}`}>
            {rader.length === 0 ? <p className="kilde">Ingen runder med dette filteret.</p>
              : <div className="runder-liste">{rader.map((r) => <Link key={r.id} className="runde" href={`/admin/spillere/${r.spillerId}?fane=stats&del=snitt`}>
                <Avatar navn={r.spiller} liten />
                <span>
                  <b className="n">{r.spiller} · {r.bane}</b>
                  <span className="kilde">{r.dato} · {r.type}{r.hull && r.hull < 18 ? ` · ${r.hull} hull` : ""}{r.sg != null ? ` · SG ${sg(r.sg)}` : ""}</span>
                  <span className={`kvalitet ${KVAL[r.grunnlag]}`}>{KVAL_NAVN[KVAL[r.grunnlag]]}</span>
                </span>
                <span><b className="s">{r.brutto}</b><span className="kilde" style={{ textAlign: "right" }}>{tilPar(r.tilPar)}</span></span>
              </Link>)}</div>}
          </Seksjon>
          <div>
            <div className="kort">
              <div className="hoved"><strong>{full}<small>av {forSpiller.length}</small></strong><span className="forklar">viste runder har slag for slag</span></div>
              <p className="kilde">Bare runder med slag for slag gir Strokes Gained.</p>
            </div>
            <div className="kort">
              <b className="undertittel">Snitt</b>
              <p className="forklar">Brutto <b>{desimal(data.snittBrutto)}</b> · mot par <b>{data.snittTilPar == null ? "—" : sg(data.snittTilPar)}</b></p>
              <p className="kilde">{data.tellende} tellende runder. Ni hull teller ikke.</p>
              <p className="forklar">SG totalt <b>{sg(data.sgSnitt)}</b> · {data.sgRunder} runder med SG</p>
              <p className="forklar">Beste runde <b>{data.beste ? `${data.beste.brutto} (${tilPar(data.beste.tilPar)})` : "—"}</b>{data.beste ? ` · ${data.beste.spiller}, ${data.beste.bane}` : ""}</p>
            </div>
            {utenSg > 0 && <Link className="lenke" href="/admin/innboks?filter=datakvalitet">{utenSg} {utenSg === 1 ? "runde mangler" : "runder mangler"} SG-grunnlag</Link>}
          </div>
        </div>
      </>}
  </div>;
}

