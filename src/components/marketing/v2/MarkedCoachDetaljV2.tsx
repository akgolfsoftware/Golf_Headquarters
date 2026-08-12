/**
 * AK Golf HQ — markedsside COACH-DETALJ (/coacher/[slug]), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html (§detalj).
 * Ekte copy speilet fra (mlegacy)/coacher/[slug]/page.tsx.
 */
import Link from "next/link";
import { Icon } from "@/components/v2";
import { PkShell } from "./paper/PkShell";
import {
  PkSek,
  PkEyebrow,
  PkHero,
  PkProsa,
  PkCta,
  PkDetalj,
  PkFakta,
  PkLinje,
  PkBilde,
  PkSekt,
  PkKat,
  PkKort,
} from "./paper/PkPrimitives";

export type CoachProfil = {
  slug: string;
  navn: string;
  tittel: string;
  initialer: string;
  intro: string;
  bio: string[];
  erfaring: string[];
  spesialiteter: string[];
};

export function MarkedCoachDetaljV2({ c }: { c: CoachProfil }) {
  const fornavn = c.navn.split(" ")[0];
  return (
    <PkShell aktiv="/coacher" dataSlug="marketing-coacher-detalj">
      <PkSek>
        <nav className="pk-eyebrow" aria-label="Brødsmuler" style={{ marginBottom: 16 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            Hjem
          </Link>{" "}
          ·{" "}
          <Link href="/coacher" style={{ textDecoration: "none", color: "inherit" }}>
            Coacher
          </Link>{" "}
          · {c.navn}
        </nav>
        <PkDetalj>
          <div>
            <div style={{ marginBottom: 24 }}>
              <PkBilde label={`Bilde: ${c.navn} — 1920×1080`} />
            </div>
            <PkEyebrow>Coach</PkEyebrow>
            <div style={{ marginTop: 8 }}>
              <PkHero>{c.navn}</PkHero>
            </div>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--p-ui)",
                fontSize: 14,
                color: "var(--p-muted)",
                margin: "12px 0 0",
              }}
            >
              <Icon name="badge-check" size={15} style={{ color: "var(--p-accent-fg)" }} />
              {c.tittel}
            </p>
            <p
              style={{
                fontFamily: "var(--p-body)",
                fontSize: 18,
                color: "var(--p-muted)",
                lineHeight: 1.6,
                marginTop: 20,
                maxWidth: 640,
              }}
            >
              {c.intro}
            </p>
            <PkProsa>
              {c.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </PkProsa>
          </div>

          <PkFakta>
            <span
              style={{
                display: "block",
                marginBottom: 10,
                fontFamily: "var(--p-mono)",
                fontSize: 10,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--p-muted)",
              }}
            >
              Erfaring
            </span>
            {c.erfaring.map((e) => (
              <PkLinje key={e} label="" verdi={e} />
            ))}
            <span
              style={{
                display: "block",
                margin: "18px 0 10px",
                fontFamily: "var(--p-mono)",
                fontSize: 10,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--p-muted)",
              }}
            >
              Spesialiteter
            </span>
            {c.spesialiteter.map((s) => (
              <PkLinje key={s} label="" verdi={s} />
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <PkCta href="/booking" clay>
                {`Book med ${fornavn}`}
              </PkCta>
              <PkCta href="mailto:post@akgolf.no" ghost icon="mail">
                Send melding
              </PkCta>
            </div>
          </PkFakta>
        </PkDetalj>
      </PkSek>

      <PkSek tett notop>
        <PkSekt>Andre coacher</PkSekt>
        <PkKat>
          <PkKort href="/coacher" hover>
            <div className="pk-kort-body">
              <span className="pk-navn">Alle coacher</span>
              <span className="pk-lesmer">Se hele oversikten →</span>
            </div>
          </PkKort>
        </PkKat>
      </PkSek>
    </PkShell>
  );
}
