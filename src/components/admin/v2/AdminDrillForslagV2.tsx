"use client";

/**
 * AgencyOS — AI drill-forslag (v2, retning C «Presis»). Rekomponering av
 * /admin/drills/forslag (`ForslagListe`) med BEVART funksjon: samme
 * `godkjennDrillForslag`/`avvisDrillForslag`-actions (uendret).
 *
 * Fikser en liten gap i samme slengen: `videoUrl` fra CaddieDraft-forslaget
 * går nå gjennom `safeUrl()` (S-21) i loaderen før den når klienten — legacy
 * rendret rå DB-URL direkte i en href.
 *
 * Bygget av v2-komponenter. Ingen ad-hoc UI, ingen rå hex (kun T.*).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { T, Caps, Tittel, Kort, Bit, TomTilstand, Knapp, CTAPill, ValideringsChip } from "@/components/v2";
import { godkjennDrillForslag, avvisDrillForslag } from "@/app/admin/(legacy)/drills/forslag/actions";

export type ForslagRad = {
  id: string;
  navn: string;
  beskrivelse: string;
  omraade: string;
  varighetMin: number | null;
  videoUrl: string | null;
};

export function AdminDrillForslagV2({ forslag }: { forslag: ForslagRad[] }) {
  const [rader, setRader] = useState(forslag);
  const [pending, startTransition] = useTransition();
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handle(id: string, godkjenn: boolean) {
    setFeil(null);
    setAktiv(id);
    startTransition(async () => {
      const res = godkjenn ? await godkjennDrillForslag(id) : await avvisDrillForslag(id);
      if (res.ok) setRader((r) => r.filter((x) => x.id !== id));
      else setFeil(res.melding);
      setAktiv(null);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Planlegge · Drill-bibliotek</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="forslag.">AI drill-</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8 }}>
          {rader.length} forslag venter på godkjenning. Godkjente driller legges i biblioteket.
        </p>
      </div>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      {rader.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="sparkles"
            title="Ingen forslag venter"
            sub="Kjør drill-forslag-agenten fra AI-agenter for å generere nye."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/admin/agents" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="arrow-right">AI-agenter</CTAPill>
            </Link>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rader.map((d) => (
            <Kort key={d.id}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{d.navn}</span>
                    <Bit monoTekst>{d.omraade}{d.varighetMin ? ` · ${d.varighetMin} min` : ""}</Bit>
                  </div>
                  <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, whiteSpace: "pre-line" }}>
                    {d.beskrivelse}
                  </p>
                  {d.videoUrl && (
                    <a href={d.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.lime }}>
                      Se video
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flex: "none" }}>
                  <Knapp icon="check" onClick={() => handle(d.id, true)} disabled={pending && aktiv === d.id}>Godkjenn</Knapp>
                  <Knapp ghost icon="x" onClick={() => handle(d.id, false)} disabled={pending && aktiv === d.id}>Avvis</Knapp>
                </div>
              </div>
            </Kort>
          ))}
        </div>
      )}
    </div>
  );
}
