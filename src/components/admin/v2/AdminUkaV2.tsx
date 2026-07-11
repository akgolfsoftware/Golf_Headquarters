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
import { Caps, Tittel, Kort, KpiFlis, CTAPill, T } from "@/components/v2";

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

function DagKort({ d }: { d: UkaDagV2 }) {
  return (
    <Kort
      style={{
        minHeight: 200,
        border: `1px solid ${d.erIdag ? T.lime : d.erHelg ? T.border : T.border}`,
        background: d.erHelg && !d.erIdag ? T.panel2 : undefined,
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
              style={{
                padding: "9px 0",
                borderBottom: i === d.bookinger.length - 1 ? "none" : `1px solid ${T.border}`,
              }}
            >
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
  );
}

export function AdminUkaV2({ data }: { data: AdminUkaV2Data }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7" style={{ gap: 8 }}>
        {data.dager.map((d) => (
          <DagKort key={d.key} d={d} />
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
