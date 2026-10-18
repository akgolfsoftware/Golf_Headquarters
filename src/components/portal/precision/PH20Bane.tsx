/**
 * PH-20 Gameplan, banekart for én bane (/portal/gameplan/[baneId]) i nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, malen «gameplan». Stil: playerhq-ny-iup.css og playerhq-ny-gameplan.css.
 * Ingen "use client": kartet (CourseMap, klientkomponent) kommer ferdig fra siden som `kart`.
 *
 * Avvik:
 *   - Bildet øverst er byttet med satellittkartet (CourseMap) fra banens egne data, som før.
 *   - Snittscoren på banen og banevalget er ikke med her: de ligger på /portal/gameplan (PH20Gameplan). Siden har bare én bane.
 *   - «Angrip» og «Spill trygt» per hull er ikke med: det finnes ingen slik vurdering for kartlagte baner. Hullkortet viser
 *     i stedet hvor mange av dine slag som er plottet på hullet.
 *   - Eksempeldata-banneret er ikke med: kart, par og lengder er banens egne data.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-20-BANE.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";
import "@/styles/playerhq-ny-gameplan.css";

export type PH20BaneHull = { nr: number; par: number | null; lengde: number | null; slag: number };

export type PH20BaneProps = {
  baneId: string;
  navn: string;
  parSum: number;
  hull: PH20BaneHull[];
  /** Ferdig kart (CourseMap) når banen har senterpunkt og hull. */
  kart?: ReactNode;
};

export function PH20Bane({ baneId, navn, parSum, hull, kart }: PH20BaneProps) {
  const harHull = hull.length > 0;
  return (
    <div className="phn phn-iup phn-gp" data-od-id="playerhq-gameplan-banekart">
      <div className="topp">
        <Link href="/portal/gameplan" className="tilbake"><ChevronLeft size={20} aria-hidden />Gameplan</Link>
        <div>
          <div className="phn-dato">Plan · gameplan · banekart</div>
          <h1 className="phn-tittel">{navn}</h1>
        </div>
      </div>

      <p className="phg-merknad">
        <MapPin className="phn-ikon" aria-hidden />
        <span>{harHull ? `${hull.length} hull kartlagt${parSum > 0 ? ` · par ${parSum}` : ""}. Kilde: banens kartdata i AK Golf HQ.` : "Banen er ikke kartlagt ennå."}</span>
      </p>

      {harHull && (kart
        ? <div className="phg-kart phg-kart-bane">{kart}</div>
        : <div className="phg-kart-tom"><MapPin className="phn-ikon" aria-hidden /><span>Banen har ikke kartposisjon ennå.</span></div>)}

      <section className="phn-seksjon" aria-label="Hull for hull">
        <div className="phn-sek-topp"><h2>Hull for hull</h2>{harHull && <span className="phn-kilde">Trykk for spredning og plan</span>}</div>
        {harHull ? (
          <div className="hull-grid">
            {hull.map((h) => (
              <Link key={h.nr} href={`/portal/gameplan/${baneId}/hull/${h.nr}`} className="hull" data-od-id={`banekart-hull-${h.nr}`}
                aria-label={`Hull ${h.nr}, ${h.par ? `par ${h.par}` : "par mangler"}${h.lengde ? `, ${h.lengde} meter` : ""}, ${h.slag > 0 ? `${h.slag} slag plottet` : "ingen slag plottet"}`}>
                <b>{h.nr}</b>
                <span>Par {h.par ?? "—"}{h.lengde ? ` · ${h.lengde} m` : ""}</span>
                <span className={`phg-slag${h.slag > 0 ? " har" : ""}`}>{h.slag > 0 ? `${h.slag} slag` : "Ingen slag"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <section className="phn-kort" aria-label="Ingen hull">
            <h2 style={{ margin: 0, font: "600 18px/1.25 var(--phn-sans)" }}>Ingen hull kartlagt ennå</h2>
            <p className="phn-forklar">Geometri legges inn av AK Golf HQ når banen er lagt til i systemet.</p>
          </section>
        )}
      </section>
    </div>
  );
}
