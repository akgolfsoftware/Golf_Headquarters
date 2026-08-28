"use client";
import { TL } from "@/lib/v2/train-lock";
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
import { Caps, Tittel, Kort, KpiFlis, CTAPill, StatusPill, TomTilstand, Icon, HurtigOpprett, foreslaTid } from "@/components/v2";
import { flyttBookingTilDag } from "@/app/admin/agencyos/uka/actions";
// I5: samme DnD-payload-mønster som Workbench-tidslinja.
const DND_MIME = "application/x-akgolf-uka";

/** d.key er full toISOString() — normaliser til lokal «YYYY-MM-DD» for hurtigvelgeren. */
function tilISODato(key: string): string {
  const dt = new Date(key);
  if (Number.isNaN(dt.getTime())) return key.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

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

function DagKort({ d, onFlytt, flytterId, onTomLuke }: { d: UkaDagV2; onFlytt: (bookingId: string, targetDayISO: string) => void; flytterId: string | null; onTomLuke: (datoISO: string, kl: string) => void }) {
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
        border: `1px solid ${over ? TL.fill : d.erIdag ? TL.fill : TL.hair}`,
        background: over ? `color-mix(in srgb, ${TL.fill} 6%, ${TL.elev})` : d.erHelg && !d.erIdag ? TL.dock : undefined,
        transition: "background 80ms, border-color 80ms",
      }}
    >
      <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${TL.hair}` }}>
        <Caps color={d.erIdag ? TL.fill : d.erHelg ? TL.danger : TL.mute}>
          {d.kortNavn} · {d.bookinger.length}
        </Caps>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: TL.text, marginTop: 3 }}>
          {d.erIdag ? <em style={{ fontStyle: "italic", color: TL.fill }}>I dag</em> : d.erHelg ? "Låst dag" : d.langNavn}
        </div>
      </div>
      {d.bookinger.length === 0 ? (
        /* I1: trykk på tom dag-luke → hurtigvelger (Ny booking / Ny økt).
           Helg er en anbefaling («beskyttet»), aldri en sperre — luken er
           trykkbar der også. */
        <button
          type="button"
          onClick={() => onTomLuke(d.key, "09:00")}
          aria-label={`Ny booking eller økt ${d.langNavn}`}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", background: "none", border: `1px dashed transparent`, borderRadius: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100, padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = TL.hair; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
        >
          <Caps size={9}>{d.erHelg ? "— beskyttet —" : "— ledig —"}</Caps>
        </button>
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
                borderBottom: i === d.bookinger.length - 1 ? "none" : `1px solid ${TL.hair}`,
                cursor: "grab",
                opacity: flytterId === b.id ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <Icon name="grip-vertical" size={11} style={{ color: TL.mute, flex: "none" }} />
                {b.navn}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.tjeneste}
                </span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {b.time} · {b.durMin} min
                </span>
              </div>
            </div>
          ))}
          {/* I1: tom luke under dagens bookinger → hurtigvelger med tid etter siste booking. */}
          <button
            type="button"
            onClick={() => {
              const siste = d.bookinger[d.bookinger.length - 1];
              onTomLuke(d.key, foreslaTid(siste.time, siste.durMin));
            }}
            aria-label={`Ny booking eller økt ${d.langNavn}`}
            className="v2-press v2-focus"
            style={{ appearance: "none", cursor: "pointer", background: "none", border: `1px dashed transparent`, borderRadius: 10, width: "100%", minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "transparent", padding: 0, marginTop: 4 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = TL.hair; e.currentTarget.style.color = TL.mute; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "transparent"; }}
          >
            <Icon name="plus" size={13} />
          </button>
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
  // I1: trykk på tom luke → hurtigvelger (Ny booking / Ny økt) med dag/tid fra luken.
  const [tomLuke, setTomLuke] = useState<{ dato: string; kl: string } | null>(null);

  const onFlytt = async (bookingId: string, targetDayISO: string) => {
    if (flytterId) return;
    setFlytterId(bookingId);
    setFeil(null);
    const res = await flyttBookingTilDag(bookingId, targetDayISO);
    setFlytterId(null);
    if (res.ok) router.refresh();
    else setFeil(res.error ?? "Kunne ikke flytte bookingen.");
  };

  const primaerCta = (
    <Link href="/admin/bookinger/ny" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        Ny booking
      </CTAPill>
    </Link>
  );

  return (
    <div data-paper-wave-h="uka" data-paper-pattern style={{ display: "contents" }}><>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>AgencyOS · Uke {data.ukeNummer}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.periodeLabel}>Uka</Tittel>
          </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, marginTop: 8 }}>
            Caddie balanserer kapasitet, reise og familie-tid.
          </p>
        </div>
        <StatusPill tone={data.antallBookinger > 0 ? "lime" : "warn"}>
          {data.antallBookinger === 0 ? "Tom uke" : `${data.antallBookinger} bookinger`}
        </StatusPill>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
        <KpiFlis label="Timer totalt" value={`${data.timerTotalt} t`} />
        <KpiFlis label="Bookinger" value={data.antallBookinger} />
        <KpiFlis label="Unike spillere" value={data.unikeSpillere} />
        <KpiFlis label="Kapasitet" value={`${data.kapasitetPct} %`} delta={`${data.kapasitetMaal} t mål`} dir={data.kapasitetPct >= 70 ? "up" : undefined} />
      </div>

      {primaerCta}

      {feil && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 11, background: `color-mix(in srgb, ${TL.danger} 9%, ${TL.elev})`, border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)` }}>
          <Icon name="alert-triangle" size={13} style={{ color: TL.danger }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text }}>{feil}</span>
        </div>
      )}

      {data.antallBookinger === 0 && (
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen bookinger denne uka"
            sub="Opprett en booking for å fylle uka, eller åpne full kalender for oversikt."
          />
        </Kort>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7" style={{ gap: 8 }}>
        {data.dager.map((d) => (
          <DagKort key={d.key} d={d} onFlytt={onFlytt} flytterId={flytterId} onTomLuke={(dato, kl) => setTomLuke({ dato: tilISODato(dato), kl })} />
        ))}
      </div>

      {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}

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
    </div>
  );
}
