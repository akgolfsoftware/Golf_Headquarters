/**
 * PlayerHQ · Meg › Innstillinger › Kalender og integrasjoner (/portal/meg/innstillinger/integrasjoner) i Precision
 * Athletics. Erstatter InnstillingerIntegrasjonerV2. Data er uendret: bare TrackMan og Google-kalender har ekte
 * kobling i basen; de andre står som «Ikke tilkoblet» med «Be om tilgang» til support, som før.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (Meg-listene og «Kalender» i Innstillinger). Stil:
 * playerhq-ny-meg.css.
 *
 * Avvik:
 *   - Tegningen har Google-kalender som bryter i Innstillinger. Her er den en rad med status, fordi spilleren
 *     ikke har egen tilkoblingsflyt; «Administrer» går til support som før.
 *   - Ingen svartid loves (beslutninger.md §PRØVEUKE, Hjelp: ingen svartid lovet).
 */
import Link from "next/link";
import { CalendarDays, ChevronLeft, Radar } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-sghub.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH25IntegrasjonerData = {
  tm: { tilkoblet: boolean; sistSynket: string; sisteOkt: string | null };
  gcal: { tilkoblet: boolean; sistSynket: string; status: string | null };
};

type Kilde = { navn: string; kategori: string; tekst: string; detaljer?: [string, string][] };

const UTEN_KOBLING: Kilde[] = [
  { navn: "GolfBox", kategori: "Handicap og runder", tekst: "Handicap, registrerte runder og klubbmedlemskap fra norske golfklubber." },
  { navn: "Apple Health", kategori: "Søvn, puls og HRV", tekst: "Søvnkvalitet, hvilepuls og HRV fra iPhone og Apple Watch." },
  { navn: "Strava", kategori: "Kondisjon", tekst: "Løping, sykling og tur som fysiske økter." },
  { navn: "Garmin Connect", kategori: "Steg og belastning", tekst: "Daglige steg, hvilepuls og treningsbelastning fra Garmin-klokken." },
  { navn: "Spotify", kategori: "Spillelister", tekst: "Egne spillelister knyttet til økttyper." },
];

function Tilgang({ k, tilkoblet, ikon }: { k: Kilde; tilkoblet: boolean; ikon?: React.ReactNode }) {
  return <article className="tilgang">
    <div className="tilgang-topp">
      <span className="avatar lys" aria-hidden>{ikon ?? k.navn.slice(0, 1)}</span>
      <span><b>{k.navn}</b><span className="phn-kilde">{k.kategori}</span></span>
      <span className={`phn-pille ${tilkoblet ? "ok" : "noy"}`}><i />{tilkoblet ? "Tilkoblet" : "Ikke tilkoblet"}</span>
    </div>
    <p className="phn-forklar">{k.tekst}</p>
    {k.detaljer && <ul className="phn-sg-metrikk">{k.detaljer.map(([n, v]) => <li key={n}><span><b>{n}</b></span><span className="v" style={{ fontFamily: "var(--phn-sans)", fontWeight: 500 }}>{v}</span></li>)}</ul>}
    <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/meg/help/kontakt">{tilkoblet ? "Administrer" : "Be om tilgang"}</Link></div>
  </article>;
}

export function PH25Integrasjoner({ data }: { data: PH25IntegrasjonerData }) {
  const trackman: Kilde = data.tm.tilkoblet
    ? { navn: "TrackMan", kategori: "Slagdata fra studioøkter", tekst: "Køllefart, ballfart, launch og spin per slag fra studioøktene.", detaljer: [["Sist synket", data.tm.sistSynket], ["Siste økt", data.tm.sisteOkt ?? "—"]] }
    : { navn: "TrackMan", kategori: "Slagdata fra studioøkter", tekst: "Kobles av seg selv når du har en TrackMan-økt ved anlegget." };
  const kalender: Kilde = data.gcal.tilkoblet
    ? { navn: "Google-kalender", kategori: "Kalender", tekst: "Planlagte og gjennomførte økter legges i Google-kalenderen din.", detaljer: [["Sist synket", data.gcal.sistSynket], ["Status", data.gcal.status ?? "—"]] }
    : { navn: "Google-kalender", kategori: "Kalender", tekst: "Planlagte og gjennomførte økter legges i Google-kalenderen din." };
  const antall = Number(data.tm.tilkoblet) + Number(data.gcal.tilkoblet);
  const tilkoblet = [data.tm.tilkoblet && <Tilgang key="tm" k={trackman} tilkoblet ikon={<Radar size={18} />} />, data.gcal.tilkoblet && <Tilgang key="gc" k={kalender} tilkoblet ikon={<CalendarDays size={18} />} />].filter(Boolean);
  const ledige = [!data.tm.tilkoblet && <Tilgang key="tm" k={trackman} tilkoblet={false} ikon={<Radar size={18} />} />, !data.gcal.tilkoblet && <Tilgang key="gc" k={kalender} tilkoblet={false} ikon={<CalendarDays size={18} />} />, ...UTEN_KOBLING.map((k) => <Tilgang key={k.navn} k={k} tilkoblet={false} />)].filter(Boolean);

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · innstillinger</>}
      tittel={<>Kalender og integrasjoner</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <div className="phn-kort">
      <div className="phn-hoved"><strong>{antall}</strong><span className="phn-forklar">{antall === 1 ? "kilde er tilkoblet" : "kilder er tilkoblet"}</span></div>
      <p className="phn-kilde">Bare det som faktisk er koblet til, står som tilkoblet.</p>
    </div>
    <div className="to-del">
      <div>
        <section className="phn-seksjon" aria-labelledby="int-tilkoblet">
          <div className="phn-sek-topp"><h2 id="int-tilkoblet">Tilkoblet</h2></div>
          {tilkoblet.length ? tilkoblet : <div className="phn-kort dempet"><p className="phn-forklar">Ingen kilder er tilkoblet ennå.</p></div>}
        </section>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="int-ledige">
          <div className="phn-sek-topp"><h2 id="int-ledige">Ikke tilkoblet</h2></div>
          {ledige}
        </section>
        <div className="phn-kort dempet">
          <b className="phn-undertittel">Får du ikke koblet til?</b>
          <p className="phn-forklar">Skriv til oss, så hjelper vi deg.</p>
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/meg/help/kontakt">Skriv til oss</Link></div>
        </div>
      </div>
    </div>
  </div></SkraFlyt></div>;
}
