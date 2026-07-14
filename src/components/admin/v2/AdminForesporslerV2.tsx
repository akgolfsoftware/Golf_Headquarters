"use client";

/**
 * AgencyOS v2 — Forespørsler (`/admin/foresporsler`, AgencyOS Bølge 3.4,
 * 2026-07-14). Port fra `(legacy)/foresporsler/page.tsx` +
 * `forespørsel-actions.tsx` — samme `SessionRequest`-datamodell og
 * `markerSomPlanlagt`/`avslaaForespørsel`-kontrakt.
 */

import { useTransition } from "react";
import { Caps, Tittel, Kort, Rad, Knapp, StatusPill, T } from "@/components/v2";
import { markerSomPlanlagt, avslaaForespørsel } from "@/app/admin/(legacy)/foresporsler/actions";

/** Samme initial-avatar som `AvatarInit`, men lime når spilleren har økt i dag (fasit-tonen). */
function ForesporselAvatar({ initialer, harOktIdag }: { initialer: string; harOktIdag: boolean }) {
  return (
    <span style={{ width: 34, height: 34, borderRadius: 9999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, background: harOktIdag ? T.lime : T.panel3, color: harOktIdag ? T.onLime : T.fg2, border: `1px solid ${harOktIdag ? "transparent" : T.border}` }}>
      {initialer}
    </span>
  );
}

export interface AdminForesporselV2Rad {
  id: string;
  navn: string;
  initialer: string;
  harOktIdag: boolean;
  narTekst: string;
  begrunnelse: string;
  apen: boolean;
}

function ForesporselHandlinger({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <Knapp icon="check" onClick={() => startTransition(() => markerSomPlanlagt(requestId))} disabled={pending}>Godta</Knapp>
      <Knapp ghost onClick={() => startTransition(() => avslaaForespørsel(requestId))} disabled={pending}>Avvis</Knapp>
    </div>
  );
}

export function AdminForesporslerV2({ rader }: { rader: AdminForesporselV2Rad[] }) {
  const open = rader.filter((r) => r.apen).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 780 }}>
      <div>
        <Caps size={9}>Innboks · Forespørsler</Caps>
        <Tittel em="å svare på.">{open} {open === 1 ? "forespørsel" : "forespørsler"}</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>
          Booking-ønsker, meldinger og råd fra stallen. Svar eller deleger.
        </p>
      </div>

      <Kort pad="6px 14px">
        {rader.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen forespørsler — innboksen er tom.
          </div>
        ) : (
          rader.map((r, i) => (
            <Rad
              key={r.id}
              last={i === rader.length - 1}
              leading={<ForesporselAvatar initialer={r.initialer} harOktIdag={r.harOktIdag} />}
              title={<span style={{ opacity: r.apen ? 1 : 0.5 }}>{r.navn} <StatusPill tone="info">Booking</StatusPill> <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{r.narTekst}</span></span>}
              sub={r.begrunnelse}
              trailing={r.apen ? <ForesporselHandlinger requestId={r.id} /> : <StatusPill tone="up">Behandlet</StatusPill>}
            />
          ))
        )}
      </Kort>
    </div>
  );
}
