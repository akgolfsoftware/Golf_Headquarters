"use client";

/**
 * AgencyOS v2 — AI drill-forslag (`/admin/drills/forslag`, AgencyOS Bølge 1.2, 2026-07-14).
 * Port fra `(legacy)/drills/forslag/page.tsx` + `forslag-liste.tsx` — samme
 * `CaddieDraft`/`godkjennDrillForslag`/`avvisDrillForslag`-kontrakt, ny v2-presentasjon
 * (`Kort`-rader i stedet for rå Tailwind-kort).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, Icon, T } from "@/components/v2";
import { godkjennDrillForslag, avvisDrillForslag } from "@/app/admin/(legacy)/drills/forslag/actions";

export interface ForslagRad {
  id: string;
  navn: string;
  beskrivelse: string;
  omraade: string;
  varighetMin: number | null;
  videoUrl: string | null;
}

export function AdminDrillForslagV2({ forslag, tilbakeHref }: { forslag: ForslagRad[]; tilbakeHref: string }) {
  const [rader, setRader] = useState(forslag);
  const [pending, startTransition] = useTransition();
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const handle = (id: string, godkjenn: boolean) => {
    setFeil(null);
    setAktiv(id);
    startTransition(async () => {
      const res = godkjenn ? await godkjennDrillForslag(id) : await avvisDrillForslag(id);
      if (res.ok) setRader((r) => r.filter((x) => x.id !== id));
      else setFeil(res.melding);
      setAktiv(null);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Planlegge · Drill-bibliotek</Caps>
          <Tittel em="drill-forslag">AI</Tittel>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>
            {rader.length} forslag venter på godkjenning. Godkjente driller legges i biblioteket.
          </div>
        </div>
        <Link href={tilbakeHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="arrow-left" size={12} /> Til biblioteket
        </Link>
      </div>

      {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

      {rader.length === 0 ? (
        <Kort>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0 }}>
            Ingen forslag venter. Kjør drill-forslag-agenten fra <Link href="/admin/agents" style={{ color: T.lime }}>AI-agenter</Link> for å generere nye.
          </p>
        </Kort>
      ) : (
        rader.map((d) => (
          <Kort key={d.id}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{d.navn}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut, background: T.panel2, borderRadius: 9999, padding: "3px 9px" }}>
                    {d.omraade}{d.varighetMin ? ` · ${d.varighetMin} min` : ""}
                  </span>
                </div>
                <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut, whiteSpace: "pre-line" }}>{d.beskrivelse}</p>
                {d.videoUrl && (
                  <a href={d.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.lime, textDecoration: "none" }}>
                    <Icon name="play" size={13} /> Se video
                  </a>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flex: "none" }}>
                <Knapp icon="check" onClick={() => handle(d.id, true)} disabled={pending && aktiv === d.id}>Godkjenn</Knapp>
                <Knapp ghost icon="x" onClick={() => handle(d.id, false)} disabled={pending && aktiv === d.id}>Avvis</Knapp>
              </div>
            </div>
          </Kort>
        ))
      )}
    </div>
  );
}
