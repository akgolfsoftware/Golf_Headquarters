/**
 * AG-TP-02 Før og nå i nytt design (pakke 6).
 * Fasit: docs/design-system/utkast-agencyos/teknisk.html, skjerm «AG-TP-02 Før og nå».
 * Rute: /admin/spillere/[id]/plan/[planId]/for-og-na. Stil: src/styles/agencyos-ny-teknisk.css.
 * Funksjoner som før: velg oppgave, se oppgavens bilde, åpne video.
 *
 * Avvik:
 *   - Basen har ett bilde og én video per oppgave, uten dato. Bildet vises som «Nå» uten dato, «Før» står tom.
 *   - Delelinjen og «Side om side»-valget krever to daterte bilder; bare side om side vises til tillegget finnes.
 *   - Opplasting av bilde og coachnotat finnes ikke ennå (tillegg i datamodellen, vedtak 27.09 punkt 2).
 */
import Link from "next/link";
import { Feil, Laster, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import { safeUrl } from "@/lib/security/safe-url";
import "@/styles/agencyos-ny-teknisk.css";

export type ForOgNaaOppgave = { id: string; p: string; posisjon: string; tittel: string; bildeUrl: string | null; videoUrl: string | null };

function Ramme({ hva, url, tittel, tomTekst }: { hva: string; url: string | null; tittel: string; tomTekst: string }) {
  return <div className="bilde-ramme">
    <span className="kilde">{hva} · dato —</span>
    <div className="ramme">
      {url
        // eslint-disable-next-line @next/next/no-img-element -- bildet ligger i Supabase Storage eller ekstern lenke, ikke i next/image-oppsettet
        ? <img src={url} alt={`${hva}: ${tittel}`} />
        : <span>{tomTekst}</span>}
    </div>
  </div>;
}

export function AGTP02ForOgNaaNy({ tilstand, spiller, planId, oppgaver, valgtId }: {
  tilstand: "data" | "tom" | "laster" | "feil";
  spiller: { id: string; navn: string };
  planId: string;
  oppgaver: ForOgNaaOppgave[];
  valgtId: string | null;
}) {
  const t = oppgaver.find((o) => o.id === valgtId) ?? oppgaver[0] ?? null;
  const video = safeUrl(t?.videoUrl);
  const bilde = safeUrl(t?.bildeUrl);
  const tilbake = { href: `/admin/spillere/${spiller.id}/plan/${planId}`, tekst: "Teknisk plan" };
  return <div className="agn-s">
    <Topp tilbake={tilbake} dato={t ? `${spiller.navn} · ${t.p} ${t.posisjon}` : `${spiller.navn} · teknisk plan`} tittel="Før og nå" />
    {tilstand === "laster" ? <Laster tekst="Henter bildene …" hoyder={[44, 360]} />
      : tilstand === "feil" ? <Feil tittel="Bildene kunne ikke hentes" tekst="Ingen bilder er slettet. Prøv igjen." kode="FEIL · MEDIA" />
      : tilstand === "tom" || !t ? <Tom tittel="Ingen oppgaver i planen" tekst="Legg til en oppgave i teknisk plan. Bildet av posisjonen hører til oppgaven." handling={<Link className="knapp sek" href={tilbake.href}>Til teknisk plan</Link>} />
      : <>
        {oppgaver.length > 1 && <nav className="chips" aria-label="Oppgave">
          {oppgaver.map((o) => <Link key={o.id} href={`?oppgave=${o.id}`} aria-current={o.id === t.id ? "page" : undefined}>{o.p} · {o.tittel}</Link>)}
        </nav>}
        <Seksjon tittel={t.tittel} kilde={bilde ? "1 bilde" : "Ingen bilder"}>
          <div className="bilder-par">
            <Ramme hva="Før" url={null} tittel={t.tittel} tomTekst="Ingen før-bilde ennå" />
            <Ramme hva="Nå" url={bilde} tittel={t.tittel} tomTekst="Ingen bilde registrert" />
          </div>
          <p className="kilde">Delelinje og datert før-bilde kommer når to bilder per oppgave kan lagres.</p>
          {video && <div className="knapper"><a className="knapp sek" href={video} target="_blank" rel="noopener noreferrer">Åpne video</a></div>}
        </Seksjon>
        <Seksjon tittel="Coachnotat"><p className="kilde">Ingen notat ennå.</p></Seksjon>
      </>}
  </div>;
}
