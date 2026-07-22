"use client";

/**
 * AgencyOS Audit-log — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Siste sikkerhetshendelser. T.* only.
 */

import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  TomTilstand,
  CTAPill,
  Icon,
  T,
} from "@/components/v2";
import type { IconProps } from "@/components/v2/icon";

// ── Datakontrakt (mappes fra AuditLog i ruten) ──────────────────
export type AdminAuditLogV2Kind = "auth" | "api" | "data" | "security";
export type AdminAuditLogV2Status = "ok" | "warn" | "danger";

export interface AdminAuditLogV2Event {
  id: string;
  /** Formatert «24. jun · 14:05». */
  time: string;
  kind: AdminAuditLogV2Kind;
  actor: string;
  action: string;
  status: AdminAuditLogV2Status;
}

export interface AdminAuditLogV2Data {
  /** De viste hendelsene (nyeste 50). */
  events: AdminAuditLogV2Event[];
  /** Totalt antall hendelser i basen. */
  total: number;
  /** Antall warn/danger-hendelser siste 7 dager. */
  mistenkelige: number;
}

const KIND_ICON: Record<AdminAuditLogV2Kind, IconProps["name"]> = {
  auth: "lock",
  api: "plug",
  data: "check-circle",
  security: "shield",
};

const STATUS_TONE: Record<AdminAuditLogV2Status, "up" | "warn" | "down"> = {
  ok: "up",
  warn: "warn",
  danger: "down",
};

const STATUS_LABEL: Record<AdminAuditLogV2Status, string> = {
  ok: "OK",
  warn: "Varsel",
  danger: "Feil",
};

function HendelseIkon({ kind }: { kind: AdminAuditLogV2Kind }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 10,
        background: `color-mix(in srgb, ${T.forest} 10%, transparent)`,
        color: T.forest,
        flexShrink: 0,
      }}
    >
      <Icon name={KIND_ICON[kind]} size={15} />
    </span>
  );
}

export function AdminAuditLogV2({ data }: { data: AdminAuditLogV2Data }) {
  const ren = data.mistenkelige === 0;

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Sikkerhet</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="hendelser.">Audit-log — sikkerhets</Tittel>
        </div>
      </div>
      <StatusPill tone={ren ? "up" : "warn"}>{ren ? "Audit ren" : "Se gjennom"}</StatusPill>
    </div>
  );

  // ── KPI-strip ─────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2" style={{ gap: T.gap }}>
      <KpiFlis label="Hendelser vist" value={`${data.events.length} av ${data.total}`} />
      <KpiFlis
        label="Mistenkelig · 7d"
        value={data.mistenkelige}
        varsle={data.mistenkelige > 0}
      />
    </div>
  );

  // B: én primær CTA
  const primaerCta = (
    <Link href="/admin/settings/sikkerhet" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="shield" full>
        Åpne sikkerhet
      </CTAPill>
    </Link>
  );

  // ── Tom-tilstand + vei ────────────────────────────────────────
  if (data.events.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {kpi}
        <Kort>
          <TomTilstand
            icon="shield"
            title="Ingen hendelser logget ennå"
            sub="Innlogginger, bookinger, data-endringer og API-kall vises her etter hvert som de skjer."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {primaerCta}
      <Kort pad="4px 18px">
        {data.events.map((ev, i) => (
          <Rad
            key={ev.id}
            leading={<HendelseIkon kind={ev.kind} />}
            title={ev.action}
            sub={`${ev.actor} · ${ev.time}`}
            meta={<StatusPill tone={STATUS_TONE[ev.status]}>{STATUS_LABEL[ev.status]}</StatusPill>}
            last={i === data.events.length - 1}
          />
        ))}
      </Kort>
    </div>
  );
}
