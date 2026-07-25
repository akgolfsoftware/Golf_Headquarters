// supabase-meg/functions/embed/index.ts
// Edge Function «embed» — lager tekst-embeddings med Supabase innebygd gte-small
// (384 dim, gratis). Brukes av BÅDE Vercel-boten (src/lib/meg/embeddings.ts) og
// Mac-indekseringen (scripts/meg-index-vaults.ts) så query og dokument alltid
// deler samme embedding-rom.
//
// Deploy: Meg-Supabase dashboard → Edge Functions → «Deploy a new function» →
// navn «embed», lim inn denne filen. «Verify JWT» skal være AV — funksjonen
// autentiserer selv mot service-role-nøkkelen under (virker uavhengig av
// legacy/ny nøkkel-format).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const session = new Supabase.ai.Session("gte-small");

const MAX_BATCH = 64;

Deno.serve(async (req: Request) => {
  const auth = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey || auth !== serviceKey) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const input = (body as { input?: unknown }).input;
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > MAX_BATCH ||
    input.some((t) => typeof t !== "string" || t.length === 0)
  ) {
    return new Response(
      JSON.stringify({ error: `input må være string[] med 1–${MAX_BATCH} elementer` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const embeddings: number[][] = [];
  for (const text of input as string[]) {
    const vec = (await session.run(text, {
      mean_pool: true,
      normalize: true,
    })) as number[];
    embeddings.push(Array.from(vec));
  }

  return new Response(JSON.stringify({ embeddings }), {
    headers: { "Content-Type": "application/json" },
  });
});
