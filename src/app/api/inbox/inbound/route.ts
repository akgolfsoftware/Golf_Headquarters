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
import { genererUtkast } from "@/lib/innboks/generer-utkast";
import { logError } from "@/lib/error-tracking";
import {
  inboundEpostSchema,
  type InboundEpost,
} from "@/lib/validation/api-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InboundPayload = InboundEpost;

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

  let rå: unknown;
  try {
    rå = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  // zod ved API-grensen (gotchas.md): før dette gikk rå webhook-felt rett inn i
  // prisma.innboksEpost.create uten formsjekk. Ugyldig form skal gi 400, ikke
  // en 500 lenger inne i DB-laget.
  const validert = inboundEpostSchema.safeParse(rå);
  if (!validert.success) {
    return NextResponse.json(
      { error: "invalid-payload", detaljer: validert.error.issues },
      { status: 400 },
    );
  }
  const payload: InboundPayload = validert.data;

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
    } catch (error) {
      await logError({ context: "innboks.generer-utkast", error, severity: "warn", meta: { epostId: epost.id } });
    }
  });

  return NextResponse.json({ ok: true, id: epost.id }, { status: 201 });
}
