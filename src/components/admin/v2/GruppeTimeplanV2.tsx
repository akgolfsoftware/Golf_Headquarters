"use client";

/**
 * AgencyOS Gruppe-timeplan — T8 Train-lock.
 * Samme datakontrakt og server-action-skjema som før.
 */

import { useState, useTransition } from "react";
import { TL } from "@/components/admin/precision/grupper/group-kit";
import { TlBadge, TlKort, TlKnapp, TlTittel, TlTomTilstand } from "@/components/admin/precision/grupper/group-kit";
import { gruppeNesteUke } from "@/lib/workbench/group-schedule-time";
import { GruppeFaner } from "./GruppeFaner";

export type TimeplanRad = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  location: string | null;
  recurring: string | null;
  maxParticipants: number | null;
};

export type GruppeTimeplanV2Data = {
  groupId: string;
  navn: string;
  totaltAntall: number;
  faste: TimeplanRad[];
  kommende: TimeplanRad[];
  tidligere: TimeplanRad[];
  focusId: string | null;
};

const NB_WEEKDAY = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const NB_TIME = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });

function varighet(startIso: string, endIso: string): string {
  const min = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (min <= 0) return "—";
  const t = Math.floor(min / 60);
  const m = min % 60;
  if (t === 0) return `${m} min`;
  if (m === 0) return `${t} t`;
  return `${t} t ${m} min`;
}

function storForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const inputStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: "var(--radius-inner)",
  border: `1px solid ${TL.hair}`,
  background: TL.elev,
  color: TL.text,
  padding: "0 10px",
  fontSize: 15,
  width: "100%",
};

function TimeplanSeksjon({
  tittel,
  rader,
  focusId,
  fast = false,
  dempet: _dempet = false,
  onDupliser,
}: {
  tittel: string;
  rader: TimeplanRad[];
  focusId: string | null;
  fast?: boolean;
  dempet?: boolean;
  onDupliser: (scheduleId: string, newStart: string) => Promise<{ ok: true } | { ok: false; feil: string }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 1 }}>
      <h2 style={{ font:"var(--type-title-s)", margin:0, color: TL.text }}>
        {tittel} · {rader.length}
      </h2>
      <TlKort pad="6px 18px">
        {rader.map((s, i) => {
          const erFokus = s.id === focusId;
          const defaultNewStart = gruppeNesteUke(s.startAt);
          return (
            <div
              key={s.id}
              id={`s-${s.id}`}
              style={{
                padding: "14px 0",
                borderBottom: i === rader.length - 1 ? "none" : `1px solid ${TL.hair}`,
                boxShadow: erFokus ? `inset 0 0 0 1px ${TL.text}` : "none",
                borderRadius: erFokus ? 8 : 0,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>{s.title}</span>
                    {fast && s.recurring && (
                      <TlBadge>{s.recurring === "WEEKLY" ? "Ukentlig" : s.recurring}</TlBadge>
                    )}
                  </div>
                  <p style={{ fontSize: 15, color: TL.mute, margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
                    {storForbokstav(NB_WEEKDAY.format(new Date(s.startAt)))} · {NB_TIME.format(new Date(s.startAt))}–
                    {NB_TIME.format(new Date(s.endAt))} · {varighet(s.startAt, s.endAt)}
                    {!fast && ` · ${NB_DATE.format(new Date(s.startAt))}`}
                    {s.location && ` · ${s.location}`}
                    {s.maxParticipants != null && ` · Maks ${s.maxParticipants} deltagere`}
                  </p>
                  {s.description && (
                    <p style={{ fontSize: 15, color: TL.mute, marginTop: 8, maxWidth: "60ch" }}>{s.description}</p>
                  )}
                </div>
                <DupliserTid schedule={s} defaultNewStart={defaultNewStart} onDupliser={onDupliser} />
              </div>
            </div>
          );
        })}
      </TlKort>
    </div>
  );
}

function DupliserTid({ schedule, defaultNewStart, onDupliser }: {
  schedule: TimeplanRad; defaultNewStart: string;
  onDupliser: (id: string, start: string) => Promise<{ ok: true } | { ok: false; feil: string }>;
}) {
  const [pending, start] = useTransition();
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState(false);
  return <form onSubmit={event => {
    event.preventDefault();
    const verdi = String(new FormData(event.currentTarget).get("newStart") ?? "");
    start(async () => {
      try { const svar = await onDupliser(schedule.id, verdi); setFeil(!svar.ok); setMelding(svar.ok ? "Gruppetiden er duplisert." : svar.feil); }
      catch { setFeil(true); setMelding("Kunne ikke duplisere. Tidspunktet er beholdt; prøv igjen."); }
    });
  }} style={{ display:"flex", flexWrap:"wrap", alignItems:"end", gap:12, maxWidth:"100%" }}>
    <label className="group-field">Ny dato og tid<input type="datetime-local" name="newStart" required defaultValue={defaultNewStart} disabled={pending} /></label>
    <TlKnapp type="submit" variant="tertiaer" disabled={pending}>{pending ? "Dupliserer …" : "Dupliser"}</TlKnapp>
    {melding && <p role={feil ? "alert" : "status"}>{melding}</p>}
  </form>;
}

export function GruppeTimeplanV2({
  data,
  onOpprett,
  onDupliser,
}: {
  data: GruppeTimeplanV2Data;
  onOpprett: (fd: FormData) => Promise<{ ok: true } | { ok: false; feil: string }>;
  onDupliser: (scheduleId: string, newStart: string) => Promise<{ ok: true } | { ok: false; feil: string }>;
}) {
  const [opprettFeil, setOpprettFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [opprettet, setOpprettet] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GruppeFaner groupId={data.groupId} aktiv="timeplan" />
      <TlTittel sub={`${data.totaltAntall} tider totalt · ${data.faste.length} faste · ${data.kommende.length} kommende`}>
        {data.navn}
      </TlTittel>

      <TlKort eyebrow="Opprett gruppetrening">
        <form
          onSubmit={event => {
            event.preventDefault();
            const form = event.currentTarget;
            const fd = new FormData(form);
            setOpprettet(false);
            start(async () => {
              try {
                const res = await onOpprett(fd);
                setOpprettFeil(res.ok ? null : res.feil);
                if (res.ok) { form.reset(); setOpprettet(true); }
              } catch { setOpprettFeil("Kunne ikke opprette gruppetreningen. Feltene er beholdt; prøv igjen."); }
            });
          }}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 10 }}
        >
          <label className="group-field">Tittel<input name="title" className="v2-focus" placeholder="Tittel (f.eks. Gruppetrening)" required disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Beskrivelse<input name="description" className="v2-focus" placeholder="Beskrivelse" disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Dato<input type="date" name="dato" className="v2-focus" required disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Klokkeslett · norsk tid<input type="time" name="tid" className="v2-focus" required disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Varighet i minutter<input type="number" name="varighetMin" className="v2-focus" placeholder="Varighet min" defaultValue="60" required disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Sted<input name="location" className="v2-focus" placeholder="Sted" disabled={pending} style={inputStyle} /></label>
          <label className="group-field">Gjentakelse<select disabled={pending} name="recurring" className="v2-focus" style={inputStyle}>
            <option value="NONE">Engang (spesifikt tidspunkt)</option>
            <option value="WEEKLY">Ukentlig</option>
          </select></label>
          <label className="group-field">Maks antall deltakere<input type="number" name="maxParticipants" className="v2-focus" placeholder="Antall deltagere (max)" disabled={pending} style={inputStyle} /></label>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <TlKnapp type="submit" variant="primaer" disabled={pending}>
              {pending ? "Oppretter …" : "Opprett"}
            </TlKnapp>
            {opprettFeil && <span role="alert">{opprettFeil}</span>}
            {opprettet && <span role="status">Gruppetreningen er opprettet.</span>}
          </div>
        </form>
      </TlKort>

      {data.totaltAntall === 0 ? (
        <TlTomTilstand
          icon="calendar"
          title="Ingen faste tider satt"
          sub="Bruk skjemaet over for å legge inn første økt."
        />
      ) : (
        <>
          {data.faste.length > 0 && (
            <TimeplanSeksjon tittel="Faste tider · ukentlig" rader={data.faste} focusId={data.focusId} fast onDupliser={onDupliser} />
          )}
          {data.kommende.length > 0 && (
            <TimeplanSeksjon tittel="Kommende samlinger" rader={data.kommende} focusId={data.focusId} onDupliser={onDupliser} />
          )}
          {data.tidligere.length > 0 && (
            <TimeplanSeksjon tittel="Tidligere" rader={data.tidligere} focusId={data.focusId} dempet onDupliser={onDupliser} />
          )}
        </>
      )}
    </div>
  );
}
