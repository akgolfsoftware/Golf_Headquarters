"use client";

/**
 * PH-25 Dataene dine (/portal/meg/innstillinger/eksport) — nytt design, pakke 14 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/meg-resten.html, skjermen «Dataene dine».
 * Nedlastingen er uendret: exportUserData lager hele innsynsfila (GDPR art. 15/20) som JSON.
 *
 * Avvik:
 *   - Lista teller de største kildene; fila inneholder mer (bookinger, coachnotater, opptak, samtykker,
 *     IUP og annet). Det står i teksten under lista.
 *   - «Meldinger» er samtalene med Caddie, som er det som lagres som meldinger på spilleren.
 *   - «Sist lastet ned» huskes ikke mellom besøk; det vises bare etter nedlasting i denne økta.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { exportUserData } from "@/app/portal/meg/innstillinger/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH25DataRad = { navn: string; antall: string; farge: "g9" | "tek" | "spill" | "slag" | "g6" };
export type PH25DataeneDineData = { totalt: number; rader: PH25DataRad[]; talt: string; filnavn: string };

export function PH25DataeneDine({ data }: { data: PH25DataeneDineData }) {
  const [jobber, start] = useTransition();
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);

  function lastNed() {
    start(async () => {
      setMelding(null);
      const svar = await exportUserData();
      if (!svar.ok || !svar.data) { setMelding({ ok: false, tekst: "Fila kunne ikke lages. Prøv igjen om litt." }); return; }
      const url = URL.createObjectURL(new Blob([JSON.stringify(svar.data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filnavn;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMelding({ ok: true, tekst: `Fila er lastet ned: ${data.filnavn}` });
    });
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · innstillinger · personvern</>}
      tittel={<>Dataene dine</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <p className="mr-ingress">Alt som er lagret om deg i PlayerHQ. Du kan laste det ned som én fil, når du vil.</p>
    <div className="to-del">
      <section className="phn-kort" aria-label="Lagret om deg">
        <div className="phn-hoved"><strong>{data.totalt.toLocaleString("nb-NO")}</strong><span className="phn-forklar">registreringer lagret</span></div>
        <ul className="mr-data-liste">
          {data.rader.map((r) => <li key={r.navn}><span className="k"><i className={r.farge === "g6" ? undefined : r.farge} aria-hidden />{r.navn}</span><b>{r.antall}</b></li>)}
        </ul>
        <p className="phn-kilde">Talt {data.talt}. Fila har også bookinger, samtykker, coachnotater og IUP. Turneringsresultatene fra GolfBox er offentlige og ligger hos GolfBox.</p>
      </section>
      <div>
        <div className="phn-kort">
          <b className="phn-undertittel">Last ned alt</b>
          <p className="phn-forklar">Én fil (JSON) med alt over. Den lages med en gang, og lastes ned på denne enheten.</p>
          <button type="button" className="phn-knapp pri stor" onClick={lastNed} disabled={jobber}>{jobber ? "Lager fila …" : "Last ned dataene mine"}</button>
          {melding && <div className={`mr-melding ${melding.ok ? "ok" : "feil"}`} role={melding.ok ? "status" : "alert"}>{melding.tekst}</div>}
        </div>
        <div className="phn-kort dempet">
          <b className="phn-undertittel">Vil du slette kontoen?</b>
          <p className="phn-forklar">Det gjør du under Innstillinger › Konto. Last gjerne ned dataene først.</p>
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/meg/innstillinger">Til Innstillinger</Link></div>
        </div>
      </div>
    </div>
  </div></SkraFlyt></div>;
}
