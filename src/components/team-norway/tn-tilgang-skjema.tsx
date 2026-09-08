"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TN } from "@/lib/v2/team-norway";
import { TnKnapp, TnInput } from "./core";
import type { TnAvsluttResultat, TnSettRolleResultat, TnTrenerRolle } from "@/lib/domain/tn-tilgang";

/**
 * TN-18 — inspektørpanelets eneste klient-øy: rolletoggel, aktiv periode og
 * lagre/avslutt. Resten av panelet (avatar, navn, oppsummering) er ren
 * markup i page.tsx (server component), jf. PORTING.md §1 — radvalget selv
 * styres av searchParams, ikke useState.
 *
 * Kun ÉN gruppe (Team Norway) vises — datamodellen har ikke flere TN-
 * undergrupper å veksle mellom ennå, se filhodet i page.tsx.
 */
export function TnTilgangSkjema({
  groupId,
  targetUserId,
  gruppeNavn,
  rolleInitial,
  fraInitialIso,
  tilInitialIso,
  settTilgang,
  avsluttTilgang,
}: {
  groupId: string;
  targetUserId: string;
  gruppeNavn: string;
  rolleInitial: TnTrenerRolle;
  fraInitialIso: string;
  tilInitialIso: string | null;
  settTilgang: (input: { groupId: string; targetUserId: string; rolle: TnTrenerRolle; fraIso: string; tilIso: string | null }) => Promise<TnSettRolleResultat>;
  avsluttTilgang: (groupId: string, targetUserId: string) => Promise<TnAvsluttResultat>;
}) {
  const router = useRouter();
  const [rolle, setRolle] = useState<TnTrenerRolle>(rolleInitial);
  const [fra, setFra] = useState(fraInitialIso);
  const [til, setTil] = useState(tilInitialIso ?? "");
  const [feil, setFeil] = useState<{ gruppeNavn: string; antallSpillere: number } | null>(null);
  const [pending, startTransition] = useTransition();

  function lagre() {
    setFeil(null);
    startTransition(async () => {
      const resultat = await settTilgang({ groupId, targetUserId, rolle, fraIso: fra, tilIso: til || null });
      if (!resultat.ok) {
        setFeil({ gruppeNavn: resultat.gruppeNavn, antallSpillere: resultat.antallSpillere });
        return;
      }
      router.refresh();
    });
  }

  function avslutt() {
    setFeil(null);
    startTransition(async () => {
      const resultat = await avsluttTilgang(groupId, targetUserId);
      if (!resultat.ok) {
        setFeil({ gruppeNavn: resultat.gruppeNavn, antallSpillere: resultat.antallSpillere });
        return;
      }
      router.refresh();
    });
  }

  if (feil) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            background: TN.status.redBg,
            borderRadius: TN.radius.md,
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: TN.radius.full, background: TN.status.red, flexShrink: 0, marginTop: 5 }} />
          <span style={{ fontSize: TN.text.xs, fontWeight: TN.weight.semibold, color: TN.status.redText, lineHeight: TN.leading.normal }}>
            Siste trener i {feil.gruppeNavn}. Avsluttes tilgangen, står {feil.antallSpillere}{" "}
            {feil.antallSpillere === 1 ? "utøver" : "utøvere"} uten trener og gruppens økter kan ikke publiseres.
          </span>
        </div>
        <span style={{ fontSize: TN.text.sm, color: TN.textPrimary, lineHeight: TN.leading.normal }}>
          Gi en annen person trenerrollen i gruppen først. Hjelpetrener er ikke nok — publisering krever trener.
        </span>
        <TnKnapp variant="sekundaer" onClick={() => setFeil(null)}>
          Tilbake
        </TnKnapp>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span
          style={{
            fontFamily: TN.font.mono,
            fontSize: TN.text.micro,
            letterSpacing: TN.tracking.eyebrow,
            textTransform: "uppercase",
            color: TN.textSecondary,
          }}
        >
          Rolle i {gruppeNavn}
        </span>
        <div style={{ display: "flex", gap: 7 }}>
          {(["COACH", "ASSISTANT"] as const).map((v) => {
            const aktiv = rolle === v;
            return (
              <button
                key={v}
                type="button"
                disabled={pending}
                onClick={() => setRolle(v)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  padding: "0 8px",
                  borderRadius: TN.radius.full,
                  border: aktiv ? "none" : `1px solid ${TN.borderDefault}`,
                  background: aktiv ? TN.navy900 : TN.white,
                  color: aktiv ? TN.white : TN.textSecondary,
                  fontFamily: TN.font.body,
                  fontSize: TN.text.xs,
                  fontWeight: TN.weight.semibold,
                  cursor: pending ? "not-allowed" : "pointer",
                }}
              >
                {v === "COACH" ? "Trener" : "Hjelpetrener"}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span
          style={{
            fontFamily: TN.font.mono,
            fontSize: TN.text.micro,
            letterSpacing: TN.tracking.eyebrow,
            textTransform: "uppercase",
            color: TN.textSecondary,
          }}
        >
          Aktiv periode
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TnInput label="Fra" type="date" value={fra} onChange={setFra} disabled={pending} />
          <TnInput label="Til" type="date" value={til} onChange={setTil} placeholder="åpen" hint="Tom = åpen" disabled={pending} />
        </div>
        <span style={{ fontSize: TN.text.xs, color: TN.textSecondary, lineHeight: TN.leading.normal }}>
          Tom «til» betyr åpen tilgang. Er datoen passert, står raden som utløpt og personen kommer ikke inn —
          tilgangen slettes ikke, slik at loggen består.
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <TnKnapp variant="primaer" onClick={lagre}>
          {pending ? "Lagrer …" : "Lagre tilgang"}
        </TnKnapp>
        <button
          type="button"
          disabled={pending}
          onClick={avslutt}
          style={{
            minHeight: 48,
            padding: "0 18px",
            borderRadius: TN.radius.full,
            border: `1px solid ${TN.status.red}`,
            background: "transparent",
            color: TN.status.redText,
            fontFamily: TN.font.body,
            fontSize: TN.text.base,
            fontWeight: TN.weight.semibold,
            cursor: pending ? "not-allowed" : "pointer",
          }}
        >
          Avslutt
        </button>
      </div>
    </div>
  );
}
