import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { krevDokumentOpplastingstilgang } from "@/lib/domain/tn-post";
import { lagreTnDokument, MAKS_TN_DOKUMENT_BYTES } from "@/lib/domain/tn-dokument-lagring";

/** Avgrenset multipart-rute: filgrensen trenger ikke endre alle server actions. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ ok: false, feil: "Ugyldig forespørsel." }, { status: 403 });
  let bruker;
  try { bruker = await requireCoachActionUser(); }
  catch { return Response.json({ ok: false, feil: "Ikke tilgang." }, { status: 403 }); }
  const groupId = new URL(request.url).searchParams.get("groupId");
  if (!z.string().min(1).max(200).safeParse(groupId).success || !groupId) return Response.json({ ok: false, feil: "Ugyldig gruppe." }, { status: 400 });
  try { await krevDokumentOpplastingstilgang(groupId, bruker.id); }
  catch { return Response.json({ ok: false, feil: "Ikke tilgang til gruppen." }, { status: 403 }); }
  const maxBody = MAKS_TN_DOKUMENT_BYTES + 64 * 1024;
  if (Number(request.headers.get("content-length")) > maxBody) return Response.json({ ok: false, feil: "Filen er for stor. Maks 50 MB." }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ ok: false, feil: "Ingen fil valgt." }, { status: 400 });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBody) {
        await reader.cancel();
        return Response.json({ ok: false, feil: "Filen er for stor. Maks 50 MB." }, { status: 413 });
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
    const fil = form.get("file");
    if (!(fil instanceof File)) return Response.json({ ok: false, feil: "Ingen fil valgt." }, { status: 400 });
    const svar = await lagreTnDokument(groupId, bruker.id, fil);
    if (svar.ok) {
      revalidatePath(`/team-norway/${groupId}/dokumenter`);
      revalidatePath("/team-norway/dokumenter");
    }
    return Response.json(svar, { status: svar.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, feil: "Opplasting feilet. Prøv igjen." }, { status: 400 });
  }
}
