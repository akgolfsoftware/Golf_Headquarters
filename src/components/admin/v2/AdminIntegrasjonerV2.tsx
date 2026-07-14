/**
 * AgencyOS v2 — Integrasjoner (`/admin/integrasjoner`, AgencyOS Bølge 3.1,
 * 2026-07-14). Port fra `(legacy)/integrasjoner/page.tsx` — samme
 * status-kort-kontrakt (Google Calendar/Stripe/Notion/Anthropic/Resend/
 * Supabase), ren visning uten mutasjon.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, type StatusTone } from "@/components/v2";

export type IntegrasjonStatus = "active" | "connected" | "disconnected";

export interface AdminIntegrasjonV2Card {
  key: string;
  title: string;
  ikon: string;
  status: IntegrasjonStatus;
  statusLabel: string;
  description: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
}

const STATUS_TONE: Record<IntegrasjonStatus, StatusTone> = { active: "up", connected: "up", disconnected: "info" };

export function AdminIntegrasjonerV2({ cards }: { cards: AdminIntegrasjonV2Card[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>AgencyOS · Verktøy</Caps>
        <Tittel em="tjenester">Tilkoblede</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>Status og konfigurasjon for tredjeparts-integrasjoner.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: T.gap }}>
        {cards.map((c) => (
          <Kort key={c.key} style={{ gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name={c.ikon} size={18} style={{ color: T.mut }} />
              </span>
              <StatusPill tone={STATUS_TONE[c.status]}>{c.statusLabel}</StatusPill>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{c.title}</div>
              <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>{c.description}</p>
              {c.meta && <p style={{ marginTop: 10, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{c.meta}</p>}
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              {c.ctaExternal ? (
                <a href={c.ctaHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <Knapp>{c.ctaLabel}</Knapp>
                </a>
              ) : (
                <Link href={c.ctaHref} style={{ textDecoration: "none" }}>
                  <Knapp>{c.ctaLabel}</Knapp>
                </Link>
              )}
            </div>
          </Kort>
        ))}
      </div>
    </div>
  );
}
