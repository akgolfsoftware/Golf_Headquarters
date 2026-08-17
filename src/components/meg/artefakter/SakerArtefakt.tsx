"use client";

/**
 * Saker-artefaktet — «venter på deg»-køen, gruppert på status med
 * kanal-filter. Fasit: jarvis/meg-saker.html (statusgrupper, kanal-faner,
 * anrop-radvariant). Klikk på en rad åpner «sak»-artefaktet for den saken.
 */
import { useMemo, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { InspektorBlokk, InspektorTom } from "@/components/v2/inspektorpanel";
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import { tidIgjenMs } from "@/lib/jarvis/en-ting-na";

const KANAL_IKON: Record<SakKanal, string> = {
  [SakKanal.EPOST]: "mail",
  [SakKanal.SMS]: "message-square",
  [SakKanal.IMESSAGE]: "message-circle",
  [SakKanal.TELEGRAM]: "send",
  [SakKanal.ANROP]: "phone",
  [SakKanal.KALENDER]: "calendar",
  [SakKanal.TASK]: "check-circle",
};

const KANAL_LABEL: Record<SakKanal, string> = {
  [SakKanal.EPOST]: "E-post",
  [SakKanal.SMS]: "SMS",
  [SakKanal.IMESSAGE]: "iMessage",
  [SakKanal.TELEGRAM]: "Telegram",
  [SakKanal.ANROP]: "Anrop",
  [SakKanal.KALENDER]: "Kalender",
  [SakKanal.TASK]: "Oppgave",
};

const STATUS_GRUPPE: { status: SakStatus; label: string }[] = [
  { status: SakStatus.VENTER, label: "Venter på deg" },
  { status: SakStatus.GODKJENT, label: "Godkjent" },
  { status: SakStatus.UTFORT, label: "Utført" },
  { status: SakStatus.AVVIST, label: "Avvist" },
  { status: SakStatus.UTLOPT, label: "Utløpt" },
];

function sladTid(sak: Sak, na: Date): string {
  const ms = tidIgjenMs(sak, na);
  if (ms === null) return "Ingen frist";
  const min = Math.round(Math.abs(ms) / 60000);
  const t = min >= 60 ? `${Math.floor(min / 60)}t ${min % 60}min` : `${min}min`;
  return ms < 0 ? `${t} over frist` : `${t} igjen`;
}

export function SakerArtefakt({
  saker,
  na,
  onVelgSak,
  feil,
  laster,
}: {
  saker: Sak[];
  na: Date;
  onVelgSak: (id: string) => void;
  feil?: boolean;
  laster?: boolean;
}) {
  const [kanalFilter, setKanalFilter] = useState<SakKanal | null>(null);

  const kanalerMedTreff = useMemo(() => {
    const set = new Set(saker.map((s) => s.kanal));
    return (Object.values(SakKanal) as SakKanal[]).filter((k) => set.has(k));
  }, [saker]);

  const filtrert = kanalFilter ? saker.filter((s) => s.kanal === kanalFilter) : saker;

  if (laster) {
    return (
      <div data-od-id="state-saker-laster" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 56, borderRadius: T.rTag, background: T.panel2 }} />
        ))}
      </div>
    );
  }

  if (feil) {
    return (
      <InspektorTom tittel="Fikk ikke hentet saker" tekst="Prøv å laste inn på nytt om et øyeblikk." />
    );
  }

  if (saker.length === 0) {
    return <InspektorTom tittel="Ingenting venter" tekst="Køen er tom. Nye saker dukker opp her når de kommer inn." />;
  }

  return (
    <div data-od-id="panel-saker" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {kanalerMedTreff.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label="Filtrer på kanal">
          <button
            type="button"
            onClick={() => setKanalFilter(null)}
            data-od-id="kanal-filter-alle"
            aria-pressed={kanalFilter === null}
            style={sjappStil(kanalFilter === null)}
          >
            Alle
          </button>
          {kanalerMedTreff.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKanalFilter(k)}
              data-od-id={`kanal-filter-${k.toLowerCase()}`}
              aria-pressed={kanalFilter === k}
              style={sjappStil(kanalFilter === k)}
            >
              <Icon name={KANAL_IKON[k]} size={12} strokeWidth={1.8} />
              {KANAL_LABEL[k]}
            </button>
          ))}
        </div>
      )}

      {STATUS_GRUPPE.map(({ status, label }) => {
        const rader = filtrert.filter((s) => s.status === status);
        if (rader.length === 0) return null;
        return (
          <InspektorBlokk key={status} label={`${label} · ${rader.length}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rader.map((sak) => (
                <button
                  key={sak.id}
                  type="button"
                  onClick={() => onVelgSak(sak.id)}
                  data-od-id={`sak-rad-${sak.id}`}
                  className="v2-press v2-focus"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: sak.kanal === SakKanal.ANROP ? "10px 10px" : "8px 10px",
                    borderRadius: T.rTag,
                    border: `1px solid ${T.borderS}`,
                    background: T.panel2,
                    textAlign: "left",
                    cursor: "pointer",
                    minWidth: 0,
                  }}
                >
                  <span style={{ flex: "none", color: T.mut }}>
                    <Icon name={KANAL_IKON[sak.kanal]} size={15} strokeWidth={1.7} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: T.ui,
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: T.fg,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sak.avsender ?? "Ukjent avsender"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: T.ui,
                        fontSize: 11.5,
                        color: T.mut,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sak.kanal === SakKanal.ANROP ? "Ubesvart anrop" : (sak.emne ?? sak.innhold)}
                    </span>
                  </span>
                  {status === SakStatus.VENTER && (
                    <span
                      style={{
                        flex: "none",
                        fontFamily: T.mono,
                        fontSize: 10.5,
                        color: (tidIgjenMs(sak, na) ?? 1) < 0 ? T.down : T.mut,
                      }}
                    >
                      {sladTid(sak, na)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </InspektorBlokk>
        );
      })}
    </div>
  );
}

function sjappStil(aktiv: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    minHeight: 28,
    padding: "0 10px",
    borderRadius: T.rPill,
    border: `1px solid ${aktiv ? T.fg : T.border}`,
    background: aktiv ? T.panel3 : "transparent",
    color: aktiv ? T.fg : T.mut,
    fontFamily: T.ui,
    fontSize: 11.5,
    fontWeight: 500,
    cursor: "pointer",
  };
}
