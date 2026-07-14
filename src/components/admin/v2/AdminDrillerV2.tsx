"use client";

/**
 * AgencyOS v2 — Drill-bibliotek-hub (`/admin/drills`, AgencyOS Bølge 1.2, 2026-07-14).
 *
 * Port fra `(legacy)/drills/page.tsx` — samme datakontrakt/-logikk (kategori
 * via ?kat=, søk via ?q=, 30-tak per kategori med ærlig «viser X av Y»-tall).
 * Ny presentasjon: tile-grid av `Kort` i stedet for fasit-ens `.seg`-kontroll +
 * rå Tailwind-kort — kategorifargen gjenbruker samme `T.ax`-akse-tokens som
 * resten av v2 (Approach→SLAG, Putting→SPILL, Driving→TEK, Nærspill→TURN,
 * Fys→FYS, se `drillKategoriAkse` i page.tsx).
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, Icon, T } from "@/components/v2";

export interface AdminDrillerV2Row {
  id: string;
  name: string;
  katLabel: string;
  /** CSS-fargeverdi (token) for kategori-ikonet — akse-farge eller `T.lime` som fallback. */
  ikonFarge: string;
  meta: string;
}

export interface AdminDrillerV2Kategori {
  param: string;
  label: string;
}

export interface AdminDrillerV2Data {
  total: number;
  iKategori: number;
  visMaks: number;
  q: string;
  aktivKat: string;
  kategorier: AdminDrillerV2Kategori[];
  drills: AdminDrillerV2Row[];
  nyHref: string;
  forslagHref: string;
  forslagCount: number;
}

function kategoriHref(param: string, q: string): string {
  const params = new URLSearchParams();
  if (param !== "alle") params.set("kat", param);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/drills?${qs}` : "/admin/drills";
}

export function AdminDrillerV2({ total, iKategori, visMaks, q, aktivKat, kategorier, drills, nyHref, forslagHref, forslagCount }: AdminDrillerV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Planlegge · Drill-bibliotek</Caps>
          <Tittel em="tagget.">{total} drills,</Tittel>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 460 }}>
            Øvelsesbiblioteket coachene deler. Filtrer på ferdighet og slipp drills rett inn i en plan.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flex: "none" }}>
          {forslagCount > 0 && (
            <Link href={forslagHref} style={{ textDecoration: "none" }}>
              <Knapp ghost icon="sparkles">{forslagCount} AI-forslag</Knapp>
            </Link>
          )}
          <Link href={nyHref} style={{ textDecoration: "none" }}>
            <Knapp icon="plus">Ny drill</Knapp>
          </Link>
        </div>
      </div>

      <form action="/admin/drills" method="GET" style={{ display: "flex" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, width: "100%", maxWidth: 360, padding: "0 14px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.borderS}` }}>
          <Icon name="search" size={14} style={{ color: T.mut, flex: "none" }} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Søk drill-navn, beskrivelse eller tag"
            style={{ minWidth: 0, flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg }}
          />
        </label>
        {aktivKat !== "alle" && <input type="hidden" name="kat" value={aktivKat} />}
      </form>

      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
        {kategorier.map((k) => {
          const on = k.param === aktivKat;
          return (
            <Link
              key={k.param}
              href={kategoriHref(k.param, q)}
              style={{
                flex: "none", textDecoration: "none",
                display: "inline-flex", alignItems: "center", height: 28, padding: "0 13px", borderRadius: 9999,
                fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
                background: on ? T.lime : T.panel2, color: on ? T.onLime : T.fg2,
                border: `1px solid ${on ? "transparent" : T.border}`,
                whiteSpace: "nowrap",
              }}
            >
              {k.label}
            </Link>
          );
        })}
      </div>

      {drills.length === 0 ? (
        <Kort>
          <div style={{ padding: "26px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen drills i denne kategorien ennå.
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: T.gap }}>
          {drills.map((d) => (
            <Link key={d.id} href={`/admin/drills/${d.id}`} style={{ textDecoration: "none" }}>
              <Kort hover pad="14px 16px" style={{ minHeight: 108, justifyContent: "space-between", gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name="dumbbell" size={16} style={{ color: d.ikonFarge }} />
                </span>
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg, lineHeight: 1.25 }}>{d.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 6 }}>{d.meta}</div>
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      )}

      {iKategori > visMaks && (
        <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>
          Viser {visMaks} av {iKategori} i valgt kategori.
        </p>
      )}
    </div>
  );
}
