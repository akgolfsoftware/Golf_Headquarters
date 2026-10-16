/**
 * PH-20 Gameplan, ett hull (/portal/gameplan/[baneId]/hull/[nr]) i nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, malen «hull». Stil: playerhq-ny-iup.css og playerhq-ny-gameplan.css.
 * Ingen "use client": kartet (CourseMap) og planleggeren (GameplanPlanlegger) kommer ferdige fra siden.
 *
 * Segmentene Utslag · Innspill · Putt · Planlegg (?type=), satellittkartet med dine landingspunkter,
 * spredningen fra dispersion-motoren og den interaktive planleggeren er beholdt.
 *
 * Avvik:
 *   - Det tegnede hullkartet er byttet med satellittkartet (CourseMap) med ekte tee, green og dine landingspunkter.
 *   - «Ditt snitt på hullet» er ikke med: snitt per hull regnes ikke ut i dag. Det store tallet er spredningen til siden.
 *   - Slagvalget (kølle per slag med carry) er ikke med: det finnes ikke i dataene. Det som finnes, er spredning,
 *     skjevhet og antall slag per segment, og planleggeren i «Planlegg» (sikte og soner på kartet).
 *   - «Endre slagvalg» er byttet med segmentet «Planlegg». «Alle hull» er tilbakelenken øverst og knappen nederst.
 *   - Forklaringen av σ og skjevhet står som tekst under tallene, ikke bak et «?».
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-20-HULL.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Crosshair, MapPin } from "lucide-react";
import type { DispersionStats } from "@/lib/gameplan/dispersion";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";
import "@/styles/playerhq-ny-gameplan.css";

export const PH20_SEGMENTER = [
  { key: "utslag", label: "Utslag" },
  { key: "innspill", label: "Innspill" },
  { key: "putt", label: "Putt" },
  { key: "planlegg", label: "Planlegg" },
] as const;

export type PH20HullProps = {
  baneId: string;
  baneNavn: string;
  nr: number;
  par: number | null;
  lengde: number | null;
  segment: (typeof PH20_SEGMENTER)[number]["key"];
  stats: DispersionStats | null;
  /** Satellittkart for spredningssegmentene. Mangler når hullet ikke har kartposisjon. */
  kart?: ReactNode;
  /** Planleggeren når hullet har tee og green. Mangler den i «Planlegg», vises en forklaring. */
  planlegger?: ReactNode;
  /** Neste hull på banen, om det finnes. */
  nesteNr?: number | null;
};

const fmt = (n: number) => formaterTall(n, 1, true);
const fortegn = (n: number) => formaterFortegn(n, 1);

export function PH20Hull({ baneId, baneNavn, nr, par, lengde, segment, stats, kart, planlegger, nesteNr }: PH20HullProps) {
  const erPlanlegg = segment === "planlegg";
  const segNavn = PH20_SEGMENTER.find((s) => s.key === segment)?.label ?? "Utslag";
  const tittel = `Hull ${nr} · par ${par ?? "—"}${lengde ? ` · ${lengde} m` : ""}`;

  const segmenter = (
    <nav className="phn-valg phg-segment" aria-label="Visning">
      {PH20_SEGMENTER.map((s) => (
        <Link key={s.key} href={`/portal/gameplan/${baneId}/hull/${nr}?type=${s.key}`} aria-current={s.key === segment ? "page" : undefined}>{s.label}</Link>
      ))}
    </nav>
  );

  const knapper = (
    <div className="phn-knapper">
      <Link href={`/portal/gameplan/${baneId}`} className="phn-knapp pri">Alle hull</Link>
      {nesteNr != null && <Link href={`/portal/gameplan/${baneId}/hull/${nesteNr}${erPlanlegg ? "?type=planlegg" : ""}`} className="phn-knapp sek">Hull {nesteNr}</Link>}
    </div>
  );

  return (
    <div className="phn phn-iup phn-gp" data-od-id="playerhq-gameplan-hull">
      <div className="topp">
        <Link href={`/portal/gameplan/${baneId}`} className="tilbake"><ChevronLeft size={20} aria-hidden />Banekart</Link>
        <div>
          <div className="phn-dato">{baneNavn} · gameplan</div>
          <h1 className="phn-tittel">{tittel}</h1>
        </div>
      </div>

      {segmenter}

      {erPlanlegg ? (
        <div className="phg-planlegg">
          {planlegger ?? (
            <div className="phg-kart-tom"><Crosshair className="phn-ikon" aria-hidden /><b>Mangler tee og green</b>
              <span>Dette hullet har ikke nok kartlagt geometri til planlegging ennå.</span></div>
          )}
          {knapper}
        </div>
      ) : (
        <div className="to-del">
          <div>
            {kart
              ? <div className="phg-kart phg-kart-hull">{kart}</div>
              : <div className="phg-kart-tom"><MapPin className="phn-ikon" aria-hidden /><span>Hullet har ikke kartposisjon ennå.</span></div>}
            <p className="phn-kilde" style={{ textAlign: "center" }}>Satellittkart. Prikkene er dine landingspunkter ({segNavn.toLowerCase()}).</p>
          </div>
          <div>
            {stats ? (
              <>
                <section className="phn-kort" aria-label="Spredning">
                  <div className="phn-sek-topp"><h2>Spredning · {segNavn.toLowerCase()}</h2><span className="phn-pille noy">{stats.n} slag</span></div>
                  <div className="phn-hoved"><strong>±{fmt(stats.std.lateral)}<small>m</small></strong><span className="phn-forklar">til siden, ett standardavvik (σ)</span></div>
                  <div className="phg-tall">
                    <div><b>±{fmt(stats.std.distance)}<small>m</small></b><span>σ i lengde</span></div>
                    <div><b>{fortegn(stats.bias.lateral)}<small>m</small></b><span>Skjevhet til siden{stats.bias.side !== "rett" ? `, ${stats.bias.side}` : ""}</span></div>
                    <div><b>{fortegn(stats.bias.distance)}<small>m</small></b><span>Skjevhet i lengde{stats.bias.length !== "presis" ? `, ${stats.bias.length}` : ""}</span></div>
                    <div><b>{stats.n}</b><span>Slag plottet</span></div>
                  </div>
                  <p className="phn-kilde">σ: hvor mye slagene sprer seg rundt snittet. Skjevhet: hvor snittet ligger i forhold til siktelinja. Kilde: dine slag med GPS på dette hullet.</p>
                </section>
                {stats.bias.side !== "rett" && (
                  <div className="phg-innsikt">
                    <b>Sikt mot {stats.bias.side === "høyre" ? "venstre" : "høyre"} halvdel</b>
                    <span>Du misser {fmt(Math.abs(stats.bias.lateral))} m til {stats.bias.side} i snitt på dette hullet.</span>
                  </div>
                )}
              </>
            ) : (
              <section className="phn-kort" aria-label="Ingen slag">
                <h2 style={{ margin: 0, font: "600 18px/1.25 var(--phn-sans)" }}>Ingen {segNavn.toLowerCase()} plottet ennå</h2>
                <p className="phn-forklar">Plott slag på dette hullet for å se spredningen din.</p>
              </section>
            )}
            {knapper}
          </div>
        </div>
      )}
    </div>
  );
}
