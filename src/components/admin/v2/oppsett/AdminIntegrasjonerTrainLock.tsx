"use client";

/**
 * AgencyOS — Integrasjoner, Train-lock (T13-detaljer, 27.08.2026).
 *
 * Port av `V2IntegrasjonerPage` sitt inline JSX (Paper/T.*) til Train-lock
 * (TL.*) — CLAUDE.md invariant 2. Data/logikk (env-sjekker, Prisma-tall,
 * NOK-format, CTA-adresser) er hentet ferdig fra page.tsx (server component)
 * og sendt inn som `cards` — denne komponenten er ren visning, ingen ny
 * datahenting.
 *
 * Fasit: designsystem/train-lock/GAP-2 Tilstander drift.dc.html (GAP-2d/e,
 * PX-7 2026-08-29) — "error"-status er re-autentiserings-tilstanden:
 * danger-prikk + caps "Krever pålogging", aldri fylt flate. Utledet fra
 * GoogleCalendarConnection.status (finnes allerede i skjemaet — ingen ny
 * datamodell), ikke en påfunnet tilstand.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlKort, TlTittel, TL_PRESS } from "./tl-kit";

export type IntegrasjonStatus = "active" | "connected" | "disconnected" | "error";

export type IntegrasjonKort = {
  key: string;
  title: string;
  icon: string;
  status: IntegrasjonStatus;
  statusLabel: string;
  description: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
};

const STATUS_FARGE: Record<IntegrasjonStatus, string> = {
  active: TL.warm,
  connected: TL.warm,
  disconnected: TL.warn,
  error: TL.danger,
};

function StatusMerke({ status, label }: { status: IntegrasjonStatus; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 26,
        padding: "0 10px",
        borderRadius: 999,
        background: TL.dim,
        color: TL.text,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_FARGE[status], flex: "none" }} />
      {label}
    </span>
  );
}

export function AdminIntegrasjonerTrainLock({ cards }: { cards: IntegrasjonKort[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1080, margin: "0 auto", width: "100%" }}>
      <TlTittel sub="AgencyOS · Verktøy">Tilkoblede tjenester</TlTittel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {cards.map((card) => (
          <IntegrasjonKortView key={card.key} card={card} />
        ))}
      </div>
    </div>
  );
}

function IntegrasjonKortView({ card }: { card: IntegrasjonKort }) {
  const knapp = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 40,
        width: "100%",
        padding: "0 16px",
        borderRadius: TL.radius.pill,
        background: card.ctaExternal ? "transparent" : TL.dim,
        boxShadow: card.ctaExternal ? `inset 0 0 0 1px ${TL.hair}` : undefined,
        color: TL.text,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {card.ctaExternal && <Icon name="external-link" size={13} />}
      {card.ctaLabel}
    </span>
  );

  return (
    <TlKort pad="18px 20px" style={{ gap: 0, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            background: TL.dock,
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            color: TL.mute,
            flex: "none",
          }}
        >
          <Icon name={card.icon} size={18} />
        </span>
        <StatusMerke status={card.status} label={card.statusLabel} />
      </div>

      <div style={{ marginTop: 16, flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{card.title}</div>
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: TL.mute }}>{card.description}</p>
        {card.meta && (
          <p style={{ marginTop: 14, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{card.meta}</p>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${TL.hair}` }}>
        {card.ctaExternal ? (
          <a href={card.ctaHref} target="_blank" rel="noopener noreferrer" className={TL_PRESS} style={{ textDecoration: "none", display: "block" }}>
            {knapp}
          </a>
        ) : (
          <Link href={card.ctaHref} className={TL_PRESS} style={{ textDecoration: "none", display: "block" }}>
            {knapp}
          </Link>
        )}
      </div>
    </TlKort>
  );
}
