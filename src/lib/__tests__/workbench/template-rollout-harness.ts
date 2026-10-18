import { mock } from "node:test";
import assert from "node:assert/strict";

type Row = Record<string, unknown> & { id: string; playerId: string };
type Store = { rows: Map<string, Row>; drills: Record<string, unknown>[]; usage: number };
export function templateHarness() {
  const freshTemplate = () => ({ id: "syntetisk-mal", name: "Syntetisk program", approved: true, byCoachId: "syntetisk-coach", updatedAt: new Date("2026-01-01T00:00:00Z"), varighetUker: 3,
    sessions: [1,2].map((day,i) => ({ id: `mal-okt-${i}`, title: `Syntetisk økt ${i+1}`, ukeNr: 1, dagNr: day, varighetMin: 45, pyramidArea: "TEK", drillsJson: [{ exerciseId: "syntetisk-ovelse", sets: 3, reps: 5, csTarget: 80 }], focus: "Syntetisk mål", notes: "Syntetisk oppskrift" })) });
  const freshGroup = () => ({ id: "syntetisk-gruppe", name: "Syntetisk gruppe", slug: "wang-toppidrett", program: "WANG_TOPPIDRETT", coachId: "syntetisk-coach", arkivertAt: null,
    members: ["spiller-a","spiller-b"].map((userId,i) => ({ userId, joinedAt: new Date("2026-01-01T00:00:00Z"), user: { name: `Syntetisk spiller ${i+1}` } })),
    schedules: [5,6].map((day,i) => ({ id: `tid-${i}`, title: "Syntetisk gruppetid", startAt: new Date(`2026-01-0${day}T07:00:00Z`), endAt: new Date(`2026-01-0${day}T09:00:00Z`), recurring: "WEEKLY", location: "Syntetisk anlegg", kind: null, updatedAt: new Date(0) })) });
  const freshStore = (): Store => ({ rows: new Map(), drills: [], usage: 0 });
  const state = { store: freshStore(), template: freshTemplate(), group: freshGroup(), viewer: { id: "syntetisk-coach", role: "COACH" }, canEdit: true, canWrite: false, capability: true, playerAccess: true, failAt: 0, creates: 0, checks: 0, bankBlocked: new Set<string>(), bankRevision: new Date(0), query: {} as Record<string, unknown> };
  function db(store: () => Store) {
    return {
      group: { findFirst: async (args: Record<string, unknown>) => { state.query = args; return state.canEdit ? state.group : null; }, findMany: async () => state.canEdit ? [state.group] : [] },
      planTemplate: { findFirst: async () => state.template, update: async () => { store().usage++; return state.template; } },
      groupMember: { findMany: async () => state.group.members },
      groupSchedule: { findMany: async ({ where }: { where: { kind?: unknown } }) => where.kind ? [] : state.group.schedules },
      workbenchSession: {
        findMany: async ({ where }: { where: { id?: { in: string[] }; groupId?: string; sourceGroupSessionId?: string | null } }) => [...store().rows.values()].filter(r => (!where.id || where.id.in.includes(r.id)) && (!where.groupId || r.groupId === where.groupId) && (where.sourceGroupSessionId === undefined || r.sourceGroupSessionId === where.sourceGroupSessionId)).map(row => ({ ...row, drills: store().drills.filter(d => d.sessionId === row.id) })),
        findUnique: async ({ where }: { where: { id: string } }) => store().rows.get(where.id) ?? null,
        create: async ({ data }: { data: Row }) => { state.creates++; if (state.failAt === state.creates) throw new Error("syntetisk skrivefeil"); assert.equal(store().rows.has(data.id), false, "ID skal aldri dupliseres"); const row = { groupId:null, sourceGroupSessionId:null, localOverride:false, createdAt:new Date(0), updatedAt:new Date(0), publishedAt:null, pPosisjoner:[], planActionId:null, ...data }; store().rows.set(data.id, row); return row; },
        update: async ({ where,data }: { where: { id:string }; data:Record<string,unknown> }) => { const row=store().rows.get(where.id); if(!row)throw new Error("missing"); Object.assign(row,data,{updatedAt:new Date()}); return { ...row, drills:store().drills.filter(d=>d.sessionId===row.id) }; },
      },
      workbenchDrill: { create: async ({ data }: { data: Record<string, unknown> }) => { store().drills.push(data); return data; },
        upsert:async ({where,create,update}:{where:{id:string};create:Record<string,unknown>;update:Record<string,unknown>})=>{const row=store().drills.find(d=>d.id===where.id);if(row){Object.assign(row,update);return row;}store().drills.push(create);return create;},
        deleteMany:async({where}:{where:{sessionId:string;id:{notIn:string[]}}})=>{store().drills=store().drills.filter(d=>d.sessionId!==where.sessionId||where.id.notIn.includes(String(d.id)));return {count:0};}},
      $executeRaw: async () => 1,
    };
  }
  const mainDb = db(() => state.store);
  let serial: Promise<unknown> = Promise.resolve();
  mock.module("server-only", { defaultExport: {} });
  mock.module("next/cache", { namedExports: { revalidatePath() {} } });
  mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async ({ allow }: { allow: string[] }) => { if (!allow.includes(state.viewer.role)) throw new Error("role"); return state.viewer; } } });
  mock.module("@/lib/auth/effective-capabilities", { namedExports: { assertCapability: async () => { if (!state.capability) throw new Error("capability"); } } });
  mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => state.playerAccess } });
  mock.module("@/lib/workbench/group-scope", { namedExports: { canEditGroup: async () => { state.checks++; return state.canEdit; }, canWriteMemberPlans: async () => state.canWrite, editableGroupWhere: () => ({ arkivertAt: null }) } });
  mock.module("@/lib/workbench/bank-referanser", { namedExports: { lastBankOvelse: async (_id: string, _viewer: unknown, playerId: string) => state.bankBlocked.has(playerId) ? null : {
    id: "syntetisk-ovelse", name: "Syntetisk øvelse", description: "Syntetisk instruksjon", pyramidArea: "TEK", durationMin: 15, utstyr: [], tags: [], skillArea: null, morad: false,
    omraadeKode: "CHIP", motorikk: null, belastning: null, press: null, updatedAt: state.bankRevision,
  } } });
  mock.module("@/lib/prisma", { namedExports: { prisma: { ...mainDb, $transaction: (run: (tx: ReturnType<typeof db>) => Promise<unknown>) => {
    const next = serial.then(async () => {
    const current = state.store;
    const draft: Store = { rows: new Map([...current.rows].map(([id,row]) => [id,{ ...row }])), drills: current.drills.map(d => ({ ...d })), usage: current.usage };
    const result = await run(db(() => draft)); state.store = draft; return result;
    }); serial = next.catch(() => undefined); return next;
  } } } });
  return {
    state,
    reset() { state.store = freshStore(); state.template = freshTemplate(); state.group = freshGroup(); state.viewer = { id: "syntetisk-coach", role: "COACH" }; state.canEdit = state.capability = state.playerAccess = true; state.canWrite = false; state.failAt = state.creates = state.checks = 0; state.bankBlocked.clear(); state.bankRevision = new Date(0); },
    actions: () => import("@/lib/workbench/apply-template-actions"),
    input: { weekStart: "2099-01-05", uker: 1 } as const,
  };
}
