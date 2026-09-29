import type { ReactNode } from "react";
import { CircleDashed, Info, Lock } from "lucide-react";

import { WangKnapp } from "@/components/wang/trener/wang-ui";
import { WANG_START } from "@/lib/wang/wang-ruter";
import s from "./admin.module.css";

/** Stiplet merknad for det som ikke er avklart (tegningens ph-circle-dashed-boks). */
export function AdminUavklart({ children }: { children: ReactNode }) {
  return (
    <p className={s.uavklart}>
      <CircleDashed size={17} strokeWidth={1.5} aria-hidden="true" className={s.ikon} />
      <span>{children}</span>
    </p>
  );
}

/** Hvit opplysningsboks (tegningens ph-info-boks). */
export function AdminInfo({ children }: { children: ReactNode }) {
  return (
    <p className={s.info}>
      <Info size={18} strokeWidth={1.5} aria-hidden="true" className={s.ikon} />
      <span>{children}</span>
    </p>
  );
}

/**
 * Hva som mangler i datamodellen før skjermen kan vise ekte tall. Står inne i
 * et kort, under den ærlige tomtilstanden. Ingenting oppdiktes i mellomtiden.
 */
export function AdminMangler({ punkter }: { punkter: string[] }) {
  return (
    <div className={s.mangler}>
      <span className={s.manglerTittel}>Mangler i datamodellen</span>
      {punkter.map((p) => (
        <span key={p} className={s.manglerPunkt}>
          <CircleDashed size={16} strokeWidth={1.5} aria-hidden="true" className={s.ikon} />
          <span>{p}</span>
        </span>
      ))}
    </div>
  );
}

/** 403 fra tegningen (WANG-24 · Ingen tilgang): sier ikke hva som ligger bak. */
export function AdminIngenTilgang() {
  return (
    <section className={s.ingen} aria-labelledby="wang-ingen-tilgang">
      <Lock size={28} strokeWidth={1.5} aria-hidden="true" />
      <p id="wang-ingen-tilgang" className={s.ingenTittel}>
        Ingen tilgang<span className={s.kode}>403</span>
      </p>
      <p className={s.brodtekst}>Du har ikke tilgang til denne siden.</p>
      <WangKnapp href={WANG_START}>Gå til forsiden</WangKnapp>
    </section>
  );
}

const SKJELETT = [
  { w: "58%", w2: "28%" },
  { w: "44%", w2: "33%" },
  { w: "66%", w2: "38%" },
  { w: "52%", w2: "43%" },
  { w: "62%", w2: "48%" },
];

/** Lastetilstand for Administrasjon: rader med samme form som listene. Ingen spinner. */
export function AdminLaster({ tekst }: { tekst: string }) {
  return (
    <section className={s.kort} role="status" aria-busy="true">
      <p className={s.lasterTekst}>{tekst}</p>
      {SKJELETT.map((k) => (
        <div key={k.w} className={s.lasterRad}>
          <span className={s.lasterStabel}>
            <span className={s.sk} style={{ width: k.w }} />
            <span className={s.sk} style={{ width: k.w2, height: 10 }} />
          </span>
          <span className={s.sk} style={{ height: 22 }} />
        </div>
      ))}
    </section>
  );
}
