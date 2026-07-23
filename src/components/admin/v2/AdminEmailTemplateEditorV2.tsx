"use client";

/**
 * AgencyOS — Rediger e-postmal (v2). 2-pane editor (felt til venstre, live
 * forhåndsvisning til høyre — stables på mobil) for én EmailTemplate.
 * Port av den ekte skjermen `src/app/admin/(legacy)/email-templates/[id]/
 * rediger/editor-client.tsx` til v2-biblioteket (Kort/Inndata/TekstOmraade/
 * Bryter/Knapp). Server-actions (saveTemplate/sendTestEmail/setAsDefault/
 * archiveTemplate) gjenbrukes 1:1 fra legacy-mappen — ingen ny lagre-logikk.
 *
 * Token-forhåndsvisning (PREVIEW_DATA/renderTokens) og "send test"-knappen
 * er bevart fra legacy — testRecipient vises som mottaker av test-mailen.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, StatusPill, Knapp, Icon, T } from "@/components/v2";
import { Inndata, TekstOmraade, Bryter } from "@/components/v2";
import {
  saveTemplate,
  sendTestEmail,
  setAsDefault,
  archiveTemplate,
} from "@/app/admin/(legacy)/email-templates/[id]/rediger/actions";

export type AdminEmailTemplateEditorV2Template = {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
};

type Props = {
  template: AdminEmailTemplateEditorV2Template;
  /** Brukerens egen e-post — vises som mottaker av test-mail. */
  testRecipient: string;
};

// Eksempel-data for live preview. Matcher template-tokens vi typisk
// bruker på tvers av AK Golf-maler (1:1 fra legacy-editoren).
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
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return PREVIEW_DATA[key] ?? `{{${key}}}`;
  });
}

export function AdminEmailTemplateEditorV2({ template, testRecipient }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [active, setActive] = useState(template.active);

  const dirty =
    name !== template.name ||
    subject !== template.subject ||
    body !== template.body ||
    active !== template.active;

  const previewSubject = useMemo(() => renderTokens(subject), [subject]);
  const previewBody = useMemo(() => renderTokens(body), [body]);

  const tokensIBruk = useMemo(() => {
    const set = new Set<string>();
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let match;
    while ((match = regex.exec(`${subject}\n${body}`)) !== null) {
      set.add(match[1]);
    }
    return Array.from(set);
  }, [subject, body]);

  function flash(type: "ok" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function lagre() {
    startTransition(async () => {
      try {
        await saveTemplate(template.id, { name, subject, body, active });
        flash("ok", "Mal lagret");
        router.refresh();
      } catch (err) {
        flash("error", err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  function sendTest() {
    startTransition(async () => {
      try {
        const res = await sendTestEmail(template.id);
        flash("ok", `Test-mail sendt til ${res.recipient}`);
      } catch (err) {
        flash("error", err instanceof Error ? err.message : "Kunne ikke sende");
      }
    });
  }

  function settStandard() {
    startTransition(async () => {
      try {
        await setAsDefault(template.id);
        setActive(true);
        flash("ok", "Satt som standard");
        router.refresh();
      } catch (err) {
        flash("error", err instanceof Error ? err.message : "Kunne ikke sette standard");
      }
    });
  }

  function arkiver() {
    if (!confirm(`Arkivere malen «${template.name}»?`)) return;
    startTransition(async () => {
      try {
        await archiveTemplate(template.id);
        setActive(false);
        flash("ok", "Mal arkivert");
        router.refresh();
      } catch (err) {
        flash("error", err instanceof Error ? err.message : "Kunne ikke arkivere");
      }
    });
  }

  // B: status — dirty / aktiv
  const statusTone = dirty ? "warn" as const : active ? "up" as const : "info" as const;
  const statusTekst = dirty ? "Ulagrede endringer" : active ? "Aktiv · lagret" : "Utkast · lagret";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode — B: status + én primær CTA (Lagre) */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <Caps>AgencyOS · Rediger mal · {template.slug}</Caps>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Tittel>{name || "Ny mal"}</Tittel>
            <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Knapp ghost icon="send" disabled={pending} onClick={sendTest}>
            Send test
          </Knapp>
          <Knapp ghost icon="star" disabled={pending || active} onClick={settStandard}>
            Sett som standard
          </Knapp>
          <Knapp ghost icon="archive" disabled={pending} onClick={arkiver} style={{ color: T.down }}>
            Arkiver
          </Knapp>
          <Knapp icon="check" disabled={pending || !dirty} onClick={lagre}>
            {pending ? "Lagrer…" : dirty ? "Lagre" : "Lagret"}
          </Knapp>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: T.rRow,
            border: `1px solid ${toast.type === "ok" ? T.lime : T.down}`,
            background: `color-mix(in srgb, ${toast.type === "ok" ? T.lime : T.down} 10%, transparent)`,
            padding: "10px 16px",
            fontFamily: T.ui,
            fontSize: 13,
            color: toast.type === "ok" ? T.lime : T.down,
          }}
        >
          <Icon name={toast.type === "ok" ? "check-circle" : "alert-triangle"} size={14} />
          {toast.msg}
        </div>
      )}

      {/* 2-pane editor — stables på mobil */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Editor */}
        <Kort eyebrow="Editor" action={<StatusPill tone={active ? "up" : "info"}>{active ? "Aktiv" : "Utkast"}</StatusPill>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inndata label="Mal-navn" value={name} placeholder="Velkommen til AK Golf Academy" onChange={setName} />
            <Inndata
              label="Emne (kan inneholde tokens)"
              value={subject}
              placeholder="Velkommen til AK Golf, {{spillerFornavn}}"
              onChange={setSubject}
            />
            <TekstOmraade
              label="Innhold (markdown · tokens som {{spillerNavn}})"
              value={body}
              rows={14}
              placeholder="Hei {{spillerNavn}},&#10;&#10;Velkommen til AK Golf Academy…"
              onChange={setBody}
            />
            <Bryter label="Aktiv" sub="Kan brukes av agenter" checked={active} onChange={setActive} />

            {tokensIBruk.length > 0 && (
              <div style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                <Caps size={9}>Tokens i bruk · {tokensIBruk.length}</Caps>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {tokensIBruk.map((t) => (
                    <span
                      key={t}
                      style={{ fontFamily: T.mono, fontSize: 10, color: T.fg, background: T.panel3, borderRadius: 5, padding: "3px 7px" }}
                    >
                      {`{{${t}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Kort>

        {/* Live preview */}
        <Kort eyebrow="Forhåndsvisning" action={<Caps size={9}>Eksempel-data</Caps>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FeltVis label="Fra" value="AK Golf Academy <post@akgolf.no>" />
            <FeltVis label="Til" value={`${PREVIEW_DATA.spillerNavn} <markus@eksempel.no>`} />
            <FeltVis label="Emne" value={previewSubject || "—"} accent />

            <div style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: "#fff", padding: 16 }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: "#111" }}>
                {previewBody || "—"}
              </pre>
            </div>

            <p style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.06em", color: T.mut, margin: 0 }}>
              Test sendes til: {testRecipient}
            </p>
          </div>
        </Kort>
      </div>
    </div>
  );
}

function FeltVis({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: T.panel2, padding: "9px 13px" }}>
      <Caps size={9}>{label}</Caps>
      <div
        style={{
          marginTop: 4,
          fontFamily: accent ? T.disp : T.ui,
          fontWeight: accent ? 700 : 500,
          fontSize: accent ? 15 : 13,
          color: T.fg,
        }}
      >
        {value}
      </div>
    </div>
  );
}
