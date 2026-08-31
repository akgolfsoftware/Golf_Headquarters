"use client";

/**
 * AgencyOS Tilgang & roller — Train-lock (T13, 27.08.2026), «Roller»-fanen.
 *
 * Designport av `AdminTilgangV2` (Paper) — read-only CBAC-matrise. Ingen
 * egen fasit tegner denne skjermen, så layouten er en mønster-port til
 * tl-kit, ikke pixel.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2. Ikonet for «tillatt» bruker
 * TL.text (ikke en fargekodet grønn) — invariantens forbud mot generell
 * fargekoding gjelder også her.
 */

import Link from "next/link";
import type { UserRole } from "@/generated/prisma/client";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { TlBadge, TlKnapp, TlKort, TlTittel, TlTomTilstand } from "./tl-kit";

export interface AdminTilgangV2Row {
  id: string;
  beskrivelse: string;
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
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label={ok ? "Tillatt" : "Ikke tillatt"}>
      {ok ? <Icon name="check" size={16} style={{ color: TL.text }} /> : <Icon name="minus" size={16} style={{ color: TL.mute, opacity: 0.5 }} />}
    </span>
  );
}

function TilgangTabell({ roller, rader }: { roller: UserRole[]; rader: AdminTilgangV2Row[] }) {
  const th: React.CSSProperties = {
    padding: "9px 12px",
    textAlign: "left",
    fontFamily: TL.font.mono,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: TL.mute,
    borderBottom: `1px solid ${TL.hair}`,
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
              borderBottom: last ? "none" : `1px solid ${TL.hair}`,
              verticalAlign: "middle",
            };
            return (
              <tr key={rad.id}>
                <td style={bd}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: TL.text }}>{rad.beskrivelse}</span>
                  <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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

export function AdminTilgangTrainLock({
  roller,
  rader,
  somFane = false,
}: {
  roller: UserRole[];
  rader: AdminTilgangV2Row[];
  /** True når komponenten står som «Tilgang»-fanen i /admin/oppsett (MASTERPLAN 15.3). */
  somFane?: boolean;
}) {
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        {!somFane && <TlTittel sub="AgencyOS">Tilgang</TlTittel>}
        <p style={{ marginTop: somFane ? 0 : 10, fontSize: 13, color: TL.mute, lineHeight: 1.6 }}>Hvilke handlinger hver rolle kan utføre i plattformen.</p>
      </div>
      <TlBadge>Read-only</TlBadge>
    </div>
  );

  const primaerCta = (
    <TlKnapp variant="primaer" icon="shield" href="/admin/audit-log" full>
      Åpne audit-log
    </TlKnapp>
  );

  const infoRad = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, borderRadius: TL.radius.card, background: TL.dock, boxShadow: `inset 0 0 0 1px ${TL.hair}`, padding: "14px 16px" }}>
      <Icon name="info" size={16} style={{ color: TL.mute, flex: "none", marginTop: 2 }} />
      <p style={{ margin: 0, fontSize: 12.5, color: TL.mute, lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700, color: TL.text }}>Read-only.</span> For å endre tilgang, kontakt utvikler. Alle senere endringer
        logges i AuditLog med hvem og når.
      </p>
    </div>
  );

  const forklaring = (
    <TlKort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Icon name="shield" size={16} style={{ color: TL.text, flex: "none", marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>Hvordan tilgangsstyring fungerer</div>
          <p style={{ marginTop: 8, fontSize: 12.5, color: TL.mute, lineHeight: 1.6 }}>
            CBAC (Capability-Based Access Control) kobler hver rolle til et sett tillatte handlinger. Endringer på matrisen krever
            koderefaktor i dag, men er forberedt for per-organisasjons overrides i databasen. Alle endringer logges og kan granskes på{" "}
            <Link href="/admin/audit-log" style={{ color: TL.text, fontWeight: 700, textDecoration: "underline" }}>
              /admin/audit-log
            </Link>
            .
          </p>
        </div>
      </div>
    </TlKort>
  );

  if (rader.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {hode}
        <TlKort>
          <TlTomTilstand icon="shield" title="Ingen capabilities lastet" sub="Matrisen kommer fra CBAC-tabellen — sjekk konfigurasjonen." />
        </TlKort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {hode}
      {primaerCta}
      {infoRad}
      <TlKort pad="8px 8px 4px">
        <TilgangTabell roller={roller} rader={rader} />
      </TlKort>
      {forklaring}
    </div>
  );
}
