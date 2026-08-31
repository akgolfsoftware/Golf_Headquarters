/**
 * AK Golf HQ — markedsside ANLEGG-DETALJ (/anlegg/[slug]), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html (§detalj).
 * Ekte copy speilet fra (mlegacy)/anlegg/[slug]/page.tsx.
 */
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/v2";
import { PkShell } from "./kit/PkShell";
import { PkSek, PkEyebrow, PkHero, PkCta, PkDetalj, PkFakta, PkLinje, PkSekt, PkKat } from "./kit/PkPrimitives";

export type AnleggHighlight = { icon: string; title: string; description: string };
export type AnleggData = {
  slug: string;
  name: string;
  adresse: string;
  heroImage: string;
  heroAlt: string;
  tagline: string;
  highlights: AnleggHighlight[];
  gallery: { src: string; alt: string; label: string };
  logo: { src: string; alt: string; width: number; height: number };
  kontakt: { telefon: string; epost: string };
  ctaBlurb: string;
  websiteUrl: string;
  websiteHost: string;
  greenfeeUrl: string;
  greenfeeFrom: string;
  membershipUrl: string;
  membershipFrom: string;
  membershipBlurb: string;
};

export function MarkedAnleggDetaljV2({ data }: { data: AnleggData }) {
  const clubLinks = [
    {
      icon: "external-link",
      eyebrow: "Offisiell side",
      title: "Klubbens nettside",
      description: "Banekart, restaurant, åpningstider og klubb-info.",
      cta: data.websiteHost,
      href: data.websiteUrl,
    },
    {
      icon: "credit-card",
      eyebrow: "Greenfee",
      title: "Book greenfee",
      description: "Spill banen som gjest. Bestill starttid direkte hos klubben.",
      cta: `Fra ${data.greenfeeFrom} kr`,
      href: data.greenfeeUrl,
    },
    {
      icon: "user",
      eyebrow: "Medlemskap",
      title: "Bli medlem",
      description: data.membershipBlurb,
      cta: `Fra ${data.membershipFrom} kr / år`,
      href: data.membershipUrl,
    },
  ];

  return (
    <PkShell aktiv="/anlegg" dataSlug="marketing-anlegg-detalj">
      <PkSek>
        <nav className="pk-eyebrow" aria-label="Brødsmuler" style={{ marginBottom: 16 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            Hjem
          </Link>{" "}
          ·{" "}
          <Link href="/anlegg" style={{ textDecoration: "none", color: "inherit" }}>
            Anlegg
          </Link>{" "}
          · {data.name}
        </nav>
        <PkDetalj>
          <div>
            <div style={{ position: "relative", aspectRatio: "16 / 9", width: "100%", borderRadius: "var(--tl-r-field)", overflow: "hidden", marginBottom: 24, background: "var(--tl-dock)" }}>
              <Image src={data.heroImage} alt={data.heroAlt} fill sizes="(max-width: 900px) 100vw, 760px" style={{ objectFit: "cover" }} priority />
            </div>
            <PkEyebrow>Anlegg</PkEyebrow>
            <div style={{ marginTop: 8 }}>
              <PkHero>{data.name}</PkHero>
            </div>
            <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--tl-font-sans)", fontSize: 14, color: "var(--tl-mute)", margin: "12px 0 0" }}>
              <Icon name="map-pin" size={15} style={{ color: "var(--tl-warm)", flex: "none" }} />
              {data.adresse}
            </p>
            <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 18, color: "var(--tl-mute)", lineHeight: 1.6, marginTop: 16, maxWidth: 520 }}>
              {data.tagline}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 28 }}>
              {data.highlights.map((h, i) => (
                <div key={h.title} className="pk-kort pk-kort-pad">
                  <span
                    style={{
                      display: "inline-flex",
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      background: "var(--tl-dock)",
                    }}
                  >
                    <Icon name={h.icon} size={17} style={{ color: "var(--tl-warm)" }} />
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: 12,
                      fontFamily: "var(--tl-font-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--tl-mute)",
                    }}
                  >
                    0{i + 1} / 0{data.highlights.length}
                  </span>
                  <span className="pk-navn" style={{ marginTop: 2, fontSize: 16 }}>
                    {h.title}
                  </span>
                  <p style={{ fontSize: 13 }}>{h.description}</p>
                </div>
              ))}
            </div>
          </div>

          <PkFakta>
            <span
              style={{
                display: "block",
                marginBottom: 10,
                fontFamily: "var(--tl-font-mono)",
                fontSize: 10,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--tl-mute)",
              }}
            >
              Kontakt
            </span>
            <PkLinje label="Telefon" verdi={data.kontakt.telefon} />
            <PkLinje label="E-post" verdi={data.kontakt.epost} />
            <PkLinje label="Adresse" verdi={data.adresse} />
            <div style={{ marginTop: 16 }}>
              <PkCta href={`tel:${data.kontakt.telefon.replace(/\s/g, "")}`} clay>
                Ring klubben
              </PkCta>
            </div>
          </PkFakta>
        </PkDetalj>
      </PkSek>

      <PkSek tett notop>
        <PkEyebrow>For gjester og medlemmer</PkEyebrow>
        <div style={{ marginTop: 8 }}>
          <PkSekt>Tre veier inn</PkSekt>
        </div>
        <PkKat>
          {clubLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="pk-kort pk-kort-hover">
              <div className="pk-kort-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 9, background: "var(--tl-dock)" }}>
                    <Icon name={l.icon} size={15} style={{ color: "var(--tl-warm)" }} />
                  </span>
                  <span className="pk-meta">{l.eyebrow}</span>
                </div>
                <span className="pk-navn" style={{ fontSize: 17 }}>
                  {l.title}
                </span>
                <p style={{ fontSize: 12.5 }}>{l.description}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid var(--tl-hair)",
                  }}
                >
                  <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 11, fontWeight: 700 }}>{l.cta}</span>
                  <Icon name="arrow-right" size={13} style={{ color: "var(--tl-warm)" }} />
                </div>
              </div>
            </a>
          ))}
        </PkKat>
      </PkSek>

      <PkSek notop>
        <div className="pk-kort pk-kort-tint" style={{ textAlign: "center" }}>
          <div className="pk-kort-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Image src={data.logo.src} alt={data.logo.alt} width={data.logo.width} height={data.logo.height} style={{ opacity: 0.85 }} />
            <span
              style={{
                fontFamily: "var(--tl-font-mono)",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--tl-mute)",
                marginTop: 18,
              }}
            >
              AK Golf Academy
            </span>
            <div style={{ marginTop: 8 }}>
              <PkSekt>Vi trener her</PkSekt>
            </div>
            <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14.5, color: "var(--tl-mute)", margin: "12px auto 0", maxWidth: 480 }}>
              {data.ctaBlurb}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <PkCta href="/booking" clay>
                Se tilgjengelige tider
              </PkCta>
              <PkCta href="/anlegg" ghost small>
                Se alle anlegg
              </PkCta>
            </div>
          </div>
        </div>
      </PkSek>
    </PkShell>
  );
}
