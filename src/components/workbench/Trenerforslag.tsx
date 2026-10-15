"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { lagTrenerforslag, svarPaTrenerforslag } from "@/lib/workbench/trenerforslag";
import { TN } from "@/lib/v2/team-norway";

type Innslag = { date: string; startMinute: number; durationMinutes: number; title: string; pyramid: string; location?: string | null };
type IupFokus = { akse: string; tittel: string; egentidMinUke: number; maalemetode: string | null };
type IupFokusFoer = IupFokus & { status: string; egenvurdering: number | null; trenervurdering: number | null; kommentar: string | null };
type IupFokusforslag = { kind: "IUP_FOCUS"; organisasjon: "WANG"; periodName: string; expected: IupFokusFoer[];
  etter: IupFokus[]; begrunnelse: string };
type Oktsforslag = { organisasjon: "WANG" | "TEAM_NORWAY"; handling: "ADD" | "UPDATE" | "CANCEL"; sessionId: string | null;
  for: Partial<Innslag> | null; etter: Innslag | null; begrunnelse: string };
export type SpillerTrenerforslag = {
  id: string; trener: string; opprettet: string;
  forslag: IupFokusforslag | Oktsforslag;
};
function erIupFokusforslag(forslag: SpillerTrenerforslag["forslag"]): forslag is IupFokusforslag {
  return "kind" in forslag && forslag.kind === "IUP_FOCUS";
}

const panel: React.CSSProperties = { display: "grid", gap: 12, padding: 16, border: "1px solid var(--border-default)", borderRadius: 12, background: "var(--surface-1)" };
const stdKnapp: React.CSSProperties = { minHeight: 40, border: 0, borderRadius: 8, background: "var(--surface-inverse)", color: "var(--text-inverse)", padding: "8px 14px", font: "var(--type-body-s)", cursor: "pointer" };
// Skjemaet får tema fra systemet det vises i (WANG- eller Team Norway-tokens).
// `panel` og `stdKnapp` over brukes bare av innboksen i PlayerHQ.
const tnPanel: React.CSSProperties = { display: "grid", gap: 12, padding: "16px 18px 18px", border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.sm, background: TN.surfaceCard, fontFamily: TN.font.body };
const wangPanel: React.CSSProperties = { display: "grid", gap: 12, padding: 16, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card-sm)", background: "var(--surface-card)", fontFamily: "var(--font-body)" };
const tnKnapp: React.CSSProperties = { minHeight: 44, padding: "0 18px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: TN.navy900, color: TN.white, fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, cursor: "pointer" };
const wangKnapp: React.CSSProperties = { minHeight: 44, padding: "0 16px", border: 0, borderRadius: "var(--radius-input)", background: "var(--wang-navy)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 700, cursor: "pointer" };
const tnFelt: React.CSSProperties = { display: "grid", gap: 6, minWidth: 0, color: TN.ink900, fontFamily: TN.font.body, fontSize: 14, fontWeight: 700 };
const wangFelt: React.CSSProperties = { display: "grid", gap: 5, minWidth: 0, color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13 };
const tnInput: React.CSSProperties = { minHeight: 48, minWidth: 0, padding: "10px 12px", border: `1px solid ${TN.ink500}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.ink900, fontFamily: TN.font.body, fontSize: 16, fontWeight: 400 };
const wangInput: React.CSSProperties = { minHeight: 44, minWidth: 0, padding: "8px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-input)", background: "var(--surface-card)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 15 };

function tid(minutter: number) { return `${String(Math.floor(minutter / 60)).padStart(2, "0")}:${String(minutter % 60).padStart(2, "0")}`; }
function vis(o: Partial<Innslag> | null) { return !o ? "Ingen eksisterende økt" : [o.date, o.startMinute == null ? null : tid(o.startMinute), o.title, o.durationMinutes == null ? null : `${o.durationMinutes} min`, o.pyramid].filter(Boolean).join(" · "); }

export function TrenerforslagSkjema({ organisasjon, spillerId, sessions = [] }: { organisasjon: "WANG" | "TEAM_NORWAY"; spillerId: string; sessions?: { id: string; label: string }[] }) {
  const [pending, start] = useTransition(); const [melding, setMelding] = useState(""); const router = useRouter();
  const [handling, setHandling] = useState<"ADD" | "UPDATE" | "CANCEL">("ADD");
  const tn = organisasjon === "TEAM_NORWAY";
  const orgStyle = tn ? tnPanel : wangPanel;
  const knapp = tn ? tnKnapp : wangKnapp;
  const fieldStyle = tn ? tnFelt : wangFelt;
  const inputStyle = tn ? tnInput : wangInput;
  const dempet = tn ? TN.ink700 : "var(--text-secondary)";
  return <section aria-label="Foreslå treningsendring" style={orgStyle}>
    <div><h2 style={tn ? { margin: 0, fontFamily: TN.font.display, fontSize: 19, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: TN.navy900 } : { margin: 0, fontFamily: "var(--font-brand)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Foreslå treningsendring</h2>
      <p style={{ margin: "4px 0 0", color: dempet, fontSize: 14, lineHeight: 1.5 }}>Forslaget endrer ikke planen før spilleren godkjenner det.</p></div>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><button type="submit" disabled={pending} style={{ ...knapp, opacity: pending ? 0.65 : 1 }}>{pending ? "Sender …" : "Send forslag"}</button>{melding && <span role="status" style={{ color: dempet, fontSize: 14 }}>{melding}</span>}</div>
    </form>
  </section>;
}

export function TrenerforslagInnboks({ forslag }: { forslag: SpillerTrenerforslag[] }) {
  const [pending, start] = useTransition(); const [valgt, setValgt] = useState<string | null>(null); const [melding, setMelding] = useState(""); const router = useRouter();
  if (!forslag.length) return null;
  async function svar(id: string, beslutning: "ACCEPTED" | "REJECTED") { setValgt(id); start(async () => { const result = await svarPaTrenerforslag({ actionId: id, beslutning }); setValgt(null); setMelding(result.ok ? (beslutning === "ACCEPTED" ? "Endringen er lagt inn i planen." : "Planen er uendret; forslaget er avvist.") : result.feil); router.refresh(); }); }
  return <section aria-label="Forslag fra trener" style={panel}>
    <div><h2 style={{ margin: 0, font: "var(--type-heading-s)", color: "var(--text-primary)" }}>Forslag fra trener</h2><p style={{ margin: "4px 0 0", color: "var(--text-secondary)", font: "var(--type-body-s)" }}>Planen endres først når du godkjenner.</p></div>
    {forslag.map(f => { const iup = erIupFokusforslag(f.forslag); const iupData = iup ? f.forslag as IupFokusforslag : null; const oekt = f.forslag as Oktsforslag; return <article key={f.id} aria-busy={pending && valgt === f.id} style={{ display: "grid", gap: 10, padding: 12, borderTop: "1px solid var(--border-hairline)" }}>
      <p style={{ margin: 0, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>{f.forslag.organisasjon === "WANG" ? "WANG" : "Team Norway"} · {f.trener}</p>
      {iupData ? <>
        <strong style={{ color: "var(--text-primary)" }}>Foreslåtte fokusområder · {iupData.periodName}</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <div><strong>Før</strong>{iupData.expected.length ? iupData.expected.map((g, i) => <p key={`${g.tittel}-${i}`} style={{ margin: "6px 0", color: "var(--text-secondary)" }}>{g.akse} · {g.tittel} · {g.egentidMinUke} min/uke{g.maalemetode ? ` · Målemetode: ${g.maalemetode}` : ""} · {g.status}{g.egenvurdering == null ? "" : ` · Egenvurdering ${g.egenvurdering}/5`}{g.trenervurdering == null ? "" : ` · Trenervurdering ${g.trenervurdering}/5`}{g.kommentar ? ` · ${g.kommentar}` : ""}</p>) : <p>Ingen fokusområder</p>}</div>
          <div><strong>Etter godkjenning</strong>{iupData.etter.length ? iupData.etter.map((g, i) => <p key={`${g.tittel}-${i}`} style={{ margin: "6px 0", color: "var(--text-secondary)" }}>{g.akse} · {g.tittel} · {g.egentidMinUke} min/uke{g.maalemetode ? ` · ${g.maalemetode}` : ""}</p>) : <p>Fokusområdene fjernes for perioden</p>}</div>
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>Årsplanen endres først når du godkjenner.</p>
      </> : <>
        <div style={{ display: "grid", gap: 6 }}><strong style={{ color: "var(--text-primary)" }}>Før: {vis(oekt.for)}</strong><strong style={{ color: "var(--text-primary)" }}>Etter: {oekt.handling === "CANCEL" ? "Økten foreslås tatt ut av planen" : vis(oekt.etter)}</strong></div>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>{oekt.begrunnelse}</p>
      </>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button disabled={pending} onClick={() => svar(f.id, "ACCEPTED")} style={stdKnapp}>Godkjenn</button><button disabled={pending} onClick={() => svar(f.id, "REJECTED")} style={{ ...stdKnapp, background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>Avvis</button></div>
    </article>; })}
    {melding && <p role="status" style={{ margin: 0, color: "var(--text-secondary)" }}>{melding}</p>}
  </section>;
}
