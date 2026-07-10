"use client";

/**
 * AK Golf HQ v2 — markedsside COACH-DETALJ (/coacher/[slug]), retning C, mørk.
 * Ekte copy speilet fra (mlegacy)/coacher/[slug]/page.tsx. Bruker delt
 * marked-ramme (marked-ramme.tsx).
 */
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, AvatarInit } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, MCta, Seksjon, useMobile } from "./marked-ramme";

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
  const mobile = useMobile();
  const fornavn = c.navn.split(" ")[0];
  return (
    <MRamme mobile={mobile} aktiv="coacher">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 24 : 32, alignItems: mobile ? "flex-start" : "center" }}>
          <AvatarInit navn={c.navn} size={mobile ? 72 : 96} />
          <div>
            <Eyebrow>Coach</Eyebrow>
            <HeroT mobile={mobile}>{c.navn}</HeroT>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="badge-check" size={15} style={{ color: T.lime }} />
              {c.tittel}
            </p>
          </div>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: T.body + 3, color: T.fg2, lineHeight: 1.6, marginTop: 24, maxWidth: 640 }}>{c.intro}</p>
      </Seksjon>

      {/* Bio */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
          {c.bio.map((p, i) => (
            <p key={i} style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.7, margin: 0 }}>
              {p}
            </p>
          ))}
        </div>
      </Seksjon>

      {/* Erfaring + spesialiteter */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap }}>
          <Kort pad="24px" eyebrow="Erfaring">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              {c.erfaring.map((e) => (
                <span key={e} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55 }}>
                  <Icon name="trophy" size={14} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
                  {e}
                </span>
              ))}
            </div>
          </Kort>
          <Kort pad="24px" eyebrow="Spesialiteter">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              {c.spesialiteter.map((s) => (
                <span key={s} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55 }}>
                  <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
                  {s}
                </span>
              ))}
            </div>
          </Kort>
        </div>
      </Seksjon>

      {/* Booking-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"} style={{ textAlign: mobile ? "left" : "center" }}>
          <SeksT mobile={mobile}>{`Book med ${fornavn}`}</SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px auto 0", maxWidth: 440 }}>
            Velg tid som passer deg, bekreftelse på e-post umiddelbart.
          </p>
          <div style={{ display: "flex", justifyContent: mobile ? "flex-start" : "center", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <MCta icon="arrow-right" href="/booking">
              Book time
            </MCta>
            <MCta ghost icon="mail" href="mailto:post@akgolf.no">
              Send melding
            </MCta>
          </div>
        </Kort>
        <div style={{ marginTop: 18 }}>
          <MCta ghost small icon="arrow-left" href="/coacher">
            Alle coacher
          </MCta>
        </div>
      </Seksjon>
    </MRamme>
  );
}
