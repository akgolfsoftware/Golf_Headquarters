/**
 * AG-13 Live-tavle i Skrå-drakten (bølge 2, pakke A4, skissen
 * https://claude.ai/artifact/781SDnPSrEGK7Kc6uy4K77 seksjon 6: lav topp uten bilde, godkjent av Anders 22.10.2026).
 * Kilde: docs/design-system/utkast-skra/komponist/bolge-2.html. Stil: agencyos-ny-a4-skra.css.
 *
 * Ren visning: dataene kommer uendret fra hentLiveTavle() (T9, 27.08.2026)
 * — pågående treningsøkter (trainingSessionV2, status IN_PROGRESS) og
 * planlagte økter senere i dag. Trykk på et kort åpner live-økta (/admin/agencyos/live/[id]).
 * Rust brukes bare på Live-pillen i toppen.
 *
 * Avvik: «Coach» og TrackMan-slaglogg i live-kortet er ikke med: tavla logger
 * ikke coach-tilknytning eller live-slag per økt ennå.
 */
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/admin/agencyos-ny/ny";
import { SkraKort, SkraTom, SkraTopp } from "@/components/precision/skra/Skra";
import type { LiveTavleData } from "@/lib/agencyos/live-tavle-data";
import "@/styles/agencyos-ny-live.css";
import "@/styles/agencyos-ny-a4-skra.css";

const klokke = (iso: string) => new Date(iso).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

function OktKort({ okt }: { okt: LiveTavleData["liveOkter"][number] }) {
  const pct = Math.max(0, Math.min(100, okt.fremdriftPct));
  return (
    <Link href={`/admin/agencyos/live/${okt.id}`} className="a4-tavle-okt" aria-label={`${okt.spillerNavn ?? "Gruppe"}, ${okt.tittel}, ${okt.minIgjen} min igjen`}>
      <div className="rad">
        <Avatar navn={okt.spillerNavn ?? "Gruppe"} liten />
        <span><b>{okt.spillerNavn ?? "Gruppe"}</b><span className="kilde">{okt.tittel}</span></span>
        <span className="kilde">{klokke(okt.startTime)}</span>
      </div>
      <span className="igjen">{okt.minIgjen}<small>min igjen</small></span>
      <span className="stolpe" role="img" aria-label={`${pct} % av økta er gått`}><i style={{ width: `${pct}%` }} /></span>
    </Link>
  );
}

export function AG13LiveTavle({ data }: { data: LiveTavleData }) {
  const n = data.liveOkter.length;
  return (
    <div className="agn-s a4">
      <div className="agn-topp-lav">
        <SkraTopp
          lav
          etikett="Live-tavle"
          overlinje="Live"
          tittel="Tavla"
          ingress={n > 0 ? `${n} ${n === 1 ? "økt pågår" : "økter pågår"} nå` : "Ingen økter pågår nå"}
          handling={n > 0 ? <div className="agn-topp-handl"><span className="live-pille"><i aria-hidden />Live · {n} {n === 1 ? "økt" : "økter"}</span></div> : undefined}
        />
      </div>
      <SkraKort tittel="Pågår nå" meta={n > 0 ? String(n) : "—"}>
        {n === 0
          ? <SkraTom handling={<Link href="/admin/kalender" className="knapp sek" style={{ justifySelf: "start" }}><CalendarDays className="ikon" aria-hidden />Åpne Kalender</Link>}>Økter som settes i gang, vises her.</SkraTom>
          : <div className="a4-tavle" aria-label="Pågående økter">{data.liveOkter.map((okt) => <OktKort key={okt.id} okt={okt} />)}</div>}
      </SkraKort>
      <SkraKort tittel="Kommer i dag" meta={data.kommerIDag.length ? String(data.kommerIDag.length) : "—"}>
        {data.kommerIDag.length === 0
          ? <SkraTom>Ingen flere planlagte økter i dag.</SkraTom>
          : <div className="liste">{data.kommerIDag.map((k) => (
            <Link key={k.id} href={`/admin/agencyos/live/${k.id}`}>
              <Avatar navn={k.spillerNavn ?? "Gruppe"} liten />
              <span><b>{k.spillerNavn ?? "Gruppe"}</b><span className="kilde">{k.tittel}</span></span>
              <span className="mono">{klokke(k.startTime)}</span>
            </Link>
          ))}</div>}
      </SkraKort>
    </div>
  );
}
