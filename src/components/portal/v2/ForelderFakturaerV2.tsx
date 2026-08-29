"use client";

/**
 * Foreldreportal · Fakturaer — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-05 Fakturaer.dc.html
 * (+ FO-05L Fakturaer lys.dc.html — lys/mørk gjøres av tokens).
 * Bento «Betalt i år» / «Utestående», deretter måneds-grupperte hairline-
 * rader med beløp til høyre (13 mute tabular). Fasitens «Betal …»-CTA er
 * utelatt — det finnes ingen betalings-action for foresatte ennå (avvik
 * notert i PR-en).
 */

import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoRad,
  FoRadTall,
  FoTallKort,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type FakturaStatus =
  | "SUCCEEDED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface ForelderFakturaRad {
  id: string;
  beskrivelse: string;
  /** Barnets navn (fakturaen tilhører). Null hvis ukjent. */
  spillerNavn: string | null;
  belopOre: number;
  status: FakturaStatus;
  /** Ferdigformatert dato, nb-NO («04.08.2026»). */
  dato: string;
  /** Månedsgruppe-etikett («August 2026») — FO-05 grupperer per måned. */
  maaned: string;
  /** true når fakturaen er fra inneværende år (for «Betalt i år»). */
  iAar: boolean;
}

export interface ForelderFakturaerData {
  fakturaer: ForelderFakturaRad[];
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
}

const UBETALT: FakturaStatus[] = ["PENDING", "FAILED"];

/** «1 450,00» — norsk beløpsformat med to desimaler (FO-05). */
function belop(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Hele kroner med tynn mellomrom-gruppering («24 800») for bento-tallene. */
function belopHel(ore: number): string {
  return Math.round(ore / 100).toLocaleString("nb-NO", {
    maximumFractionDigits: 0,
  });
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

  const betaltIAarOre = fakturaer
    .filter((f) => f.status === "SUCCEEDED" && f.iAar)
    .reduce((s, f) => s + f.belopOre, 0);
  const utestaaendeOre = fakturaer
    .filter((f) => UBETALT.includes(f.status))
    .reduce((s, f) => s + f.belopOre, 0);

  /* Månedsgrupper i innsendt rekkefølge (nyest først fra loaderen). */
  const grupper: { maaned: string; rader: ForelderFakturaRad[] }[] = [];
  for (const f of fakturaer) {
    const siste = grupper[grupper.length - 1];
    if (siste && siste.maaned === f.maaned) siste.rader.push(f);
    else grupper.push({ maaned: f.maaned, rader: [f] });
  }

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Fakturaer"
        under="Alle koblede barn · siste 50"
      />

      {/* Bento: Betalt i år / Utestående (FO-05) */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <FoTallKort label="Betalt i år" value={belopHel(betaltIAarOre)} />
        <FoTallKort label="Utestående" value={belopHel(utestaaendeOre)} />
      </div>

      {fakturaer.length === 0 ? (
        <FoTom
          tittel="Ingen fakturaer ennå"
          sub="Betalinger for koblede barn dukker opp her."
        />
      ) : (
        grupper.map((g) => (
          <div key={g.maaned}>
            <div style={{ marginTop: 22 }}>
              <FoCaps>{g.maaned}</FoCaps>
            </div>
            {g.rader.map((f) => {
              const barnFornavn = f.spillerNavn
                ? (f.spillerNavn.split(" ")[0] ?? f.spillerNavn)
                : null;
              return (
                <FoRad
                  key={f.id}
                  title={
                    barnFornavn ? `${barnFornavn} · ${f.beskrivelse}` : f.beskrivelse
                  }
                  sub={statusTekst(f)}
                  right={<FoRadTall>{belop(f.belopOre)}</FoRadTall>}
                />
              );
            })}
          </div>
        ))
      )}

      <FoFotnote>
        Beløp i norske kroner. Kvittering sendes på e-post etter betaling.
      </FoFotnote>
    </FoSkjerm>
  );
}
