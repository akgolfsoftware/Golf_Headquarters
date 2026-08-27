"use client";

/**
 * AgencyOS — Inviter coach, Train-lock (T13-detaljer, 27.08.2026).
 *
 * Port av `AdminInviterCoachV2` (Paper/T.*) til Train-lock (TL.*) —
 * CLAUDE.md invariant 2. Samme ekte server action `inviterCoach`, samme
 * validering og samme «redirect til /admin/team etter vellykket
 * invitasjon»-oppførsel — designport, ikke funksjonsendring.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Capability, CAPABILITY_BESKRIVELSER } from "@/lib/auth/cbac";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";
import { TlCaps, TlKnapp, TlKort, TlTittel } from "./tl-kit";

// G6: ekstra-tilganger utover COACH-defaulten som ADMIN kan gi ved invitasjon.
// Skrives som GRANT-overrides i user_capabilities av inviterCoach.
const EKSTRA_TILGANGER: Capability[] = [
  Capability.VIEW_FINANCE,
  Capability.MANAGE_FACILITIES,
  Capability.MANAGE_USERS,
  Capability.USE_AGENTS,
  Capability.INVITE_USERS,
];

function TlFelt({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  feil,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  feil?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
        }}
      />
      {feil && <p style={{ margin: "6px 0 0", fontSize: 11, color: TL.danger }}>{feil}</p>}
    </div>
  );
}

function TlAvkryssing({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: TL.text }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: TL.fill }} />
      {label}
    </label>
  );
}

export function AdminInviterCoachTrainLock({
  kanTildeleTilganger = false,
}: {
  kanTildeleTilganger?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgte, setValgte] = useState<Capability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  function toggleTilgang(cap: Capability, on: boolean) {
    setValgte((prev) =>
      on ? [...new Set([...prev, cap])] : prev.filter((c) => c !== cap),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const navnVerdi = navn.trim();
    const epostVerdi = epost.trim();

    startTransition(async () => {
      const res = await inviterCoach(
        epostVerdi,
        navnVerdi,
        kanTildeleTilganger && valgte.length > 0 ? valgte : undefined,
      );
      if (!res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setSuccess(
        res.epostSendt
          ? "Coach invitert. Invitasjons-e-post er sendt."
          : "Coach opprettet. E-post ble ikke sendt (Resend ikke konfigurert).",
      );
      setTimeout(() => router.push("/admin/team"), 1500);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560, margin: "0 auto", width: "100%" }}>
      <TlTittel sub="AgencyOS">Inviter coach</TlTittel>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: 460 }}>
        Coachen får en e-post med innloggingslink og kan logge inn umiddelbart
        med samme e-post.
      </p>

      <TlKort pad="18px 20px" style={{ gap: 14 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TlFelt label="Navn" value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" feil={fieldErrors.name} />
          <TlFelt label="E-post" type="email" value={epost} onChange={setEpost} placeholder="coach@akgolf.no" feil={fieldErrors.email} />

          {kanTildeleTilganger && (
            <div>
              <TlCaps size={10}>Ekstra tilganger</TlCaps>
              <p style={{ margin: "4px 0 10px", fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                Standard trenertilgang (grupper, planer, tester, spillerdata,
                booking) følger med automatisk. Kryss av for det ekstra denne
                treneren skal ha.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EKSTRA_TILGANGER.map((cap) => (
                  <TlAvkryssing
                    key={cap}
                    label={CAPABILITY_BESKRIVELSER[cap]}
                    checked={valgte.includes(cap)}
                    onChange={(on) => toggleTilgang(cap, on)}
                  />
                ))}
              </div>
            </div>
          )}

          {error && !Object.keys(fieldErrors).length && (
            <p role="alert" style={{ margin: 0, fontSize: 12, color: TL.danger }}>{error}</p>
          )}
          {success && <p role="status" style={{ margin: 0, fontSize: 12, color: TL.ok }}>{success}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <TlKnapp type="submit" icon="user-plus" variant="primaer" disabled={pending}>
              {pending ? "Sender…" : "Send invitasjon"}
            </TlKnapp>
            <TlKnapp href="/admin/team" variant="tertiaer">
              Avbryt
            </TlKnapp>
          </div>
        </form>
      </TlKort>
    </div>
  );
}
