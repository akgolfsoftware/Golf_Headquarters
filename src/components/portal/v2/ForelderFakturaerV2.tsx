"use client";

/** Foreldreportal · Fakturaer. Beløp og status er beholdt. Ingen betalingsknapp er lagt til.
 * Historisk sitering: designsystem/train-lock/FO-05 Fakturaer.dc.html og FO-05L Fakturaer lys.dc.html.
 */

import { FoSkjerm, FoHode, FoCaps, FoRad, FoRadTall, FoTallKort, FoFotnote, FoTom } from "@/components/forelder/fo-presisjon";

export type FakturaStatus = "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface ForelderFakturaRad {
  id: string;
  beskrivelse: string;
  spillerNavn: string | null;
  belopOre: number;
  status: FakturaStatus;
  dato: string;
  maaned: string;
  iAar: boolean;
}

export interface ForelderFakturaerData {
  fakturaer: ForelderFakturaRad[];
  parentName?: string;
}

const UBETALT: FakturaStatus[] = ["PENDING", "FAILED"];

function belop(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function belopHel(ore: number): string {
  return Math.round(ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 });
}
function statusTekst(f: ForelderFakturaRad): string {
  if (f.status === "SUCCEEDED") return `Betalt ${f.dato}`;
  if (f.status === "PENDING") return `Forfaller · ubetalt · ${f.dato}`;
  if (f.status === "FAILED") return `Betaling feilet · ${f.dato}`;
  if (f.status === "REFUNDED") return `Refundert ${f.dato}`;
  return `Delvis refundert ${f.dato}`;
}

export function ForelderFakturaerV2({ data }: { data: ForelderFakturaerData }) {
  const { fakturaer, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";
  const betaltIAarOre = fakturaer.filter((f) => f.status === "SUCCEEDED" && f.iAar).reduce((s, f) => s + f.belopOre, 0);
  const utestaaendeOre = fakturaer.filter((f) => UBETALT.includes(f.status)).reduce((s, f) => s + f.belopOre, 0);
  const grupper: { maaned: string; rader: ForelderFakturaRad[] }[] = [];
  for (const f of fakturaer) {
    const siste = grupper[grupper.length - 1];
    if (siste && siste.maaned === f.maaned) siste.rader.push(f);
    else grupper.push({ maaned: f.maaned, rader: [f] });
  }

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Fakturaer" under="Alle koblede barn · siste 50" />
      <div className="fo-to">
        <FoTallKort label="Betalt i år" value={belopHel(betaltIAarOre)} />
        <FoTallKort label="Utestående" value={belopHel(utestaaendeOre)} />
      </div>
      {fakturaer.length === 0 ? (
        <FoTom tittel="Ingen fakturaer ennå" sub="Betalinger for koblede barn dukker opp her." />
      ) : (
        grupper.map((g) => (
          <div key={g.maaned}>
            <FoCaps>{g.maaned}</FoCaps>
            {g.rader.map((f) => {
              const barnFornavn = f.spillerNavn ? (f.spillerNavn.split(" ")[0] ?? f.spillerNavn) : null;
              return (
                <FoRad
                  key={f.id}
                  title={barnFornavn ? `${barnFornavn} · ${f.beskrivelse}` : f.beskrivelse}
                  sub={statusTekst(f)}
                  right={<FoRadTall>{belop(f.belopOre)}</FoRadTall>}
                />
              );
            })}
          </div>
        ))
      )}
      <FoFotnote>Beløp i norske kroner. Kvittering sendes på e-post etter betaling.</FoFotnote>
    </FoSkjerm>
  );
}
