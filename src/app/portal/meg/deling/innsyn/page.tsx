import { notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTrenerIupOversikt, hentTrenerIup } from "@/lib/iup/trener-lesing";
import { hentTrenerensDelteSpillere } from "@/lib/deling/treneroversikt";
import { TrenerIupSvar } from "@/components/portal/precision/trener-iup-svar";
import "@/styles/precision-athletics.css";
import "@/styles/navngitt-deling.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Delte besvarelser · AK Golf HQ", robots: { index: false, follow: false } };
const ListeValg = z.object({ etterSpiller: z.string().min(1).max(120).optional(), etterGruppe: z.string().min(1).max(120).optional() }).strict();
const Valg = z.object({ spiller: z.string().min(1).max(120), gruppe: z.string().min(1).max(120),
  id: z.string().min(1).max(120).optional(), forRevisjon: z.coerce.number().int().positive().optional(),
  forDato: z.iso.date().optional(), forId: z.string().min(1).max(120).optional(),
}).strict();
async function lesTillatt<T>(les: () => Promise<T>): Promise<T | null> {
  try { return await les(); }
  catch (feil) {
    if (feil instanceof Error && feil.message === "forbidden") return null;
    throw feil;
  }
}
const navn: Record<string, string> = { UTVIKLINGSSJEKK: "Utviklingssjekk", SESONGEVALUERING: "Sesongevaluering", UNG: "Ung", JUNIOR: "Junior", AMATOR: "Amatør", PROFESJONELL: "Profesjonell", ALLE: "Alle nivåer" };

export default async function TrenerIupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"], kreverTilgang: "INGEN" });
  const sok = await searchParams;
  if (!sok.spiller && !sok.gruppe) {
    const listevalg = ListeValg.safeParse(sok);
    if (!listevalg.success) notFound();
    const liste = await lesTillatt(() => hentTrenerensDelteSpillere(listevalg.data));
    if (!liste) return <div className="pa-root"><main className="deling-side"><h1>Tilgang stengt</h1><p>Innsyn krever en bekreftet WANG- eller Team Norway-trenerkonto.</p></main></div>;
    return <div className="pa-root" data-design="precision-athletics"><main className="deling-side">
      <Link className="deling-tilbake" href="/portal/meg/deling">Trenerdeling</Link>
      <header><span className="kicker">Navngitt trenerinnsyn</span><h1>Spillere som deler med meg</h1><p>Her vises bare delinger du har godtatt og fortsatt har tilgang til.</p></header>
      <section className="deling-panel"><h2>Aktive delinger</h2>
        {liste.spillere.length ? <ul className="deling-liste">{liste.spillere.map((spiller) => <li key={`${spiller.id}:${spiller.gruppeId}`}>
          <Link className="deling-tilbake" href={`/portal/meg/deling/innsyn?spiller=${encodeURIComponent(spiller.id)}&gruppe=${encodeURIComponent(spiller.gruppeId)}`}>{spiller.navn}</Link>
          <span>{spiller.gruppeNavn}</span>
        </li>)}</ul> : <p>Ingen aktive delinger på denne siden. Spilleren eller foresatte oppretter lenken fra Meg → Deling.</p>}
        {liste.nesteSide && <Link className="deling-tilbake" href={`/portal/meg/deling/innsyn?etterSpiller=${encodeURIComponent(liste.nesteSide.etterSpiller)}&etterGruppe=${encodeURIComponent(liste.nesteSide.etterGruppe)}`}>Flere delinger</Link>}
      </section><p>Dette innsynet viser leverte utviklingssjekker og sesongevalueringer. Øvrige profildeler er ikke tilgjengelige her ennå.</p>
    </main></div>;
  }
  const parsed = Valg.safeParse(sok);
  if (!parsed.success) notFound();
  const p = parsed.data;
  const oversikt = await lesTillatt(() => hentTrenerIupOversikt({ spillerId: p.spiller, gruppeId: p.gruppe, forDato: p.forDato, forId: p.forId }));
  if (!oversikt) return <div className="pa-root"><main className="deling-side"><h1>Tilgang stengt</h1><p>Du har ikke aktiv navngitt deling for dette innsynet. Medlemskap alene gir ikke tilgang til besvarelsene.</p></main></div>;
  const historikk = p.id ? await lesTillatt(() => hentTrenerIup({ spillerId: p.spiller, gruppeId: p.gruppe, besvarelseId: p.id, forRevisjon: p.forRevisjon })) : null;
  if (p.id && !historikk) notFound();
  const basis = `/portal/meg/deling/innsyn?spiller=${encodeURIComponent(p.spiller)}&gruppe=${encodeURIComponent(p.gruppe)}`;
  return <div className="pa-root" data-design="precision-athletics"><main className="deling-side">
    <Link className="deling-tilbake" href="/portal/meg/deling/innsyn">Spillere som deler med meg</Link>
    <header><span className="kicker">Navngitt trenerinnsyn</span><h1>{oversikt.spiller.name}</h1><p>Leverte utviklingssjekker og sesongevalueringer. Spilleren eier besvarelsene; utkast vises ikke.</p></header>
    {historikk ? <>
      <Link className="deling-tilbake" href={basis}>Alle leverte besvarelser</Link>
      <h2>{navn[historikk.type] ?? "Evaluering"} · {historikk.versjon.replace("iup-", "")} · {navn[historikk.niva] ?? historikk.niva}</h2>
      <p>{historikk.periodeStart}–{historikk.periodeSlutt}</p>
      {historikk.revisjoner.map((r) => <section className="deling-panel" key={r.revisjon}><h3>Levering {r.revisjon} · {r.createdAt.slice(0, 10)}</h3>
        {r.innhold ? <TrenerIupSvar svar={r.innhold} /> : <p role="alert">Denne leveringen har et kilde- eller formatavvik og kan ikke vises.</p>}
      </section>)}
      {historikk.nesteRevisjon && <Link className="deling-tilbake" href={`${basis}&id=${encodeURIComponent(historikk.id)}&forRevisjon=${historikk.nesteRevisjon}`}>Tidligere leveringer</Link>}
    </> : <section className="deling-panel"><h2>Leverte besvarelser</h2>
      {oversikt.besvarelser.length === 0 ? <p>Ingen leverte besvarelser på denne siden.</p> : <ul className="deling-liste">{oversikt.besvarelser.map((b) => <li key={b.id}><Link href={`${basis}&id=${encodeURIComponent(b.id)}`}>
        {navn[b.type] ?? b.type} · {b.versjon.replace("iup-", "")} · {navn[b.niva] ?? b.niva} · {b.periodeStart}–{b.periodeSlutt}
      </Link><small>Siste levering {b.levert?.slice(0, 10) ?? "ukjent"}</small></li>)}</ul>}
      {oversikt.nesteSide && <Link className="deling-tilbake" href={`${basis}&forDato=${oversikt.nesteSide.forDato}&forId=${encodeURIComponent(oversikt.nesteSide.forId)}`}>Tidligere perioder</Link>}
    </section>}
    <p>Øvrige deler av fullprofilen er ikke tilgjengelige i dette innsynet ennå.</p>
  </main></div>;
}
