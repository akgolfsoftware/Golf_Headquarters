"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Meg · Faktura — v2 Presis + B-pakke (status + sum først).
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { Caps, Kort, StatusPill, Icon } from "@/components/v2";
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
    <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 12, padding: "10px 14px", minWidth: 0 }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
        borderTop: total ? `1px solid ${TL.hair}` : "none",
      }}
    >
      <span style={{ fontFamily: total ? TL.font.sans : TL.font.sans, fontSize: total ? 13.5 : 12.5, fontWeight: total ? 700 : 500, color: total ? TL.text : TL.mute }}>
        {label}
      </span>
      <span style={{ fontFamily: TL.font.mono, fontSize: total ? 22 : 12.5, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

export function MegFakturaV2({ data, handlinger }: { data: MegFakturaData; handlinger?: ReactNode }) {
  return (
    <div data-paper-wave-g="megfaktura" data-paper-portal-meg-faktura data-paper-slug="playerhq-abonnement" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <Caps>AK Golf · Faktura</Caps>
          <h1 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: TL.text, margin: "10px 0 0", lineHeight: 1.05 }}>
            Faktura <em style={{ fontStyle: "italic", fontWeight: 400, color: TL.fill }}>#{data.fakturaNr}</em>
          </h1>
        </div>
        <StatusPill tone={data.erBetalt ? "up" : "info"}>{data.statusLabel}</StatusPill>
      </div>

      {/* B: status + sum først */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <Caps size={9}>Total</Caps>
          <div style={{ fontFamily: TL.font.mono, fontWeight: 700, fontSize: 22, marginTop: 8, color: TL.text }}>{data.totalKr}</div>
        </Kort>
        <Kort pad="12px">
          <Caps size={9}>Status</Caps>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 15, marginTop: 8, color: TL.text }}>{data.statusLabel}</div>
          <div style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginTop: 4 }}>{data.fakturadato}</div>
        </Kort>
      </div>

      {handlinger && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{handlinger}</div>
      )}

      {/* Parter + meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
        <Kort eyebrow="Fakturert til">
          <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>{data.navn ?? "—"}</div>
          {data.epost && <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, marginTop: 4 }}>{data.epost}</div>}
        </Kort>
        <Kort eyebrow="Fakturert fra">
          <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>AK Golf Academy AS</div>
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
                      fontFamily: TL.font.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: TL.mute,
                      borderBottom: `1px solid ${TL.hair}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px 0", fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
                  {data.beskrivelse}
                </td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>1</td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{data.nettoKr}</td>
                <td style={{ padding: "12px 0", textAlign: "right" }}>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "2px 7px" }}>
                    25 %
                  </span>
                </td>
                <td style={{ padding: "12px 0", textAlign: "right", fontFamily: TL.font.mono, fontSize: 12.5, color: TL.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{data.nettoKr}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: `1px solid ${TL.hair}`, paddingTop: 14, marginTop: 4 }}>
          <SumRad label="Netto" value={data.nettoKr} />
          <SumRad label="MVA (25 %)" value={data.mvaKr} />
          <SumRad label="Total" value={data.totalKr} total />
        </div>
      </Kort>

      {/* Betalingsinfo — kun ekte data */}
      {data.erBetalt && data.betaltDato && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: `color-mix(in srgb, ${TL.ok} 14%, transparent)`, color: TL.ok, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name="credit-card" size={16} />
            </span>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55, minWidth: 0 }}>
              <strong style={{ color: TL.text }}>Betalt {data.betaltDato}</strong>
              {data.transaksjonsId && (
                <>
                  . Transaksjons-ID <span style={{ fontFamily: TL.font.mono, fontSize: 11.5, wordBreak: "break-all" }}>{data.transaksjonsId}</span>
                </>
              )}
              .
            </div>
          </div>
        </Kort>
      )}

      <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", display: "block" }}>
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Tilbake til abonnement</span>
      </Link>
      <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, textAlign: "center", margin: 0 }}>
        Spørsmål?{" "}
        <Link href="/portal/meg/help/kontakt" style={{ color: TL.mute, fontWeight: 600, textDecoration: "none" }}>
          Kontakt support →
        </Link>
      </p>
    </div>
  );
}
