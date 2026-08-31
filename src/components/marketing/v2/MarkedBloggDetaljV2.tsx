/**
 * AK Golf HQ — markedsside BLOGG-DETALJ (/blogg/[slug]), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html (§detalj).
 * Ekte copy speilet fra (mlegacy)/blogg/[slug]/page.tsx.
 */
import Image from "next/image";
import { Icon } from "@/components/v2";
import { PkShell } from "./kit/PkShell";
import { PkSek, PkHero, PkProsa, PkCta } from "./kit/PkPrimitives";
import type { BlogPost } from "@/app/(marketing)/(mlegacy)/blogg/posts";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });

export function MarkedBloggDetaljV2({ post }: { post: BlogPost }) {
  return (
    <PkShell aktiv="/blogg" dataSlug="marketing-blogg-detalj">
      <div style={{ position: "relative", aspectRatio: "16 / 7", width: "100%", background: "var(--tl-dock)" }}>
        <Image src={post.bilde} alt={post.tittel} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
      </div>

      <PkSek>
        <PkCta href="/blogg" ghost small icon="arrow-left">
          Tilbake til blogg
        </PkCta>
        <div style={{ marginTop: 20, maxWidth: 760 }}>
          <PkHero>{post.tittel}</PkHero>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginTop: 16, fontFamily: "var(--tl-font-sans)", fontSize: 13, color: "var(--tl-mute)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="calendar" size={14} style={{ color: "var(--tl-warm)" }} />
              {NB_DATE.format(new Date(post.dato))}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="user" size={14} style={{ color: "var(--tl-warm)" }} />
              {post.forfatter}
            </span>
          </div>
        </div>
      </PkSek>

      <PkSek notop>
        <PkProsa>
          <p style={{ fontFamily: "var(--tl-font-sans)", fontStyle: "italic", fontSize: 19, color: "var(--tl-mute)" }}>{post.ingress}</p>
          {post.innhold.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </PkProsa>
      </PkSek>

      <PkSek notop>
        <div style={{ borderTop: "1px solid var(--tl-hair)", paddingTop: 28 }}>
          <span style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 20, color: "var(--tl-text)" }}>Les flere innlegg</span>
          <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14.5, color: "var(--tl-mute)", lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
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
