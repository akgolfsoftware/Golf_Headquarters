import Image from "next/image";
import type { ReactNode } from "react";

import s from "./tn-skra-topp.module.css";

/** Bildene fra Team Norway Golf-merket (public/team-norway/bilder). */
export type TnToppBilde = "spiller-ved-vannet" | "putting-green" | "tee-hand";

/**
 * Skrå-toppen for underskjermene: bilde i navy toner, kuttet nedover mot høyre med rød kant.
 * `venstre` og `hoyre` tar de samme delene som helteflaten (TnHeltTall, TnHeltTekst,
 * TnHeltKnapper, TnHeltTellere). Innholdet som skal ligge over kanten, legges i `TnSkraKort`.
 * `lav` er toppen for lister, detaljer og arbeidsflater: mindre tittel og luft, kortene ligger
 * mindre over kanten, og bildet er valgfritt (uten bilde er flaten navy med samme skråkutt og kant).
 */
export function TnSkraTopp({
  bilde,
  overlinje,
  tittel,
  ingress,
  venstre,
  hoyre,
  etikett,
  lav = false,
}: {
  bilde?: TnToppBilde;
  overlinje?: ReactNode;
  tittel: ReactNode;
  ingress?: ReactNode;
  venstre?: ReactNode;
  hoyre?: ReactNode;
  etikett?: string;
  lav?: boolean;
}) {
  return (
    <section className={lav ? `${s.topp} ${s.lav}` : s.topp} aria-label={etikett}>
      <div className={s.kant} aria-hidden="true" />
      <div className={s.foto} aria-hidden="true">
        {bilde ? <Image src={`/team-norway/bilder/${bilde}.jpg`} alt="" fill priority sizes="100vw" /> : null}
      </div>
      <div className={s.innhold}>
        <div className={s.hode}>
          {overlinje ? <div className={s.overlinje}>{overlinje}</div> : null}
          <h1 className={s.tittel}>{tittel}</h1>
          {ingress ? <p className={s.ingress}>{ingress}</p> : null}
        </div>
        {venstre || hoyre ? (
          <div className={s.deler}>
            {venstre ? <div className={s.del}>{venstre}</div> : null}
            {hoyre ? <div className={s.del}>{hoyre}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Innholdet rett under Skrå-toppen. Første kort ligger over den skrå kanten. */
export function TnSkraKort({ children, lav = false }: { children: ReactNode; lav?: boolean }) {
  return <div className={lav ? `${s.kort} ${s.kortLav}` : s.kort}>{children}</div>;
}
