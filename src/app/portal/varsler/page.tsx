import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { VarslerClient, type VarselItem } from "./varsler-client";

/**
 * Dummy-fallback hvis brukeren ikke har noen varsler i databasen ennå.
 * Gir realistisk demo-innhold som passer AK Golf-konteksten.
 */
function dummyVarsler(): VarselItem[] {
  const now = new Date();
  const iDag = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const iGaar = (h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const dagerSiden = (d: number) => {
    const out = new Date(now);
    out.setDate(out.getDate() - d);
    out.setHours(10, 0, 0, 0);
    return out;
  };

  return [
    {
      id: "dummy-1",
      type: "melding",
      title: "Coach-melding fra Anders",
      body: "Bra økt i går — fokuser på tempo i wedge-spillet de neste dagene.",
      link: "/portal/coach",
      readAt: null,
      createdAt: iDag(9, 14),
    },
    {
      id: "dummy-2",
      type: "plan",
      title: "Plan-justering godkjent",
      body: "Coach har justert ukens plan basert på TrackMan-dataene dine.",
      link: "/portal/tren",
      readAt: null,
      createdAt: iDag(8, 42),
    },
    {
      id: "dummy-3",
      type: "drill",
      title: "Ny drill tildelt: Pitch 50–100m",
      body: "Coach Anders har lagt til en ny drill i utfordringer-listen din.",
      link: "/portal/utfordringer",
      readAt: null,
      createdAt: iGaar(16, 20),
    },
    {
      id: "dummy-4",
      type: "achievement",
      title: "Mål-fremdrift: 60% av HCP-mål",
      body: "Du er godt på vei — fortsett som du gjør.",
      link: "/portal/mal",
      readAt: new Date(iGaar(11, 5).getTime()),
      createdAt: iGaar(11, 5),
    },
    {
      id: "dummy-5",
      type: "system",
      title: "Påminnelse: Sørlandsåpent om 21 dager",
      body: "Sjekk forberedelses-planen og bestill reise.",
      link: "/portal/kalender",
      readAt: new Date(dagerSiden(3).getTime()),
      createdAt: dagerSiden(3),
    },
    {
      id: "dummy-6",
      type: "trackman",
      title: "TrackMan-økt-import fullført",
      body: "62 nye slag ble importert fra økten på Performance Studio.",
      link: "/portal/trackman",
      readAt: new Date(dagerSiden(5).getTime()),
      createdAt: dagerSiden(5),
    },
  ];
}

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const erDummy = rows.length === 0;
  const varsler: VarselItem[] = erDummy
    ? dummyVarsler()
    : rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }));

  return <VarslerClient varsler={varsler} demo={erDummy} />;
}
