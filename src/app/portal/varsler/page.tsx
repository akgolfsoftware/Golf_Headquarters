/**
 * PH-21 Innboks · Varsler (/portal/varsler) i Precision Athletics.
 * Samme Notification-spørring som før, gruppert per dag (I dag / Denne uka / Tidligere)
 * og filtrert på kategori avledet av Notification.type.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Varsler, type PH21Varsel, type PH21VarselKategori } from "@/components/portal/precision/PH21Innboks";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Varsler · PlayerHQ" };

function kategori(type: string): PH21VarselKategori {
  if (type === "melding" || type === "ai" || type === "session-invite") return "coach";
  if (type === "booking") return "timer";
  if (type === "runde" || type === "trackman") return "foring";
  if (type.includes("test")) return "tester";
  if (type === "betaling" || type === "faktura" || type === "credit") return "betaling";
  return "annet";
}

const OSLO_DAG = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" });
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hour12: false });
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const dagNr = (d: Date) => Math.floor(Date.parse(`${OSLO_DAG.format(d)}T00:00:00Z`) / 86_400_000);

async function lesAlle() {
  "use server";
  await markNotificationsRead();
}

export default async function VarslerPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const rader = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const naa = new Date();
  const idag = dagNr(naa);
  const varsler: PH21Varsel[] = rader.map((r) => {
    const dager = idag - dagNr(r.createdAt);
    return {
      id: r.id,
      kategori: kategori(r.type),
      tittel: r.title,
      tekst: r.body,
      tid: dager === 0 ? OSLO_TID.format(r.createdAt) : dager === 1 ? "I går" : dager < 7 ? `${dager} dager` : OSLO_DATO.format(r.createdAt),
      ulest: r.readAt == null,
      lenke: r.link,
      gruppe: dager === 0 ? "I dag" : dager < 7 ? "Denne uka" : "Tidligere",
    };
  });
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={varsler.filter((v) => v.ulest).length}>
      <PH21Varsler varsler={varsler} lesVarsel={markNotificationsRead} lesAlle={lesAlle} />
    </PlayerHQSkall>
  );
}
