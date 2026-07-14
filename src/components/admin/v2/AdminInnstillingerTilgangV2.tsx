/**
 * AgencyOS v2 — Innstillinger · Tilgang (`/admin/settings/tilgang`,
 * AgencyOS Bølge 3.34, 2026-07-14). Port fra `(legacy)/settings/tilgang/
 * page.tsx` — samme read-only CBAC-matrise (rolle × capability), samme
 * `can()`-oppslag fra `@/lib/auth/cbac`.
 */

import { Caps, Tittel, Kort, Icon, T } from "@/components/v2";

export interface TilgangRadV2 {
  capability: string;
  beskrivelse: string;
  tillatt: Record<string, boolean>;
}

export function AdminInnstillingerTilgangV2({ roller, rader }: { roller: string[]; rader: TilgangRadV2[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>Innstillinger · Tilgang & roller</Caps>
        <Tittel em="matrise">Capability</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Hvilke handlinger hver rolle kan utføre i plattformen.</p>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
        <Icon name="info" size={16} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
          <strong style={{ color: T.fg }}>Read-only.</strong> For å endre tilgang, kontakt utvikler. Alle senere endringer logges i AuditLog med actor og tidsstempel.
        </p>
      </div>

      <Kort pad="0">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, textAlign: "left" }}>
                <th style={{ padding: "14px 16px" }}><Caps size={9}>Capability</Caps></th>
                {roller.map((r) => (
                  <th key={r} style={{ padding: "14px 16px", textAlign: "center" }}><Caps size={9}>{r}</Caps></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rader.map((rad) => (
                <tr key={rad.capability} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: T.fg }}>{rad.beskrivelse}</div>
                    <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{rad.capability}</div>
                  </td>
                  {roller.map((r) => (
                    <td key={r} style={{ padding: "14px 16px", textAlign: "center" }} aria-label={rad.tillatt[r] ? "Tillatt" : "Ikke tillatt"}>
                      {rad.tillatt[r] ? (
                        <Icon name="check-circle" size={18} style={{ color: T.lime }} />
                      ) : (
                        <Icon name="minus" size={18} style={{ color: T.mut, opacity: 0.4 }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <Icon name="shield" size={18} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Hvordan tilgangsstyring fungerer</div>
            <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.55, color: T.mut }}>
              CBAC (Capability-Based Access Control) kobler hver rolle til et sett av tillatte handlinger. Endringer på matrisen krever koderefaktor i dag, men er forberedt for per-organisasjons overrides i DB. Alle endringer som logges via <code style={{ fontFamily: T.mono, fontSize: 11.5 }}>audit()</code>-funksjonen havner i AuditLog og kan auditeres på <strong style={{ color: T.fg }}>/admin/audit-log</strong>.
            </p>
          </div>
        </div>
      </Kort>
    </div>
  );
}
