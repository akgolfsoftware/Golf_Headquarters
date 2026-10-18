import Image from "next/image";
import type { ReactNode } from "react";

import { erAbonnementTjeneste } from "@/lib/booking/tjeneste-kategori";
import { prisma } from "@/lib/prisma";

/**
 * Felles byggesteiner for markedssidene i «AK Golf Precision Athletics»,
 * hentet fra forsiden (ForsidePrecision, PR #1414): samme bredde, samme
 * seksjonsrytme, samme rad og samme kort. Lyst tema, grafitt primærknapp,
 * kort med radius 8 og hårlinje, ingen skygger.
 */

export const WRAP = "mx-auto px-ak-4 md:px-ak-6";
export const WRAP_STIL = { maxWidth: "var(--ak-sidebredde)" } as const;
export const H2 = {
  font: "var(--type-title-l)",
  fontSize: "var(--ak-t-seksjon)",
  margin: "var(--ak-r-3) 0",
} as const;
export const INGRESS = { color: "var(--ak-dempet)", maxWidth: "52ch" } as const;
export const LISTE = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  minWidth: 0,
  borderBottom: "1px solid var(--ak-linje)",
} as const;
export const KORT = { padding: "var(--ak-r-4)", gap: "var(--ak-r-2)", minWidth: 0 } as const;

export const kroner = (ore: number) => `${Math.round(ore / 100).toLocaleString("nb-NO")} kr`;

/** Seksjon med fast luft. `senk` gir den grå grunnen forsiden veksler med. */
export function Seksjon({
  id,
  senk = false,
  children,
}: {
  id?: string;
  senk?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="py-ak-8 md:py-ak-9"
      style={senk ? { background: "var(--ak-grunn-senk)" } : undefined}
    >
      <div className={WRAP} style={WRAP_STIL}>
        {children}
      </div>
    </section>
  );
}

/** Sidetoppen: etikett, H1, ingress og knapper. Valgfritt bilde til høyre. */
export function SideHode({
  etikett,
  tittel,
  ingress,
  knapper,
  bilde,
}: {
  etikett: string;
  tittel: string;
  ingress: ReactNode;
  knapper?: ReactNode;
  bilde?: { src: string; alt: string; posisjon?: string };
}) {
  return (
    <section className="py-ak-8 md:py-ak-9">
      <div
        className={`${WRAP} grid gap-ak-6 ${bilde ? "md:grid-cols-[1.1fr_0.9fr] md:items-center" : ""}`}
        style={WRAP_STIL}
      >
        <div style={{ minWidth: 0 }}>
          <span className="ak-etikett">{etikett}</span>
          <h1
            style={{
              font: "var(--type-display)",
              fontSize: "var(--ak-t-hero)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--ak-tekst)",
              margin: "var(--ak-r-3) 0 var(--ak-r-4)",
            }}
          >
            {tittel}
          </h1>
          <p style={{ fontSize: "var(--ak-t-21)", color: "var(--ak-dempet)", maxWidth: "46ch" }}>
            {ingress}
          </p>
          {knapper ? <div className="mt-ak-5 flex flex-wrap gap-ak-3">{knapper}</div> : null}
        </div>
        {bilde ? <Foto {...bilde} prioritet /> : null}
      </div>
    </section>
  );
}

export function Foto({
  src,
  alt,
  posisjon,
  prioritet = false,
  forhold = "4 / 3",
}: {
  src: string;
  alt: string;
  posisjon?: string;
  prioritet?: boolean;
  forhold?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: forhold,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid var(--ak-linje)",
        minWidth: 0,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={prioritet}
        sizes="(max-width: 768px) 100vw, 45vw"
        style={{ objectFit: "cover", objectPosition: posisjon }}
      />
    </div>
  );
}

/** Seksjonstopp: etikett, H2 og valgfri ingress. */
export function SeksjonsHode({
  etikett,
  tittel,
  ingress,
}: {
  etikett: string;
  tittel: string;
  ingress?: ReactNode;
}) {
  return (
    <>
      <span className="ak-etikett">{etikett}</span>
      <h2 style={H2}>{tittel}</h2>
      {ingress ? <p style={INGRESS}>{ingress}</p> : null}
    </>
  );
}

/** Raden fra forsiden: nummer, navn og en etikett til høyre. Brekker om, ruller aldri. */
export function Rad({ nr, navn, hvor }: { nr?: string; navn: ReactNode; hvor?: ReactNode }) {
  return (
    <li
      className="flex flex-wrap items-baseline gap-x-ak-4 gap-y-ak-1 py-ak-3"
      style={{ borderTop: "1px solid var(--ak-linje)", minWidth: 0 }}
    >
      {nr ? (
        <span
          className="ak-maalt"
          style={{ width: 28, color: "var(--ak-svak)", fontSize: "var(--ak-t-13)" }}
        >
          {nr}
        </span>
      ) : null}
      <span style={{ flex: "1 1 220px", minWidth: 0, fontWeight: 500 }}>{navn}</span>
      {hvor ? <span className="ak-etikett">{hvor}</span> : null}
    </li>
  );
}

/** Kort med tittel og tekst, som PlayerHQ-kortene på forsiden. */
export function Tekstkort({ tittel, tekst, etikett }: { tittel: string; tekst: ReactNode; etikett?: string }) {
  return (
    <div className="pa-card" style={KORT}>
      {etikett ? <span className="ak-etikett">{etikett}</span> : null}
      <span style={{ font: "var(--type-title-s)" }}>{tittel}</span>
      <span style={{ color: "var(--ak-dempet)", fontSize: "var(--ak-t-15)" }}>{tekst}</span>
    </div>
  );
}

export type Tjeneste = { slug: string; navn: string; minutter: number; pris: string };
export type Tjenester = { timer: Tjeneste[]; abonnement: Tjeneste[] };

/**
 * Aktive tjenester med pris fra `ServiceType.priceOre` (aldri skrevet inn for
 * hånd). Gratis tjenester (WANG-økt) vises ikke. Null hvis basen ikke svarer:
 * siden viser da ingen priser i stedet for gamle tall.
 */
export async function hentTjenester(): Promise<Tjenester | null> {
  try {
    const rader = await prisma.serviceType.findMany({
      where: { active: true, priceOre: { gt: 0 } },
      orderBy: { priceOre: "asc" },
      select: { slug: true, name: true, kategori: true, durationMin: true, priceOre: true },
    });
    const til = (r: (typeof rader)[number]): Tjeneste => ({
      slug: r.slug,
      navn: r.name,
      minutter: r.durationMin,
      pris: kroner(r.priceOre),
    });
    return {
      timer: rader.filter((r) => !erAbonnementTjeneste(r)).map(til),
      abonnement: rader.filter((r) => erAbonnementTjeneste(r)).map(til),
    };
  } catch {
    return null;
  }
}
