import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { GfgkFooter } from "../_components/gfgk-footer";
import { GfgkHeader } from "../_components/gfgk-header";
import {
  ARTIKLER,
  KATEGORI_META,
  type ArtikkelKategori,
} from "../_data/veileder-artikler";

export const metadata: Metadata = {
  title: "Kunnskapsbase",
  description:
    "Artikler og veiledning for spillere, foreldre og trenere i GFGK Junior & Elite — fra Impact Program og foreldrerollen til mental trening, periodisering og testuke.",
};

const SEKSJONER: { nr: string; kategori: ArtikkelKategori; eyebrow: string; tittel: string }[] = [
  { nr: "01", kategori: "filosofi", eyebrow: "Vår filosofi", tittel: "Verdier som gjennomsyrer alt vi gjør" },
  { nr: "02", kategori: "foreldre", eyebrow: "For foreldre og foresatte", tittel: "Hvordan du best kan støtte barnet ditt" },
  { nr: "03", kategori: "spillere", eyebrow: "For spillere", tittel: "Kunnskap som gjør deg til en bedre golfer" },
  { nr: "04", kategori: "treningsfaglig", eyebrow: "Treningsfaglig", tittel: "Slik planlegger og gjennomfører vi trening" },
];

export default function VeilederPage() {
  return (
    <div>
      <GfgkHeader aktiv="kunnskap" />

      <section className="text-white" style={{ background: "var(--ink)" }}>
        <div className="jr-fade-up mx-auto max-w-[1200px] px-5 pb-12 pt-14 sm:px-7 sm:pt-16">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--gfgk-gold)" }}>
            Veileder – Junior & Elite
          </span>
          <h1 className="mt-3 font-black uppercase leading-[0.98] text-white" style={{ fontSize: "clamp(38px, 6vw, 58px)" }}>
            Kunnskapsbase
          </h1>
          <p className="mt-4 max-w-[620px] text-[16px] leading-relaxed sm:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
            Artikler og veiledning for spillere, foreldre og trenere.
          </p>
        </div>
      </section>

      {SEKSJONER.map((s, i) => {
        const artikler = ARTIKLER.filter((a) => a.kategori === s.kategori);
        const meta = KATEGORI_META[s.kategori];
        return (
          <section
            key={s.kategori}
            id={s.kategori}
            className={`mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-16 sm:px-7 sm:pt-18 ${i === SEKSJONER.length - 1 ? "pb-24" : ""}`}
          >
            <div className="flex items-baseline gap-3.5">
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>
                {s.nr}
              </span>
              <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>
                {s.eyebrow}
              </span>
            </div>
            <h2 className="mt-3 text-[26px] font-bold leading-[1.06] sm:text-[34px]" style={{ color: "var(--ink)" }}>
              {s.tittel}
            </h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {artikler.map((a) => (
                <Link
                  key={a.slug}
                  href={`/gfgk-junior/veileder/${a.slug}`}
                  className="group flex flex-col gap-2 rounded-[var(--r-md)] bg-white p-6 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ boxShadow: "var(--shadow-md)", borderTop: `4px solid ${meta.farge}` }}
                >
                  <span
                    className="self-start rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: meta.badgeFg, background: meta.badgeBg }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[19px] font-bold leading-snug" style={{ color: "var(--ink)" }}>
                    {a.tittel}
                  </span>
                  <span className="flex-1 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {a.ingress}
                  </span>
                  <span className="jr-link mt-1 inline-flex items-center gap-1 text-sm font-bold">
                    Les mer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <GfgkFooter />
    </div>
  );
}
