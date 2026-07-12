"use client";

/**
 * AgencyOS · Uka — v2. Rekomponert fra src/app/admin/(legacy)/agencyos/uka/page.tsx
 * (7-dagers kanban med bookinger gruppert per dag) med v2-biblioteket
 * (src/components/v2) — ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1: samme ukevindu (mandag–søndag), samme KPI-er
 * (timer totalt, bookinger, unike spillere, kapasitet mot mål), samme
 * per-dag-gruppering med i dag/helg-fremheving.
 *
 * Mobil: dagene stables i én kolonne (agenda-liste) — ingen sidescroll.
 * Desktop: 7-kolonners grid.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, KpiFlis, CTAPill, Icon, T } from "@/components/v2";
import { flyttBookingTilDag } from "@/app/admin/agencyos/uka/actions";

// I5: samme DnD-payload-mønster som Workbench-tidslinja.
const DND_MIME = "application/x-akgolf-uka";

export interface UkaBookingV2 {
  id: string;
  time: string;
  durMin: number;
  navn: string;
  tjeneste: string;
}

export interface UkaDagV2 {
  key: string;
  kortNavn: string;
  langNavn: string;
  dato: string;
  erIdag: boolean;
  erHelg: boolean;
  bookinger: UkaBookingV2[];
}

export interface AdminUkaV2Data {
  ukeNummer: number;
  periodeLabel: string;
  timerTotalt: number;
  kapasitetMaal: number;
  antallBookinger: number;
  unikeSpillere: number;
  kapasitetPct: number;
  dager: UkaDagV2[];
}

function DagKort({ d, onFlytt, flytterId }: { d: UkaDagV2; onFlytt: (bookingId: string, targetDayISO: string) => void; flytterId: string | null }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (!over) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData(DND_MIME);
        if (id) onFlytt(id, d.key);
      }}
      style={{ display: "flex", flexDirection: "column" }}
    >
    <Kort
      style={{
        minHeight: 200,
        flex: 1,
        border: `1px solid ${over ? T.lime : d.erIdag ? T.lime : T.border}`,
        background: over ? `color-mix(in srgb, ${T.lime} 6%, ${T.panel})` : d.erHelg && !d.erIdag ? T.panel2 : undefined,
        transition: "background 80ms, border-color 80ms",
      }}
    >
      <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <Caps color={d.erIdag ? T.lime : d.erHelg ? T.down : T.mut}>
          {d.kortNavn} · {d.bookinger.length}
        </Caps>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: T.fg, marginTop: 3 }}>
          {d.erIdag ? <em style={{ fontStyle: "italic", color: T.lime }}>I dag</em> : d.erHelg ? "Låst dag" : d.langNavn}
        </div>
      </div>
      {d.bookinger.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
          <Caps size={9}>{d.erHelg ? "— beskyttet —" : "— ledig —"}</Caps>
        </div>
      ) : (
        <div>
          {d.bookinger.map((b, i) => (
            <div
              key={b.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DND_MIME, b.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              style={{
                padding: "9px 0",
                borderBottom: i === d.bookinger.length - 1 ? "none" : `1px solid ${T.border}`,
                cursor: "grab",
                opacity: flytterId === b.id ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <Icon name="grip-vertical" size={11} style={{ color: T.mut, flex: "none" }} />
                {b.navn}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.tjeneste}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {b.time} · {b.durMin} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Kort>
    </div>
  );
}

export function AdminUkaV2({ data }: { data: AdminUkaV2Data }) {
  const router = useRouter();
  const [flytterId, setFlytterId] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const onFlytt = async (bookingId: string, targetDayISO: string) => {
    if (flytterId) return;
    setFlytterId(bookingId);
    setFeil(null);
    const res = await flyttBookingTilDag(bookingId, targetDayISO);
    setFlytterId(null);
    if (res.ok) router.refresh();
    else setFeil(res.error ?? "Kunne ikke flytte bookingen.");
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>AgencyOS · Uke {data.ukeNummer}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.periodeLabel}>Uka</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 8 }}>
            Caddie balanserer kapasitet, reise og familie-tid.
          </p>
        </div>
        <Link href="/admin/kalender" style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny booking</CTAPill>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis label="Timer totalt" value={`${data.timerTotalt} t`} />
        <KpiFlis label="Bookinger" value={data.antallBookinger} />
        <KpiFlis label="Unike spillere" value={data.unikeSpillere} />
        <KpiFlis label="Kapasitet" value={`${data.kapasitetPct} %`} delta={`${data.kapasitetMaal} t mål`} dir={data.kapasitetPct >= 70 ? "up" : undefined} />
      </div>

      {feil && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 11, background: `color-mix(in srgb, ${T.down} 9%, ${T.panel})`, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)` }}>
          <Icon name="alert-triangle" size={13} style={{ color: T.down }} />
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg }}>{feil}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7" style={{ gap: 8 }}>
        {data.dager.map((d) => (
          <DagKort key={d.key} d={d} onFlytt={onFlytt} flytterId={flytterId} />
        ))}
      </div>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Caps>Vis full måned eller dra-og-slipp i full kalender</Caps>
        </div>
        <div style={{ marginTop: 10 }}>
          <Link href="/admin/kalender" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="arrow-right">Åpne kalender</CTAPill>
          </Link>
        </div>
      </Kort>
    </>
  );
}
