/**
 * Turnering · fane «Alle» — NY (MASTERPLAN 15.6). Full, søkbar, paginert liste
 * over hele turneringsbasen (~7 274 stk). Fantes ikke som admin-visning før
 * denne sammenslåingen — /admin/tournaments viste kun stallens egne
 * (fanen «Mine spillere»).
 *
 * Rent GET-skjema (ingen klient-JS) — robust, og lar `/admin/turnering?fane=
 * alle&sok=…&side=…` peke direkte på et resultat.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlKnapp, TlRad, TlRadGruppe, TlTomTilstand } from "../oppsett/tl-kit";
import type { TurneringAlleData } from "@/lib/admin/turnering/lastere";

function sideHref(sok: string, side: number): string {
  const p = new URLSearchParams({ fane: "alle" });
  if (sok) p.set("sok", sok);
  if (side > 0) p.set("side", String(side));
  return `/admin/turnering?${p.toString()}`;
}

export function TurneringAlleListe({ data }: { data: TurneringAlleData }) {
  const { rader, totalt, side, sideStorrelse, sok } = data;
  const sisteSide = totalt === 0 ? 0 : Math.ceil(totalt / sideStorrelse) - 1;
  const fraNr = totalt === 0 ? 0 : side * sideStorrelse + 1;
  const tilNr = Math.min(totalt, side * sideStorrelse + rader.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <form method="get" action="/admin/turnering" style={{ display: "flex", gap: 8 }}>
        <input type="hidden" name="fane" value="alle" />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 44,
            borderRadius: TL.radius.pill,
            background: TL.dock,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: TL.mute, flex: "none" }}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16 L21 21" />
          </svg>
          <input
            type="search"
            className="v2-focus"
            name="sok"
            defaultValue={sok}
            placeholder="Søk i alle turneringer"
            autoComplete="off"
            aria-label="Søk i alle turneringer"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: TL.text,
            }}
          />
        </div>
        <TlKnapp type="submit">Søk</TlKnapp>
      </form>

      <p style={{ margin: 0, fontSize: 12.5, color: TL.mute }}>
        {totalt === 0
          ? sok
            ? `Ingen turneringer matcher «${sok}»`
            : "Ingen turneringer i basen"
          : `Viser ${fraNr}–${tilNr} av ${totalt.toLocaleString("nb-NO")}${sok ? ` for «${sok}»` : ""}`}
      </p>

      {rader.length === 0 ? (
        <TlRadGruppe>
          <TlTomTilstand
            icon="trophy"
            title={sok ? "Ingen treff" : "Ingen turneringer"}
            sub={sok ? "Prøv et annet søkeord — eller fjern søket for å se hele basen." : "Turneringer dukker opp her når de er importert eller opprettet."}
          />
        </TlRadGruppe>
      ) : (
        <TlRadGruppe>
          {rader.map((r, i) => (
            <TlRad
              key={r.id}
              last={i === rader.length - 1}
              title={<Link href={`/admin/tournaments/${r.id}`} style={{ textDecoration: "none", color: TL.text }}>{r.navn}</Link>}
              sub={`${r.datoTekst}${r.anlegg ? ` · ${r.anlegg}` : ""} · ${r.paameldte} påmeldt`}
              trailing={
                r.kilde ? (
                  <span style={{ fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.kilde}</span>
                ) : undefined
              }
              chevron={false}
            />
          ))}
        </TlRadGruppe>
      )}

      {sisteSide > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          {side > 0 ? (
            <TlKnapp href={sideHref(sok, side - 1)} icon="chevron-left">
              Forrige
            </TlKnapp>
          ) : (
            <span />
          )}
          <span style={{ fontSize: 12, color: TL.mute }}>
            Side {side + 1} av {sisteSide + 1}
          </span>
          {side < sisteSide ? (
            <TlKnapp href={sideHref(sok, side + 1)} icon="chevron-right">
              Neste
            </TlKnapp>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
