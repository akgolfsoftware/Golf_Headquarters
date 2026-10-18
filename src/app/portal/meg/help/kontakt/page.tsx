// PlayerHQ «Skriv til oss» og «Sendt» — Precision Athletics, pakke 15 (utkast hjelp.html, 16.10.2026).
/**
 * /portal/meg/help/kontakt — ett skjema for spørsmål, feil, forslag og ros (sendSkrivTilOss).
 * ?type= forhåndsvelger typen, ?fra= er siden spilleren kom fra. Etter sending viser ?sendt=<id>
 * kvitteringen, og bare for meldinger brukeren selv har sendt.
 */
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { SKRIV_TYPE_NAVN, saksnummer, type SkrivTilOssType } from "@/lib/portal-hjelp/saksnummer";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHSendt, PHSkrivTilOss } from "@/components/portal/precision/PHSkrivTilOss";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skriv til oss · PlayerHQ" };

const Sok = z.object({
  type: z.enum(["sporsmal", "bug", "forslag", "ros"]).optional().catch(undefined),
  fra: z.string().max(200).regex(/^[a-z0-9/_\-[\]]+$/i).optional().catch(undefined),
  sendt: z.string().max(40).optional().catch(undefined),
});
const TID = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default async function SkrivTilOssPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const raa = await searchParams;
  const sp = Sok.parse(Object.fromEntries(Object.entries(raa).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
  const [uleste, sendt] = await Promise.all([
    getUnreadNotifications(user.id, 1),
    sp.sendt
      ? prisma.appFeedback.findFirst({ where: { id: sp.sendt, userId: user.id }, select: { id: true, type: true, tekst: true, createdAt: true } })
      : null,
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      {sendt
        ? <PHSendt data={{
          tid: TID.format(sendt.createdAt),
          type: SKRIV_TYPE_NAVN[sendt.type as SkrivTilOssType] ?? "Melding",
          emne: sendt.tekst.split("\n")[0] ?? "",
          epost: user.email ?? "",
          saksnummer: saksnummer(sendt.id),
        }} />
        : <PHSkrivTilOss data={{ navn: user.name ?? "", epost: user.email ?? "", type: sp.type ?? "sporsmal", fra: sp.fra ?? null }} />}
    </PlayerHQSkall>
  );
}
