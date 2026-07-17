"use client";

/**
 * AgencyOS — Forespørsler (Innboks · Forespørsler), v2-port 16. juli 2026.
 * Erstatter AgPage/AgPageHead/AgAvatar/AgChip/AgTypeChip-familien
 * (`@/components/admin/agencyos/ui`) med v2-primitivene. Samme datakilde
 * (SessionRequest) og samme server actions (markerSomPlanlagt/
 * avslaaForespørsel) uendret — kun presentasjonslaget er nytt.
 */

import { useTransition } from "react";
import { Caps, Tittel, Kort, Knapp, StatusPill, AvatarInit, TomTilstand, T } from "@/components/v2";
import { markerSomPlanlagt, avslaaForespørsel } from "@/app/admin/(legacy)/foresporsler/actions";

export interface AdminForesporselRad {
  id: string;
  navn: string;
  harOktIdag: boolean;
  nårTekst: string;
  begrunnelse: string;
  behandlet: boolean;
}

export interface AdminForesporslerV2Data {
  rader: AdminForesporselRad[];
}

function ForespørselHandlinger({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div style={{ display: "flex", gap: 8, flex: "none" }}>
      <Knapp icon="check" disabled={pending} onClick={() => startTransition(() => markerSomPlanlagt(id))}>
        Godta
      </Knapp>
      <Knapp icon="x" ghost disabled={pending} onClick={() => startTransition(() => avslaaForespørsel(id))}>
        Avvis
      </Knapp>
    </div>
  );
}

export function AdminForesporslerV2({ data }: { data: AdminForesporslerV2Data }) {
  const open = data.rader.filter((r) => !r.behandlet).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Innboks · Forespørsler</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="å svare på.">{`${open} ${open === 1 ? "forespørsel" : "forespørsler"}`}</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
          Booking-ønsker, meldinger og råd fra stallen. Svar eller deleger.
        </p>
      </div>

      {data.rader.length === 0 ? (
        <Kort>
          <TomTilstand icon="inbox" title="Ingen forespørsler" sub="Innboksen er tom." />
        </Kort>
      ) : (
        <Kort pad="4px 20px">
          {data.rader.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 0",
                borderTop: i ? `1px solid ${T.border}` : "none",
                opacity: r.behandlet ? 0.5 : 1,
                flexWrap: "wrap",
              }}
            >
              <span style={r.harOktIdag ? { boxShadow: `0 0 0 2px ${T.panel}, 0 0 0 3.5px color-mix(in srgb, ${T.lime} 55%, transparent)`, borderRadius: 9999 } : undefined}>
                <AvatarInit navn={r.navn} size={36} />
              </span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{r.navn}</span>
                  <StatusPill tone="info">Booking</StatusPill>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{r.nårTekst}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 13, color: T.mut }}>{r.begrunnelse}</p>
              </div>
              {r.behandlet ? <StatusPill tone="lime">Behandlet</StatusPill> : <ForespørselHandlinger id={r.id} />}
            </div>
          ))}
        </Kort>
      )}
    </div>
  );
}
