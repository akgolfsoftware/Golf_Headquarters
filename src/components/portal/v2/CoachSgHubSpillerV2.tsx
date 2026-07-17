/**
 * PlayerHQ · SG-hub · Coach-modus spilleroversikt
 * (/portal/mal/sg-hub/coach/[spillerId]) — v2.
 * v2-port 17. juli 2026 (Team D3): coachens inngang til én spillers SG-hub.
 * Coach-modus-banner, nøkkeltall (TrackMan-økter/køller/tier), per-kølle-grid
 * og verktøy (Equipment Fit). Data og tilgangskontroll bor i server-page.
 */

import Link from "next/link";
import {
  Kort,
  Caps,
  KpiFlis,
  TomTilstand,
  Icon,
  HjelpTips,
  T,
} from "@/components/v2";

export interface CoachSgHubSpillerV2Data {
  spillerNavn: string;
  antallOkter: number;
  tierLabel: string;
  klubber: string[];
  baseHref: string; // /portal/mal/sg-hub/coach/[spillerId]
}

export function CoachSgHubSpillerV2({ data }: { data: CoachSgHubSpillerV2Data }) {
  return (
    <>
      {/* Coach-modus-banner */}
      <Kort tint>
        <Caps color={T.lime}>Coach-modus</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", color: T.fg, margin: "8px 0 0", lineHeight: 1.1 }}>
          Du ser <em style={{ fontStyle: "italic", fontWeight: 500, color: T.lime }}>{data.spillerNavn}</em> sin SG-hub
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "8px 0 0", lineHeight: 1.55 }}>
          Alle innsikter og data tilhører spilleren. Du kan legge til shot-annotasjoner som spilleren ser.
        </p>
      </Kort>

      {/* Nøkkeltall */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: T.gap }}>
        <KpiFlis label="TrackMan-økter" value={data.antallOkter} hjelp="trackman" instant />
        <KpiFlis label="Køller registrert" value={data.klubber.length} instant />
        <KpiFlis label="Spillerens tier" value={data.tierLabel} instant />
      </div>

      {/* Per-kølle analyse */}
      <Kort eyebrow="Per-kølle analyse">
        {data.klubber.length === 0 ? (
          <TomTilstand
            icon="target"
            title="Ingen TrackMan-data ennå"
            sub={`${data.spillerNavn} har ingen TrackMan-slag registrert.`}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
            {data.klubber.map((klubb) => (
              <Link
                key={klubb}
                href={`${data.baseHref}/${encodeURIComponent(klubb)}`}
                className="v2-press v2-focus"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  borderRadius: 13,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                  padding: "14px 8px",
                  textDecoration: "none",
                }}
              >
                <Icon name="circle-dot" size={16} style={{ color: T.mut }} />
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{klubb}</span>
                <Icon name="chevron-right" size={12} style={{ color: T.mut }} />
              </Link>
            ))}
          </div>
        )}
      </Kort>

      {/* Verktøy */}
      <Kort eyebrow="Verktøy">
        <Link href={`${data.baseHref}/equipment`} style={{ textDecoration: "none" }}>
          <div
            className="v2-row-h"
            style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 13, border: `1px solid ${T.border}`, background: T.panel2, padding: 14, cursor: "pointer" }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name="wrench" size={15} style={{ color: T.fg2 }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>Equipment Fit</span>
                <HjelpTips k="trackman" size={11} />
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
                Per-kølle helsesjekk på launch, spin og smash.
              </div>
            </div>
            <Icon name="chevron-right" size={14} style={{ color: T.mut }} />
          </div>
        </Link>
      </Kort>
    </>
  );
}
