/**
 * /portal/meg/innstillinger/personvern — B-pakke.
 * Status først, én grønn eksport-CTA, sletting sekundært.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, TilbakeLenke, StatusPill, Icon } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PersonvernActions } from "./personvern-actions";

export const dynamic = "force-dynamic";

export default async function PersonvernPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
      }}
    >
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Innstillinger · Personvern</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="kontroll">Dine data, din</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "42ch" }}>
            Last ned dine data, se hvordan vi lagrer dem, eller be om sletting.
          </p>
        </div>
        <StatusPill tone="info">GDPR</StatusPill>
      </div>

      <Kort>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: T.panel3,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="download" size={16} style={{ color: T.fg2 }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, letterSpacing: "-0.02em" }}>
              Last ned dine data
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "6px 0 0", lineHeight: 1.5 }}>
              Få en fil med profil, runder, økter, mål, betalinger, varsler og meldinger.
            </p>
            <PersonvernActions kind="export" />
          </div>
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="shield" size={14} style={{ color: T.fg2 }} />
          <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.fg }}>
            Hvordan vi behandler dataene dine
          </span>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { t: "Lagring", d: "Alle data lagres kryptert i EU (Supabase)." },
            { t: "Betaling", d: "Kortdata håndteres kun av Stripe. Vi lagrer aldri kortnummer." },
            { t: "E-post", d: "Kun nødvendige e-poster (booking, plan, varsler) — ikke reklame uten samtykke." },
          ].map((r) => (
            <li key={r.t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name="lock" size={13} style={{ color: T.mut, marginTop: 2, flex: "none" }} />
              <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                <strong style={{ color: T.fg, fontWeight: 600 }}>{r.t}:</strong> {r.d}
              </span>
            </li>
          ))}
        </ul>
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: "14px 0 0", lineHeight: 1.5 }}>
          Mer i{" "}
          <Link href="/personvern" style={{ color: T.forest, fontWeight: 600, textDecoration: "none" }}>
            personvernerklæringen
          </Link>
          . Spørsmål?{" "}
          <a href="mailto:post@akgolf.no" style={{ color: T.forest, fontWeight: 600, textDecoration: "none" }}>
            post@akgolf.no
          </a>
        </p>
      </Kort>

      <Kort style={{ borderColor: `color-mix(in srgb, ${T.down} 28%, ${T.border})` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `color-mix(in srgb, ${T.down} 12%, ${T.panel})`,
              border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="trash-2" size={16} style={{ color: T.down }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, letterSpacing: "-0.02em" }}>
              Slett kontoen din
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "6px 0 0", lineHeight: 1.5 }}>
              Forespørselen vurderes av coach/admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde.
              Avidentifisert treningshistorikk beholdes.
            </p>
            <PersonvernActions kind="delete" />
          </div>
        </div>
      </Kort>
    </div>
    </V2Shell>
  );
}
