"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { svarPaSamlingsinvitasjon, type hentMineSamlingsinvitasjoner } from "@/lib/workbench/samlingsinvitasjon-actions";

type Invitasjon = Awaited<ReturnType<typeof hentMineSamlingsinvitasjoner>>[number];
const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", dateStyle: "long" });
function tid(minutter: number) { return `${String(Math.floor(minutter / 60)).padStart(2, "0")}:${String(minutter % 60).padStart(2, "0")}`; }
function datoKort(value: string) { return dato.format(new Date(`${value}T12:00:00Z`)); }
function klokkeslett(value: string) { return new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export function SamlingsinvitasjonListe({ invitasjoner }: { invitasjoner: Invitasjon[] }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [valgt, setValgt] = useState<string | null>(null);
  const [melding, setMelding] = useState("");

  function svar(id: string, beslutning: "ACCEPTED" | "REJECTED") {
    setValgt(id);
    start(async () => {
      const result = await svarPaSamlingsinvitasjon({ id, beslutning });
      setMelding(result.ok
        ? beslutning === "ACCEPTED" ? "Programmet er lagt inn i Workbench." : "Du er registrert som ikke-deltakende."
        : result.feil);
      setValgt(null);
      router.refresh();
    });
  }

  if (!invitasjoner.length) return <section style={panel}>
    <h2 style={h2}>Ingen ubesvarte invitasjoner</h2>
    <p style={p}>Nye samlingsprogrammer fra gruppene dine vises her.</p>
  </section>;

  return <div style={{ display: "grid", gap: 16 }}>
    {invitasjoner.map(({ id, program, konflikter }) => {
      const startAt = klokkeslett(program.samling.fra);
      const sluttAt = klokkeslett(program.samling.til);
      const fraDato = datoKort(program.samling.fra.slice(0, 10));
      const tilDato = datoKort(program.samling.til.slice(0, 10));
      const collisions = new Map<string, string[]>();
      for (const conflict of konflikter) collisions.set(conflict.sourceSessionId, [...(collisions.get(conflict.sourceSessionId) ?? []), conflict.tittel]);
      return <article key={id} aria-busy={venter && valgt === id} style={panel}>
        <header style={{ display: "grid", gap: 8 }}>
          <p style={{ margin: 0, color: "var(--text-secondary)", font: "var(--type-label-s)" }}>
            {program.samling.kind === "HELDAGSSAMLING" ? "HELDAGSSAMLING" : "SAMLING"} · {fraDato}{fraDato !== tilDato ? ` – ${tilDato}` : ""}
          </p>
          <h2 style={h2}>{program.samling.tittel}</h2>
          <p style={p}>{startAt}–{sluttAt}{program.samling.sted ? ` · ${program.samling.sted}` : ""}</p>
          {program.samling.beskrivelse ? <p style={{ ...p, marginTop: 0 }}>{program.samling.beskrivelse}</p> : null}
          <p style={{ margin: 0, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>{program.okter.length} planlagte økter</p>
        </header>

        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
          {program.okter.map(session => {
            const treff = collisions.get(session.sourceSessionId) ?? [];
            return <section key={session.sourceSessionId} style={oktKort}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ color: "var(--text-primary)", font: "var(--type-heading-s)" }}>{session.title}</strong>
                <span style={{ color: "var(--text-secondary)", font: "var(--type-label-s)", fontVariantNumeric: "tabular-nums" }}>{datoKort(session.date)} · {tid(session.startMinute)} · {session.durationMinutes} min</span>
              </div>
              <p style={{ ...p, margin: "5px 0 0" }}>{[session.maalsetning, session.location, session.skillArea, session.pressureLevel, session.pPosisjoner.join(", "), session.pyramid].filter(Boolean).join(" · ") || "Treningsøkt"}</p>
              {session.drills.length ? <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>
                {session.drills.map(drill => <li key={drill.id}>{drill.title}{drill.description ? ` — ${drill.description}` : ""}</li>)}
              </ul> : null}
              {treff.length ? <p role="status" style={warning}>Kollisjon med: {treff.join(", ")}</p> : null}
            </section>;
          })}
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>
          {collisions.size
            ? "Se markerte kollisjoner før du svarer."
            : "Ingen kalenderkollisjoner funnet."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
          <button type="button" disabled={venter} onClick={() => svar(id, "ACCEPTED")} style={primaryButton}>{venter && valgt === id ? "Lagrer …" : "Godta og legg i Workbench"}</button>
          <button type="button" disabled={venter} onClick={() => svar(id, "REJECTED")} style={secondaryButton}>Jeg deltar ikke</button>
        </div>
      </article>;
    })}
    {melding ? <p role="status" style={{ ...p, fontWeight: 600 }}>{melding}</p> : null}
  </div>;
}

const panel: React.CSSProperties = { display: "grid", gap: 14, padding: 20, border: "1px solid var(--border-default)", borderRadius: 12, background: "var(--surface-card)" };
const oktKort: React.CSSProperties = { display: "grid", gap: 4, padding: 14, border: "1px solid var(--border-hairline)", borderRadius: 8, background: "var(--surface-subtle, var(--surface-card))", minWidth: 0 };
const h2: React.CSSProperties = { margin: 0, color: "var(--text-primary)", font: "var(--type-heading-m)" };
const p: React.CSSProperties = { margin: 0, color: "var(--text-secondary)", font: "var(--type-body-m)", lineHeight: 1.55, overflowWrap: "anywhere" };
const warning: React.CSSProperties = { margin: "8px 0 0", padding: "8px 10px", borderInlineStart: "3px solid var(--border-default)", color: "var(--text-primary)", font: "var(--type-body-s)", background: "var(--surface-card)" };
const primaryButton: React.CSSProperties = { minHeight: 44, padding: "0 16px", border: 0, borderRadius: 8, background: "#141413", color: "#fff", font: "var(--type-label-m)", cursor: "pointer" };
const secondaryButton: React.CSSProperties = { minHeight: 44, padding: "0 16px", border: "1px solid var(--border-default)", borderRadius: 8, background: "transparent", color: "var(--text-primary)", font: "var(--type-label-m)", cursor: "pointer" };
