"use client";

/**
 * Foreldreportal · Ukerapport (detalj) — v2 (retning C «Presis»). Lese-først
 * ukesoppsummering for ÉT barn: «Denne uka» (økter · trent · SG) + coachens
 * kommentar + ukens høydepunkt. Komponert kun av v2-komponenter fra
 * "@/components/v2" (ingen ad-hoc UI-primitiver, ingen rå hex — kun T.*-tokens).
 *
 * ALL data kommer fra hentForelderUkerapport (src/lib/forelder.ts) — avledet av
 * barnets EKTE Prisma-data. Ingen tall fabrikeres: mangler et felt vises ærlig
 * tom-tilstand. V2Shell (montert i (v2preview)/v2-forelder-ukerapport/page.tsx)
 * eier chrome-en; denne komponenten rendrer bare den indre innholds-stacken.
 *
 * Mobil-først: KPI-stripe stabler 3→3 (kompakte fliser) og holder seg på 375px.
 */

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
} from "@/components/v2";

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** «4,5» — komma-desimal for norsk visning. */
function komma(n: number): string {
  return n.toString().replace(".", ",");
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderUkerapportV2({ data }: { data: ForelderUkerapport }) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>{`Uke ${ukenummer} · ${childFirstName}`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="Ukerapport">Ukas</Tittel>
        </div>
      </div>

      {/* Denne uka — 3 kompakte KPI-fliser */}
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Økter" value={String(oktFullfort)} />
        <KpiFlis label="Trent" value={trentTekst} />
        <KpiFlis label="SG · uke" value={sgTekst} />
      </div>

      {/* Coachens kommentar */}
      <Kort eyebrow="Coachens kommentar">
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
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Coachen har ikke lagt igjen en kommentar denne uka.
          </p>
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
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Høydepunkter dukker opp når det er registrert tester.
          </p>
        )}
      </Kort>
    </div>
  );
}
