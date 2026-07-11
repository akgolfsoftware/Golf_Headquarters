"use client";

/**
 * AK Golf HQ v2 — markedsside ANLEGG-DETALJ (/anlegg/[slug]), retning C, mørk.
 * Ekte copy speilet fra (mlegacy)/anlegg/[slug]/page.tsx.
 */
import Image from "next/image";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, MCta, Seksjon, useMobile } from "./marked-ramme";

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
  const mobile = useMobile();

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
    <MRamme mobile={mobile} aktiv="anlegg">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 24 : 40, alignItems: mobile ? "stretch" : "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>Anlegg</Eyebrow>
            <HeroT mobile={mobile}>{data.name}</HeroT>
            <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 14, color: T.fg2, marginTop: 16 }}>
              <Icon name="map-pin" size={15} style={{ color: T.lime, flex: "none" }} />
              {data.adresse}
            </p>
            <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.6, marginTop: 12, maxWidth: 520 }}>{data.tagline}</p>
          </div>
          <div style={{ position: "relative", width: mobile ? "100%" : 380, height: mobile ? 240 : 300, flex: "none", borderRadius: 24, border: `1px solid ${T.borderS}`, overflow: "hidden" }}>
            <Image src={data.heroImage} alt={data.heroAlt} fill sizes={mobile ? "100vw" : "380px"} style={{ objectFit: "cover" }} priority />
          </div>
        </div>
      </Seksjon>

      {/* Highlights */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          {data.highlights.map((h, i) => (
            <Kort key={h.title} pad="22px">
              <span style={{ display: "inline-flex", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, background: T.panel2 }}>
                <Icon name={h.icon} size={19} style={{ color: T.lime }} />
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, marginTop: 14, display: "block" }}>
                0{i + 1} / 0{data.highlights.length}
              </span>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 4, display: "block", letterSpacing: "-0.015em" }}>{h.title}</span>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{h.description}</p>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Galleri + kontakt */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr 0.9fr", gap: T.gap }}>
          <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden", background: T.panel2 }}>
            <Image src={data.gallery.src} alt={data.gallery.alt} fill sizes={mobile ? "100vw" : "55vw"} style={{ objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#fff",
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                padding: "6px 12px",
              }}
            >
              {data.gallery.label}
            </div>
          </div>

          <Kort pad="24px" eyebrow="Kontakt">
            <SeksT mobile={mobile}>Snakk med klubben</SeksT>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <KontaktRad icon="phone" label="Telefon" verdi={data.kontakt.telefon} />
              <KontaktRad icon="mail" label="E-post" verdi={data.kontakt.epost} />
              <KontaktRad icon="map-pin" label="Adresse" verdi={data.adresse} />
            </div>
            <div style={{ marginTop: 18 }}>
              <MCta icon="arrow-right" href={`tel:${data.kontakt.telefon.replace(/\s/g, "")}`}>
                Ring klubben
              </MCta>
            </div>
          </Kort>
        </div>
      </Seksjon>

      {/* Tre veier inn */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mut }}>For gjester og medlemmer</span>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile}>Tre veier inn</SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 20 }}>
          {clubLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Kort pad="20px" hover style={{ height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, background: T.panel2 }}>
                    <Icon name={l.icon} size={16} style={{ color: T.lime }} />
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mut }}>{l.eyebrow}</span>
                </div>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 14, display: "block", letterSpacing: "-0.015em" }}>{l.title}</span>
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{l.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>{l.cta}</span>
                  <Icon name="arrow-right" size={13} style={{ color: T.onLime, background: T.lime, borderRadius: 9999, padding: 5, boxSizing: "content-box" }} />
                </div>
              </Kort>
            </a>
          ))}
        </div>
      </Seksjon>

      {/* CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <Kort tint pad={mobile ? "26px 22px" : "40px"} style={{ textAlign: "center", alignItems: "center" }}>
          <Image src={data.logo.src} alt={data.logo.alt} width={data.logo.width} height={data.logo.height} style={{ opacity: 0.85 }} />
          <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mut, marginTop: 18, display: "block" }}>
            AK Golf Academy
          </span>
          <div style={{ marginTop: 8 }}>
            <SeksT mobile={mobile} em="Bli med.">Vi trener her.</SeksT>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "12px auto 0", maxWidth: 480 }}>{data.ctaBlurb}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 24, alignItems: "center" }}>
            <MCta icon="arrow-right" href="/booking">
              Se tilgjengelige tider
            </MCta>
            <MCta ghost small icon="arrow-right" href="/anlegg">
              Se alle anlegg
            </MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}

function KontaktRad({ icon, label, verdi }: { icon: string; label: string; verdi: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ display: "inline-flex", width: 28, height: 28, flex: "none", alignItems: "center", justifyContent: "center", borderRadius: 8, background: T.panel2 }}>
        <Icon name={icon} size={13} style={{ color: T.lime }} />
      </span>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.mut }}>{label}</div>
        <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, marginTop: 2 }}>{verdi}</div>
      </div>
    </div>
  );
}
