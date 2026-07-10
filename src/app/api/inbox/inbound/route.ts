/**
 * Inbound e-post-webhook for AgencyOS-innboksen (post@akgolf.no).
 *
 * [DU/Anders]: dette endepunktet må pekes til av e-postleverandørens
 * inbound-parsing (Resend Inbound eller Mailgun Inbound Routes) — det er
 * en DNS/leverandør-oppgave utenfor koden. Formatet som forventes her
 * matcher Resend/Mailgun sin enkle from/subject/text-payload:
 *   { "from": "navn@eksempel.no", "subject": "...", "text": "..." }
 * eller med et objekt for "from": { "email": "...", "name": "..." }.
 *
 * Sikkerhet: delt hemmelighet i header "x-inbox-secret", verifisert mot
 * INBOX_WEBHOOK_SECRET. Uten korrekt secret: 401.
 */
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererUtkast } from "@/lib/innboks/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InboundPayload = {
  from?: string | { email?: string; name?: string };
  subject?: string;
  text?: string;
};

function parseAvsender(from: InboundPayload["from"]): { epost: string; navn: string | null } | null {
  if (!from) return null;
  if (typeof from === "object") {
    const epost = from.email?.trim();
    if (!epost) return null;
    return { epost, navn: from.name?.trim() || null };
  }
  // Enkel "Navn <epost@domene.no>"-parsing, ellers rå e-post.
  const match = from.match(/^(.*)<(.+)>$/);
  if (match) {
    const navn = match[1].trim().replace(/^"|"$/g, "");
    const epost = match[2].trim();
    if (!epost) return null;
    return { epost, navn: navn || null };
  }
  const epost = from.trim();
  if (!epost) return null;
  return { epost, navn: null };
}

export async function POST(request: Request) {
  const secret = process.env.INBOX_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "INBOX_WEBHOOK_SECRET mangler i env" }, { status: 500 });
  }
  if (request.headers.get("x-inbox-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: InboundPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const avsender = parseAvsender(payload.from);
  if (!avsender) {
    return NextResponse.json({ error: "missing-from" }, { status: 400 });
  }

  const epost = await prisma.innboksEpost.create({
    data: {
      fraEpost: avsender.epost,
      fraNavn: avsender.navn,
      emne: payload.subject?.trim() || "(uten emne)",
      brodtekst: payload.text?.trim() || "",
      status: "NY",
    },
  });

  // Agent-utkast genereres etter at responsen er sendt — feiler aldri
  // selve inntaket hvis AI-kallet skulle svikte.
  after(async () => {
    try {
      await genererUtkast(epost.id);
    } catch (err) {
      console.error("[innboks] genererUtkast feilet:", err instanceof Error ? err.message : String(err));
    }
  });

  return NextResponse.json({ ok: true, id: epost.id }, { status: 201 });
}
