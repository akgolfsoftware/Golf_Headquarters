"use client";

/**
 * PH-11-MAL-IUP IUP-måltall — nytt design (pakke 3, godkjent 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, mal «iup». Stil: playerhq-ny.css + playerhq-ny-maaltall.css.
 * Bare for spillere med aktivt WANG-/TN-medlemskap (siden sender andre til Målsetninger).
 *
 * Avvik:
 *   - Tall appen ikke har grunnlag for ennå (ranking, PEI, slaglengde, innspill 100–150 og 151–200 m)
 *     står som «—» med kilden «Ikke koblet ennå». Ingen tall anslås.
 *   - Score og aktivitet regnes av runder spilleren har registrert og merket som turnering eller trening,
 *     ikke av turneringsresultatene fra GolfBox.
 *   - Målet lagres som spilleren skriver det («72,5», «400 t»); fremdrift mot målet vises ikke ennå.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { formaterMaaltall, type MaaltallGruppe, type MaaltallRad } from "@/lib/iup/maaltall";
import type { IupMaaltallData } from "@/lib/iup/maaltall-data";
import { settIupMaal } from "@/lib/iup/maaltall-actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-maaltall.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

type Filter = "alle" | "med" | "uten";
const KV = ["K1", "K2", "K3", "K4"];

export function PHIupMaaltall({ data, tilbake }: { data: IupMaaltallData; tilbake: string }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const med = data.rader.filter((r) => r.mal);
  const synlige = filter === "alle" ? data.rader : filter === "med" ? med : data.rader.filter((r) => !r.mal);
  const grupper = [...new Set(synlige.map((r) => r.gruppe))] as MaaltallGruppe[];

  return <div className="phn phn-mt phn-skra">
    <SkraTopp
      lav
      etikett="IUP-måltall"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={`Målsetninger · ${data.org}`}
      tittel={`IUP-måltall ${data.sesong.navn}`}
      handling={<span className="skra-tilbake"><Link className="tilbake" href={tilbake}><ChevronLeft className="phn-ikon" aria-hidden />Målsetninger</Link></span>}
    />
    <SkraFlyt lav>
    <section className="phn-kort" aria-label="Måltall med mål">
      <div className="phn-hoved"><strong>{med.length}<small>av {data.rader.length}</small></strong><span className="phn-trend">med mål</span></div>
      <p className="phn-forklar">Året regnes ut først når alle fire kvartaler er målt.</p>
    </section>

    <div className="phn-valg" role="group" aria-label="Vis">
      {([["alle", `Alle ${data.rader.length}`], ["med", `Med mål ${med.length}`], ["uten", `Uten mål ${data.rader.length - med.length}`]] as const).map(([id, navn]) =>
        <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{navn}</button>)}
    </div>

    <section className="phn-mt-tabell" aria-label="Måltall">
      <div className="phn-mt-hode" aria-hidden><span>Måltall</span>{KV.map((k) => <span key={k}>{k}</span>)}<span>År</span><span>Mål {data.sesong.navn}</span></div>
      {grupper.map((g) => <div key={g} role="group" aria-label={g}>
        <h2 className="phn-mt-gruppe">{g}</h2>
        {synlige.filter((r) => r.gruppe === g).map((r) => <Rad key={r.id} rad={r} sesong={data.sesong.navn} />)}
      </div>)}
      {synlige.length === 0 && <p className="phn-forklar">{filter === "med" ? "Ingen måltall har mål ennå. Trykk «Sett mål» på et måltall." : "Alle måltall har mål."}</p>}
    </section>
  </SkraFlyt></div>;
}

function Rad({ rad, sesong }: { rad: MaaltallRad; sesong: string }) {
  const router = useRouter();
  const [redigerer, setRedigerer] = useState(false);
  const [verdi, setVerdi] = useState(rad.mal ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const lagre = () => start(async () => {
    setFeil(null);
    const r = await settIupMaal({ maaltall: rad.id, verdi });
    if (!r.ok) { setFeil(r.error); return; }
    setRedigerer(false);
    router.refresh();
  });
  return <div className="phn-mt-rad">
    <div className="phn-mt-topp">
      <div><b>{rad.navn}</b><small>{rad.kilde}</small></div>
      {redigerer
        ? <form className="phn-mt-felt" onSubmit={(e) => { e.preventDefault(); lagre(); }}>
          <input aria-label={`Mål ${sesong} for ${rad.navn}`} value={verdi} maxLength={24} autoFocus onChange={(e) => setVerdi(e.target.value)} />
          <button type="submit" className="phn-knapp pri" disabled={travel}>Lagre</button>
        </form>
        : <button type="button" className="phn-mt-sett" onClick={() => setRedigerer(true)}>{rad.mal ? `Mål ${rad.mal}` : "Sett mål"}</button>}
    </div>
    <div className="phn-mt-kv">
      {rad.kvartaler.map((v, i) => <span key={KV[i]}><small>{KV[i]}</small><b>{formaterMaaltall(v, rad.enhet)}</b></span>)}
      <span><small>År</small><b>{formaterMaaltall(rad.aar, rad.enhet)}</b></span>
    </div>
    {feil && <p className="phn-melding" role="alert">{feil}</p>}
  </div>;
}
