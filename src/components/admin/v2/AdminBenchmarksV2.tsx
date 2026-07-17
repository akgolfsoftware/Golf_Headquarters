"use client";

/**
 * AgencyOS — Tester · Fasiter (DataGolf-autosync), v2-port 16. juli 2026.
 * Erstatter rå Tailwind-tabell/kort med v2-primitiver. Samme server actions
 * (approveBenchmarkPending/rejectBenchmarkPending/runBenchmarkSyncNow)
 * uendret — kun presentasjonslaget er nytt.
 */

import { useTransition } from "react";
import { Caps, Tittel, Kort, Knapp, StatusPill, TilbakeLenke, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type SyncMode = "auto" | "follow" | "static";
const MODE_LABEL: Record<SyncMode, string> = { auto: "AUTO", follow: "FØLGER DRIVER", static: "REFERANSE" };

export interface BenchmarksPendingRad {
  id: string;
  navn: string;
  endringPct: string;
  årsak: string;
  nivaer: { id: string; label: string; verdi: string; nesteVerdi: string | null; endret: boolean }[];
}
export interface BenchmarksRad {
  id: string;
  navn: string;
  mode: SyncMode;
  kilde: string;
  verdier: string;
}
export interface AdminBenchmarksV2Data {
  sisteKjoring: string;
  ventende: BenchmarksPendingRad[];
  alle: BenchmarksRad[];
}

function VentendeKort({
  rad,
  onApprove,
  onReject,
}: {
  rad: BenchmarksPendingRad;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Kort style={{ borderColor: `color-mix(in srgb, ${T.warn} 45%, ${T.border})` }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Icon name="triangle-alert" size={16} style={{ color: T.warn }} />
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{rad.navn}</span>
        <StatusPill tone="warn">
          Venter godkjenning · {rad.endringPct} % endring · {rad.årsak}
        </StatusPill>
      </div>

      <div style={{ marginTop: 12, maxWidth: 420 }}>
        {rad.nivaer.map((n, i) => (
          <div key={n.id} style={{ display: "grid", gridTemplateColumns: "1fr auto 20px auto", alignItems: "center", gap: 8, padding: "6px 0", borderTop: i ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{n.label}</span>
            <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.mut, textAlign: "right" }}>{n.verdi}</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, textAlign: "center" }}>→</span>
            <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: n.endret ? T.warn : T.mut, textAlign: "right" }}>
              {n.nesteVerdi ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Knapp icon="check" disabled={pending} onClick={() => startTransition(() => onApprove(rad.id))}>
          Godkjenn
        </Knapp>
        <Knapp icon="x" ghost disabled={pending} onClick={() => startTransition(() => onReject(rad.id))}>
          Avvis — behold dagens
        </Knapp>
      </div>
    </Kort>
  );
}

export function AdminBenchmarksV2({
  data,
  onApprove,
  onReject,
  onSyncNow,
}: {
  data: AdminBenchmarksV2Data;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
}) {
  const [syncPending, startSync] = useTransition();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 860 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <TilbakeLenke href="/admin/tester">Tester</TilbakeLenke>
          <div style={{ marginTop: 10 }}>
            <Caps>Tester · Fasiter</Caps>
          </div>
          <div style={{ marginTop: 8 }}>
            <Tittel em="autosync.">DataGolf-fasiter</Tittel>
          </div>
        </div>
        <Knapp icon="refresh-cw" disabled={syncPending} onClick={() => startSync(onSyncNow)}>
          Kjør synk nå
        </Knapp>
      </div>

      <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: 0, maxWidth: 620 }}>
        Kjøres automatisk hver mandag kl. 08:00 (norsk sommertid). Endringer under 3 % skrives
        automatisk — større utslag havner her og venter på din godkjenning. Du får Telegram-melding
        etter hver kjøring. Siste kjøring: <b style={{ color: T.fg }}>{data.sisteKjoring}</b>.
      </p>

      {data.ventende.map((rad) => (
        <VentendeKort key={rad.id} rad={rad} onApprove={onApprove} onReject={onReject} />
      ))}

      <Kort pad="0">
        <div>
          {data.alle.map((rad, i) => (
            <div
              key={rad.id}
              style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? `1px solid ${T.border}` : "none" }}
            >
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{rad.navn}</span>
              <StatusPill tone={rad.mode === "static" ? "info" : "lime"}>{MODE_LABEL[rad.mode]}</StatusPill>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{rad.kilde}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {rad.verdier}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 18px", borderTop: `1px solid ${T.border}`, background: T.panel2 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>
            {data.alle.length} tester med fasit · {data.ventende.length} venter godkjenning
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>Data powered by DataGolf</span>
        </div>
      </Kort>
    </div>
  );
}
