"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS — Inviter coach (v2, retning C «Presis»). Rekomponerer
 * (legacy)/team/inviter (InviterCoachForm) i v2-biblioteket, med uendret
 * funksjon: samme ekte server action `inviterCoach` (gjenbrukt som-den-er
 * fra legacy-treet), samme validering og samme "redirect til /admin/team
 * etter vellykket invitasjon"-oppførsel.
 *
 * Bygget utelukkende av v2-komponenter (src/components/v2) — ingen ad-hoc
 * UI, ingen rå hex.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Kort, SkjemaFelt, Inndata, Knapp, CTAPill, ValideringsChip, Avkryssing } from "@/components/v2";
import { Capability, CAPABILITY_BESKRIVELSER } from "@/lib/auth/cbac";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";
// G6: ekstra-tilganger utover COACH-defaulten som ADMIN kan gi ved invitasjon.
// Skrives som GRANT-overrides i user_capabilities av inviterCoach.
const EKSTRA_TILGANGER: Capability[] = [
  Capability.VIEW_FINANCE,
  Capability.MANAGE_FACILITIES,
  Capability.MANAGE_USERS,
  Capability.USE_AGENTS,
  Capability.INVITE_USERS,
];

export function AdminInviterCoachV2({
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

  const hode = (
    <div>
      <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Inviter coach</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
      <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 460 }}>
        Coachen får en e-post med innloggingslink og kan logge inn umiddelbart
        med samme e-post.
      </p>
    </div>
  );

  return (
    <div data-paper-wave-h="inviter-coach" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {hode}

      <Kort style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Navn" hjelp={undefined} feil={fieldErrors.name}>
            <Inndata label={null} value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" />
          </SkjemaFelt>

          <SkjemaFelt label="E-post" hjelp={undefined} feil={fieldErrors.email}>
            <Inndata label={null} type="email" value={epost} onChange={setEpost} placeholder="coach@akgolf.no" />
          </SkjemaFelt>

          {kanTildeleTilganger && (
            <div>
              {/* G6 — funksjonelt; trenger fasit-runde for endelig utseende. */}
              <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
                Ekstra tilganger
              </div>
              <p style={{ margin: "2px 0 6px", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.5 }}>
                Standard trenertilgang (grupper, planer, tester, spillerdata,
                booking) følger med automatisk. Kryss av for det ekstra denne
                treneren skal ha.
              </p>
              {EKSTRA_TILGANGER.map((cap) => (
                <Avkryssing
                  key={cap}
                  label={CAPABILITY_BESKRIVELSER[cap]}
                  checked={valgte.includes(cap)}
                  onChange={(on) => toggleTilgang(cap, on)}
                />
              ))}
            </div>
          )}

          {error && !Object.keys(fieldErrors).length && (
            <ValideringsChip tone="advarsel" tekst={error} />
          )}

          {success && <ValideringsChip tone="ok" tekst={success} />}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <Knapp type="submit" icon="user-plus" disabled={pending}>
              {pending ? "Sender…" : "Send invitasjon"}
            </Knapp>
            <Link href="/admin/team" style={{ textDecoration: "none" }}>
              <CTAPill ghost>Avbryt</CTAPill>
            </Link>
          </div>
        </form>
      </Kort>
    </div>
  );
}
