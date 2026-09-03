"use client";

/**
 * AgencyOS · Spiller 360 — «Oversikt»-fanen (bento-landing).
 *
 * Fasit: designsystem/train-lock/S3-03 Spiller profil bento.dc.html — bento
 * 344px / flex / 380px på Mac, stablet på mobil. D3 (Anders 03.09.2026):
 * bygg alt nå.
 *
 * Ikke bygget fra fasiten (bevisst forenklet, ikke fabrikert):
 * - Minikalenderen (måneds-rutenett med treningsdager markert) er utelatt —
 *   samme informasjon (dagens økter, ukeprosent) finnes allerede i «I dag»-
 *   og «Uke»-kortene, og en riktig kalender krever en egen datospørring per
 *   dag i måneden. Kan bygges som eget tillegg senere.
 * - «Ukeaktivitet»-ringen er en enkel prosentbue, ikke fasitens 24-tikks
 *   klokke-SVG — samme tall, enklere gjengivelse.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Caps, Kort, TomTilstand } from "@/components/v2";
import type { SpillerOversiktKort } from "@/lib/admin-spiller/spiller-oversikt-data";

const PYRAMIDE_LABEL: Record<string, string> = { TEK: "Teknisk", SLAG: "Slag", TURN: "Turnering", SPILL: "Spill" };

function Nokkeltall({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div style={{ background: TL.dock, borderRadius: TL.radius.card, padding: 16 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
        {verdi}
      </div>
      <Caps>{label}</Caps>
    </div>
  );
}

/** Enkel prosentbue — samme tall som S3-03s 24-tikks klokke, forenklet gjengivelse. */
function UkeProsentBue({ pst }: { pst: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const fremdrift = (pst / 100) * c;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={TL.hair} strokeWidth="8" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={TL.fill}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fremdrift} ${c}`}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" fontFamily={TL.font.sans} fontSize="28" fontWeight="700" fill={TL.text}>
          {pst}%
        </text>
        <text x="70" y="86" textAnchor="middle" fontFamily={TL.font.sans} fontSize="11" fill={TL.mute}>
          Ukeaktivitet
        </text>
      </svg>
    </div>
  );
}

export function SpillerOversiktV2({
  data,
  workbenchHref,
}: {
  data: SpillerOversiktKort;
  /** «Åpne uke i Workbench» — S3-03s eneste hvite primær-CTA. */
  workbenchHref: string;
}) {
  const { identitet, nokkeltall, uke, tekniskPlan, naa, sesong, iDag, nesteTurneringer } = data;

  return (
    <div data-od-id="spiller-oversikt" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{`
        .s3-bento { display: flex; flex-direction: column; gap: 14px; }
        @media (min-width: 1180px) {
          .s3-bento { display: grid; grid-template-columns: 344px 1fr 380px; align-items: start; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <Link
          href={workbenchHref}
          className="v2-press v2-focus"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 22px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontFamily: TL.font.sans,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Åpne uke i Workbench
        </Link>
      </div>

      <div className="s3-bento">
        {/* Kolonne 1 — identitet + nøkkeltall */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Kort>
            <Caps>Navn</Caps>
            <div style={{ marginTop: 4, fontFamily: TL.font.sans, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
              {identitet.navn}
            </div>
            {identitet.gruppeLabel && (
              <>
                <div style={{ marginTop: 14 }}><Caps>Gruppe</Caps></div>
                <div style={{ marginTop: 4, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>{identitet.gruppeLabel}</div>
              </>
            )}
            {identitet.hjemmeklubb && (
              <>
                <div style={{ marginTop: 14 }}><Caps>Hjemmeklubb</Caps></div>
                <div style={{ marginTop: 4, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>{identitet.hjemmeklubb}</div>
              </>
            )}
            {identitet.iStallenSiden && (
              <>
                <div style={{ marginTop: 14 }}><Caps>I stallen siden</Caps></div>
                <div style={{ marginTop: 4, fontFamily: TL.font.mono, fontSize: 14, fontWeight: 600, color: TL.text }}>{identitet.iStallenSiden}</div>
              </>
            )}
          </Kort>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {nokkeltall.hcp != null && <Nokkeltall label="Handicap" verdi={nokkeltall.hcp.toFixed(1).replace(".", ",")} />}
            {nokkeltall.sgSnitt != null && (
              <Nokkeltall label="SG · 12 uker" verdi={`${nokkeltall.sgSnitt > 0 ? "+" : ""}${nokkeltall.sgSnitt.toFixed(2).replace(".", ",")}`} />
            )}
            <Nokkeltall label={`Økter i ${sesong.aar}`} verdi={String(nokkeltall.okterIAar)} />
            <Nokkeltall label="Turneringer spilt" verdi={String(nokkeltall.turneringerSpilt)} />
          </div>
        </div>

        {/* Kolonne 2 — uke, teknisk plan, nå */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {uke ? (
            <Kort eyebrow={`Uke · ${uke.gjennomfort} av ${uke.total} økter`}>
              {uke.prosent != null && <UkeProsentBue pst={uke.prosent} />}
              {uke.pyramide.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column" }}>
                  {uke.pyramide.map((p) => (
                    <div key={p.kode} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: `1px solid ${TL.hair}` }}>
                      <span style={{ width: 60, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: TL.mute }}>
                        {PYRAMIDE_LABEL[p.kode] ?? p.kode}
                      </span>
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: TL.hair, overflow: "hidden" }}>
                        <div style={{ width: `${p.pst}%`, height: "100%", background: TL.text, borderRadius: 2 }} />
                      </div>
                      <span style={{ width: 44, textAlign: "right", fontFamily: TL.font.mono, fontSize: 13, fontWeight: 600, color: TL.text }}>{p.pst}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Kort>
          ) : (
            <Kort><TomTilstand icon="calendar" title="Ingen økter denne uken" sub="Legg inn uken i Workbench." /></Kort>
          )}

          {tekniskPlan && (
            <Kort eyebrow="Teknisk plan">
              <div style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{tekniskPlan.navn}</div>
              {tekniskPlan.aktivPosisjon && (
                <div style={{ marginTop: 3, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>Hovedfokus: {tekniskPlan.aktivPosisjon}</div>
              )}
              {tekniskPlan.oppgaverTotalt > 0 && (
                <>
                  <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: TL.hair, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.round((tekniskPlan.oppgaverGjort / tekniskPlan.oppgaverTotalt) * 100)}%`,
                        height: "100%",
                        background: TL.warm,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
                    {tekniskPlan.oppgaverGjort} av {tekniskPlan.oppgaverTotalt} oppgaver ferdig
                  </div>
                </>
              )}
            </Kort>
          )}

          {naa && (
            <Kort eyebrow="Nå">
              <div style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{naa.tittel}</div>
              <div style={{ marginTop: 3, fontFamily: TL.font.mono, fontSize: 13, color: TL.mute }}>
                {[naa.tidspunktLabel, naa.sted].filter(Boolean).join(" · ")}
              </div>
            </Kort>
          )}
        </div>

        {/* Kolonne 3 — sesong, i dag, turneringer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Kort eyebrow={`Sesong ${sesong.aar}`}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sesong.snittrunde != null && <Nokkeltall label="Snittrunde" verdi={sesong.snittrunde.toFixed(1)} />}
              <Nokkeltall label="Turneringer igjen" verdi={String(sesong.turneringerIgjen)} />
            </div>
          </Kort>

          <Kort eyebrow="I dag">
            {iDag.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {iDag.map((o, i) => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                    <span style={{ width: 46, fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text }}>{o.klokke}</span>
                    <div style={{ width: 1, alignSelf: "stretch", background: TL.hair }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{o.tittel}</div>
                      <div style={{ marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                        {[PYRAMIDE_LABEL[o.omrade] ?? o.omrade, o.sted].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TomTilstand icon="calendar" title="Ingen økter i dag" />
            )}
          </Kort>

          {nesteTurneringer.length > 0 && (
            <Kort eyebrow="Neste turneringer">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {nesteTurneringer.map((t, i) => (
                  <div key={`${t.navn}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                    <span style={{ width: 60, fontFamily: TL.font.mono, fontSize: 13, fontWeight: 600, color: TL.mute }}>{t.datoLabel}</span>
                    <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text, minWidth: 0 }}>{t.navn}</span>
                  </div>
                ))}
              </div>
            </Kort>
          )}
        </div>
      </div>
    </div>
  );
}
