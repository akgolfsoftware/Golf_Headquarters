"use client";

/**
 * Admin-UI for å koble PlayerHQ-spiller til PublicPlayer (turneringsidentitet).
 */

import { useCallback, useState, useTransition } from "react";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, Icon, TomTilstand } from "@/components/v2";
import {
  fjernPublicPlayerKobling,
  koblePublicPlayer,
  sokPublicPlayers,
  type PublicPlayerSokTreff,
} from "./actions";

export type KoblingKlientProps = {
  spillerId: string;
  spillerNavn: string;
  current: {
    id: string;
    name: string;
    tier: string;
    country: string;
    birthYear: number | null;
    entriesCount: number;
  } | null;
  initialForslag: PublicPlayerSokTreff[];
};

export function TurneringKoblingKlient({
  spillerId,
  spillerNavn,
  current,
  initialForslag,
}: KoblingKlientProps) {
  const [q, setQ] = useState("");
  const [treff, setTreff] = useState<PublicPlayerSokTreff[]>([]);
  const [forslag] = useState(initialForslag);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sok = useCallback(() => {
    setFeil(null);
    setMelding(null);
    startTransition(async () => {
      const r = await sokPublicPlayers(spillerId, q);
      if (!r.ok) {
        setFeil(r.error);
        return;
      }
      setTreff(r.treff);
      if (r.treff.length === 0) setMelding("Ingen treff. Prøv et annet navn.");
    });
  }, [spillerId, q]);

  const koble = useCallback(
    (publicPlayerId: string, navn: string) => {
      setFeil(null);
      setMelding(null);
      startTransition(async () => {
        const r = await koblePublicPlayer(spillerId, publicPlayerId);
        if (!r.ok) {
          setFeil(r.error);
          return;
        }
        setMelding(
          `Koblet til ${navn}. ${r.mirrored} resultat${r.mirrored === 1 ? "" : "er"} speilet til profilen.`,
        );
        // Full refresh så server-data oppdateres
        window.location.reload();
      });
    },
    [spillerId],
  );

  const fjern = useCallback(() => {
    setFeil(null);
    setMelding(null);
    startTransition(async () => {
      const r = await fjernPublicPlayerKobling(spillerId);
      if (!r.ok) {
        setFeil(r.error);
        return;
      }
      setMelding("Kobling fjernet. Lagrede resultater i profilen beholdes.");
      window.location.reload();
    });
  }, [spillerId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {feil && (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: `color-mix(in srgb, ${T.warn} 12%, ${T.panel2})`,
            border: `1px solid color-mix(in srgb, ${T.warn} 35%, ${T.border})`,
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {feil}
        </div>
      )}
      {melding && (
        <div
          role="status"
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: `color-mix(in srgb, ${T.lime} 10%, ${T.panel2})`,
            border: `1px solid color-mix(in srgb, ${T.lime} 30%, ${T.border})`,
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {melding}
        </div>
      )}

      <Kort eyebrow="Nåværende kobling">
        {current ? (
          <div>
            <div
              style={{
                fontFamily: T.ui,
                fontSize: 16,
                fontWeight: 700,
                color: T.fg,
                marginBottom: 6,
              }}
            >
              {current.name}
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.mut,
                marginBottom: 14,
              }}
            >
              {current.country} · {current.tier}
              {current.birthYear != null ? ` · født ${current.birthYear}` : ""}
              {` · ${current.entriesCount} turneringer i basen`}
            </div>
            <button
              type="button"
              onClick={fjern}
              disabled={pending}
              style={{
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 600,
                color: T.warn,
                background: "transparent",
                border: `1px solid color-mix(in srgb, ${T.warn} 40%, ${T.border})`,
                borderRadius: 999,
                padding: "8px 14px",
                cursor: pending ? "wait" : "pointer",
              }}
            >
              Fjern kobling
            </button>
          </div>
        ) : (
          <TomTilstand
            icon="link"
            title="Ikke koblet"
            sub={`${spillerNavn} er ikke knyttet til en turneringsspiller. Resultater fra GolfBox speiles ikke til profilen før kobling er satt.`}
          />
        )}
      </Kort>

      {forslag.length > 0 && !current && (
        <Kort eyebrow="Forslag (samme navn)">
          <TreffListe treff={forslag} pending={pending} onKoble={koble} />
        </Kort>
      )}

      <Kort eyebrow="Søk i turneringsspillere">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sok();
          }}
          style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Fornavn eller etternavn"
            aria-label="Søk turneringsspiller"
            style={{
              flex: 1,
              minWidth: 180,
              fontFamily: T.ui,
              fontSize: 13,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.panel2,
              color: T.fg,
            }}
          />
          <button
            type="submit"
            disabled={pending || q.trim().length < 2}
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              background: T.lime,
              color: T.bg,
              cursor: pending ? "wait" : "pointer",
              opacity: q.trim().length < 2 ? 0.5 : 1,
            }}
          >
            Søk
          </button>
        </form>
        {treff.length > 0 ? (
          <TreffListe treff={treff} pending={pending} onKoble={koble} />
        ) : (
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Skriv minst to bokstaver og trykk Søk. Velg deretter riktig person.
          </p>
        )}
      </Kort>

      <p style={{ margin: 0, fontFamily: T.mono, fontSize: 9.5, color: T.mut, lineHeight: 1.5 }}>
        Tips: Auto-kobling kjører også på natt-cron ved eksakt navnematch. Bruk denne
        siden når navnene ikke er like nok (middelsnavn, kallenavn).
      </p>
    </div>
  );
}

function TreffListe({
  treff,
  pending,
  onKoble,
}: {
  treff: PublicPlayerSokTreff[];
  pending: boolean;
  onKoble: (id: string, navn: string) => void;
}) {
  return (
    <div>
      {treff.map((t, i) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom:
              i < treff.length - 1 ? `1px solid ${T.border}` : "none",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 600,
                color: T.fg,
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                color: T.mut,
                marginTop: 3,
              }}
            >
              {t.country} · {t.tier}
              {t.birthYear != null ? ` · ${t.birthYear}` : ""}
              {` · ${t.entriesCount} turneringer`}
              {t.alreadyLinkedTo
                ? ` · allerede koblet til ${t.alreadyLinkedTo}`
                : ""}
            </div>
          </div>
          {t.alreadyLinkedTo ? (
            <Caps size={9} style={{ color: T.mut }}>
              Opptatt
            </Caps>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => onKoble(t.id, t.name)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "8px 12px",
                borderRadius: 999,
                border: `1px solid ${T.border}`,
                background: T.panel2,
                color: T.fg,
                cursor: pending ? "wait" : "pointer",
                flex: "none",
              }}
            >
              <Icon name="link" size={12} />
              Koble
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
