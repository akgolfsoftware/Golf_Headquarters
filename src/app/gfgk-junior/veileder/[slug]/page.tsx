import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtikkelMd } from "../../_components/artikkel-md";
import { GfgkFooter } from "../../_components/gfgk-footer";
import { GfgkHeader } from "../../_components/gfgk-header";
import { ARTIKLER, KATEGORI_META } from "../../_data/veileder-artikler";

export function generateStaticParams() {
  return ARTIKLER.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikkel = ARTIKLER.find((a) => a.slug === slug);
  if (!artikkel) return {};
  return { title: artikkel.tittel, description: artikkel.ingress };
}

export default async function ArtikkelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikkel = ARTIKLER.find((a) => a.slug === slug);
  if (!artikkel) notFound();
  const meta = KATEGORI_META[artikkel.kategori];
  const relaterte = ARTIKLER.filter(
    (a) => a.kategori === artikkel.kategori && a.slug !== artikkel.slug,
  ).slice(0, 3);

  return (
    <div>
      <GfgkHeader aktiv="kunnskap" />

      <section className="text-white" style={{ background: "var(--ink)" }}>
        <div className="jr-fade-up mx-auto max-w-[820px] px-5 pb-10 pt-12 sm:px-7 sm:pt-14">
          <Link
            href="/gfgk-junior/veileder"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-bold no-underline"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Kunnskapsbase
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.06em]"
              style={{ color: meta.badgeFg, background: meta.badgeBg }}
            >
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.6)" }}>
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
              {artikkel.lesetid}
            </span>
          </div>
          <h1 className="mt-3.5 text-[32px] font-black leading-[1.05] text-white sm:text-[42px]">
            {artikkel.tittel}
          </h1>
          <p className="mt-3.5 text-[17px] leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            {artikkel.ingress}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-5 pb-16 pt-10 sm:px-7">
        <ArtikkelMd body={artikkel.body} />
      </article>

      {relaterte.length > 0 ? (
        <section className="mx-auto max-w-[820px] px-5 pb-24 sm:px-7">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>
            Relaterte artikler
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {relaterte.map((a) => (
              <Link
                key={a.slug}
                href={`/gfgk-junior/veileder/${a.slug}`}
                className="group flex flex-col gap-1.5 rounded-[var(--r-md)] bg-white p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ boxShadow: "var(--shadow-sm)", borderTop: `4px solid ${meta.farge}` }}
              >
                <span className="text-base font-bold leading-snug" style={{ color: "var(--ink)" }}>
                  {a.tittel}
                </span>
                <span className="text-[13.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                  {a.ingress}
                </span>
                <span className="jr-link mt-1 inline-flex items-center gap-1 text-[13.5px] font-bold">
                  Les mer
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <GfgkFooter />
    </div>
  );
}
