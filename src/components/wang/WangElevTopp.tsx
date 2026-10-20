import Link from "next/link";

import { initialer } from "@/components/wang/wang-felles";

/**
 * Toppfeltet på elevens egne sider i trenerflaten (designløftet 20.10.2026, canvas rad 8–10): wang.no-gradient,
 * tilbakelenke, rund avatar med initialer, navnet som sidetittel og inntil fire store tynne tall. Bare den
 * viktigste handlingen er fylt vinrød; resten har hvit kant. Ingen bilde, fordi siden handler om én elev.
 */
export function WangElevTopp({
  tilbake,
  navn,
  overtittel,
  tittel,
  undertekst,
  tall,
  handlinger = [],
}: {
  tilbake: { href: string; tekst: string };
  navn: string;
  overtittel?: string;
  tittel?: string;
  undertekst?: string;
  tall: { verdi: string; tekst: string }[];
  handlinger?: { tekst: string; href: string; primar?: boolean }[];
}) {
  return (
    <section className="wg-elevtopp" aria-label={tittel ?? navn}>
      <Link href={tilbake.href} className="wg-elevtopp-tilbake">
        ← {tilbake.tekst}
      </Link>
      <div className="wg-elevtopp-rad">
        <div className="wg-elevtopp-hvem">
          {tittel ? null : (
            <span className="wg-elevtopp-avatar" aria-hidden="true">
              {initialer(navn)}
            </span>
          )}
          <span className="wg-elevtopp-navn">
            {overtittel ? <span className="wg-elevtopp-over">{overtittel}</span> : null}
            <h1>{tittel ?? navn}</h1>
            {undertekst ? <span className="wg-elevtopp-under">{undertekst}</span> : null}
          </span>
        </div>
        {tall.length > 0 ? (
          <dl className="wg-elevtopp-tall">
            {tall.map((t) => (
              <div key={t.tekst}>
                <dt>{t.tekst}</dt>
                <dd>{t.verdi}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {handlinger.length > 0 ? (
        <div className="wg-elevtopp-knapper">
          {handlinger.map((h) => (
            <Link key={h.tekst} href={h.href} className={`wg-btn ${h.primar ? "wg-btn-primary" : "wg-btn-kant-lys"}`}>
              {h.tekst}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
