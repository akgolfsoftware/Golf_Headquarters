/**
 * AgencyOS v2 — Audit-log (`/admin/audit-log`, AgencyOS Bølge 3.1, 2026-07-14).
 * Port fra `(legacy)/audit-log/page.tsx` — samme datamodell (`AuditLog`,
 * siste 50, kind/status utledet av action-prefiks). Ren visning, ingen
 * mutasjon — server component holder seg selv.
 */

import { Caps, Tittel, Kort, Rad, StatusPill, Icon, T, type StatusTone } from "@/components/v2";

export type AuditKind = "auth" | "api" | "data" | "security";
export type AuditStatus = "ok" | "warn" | "danger";

const KIND_IKON: Record<AuditKind, string> = { auth: "lock", api: "globe", data: "check-circle", security: "shield" };
const STATUS_TONE: Record<AuditStatus, StatusTone> = { ok: "up", warn: "warn", danger: "down" };

export interface AdminAuditLogV2Event {
  id: string;
  time: string;
  kind: AuditKind;
  actor: string;
  action: string;
  status: AuditStatus;
}

export function AdminAuditLogV2({ events, mistenkelige }: { events: AdminAuditLogV2Event[]; mistenkelige: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <div>
        <Caps size={9}>AgencyOS · Sikkerhet</Caps>
        <Tittel em="-log">Audit</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>
          Alle sikkerhetsrelaterte hendelser. Innlogginger, bookinger, data-endringer og API-kall.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <StatusPill tone="info">{events.length} hendelser</StatusPill>
          <StatusPill tone={mistenkelige === 0 ? "up" : "warn"}>{mistenkelige === 0 ? "Audit ren" : "Se gjennom"}</StatusPill>
          <StatusPill tone={mistenkelige === 0 ? "info" : "warn"}>{mistenkelige} mistenkelig{mistenkelige === 1 ? "" : "e"} siste 7d</StatusPill>
        </div>
      </div>

      <Kort pad="6px 14px">
        {events.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen hendelser logget ennå. Aktivitet vises her etter hvert som det skjer.
          </div>
        ) : (
          events.map((ev, i) => (
            <Rad
              key={ev.id}
              last={i === events.length - 1}
              leading={
                <span style={{ width: 32, height: 32, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name={KIND_IKON[ev.kind]} size={15} style={{ color: T.lime }} />
                </span>
              }
              title={ev.action}
              sub={`${ev.actor} · ${ev.time}`}
              meta={<StatusPill tone={STATUS_TONE[ev.status]}>{ev.status}</StatusPill>}
            />
          ))
        )}
      </Kort>
    </div>
  );
}
