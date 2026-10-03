"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TomTilstand } from "@/components/precision/pa";

export type HjelpFaq = { q: string; a: string };
export type HjelpKategori = { slug: string; tittel: string; beskrivelse: string; ikon: string; antall: number };
export type HjelpArtikkel = { slug: string; tittel: string; kategori: string; lesetid: number };
export type MegHelpData = { faq: HjelpFaq[]; kategorier: HjelpKategori[]; artikler: HjelpArtikkel[] };

export function MegHelpV2({ data }: { data: MegHelpData }) {
  const { faq, kategorier, artikler } = data;
  const [sok, setSok] = useState("");
  const q = sok.trim().toLowerCase();
  const treffKat = useMemo(
    () => (q ? kategorier.filter((k) => k.tittel.toLowerCase().includes(q) || k.beskrivelse.toLowerCase().includes(q)) : []),
    [q, kategorier],
  );
  const treffArt = useMemo(
    () => (q ? artikler.filter((a) => a.tittel.toLowerCase().includes(q) || a.kategori.toLowerCase().includes(q)) : []),
    [q, artikler],
  );
  const ingenTreff = q.length > 0 && treffKat.length === 0 && treffArt.length === 0;

  return (
    <div className="ph25h">
      <header>
        <h1>Hjelp</h1>
        <p>Meg</p>
        <p>Svar på vanlige spørsmål, søk i veiledningene, eller ta direkte kontakt.</p>
      </header>
      <label className="ph25h-sok">Søk i hjelpesenteret
        <input value={sok} placeholder="Søk i hjelpesenteret" onChange={(e) => setSok(e.target.value)} />
      </label>

      {q ? (
        ingenTreff ? (
          <>
            <TomTilstand icon={Search} title="Ingen treff" text="Prøv et annet søkeord, eller ta kontakt med support." />
            <Link href="/portal/meg/help/kontakt" className="pa-btn pa-btn--primary pa-btn--full">Kontakt support</Link>
          </>
        ) : (
          <>
            {treffKat.length > 0 && (
              <section className="pa-card ph25h-kort">
                <p>Kategorier · {treffKat.length}</p>
                <ul>
                  {treffKat.map((k) => (
                    <li key={k.slug}><Link href={`/portal/meg/help/kategori/${k.slug}`}><strong>{k.tittel}</strong><small>{k.beskrivelse}</small></Link><span>{k.antall} art.</span></li>
                  ))}
                </ul>
              </section>
            )}
            {treffArt.length > 0 && (
              <section className="pa-card ph25h-kort">
                <p>Artikler · {treffArt.length}</p>
                <ul>
                  {treffArt.map((a) => (
                    <li key={a.slug}><Link href={`/portal/meg/help/artikkel/${a.slug}`}><strong>{a.tittel}</strong><small>{a.kategori} · {a.lesetid} min lesetid</small></Link></li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )
      ) : (
        <>
          <section>
            <p className="ph25h-kicker">Kategorier</p>
            <div className="ph25h-grid">
              {kategorier.map((k) => (
                <Link key={k.slug} href={`/portal/meg/help/kategori/${k.slug}`} className="pa-card ph25h-kort">
                  <strong>{k.tittel}</strong>
                  <span>{k.beskrivelse}</span>
                  <small>{k.antall} artikler</small>
                </Link>
              ))}
            </div>
          </section>
          <section className="pa-card ph25h-kort">
            <p>Ofte stilte spørsmål</p>
            {faq.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </section>
          <section className="pa-card ph25h-kort">
            <p>Ta kontakt</p>
            <ul>
              <li><Link href="/portal/meg/help/kontakt"><strong>Chat med support</strong><small>Svarer vanligvis innen 1 t</small></Link></li>
              <li><a href="mailto:support@akgolf.no"><strong>support@akgolf.no</strong><small>E-post til teamet</small></a></li>
              <li><Link href="/portal/meg/help/kategori/komme-i-gang"><strong>Veiledninger</strong><small>Kom-i-gang-guider</small></Link></li>
            </ul>
          </section>
          <Link href="/portal/meg/help/kontakt" className="pa-btn pa-btn--primary pa-btn--full">Kontakt support</Link>
          <Link href="/portal/meg/feedback" className="ph25h-forslag">Send forslag eller meld feil</Link>
        </>
      )}
    </div>
  );
}
