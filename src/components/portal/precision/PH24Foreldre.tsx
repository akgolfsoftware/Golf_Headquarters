/**
 * PH-24 Meg › Foreldre i nytt design: én flate per forelder med status, og forklaring om hva
 * forelderen ser. Under 16 sier skjermen at deling og opptak venter på forelderens godkjenning.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Foreldre»).
 * Stil: src/styles/playerhq-ny-meg.css. Ingen "use client": skjermen har ingen handlinger ennå.
 *
 * Avvik:
 *   - «Fjern forelder» med rust bekreftelse er ikke med: appen har ingen handling for at spilleren
 *     fjerner forelderen selv (beslutninger 06.10, PR 1g). Skjermen sier at coachen gjør det.
 *   - «Inviter forelder» er ikke en knapp: forelderen inviteres av coachen i dag.
 *   - Hva forelderen ser, er teksten appen har brukt før, ikke utkastets «Ser alt»-liste:
 *     utkastets liste stemmer ikke med hva forelderflaten faktisk viser.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-FORELDRE.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { initialer } from "@/lib/portal/initialer";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH24ForelderRad = { id: string; navn: string; relasjon: string; epost: string; godkjent: boolean; siden: string };
export type PH24ForeldreData = { foreldre: PH24ForelderRad[]; under16: boolean; venterPaaForelder: boolean };

export function PH24Foreldre({ data }: { data: PH24ForeldreData }) {
  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · foreldre</>}
      tittel={<>Foreldre</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link></span>}
    />
    <SkraFlyt lav><div className="side smal">

    {data.foreldre.length === 0
      ? <div className="phn-kort dempet">
        <b className="phn-undertittel">Ingen forelder er koblet til</b>
        <p className="phn-forklar">En forelder kan følge treningen din og booke timer for deg. Coachen din sender invitasjonen.</p>
      </div>
      : data.foreldre.map((f) => <article key={f.id} className="tilgang">
        <div className="tilgang-topp">
          <span className="avatar lys" aria-hidden>{initialer(f.navn)}</span>
          <span><b>{f.navn}</b><span className="phn-kilde">{f.relasjon} · {f.godkjent ? `godkjent ${f.siden}` : `koblet ${f.siden}`}</span></span>
          <span className={`phn-pille ${f.godkjent ? "ok" : "vent"}`}><i />{f.godkjent ? "Godkjent" : "Venter"}</span>
        </div>
        <p className="phn-kilde">{f.epost}</p>
      </article>)}

    <div className="phn-kort dempet">
      <b className="phn-undertittel">Hva forelderen ser</b>
      <p className="phn-forklar">Forelderen ser oppmøte og bekreftede økter, og kan booke timer for deg. Private coachnotater, helseopplysninger og interne testprotokoller deles ikke.</p>
    </div>

    {data.under16
      ? <div className="phn-kort dempet">
        <b className="phn-undertittel">Du er under 16 år</b>
        <p className="phn-forklar">{data.venterPaaForelder
          ? "Deling og opptak er sperret til forelderen din har godkjent kontoen."
          : "Forelderen din har godkjent kontoen. Deling med trenere går gjennom forelderen."}</p>
      </div>
      : <div className="phn-kort dempet">
        <b className="phn-undertittel">Du er over 16 år</b>
        <p className="phn-forklar">Forelderen din ser profilen din til den blir fjernet. Du trenger ikke lenger godkjenning for deling eller opptak. Vil du fjerne forelderen, sier du fra til coachen din.</p>
      </div>}

    <Link className="phn-knapp sek" href="/portal/meg/innstillinger/personvern/deling" style={{ justifySelf: "start" }}>Se hvem som ser profilen din</Link>
  </div></SkraFlyt></div>;
}
