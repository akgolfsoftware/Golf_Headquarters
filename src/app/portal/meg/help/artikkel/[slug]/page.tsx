// PlayerHQ Hjelp › Én artikkel — Precision Athletics, pakke 15 (utkast hjelp.html, 16.10.2026).
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { finnArtikkel, finnKategori } from "@/lib/portal-hjelp/artikler";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHHjelpArtikkel } from "@/components/portal/precision/PHHjelpArtikkel";

export const dynamic = "force-dynamic";

/** Gamle artikkeladresser fra den forrige hjelpesiden som har en ny artikkel. */
const GAMLE: Record<string, string> = {
  "logg-din-forste-runde": "registrer-din-forste-runde",
  "sett-ditt-forste-mal": "sett-din-forste-malsetning",
  "pyramide-systemet": "pyramiden",
  "bygg-din-treningsuke": "bygg-treningsuka",
  "drills-for-svake-omrader": "ovelser-der-du-taper-mest",
  "tolke-trackman-data": "les-trackman-tallene",
  "forbered-coaching-okt": "forbered-en-coachingtime",
  "credits-forklart": "klipp-forklart",
  "oppgrader-til-pro": "gratis-og-full",
  "to-faktor-autentisering": "sla-pa-tofaktor",
  "eksporter-data": "last-ned-dataene-dine",
  "hva-er-sg": "hva-betyr-strokes-gained",
  "lese-runde-rapport": "les-rundesammendraget",
};

export default async function HjelpArtikkelPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const { slug } = await params;
  if (GAMLE[slug]) redirect(`/portal/meg/help/artikkel/${GAMLE[slug]}`);
  const artikkel = finnArtikkel(slug);
  const kategori = artikkel ? finnKategori(artikkel.kategori) : null;
  if (!artikkel || !kategori) notFound();
  const uleste = await getUnreadNotifications(user.id, 1);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHHjelpArtikkel artikkel={artikkel} kategori={kategori} />
    </PlayerHQSkall>
  );
}
