"use client";

/**
 * AgencyOS v2 — Rediger e-postmal (`/admin/email-templates/[id]/rediger`,
 * AgencyOS Bølge 3.9, 2026-07-14). Port fra `(legacy)/email-templates/[id]/
 * rediger/page.tsx` + `editor-client.tsx` — samme `saveTemplate`/
 * `sendTestEmail`/`setAsDefault`/`archiveTemplate`-kontrakt, samme
 * token-substitusjon ({{spillerNavn}} osv.) for live-forhåndsvisning.
 */

import { useMemo, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Avkryssing, T, Icon } from "@/components/v2";
import { archiveTemplate, saveTemplate, sendTestEmail, setAsDefault } from "@/app/admin/(legacy)/email-templates/[id]/rediger/actions";

export interface TemplateForEditorV2 {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
}

const PREVIEW_DATA: Record<string, string> = {
  spillerNavn: "Øyvind Rohjan",
  spillerFornavn: "Øyvind",
  coachNavn: "Anders Kristiansen",
  klubbNavn: "Gamle Fredrikstad Golfklubb",
  okt_navn: "Performance · sving-økt",
  okt_dato: "torsdag 22. mai",
  okt_tid: "16:30",
  okt_lokasjon: "Performance Studio · GFGK",
  plan_navn: "Vår-blokk · uke 21",
  plan_lengde: "4 uker",
  hcp: "12.4",
  pris: "1 500 kr",
  link: "https://akgolf.no/portal",
};

function renderTokens(text: string): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => PREVIEW_DATA[key] ?? `{{${key}}}`);
}

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

export function AdminEpostmalRedigerV2({ template, testRecipient }: { template: TemplateForEditorV2; testRecipient: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [active, setActive] = useState(template.active);

  const dirty = name !== template.name || subject !== template.subject || body !== template.body || active !== template.active;
  const previewSubject = useMemo(() => renderTokens(subject), [subject]);
  const previewBody = useMemo(() => renderTokens(body), [body]);
  const tokensIBruk = useMemo(() => {
    const set = new Set<string>();
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let match;
    while ((match = regex.exec(`${subject}\n${body}`)) !== null) set.add(match[1]);
    return Array.from(set);
  }, [subject, body]);

  function flash(type: "ok" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  const lagre = () => startTransition(async () => {
    try { await saveTemplate(template.id, { name, subject, body, active }); flash("ok", "Mal lagret"); router.refresh(); }
    catch (err) { flash("error", err instanceof Error ? err.message : "Kunne ikke lagre"); }
  });
  const sendTest = () => startTransition(async () => {
    try { const res = await sendTestEmail(template.id); flash("ok", `Test-mail sendt til ${res.recipient}`); }
    catch (err) { flash("error", err instanceof Error ? err.message : "Kunne ikke sende"); }
  });
  const settStandard = () => startTransition(async () => {
    try { await setAsDefault(template.id); setActive(true); flash("ok", "Satt som standard"); router.refresh(); }
    catch (err) { flash("error", err instanceof Error ? err.message : "Kunne ikke sette standard"); }
  });
  const arkiver = () => {
    if (!confirm(`Arkivere malen «${template.name}»?`)) return;
    startTransition(async () => {
      try { await archiveTemplate(template.id); setActive(false); flash("ok", "Mal arkivert"); router.refresh(); }
      catch (err) { flash("error", err instanceof Error ? err.message : "Kunne ikke arkivere"); }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 1100 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Link href="/admin/email-templates" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Icon name="arrow-left" size={12} /> Tilbake til maler
          </Link>
          <div style={{ marginTop: 6 }}><Tittel em={active ? "Aktiv." : "Utkast."}>{name || "Ny mal"}.</Tittel></div>
          <div style={{ marginTop: 4 }}><Caps size={9}>Slug: {template.slug}</Caps></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Knapp ghost icon="send" onClick={sendTest} disabled={pending}>Send test</Knapp>
          <Knapp ghost icon="star" onClick={settStandard} disabled={pending || active}>Sett som standard</Knapp>
          <Knapp ghost icon="archive" onClick={arkiver} disabled={pending}>Arkiver</Knapp>
          <Knapp icon="check" onClick={lagre} disabled={pending || !dirty}>{pending ? "Lagrer…" : dirty ? "Lagre" : "Lagret"}</Knapp>
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 11, border: `1px solid ${toast.type === "ok" ? "color-mix(in srgb," + T.up + " 40%,transparent)" : "color-mix(in srgb," + T.down + " 40%,transparent)"}`, background: toast.type === "ok" ? `color-mix(in srgb, ${T.up} 12%, transparent)` : `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: toast.type === "ok" ? T.up : T.down }}>
          <Icon name={toast.type === "ok" ? "check-circle" : "alert-triangle"} size={15} />
          {toast.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: T.gap, alignItems: "start" }}>
        <Kort eyebrow="Editor" action={<StatusPill tone={active ? "up" : "info"}>{active ? "Aktiv" : "Utkast"}</StatusPill>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "block" }}>
              <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Mal-navn</Caps>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Velkommen til AK Golf Academy" style={feltStil} />
            </label>
            <label style={{ display: "block" }}>
              <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Emne (kan inneholde tokens)</Caps>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Velkommen til AK Golf, {{spillerFornavn}}" style={feltStil} />
            </label>
            <label style={{ display: "block" }}>
              <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Innhold (markdown · tokens som {"{{spillerNavn}}"})</Caps>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} placeholder={"Hei {{spillerNavn}},\n\nVelkommen til AK Golf Academy…"} style={{ ...feltStil, fontFamily: T.mono, fontSize: 12, lineHeight: 1.6, resize: "vertical" }} />
            </label>
            <Avkryssing label="Aktiv (kan brukes av agenter)" checked={active} onChange={setActive} />

            {tokensIBruk.length > 0 && (
              <div style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                <Caps size={9} style={{ display: "block", marginBottom: 8 }}>Tokens i bruk · {tokensIBruk.length}</Caps>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tokensIBruk.map((t) => (
                    <span key={t} style={{ borderRadius: 6, background: T.panel3, padding: "3px 8px", fontFamily: T.mono, fontSize: 10.5, color: T.fg2 }}>{`{{${t}}}`}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Kort>

        <Kort eyebrow="Forhåndsvisning" action={<Caps size={9}>Eksempel-data</Caps>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 12px" }}>
              <Caps size={8.5}>Fra</Caps>
              <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 13, color: T.fg }}>AK Golf Academy &lt;post@akgolf.no&gt;</div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 12px" }}>
              <Caps size={8.5}>Til</Caps>
              <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{PREVIEW_DATA.spillerNavn} &lt;markus@eksempel.no&gt;</div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 12px" }}>
              <Caps size={8.5}>Emne</Caps>
              <div style={{ marginTop: 2, fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{previewSubject || "—"}</div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, padding: 16 }}>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg, margin: 0 }}>{previewBody || "—"}</pre>
            </div>
            <Caps size={9}>Test sendes til: {testRecipient}</Caps>
          </div>
        </Kort>
      </div>
    </div>
  );
}
