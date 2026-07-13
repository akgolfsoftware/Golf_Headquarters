"use client";

/**
 * Fellesmelding-knapp + komponer-panel — v2. Ghost-knapp per rad åpner et
 * v2-ark (bunn-ark på mobil, panel på desktop) med Emne + Melding, sender
 * via ekte server-action (sendTournamentFellesmelding → GroupMember-fan-out).
 */

import { useState, useTransition } from "react";
import { T, Caps } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { sendTournamentFellesmelding } from "@/app/admin/tournaments/actions";
import { TurneringModal, ModalFooter, useMobile } from "@/components/admin/v2/turnering-ui";

export function FellesmeldingKnapp({ navn, mottakere }: { navn: string; mottakere: number }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Orientering · ${navn}`);
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feilet, setFeilet] = useState(false);
  const [pending, startTransition] = useTransition();
  const mobile = useMobile();

  function send() {
    startTransition(async () => {
      const res = await sendTournamentFellesmelding({
        subject: subject.trim() || `Orientering · ${navn}`,
        body: body.trim(),
      });
      if (res.ok) {
        setFeedback(`Sendt til ${res.count ?? 0} spillere i gruppene`);
        setFeilet(false);
        setTimeout(() => {
          setOpen(false);
          setBody("");
          setFeedback(null);
        }, 1400);
      } else {
        setFeedback(res.error ?? "Kunne ikke sende");
        setFeilet(true);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={mottakere === 0}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: mottakere === 0 ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 9999,
          padding: mobile ? "8px 12px" : "6px 12px",
          fontFamily: T.ui,
          fontSize: 11.5,
          fontWeight: 600,
          color: mottakere === 0 ? T.mut : T.fg,
          background: T.panel3,
          border: `1px solid ${T.borderS}`,
          opacity: mottakere === 0 ? 0.5 : 1,
          whiteSpace: "nowrap",
        }}
      >
        <Icon name="send" size={13} />
        {!mobile && "Fellesmelding"}
      </button>

      {open && (
        <TurneringModal title={navn} eyebrow="Fellesmelding" onLukk={() => setOpen(false)} busy={pending}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.lime}`, padding: "12px 14px", marginBottom: 16 }}>
            <Icon name="users" size={16} style={{ color: T.lime, flex: "none" }} />
            <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.fg }}>Sendes til alle påmeldte deltakere</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label>
              <Caps size={9} style={{ marginBottom: 7 }}>Emne</Caps>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11, padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none" }}
              />
            </label>
            <label>
              <Caps size={9} style={{ marginBottom: 7 }}>Melding</Caps>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Oppmøte 07:30 ved klubbhus. Husk regnplagg…"
                style={{ width: "100%", boxSizing: "border-box", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11, padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none", resize: "vertical", lineHeight: 1.55 }}
              />
            </label>
          </div>

          {feedback && (
            <p style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: feilet ? T.down : T.up }}>{feedback}</p>
          )}

          <ModalFooter
            onAvbryt={() => setOpen(false)}
            onLagre={send}
            busy={pending}
            lagreDisabled={!body.trim()}
            lagreTekst="Send til alle"
          />
        </TurneringModal>
      )}
    </>
  );
}
