"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Caddie · proaktive forslag (v2). Rekomponert fra
 * src/app/admin/(legacy)/agencyos/caddie/dashbord/caddie-proactive.tsx med
 * v2-biblioteket — samme server actions (kjorCaddieProaktiv/
 * avvisProaktivtForslag), samme statusmelding-flyt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Kort, Knapp, Icon, StatusPill, TomTilstand } from "@/components/v2";
import { avvisProaktivtForslag, kjorCaddieProaktiv } from "@/app/admin/agencyos/caddie/dashbord/actions";

export type ProaktivtForslag = {
  id: string;
  previewText: string;
  spillerName: string;
  dagerInaktiv: number;
};

export function AdminCaddieProaktivV2({ forslag }: { forslag: ProaktivtForslag[] }) {
  const [pending, startTransition] = useTransition();
  const [statusTekst, setStatusTekst] = useState<string | null>(null);

  function kjorNa() {
    startTransition(async () => {
      setStatusTekst(null);
      const res = await kjorCaddieProaktiv();
      if (res.ok) {
        setStatusTekst(`Sjekket nå · ${res.inaktive ?? 0} inaktive funnet · ${res.created ?? 0} nye forslag`);
      } else {
        setStatusTekst(`Kunne ikke kjøre: ${res.reason ?? "ukjent"}`);
      }
    });
  }

  return (
    <div data-paper-wave-h="caddie-proaktiv" data-paper-pattern style={{ display: "contents" }}><Kort>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Icon name="sparkles" size={15} style={{ color: TL.fill }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Proaktive forslag fra Caddie</span>
          <StatusPill tone={forslag.length > 0 ? "warn" : "info"}>
            {forslag.length > 0 ? `${forslag.length} åpne` : "Ingen åpne"}
          </StatusPill>
        </div>
        {/* B: én primær CTA */}
        <Knapp icon={pending ? "loader" : "sparkles"} disabled={pending} onClick={kjorNa}>
          {pending ? "Kjører…" : "Kjør nå"}
        </Knapp>
      </div>

      {statusTekst && (
        <p style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, color: TL.ok }}>
          <Icon name="check" size={13} style={{ color: TL.ok }} /> {statusTekst}
        </p>
      )}

      {forslag.length === 0 ? (
        <TomTilstand
          icon="sparkles"
          title="Ingen åpne forslag"
          sub="Caddie skanner automatisk etter inaktive spillere — trykk «Kjør nå» for å sjekke med en gang."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forslag.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, border: `1px solid ${TL.hair}`, padding: "10px 14px" }}>
              <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.4, color: TL.text }}>{f.previewText}</span>
              <div style={{ display: "flex", flex: "none", alignItems: "center", gap: 8 }}>
                <Link
                  href={`/admin/agencyos/caddie?seed=${encodeURIComponent(
                    `Hjelp meg å sende en oppfølgingsmelding til ${f.spillerName} som har vært inaktiv i ${f.dagerInaktiv} dager.`,
                  )}`}
                  className="v2-press v2-focus"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, background: TL.fill, padding: "5px 11px",
                    fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: TL.onFill, textDecoration: "none",
                  }}
                >
                  Åpne i samtale <Icon name="arrow-right" size={11} style={{ color: TL.onFill }} />
                </Link>
                <AvvisKnapp id={f.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Kort></div>
  );
}

function AvvisKnapp({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(async () => { await avvisProaktivtForslag(id); })}
      disabled={pending}
      aria-label="Avvis forslag"
      className="v2-press v2-focus"
      style={{
        width: 28, height: 28, borderRadius: 9999, border: `1px solid ${TL.hair}`, background: "none", color: TL.mute, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: pending ? 0.5 : 1,
      }}
    >
      <Icon name={pending ? "loader" : "x"} size={13} className={pending ? "animate-spin" : undefined} />
    </button>
  );
}
