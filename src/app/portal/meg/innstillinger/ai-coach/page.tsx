/**
 * AI Coach — /portal/meg/innstillinger/ai-coach — B-pakke.
 * Oversikt først, én grønn CTA (disabled til V2), vei videre til hjelp.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, TilbakeLenke, StatusPill, CTAPill, Icon } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";

export const dynamic = "force-dynamic";

const FAQ = [
  { q: "Hva kan AI-coachen ikke gjøre?", a: "Den erstatter ikke coach. Den foreslår basert på dine tall — du bestemmer." },
  { q: "Er AI-data privat?", a: "Ja. Dataene dine brukes bare til din egen assistent, ikke til å trene andres modell." },
  { q: "Erstatter AI-coachen Anders?", a: "Nei. Den er et ekstra lag mellom øktene — coach-beslutninger står fast." },
] as const;

const FEATURES = [
  "Analyserer SG-data og foreslår øvelser",
  "Ukentlig AI-rapport til deg og coach",
  "Svarer på golfspørsmål basert på dine data",
] as const;

export default async function AiCoachPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
      }}
    >
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Innstillinger · AI</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="coach">AI</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "36ch" }}>
            Personlig assistent som leser dataene dine og foreslår neste steg.
          </p>
        </div>
        <StatusPill tone="info">Kommer snart</StatusPill>
      </div>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: T.lime,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="sparkles" size={18} style={{ color: T.onLime }} />
          </span>
          <div>
            <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>
              Hva AI-coach gjør
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 2 }}>
              Personlig · datadrevet · coach-assistent
            </div>
          </div>
        </div>
        <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Icon name="check" size={14} style={{ color: T.up, marginTop: 2, flex: "none" }} />
              <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.45 }}>{f}</span>
            </li>
          ))}
        </ul>
      </Kort>

      <Kort pad="0">
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}` }}>
          <Caps>Ofte stilte spørsmål</Caps>
        </div>
        {FAQ.map((item, i) => (
          <div
            key={item.q}
            style={{
              padding: "14px 18px",
              borderBottom: i < FAQ.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{item.q}</div>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 4, lineHeight: 1.5 }}>{item.a}</div>
          </div>
        ))}
      </Kort>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ opacity: 0.45, pointerEvents: "none" }} aria-disabled="true">
          <CTAPill icon="sparkles" full>
            Aktiver AI-coach (kommer)
          </CTAPill>
        </div>
        <Link href="/portal/meg/help" style={{ textDecoration: "none", textAlign: "center" }}>
          <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.forest }}>
            Les mer i hjelpesenteret →
          </span>
        </Link>
      </div>
    </div>
    </V2Shell>
  );
}
