// PlayerHQ Hjelp › Én kategori — Precision Athletics, pakke 15 (utkast hjelp.html, 16.10.2026).
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { artiklerIKategori, finnKategori } from "@/lib/portal-hjelp/artikler";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHHjelpKategori } from "@/components/portal/precision/PHHjelpArtikkel";

export const dynamic = "force-dynamic";

/** Gamle kategoriadresser fra den forrige hjelpesiden. */
const GAMLE: Record<string, string> = { "booking-betaling": "booking", kontoinnstillinger: "konto", stats: "statistikk" };

export default async function HjelpKategoriPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const { slug } = await params;
  const kategori = finnKategori(GAMLE[slug] ?? slug);
  if (!kategori) notFound();
  const uleste = await getUnreadNotifications(user.id, 1);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHHjelpKategori kategori={kategori} artikler={artiklerIKategori(kategori.slug)} />
    </PlayerHQSkall>
  );
}
