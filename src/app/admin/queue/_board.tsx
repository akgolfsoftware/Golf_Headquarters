"use client";

/**
 * Oppfølgingskøens kanban-board (klient) — I5: kortene dras mellom kolonner.
 * Dra = coachens manuelle overstyring (settOppfolgingsstatus, 7 dagers
 * virkning); «Løst» = kvittert. Kort-markupen er flyttet 1:1 fra page.tsx
 * (server) — kun DnD-lag og lagre-state er nytt. Kun v2-komponenter.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Kort, StatusPill, AvatarInit, Icon } from "@/components/v2";
import { settOppfolgingsstatus } from "./actions";

const DND_MIME = "application/x-akgolf-queue";

export type QueueStatus = "risk" | "watch" | "check" | "ok";

export type QueueKort = {
  id: string;
  navn: string;
  epost: string;
  signalTekst: string;
  signalIkon: string;
  stats: { k: string; v: string; tone?: "up" | "down" }[];
  tags: { label: string; tone: "down" | "warn" | "up" }[];
  siden: string;
  prioritet: boolean;
};

export type QueueKolonne = {
  status: QueueStatus;
  tittel: string;
  beskrivelse: string;
  kort: QueueKort[];
};

const KOLONNE_DOT: Record<QueueStatus, string> = {
  risk: TL.danger,
  watch: TL.warn,
  check: TL.fill,
  ok: TL.viz.target,
};

function SpillerKort({ k, flytter }: { k: QueueKort; flytter: boolean }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DND_MIME, k.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{ cursor: "grab", opacity: flytter ? 0.45 : 1 }}
    >
      <Kort pad="12px 14px" tint={k.prioritet}>
        <Link href={`/admin/spillere/${k.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <AvatarInit navn={k.navn} size={34} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 700, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {k.navn}
            </div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {k.epost}
            </div>
          </div>
          <Icon name="grip-vertical" size={13} style={{ color: TL.mute, flexShrink: 0 }} />
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: TL.dock, borderRadius: 8, padding: "8px 10px", marginTop: 10 }}>
          <Icon name={k.signalIkon} size={13} style={{ color: TL.mute, marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.text, lineHeight: 1.4 }}>{k.signalTekst}</span>
        </div>

        {k.stats.length > 0 && (
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {k.stats.map((s, i) => (
              <div key={i}>
                <Caps size={8.5}>{s.k}</Caps>
                <div style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, marginTop: 3, color: s.tone === "down" ? TL.danger : s.tone === "up" ? TL.ok : TL.text }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        )}

        {k.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {k.tags.map((t, i) => (
              <StatusPill key={i} tone={t.tone}>
                {t.label}
              </StatusPill>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TL.hair}` }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 9, textTransform: "uppercase", color: TL.mute }}>{k.siden}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <Link href="/admin/innboks" aria-label="Send melding" title="Send melding" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${TL.hair}` }}>
              <Icon name="message-square" size={13} style={{ color: TL.mute }} />
            </Link>
            <Link href={`/admin/spillere/${k.id}`} aria-label="Ring / kontakt" title="Ring / kontakt" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${TL.hair}` }}>
              <Icon name="phone" size={13} style={{ color: TL.mute }} />
            </Link>
            <Link href="/admin/bookinger/ny" aria-label="Book økt" title="Book økt" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${TL.hair}` }}>
              <Icon name="calendar-plus" size={13} style={{ color: TL.mute }} />
            </Link>
          </div>
        </div>
      </Kort>
    </div>
  );
}

export function QueueBoard({ kolonner }: { kolonner: QueueKolonne[] }) {
  const router = useRouter();
  const [overKolonne, setOverKolonne] = useState<QueueStatus | null>(null);
  const [flytterId, setFlytterId] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const onDrop = async (spillerId: string, status: QueueStatus) => {
    if (flytterId) return;
    setFlytterId(spillerId);
    setFeil(null);
    const res = await settOppfolgingsstatus(spillerId, status);
    setFlytterId(null);
    if (res.ok) router.refresh();
    else setFeil(res.error ?? "Kunne ikke flytte saken.");
  };

  return (
    <>
      {feil && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 11, background: `color-mix(in srgb, ${TL.danger} 9%, ${TL.elev})`, border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)` }}>
          <Icon name="alert-triangle" size={13} style={{ color: TL.danger }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text }}>{feil}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: 16, alignItems: "start" }}>
        {kolonner.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (overKolonne !== col.status) setOverKolonne(col.status); }}
            onDragLeave={() => setOverKolonne((v) => (v === col.status ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setOverKolonne(null);
              const id = e.dataTransfer.getData(DND_MIME);
              if (id) onDrop(id, col.status);
            }}
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              borderRadius: 14, padding: 6, margin: -6,
              background: overKolonne === col.status ? `color-mix(in srgb, ${TL.fill} 6%, transparent)` : "transparent",
              outline: overKolonne === col.status ? `1px dashed color-mix(in srgb, ${TL.fill} 45%, transparent)` : "none",
              outlineOffset: -2,
              transition: "background 80ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: KOLONNE_DOT[col.status] }} />
              <Caps>{col.tittel}</Caps>
              <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, background: TL.dock, borderRadius: 9999, padding: "1px 8px" }}>
                {col.kort.length}
              </span>
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, margin: 0 }}>{col.beskrivelse}</p>

            {col.kort.length === 0 ? (
              <div style={{ border: `1px dashed ${TL.hair}`, borderRadius: TL.radius.row, padding: "28px 12px", textAlign: "center", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
                {col.status === "ok" ? "Dra en sak hit for å kvittere den." : "Ingen saker her."}
              </div>
            ) : (
              col.kort.map((k) => <SpillerKort key={k.id} k={k} flytter={flytterId === k.id} />)
            )}
          </div>
        ))}
      </div>
    </>
  );
}
