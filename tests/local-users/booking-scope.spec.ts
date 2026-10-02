import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-booking-scope-${randomUUID()}`;
const db = new pg.Pool({ connectionString: targets.database.toString() });
const title = `Syntetisk booking ${prefix.slice(-7)}`;
const privateNote = `Syntetisk privat notat ${prefix.slice(-7)}`;
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

test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
  await db.query('INSERT INTO service_types (id,slug,name,"priceOre","durationMin","coachUserId","updatedAt") VALUES ($1,$1,$2,0,30,$3,NOW())',[`${prefix}-service`,title,users.LOCAL_COACH_A_ID]);
  await db.query('INSERT INTO locations (id,name,address,"updatedAt") VALUES ($1,$2,$2,NOW())',[`${prefix}-place`,"Syntetisk sted"]);
  for (const kind of ["direct","service"]) {
    await db.query(`INSERT INTO bookings (id,"userId","coachId","serviceTypeId","locationId","startAt","endAt",status,"priceOre",notes,"updatedAt") VALUES ($1,$2,$3,$4,$5,'2099-01-01T10:00:00Z','2099-01-01T10:30:00Z','CONFIRMED',0,$6,NOW())`,[`${prefix}-${kind}`,users.LOCAL_P01_ID,kind==="direct"?users.LOCAL_COACH_A_ID:null,`${prefix}-service`,`${prefix}-place`,privateNote]);
  }
});
test.afterAll(async () => {
  try {
    await db.query('DELETE FROM bookings WHERE "serviceTypeId"=$1',[`${prefix}-service`]);
    await db.query('DELETE FROM service_types WHERE id=$1',[`${prefix}-service`]);
    await db.query('DELETE FROM locations WHERE id=$1',[`${prefix}-place`]);
  } finally { await db.end(); }
});
for (const kind of ["direct","service"]) test(`coach ser egen booking via ${kind}`,async ({page,context})=>{
  await login(page,context);await page.goto(`/admin/bookinger/${prefix}-${kind}`);
  await expect(page.getByText(title,{exact:true})).toBeVisible();
  await expect(page.getByText(privateNote,{exact:true})).toBeVisible();
});
for (const kind of ["direct","service"]) test(`fremmed coach får ikke lese booking via ${kind}`,async ({page,context})=>{
  await login(page,context,"COACH_B");await page.goto(`/admin/bookinger/${prefix}-${kind}`);
  await expect(page.getByRole("heading",{name:"Denne siden finnes ikke",exact:true})).toBeVisible({timeout:5000});
  await expect(page.getByText(title,{exact:true})).toHaveCount(0);
  await expect(page.getByText(privateNote,{exact:true})).toHaveCount(0);
});
test("bookingens spiller får ikke coachens detaljside",async ({page,context})=>{
  await login(page,context,"P01");await page.goto(`/admin/bookinger/${prefix}-direct`);
  await expect(page.getByText(privateNote,{exact:true})).toHaveCount(0);
  await expect(page).not.toHaveURL(new RegExp(`/admin/bookinger/${prefix}-direct$`));
});
test("uinnlogget får ikke lese bookingdetaljer",async ({page})=>{
  await page.goto(`/admin/bookinger/${prefix}-direct`);
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByText(privateNote,{exact:true})).toHaveCount(0);
});
