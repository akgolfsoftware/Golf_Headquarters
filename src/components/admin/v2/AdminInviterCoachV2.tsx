"use client";

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
import {
  Caps,
  Tittel,
  Kort,
  SkjemaFelt,
  Inndata,
  Knapp,
  CTAPill,
  ValideringsChip,
  T,
} from "@/components/v2";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";

export function AdminInviterCoachV2() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const navnVerdi = navn.trim();
    const epostVerdi = epost.trim();

    startTransition(async () => {
      const res = await inviterCoach(epostVerdi, navnVerdi);
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
      <Caps>AgencyOS · Team</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em="coach.">Inviter</Tittel>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 460 }}>
        Coachen får en e-post med innloggingslink og kan logge inn umiddelbart
        med samme e-post.
      </p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      <Kort style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Navn" hjelp={undefined} feil={fieldErrors.name}>
            <Inndata label={null} value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" />
          </SkjemaFelt>

          <SkjemaFelt label="E-post" hjelp={undefined} feil={fieldErrors.email}>
            <Inndata label={null} type="email" value={epost} onChange={setEpost} placeholder="coach@akgolf.no" />
          </SkjemaFelt>

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
