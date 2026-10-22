import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type TnInnsynData = {
  grupper: { id: string; navn: string }[];
  navn: string;
  klubb: string | null;
  fodselsaar: number | null;
  wagrPlass: number | null;
  /** Team Norway-trenere med aktiv navngitt deling (e-post). */
  trenere: string[];
};

const FANER = ["Oversikt", "Turneringsplan", "Ranking", "Turneringer", "Trening", "Tester", "Teknisk plan", "Fireukerssjekk"];

/**
 * «Se hva Team Norway ser» i PlayerHQ (beslutninger.md §TEAM NORWAY-TRENERFLATEN BYGGES I HQ, punkt 6 og 8).
 * Spilleren kan ikke åpne trenerflaten, så siden forteller hva trenerne ser: det åpne alltid, og resten bare
 * når spilleren deler med en navngitt trener. Bare for spillere i en Team Norway-gruppe.
 */
export function TnInnsynSpiller({ data }: { data: TnInnsynData }) {
  const apent: [string, string][] = [
    ["Navn", data.navn],
    ["Klubb", data.klubb ?? "—"],
    ["Fødselsår", data.fodselsaar ? String(data.fodselsaar) : "—"],
    ["WAGR-plass", data.wagrPlass != null ? new Intl.NumberFormat("nb-NO").format(data.wagrPlass) : "—"],
  ];
  const delt = data.trenere.length > 0;
  return (
    <div className="phn phn-meg phn-skra">
      <SkraTopp
        lav
        etikett="Team Norway"
        bilde="/images/playerhq/tek-video.jpg"
        bildePosisjon="50% 50%"
        overlinje={`Meg · deling · ${data.grupper.map((g) => g.navn).join(" og ")}`}
        tittel="Se hva Team Norway ser"
        handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/deling"><ChevronLeft size={18} aria-hidden />Del med trener</Link></span>}
      />
      <SkraFlyt lav>
        <div className="side">
          <div className="to-del">
            <div>
              <section className="phn-kort">
                <span style={{ display: "grid", gap: 2 }}><b>Alltid åpent for trenerne</b><span className="phn-kilde">Det samme som står offentlig, for eksempel på WAGR.</span></span>
                <dl style={{ margin: 0, display: "grid", gap: 8 }}>
                  {apent.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <dt className="phn-forklar">{k}</dt>
                      <dd style={{ margin: 0, fontWeight: 600, overflowWrap: "anywhere" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
            <div>
              <section className="phn-kort">
                <span style={{ display: "grid", gap: 2 }}><b>{delt ? "Du deler IUP-en din" : "Du deler ikke IUP-en din"}</b><span className="phn-kilde">{delt ? data.trenere.join(", ") : "Ingen Team Norway-trener ser mer enn det åpne."}</span></span>
                <p className="phn-forklar">{delt ? "Treneren ser hele IUP-en din og sender forslag. Ingenting endres før du godtar." : "Når du deler med en navngitt trener, ser treneren hele IUP-en din:"}</p>
                <ul style={{ margin: 0, paddingLeft: 20 }}>{FANER.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link className="phn-lenke" href="/portal/meg/deling">{delt ? "Endre eller trekk tilbake" : "Del med en Team Norway-trener"}</Link>
              </section>
            </div>
          </div>
        </div>
      </SkraFlyt>
    </div>
  );
}
