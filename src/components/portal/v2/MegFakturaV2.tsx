"use client";

/**
 * PlayerHQ Meg · Faktura — v2 Presis + B-pakke (status + sum først).
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { T, Caps, Kort, StatusPill, Icon, CTAPill } from "@/components/v2";

export type MegFakturaData = {
  fakturaNr: string;
  /** Lang datoform, f.eks. «12. juni 2026». */
  fakturadato: string;
  forfallsdato: string;
  /** Kort datoform (dd.mm.åååå) til meta-flisene. */
  fakturadatoKort: string;
  forfallsdatoKort: string;
  fakturaId: string;
  beskrivelse: string;
  nettoKr: string;
  mvaKr: string;
  totalKr: string;
  erBetalt: boolean;
  statusLabel: string;
  /** Lang datoform for betalt-dato — null når fakturaen ikke er betalt. */
  betaltDato: string | null;
  transaksjonsId: string | null;
  navn: string | null;
  epost: string | null;
};

function MetaFlis({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", minWidth: 0 }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
    </div>
  );
}

function SumRad({ label, value, total }: { label: string; value: string; total?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: total ? 10 : 0,
        marginTop: total ? 8 : 0,
        borderTop: total ? `1px solid ${T.border}` : "none",
      }}
    >
      <span style={{ fontFamily: total ? T.disp : T.ui, fontSize: total ? 13.5 : 12.5, fontWeight: total ? 700 : 500, color: total ? T.fg : T.mut }}>
        {label}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: total ? 22 : 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

export function MegFakturaV2({ data, handlinger }: { data: MegFakturaData; handlinger?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <Caps>AK Golf · Faktura</Caps>
          <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: T.fg, margin: "10px 0 0", lineHeight: 1.05 }}>
            Faktura <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>#{data.fakturaNr}</em>
          </h1>
        </div>
        <StatusPill tone={data.erBetalt ? "up" : "info"}>{data.statusLabel}</StatusPill>
      </div>

      {/* B: status + sum først */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <Caps size={9}>Total</Caps>
          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 22, marginTop: 8, color: T.fg }}>{data.totalKr}</div>
        </Kort>
        <Kort pad="12px">
          <Caps size={9}>Status</Caps>
          <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 15, marginTop: 8, color: T.fg }}>{data.statusLabel}</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>{data.fakturadato}</div>
        </Kort>
      </div>

      {handlinger && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{handlinger}</div>
      )}

      {/* Parter + meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
        <Kort eyebrow="Fakturert til">
          <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>{data.navn ?? "—"}</div>
          {data.epost && <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>{data.epost}</div>}
        </Kort>
        <Kort eyebrow="Fakturert fra">
          <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>AK Golf Academy AS</div>
        </Kort>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10 }}>
        <MetaFlis label="Fakturadato" value={data.fakturadatoKort} />
        <MetaFlis label="Forfallsdato" value={data.forfallsdatoKort} />
        <MetaFlis label="Faktura-ID" value={data.fakturaId} />
      </div>

      {/* Fakturalinjer */}
      <Kort eyebrow="Fakturalinjer" pad="18px 20px 20px">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse" }}>
            <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Fakturalinjer
            </caption>
            <thead>
              <tr>
                {["Beskrivelse", "Antall", "Stk-pris", "MVA", "Sum"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 0 ? "left" : "right",
                      padding: "0 0 8px",
                      fontFamily: T.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: T.mut,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px 0", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                  {data.beskrivelse}
                </td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: T.mono, fontSize: 12.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>1</td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: T.mono, fontSize: 12.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{data.nettoKr}</td>
                <td style={{ padding: "12px 0", textAlign: "right" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 7px" }}>
                    25 %
                  </span>
                </td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: T.mono, fontSize: 12.5, color: T.fg, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{data.nettoKr}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: `1px solid ${T.border}`, paddingTop: 14, marginTop: 4 }}>
          <SumRad label="Netto" value={data.nettoKr} />
          <SumRad label="MVA (25 %)" value={data.mvaKr} />
          <SumRad label="Total" value={data.totalKr} total />
        </div>
      </Kort>

      {/* Betalingsinfo — kun ekte data */}
      {data.erBetalt && data.betaltDato && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: `color-mix(in srgb, ${T.up} 14%, transparent)`, color: T.up, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name="credit-card" size={16} />
            </span>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, minWidth: 0 }}>
              <strong style={{ color: T.fg }}>Betalt {data.betaltDato}</strong>
              {data.transaksjonsId && (
                <>
                  . Transaksjons-ID <span style={{ fontFamily: T.mono, fontSize: 11.5, wordBreak: "break-all" }}>{data.transaksjonsId}</span>
                </>
              )}
              .
            </div>
          </div>
        </Kort>
      )}

      <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="arrow-left" full>
          Tilbake til abonnement
        </CTAPill>
      </Link>
      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, textAlign: "center", margin: 0 }}>
        Spørsmål?{" "}
        <Link href="/portal/meg/help/kontakt" style={{ color: T.fg2, fontWeight: 600, textDecoration: "none" }}>
          Kontakt support →
        </Link>
      </p>
    </div>
  );
}
