"use client";

/**
 * AgencyOS Gruppe-timeplan — T8 Train-lock.
 * Samme datakontrakt og server-action-skjema som før.
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { TlBadge, TlKort, TlKnapp, TlTittel, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
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
  height: 36,
  borderRadius: 8,
  border: `1px solid ${TL.hair}`,
  background: TL.elev,
  color: TL.text,
  padding: "0 10px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

function TimeplanSeksjon({
  tittel,
  rader,
  focusId,
  fast = false,
  dempet = false,
  onDupliser,
}: {
  tittel: string;
  rader: TimeplanRad[];
  focusId: string | null;
  fast?: boolean;
  dempet?: boolean;
  onDupliser: (scheduleId: string, newStart: string) => Promise<void>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: dempet ? 0.7 : 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
        {tittel} · {rader.length}
      </div>
      <TlKort pad="6px 18px">
        {rader.map((s, i) => {
          const erFokus = s.id === focusId;
          const defaultNewStart = new Date(new Date(s.startAt).getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16);
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
                  <p style={{ fontSize: 12, color: TL.mute, margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
                    {storForbokstav(NB_WEEKDAY.format(new Date(s.startAt)))} · {NB_TIME.format(new Date(s.startAt))}–
                    {NB_TIME.format(new Date(s.endAt))} · {varighet(s.startAt, s.endAt)}
                    {!fast && ` · ${NB_DATE.format(new Date(s.startAt))}`}
                    {s.location && ` · ${s.location}`}
                    {s.maxParticipants != null && ` · Maks ${s.maxParticipants} deltagere`}
                  </p>
                  {s.description && (
                    <p style={{ fontSize: 13, color: TL.mute, marginTop: 8, maxWidth: "60ch" }}>{s.description}</p>
                  )}
                </div>
                <form
                  action={async (fd: FormData) => {
                    const newStart = fd.get("newStart") as string;
                    await onDupliser(s.id, newStart);
                  }}
                  style={{ display: "flex", alignItems: "flex-end", gap: 6 }}
                >
                  <input type="datetime-local" name="newStart" required defaultValue={defaultNewStart} style={{ ...inputStyle, width: 180 }} />
                  <TlKnapp type="submit" variant="tertiaer">
                    Dupliser
                  </TlKnapp>
                </form>
              </div>
            </div>
          );
        })}
      </TlKort>
    </div>
  );
}

export function GruppeTimeplanV2({
  data,
  onOpprett,
  onDupliser,
}: {
  data: GruppeTimeplanV2Data;
  onOpprett: (fd: FormData) => Promise<{ ok: true } | { ok: false; feil: string }>;
  onDupliser: (scheduleId: string, newStart: string) => Promise<void>;
}) {
  const [opprettFeil, setOpprettFeil] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GruppeFaner groupId={data.groupId} aktiv="timeplan" />
      <TlTittel sub={`${data.totaltAntall} tider totalt · ${data.faste.length} faste · ${data.kommende.length} kommende`}>
        {data.navn}
      </TlTittel>

      <TlKort eyebrow="Opprett gruppetrening">
        <form
          action={async (fd: FormData) => {
            const res = await onOpprett(fd);
            setOpprettFeil(res.ok ? null : res.feil);
          }}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 10 }}
        >
          <input name="title" placeholder="Tittel (f.eks. Gruppetrening)" required style={inputStyle} />
          <input name="description" placeholder="Beskrivelse" style={inputStyle} />
          <input type="date" name="dato" required style={inputStyle} />
          <input type="time" name="tid" required style={inputStyle} />
          <input type="number" name="varighetMin" placeholder="Varighet min" defaultValue="60" required style={inputStyle} />
          <input name="location" placeholder="Sted" style={inputStyle} />
          <select name="recurring" style={inputStyle}>
            <option value="NONE">Engang (spesifikt tidspunkt)</option>
            <option value="WEEKLY">Ukentlig</option>
          </select>
          <input type="number" name="maxParticipants" placeholder="Antall deltagere (max)" style={inputStyle} />
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <TlKnapp type="submit" variant="primaer">
              Opprett
            </TlKnapp>
            {opprettFeil && <span style={{ fontSize: 13, color: TL.danger }}>{opprettFeil}</span>}
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
