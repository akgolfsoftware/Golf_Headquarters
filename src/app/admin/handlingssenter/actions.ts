"use server";

/**
 * Handlingssenter-mutasjoner (Bølge 8, 2026-07-13 — feilfiks-plan 2.1).
 * «Merk fullført» var kun optimistisk lokal state; nå skrives statusen
 * TILBAKE til Notion (kilden for OppgaveCache) og caches umiddelbart, så
 * fullføringen overlever refresh og neste sync.
 */

import { revalidatePath } from "next/cache";
import { Client as NotionClient } from "@notionhq/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { decrypt } from "@/lib/notion/crypto";
import { logError } from "@/lib/error-tracking";

/** Finn status-alternativet som betyr «ferdig» i databasens schema.
 *  Notion-status har grupper (to-do/in-progress/complete) — vi tar første
 *  alternativ i complete-gruppen, med navne-heuristikk som fallback. */
function velgFerdigNavn(schema: unknown, propStatus: string): string | null {
  if (!schema || typeof schema !== "object") return null;
  const props = (schema as { properties?: Record<string, unknown> }).properties;
  const prop = props?.[propStatus];
  if (!prop || typeof prop !== "object") return null;
  const status = (prop as { status?: { options?: { id: string; name: string }[]; groups?: { name: string; option_ids: string[] }[] } }).status;
  if (!status) return null;
  const completeGruppe = status.groups?.find((g) => g.name.toLowerCase() === "complete");
  if (completeGruppe && completeGruppe.option_ids.length > 0) {
    const opt = status.options?.find((o) => o.id === completeGruppe.option_ids[0]);
    if (opt) return opt.name;
  }
  const heuristikk = status.options?.find((o) => /done|ferdig|fullført|complete/i.test(o.name));
  return heuristikk?.name ?? null;
}

export async function markerOppgaveFullfort(
  oppgaveId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const oppgave = await prisma.oppgaveCache.findUnique({
    where: { id: oppgaveId },
    include: { databaseLink: { include: { connection: true } } },
  });
  if (!oppgave) return { ok: false, error: "Fant ikke oppgaven." };

  const link = oppgave.databaseLink;
  let notionOk = false;
  let ferdigNavn = "Done";

  if (link.propStatus) {
    try {
      const notion = new NotionClient({ auth: decrypt(link.connection.accessTokenEnc) });
      const schema = await notion.dataSources.retrieve({
        data_source_id: link.notionDataSourceId ?? link.notionDatabaseId,
      });
      const navn = velgFerdigNavn(schema, link.propStatus);
      if (navn) {
        ferdigNavn = navn;
        await notion.pages.update({
          page_id: oppgave.notionPageId,
          properties: { [link.propStatus]: { status: { name: navn } } },
        });
        notionOk = true;
      }
    } catch (err) {
      await logError({ context: "handlingssenter.markerFullfort", error: err, meta: { oppgaveId } });
    }
  }

  // Cache oppdateres uansett så UI-et er ærlig med det samme; hvis Notion-
  // skrivingen feilet sier vi det i klartekst (neste sync kan rulle tilbake).
  await prisma.oppgaveCache.update({
    where: { id: oppgaveId },
    data: { status: ferdigNavn },
  });

  revalidatePath("/admin/handlingssenter");
  if (!notionOk) {
    return {
      ok: true,
      error: "Merket fullført lokalt — fikk ikke oppdatert Notion (kan bli tilbakestilt ved neste sync).",
    };
  }
  return { ok: true };
}
