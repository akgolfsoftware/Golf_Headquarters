/**
 * PH-23 Anlegg: ett sted med fasilitetene — nytt design (pakke 11 og 12, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, mal «anlegg».
 * Ingen "use client": siden har ingen egen tilstand.
 *
 * Avvik:
 *   - Stedet kan ikke forhåndsvelges: tjenestene er ikke knyttet til et anlegg. «Book på dette anlegget»
 *     åpner /portal/booking/ny uten valgt sted.
 *   - Heltebildet er et nøytralt bilde fra /images/playerhq/ (anlegget har ikke eget bilde i basen).
 *     Fasilitetene har ikke bilder: radene viser navn, type og beskrivelse uten miniatyr.
 *   - Ingressen er anleggets adresse; basen har ingen beskrivelse av anlegget.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";

export type PH23AnleggData = {
  navn: string;
  adresse: string | null;
  fasiliteter: { id: string; navn: string; typeLabel: string; inne: boolean; beskrivelse: string | null }[];
};

export function PH23Anlegg({ data }: { data: PH23AnleggData }) {
  const antall = data.fasiliteter.length;
  return <div className="phn">
    <div className="phn-bm-topp">
      <Link href="/portal/booking/ny" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Book time</Link>
      <div><div className="phn-dato">Anlegg</div><h1 className="phn-tittel">{data.navn}</h1></div>
    </div>
    <div className="phn-bm-to-kol">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="phn-bm-helt" src="/images/playerhq/slag-utslag.jpg" alt="" />
        <p className="phn-k-ingress">{data.adresse?.trim() || "—"}</p>
      </div>
      <section className="phn-seksjon">
        <div className="phn-sek-topp"><h2>Fasiliteter</h2><span className="phn-kilde">{antall} registrert</span></div>
        {antall > 0
          ? <div className="phn-bm-fasiliteter">
              {data.fasiliteter.map((f) => <div key={f.id} className="phn-bm-fasilitet">
                <span><b>{f.navn}</b><span className="phn-kilde">{f.typeLabel}{f.beskrivelse ? ` · ${f.beskrivelse}` : ""}</span></span>
                <span className="phn-pille noy">{f.inne ? "Inne" : "Ute"}</span>
              </div>)}
            </div>
          : <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
              <b className="phn-bm-undertittel">Ingen fasiliteter ennå</b>
              <p className="phn-forklar">Ingen fasiliteter er registrert på dette anlegget ennå.</p>
            </div>}
        <div className="phn-bm-knapper"><Link href="/portal/booking/ny" className="phn-knapp pri phn-k-stor">{antall > 0 ? "Book på dette anlegget" : "Til Book time"}</Link></div>
      </section>
    </div>
  </div>;
}
