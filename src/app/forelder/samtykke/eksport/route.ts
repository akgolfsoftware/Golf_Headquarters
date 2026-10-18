import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { lastForelderEksport } from "@/lib/forelder-eksport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Delt foreldreinnsyn, ikke barnets private kontoeksport. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "PARENT" && user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const eksport = await lastForelderEksport(user.id);
  await prisma.dataExportRequest.create({ data: { userId: user.id, type: "EXPORT", status: "COMPLETED" } });
  await audit({ actorId: user.id, action: "data.export.downloaded", target: `User:${user.id}`, metadata: { antallBarn: eksport.barn.length } });
  const filnavn = `ak-golf-foreldreinnsyn-${new Date().toISOString().split("T")[0]}.json`;
  return new NextResponse(JSON.stringify(eksport, null, 2), { status: 200, headers: {
    "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="${filnavn}"`,
    "cache-control": "private, no-store",
  } });
}
