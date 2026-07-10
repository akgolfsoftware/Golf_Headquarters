"use client";

/**
 * AK Golf HQ v2 — markedsside BLOGG-DETALJ (/blogg/[slug]), retning C, mørk.
 * Ekte copy speilet fra (mlegacy)/blogg/[slug]/page.tsx.
 */
import Image from "next/image";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2";
import { MRamme, HeroT, MCta, Seksjon, useMobile } from "./marked-ramme";
import type { BlogPost } from "@/app/(marketing)/(mlegacy)/blogg/posts";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });

export function MarkedBloggDetaljV2({ post }: { post: BlogPost }) {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="blogg">
      {/* Hero-bilde */}
      <div style={{ position: "relative", aspectRatio: mobile ? "4 / 3" : "16 / 7", width: "100%", background: T.panel2 }}>
        <Image src={post.bilde} alt={post.tittel} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,14,13,0.15) 0%, rgba(13,14,13,0.85) 100%)" }} />
      </div>

      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <MCta ghost small icon="arrow-left" href="/blogg">
          Tilbake til blogg
        </MCta>
        <div style={{ marginTop: 20, maxWidth: 760 }}>
          <HeroT mobile={mobile}>{post.tittel}</HeroT>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginTop: 20, fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="calendar" size={14} style={{ color: T.lime }} />
              {NB_DATE.format(new Date(post.dato))}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="user" size={14} style={{ color: T.lime }} />
              {post.forfatter}
            </span>
          </div>
        </div>
      </Seksjon>

      {/* Innhold */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontFamily: T.disp, fontStyle: "italic", fontSize: mobile ? 17 : 19, color: T.fg2, lineHeight: 1.5, margin: 0 }}>{post.ingress}</p>
          {post.innhold.map((p, i) => (
            <p key={i} style={{ fontFamily: T.ui, fontSize: 15.5, color: T.fg2, lineHeight: 1.75, margin: 0 }}>
              {p}
            </p>
          ))}
        </div>
      </Seksjon>

      {/* Til oversikten */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 12 : 20 }}>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 28 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, letterSpacing: "-0.015em" }}>Les flere innlegg</span>
          <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
            Tanker fra coachene om trening, struktur og hva som faktisk flytter scoren.
          </p>
          <div style={{ marginTop: 18 }}>
            <MCta ghost icon="arrow-left" href="/blogg">
              Til oversikten
            </MCta>
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
