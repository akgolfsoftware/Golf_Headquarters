"use client";

/**
 * PlayerHQ Coach-videoer — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useEffect, useState } from "react";
import { getSignedVideoUrl } from "@/lib/storage/video";
import Link from "next/link";
import { T, Caps, Tittel, Kort, VideoKort, TomTilstand } from "@/components/v2";

/* ── Datakontrakt (speiler prisma.sessionVideo, status READY) ──────────── */

export type CoachVideoItem = {
  id: string;
  title: string;
  tag: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  createdAt: Date;
  coachName: string;
};

export type CoachVideoerData = {
  videoer: CoachVideoItem[];
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────────── */

function datoTekst(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

/** durationSec → «1:30» (mm:ss). Null når lengde ikke er kjent. */
function varighetTekst(sek: number | null): string | null {
  if (sek == null || sek <= 0) return null;
  const m = Math.floor(sek / 60);
  const s = sek % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Fornavn fra fullt navn (for tittel-em). */
function fornavn(navn: string): string {
  return navn.trim().split(/\s+/)[0] ?? navn;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
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

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function CoachVideoerV2({ data }: { data: CoachVideoerData }) {
  const mobile = useMobile();
  const { videoer } = data;

  // Hvilken video som åpnes akkurat nå + ev. feil per video.
  const [aapnerId, setAapnerId] = useState<string | null>(null);
  const [feil, setFeil] = useState<{ id: string; melding: string } | null>(null);

  async function spillAv(id: string) {
    setFeil(null);
    setAapnerId(id);
    try {
      const url = await getSignedVideoUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setFeil({ id, melding: err instanceof Error ? err.message : "Kunne ikke åpne" });
    } finally {
      setAapnerId(null);
    }
  }

  // Tittel-em: én coach → fornavnet; flere/ingen → nøytralt.
  const coachNavn = Array.from(new Set(videoer.map((v) => v.coachName)));
  const em = coachNavn.length === 1 ? fornavn(coachNavn[0]) : "coachen din";

  return (
    <div data-paper-wave-g="coachvideoer" data-paper-portal-coach-videoer style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Videoer</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>Coach</span>
        </div>
      </div>

      {/* Grid / tom-tilstand */}
      {videoer.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="video"
            title="Ingen videoer ennå"
            sub="Coachen deler swing-analyser og drill-demo her."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/coach/melding" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 14, fontWeight: 600,
          }}>Spør coach om video</span>
            </Link>
          </div>
        </Kort>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
          {videoer.map((v) => (
            <VideoKort
              key={v.id}
              title={v.title}
              coach={v.coachName}
              tag={v.tag}
              dato={datoTekst(v.createdAt)}
              varighet={varighetTekst(v.durationSec)}
              thumbnailUrl={v.thumbnailUrl}
              onClick={() => spillAv(v.id)}
              pending={aapnerId === v.id}
              error={feil?.id === v.id ? feil.melding : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
