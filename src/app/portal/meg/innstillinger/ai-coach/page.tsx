/**
 * Caddie-innstillinger — /portal/meg/innstillinger/ai-coach — Precision Athletics.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { StatusPille } from "@/components/precision/pa";
import { Sparkles, Check, ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "Hva kan Caddie ikke gjøre?",
    a: "Caddie erstatter ikke coach. Caddie foreslår basert på dine tall — du og coach bestemmer.",
  },
  {
    q: "Er AI-data privat?",
    a: "Ja. Dataene dine brukes bare til din egen assistent og anonymiseres før forespørsel. De brukes aldri til å trene andre modeller.",
  },
  {
    q: "Erstatter Caddie treneren min?",
    a: "Nei. Caddie er en forberedelse og støtte mellom øktene — trenerens beslutninger og godkjenninger står alltid fast.",
  },
] as const;

const FEATURES = [
  "Analyserer runder og foreslår relevante øvelser",
  "Samler spørsmål og utkast klart til neste økt med coach",
  "Svarer på golfspørsmål basert på dine egne treningsdata",
] as const;

export default async function AiCoachPage() {
  await requirePortalUser({ kreverTilgang: "INGEN" });

  return (
    <PlayerHQSkall innboksHref="/portal/coach" uleste={0}>
      <div className="pa-side" style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {/* Tilbake og hode */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/portal/meg/innstillinger"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={14} />
            <span>Innstillinger</span>
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Innstillinger
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                }}
              >
                Caddie
              </h1>
            </div>

            <StatusPille tone="ok">Aktiv i PlayerHQ</StatusPille>
          </div>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13.5,
              color: "var(--text-muted)",
              lineHeight: 1.45,
            }}
          >
            Personlig assistent som leser treningsdataene dine og foreslår neste steg for deg og coachen.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Hva Caddie gjør */}
          <div
            className="pa-card"
            style={{
              padding: 20,
              background: "var(--surface-flat)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius)",
                  background: "var(--surface-sunken)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </span>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Hva Caddie gjør
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  PERSONLIG · DATADREVET · COACH-ASSISTENT
                </div>
              </div>
            </div>

            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Check
                    size={14}
                    style={{
                      color: "var(--signal)",
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      lineHeight: 1.45,
                    }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personvern og sikkerhet */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <ShieldCheck size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              Alle data pseudonymiseres i tråd med AK Golfs personverngarantier. Ingen personopplysninger deles eller lagres eksternt.
            </div>
          </div>

          {/* Ofte stilte spørsmål */}
          <div
            className="pa-card"
            style={{
              padding: 0,
              overflow: "hidden",
              background: "var(--surface-flat)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-hairline)",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Ofte stilte spørsmål
            </div>
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                style={{
                  padding: "14px 16px",
                  borderBottom:
                    i < FAQ.length - 1
                      ? "1px solid var(--border-hairline)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.q}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>

          {/* Handling videre */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <Link
              href="/portal/coach/ai"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 42,
                borderRadius: "var(--radius)",
                background: "var(--primary)",
                color: "var(--text-on-primary)",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Sparkles size={16} />
              <span>Åpne Caddie</span>
            </Link>

            <Link
              href="/portal/meg/hjelp"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--text-muted)",
                textDecoration: "none",
                textAlign: "center",
                padding: "4px 0",
              }}
            >
              <span>Les mer i hjelpesenteret</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </PlayerHQSkall>
  );
}
