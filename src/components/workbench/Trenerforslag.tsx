"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { lagTrenerforslag, svarPaTrenerforslag } from "@/lib/workbench/trenerforslag";
import { TN } from "@/lib/v2/team-norway";

type Innslag = { date: string; startMinute: number; durationMinutes: number; title: string; pyramid: string; location?: string | null };
export type SpillerTrenerforslag = {
  id: string; trener: string; opprettet: string;
  forslag: { organisasjon: "WANG" | "TEAM_NORWAY"; handling: "ADD" | "UPDATE" | "CANCEL"; sessionId: string | null;
    for: Partial<Innslag> | null; etter: Innslag | null; begrunnelse: string };
};

const felt: React.CSSProperties = { display: "grid", gap: 5, minWidth: 0, color: "var(--text-secondary)", font: "var(--type-body-s)" };
const input: React.CSSProperties = { minHeight: 40, minWidth: 0, padding: "8px 10px", border: "1px solid var(--border-default)", borderRadius: 8, background: "var(--surface-1)", color: "var(--text-primary)", font: "inherit" };
const panel: React.CSSProperties = { display: "grid", gap: 12, padding: 16, border: "1px solid var(--border-default)", borderRadius: 12, background: "var(--surface-1)" };
const tnPanel: React.CSSProperties = { ...panel, borderColor: TN.borderSubtle, borderRadius: 0, background: TN.surfaceCard, fontFamily: TN.font.body };
const wangPanel: React.CSSProperties = { ...panel, borderColor: "var(--border-subtle)", borderRadius: 8, background: "var(--surface-card)", fontFamily: "var(--font-body)" };
const stdKnapp: React.CSSProperties = { minHeight: 40, border: 0, borderRadius: 8, background: "var(--surface-inverse)", color: "var(--text-inverse)", padding: "8px 14px", font: "var(--type-body-s)", cursor: "pointer" };
const tnKnapp: React.CSSProperties = { ...stdKnapp, borderRadius: 0, background: TN.navy900, color: TN.white, fontFamily: TN.font.body, fontSize: TN.text.sm };
const wangKnapp: React.CSSProperties = { ...stdKnapp, background: "var(--wang-navy)", color: "var(--white)" };

function tid(minutter: number) { return `${String(Math.floor(minutter / 60)).padStart(2, "0")}:${String(minutter % 60).padStart(2, "0")}`; }
function vis(o: Partial<Innslag> | null) { return !o ? "Ingen eksisterende økt" : [o.date, o.startMinute == null ? null : tid(o.startMinute), o.title, o.durationMinutes == null ? null : `${o.durationMinutes} min`, o.pyramid].filter(Boolean).join(" · "); }

export function TrenerforslagSkjema({ organisasjon, spillerId, sessions = [] }: { organisasjon: "WANG" | "TEAM_NORWAY"; spillerId: string; sessions?: { id: string; label: string }[] }) {
  const [pending, start] = useTransition(); const [melding, setMelding] = useState(""); const router = useRouter();
  const [handling, setHandling] = useState<"ADD" | "UPDATE" | "CANCEL">("ADD");
  const orgStyle = organisasjon === "TEAM_NORWAY" ? tnPanel : wangPanel;
  const knapp = organisasjon === "TEAM_NORWAY" ? tnKnapp : wangKnapp;
  const fieldStyle = organisasjon === "TEAM_NORWAY" ? { ...felt, color: TN.textSecondary, fontFamily: TN.font.body } : felt;
  const inputStyle = organisasjon === "TEAM_NORWAY" ? { ...input, borderRadius: 0, borderColor: TN.borderDefault, background: TN.surfaceCard, color: TN.textPrimary, fontFamily: TN.font.body } : input;
  return <section aria-label="Foreslå treningsendring" style={orgStyle}>
    <div><h2 style={{ margin: 0, fontSize: organisasjon === "TEAM_NORWAY" ? TN.text.h3 : undefined, fontWeight: organisasjon === "TEAM_NORWAY" ? TN.weight.semibold : undefined, fontFamily: organisasjon === "TEAM_NORWAY" ? TN.font.display : "inherit", color: organisasjon === "TEAM_NORWAY" ? TN.textPrimary : "var(--text-primary)" }}>Foreslå treningsendring</h2>
      <p style={{ margin: "4px 0 0", color: organisasjon === "TEAM_NORWAY" ? TN.textSecondary : "var(--text-secondary)", font: "var(--type-body-s)" }}>Forslaget endrer ikke planen før spilleren godkjenner det.</p></div>
    <form style={{ display: "grid", gap: 10 }} onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const handling = String(f.get("handling")) as "ADD" | "UPDATE" | "CANCEL";
      const sessionId = String(f.get("sessionId") || "");
      const [h, m] = String(f.get("time") || "09:00").split(":").map(Number);
      const etter = handling === "CANCEL" ? undefined : { date: String(f.get("date")), startMinute: h * 60 + m, durationMinutes: Number(f.get("durationMinutes")), title: String(f.get("title")), pyramid: String(f.get("pyramid")) as "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN", location: String(f.get("location") || "") || null };
      start(async () => { const result = await lagTrenerforslag({ organisasjon, spillerId, handling, sessionId: sessionId || undefined, etter, begrunnelse: String(f.get("begrunnelse")) });
        setMelding(result.ok ? "Forslaget er sendt til spillerens Workbench." : result.feil); if (result.ok) router.refresh(); }); }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        <label style={fieldStyle}>Handling<select name="handling" value={handling} onChange={e => setHandling(e.target.value as typeof handling)} style={inputStyle}><option value="ADD">Foreslå ny økt</option><option value="UPDATE">Foreslå endring</option><option value="CANCEL">Foreslå å ta bort økt</option></select></label>
        <label style={fieldStyle}>Eksisterende økt<select name="sessionId" defaultValue="" required={handling !== "ADD"} disabled={handling === "ADD" || sessions.length === 0} style={inputStyle}><option value="">{sessions.length ? "Velg økt ved endring/fjerning" : "Ingen redigerbare økter"}</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        <label style={fieldStyle}>Dato<input name="date" type="date" required={handling !== "CANCEL"} disabled={handling === "CANCEL"} style={inputStyle} /></label>
        <label style={fieldStyle}>Starttid<input name="time" type="time" defaultValue="09:00" required={handling !== "CANCEL"} disabled={handling === "CANCEL"} style={inputStyle} /></label>
        <label style={fieldStyle}>Varighet i minutter<input name="durationMinutes" type="number" min={5} max={600} defaultValue={60} required={handling !== "CANCEL"} disabled={handling === "CANCEL"} style={inputStyle} /></label>
        <label style={fieldStyle}>Treningsområde<select name="pyramid" disabled={handling === "CANCEL"} style={inputStyle}>{["FYS", "TEK", "SLAG", "SPILL", "TURN"].map(x => <option key={x}>{x}</option>)}</select></label>
        <label style={fieldStyle}>Tittel<input name="title" maxLength={120} required={handling !== "CANCEL"} disabled={handling === "CANCEL"} style={inputStyle} /></label>
        <label style={fieldStyle}>Sted<input name="location" maxLength={120} disabled={handling === "CANCEL"} style={inputStyle} /></label>
      </div>
      <label style={fieldStyle}>Begrunnelse<textarea name="begrunnelse" minLength={5} maxLength={1000} required rows={3} style={{ ...inputStyle, resize: "vertical" }} /></label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><button type="submit" disabled={pending} style={{ ...knapp, opacity: pending ? 0.65 : 1 }}>{pending ? "Sender …" : "Send forslag"}</button>{melding && <span role="status" style={{ color: organisasjon === "TEAM_NORWAY" ? TN.textSecondary : "var(--text-secondary)", font: "var(--type-body-s)" }}>{melding}</span>}</div>
    </form>
  </section>;
}

export function TrenerforslagInnboks({ forslag }: { forslag: SpillerTrenerforslag[] }) {
  const [pending, start] = useTransition(); const [valgt, setValgt] = useState<string | null>(null); const [melding, setMelding] = useState(""); const router = useRouter();
  if (!forslag.length) return null;
  async function svar(id: string, beslutning: "ACCEPTED" | "REJECTED") { setValgt(id); start(async () => { const result = await svarPaTrenerforslag({ actionId: id, beslutning }); setValgt(null); setMelding(result.ok ? (beslutning === "ACCEPTED" ? "Endringen er lagt inn i planen." : "Planen er uendret; forslaget er avvist.") : result.feil); router.refresh(); }); }
  return <section aria-label="Forslag fra trener" style={panel}>
    <div><h2 style={{ margin: 0, font: "var(--type-heading-s)", color: "var(--text-primary)" }}>Forslag fra trener</h2><p style={{ margin: "4px 0 0", color: "var(--text-secondary)", font: "var(--type-body-s)" }}>Planen endres først når du godkjenner.</p></div>
    {forslag.map(f => <article key={f.id} aria-busy={pending && valgt === f.id} style={{ display: "grid", gap: 10, padding: 12, borderTop: "1px solid var(--border-hairline)" }}>
      <p style={{ margin: 0, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>{f.forslag.organisasjon === "WANG" ? "WANG" : "Team Norway"} · {f.trener}</p>
      <div style={{ display: "grid", gap: 6 }}><strong style={{ color: "var(--text-primary)" }}>Før: {vis(f.forslag.for)}</strong><strong style={{ color: "var(--text-primary)" }}>Etter: {f.forslag.handling === "CANCEL" ? "Økten foreslås tatt ut av planen" : vis(f.forslag.etter)}</strong></div>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>{f.forslag.begrunnelse}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button disabled={pending} onClick={() => svar(f.id, "ACCEPTED")} style={stdKnapp}>Godkjenn</button><button disabled={pending} onClick={() => svar(f.id, "REJECTED")} style={{ ...stdKnapp, background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>Avvis</button></div>
    </article>)}
    {melding && <p role="status" style={{ margin: 0, color: "var(--text-secondary)" }}>{melding}</p>}
  </section>;
}
