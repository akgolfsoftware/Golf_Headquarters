"use client";

/**
 * AG-16 Gruppa › Faste tider i nytt design — /admin/grupper/[id]/timeplan.
 * Fasit: docs/design-system/utkast-agencyos/mer.html (Gruppa) og byggeklossene i
 * agencyos-ny. Erstatter GruppeTimeplanV2 (Train-lock) med samme data og de samme
 * server-handlingene: opprett gruppetrening og dupliser en tid.
 */
import { useState, useTransition } from "react";
import { Knapp, Pille, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import { datoTilOsloLokal } from "@/lib/admin/gruppe-tid";
import "@/styles/agencyos-ny-mer.css";

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

export type GruppeTimeplanData = {
  groupId: string;
  navn: string;
  totaltAntall: number;
  faste: TimeplanRad[];
  kommende: TimeplanRad[];
  tidligere: TimeplanRad[];
  focusId: string | null;
};

const UKEDAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long" });
const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const KL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });

function varighet(startIso: string, endIso: string): string {
  const min = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (min <= 0) return "—";
  const t = Math.floor(min / 60);
  const m = min % 60;
  return t === 0 ? `${m} min` : m === 0 ? `${t} t` : `${t} t ${m} min`;
}

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Rad({ s, fast, fokus, onDupliser }: { s: TimeplanRad; fast: boolean; fokus: boolean; onDupliser: (id: string, ny: string) => Promise<void> }) {
  const [apen, setApen] = useState(false);
  const [pending, start] = useTransition();
  const forslag = datoTilOsloLokal(new Date(new Date(s.startAt).getTime() + 7 * 86_400_000));
  const start0 = new Date(s.startAt);
  return (
    <div id={`s-${s.id}`} style={{ display: "grid", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--sand-300)", outline: fokus ? "2px solid var(--graphite-900)" : undefined, outlineOffset: -2 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, minWidth: 0 }}>
        <b className="undertittel" style={{ overflowWrap: "anywhere" }}>{s.title}</b>
        {fast && s.recurring && <Pille>{s.recurring === "WEEKLY" ? "Ukentlig" : s.recurring}</Pille>}
      </div>
      <p className="kilde mono" style={{ margin: 0 }}>
        {stor(UKEDAG.format(start0))} · {KL.format(start0)}–{KL.format(new Date(s.endAt))} · {varighet(s.startAt, s.endAt)}
        {!fast && ` · ${DATO.format(start0)}`}
        {s.location && ` · ${s.location}`}
        {s.maxParticipants != null && ` · maks ${s.maxParticipants}`}
      </p>
      {s.description && <p className="forklar" style={{ margin: 0 }}>{s.description}</p>}
      {!apen ? (
        <div className="knapper"><Knapp variant="spok" onClick={() => setApen(true)}>Dupliser</Knapp></div>
      ) : (
        <form style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 8 }} onSubmit={(e) => {
          e.preventDefault();
          const ny = new FormData(e.currentTarget).get("newStart") as string;
          start(async () => { await onDupliser(s.id, ny); setApen(false); });
        }}>
          <label className="felt" style={{ flex: "1 1 220px", minWidth: 0 }}><span className="etikett">Ny start</span>
            <input type="datetime-local" name="newStart" required defaultValue={forslag} /></label>
          <div className="knapper">
            <Knapp type="submit" disabled={pending}>{pending ? "Dupliserer …" : "Dupliser"}</Knapp>
            <Knapp variant="spok" onClick={() => setApen(false)}>Avbryt</Knapp>
          </div>
        </form>
      )}
    </div>
  );
}

function Liste({ tittel, rader, fast, dempet, focusId, onDupliser }: { tittel: string; rader: TimeplanRad[]; fast?: boolean; dempet?: boolean; focusId: string | null; onDupliser: (id: string, ny: string) => Promise<void> }) {
  if (rader.length === 0) return null;
  return (
    <Seksjon tittel={`${tittel} · ${rader.length}`}>
      <div className="kort rader" style={{ padding: 0, gap: 0, overflow: "hidden", opacity: dempet ? 0.75 : 1 }}>
        {rader.map((s) => <Rad key={s.id} s={s} fast={!!fast} fokus={s.id === focusId} onDupliser={onDupliser} />)}
      </div>
    </Seksjon>
  );
}

export function AG16Timeplan({ data, onOpprett, onDupliser }: {
  data: GruppeTimeplanData;
  onOpprett: (fd: FormData) => Promise<{ ok: true } | { ok: false; feil: string }>;
  onDupliser: (scheduleId: string, newStart: string) => Promise<void>;
}) {
  const [feil, setFeil] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <div className="teller-rad">
        <div className="teller"><span className="e">Tider</span><b className="t">{data.totaltAntall}</b></div>
        <div className="teller"><span className="e">Faste</span><b className="t">{data.faste.length}</b></div>
        <div className="teller"><span className="e">Kommende</span><b className="t">{data.kommende.length}</b></div>
      </div>
      <div className="to-del bred-v">
        <div>
          {data.totaltAntall === 0
            ? <Tom tittel="Ingen faste tider" tekst="Legg inn første økt i skjemaet." />
            : <>
              <Liste tittel="Faste tider · ukentlig" rader={data.faste} fast focusId={data.focusId} onDupliser={onDupliser} />
              <Liste tittel="Kommende samlinger" rader={data.kommende} focusId={data.focusId} onDupliser={onDupliser} />
              <Liste tittel="Tidligere" rader={data.tidligere} dempet focusId={data.focusId} onDupliser={onDupliser} />
            </>}
        </div>
        <div>
          <Seksjon tittel="Ny gruppetrening">
            <form className="kort" style={{ display: "grid", gap: 12 }} onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              setOk(false);
              start(async () => {
                const r = await onOpprett(fd);
                setFeil(r.ok ? null : r.feil);
                if (r.ok) { setOk(true); form.reset(); }
              });
            }}>
              <label className="felt"><span className="etikett">Tittel</span><input name="title" required placeholder="Gruppetrening" /></label>
              <label className="felt"><span className="etikett">Beskrivelse (valgfritt)</span><input name="description" /></label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                <label className="felt"><span className="etikett">Dato</span><input type="date" name="dato" required /></label>
                <label className="felt"><span className="etikett">Klokkeslett</span><input type="time" name="tid" required /></label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                <label className="felt"><span className="etikett">Varighet (min)</span><input type="number" inputMode="numeric" name="varighetMin" min={5} defaultValue={60} required /></label>
                <label className="felt"><span className="etikett">Maks deltakere</span><input type="number" inputMode="numeric" name="maxParticipants" min={1} /></label>
              </div>
              <label className="felt"><span className="etikett">Sted (valgfritt)</span><input name="location" /></label>
              <label className="felt"><span className="etikett">Gjentas</span>
                <select name="recurring" defaultValue="NONE"><option value="NONE">Én gang</option><option value="WEEKLY">Hver uke</option></select></label>
              {feil && <Varsel tone="advarsel" tittel="Ikke lagret">{feil}</Varsel>}
              {ok && <Varsel tone="ok">Gruppetreningen er lagt inn.</Varsel>}
              <div className="knapper"><Knapp type="submit" disabled={pending}>{pending ? "Lagrer …" : "Legg inn"}</Knapp></div>
            </form>
          </Seksjon>
        </div>
      </div>
    </>
  );
}
