'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { hentWangCoachGruppeId } from '@/app/team-wang/_data/wang-tilgang';
import { opprettGruppepost } from '@/lib/domain/tn-post';
const Schema = z.object({ tekst: z.string().trim().min(3).max(2000) }).strict();
/** Group identity is resolved on the server; no client-sent recipient or group id. */
export async function publiserWangGruppepost(input: unknown): Promise<{ ok: true } | { ok: false; feil: string }> {
  const bruker = await requirePortalUser({ allow: ['ADMIN', 'COACH'] });
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: 'Skriv mellom 3 og 2000 tegn.' };
  const groupId = await hentWangCoachGruppeId(bruker);
  if (!groupId) return { ok: false, feil: 'Ingen tilgang til WANG-gruppen.' };
  try {
    await opprettGruppepost({ forfatterId: bruker.id, groupId, tekst: parsed.data.tekst, kind: 'TEKST' });
    revalidatePath('/team-wang/coach');
    return { ok: true };
  } catch { return { ok: false, feil: 'Innlegget ble ikke publisert. Kontroller tilgangen og prøv igjen.' }; }
}
