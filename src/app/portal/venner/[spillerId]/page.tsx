/**
 * PH24Venn — vennprofil i PlayerHQSkall.
 * Status først, aktivitetsfeed, og tom tilstand med forklaring.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Eye } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentVennProfil } from "@/lib/venner/actions";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { StatusPille, TomTilstand } from "@/components/precision/pa";
import { FjernVennKnapp } from "./FjernVennKnapp";
import { RapporterVennKnapp } from "./RapporterVennKnapp";

export const dynamic = "force-dynamic";

function formatterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default async function VennProfilPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;

  const [data, ulest] = await Promise.all([
    hentVennProfil(spillerId),
    getUnreadNotifications(user.id, 1),
  ]);
  if (!data) notFound();

  const { venn, feed, synligAv } = data;
  const fornavn = venn.name.split(" ")[0];
  const meta = [
    venn.kategori ? `Kategori ${venn.kategori}` : null,
    venn.hcp != null ? `HCP ${venn.hcp.toString().replace(".", ",")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/venner" className="ph-tilbake">Venner</Link>
        <div className="ph-flate">
          <header>
            <p>PlayerHQ · Venn</p>
            <h1>{venn.name}</h1>
            {meta ? <p>{meta}</p> : null}
          </header>

          <StatusPille tone={synligAv ? "ok" : "warn"}>
            {synligAv ? "Deler aktivitet" : "Skjult aktivitet"}
          </StatusPille>
          <FjernVennKnapp vennUserId={venn.id} />

          <section className="pa-card ph-kort">
            <p>Aktivitet</p>
            {!synligAv ? (
              <TomTilstand
                icon={Eye}
                title={`${fornavn} deler ikke økter ennå`}
                text="Denne spilleren har ikke skrudd på synlige økter for venner."
              />
            ) : feed.length === 0 ? (
              <TomTilstand
                icon={Activity}
                title="Ingen aktivitet ennå"
                text="Ingen fullførte økter eller runder registrert ennå."
              />
            ) : (
              <ul>
                {feed.map((a) => (
                  <li key={a.id}>
                    <span>
                      <strong>{a.tittel}</strong>
                      <small>{a.detalj}</small>
                    </span>
                    <b>{formatterDato(a.dato)}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p>
            <Eye size={14} aria-hidden /> Du ser kun AT {fornavn} har trent — ingen plan, mål eller tall er delt.
          </p>

          <RapporterVennKnapp vennUserId={venn.id} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
