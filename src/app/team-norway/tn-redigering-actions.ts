"use server";

/**
 * Server actions for knappene på Team Norway-skjermene (Anders 27.09.2026).
 * Layout-guards kjører ikke for actions, så hver action slår opp brukeren selv.
 * At brukeren er trener i Team Norway-gruppen håndheves i domenelaget
 * (src/lib/domain/tn-redigering.ts), som for de andre Team Norway-handlingene.
 */

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import * as skriv from "@/lib/domain/tn-redigering";

async function bruker() {
  return requirePortalUser({ kreverTilgang: "INGEN" });
}

function oppdater(...stier: string[]) {
  for (const sti of stier) revalidatePath(sti, sti.includes("[") ? "page" : undefined);
}

export async function lagreSamlingAction(id: string | null, input: unknown) {
  const r = await skriv.lagreSamling(await bruker(), id, input);
  if (r.ok) oppdater("/team-norway", "/team-norway/samlinger", "/team-norway/samlinger/[id]", "/team-norway/manedsplan");
  return r;
}

export async function slettSamlingAction(id: string) {
  const r = await skriv.slettSamling(await bruker(), id);
  if (r.ok) oppdater("/team-norway", "/team-norway/samlinger", "/team-norway/manedsplan");
  return r;
}

export async function lagreOktAction(id: string | null, input: unknown) {
  const r = await skriv.lagreOkt(await bruker(), id, input);
  if (r.ok) oppdater("/team-norway/manedsplan");
  return r;
}

export async function slettOktAction(id: string) {
  const r = await skriv.slettOkt(await bruker(), id);
  if (r.ok) oppdater("/team-norway/manedsplan");
  return r;
}

export async function endreTestdagAction(id: string, input: unknown) {
  const r = await skriv.endreTestdag(await bruker(), id, input);
  if (r.ok) oppdater("/team-norway", "/team-norway/fellestesting");
  return r;
}

export async function slettTestdagAction(id: string) {
  const r = await skriv.slettTestdag(await bruker(), id);
  if (r.ok) oppdater("/team-norway", "/team-norway/fellestesting");
  return r;
}

export async function endrePostAction(postId: string, tekst: unknown) {
  const r = await skriv.endrePost(await bruker(), postId, tekst);
  if (r.ok && r.data) oppdater(`/team-norway/${r.data.groupId}`, "/team-norway");
  return r.ok ? { ok: true as const } : r;
}

export async function slettPostAction(postId: string) {
  const r = await skriv.slettPost(await bruker(), postId);
  if (r.ok && r.data) oppdater(`/team-norway/${r.data.groupId}`, `/team-norway/${r.data.groupId}/dokumenter`, "/team-norway");
  return r.ok ? { ok: true as const } : r;
}

export async function slettDokumentAction(attachmentId: string) {
  const r = await skriv.slettDokument(await bruker(), attachmentId);
  if (r.ok && r.data) oppdater(`/team-norway/${r.data.groupId}`, `/team-norway/${r.data.groupId}/dokumenter`);
  return r.ok ? { ok: true as const } : r;
}

export async function lagreUttakAction(input: unknown) {
  const r = await skriv.lagreUttak(await bruker(), input);
  if (r.ok) oppdater("/team-norway/uttak");
  return r;
}

export async function slettUttakAction(id: string) {
  const r = await skriv.slettUttak(await bruker(), id);
  if (r.ok) oppdater("/team-norway/uttak");
  return r;
}

export async function lagreSpillerstatusAction(input: unknown) {
  const r = await skriv.lagreSpillerstatus(await bruker(), input);
  if (r.ok) oppdater("/team-norway/lisens-okonomi", "/team-norway/spiller/[spillerId]/oversikt");
  return r;
}

export async function lagreCollegeAction(input: unknown) {
  const r = await skriv.lagreCollege(await bruker(), input);
  if (r.ok) oppdater("/team-norway/college");
  return r;
}

export async function slettCollegeAction(spillerId: string) {
  const r = await skriv.slettCollege(await bruker(), spillerId);
  if (r.ok) oppdater("/team-norway/college");
  return r;
}

export async function avsluttSpillerAction(spillerId: string) {
  const r = await skriv.avsluttSpiller(await bruker(), spillerId);
  if (r.ok) oppdater("/team-norway", "/team-norway/tilgang", "/team-norway/spillere");
  return r;
}
