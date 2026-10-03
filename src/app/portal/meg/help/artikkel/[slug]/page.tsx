/**
 * PH25Artikkel — hjelpeartikkel i PlayerHQSkall.
 * Oppslag, fallback uten brødtekst og notFound er uendret.
 * Brødteksten er redaksjonelt hjelpeinnhold, ikke spillerens egne tall.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import {
  MegHelpArtikkelV2,
  type MegHelpArtikkelData,
} from "@/components/portal/v2/MegHelpArtikkelV2";
import { HJELP_ARTIKLER } from "../../data";

const ARTIKLER: Record<string, MegHelpArtikkelData & { slug: string }> = {
  "pyramide-systemet": {
    slug: "pyramide-systemet",
    tittelLead: "Hva er",
    tittelItalic: "pyramide-systemet",
    eyebrow: "Trening · Artikkel · 5 min lesetid",
    forfatter: {
      initialer: "AK",
      navn: "Anders Kristiansen",
      rolle: "Head Coach · AK Golf",
    },
    oppdatert: "12. mai 2026",
    lesetid: 5,
    toc: [
      { id: "h1", tittel: "Hvorfor en pyramide?" },
      { id: "h2", tittel: "De fem disiplinene" },
      { id: "h3", tittel: "Slik balanseres uka" },
      { id: "h4", tittel: "Når balansen tipper" },
    ],
  },
};

export default async function ArtikkelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const { slug } = await params;
  const ulest = await getUnreadNotifications(user.id, 1);
  const a = ARTIKLER[slug];

  if (!a) {
    const meta = HJELP_ARTIKLER.find((x) => x.slug === slug);
    if (!meta) notFound();
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <div className="pa-side">
          <div className="ph-flate">
            <Link href="/portal/meg/help" className="ph-tilbake">Hjelp-hub</Link>
            <section className="pa-card ph-kort">
              <p>{meta.kategori} · Artikkel · {meta.lesetid} min lesetid</p>
              <TomTilstand
                icon={FileText}
                title={meta.tittel}
                text="Denne artikkelen er ikke skrevet ferdig ennå. Ta kontakt med coach-teamet, så hjelper de deg direkte i mellomtiden."
                actions={
                  <>
                    <KnappLenke href="/portal/coach/melding/ny" icon={MessageSquare}>Send melding til coach</KnappLenke>
                    <KnappLenke href="/portal/meg/help" variant="secondary">Tilbake til hjelp-hub</KnappLenke>
                  </>
                }
              />
            </section>
          </div>
        </div>
      </PlayerHQSkall>
    );
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/meg/help" className="ph-tilbake">Hjelp-hub</Link>
          <MegHelpArtikkelV2 data={a} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
