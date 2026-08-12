/**
 * AK Golf HQ — markedsside BLOGG-DETALJ (/blogg/[slug]), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html (§detalj).
 * Ekte copy speilet fra (mlegacy)/blogg/[slug]/page.tsx.
 */
import Image from "next/image";
import { Icon } from "@/components/v2";
import { PkShell } from "./paper/PkShell";
import { PkSek, PkHero, PkProsa, PkCta } from "./paper/PkPrimitives";
import type { BlogPost } from "@/app/(marketing)/(mlegacy)/blogg/posts";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });

export function MarkedBloggDetaljV2({ post }: { post: BlogPost }) {
  return (
    <PkShell aktiv="/blogg" dataSlug="marketing-blogg-detalj">
      <div style={{ position: "relative", aspectRatio: "16 / 7", width: "100%", background: "var(--p-soft)" }}>
        <Image src={post.bilde} alt={post.tittel} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
      </div>

      <PkSek>
        <PkCta href="/blogg" ghost small icon="arrow-left">
          Tilbake til blogg
        </PkCta>
        <div style={{ marginTop: 20, maxWidth: 760 }}>
          <PkHero>{post.tittel}</PkHero>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginTop: 16, fontFamily: "var(--p-ui)", fontSize: 13, color: "var(--p-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="calendar" size={14} style={{ color: "var(--p-accent-fg)" }} />
              {NB_DATE.format(new Date(post.dato))}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="user" size={14} style={{ color: "var(--p-accent-fg)" }} />
              {post.forfatter}
            </span>
          </div>
        </div>
      </PkSek>

      <PkSek notop>
        <PkProsa>
          <p style={{ fontFamily: "var(--p-disp)", fontStyle: "italic", fontSize: 19, color: "var(--p-muted)" }}>{post.ingress}</p>
          {post.innhold.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </PkProsa>
      </PkSek>

      <PkSek notop>
        <div style={{ borderTop: "1px solid var(--p-border)", paddingTop: 28 }}>
          <span style={{ fontFamily: "var(--p-disp)", fontWeight: 600, fontSize: 20, color: "var(--p-fg)" }}>Les flere innlegg</span>
          <p style={{ fontFamily: "var(--p-body)", fontSize: 14.5, color: "var(--p-muted)", lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
            Tanker fra coachene om trening, struktur og hva som faktisk flytter scoren.
          </p>
          <div style={{ marginTop: 18 }}>
            <PkCta href="/blogg" ghost icon="arrow-left">
              Til oversikten
            </PkCta>
          </div>
        </div>
      </PkSek>
    </PkShell>
  );
}
