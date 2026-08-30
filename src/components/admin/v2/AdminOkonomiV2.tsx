"use client";

/**
 * AgencyOS Økonomi — Train-lock (C10).
 * Fasit: designsystem/train-lock/EC-01 Økonomi.dc.html
 *
 * Fasit: designsystem/train-lock/EC-01 Økonomi.dc.html.
 *
 * FORFALT = eneste danger (TL.danger). Øvrige statuser mute. Tripletex-tall
 * som mangler = «mangler». Reports flettes inn nederst. Ingen simulator-omsetning.
 */

import { useEffect, useState } from "react";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import { AdminReportsV2 } from "@/components/admin/v2/AdminReportsV2";
import type { AdminOkonomiV2Data, OkonomiFaktura, OkonomiTimeklipp } from "@/lib/admin/okonomi-data";
import {
  erForfalt,
  fmtKrNb,
  klippPrikker,
  ytdAvvik,
  ytdAvvikTekst,
  ytdBarPct,
} from "@/lib/admin/okonomi-visning";

export type { AdminOkonomiV2Data, OkonomiFaktura, OkonomiTimeklipp };

function CapsLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: color ?? TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function YtdKort({ data, stor }: { data: AdminOkonomiV2Data; stor?: boolean }) {
  const { budsjettKr, resultatKr } = data.ytd;
  const tak = [budsjettKr, resultatKr].filter((v): v is number => v != null).reduce((a, b) => Math.max(a, b), 0);
  const avvik = ytdAvvik(budsjettKr, resultatKr);
  const budsjettPct = ytdBarPct(budsjettKr, tak || null);
  const resultatPct = ytdBarPct(resultatKr, tak || null);

  const linje = (label: string, verdi: string, pct: number | null, fyll: string) => (
    <div>
      {stor ? (
        <>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: TL.text }}>
            {verdi}
          </div>
          <div style={{ marginTop: 6 }}>
            <CapsLabel>{label}</CapsLabel>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: TL.mute }}>{label}</span>
          <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>{verdi}</span>
        </div>
      )}
      <div style={{ marginTop: stor ? 12 : 8, height: 3, borderRadius: 2, background: TL.dim, overflow: "hidden" }}>
        <div
          style={{
            width: pct == null ? "0%" : `${pct}%`,
            height: "100%",
            background: fyll,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: stor ? 24 : 20 }}>
      <CapsLabel>YTD · {data.aar}</CapsLabel>
      {!data.visKroner ? (
        <p style={{ margin: "14px 0 0", fontSize: 13, color: TL.mute }}>Ingen tilgang til kronetall.</p>
      ) : (
        <>
          <div style={{ marginTop: stor ? 16 : 14, display: stor ? "grid" : "block", gridTemplateColumns: stor ? "1fr 1fr" : undefined, gap: stor ? 24 : undefined }}>
            {linje("Budsjett", fmtKrNb(budsjettKr), budsjettPct, TL.mute)}
            <div style={{ marginTop: stor ? 0 : 14 }}>{linje("Resultat", fmtKrNb(resultatKr), resultatPct, TL.fill)}</div>
          </div>
          <div style={{ marginTop: stor ? 16 : 14, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {ytdAvvikTekst(avvik)}
            {!data.tripletexKonfigurert
              ? " · Tripletex er ikke koblet."
              : resultatKr == null
                ? " · Tripletex-tall mangler."
                : null}
            {!data.hull.budsjettkilde ? " · Ingen budsjettkilde." : null}
          </div>
        </>
      )}
    </div>
  );
}

function FakturaListe({ rader, stor }: { rader: OkonomiFaktura[]; stor?: boolean }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: stor ? "8px 24px" : "4px 20px" }}>
      <div style={{ padding: stor ? "16px 0 10px" : "14px 0 10px" }}>
        <CapsLabel>Faktura</CapsLabel>
      </div>
      {rader.length === 0 ? (
        <p style={{ margin: "0 0 16px", fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>Ingen fakturaer å vise.</p>
      ) : (
        rader.map((f) => {
          const forfalt = erForfalt(f.status);
          return (
            <div
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: stor ? 16 : 12,
                padding: stor ? "14px 0" : "13px 0",
                borderTop: `1px solid ${TL.hair}`,
              }}
            >
              {stor && (
                <span style={{ width: 84, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{f.dato}</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{f.navn}</div>
                <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {stor ? f.beskrivelse : `${f.dato} · ${f.beskrivelse ?? ""}`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
                  {fmtKrNb(f.belopKr)}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: forfalt ? TL.danger : TL.mute,
                  }}
                >
                  {f.status}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function TimeklippKort({ rader, fulltNavn }: { rader: OkonomiTimeklipp[]; fulltNavn?: boolean }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <CapsLabel>Timeklipp</CapsLabel>
      {rader.length === 0 ? (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: TL.mute }}>Ingen klipp registrert.</p>
      ) : (
        rader.map((k) => {
          const prikker = klippPrikker(k.brukt, k.totalt);
          return (
            <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", marginTop: 6 }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text }}>{fulltNavn ? k.navn : k.fornavn}</span>
              {prikker.length > 0 && (
                <span style={{ display: "flex", gap: 4 }} aria-hidden>
                  {prikker.map((fylt, i) => (
                    <span
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: fylt ? TL.text : TL.dim,
                      }}
                    />
                  ))}
                </span>
              )}
              <span style={{ width: 52, textAlign: "right", fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {k.brukt} av {k.totalt}
              </span>
            </div>
          );
        })
      )}
      <div style={{ marginTop: 10, fontSize: 13, color: TL.mute }}>Klipp hos coach · ikke app-nivå</div>
    </div>
  );
}

function useWide(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${TL_BREKK.macRail}px)`);
    const oppdater = () => setWide(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return wide;
}

export function AdminOkonomiV2({ data }: { data: AdminOkonomiV2Data }) {
  const wide = useWide();
  useEffect(() => {
    if (window.location.hash !== "#rapporter") return;
    document.getElementById("rapporter")?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div data-screen="EC-01" style={{ display: "flex", flexDirection: "column", width: "100%", background: TL.scene }}>
      <div>
        <CapsLabel>Mer · Academy</CapsLabel>
        <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: TL.text }}>
          Økonomi
        </h1>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ marginTop: 18, gap: 16, alignItems: "start" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <YtdKort data={data} stor={wide} />
          <div className="hidden md:block">
            <TimeklippKort rader={data.timeklipp} fulltNavn />
          </div>
        </div>
        <FakturaListe rader={data.fakturaer} stor={wide} />
      </div>

      <div className="md:hidden" style={{ marginTop: 12 }}>
        <TimeklippKort rader={data.timeklipp} />
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 13, color: TL.mute }}>
        Alle beløp eks. mva · credits = timeklipp, aldri app-tier. Booking til faktura er ikke bygd (Invoice-modell mangler) —
        Forfalt leses fra Stripe.
      </p>

      <div style={{ marginTop: 12 }}>
        <a
          href={data.stripeHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: TL.mute, textDecoration: "underline" }}
        >
          Åpne Stripe
        </a>
      </div>

      {data.visRapporter && data.rapporter && (
        <div id="rapporter" style={{ marginTop: 28 }}>
          <AdminReportsV2 data={data.rapporter} innfelt />
        </div>
      )}
    </div>
  );
}
