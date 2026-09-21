/**
 * AI Coach — /portal/meg/innstillinger/ai-coach — B-pakke.
 * Oversikt først, én grønn CTA (disabled til V2), vei videre til hjelp.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Kort, StatusPill, CTAPill, Icon } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";

export const dynamic = "force-dynamic";

const FAQ = [
  { q: "Hva kan AI-coachen ikke gjøre?", a: "Den erstatter ikke coach. Den foreslår basert på dine tall — du bestemmer." },
  // Funksjonen er ikke i drift, så det finnes ingen databehandling å beskrive
  // ennå. En bastant garanti her ville vært en påstand vi ikke kan stå inne
  // for (PH-12-kontroll 21.09.2026: ingen udokumenterte påstander om
  // modelltrening). Vilkårene oppgis når funksjonen faktisk kommer.
  { q: "Hva skjer med dataene mine?", a: "AI-coachen er ikke i drift, så ingen av dataene dine brukes av den i dag. Hvordan de behandles blir dokumentert her før den kan slås på." },
  { q: "Erstatter AI-coachen Anders?", a: "Nei. Den er et ekstra lag mellom øktene — coach-beslutninger står fast." },
] as const;

const FEATURES = [
  "Analyserer SG-data og foreslår øvelser",
  "Ukentlig AI-rapport til deg og coach",
  "Svarer på golfspørsmål basert på dine data",
] as const;

export default async function AiCoachPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
    <div
      data-paper-slug="playerhq-innstillinger"
      data-paper-portal-innstillinger-ai-coach
      style={{
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <InnstillingerHode
        tittel="AI-coach"
        undertekst="Innstillinger"
        tilbakeHref="/portal/meg/innstillinger"
        action={<StatusPill tone="info">Kommer snart</StatusPill>}
      />
      <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0, lineHeight: 1.45, maxWidth: "36ch" }}>
        Planlagt assistent som skal lese dataene dine og foreslå neste steg.
        Den er ikke i drift, og ingenting på denne siden kan slås på ennå.
      </p>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: TL.fill,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="sparkles" size={18} style={{ color: TL.onFill }} />
          </span>
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>
              Hva AI-coach skal gjøre
            </div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2 }}>
              Personlig · datadrevet · coach-assistent
            </div>
          </div>
        </div>
        <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              {/* Ikke et avkrysset punkt: ingenting av dette er bygget ennå. */}
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: TL.mute,
                  marginTop: 7,
                  flex: "none",
                }}
              />
              <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.45 }}>{f}</span>
            </li>
          ))}
        </ul>
      </Kort>

      <Kort pad="0">
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${TL.hair}` }}>
          <Caps>Ofte stilte spørsmål</Caps>
        </div>
        {FAQ.map((item, i) => (
          <div
            key={item.q}
            style={{
              padding: "14px 18px",
              borderBottom: i < FAQ.length - 1 ? `1px solid ${TL.hair}` : "none",
            }}
          >
            <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{item.q}</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, marginTop: 4, lineHeight: 1.5 }}>{item.a}</div>
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
          <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.fill }}>
            Les mer i hjelpesenteret →
          </span>
        </Link>
      </div>
    </div>
    </V2Shell>
  );
}
