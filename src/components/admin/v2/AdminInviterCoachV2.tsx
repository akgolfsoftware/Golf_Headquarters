"use client";

/**
 * AgencyOS v2 — Inviter coach (`/admin/team/inviter`, AgencyOS Bølge 3.2,
 * 2026-07-14). Port fra `(legacy)/team/inviter/page.tsx` + `inviter-coach-
 * form.tsx` — samme `inviterCoach`-kontrakt.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, T } from "@/components/v2";
import { Inndata } from "@/components/v2/skjema";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";

export function AdminInviterCoachV2() {
  const router = useRouter();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [suksess, setSuksess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () => {
    setFeil(null);
    setFeltFeil({});
    setSuksess(null);
    startTransition(async () => {
      const res = await inviterCoach(epost, navn);
      if (!res.ok) {
        setFeil(res.error);
        setFeltFeil(res.fieldErrors ?? {});
        return;
      }
      setSuksess(res.epostSendt ? "Coach invitert. Invitasjons-e-post er sendt." : "Coach opprettet. E-post ble ikke sendt (Resend ikke konfigurert).");
      setTimeout(() => router.push("/admin/team"), 1500);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 480 }}>
      <div>
        <Caps size={9}>AgencyOS · /admin/team/inviter</Caps>
        <Tittel em="coach">Inviter</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>
          Coachen får en e-post med innloggingslink og kan logge inn umiddelbart med samme e-post.
        </p>
      </div>

      <Kort>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inndata label="Navn" value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" />
          {feltFeil.name && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feltFeil.name}</span>}
          <Inndata label="E-post" type="email" value={epost} onChange={setEpost} placeholder="coach@akgolf.no" />
          {feltFeil.email && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feltFeil.email}</span>}

          {feil && !Object.keys(feltFeil).length && (
            <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>
          )}
          {suksess && (
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.up }}>{suksess}</div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Knapp icon="users" onClick={send} disabled={pending || !navn.trim() || !epost.trim()}>
              {pending ? "Sender…" : "Send invitasjon"}
            </Knapp>
            <Link href="/admin/team" style={{ textDecoration: "none" }}><Knapp ghost>Avbryt</Knapp></Link>
          </div>
        </div>
      </Kort>
    </div>
  );
}
