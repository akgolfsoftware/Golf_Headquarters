"use client";

/**
 * AgencyOS Audit-log — Train-lock (T13, 27.08.2026).
 *
 * Mønster-port av `AdminAuditLogV2` (Paper) — samme datakontrakt
 * (`AdminAuditLogV2Data`/`Event`/`Kind`/`Status`, reeksportert her for
 * bakoverkompatibilitet med ruten) og samme innhold: status-oppsummering,
 * KPI-par, primær CTA til sikkerhet, hendelsesliste. Ingen egen fasit
 * tegner denne skjermen — port med tl-kit-primitiver.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import type { IconProps } from "@/components/v2/icon";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand } from "./tl-kit";

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

const STATUS_FARGE: Record<AdminAuditLogV2Status, string> = {
  ok: TL.ok,
  warn: TL.warn,
  danger: TL.danger,
};

const STATUS_LABEL: Record<AdminAuditLogV2Status, string> = {
  ok: "OK",
  warn: "Varsel",
  danger: "Feil",
};

function StatusMerke({ status }: { status: AdminAuditLogV2Status }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: status === "ok" ? TL.text : STATUS_FARGE[status],
        boxShadow: `inset 0 0 0 1px ${status === "danger" ? TL.danger : TL.hair}`,
        flex: "none",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function KpiBrikke({ label, value, varsle }: { label: string; value: string | number; varsle?: boolean }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
      <TlCaps size={10}>{label}</TlCaps>
      <div
        style={{
          marginTop: 8,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: varsle ? TL.warn : TL.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

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
        background: TL.dock,
        color: TL.mute,
        flexShrink: 0,
      }}
    >
      <Icon name={KIND_ICON[kind]} size={15} />
    </span>
  );
}

export function AdminAuditLogTrainLock({ data }: { data: AdminAuditLogV2Data }) {
  const ren = data.mistenkelige === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <TlTittel sub="Sikkerhet">Audit-logg</TlTittel>
        <StatusMerke status={ren ? "ok" : "warn"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <KpiBrikke label="Hendelser vist" value={`${data.events.length} av ${data.total}`} />
        <KpiBrikke label="Mistenkelig · 7d" value={data.mistenkelige} varsle={data.mistenkelige > 0} />
      </div>

      <TlKnapp icon="shield" variant="primaer" href="/admin/oppsett?fane=sikkerhet" full>
        Åpne sikkerhet
      </TlKnapp>

      {data.events.length === 0 ? (
        <TlKort>
          <TlTomTilstand
            icon="shield"
            title="Ingen hendelser logget ennå"
            sub="Innlogginger, bookinger, data-endringer og API-kall vises her etter hvert som de skjer."
          />
        </TlKort>
      ) : (
        <TlKort pad="4px 20px">
          {data.events.map((ev, i) => (
            <TlRad
              key={ev.id}
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <HendelseIkon kind={ev.kind} />
                  {ev.action}
                </span>
              }
              sub={`${ev.actor} · ${ev.time}`}
              trailing={<StatusMerke status={ev.status} />}
              chevron={false}
              last={i === data.events.length - 1}
            />
          ))}
        </TlKort>
      )}
    </div>
  );
}
