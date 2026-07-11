"use client";

/**
 * AgencyOS Gruppe-timeplan — v2. Full ukentlig timeplan for én gruppe
 * (faste tider / kommende / tidligere). `?focus=<scheduleId>` framhever én
 * rad. Dupliser-skjemaet er en ren server-action-form (uncontrolled native
 * inputs, styles med T-tokens) — samme kontrakt som legacy.
 */

import { Caps, Kort, Knapp, StatusPill, MikroMeta, TomTilstand } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

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

const NB_WEEKDAY = new Intl.DateTimeFormat("nb-NO", { weekday: "long" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" });
const NB_TIME = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });

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
  border: `1px solid ${T.border}`,
  background: T.panel,
  color: T.fg,
  padding: "0 10px",
  fontFamily: T.ui,
  fontSize: 12.5,
  outline: "none",
  width: "100%",
};

/* ── Seksjon ───────────────────────────────────────────────────────── */

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
      <MikroMeta icon="calendar">
        {tittel} · {rader.length}
      </MikroMeta>
      <Kort pad="6px 18px">
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
                borderBottom: i === rader.length - 1 ? "none" : `1px solid ${T.border}`,
                borderRadius: erFokus ? 8 : 0,
                outline: erFokus ? `1px solid ${T.lime}` : "none",
                outlineOffset: erFokus ? 4 : 0,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>{s.title}</span>
                    {fast && s.recurring && <StatusPill tone="info">{s.recurring === "WEEKLY" ? "UKENTLIG" : s.recurring}</StatusPill>}
                  </div>
                  <p style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, margin: "6px 0 0" }}>
                    {storForbokstav(NB_WEEKDAY.format(new Date(s.startAt)))} · {NB_TIME.format(new Date(s.startAt))}–
                    {NB_TIME.format(new Date(s.endAt))} · {varighet(s.startAt, s.endAt)}
                    {!fast && ` · ${NB_DATE.format(new Date(s.startAt))}`}
                    {s.location && ` · ${s.location}`}
                    {s.maxParticipants && ` · Max ${s.maxParticipants} deltagere`}
                  </p>
                  {s.description && (
                    <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8, maxWidth: "60ch" }}>{s.description}</p>
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
                  <Knapp type="submit" ghost>
                    Dupliser
                  </Knapp>
                </form>
              </div>
            </div>
          );
        })}
      </Kort>
    </div>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function GruppeTimeplanV2({
  data,
  onOpprett,
  onDupliser,
}: {
  data: GruppeTimeplanV2Data;
  onOpprett: (fd: FormData) => Promise<void>;
  onDupliser: (scheduleId: string, newStart: string) => Promise<void>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Grupper · {data.navn}</Caps>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
          {data.totaltAntall} tider totalt · {data.faste.length} faste · {data.kommende.length} kommende
        </p>
      </div>

      {/* Opprett gruppetrening */}
      <Kort eyebrow="Opprett gruppetrening">
        <form action={onOpprett} className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
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
          <div style={{ gridColumn: "1 / -1" }}>
            <Knapp type="submit">Opprett</Knapp>
          </div>
        </form>
      </Kort>

      {data.totaltAntall === 0 ? (
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen faste tider satt"
            sub="Bruk skjemaet over for å legge inn første økt (støtter tidspunkt, antall deltagere, duplisering via knapp under)."
          />
        </Kort>
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
