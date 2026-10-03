"use client";

import Link from "next/link";
import { Check, Clock, Circle, Calendar } from "lucide-react";

export type BekreftetStegState = "done" | "active" | "pending";
export type BekreftetSteg = { state: BekreftetStegState; icon: string; title: string; meta: string; when?: string };
export type OnskeligOktBekreftetV2Data = {
  sentLabel: string;
  coachName: string | null;
  omraade: string | null;
  onsketTid: string | null;
  oktType: string | null;
  notat: string | null;
  shortId: string;
  steg: BekreftetSteg[];
};

function Ikon({ name }: { name: string }) {
  if (name === "check") return <Check size={16} aria-hidden />;
  if (name === "clock") return <Clock size={16} aria-hidden />;
  if (name === "calendar") return <Calendar size={16} aria-hidden />;
  return <Circle size={16} aria-hidden />;
}

export function OnskeligOktBekreftetV2({ data }: { data: OnskeligOktBekreftetV2Data }) {
  const rader = [
    data.oktType ? ["Type", data.oktType] : null,
    data.coachName ? ["Coach", data.coachName] : null,
    data.omraade ? ["Område", data.omraade] : null,
    data.onsketTid ? ["Ønsket tid", data.onsketTid] : null,
    data.notat ? ["Notat", data.notat] : null,
  ].filter((rad): rad is [string, string] => rad !== null);

  return (
    <div className="ph21s">
      <header>
        <p>PlayerHQ · Ønske sendt · {data.sentLabel}</p>
        <h1>Sendt til coach</h1>
        <p>
          {data.coachName
            ? `${data.coachName} har fått ønsket ditt og svarer normalt innen 24 timer på hverdager.`
            : "Ønsket ditt er mottatt. En coach svarer normalt innen 24 timer på hverdager."}{" "}
          Du får varsel i appen når en tid er foreslått.
        </p>
      </header>
      {rader.length > 0 && (
        <section className="pa-card ph21s-kort">
          <p>Ditt ønske</p>
          <dl>{rader.map(([label, verdi]) => <div key={label}><dt>{label}</dt><dd>{verdi}</dd></div>)}</dl>
        </section>
      )}
      <section className="pa-card ph21s-kort">
        <p>Hva skjer nå</p>
        <ol>
          {data.steg.map((s) => (
            <li key={s.title} data-state={s.state}>
              <Ikon name={s.icon} />
              <div><strong>{s.title}</strong><small>{s.meta}</small>{s.when && <b>{s.when}</b>}</div>
            </li>
          ))}
        </ol>
      </section>
      <Link href="/portal" className="pa-btn pa-btn--primary pa-btn--full">Tilbake til hjem</Link>
      <Link href="/portal/coach/melding" className="ph21s-sek">Skriv til coach</Link>
      <p className="ph21s-ref">Ombestemt deg? <Link href="/portal/onskeligokt">Send et nytt ønske</Link> · Ref. REQ-{data.shortId}</p>
    </div>
  );
}
