import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-group-scope-${randomUUID()}`;
const db = new pg.Pool({ connectionString: targets.database.toString() });
async function login(page: Page, context: BrowserContext, key = "COACH_A") {
  await context.route("**/*", async route => {
    const u = new URL(route.request().url());
    if (u.hostname === "127.0.0.1" && ["3061", "55621"].includes(u.port)) await route.continue(); else await route.abort();
  });
  const email = users[`LOCAL_${key}_EMAIL`], password = users[`LOCAL_${key}_PASSWORD`];
  if (!email?.endsWith("@akgolf.test") || !password) throw Error("Synthetic identity required");
  await page.goto("/auth/login"); await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator('input[type="email"]').fill(email); await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(key.startsWith("COACH") ? /\/admin\/agencyos$/ : /\/portal$/);
  const cookie = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  if (await cookie.isVisible()) await cookie.click();
}

const kinds=["none","coach","assistant","ended","player"] as const;
const groupName=(kind:string)=>`Syntetisk gruppe ${kind} ${prefix.slice(-7)}`;
const title=(kind:string)=>`Syntetisk privat time ${kind} ${prefix.slice(-7)}`;
test.beforeAll(async()=>{
  await assertLocalUsersDatabase(db);
  for (const kind of kinds) {
    const id=`${prefix}-${kind}`;
    await db.query('INSERT INTO groups (id,name,"coachId","updatedAt") VALUES ($1,$2,$3,NOW())',[id,groupName(kind),users.LOCAL_COACH_A_ID]);
    await db.query(`INSERT INTO group_schedules (id,"groupId",title,description,"startAt","endAt","updatedAt") VALUES ($1,$2,$3,'Syntetisk beskrivelse','2099-01-01T10:00:00Z','2099-01-01T11:00:00Z',NOW())`,[`${id}-schedule`,id,title(kind)]);
    if(kind!=="none") await db.query('INSERT INTO group_members (id,"groupId","userId",role,"endedAt") VALUES ($1,$2,$3,$4,$5)',[`${id}-member`,id,users.LOCAL_COACH_B_ID,kind==="assistant"?"ASSISTANT":kind==="player"?"PLAYER":"COACH",kind==="ended"?"2026-01-01T00:00:00Z":null]);
  }
});
test.afterAll(async()=>{
  try { await db.query('DELETE FROM groups WHERE id=ANY($1::text[])',[kinds.map(k=>`${prefix}-${k}`)]); }
  finally { await db.end(); }
});
test("eier leser egen gruppetimeplan",async({page,context})=>{
  await login(page,context);await page.goto(`/admin/grupper/${prefix}-none/timeplan`);
  await expect(page.getByText(groupName("none"),{exact:true})).toBeVisible();
  await expect(page.getByText(title("none"),{exact:true})).toBeVisible();
});
for(const kind of ["coach","assistant"]) test(`aktivt ${kind}-medlem beholder innsyn`,async({page,context})=>{
  await login(page,context,"COACH_B");await page.goto(`/admin/grupper/${prefix}-${kind}/timeplan`);
  await expect(page.getByText(title(kind),{exact:true})).toBeVisible();
});
for(const kind of ["none","ended","player"]) test(`coach uten aktiv trenerrolle (${kind}) får ikke lese gruppetimeplan`,async({page,context})=>{
  await login(page,context,"COACH_B");await page.goto(`/admin/grupper/${prefix}-${kind}/timeplan`);
  await expect(page.getByRole("heading",{name:"Denne siden finnes ikke",exact:true})).toBeVisible({timeout:5000});
  await expect(page.getByText(groupName(kind),{exact:true})).toHaveCount(0);
  await expect(page.getByText(title(kind),{exact:true})).toHaveCount(0);
});
