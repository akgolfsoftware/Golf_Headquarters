/**
 * AgencyOS Drill-bibliotek — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Kategori + søk + tile-grid. T.* only.
 */

import Link from "next/link";
import { Caps, Tittel, CTAPill, Kort, TomTilstand, StatusPill } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

export type AdminDrillsKategori = { param: string; label: string };

export type AdminDrillsRad = {
  id: string;
  navn: string;
  kategori: string;
  kategoriFarge: string;
  meta: string;
};

export type AdminDrillsV2Data = {
  total: number;
  iKategori: number;
  visMaks: number;
  kategorier: AdminDrillsKategori[];
  aktivKategori: string;
  sok: string;
  drills: AdminDrillsRad[];
};

function kategoriHref(kat: string, q: string): string {
  const params = new URLSearchParams();
  if (kat !== "alle") params.set("kat", kat);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/drills?${qs}` : "/admin/drills";
}

export function AdminDrillsV2({ data }: { data: AdminDrillsV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>Planlegge · Drill-bibliotek · AgencyOS</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="tagget.">{`${data.total} drills,`}</Tittel>
          </div>
          <p style={{ marginTop: 8, maxWidth: 520, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
            Øvelsesbiblioteket coachene deler. Filtrer på ferdighet og slipp drills rett inn i en plan.
          </p>
        </div>
        <StatusPill tone={data.total > 0 ? "lime" : "warn"}>
          {data.total === 0 ? "Tomt bibliotek" : `${data.total} drills`}
        </StatusPill>
      </div>

      <Link href="/admin/drills/ny" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="plus" full>
          Ny drill
        </CTAPill>
      </Link>

      {/* Søk — kombineres med kategorifilteret via ?q= */}
      <form action="/admin/drills" method="GET" style={{ maxWidth: 360 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel, padding: "0 14px" }}>
          <Icon name="search" size={13} style={{ color: T.mut, flex: "none" }} />
          <input
            type="search"
            name="q"
            defaultValue={data.sok}
            placeholder="Søk drill-navn, beskrivelse eller tag"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg }}
          />
        </label>
        {data.aktivKategori !== "alle" && <input type="hidden" name="kat" value={data.aktivKategori} />}
      </form>

      {/* Kategorifilter — server-rendret Link-nav (URL-drevet, fungerer uten JS) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {data.kategorier.map((k) => {
          const on = k.param === data.aktivKategori;
          return (
            <Link key={k.param} href={kategoriHref(k.param, data.sok)} style={{ display: "contents" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 9999,
                  fontFamily: T.ui, fontSize: 12.5, fontWeight: on ? 600 : 500,
                  background: on ? T.lime : T.panel3,
                  border: `1px solid ${on ? "transparent" : T.borderS}`,
                  color: on ? T.onLime : T.fg,
                }}
              >
                {k.label}
              </span>
            </Link>
          );
        })}
      </div>

      {data.drills.length === 0 ? (
        <TomTilstand
          icon="search"
          title="Ingen drills i denne kategorien ennå"
          sub="Bytt kategori, fjern søk, eller opprett en ny drill."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {data.drills.map((d) => (
            <Link key={d.id} href={`/admin/drills/${d.id}`} style={{ display: "contents" }}>
              <Kort hover pad="16px" style={{ minHeight: 112, justifyContent: "space-between", cursor: "pointer" }}>
                <span
                  style={{
                    width: 38, height: 38, borderRadius: 10, background: T.panel3,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: d.kategoriFarge,
                  }}
                >
                  <Icon name="target" size={18} />
                </span>
                <span style={{ marginTop: 10, fontFamily: T.disp, fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: T.fg }}>{d.navn}</span>
                <span style={{ marginTop: "auto", paddingTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{d.meta}</span>
              </Kort>
            </Link>
          ))}
        </div>
      )}

      {data.iKategori > data.visMaks && (
        <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, margin: 0 }}>
          Viser {data.visMaks} av {data.iKategori} i kategorien «{data.kategorier.find((k) => k.param === data.aktivKategori)?.label ?? data.aktivKategori}».
        </p>
      )}
    </div>
  );
}
