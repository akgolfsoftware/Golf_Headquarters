"use client";

/**
 * PH-24 Meg › Profil i nytt design: HCP øverst, personalia som skjema, turneringsresultatene og
 * målsetningene i høyre kolonne på PC.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Profil»).
 * Stil: src/styles/playerhq-ny-meg.css. Lagring går som før via lagreProfil (zod på grensen).
 *
 * Avvik:
 *   - HCP vises uten «oppdatert»-dato: appen lagrer ikke når HCP sist ble hentet fra NGF.
 *   - Kategori vises som «—»: kategorien er ikke lagret på spilleren ennå.
 *   - E-post er et låst felt: den eies av innloggingen og endres i egen flyt. Hjemmeklubb er fritekst,
 *     ikke nedtrekksliste: appen har ingen klubbliste å velge fra.
 *   - Fødselsdatoen kan settes én gang hvis den mangler (D-63), deretter er den låst.
 *   - «Finn deg i turneringsresultatene» med «Det er meg» er ikke med: spilleren kan ikke koble seg
 *     selv i dag; coachen kobler profilen. Skjermen sier det, og viser resultatene når koblingen finnes.
 *   - Ambisjon, Golf-ID, stall, runder i år og HCP-mål er beholdt fra forrige versjon.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-PROFIL.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import type { LagreProfilInput } from "@/app/portal/meg/profil/actions";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH24ProfilTurnering = { id: string; navn: string; dato: string; runder: string | null; brutto: number | null; plassering: string | null };

export type PH24ProfilData = {
  navn: string;
  avatarUrl: string | null;
  epost: string;
  mobil: string | null;
  hcp: number | null;
  homeClub: string | null;
  fodselsdatoISO: string | null;
  ambition: string | null;
  spillerSiden: string;
  stallNavn: string | null;
  runderIAar: number;
  ngfId: string | null;
  hcpMaalTekst: string | null;
  /** Turneringsresultatene fra koblingen til den offentlige turneringsbasen. Valgfritt for eldre kallere. */
  turneringer?: { koblet: boolean; rader: PH24ProfilTurnering[]; tomGrunn: string } | null;
};

export type PH24ProfilProps = {
  data: PH24ProfilData;
  onLagre: (input: LagreProfilInput) => Promise<{ ok: true } | { ok: false; feil: string }>;
};

const DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
function visDato(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return DATO.format(new Date(Date.UTC(a, m - 1, d)));
}

export function PH24Profil({ data, onLagre }: PH24ProfilProps) {
  const [navn, setNavn] = useState(data.navn);
  const [mobil, setMobil] = useState(data.mobil ?? "");
  const [fodselsdato, setFodselsdato] = useState(data.fodselsdatoISO ?? "");
  const [hjemmeklubb, setHjemmeklubb] = useState(data.homeClub ?? "");
  const [maalTekst, setMaalTekst] = useState(data.ambition ?? "");
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();
  const t = data.turneringer ?? null;

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setMelding(null);
    start(async () => {
      try {
        const r = await onLagre({
          navn: navn.trim(),
          mobil: mobil.trim() || null,
          fodselsdato: fodselsdato || null,
          hjemmeklubb: hjemmeklubb.trim() || null,
          maalTekst: maalTekst.trim() || null,
        });
        setMelding(r.ok ? { ok: true, tekst: "Lagret." } : { ok: false, tekst: r.feil });
      } catch { setMelding({ ok: false, tekst: "Kunne ikke lagre. Prøv igjen." }); }
    });
  }

  return <div className="phn phn-meg"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div><div className="phn-dato">Meg · profil</div><h1 className="phn-tittel">Profil</h1></div>
    </div>

    <div className="to-del">
      <div>
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{data.hcp != null ? formaterTall(data.hcp, 1, true) : "—"}</strong><span className="phn-forklar">HCP</span></div>
          <p className="phn-kilde">Kilde: NGF. HCP endres bare der, ikke i appen.</p>
        </div>

        <form className="felter" onSubmit={lagre}>
          <label className="phn-felt">Navn<input value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="name" required minLength={2} maxLength={120} /></label>
          {data.fodselsdatoISO
            ? <div className="phn-felt"><span className="etikett">Fødselsdato</span><span className="laast">{visDato(data.fodselsdatoISO)}<Lock size={16} aria-label="Låst" /></span><span className="hjelp">Fødselsdatoen kan bare endres av coachen din.</span></div>
            : <label className="phn-felt">Fødselsdato<input type="date" value={fodselsdato} onChange={(e) => setFodselsdato(e.target.value)} /><span className="hjelp">Kan settes én gang. Etterpå kan bare coachen endre den.</span></label>}
          <label className="phn-felt">Hjemmeklubb<input value={hjemmeklubb} onChange={(e) => setHjemmeklubb(e.target.value)} maxLength={120} /></label>
          <div className="phn-felt"><span className="etikett">Kategori</span><span className="laast">—<Lock size={16} aria-label="Låst" /></span><span className="hjelp">Settes av coachen ut fra brutto snittscore.</span></div>
          <div className="phn-felt"><span className="etikett">E-post</span><span className="laast">{data.epost}<Lock size={16} aria-label="Låst" /></span><span className="hjelp">E-posten er innloggingen din. Den endres ikke her.</span></div>
          <label className="phn-felt">Mobil<input type="tel" value={mobil} onChange={(e) => setMobil(e.target.value)} autoComplete="tel" maxLength={30} /></label>
          <label className="phn-felt">Ambisjon<textarea rows={3} value={maalTekst} onChange={(e) => setMaalTekst(e.target.value)} maxLength={500} placeholder="Hva vil du oppnå denne sesongen?" /></label>
          <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role={melding.ok ? "status" : "alert"}>{melding.tekst}</p>}</div>
          <button type="submit" className="phn-knapp pri stor" disabled={pending}>{pending ? "Lagrer …" : "Lagre"}</button>
        </form>
      </div>

      <div>
        <section className="phn-seksjon" aria-labelledby="profil-turn">
          <div className="phn-sek-topp"><h2 id="profil-turn">Turneringsresultater</h2></div>
          {t?.koblet && t.rader.length > 0
            ? <div style={{ display: "grid", gap: 12 }}>
              <span className="phn-pille ok" style={{ justifySelf: "start" }}><i />Koblet til turneringsresultatene</span>
              {t.rader.map((r) => <div key={r.id} className="turn-rad">
                {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
                <img src="/images/playerhq/turn-tee.jpg" alt="" width={144} height={152} />
                <div><b>{r.navn}</b><span>{[r.dato, r.runder, r.brutto != null ? `brutto ${r.brutto}` : null, r.plassering ? `${r.plassering}. plass` : null].filter(Boolean).join(" · ")}</span></div>
              </div>)}
              <p className="phn-kilde">Kilde: turneringsdataene fra GolfBox. Bare brutto score.</p>
              <Link className="lenke" href="/portal/analysere?del=snitt">Se alle i Stats</Link>
            </div>
            : <div className="phn-kort dempet">
              <b className="phn-undertittel">{t?.koblet ? "Ingen turneringer ennå" : "Ikke koblet til turneringsresultatene"}</b>
              <p className="phn-forklar">{t?.tomGrunn || "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den."}</p>
            </div>}
        </section>

        <dl className="nokkel">
          <div><dt>Golf-ID</dt><dd>{data.ngfId ?? "—"}</dd></div>
          <div><dt>Runder i år</dt><dd className="tall">{data.runderIAar}</dd></div>
          <div><dt>Gruppe</dt><dd>{data.stallNavn ?? "—"}</dd></div>
          <div><dt>Spiller siden</dt><dd>{data.spillerSiden || "—"}</dd></div>
        </dl>

        <div className="phn-kort dempet">
          <b className="phn-undertittel">Målsetninger</b>
          <p className="phn-forklar">{data.hcpMaalTekst ? `HCP-mål: ${data.hcpMaalTekst}. ` : ""}Målsetningene dine ligger i Plan › Workbench, sammen med planen de styrer.</p>
          <Link className="lenke" href="/portal/mal">Åpne målsetninger</Link>
        </div>
      </div>
    </div>
  </div></div>;
}
