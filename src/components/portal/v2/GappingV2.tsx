/**
 * Gapping-kart (D5).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-gapping.html
 *
 * Båndet er midtre halvdel av slagene (25.–75. persentil), streken er
 * medianen, og nevneren står på hver kølle. Kartet måler — det anbefaler
 * aldri kjøp. Køller under måleterskelen vises dempet med «under 20» i stedet
 * for å bli skjult.
 *
 * Ingen clay her: dette er en måling å lese, ikke en handling å utføre.
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { TL } from "@/lib/v2/train-lock";

import { TomTilstand } from "@/components/v2";
import { PaperPage, PaperTopp, PaperKropp } from "@/components/portal/v2/SideChrome";
import { GAP_TERSKEL_M, MIN_SLAG } from "@/lib/domain/gapping";
import type { GappingData } from "@/lib/portal/gapping-data";

/** Fast skala så kartet ikke hopper mellom besøk. Utvides om noen slår lenger. */
const SKALA_MIN = 60;
const SKALA_MAKS = 240;

function Kort({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: "block",
            fontFamily: TL.font.mono,
            fontSize: TL.storrelse.capsSm,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: TL.mute,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </span>
      )}
      {children}
    </section>
  );
}

function Brodtekst({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: TL.font.sans,
        fontSize: TL.storrelse.kropp,
        color: TL.text,
        lineHeight: 1.55,
      }}
    >
      {children}
    </p>
  );
}

export function GappingV2({ data }: { data: GappingData }) {
  const maks = Math.max(SKALA_MAKS, ...data.koller.map((k) => k.p75));
  const min = Math.min(SKALA_MIN, ...data.koller.map((k) => k.p25));
  const pst = (v: number) =>
    Math.max(0, Math.min(100, ((v - min) / (maks - min)) * 100));

  const aksepunkter = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    Math.round(min + (maks - min) * f),
  );

  return (
    <PaperPage odId="gapping">
      <PaperTopp
        tittel="Gapping"
        sub={`carry per kølle · siste ${data.vinduDager} dager · ${data.totaltSlag} slag`}
        tilbakeHref="/portal/mal/trackman"
      />
      <PaperKropp>
        {data.forFaaSlag ? (
          <>
            <TomTilstand
              icon="bar-chart"
              title="For få slag til å tegne kartet"
              sub={`Gapping trenger minst ${MIN_SLAG} slag per kølle fra TrackMan-økter siste ${data.vinduDager} dager. Du har ${data.totaltSlag} ${data.totaltSlag === 1 ? "slag" : "slag"} fordelt på ${data.koller.length} ${data.koller.length === 1 ? "kølle" : "køller"} — kartet tegnes etter hvert som du logger økter, og det gjetter aldri i mellomtiden.`}
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link
                href="/portal/mal/trackman"
                style={{
                  display: "inline-flex",
                  padding: "10px 18px",
                  borderRadius: TL.radius.field,
                  border: `1px solid ${TL.hair}`,
                  background: TL.elev,
                  color: TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: TL.storrelse.kropp,
                  textDecoration: "none",
                }}
              >
                Se TrackMan-øktene dine
              </Link>
            </div>
          </>
        ) : (
          <>
            <Kort eyebrow="Slik leses kartet">
              <Brodtekst>
                Båndet er midtre halvdel av slagene dine (25.–75. persentil), streken er
                medianen. Et gap flagges når avstanden mellom to nabokøller er over{" "}
                {GAP_TERSKEL_M} m og begge har minst {MIN_SLAG} slag — driveren står utenfor
                flaggingen, den slås fra tee, ikke til innspill. Kartet måler — det anbefaler
                aldri kjøp.
              </Brodtekst>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 12,
                  fontFamily: TL.font.mono,
                  fontSize: TL.storrelse.capsSm,
                  color: TL.mute,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 8,
                    borderRadius: 4,
                    background: TL.dim,
                    border: `1px solid ${TL.hair}`,
                  }}
                />
                <span>midtre halvdel</span>
                <span style={{ width: 2, height: 12, background: TL.text, marginLeft: 6 }} />
                <span>median</span>
                <span style={{ color: TL.danger, marginLeft: 6 }}>gap over terskel</span>
              </div>
            </Kort>

            <Kort>
              <div
                aria-hidden
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: TL.font.mono,
                  fontSize: TL.storrelse.capsSm,
                  color: TL.mute,
                  marginBottom: 8,
                  paddingLeft: 76,
                }}
              >
                {aksepunkter.map((a, i) => (
                  <span key={i}>{i === 0 || i === 4 ? `${a} m` : a}</span>
                ))}
              </div>

              {data.koller.map((k, i) => {
                /* Gap-markøren står MELLOM de to køllene den gjelder — fasitens
                   egen plassering. Et kort nederst hadde vist samme tall, men
                   ikke hvor i settet hullet ligger. */
                const neste = data.koller[i + 1];
                const gapEtter = neste
                  ? data.gap.find((g) => g.over === k.klubb && g.under === neste.klubb)
                  : undefined;

                return (
                  <div key={k.klubb}>
                    <div
                      aria-label={`${k.klubb}: median ${k.median} meter av ${k.slag} slag${k.tynn ? ` — under måleterskelen på ${MIN_SLAG} slag` : ""}`}
                      style={{
                        display: "grid",
                        // Fasitens proporsjoner (64px / 1fr / 44px). Tallkolonnen
                        // må være smal — ellers blir selve kartet ulesbart på 390px.
                        gridTemplateColumns: "64px minmax(0,1fr) 44px",
                        gap: 12,
                        alignItems: "center",
                        minHeight: 34,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TL.font.mono,
                          fontSize: 11,
                          color: k.tynn ? TL.mute : TL.text,
                        }}
                      >
                        {k.klubb}
                      </span>

                      <div
                        style={{
                          position: "relative",
                          minWidth: 0,
                          height: 14,
                          background: TL.dock,
                          borderRadius: TL.radius.pill,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 3,
                            bottom: 3,
                            left: `${pst(k.p25)}%`,
                            width: `${Math.max(2, pst(k.p75) - pst(k.p25))}%`,
                            borderRadius: TL.radius.pill,
                            background: k.tynn
                              ? "transparent"
                              : `color-mix(in srgb, ${TL.viz.target} 45%, ${TL.dock})`,
                            border: k.tynn ? `1px dashed ${TL.hair}` : undefined,
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `calc(${pst(k.median)}% - 1.5px)`,
                            width: 3,
                            borderRadius: 2,
                            background: k.tynn ? TL.mute : TL.viz.target,
                          }}
                        />
                      </div>

                      <span
                        style={{
                          textAlign: "right",
                          fontFamily: TL.font.mono,
                          fontSize: 11,
                          fontWeight: 600,
                          color: k.tynn ? TL.mute : TL.text,
                        }}
                      >
                        {k.median} m
                        <span
                          style={{
                            display: "block",
                            fontSize: 8.5,
                            fontWeight: 400,
                            color: TL.mute,
                          }}
                        >
                          {k.slag} slag{k.tynn ? ` · under ${MIN_SLAG}` : ""}
                        </span>
                      </span>
                    </div>

                    {gapEtter && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          margin: "2px 0 2px 76px",
                          padding: "4px 12px",
                          border: `1px dashed ${TL.danger}`,
                          borderRadius: TL.radius.row,
                          fontFamily: TL.font.mono,
                          fontSize: 10,
                          color: TL.danger,
                        }}
                      >
                        gap {gapEtter.meter} m · {gapEtter.under} → {gapEtter.over} · over
                        terskelen på {GAP_TERSKEL_M} m
                      </div>
                    )}
                  </div>
                );
              })}

              <p
                style={{
                  margin: "12px 0 0",
                  fontFamily: TL.font.sans,
                  fontSize: TL.storrelse.meta,
                  color: TL.mute,
                  lineHeight: 1.5,
                }}
              >
                Kilde: TrackMan-øktene dine ({data.okter}{" "}
                {data.okter === 1 ? "økt" : "økter"} siste {data.vinduDager} dager). Nevneren
                står på hver kølle. Køller under {MIN_SLAG} slag måles, men flagges ikke.
              </p>
            </Kort>

            {data.gap.length > 0 ? (
              <Kort
                eyebrow={
                  data.gap.length === 1 ? "Ett flagget gap" : `${data.gap.length} flaggede gap`
                }
              >
                {data.gap.map((g) => (
                  <div key={`${g.over}-${g.under}`} style={{ marginBottom: 10 }}>
                    <Brodtekst>
                      Mellom{" "}
                      <strong style={{ fontWeight: 600 }}>{g.under}</strong> og{" "}
                      <strong style={{ fontWeight: 600 }}>{g.over}</strong> er det{" "}
                      <span style={{ fontFamily: TL.font.mono, color: TL.danger }}>{g.meter} m</span> —
                      over terskelen. Det betyr at innspill rundt {g.hullMidt} m mangler en
                      kølle å lande på.
                    </Brodtekst>
                  </div>
                ))}
                <p
                  style={{
                    margin: "4px 0 0",
                    fontFamily: TL.font.sans,
                    fontSize: TL.storrelse.meta,
                    color: TL.mute,
                    lineHeight: 1.5,
                  }}
                >
                  Dette er et målt hull, ikke et kjøpsråd: snakk med coachen om det skal løses
                  med sving, kølle eller gameplan.
                </p>
                <Link
                  href="/portal/coach"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 12,
                    padding: "11px 18px",
                    borderRadius: TL.radius.field,
                    background: TL.text,
                    color: TL.scene,
                    fontFamily: TL.font.sans,
                    fontSize: TL.storrelse.kropp,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Ta det med coachen
                </Link>
              </Kort>
            ) : (
              <Kort eyebrow="Ingen flaggede gap">
                <Brodtekst>
                  Ingen nabokøller ligger mer enn {GAP_TERSKEL_M} m fra hverandre blant dem som
                  har nok slag. Settet dekker avstandene sine.
                </Brodtekst>
              </Kort>
            )}
          </>
        )}
      </PaperKropp>
    </PaperPage>
  );
}
