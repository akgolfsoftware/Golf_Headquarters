"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Gameplan — Train-lock.
 * Fasit: designsystem/train-lock/GP-01 Gameplan baner.dc.html
 * Banebibliotek: kartlagt geometri + spilte baner. Ekte tall, kun TL.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BaneLibraryItem } from "@/lib/gameplan/queries";
import { Kort, Rad, KpiFlis, StatusPill, TomTilstand, Icon } from "@/components/v2";
/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function GameplanV2({ data }: { data: BaneLibraryItem[] }) {
  const _mobile = useMobile();
  const router = useRouter();

  const kartlagte = data.filter((b) => b.hasGeometry).length;
  const sumRunder = data.reduce((s, b) => s + b.playerRounds, 0);

  return (
    <div  data-paper-slug="playerhq-gameplan-liste" data-paper-wave-g="gameplan" data-paper-portal-gameplan style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Gameplan</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Dine baner</span>
        </div>
        {/* Fasit: .merknad — serif på myk flate */}
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.6, margin: "10px 0 0", background: TL.dock, borderRadius: 8, padding: "8px 12px" }}>
          Spredningen din på hver bane du spiller.
        </p>
      </div>

      {/* B: status først (også tom = null-tall) */}
      <div className="grid grid-cols-3" style={{ gap: 16 }}>
        <KpiFlis label="Baner" value={String(data.length || "—")} />
        <KpiFlis label="Kartlagt" value={data.length === 0 ? "—" : String(kartlagte)} />
        <KpiFlis label="Spilte runder" value={data.length === 0 ? "—" : String(sumRunder)} />
      </div>

      {data.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="map-pin"
            title="Ingen baner ennå"
            sub="Logg en runde — banene dine dukker opp her."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 48,
              }}>Start live-føring
              </span>
            </Link>
          </div>
        </Kort>
      ) : (
        <>

          {/* Banebibliotek */}
          <Kort eyebrow="Banebibliotek" action={<span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{data.length} baner</span>}>
            {data.map((b, i) => (
              <Rad
                key={b.id}
                onClick={() => router.push(`/portal/gameplan/${b.id}`)}
                leading={
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flex: "none",
                      borderRadius: 9999,
                      background: TL.dock,
                      border: `1px solid ${TL.hair}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="map-pin" size={15} style={{ color: TL.text }} />
                  </span>
                }
                title={b.navn}
                sub={b.klubb}
                meta={
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {b.hasGeometry ? (
                      <StatusPill tone="up">{b.holesMapped} hull</StatusPill>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", height: 20, boxSizing: "border-box", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute, background: TL.dock, borderRadius: TL.radius.pill, padding: "0 8px" }}>Kommer</span>
                    )}
                    <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{b.playerRounds} runder</span>
                  </span>
                }
                last={i === data.length - 1}
              />
            ))}
          </Kort>
        </>
      )}
    </div>
  );
}
