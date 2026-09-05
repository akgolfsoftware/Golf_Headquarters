"use client";

/**
 * AgencyOS · Spiller 360 — arbeidsvisningen (Ø13, MASTERPLAN STEG 1B).
 *
 * Fasit: `S3-01 Agency Spiller 360 Mac.dc.html` (+ S3-01L lys) · `S3-02
 * Agency Spiller 360 iPad.dc.html` · `AG-08 Spiller-ark.dc.html`. Master-
 * detalj: smal spillerliste (rail) til venstre + ett 360-panel til høyre —
 * fast arbeidsvindu uten scroll-stabling av paneler, til forskjell fra
 * Oversikt-bentoen (S3-03, Ø12).
 *
 * Rail-en her er IKKE app-skallets navigasjonsrail (den kommer fra
 * `V2Shell`/AX-01, se CLAUDE.md §Låste beslutninger A1) — det er fasitens
 * 280/250px SPILLERLISTE inni innholdsflaten, samme rolle som Stall-listen
 * i AG-08.
 *
 * Mobil (< 900px): rail-en er hele skjermen (samme liste som fasitens
 * AG-08-stall), og 360-panelet åpnes som et ark ved trykk på en spiller —
 * en forenkling av AG-08s "440ms slide-over" (ingen animasjon bygget her),
 * ikke pikselporten av selve arket.
 */

import Link from "next/link";
import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Kort, AvatarFoto, TomTilstand } from "@/components/v2";
import type { ArbeidsvisningData } from "@/lib/admin-spiller/spiller-arbeidsvisning-data";

const PYRAMIDE_LABEL: Record<string, string> = { TEK: "Teknisk", SLAG: "Slag", TURN: "Turnering", SPILL: "Spill" };

function RailRad({
  navn,
  avatarUrl,
  hcpLabel,
  subLabel,
  aktiv,
  href,
  onClick,
}: {
  navn: string;
  avatarUrl: string | null;
  hcpLabel: string;
  subLabel: string;
  aktiv: boolean;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 8px",
        borderRadius: TL.radius.card,
        background: aktiv ? TL.dock : "transparent",
        textDecoration: "none",
        minWidth: 0,
      }}
    >
      <AvatarFoto src={avatarUrl} navn={navn} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {navn}
        </div>
        <div style={{ marginTop: 1, fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          HCP {hcpLabel} · {subLabel}
        </div>
      </div>
    </Link>
  );
}

function SgBarer({ omrader }: { omrader: ArbeidsvisningData["sgOmrader"] }) {
  const verdier = omrader.map((o) => o.siste).filter((v): v is number => v != null);
  const maks = Math.max(0.1, ...verdier.map((v) => Math.abs(v)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {omrader.map((o) => {
        const h = o.siste != null ? Math.max(4, Math.round((Math.abs(o.siste) / maks) * 48)) : 0;
        const pos = o.siste != null && o.siste >= 0;
        return (
          <div key={o.kode} style={{ textAlign: "center" }}>
            <div style={{ height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {o.siste != null && (
                <div style={{ width: 22, height: h, borderRadius: "4px 4px 0 0", background: pos ? TL.text : TL.mute, opacity: pos ? 1 : 0.45 }} />
              )}
            </div>
            <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
              {o.label}
            </div>
            <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 600, color: TL.text, opacity: o.siste != null ? (pos ? 1 : 0.45) : 0.4 }}>
              {o.siste != null ? `${o.siste > 0 ? "+" : ""}${o.siste.toFixed(2).replace(".", ",")}` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Detaljpanel({ data, workbenchHref }: { data: ArbeidsvisningData; workbenchHref: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <AvatarFoto src={data.avatarUrl} navn={data.navn} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, color: TL.text }}>{data.navn}</div>
          <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 13, color: TL.mute }}>
            HCP {data.hcpLabel}
            {data.gruppeLabel ? ` · ${data.gruppeLabel}` : ""}
          </div>
        </div>
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
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Åpne uke i Workbench
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Kort eyebrow="I dag">
          {data.iDag.length > 0 ? (
            <>
              <div style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, color: TL.text }}>{data.iDag[0].tittel}</div>
              <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 13, color: TL.mute }}>
                {[data.iDag[0].klokke, PYRAMIDE_LABEL[data.iDag[0].omrade] ?? data.iDag[0].omrade, data.iDag[0].sted].filter(Boolean).join(" · ")}
              </div>
            </>
          ) : (
            <TomTilstand icon="calendar" title="Ingen økt i dag" />
          )}
        </Kort>
        <Kort eyebrow={data.sgSnittLabel ? `SG · 12 uker · ${data.sgSnittLabel}` : "SG · 12 uker"}>
          <SgBarer omrader={data.sgOmrader} />
        </Kort>
      </div>

      {data.ukePst != null && (
        <Kort eyebrow="Denne uken">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: TL.hair, overflow: "hidden" }}>
              <div style={{ width: `${data.ukePst}%`, height: "100%", background: TL.text, borderRadius: 3 }} />
            </div>
            <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 600, color: TL.text }}>{data.ukePst}% gjennomført</span>
          </div>
        </Kort>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Kort eyebrow="Tester">
          {data.tester.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.tester.map((t, i) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{t.navn}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{t.datoLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <TomTilstand icon="clipboard-check" title="Ingen tester ennå" />
          )}
        </Kort>
        <Kort eyebrow="Video · sving">
          {data.videoer.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.videoer.map((v, i) => (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{v.datoLabel}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{v.statusLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <TomTilstand icon="video" title="Ingen video ennå" />
          )}
        </Kort>
      </div>

      <Kort eyebrow={data.notat ? `Notat · ${data.notat.datoLabel}` : "Notat"}>
        {data.notat ? (
          <>
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, lineHeight: 1.5, color: TL.text }}>{data.notat.tekst}</p>
            <div style={{ marginTop: 8, fontFamily: TL.font.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>
              {data.notat.coachNavn}
            </div>
          </>
        ) : (
          <TomTilstand icon="pencil" title="Ingen notater ennå" />
        )}
      </Kort>
    </div>
  );
}

export function SpillerArbeidsvisningV2({ data, workbenchHref, basePath }: { data: ArbeidsvisningData; workbenchHref: string; basePath: string }) {
  const [mobilVisDetalj, setMobilVisDetalj] = useState(false);

  return (
    <div data-od-id="spiller-arbeidsvisning" data-mobil-vis={mobilVisDetalj ? "detalj" : "rail"} style={{ minWidth: 0 }}>
      <style>{`
        .s3-01-split { display: flex; flex-direction: column; gap: 14px; }
        [data-mobil-vis="rail"] .s3-01-detalj { display: none; }
        [data-mobil-vis="detalj"] .s3-01-rail { display: none; }
        .s3-01-rail { display: flex; flex-direction: column; gap: 6px; }
        @media (min-width: 900px) {
          .s3-01-split { display: grid; grid-template-columns: 250px 1fr; gap: 24px; align-items: start; }
          [data-mobil-vis] .s3-01-rail, [data-mobil-vis] .s3-01-detalj { display: block; }
          .s3-01-rail { display: flex; max-height: 720px; overflow-y: auto; padding-right: 4px; }
          .s3-01-tilbake { display: none !important; }
        }
        @media (min-width: 1180px) {
          .s3-01-split { grid-template-columns: 280px 1fr; }
        }
      `}</style>

      <div className="s3-01-split">
        <div className="s3-01-rail">
          {data.rail.map((r) => (
            <RailRad
              key={r.id}
              navn={r.navn}
              avatarUrl={r.avatarUrl}
              hcpLabel={r.hcpLabel}
              subLabel={r.subLabel}
              aktiv={r.id === data.aktivId}
              href={`${basePath}/${r.id}?vis=360`}
              onClick={() => setMobilVisDetalj(true)}
            />
          ))}
        </div>

        <div className="s3-01-detalj">
          <button
            type="button"
            className="s3-01-tilbake v2-press v2-focus"
            onClick={() => setMobilVisDetalj(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              color: TL.mute,
              cursor: "pointer",
            }}
          >
            ← Stallen
          </button>
          <Detaljpanel data={data} workbenchHref={workbenchHref} />
        </div>
      </div>
    </div>
  );
}
