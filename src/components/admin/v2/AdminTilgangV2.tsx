"use client";

/**
 * AgencyOS Tilgang & roller — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Read-only CBAC-matrise. T.* only.
 */

import Link from "next/link";
import type { UserRole } from "@/generated/prisma/client";
import { Caps, Tittel, Kort, Icon, StatusPill, CTAPill, TomTilstand, T } from "@/components/v2";

export interface AdminTilgangV2Row {
  /** Capability-verdien (f.eks. "view_all_players") — vist som kode under beskrivelsen. */
  id: string;
  /** Norsk beskrivelse av capability. */
  beskrivelse: string;
  /** can(rolle, capability) for hver rolle i roller-lista. */
  tillatt: Record<UserRole, boolean>;
}

const ROLLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  COACH: "Coach",
  PLAYER: "Spiller",
  PARENT: "Forelder",
  GUEST: "Gjest",
};

function TilgangCelle({ ok }: { ok: boolean }) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      aria-label={ok ? "Tillatt" : "Ikke tillatt"}
    >
      {ok ? (
        <Icon name="check" size={16} style={{ color: T.lime }} />
      ) : (
        <Icon name="minus" size={16} style={{ color: T.mut, opacity: 0.5 }} />
      )}
    </span>
  );
}

function TilgangTabell({ roller, rader }: { roller: UserRole[]; rader: AdminTilgangV2Row[] }) {
  const th: React.CSSProperties = {
    padding: "9px 12px",
    textAlign: "left",
    fontFamily: T.mono,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.mut,
    borderBottom: `1px solid ${T.borderS}`,
    whiteSpace: "nowrap",
  };
  const thSentrert: React.CSSProperties = { ...th, textAlign: "center" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
        <thead>
          <tr>
            <th style={th}>Capability</th>
            {roller.map((rolle) => (
              <th key={rolle} style={thSentrert}>
                {ROLLE_LABEL[rolle]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.map((rad, i) => {
            const last = i === rader.length - 1;
            const bd: React.CSSProperties = {
              padding: "11px 12px",
              borderBottom: last ? "none" : `1px solid ${T.border}`,
              verticalAlign: "middle",
            };
            return (
              <tr key={rad.id}>
                <td style={bd}>
                  <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
                    {rad.beskrivelse}
                  </span>
                  <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {rad.id}
                  </span>
                </td>
                {roller.map((rolle) => (
                  <td key={rolle} style={{ ...bd, textAlign: "center" }}>
                    <TilgangCelle ok={rad.tillatt[rolle]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminTilgangV2({ roller, rader }: { roller: UserRole[]; rader: AdminTilgangV2Row[] }) {
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Innstillinger · Tilgang & roller · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="matrise.">Capability</Tittel>
        </div>
        <p style={{ marginTop: 10, fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6 }}>
          Hvilke handlinger hver rolle kan utføre i plattformen.
        </p>
      </div>
      <StatusPill tone="info">Read-only</StatusPill>
    </div>
  );

  const primaerCta = (
    <Link href="/admin/audit-log" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="shield" full>
        Åpne audit-log
      </CTAPill>
    </Link>
  );

  const infoRad = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        borderRadius: T.rCard,
        border: `1px solid ${T.border}`,
        background: T.panel2,
        padding: "14px 16px",
      }}
    >
      <Icon name="info" size={16} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700, color: T.fg }}>Read-only.</span> For å endre tilgang, kontakt
        utvikler. Alle senere endringer logges i AuditLog med hvem og når.
      </p>
    </div>
  );

  const forklaring = (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Icon name="shield" size={16} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>
            Hvordan tilgangsstyring fungerer
          </div>
          <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6 }}>
            CBAC (Capability-Based Access Control) kobler hver rolle til et sett tillatte handlinger.
            Endringer på matrisen krever koderefaktor i dag, men er forberedt for
            per-organisasjons overrides i databasen. Alle endringer logges og kan
            granskes på{" "}
            <Link href="/admin/audit-log" style={{ color: T.fg, fontWeight: 700, textDecoration: "underline" }}>
              /admin/audit-log
            </Link>
            .
          </p>
        </div>
      </div>
    </Kort>
  );

  if (rader.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand icon="shield" title="Ingen capabilities lastet" sub="Matrisen kommer fra CBAC-tabellen — sjekk konfigurasjonen." />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {infoRad}
      <Kort pad="8px 8px 4px">
        <TilgangTabell roller={roller} rader={rader} />
      </Kort>
      {forklaring}
    </div>
  );
}
