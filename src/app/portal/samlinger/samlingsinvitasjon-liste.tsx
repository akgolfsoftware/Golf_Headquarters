"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SkraKort, SkraTom } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-samlinger.css";
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

  if (!invitasjoner.length) return <SkraKort tittel="Ingen ubesvarte invitasjoner">
    <SkraTom>Nye samlingsprogrammer fra gruppene dine vises her.</SkraTom>
  </SkraKort>;

  return <div className="phn-sam-liste">
    {invitasjoner.map(({ id, program, konflikter }) => {
      const startAt = klokkeslett(program.samling.fra);
      const sluttAt = klokkeslett(program.samling.til);
      const fraDato = datoKort(program.samling.fra.slice(0, 10));
      const tilDato = datoKort(program.samling.til.slice(0, 10));
      const collisions = new Map<string, string[]>();
      for (const conflict of konflikter) collisions.set(conflict.sourceSessionId, [...(collisions.get(conflict.sourceSessionId) ?? []), conflict.tittel]);
      const meta = `${program.samling.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling"} · ${fraDato}${fraDato !== tilDato ? ` – ${tilDato}` : ""}`;
      return <SkraKort key={id} tittel={program.samling.tittel} meta={meta}>
        <div className="phn-sam" aria-busy={venter && valgt === id}>
          <p className="phn-sam-tekst">{startAt}–{sluttAt}{program.samling.sted ? ` · ${program.samling.sted}` : ""}</p>
          {program.samling.beskrivelse ? <p className="phn-sam-tekst">{program.samling.beskrivelse}</p> : null}
          <p className="phn-sam-liten">{program.okter.length} planlagte økter</p>

          <div className="phn-sam-okter">
            {program.okter.map(session => {
              const treff = collisions.get(session.sourceSessionId) ?? [];
              return <section key={session.sourceSessionId} className="phn-sam-okt">
                <div className="phn-sam-okt-topp">
                  <strong>{session.title}</strong>
                  <span>{datoKort(session.date)} · {tid(session.startMinute)} · {session.durationMinutes} min</span>
                </div>
                <p className="phn-sam-tekst">{[session.maalsetning, session.location, session.skillArea, session.pressureLevel, session.pPosisjoner.join(", "), session.pyramid].filter(Boolean).join(" · ") || "Treningsøkt"}</p>
                {session.drills.length ? <ul>
                  {session.drills.map(drill => <li key={drill.id}>{drill.title}{drill.description ? ` — ${drill.description}` : ""}</li>)}
                </ul> : null}
                {treff.length ? <p role="status" className="phn-sam-kollisjon">Kollisjon med: {treff.join(", ")}</p> : null}
              </section>;
            })}
          </div>
          <p className="phn-sam-liten">
            {collisions.size
              ? "Se markerte kollisjoner før du svarer."
              : "Ingen kalenderkollisjoner funnet."}
          </p>
          <div className="phn-sam-knapper">
            <button type="button" disabled={venter} onClick={() => svar(id, "ACCEPTED")} className="phn-sam-pri">{venter && valgt === id ? "Lagrer …" : "Godta og legg i Workbench"}</button>
            <button type="button" disabled={venter} onClick={() => svar(id, "REJECTED")} className="phn-sam-sek">Jeg deltar ikke</button>
          </div>
        </div>
      </SkraKort>;
    })}
    {melding ? <p role="status" className="phn-sam-melding">{melding}</p> : null}
  </div>;
}
