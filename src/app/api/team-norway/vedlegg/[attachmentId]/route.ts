import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { hentTnVedleggForViewer } from "@/lib/domain/tn-post";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";

export async function GET(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  const bruker = await getCurrentUser();
  if (!bruker) return new Response("Logg inn for å laste ned filen.", { status: 401 });
  if (isAwaitingGuardianConsent(bruker)) return new Response("Foresattes samtykke mangler.", { status: 403 });
  const { attachmentId } = await context.params;
  if (!z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/).safeParse(attachmentId).success) return new Response("Fant ikke filen.", { status: 404 });
  const vedlegg = await hentTnVedleggForViewer(attachmentId, bruker.id);
  if (!vedlegg) return new Response("Fant ikke filen.", { status: 404 });
  try {
    const { data, error } = await supabaseAdmin().storage.from(STORAGE_BUCKETS.TN_POST_VEDLEGG).download(vedlegg.path);
    if (error || !data) return new Response("Filen kunne ikke hentes. Prøv igjen.", { status: 503 });
    const navn = encodeURIComponent(vedlegg.fileName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
    return new Response(data, { headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="dokument"; filename*=UTF-8''${navn}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
    } });
  } catch {
    return new Response("Filen kunne ikke hentes. Prøv igjen.", { status: 503 });
  }
}
