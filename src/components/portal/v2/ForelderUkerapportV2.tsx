"use client";

/**
 * Foreldreportal · Ukerapport (detalj) — v2 Presis + B-pakke.
 * Status først, én grønn CTA, TomTilstand med neste steg. Kun v2 + T.*.
 */

import { useRouter } from "next/navigation";
import type { ForelderUkerapport } from "@/lib/forelder";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  Rad,
  Icon,
  TomTilstand,
  Knapp,
  StatusPill,
  HjelpTips,
} from "@/components/v2";

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** «4,5» — komma-desimal for norsk visning. */
function komma(n: number): string {
  return n.toString().replace(".", ",");
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderUkerapportV2({ data }: { data: ForelderUkerapport }) {
  const router = useRouter();
  const {
    childFirstName,
    ukenummer,
    oktFullfort,
    trentTimer,
    ukeSg,
    coachNote,
    hoydepunkt,
  } = data;

  const sgTekst = ukeSg != null ? fmtSg(ukeSg) : "–";
  const trentTekst = trentTimer > 0 ? `${komma(trentTimer)} t` : "–";
  const harAktivitet = oktFullfort > 0 || ukeSg != null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>{`Uke ${ukenummer} · ${childFirstName}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="uke">Denne</Tittel>
          </div>
        </div>
        <StatusPill tone={harAktivitet ? "up" : "info"}>
          {harAktivitet ? "Aktiv uke" : "Rolig uke"}
        </StatusPill>
      </div>

      {/* Status først — 3 KPI */}
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Økter" value={String(oktFullfort)} />
        <KpiFlis label="Trent" value={trentTekst} />
        <KpiFlis
          label={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Form
              <HjelpTips k="sgTotal" size={10} />
            </span>
          }
          value={sgTekst}
        />
      </div>

      {/* Én primær CTA (B) */}
      <div>
        <Knapp icon="arrow-right" onClick={() => router.push("/forelder")}>
          Til oversikten
        </Knapp>
      </div>

      {/* Coachens kommentar */}
      <Kort eyebrow="Fra coachen">
        {coachNote ? (
          <div>
            <p
              style={{
                fontFamily: T.ui,
                fontSize: 13.5,
                color: T.fg,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {coachNote.body}
            </p>
            <div style={{ marginTop: 12 }}>
              <Caps size={9}>{`— ${coachNote.author}`}</Caps>
            </div>
          </div>
        ) : (
          <TomTilstand
            icon="message-circle"
            title="Ingen kommentar denne uka"
            sub="Når coachen skriver noe, dukker det opp her."
          />
        )}
      </Kort>

      {/* Ukens høydepunkt */}
      <Kort eyebrow="Ukens høydepunkt">
        {hoydepunkt ? (
          <Rad
            leading={
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: T.panel3,
                  border: `1px solid ${T.border}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Icon name="trophy" size={16} style={{ color: T.lime }} />
              </span>
            }
            title={hoydepunkt.testNavn}
            sub="Beste testresultat"
            trailing={
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: T.fg,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {komma(hoydepunkt.score)}
              </span>
            }
            last
          />
        ) : (
          <TomTilstand
            icon="trophy"
            title="Ingen test denne uka"
            sub="Beste tester dukker opp her når de er logget."
          />
        )}
      </Kort>
    </div>
  );
}
