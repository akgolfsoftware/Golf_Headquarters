"use client";

/**
 * Caddie · proaktive forslag (v2). Rekomponert fra
 * src/app/admin/(legacy)/agencyos/caddie/dashbord/caddie-proactive.tsx med
 * v2-biblioteket — samme server actions (kjorCaddieProaktiv/
 * avvisProaktivtForslag), samme statusmelding-flyt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Kort, Knapp, Icon, T } from "@/components/v2";
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
    <Kort>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="sparkles" size={15} style={{ color: T.lime }} />
          <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>Proaktive forslag fra Caddie</span>
        </div>
        <Knapp icon={pending ? "loader" : "sparkles"} disabled={pending} onClick={kjorNa}>
          {pending ? "Kjører…" : "Kjør nå"}
        </Knapp>
      </div>

      {statusTekst && (
        <p style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, color: T.up }}>
          <Icon name="check" size={13} style={{ color: T.up }} /> {statusTekst}
        </p>
      )}

      {forslag.length === 0 ? (
        <div style={{ borderRadius: 12, border: `1px dashed ${T.border}`, padding: "20px 16px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
          Ingen åpne forslag. Caddie skanner automatisk etter inaktive spillere og legger forslag her — trykk «Kjør nå» for å sjekke med en gang.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forslag.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, border: `1px solid ${T.border}`, padding: "10px 14px" }}>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.4, color: T.fg }}>{f.previewText}</span>
              <div style={{ display: "flex", flex: "none", alignItems: "center", gap: 8 }}>
                <Link
                  href={`/admin/agencyos/caddie?seed=${encodeURIComponent(
                    `Hjelp meg å sende en oppfølgingsmelding til ${f.spillerName} som har vært inaktiv i ${f.dagerInaktiv} dager.`,
                  )}`}
                  className="v2-press v2-focus"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, background: T.lime, padding: "5px 11px",
                    fontFamily: T.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: T.onLime, textDecoration: "none",
                  }}
                >
                  Åpne i samtale <Icon name="arrow-right" size={11} style={{ color: T.onLime }} />
                </Link>
                <AvvisKnapp id={f.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Kort>
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
        width: 28, height: 28, borderRadius: 9999, border: `1px solid ${T.border}`, background: "none", color: T.mut, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: pending ? 0.5 : 1,
      }}
    >
      <Icon name={pending ? "loader" : "x"} size={13} className={pending ? "animate-spin" : undefined} />
    </button>
  );
}
