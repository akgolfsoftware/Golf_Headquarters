import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/* Kilde: designsystem/ak-golf/components/flate/Fotokort.jsx.
   Bilde med bildetekst, og eventuelt tekst lagt over med mørkt sjikt fra
   bunnen. Sjiktet er en gradering, ikke et lag over hele bildet.

   Masterens <img> er byttet til next/image med `fill` (planen Task 7 steg 3).
   `sizes` er derfor lagt til som prop — uten den laster Next fullbredde-bildet
   på mobil. */

export function Fotokort({
  bilde,
  alt,
  bildetekst,
  kilde,
  tekstOver,
  forhold = "3 / 2",
  hoyde,
  sizes = "(max-width: 768px) 100vw, 50vw",
  prioritert = false,
  style,
}: {
  bilde: string;
  alt: string;
  bildetekst?: string;
  kilde?: string;
  tekstOver?: ReactNode;
  forhold?: string;
  hoyde?: number | string;
  sizes?: string;
  prioritert?: boolean;
  style?: CSSProperties;
}) {
  return (
    <figure style={{ margin: 0, ...style }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--ak-hjorne-md)",
          aspectRatio: hoyde ? undefined : forhold,
          height: hoyde,
          background: "var(--ak-grunn-senk)",
        }}
      >
        <Image src={bilde} alt={alt} fill sizes={sizes} priority={prioritert} style={{ objectFit: "cover" }} />
        {tekstOver && (
          <>
            {/* Mørkt sjikt fra bunnen — en gradering, ikke et lag over hele bildet. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(20,20,19,0.82) 0%, rgba(20,20,19,0.55) 34%, rgba(20,20,19,0) 68%)",
              }}
            />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "var(--ak-r-5)" }}>
              {tekstOver}
            </div>
          </>
        )}
      </div>
      {(bildetekst || kilde) && (
        <figcaption
          style={{
            marginTop: "var(--ak-r-3)",
            display: "flex",
            gap: "var(--ak-r-3)",
            alignItems: "baseline",
            fontSize: "var(--ak-t-13)",
            color: "var(--ak-dempet)",
            maxWidth: "52ch",
          }}
        >
          <span>{bildetekst}</span>
          {kilde && (
            <span className="ak-maalt" style={{ color: "var(--ak-svak)", whiteSpace: "nowrap" }}>
              {kilde}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
