"use client";

/**
 * PH-13 Øvelser fra coach — nytt design (pakke 11 og 12, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, mal «ovelser».
 *
 * Avvik:
 *   - «Sendt fra coach» er øvelsene i økter coachen har lagt i planen din (WorkbenchDrill i WorkbenchSession
 *     opprettet av en annen enn deg). Det finnes ingen egen «send øvelse»-handling.
 *   - Kortene lenker til øvelsen i Øvelsesbanken, der «Legg i plan» ligger. Øvelser uten kobling til
 *     banken (bare tittel i økta) er ikke lenker.
 *   - Bildet er øvelsens eget bilde, ellers et nøytralt bilde for aksen fra /images/playerhq/.
 *   - Ingen «Ny øvelse»-knapp (åpent spørsmål hos Anders): «Til Øvelsesbanken» i stedet.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";

export type CoachAkse = "fys" | "tek" | "slag" | "spill" | "turn";

export type PH13CoachOvelse = {
  key: string;
  /** ExerciseDefinition.id, eller null når økta bare har en tittel. */
  ovelseId: string | null;
  navn: string;
  akse: CoachAkse | null;
  info: string[];
  /** «Fra Anders 2. okt.» */
  fra: string;
  iPlanen: boolean;
  bilde: string | null;
};

export type PH13CoachOvelserData = { coachFornavn: string | null; ovelser: PH13CoachOvelse[] };

const AKSER: { a: CoachAkse; navn: string }[] = [
  { a: "fys", navn: "FYS" }, { a: "tek", navn: "TEK" }, { a: "slag", navn: "SLAG" }, { a: "spill", navn: "SPILL" }, { a: "turn", navn: "TURN" },
];
const BILDE: Record<CoachAkse, string> = {
  fys: "/images/playerhq/fys-styrke.jpg", tek: "/images/playerhq/tek-video.jpg", slag: "/images/playerhq/slag-utslag.jpg",
  spill: "/images/playerhq/spill-bane.jpg", turn: "/images/playerhq/turn-tee.jpg",
};

function Kort({ o }: { o: PH13CoachOvelse }) {
  const innhold = <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={o.bilde ?? (o.akse ? BILDE[o.akse] : "/images/playerhq/slag-utslag.jpg")} alt="" />
    <span className="phn-bm-ov-t">
      <span className="phn-bm-ov-akse">{o.akse ? o.akse.toUpperCase() : "—"}</span>
      <b>{o.navn}</b>
      {o.info.length > 0 && <span className="phn-bm-ov-info">{o.info.map((i) => <span key={i}>{i}</span>)}</span>}
      <span className="phn-bm-ov-fra">{o.fra}{o.iPlanen ? " · ligger i planen" : ""}</span>
    </span>
  </>;
  const klasse = `phn-bm-ov ${o.akse ?? ""}`;
  return o.ovelseId ? <Link href={`/portal/drills/${o.ovelseId}`} className={klasse}>{innhold}</Link> : <div className={klasse}>{innhold}</div>;
}

export function PH13CoachOvelser({ data }: { data: PH13CoachOvelserData }) {
  const [filter, setFilter] = useState<CoachAkse | "alle">("alle");
  const antall = useMemo(() => Object.fromEntries(AKSER.map(({ a }) => [a, data.ovelser.filter((o) => o.akse === a).length])), [data.ovelser]);
  const synlige = filter === "alle" ? data.ovelser : data.ovelser.filter((o) => o.akse === filter);
  const iPlanen = data.ovelser.filter((o) => o.iPlanen).length;
  const fra = data.coachFornavn ?? "coachen";

  return <div className="phn">
    <div className="phn-bm-topp">
      <Link href="/portal/drills" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Øvelsesbank</Link>
      <div><div className="phn-dato">Øvelsesbank · fra coach</div><h1 className="phn-tittel">Øvelser fra {fra}</h1></div>
    </div>
    {data.ovelser.length === 0
      ? <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
          <b className="phn-bm-undertittel">Ingen øvelser fra coach ennå</b>
          <p className="phn-forklar">Når {fra} legger en øvelse i planen din, kommer den her. Du finner flere i Øvelsesbanken.</p>
          <div className="phn-knapper"><Link href="/portal/drills" className="phn-knapp pri">Til Øvelsesbanken</Link></div>
        </section>
      : <>
          <section className="phn-kort" aria-label="Øvelsene i tall">
            <div className="phn-hoved"><strong>{data.ovelser.length}</strong>
              <span className="phn-forklar">{data.ovelser.length === 1 ? "øvelse" : "øvelser"} fra {fra} · {iPlanen} ligger i planen</span></div>
          </section>
          <div className="phn-k-chips" role="group" aria-label="Akse">
            <button type="button" aria-pressed={filter === "alle"} onClick={() => setFilter("alle")}>Alle <b>{data.ovelser.length}</b></button>
            {AKSER.filter(({ a }) => antall[a] > 0).map(({ a, navn }) => <button key={a} type="button" aria-pressed={filter === a} onClick={() => setFilter(a)}>
              <i className={`phn-bm-prikk akse-${a}`} aria-hidden />{navn} <b>{antall[a]}</b>
            </button>)}
          </div>
          <div className="phn-bm-ov-liste">{synlige.map((o) => <Kort key={o.key} o={o} />)}</div>
          <Link href="/portal/drills" className="phn-knapp sek" style={{ justifySelf: "start" }}>Til Øvelsesbanken</Link>
        </>}
  </div>;
}
