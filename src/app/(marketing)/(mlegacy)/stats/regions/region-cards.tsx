"use client";

/**
 * RegionCards — client wrapper for the 5 region cards.
 * onMouseEnter/onMouseLeave must live in a client component.
 */

import Link from "next/link";
import { REGIONER } from "@/lib/stats/klubb-til-region";

interface RegionItem {
  slug: string;
  navn: string;
  klubber: number;
  spillere: number;
  turneringer: number;
  pro: number;
}

interface Props {
  regions: RegionItem[];
}

export function RegionCards({ regions }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 16,
        marginTop: 32,
      }}
    >
      {regions.map((r) => {
        const regionInfo = REGIONER.find((ri) => ri.slug === r.slug);

        return (
          <Link key={r.slug} href={`/stats/regions/${r.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: regionInfo?.farge ?? "var(--s-secondary)",
                border: `1px solid var(--s-border)`,
                borderLeft: `3px solid ${regionInfo?.fargeStrong ?? "var(--s-primary)"}`,
                borderRadius: "var(--s-r-lg)",
                padding: 24,
                transition: "box-shadow .18s ease, transform .18s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--s-shadow-hover)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: regionInfo?.fargeStrong ?? "var(--s-primary)",
                  marginBottom: 16,
                }}
              >
                {r.navn.split("-")[0]}
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {r.navn}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {r.klubber}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--s-muted-fg)",
                      marginLeft: 6,
                    }}
                  >
                    klubber
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {r.spillere.toLocaleString("nb-NO")}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--s-muted-fg)",
                      marginLeft: 6,
                    }}
                  >
                    spillere
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  fontSize: 12,
                  color: regionInfo?.fargeStrong ?? "var(--s-primary)",
                  fontWeight: 500,
                }}
              >
                Utforsk {r.navn} →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
