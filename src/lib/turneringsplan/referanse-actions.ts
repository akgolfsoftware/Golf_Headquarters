"use server";

/**
 * Referanseplanen: trenerne i Team Norway planlegger for WAGR-spillere uten HQ-konto. Planen er delt og
 * endres direkte (det finnes ingen spiller som kan godta et forslag). Lagres i `wagr_reference_plans`,
 * samme rad som teamnorwayref skriver.
 *
 * Skrivingen går med innloggingen til treneren (Supabase-klienten), ikke med Prisma: låsen og stempelet
 * («sist endret av») ligger i databasen og trenger `auth.uid()`.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { createClient } from "@/lib/supabase/server";
import { byggReferansePlanvisning, forslagFraVisning, SESONG } from "./data";
import { medEvent, referanseEventIder, utenEvent } from "./referanse-regler";

type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

const Id = z.string().min(1).max(120);
const SpillerId = z.number().int().positive();
const LeggTil = z.object({ wagrPlayerId: SpillerId, wagrPlanEventId: Id }).strict();
const Fjern = z.object({ wagrPlayerId: SpillerId, entryId: z.string().regex(/^ref:\d+$/) }).strict();
const Fyll = z.object({ wagrPlayerId: SpillerId }).strict();

/** Trener eller ADMIN i Team Norway. Spillere og foreldre er avvist før dette. */
async function trener() {
  const bruker = await requireCoachActionUser();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) return null;
  return bruker;
}

async function lagre(wagrPlayerId: number, endre: (ider: number[]) => number[]): Promise<Svar & { endret?: number }> {
  const spiller = await prisma.wagrRefPlayer.findUnique({ where: { wagrPlayerId }, select: { name: true } });
  if (!spiller) return { ok: false, feil: "Fant ikke spilleren." };
  // Leses rett før skriving, så to trenere som endrer samtidig ikke overskriver hverandres turneringer lenger enn nødvendig.
  const rad = await prisma.wagrReferencePlan.findUnique({ where: { wagrPlayerId_season: { wagrPlayerId, season: SESONG } }, select: { events: true } });
  const for_ = referanseEventIder(rad?.events);
  const etter = endre(for_);
  if (etter.length === for_.length && etter.every((x, i) => x === for_[i])) return { ok: true, endret: 0 };
  const supabase = await createClient();
  const { error } = await supabase.from("wagr_reference_plans")
    .upsert({ wagrPlayerId, season: SESONG, playerName: spiller.name, events: etter }, { onConflict: "wagrPlayerId,season" });
  if (error) return { ok: false, feil: "Kunne ikke lagre planen. Du har kanskje ikke trenerrettighet." };
  revalidatePath(`/team-norway/referanse/planlegger/${wagrPlayerId}`);
  revalidatePath("/team-norway/referanse/planlegger");
  return { ok: true, endret: Math.abs(etter.length - for_.length) };
}

async function eventId(wagrPlanEventId: string) {
  return prisma.wagrPlanEvent.findFirst({ where: { id: wagrPlanEventId, season: SESONG }, select: { wagrEventId: true, name: true } });
}

export async function leggTilIReferanseplan(input: unknown): Promise<Svar> {
  const p = LeggTil.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig turnering." };
  if (!(await trener())) return { ok: false, feil: "Du har ikke trenerrolle i Team Norway." };
  const ev = await eventId(p.data.wagrPlanEventId);
  if (!ev) return { ok: false, feil: "Turneringen finnes ikke i katalogen." };
  const r = await lagre(p.data.wagrPlayerId, (ider) => medEvent(ider, ev.wagrEventId));
  return r.ok ? { ok: true, melding: `${ev.name} er lagt til.` } : r;
}

export async function fjernFraReferanseplan(input: unknown): Promise<Svar> {
  const p = Fjern.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig rad." };
  if (!(await trener())) return { ok: false, feil: "Du har ikke trenerrolle i Team Norway." };
  const id = Number(p.data.entryId.slice(4));
  const r = await lagre(p.data.wagrPlayerId, (ider) => utenEvent(ider, id));
  return r.ok ? { ok: true, melding: "Turneringen er fjernet." } : r;
}

/** Fyller planen opp til 14 WAGR-turneringer med forslaget. Ingenting som står der, fjernes. */
export async function fyllReferanseplan(input: unknown): Promise<Svar> {
  const p = Fyll.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig forespørsel." };
  if (!(await trener())) return { ok: false, feil: "Du har ikke trenerrolle i Team Norway." };
  const visning = await prisma.$transaction((tx) => byggReferansePlanvisning(tx, p.data.wagrPlayerId), { timeout: 30_000 });
  const forslag = forslagFraVisning(visning);
  if (!forslag.length) return { ok: true, melding: "Planen er alt full, eller ingen turneringer passer." };
  const eventer = await prisma.wagrPlanEvent.findMany({ where: { id: { in: forslag.map((f) => f.id) }, season: SESONG }, select: { wagrEventId: true } });
  const r = await lagre(p.data.wagrPlayerId, (ider) => eventer.reduce((acc, e) => medEvent(acc, e.wagrEventId), ider));
  return r.ok ? { ok: true, melding: `${eventer.length} turneringer lagt til fra forslaget.` } : r;
}
