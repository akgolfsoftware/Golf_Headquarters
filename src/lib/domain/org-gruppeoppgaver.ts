'use server';

import { audit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { assertCapability } from '@/lib/auth/effective-capabilities';
import { Capability } from '@/lib/auth/cbac';
import { editableGroupWhere } from '@/lib/workbench/group-scope';
import { orgGruppeWhere } from '@/lib/domain/grupper';
import { orgOppgaveInnenGruppetid, type OrgGruppeOppgave, type OrgGruppeOppgaverData } from './org-gruppeoppgaver-kontrakt';

const Valg = z.object({ groupId: z.string().min(1).max(200) }).strict();
const Endring = Valg.extend({ sessionId: z.string().min(1).max(200), expectedUpdatedAt: z.iso.datetime(), title: z.string().trim().min(1).max(200), pyramid: z.enum(['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN']), maalsetning: z.string().trim().max(500).nullable().optional() }).strict();

/** Own organisation group data only. No individual plan, notes, health or private messages. */
export async function hentOrgGruppeOppgaver(input: unknown): Promise<{ ok: true; data: OrgGruppeOppgaverData } | { ok: false; error: string }> {
  const bruker = await requirePortalUser({ allow: ['ADMIN', 'COACH'] });
  const valg = Valg.safeParse(input);
  if (!valg.success) return { ok: false, error: 'Ugyldig gruppe.' };
  try {
    return await prisma.$transaction(async tx => {
      const gruppe = await tx.group.findFirst({ where: { id: valg.data.groupId, AND: [editableGroupWhere(bruker), orgGruppeWhere()] }, select: { id: true, name: true, members: { where: { role: 'PLAYER', endedAt: null, user: { deletedAt: null, anonymisertAt: null } }, select: { userId: true, user: { select: { name: true } } } } } });
      if (!gruppe) return { ok: false as const, error: 'Ingen tilgang til denne gruppen.' };
      const kilder = await tx.workbenchSession.findMany({ where: { groupId: gruppe.id, origin: 'GROUP', sourceGroupSessionId: null, status: 'PUBLISHED', id: { startsWith: 'wb-group-' } }, select: { id: true, date: true, startMinute: true, durationMinutes: true, title: true, drills: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, durationMinutes: true } } } });
      const spillere = new Map(gruppe.members.map(m => [m.userId, m.user.name ?? 'Ukjent spiller']));
      const kopier = kilder.length ? await tx.workbenchSession.findMany({ where: { groupId: gruppe.id, sourceGroupSessionId: { in: kilder.map(k => k.id) }, playerId: { in: [...spillere.keys()] }, status: { in: ['SCHEDULED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED'] }, planActionId: null }, select: { id: true, playerId: true, sourceGroupSessionId: true, date: true, startMinute: true, durationMinutes: true, title: true, maalsetning: true, pyramid: true, status: true, actualMinutes: true, updatedAt: true, drillLogs: { select: { reps: true } } } }) : [];
      const oppgaver: OrgGruppeOppgave[] = kopier.flatMap(kopi => {
        const kilde = kilder.find(k => k.id === kopi.sourceGroupSessionId);
        if (!kilde || !orgOppgaveInnenGruppetid(kilde, kopi)) return [];
        return [{ id: kopi.id, playerId: kopi.playerId, spillerNavn: spillere.get(kopi.playerId) ?? 'Ukjent spiller', gruppeOkt: kilde.title, date: kopi.date.toISOString().slice(0, 10), startMinute: kopi.startMinute, durationMinutes: kopi.durationMinutes, title: kopi.title, maalsetning: kopi.maalsetning, pyramid: kopi.pyramid, status: kopi.status, actualMinutes: kopi.actualMinutes, loggedReps: kopi.drillLogs.length ? kopi.drillLogs.reduce((sum, logg) => sum + logg.reps, 0) : null, updatedAt: kopi.updatedAt.toISOString() }];
      });
      return { ok: true as const, data: { groupId: gruppe.id, groupName: gruppe.name, gruppeOkter: kilder.map(k => ({ id: k.id, date: k.date.toISOString().slice(0,10), startMinute: k.startMinute, durationMinutes: k.durationMinutes, title: k.title, drills: k.drills })), oppgaver } };
    });
  } catch { return { ok: false, error: 'Kunne ikke hente gruppeoppgavene. Prøv igjen.' }; }
}

/** Date/time are intentionally absent from input. The assignment stays in its group slot. */
export async function endreOrgGruppeOppgave(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const bruker = await requirePortalUser({ allow: ['ADMIN', 'COACH'] });
  const valg = Endring.safeParse(input);
  if (!valg.success) return { ok: false, error: 'Ugyldig oppgave. Dato og tid endres i gruppeplanen.' };
  try {
    await assertCapability(bruker, Capability.EDIT_GROUP_PLANS);
    await prisma.$transaction(async tx => {
      const gruppe = await tx.group.findFirst({ where: { id: valg.data.groupId, AND: [editableGroupWhere(bruker), orgGruppeWhere()] }, select: { id: true } });
      if (!gruppe) throw new Error('scope');
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`wb-group:${gruppe.id}`}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${valg.data.sessionId}))`;
      const kopi = await tx.workbenchSession.findFirst({ where: { id: valg.data.sessionId, groupId: gruppe.id, sourceGroupSessionId: { not: null }, planActionId: null }, select: { id: true, playerId: true, sourceGroupSessionId: true, date: true, startMinute: true, durationMinutes: true, status: true, updatedAt: true, actualMinutes: true, liveSnapshot: true, drillLogs: { select: { id: true }, take: 1 } } });
      if (!kopi || !['SCHEDULED', 'PUBLISHED'].includes(kopi.status) || kopi.updatedAt.toISOString() !== valg.data.expectedUpdatedAt || kopi.actualMinutes !== null || kopi.liveSnapshot !== null || kopi.drillLogs.length) throw new Error('stale');
      const medlem = await tx.groupMember.findFirst({ where: { groupId: gruppe.id, userId: kopi.playerId, role: 'PLAYER', endedAt: null, user: { deletedAt: null, anonymisertAt: null } }, select: { id: true } });
      const kilde = await tx.workbenchSession.findFirst({ where: { id: kopi.sourceGroupSessionId!, groupId: gruppe.id, origin: 'GROUP', sourceGroupSessionId: null, status: 'PUBLISHED' }, select: { date: true, startMinute: true, durationMinutes: true } });
      if (!medlem || !kilde || !orgOppgaveInnenGruppetid(kilde, kopi)) throw new Error('group-time');
      const resultat = await tx.workbenchSession.updateMany({ where: { id: kopi.id, updatedAt: kopi.updatedAt, status: kopi.status }, data: { title: valg.data.title, pyramid: valg.data.pyramid, maalsetning: valg.data.maalsetning, localOverride: true } });
      if (resultat.count !== 1) throw new Error('stale');
    });
    await audit({ actorId: bruker.id, action: 'ORG_GROUP_ASSIGNMENT_UPDATE', target: valg.data.sessionId, metadata: { groupId: valg.data.groupId } });
    for (const sti of ['/portal', '/team-wang/coach', '/team-norway/oppgaver', '/team-norway/belastning', '/team-norway/workbench']) revalidatePath(sti);
    return { ok: true };
  } catch { return { ok: false, error: 'Oppgaven ble ikke endret. Kontroller tilgang eller last inn oppgaven på nytt.' }; }
}
