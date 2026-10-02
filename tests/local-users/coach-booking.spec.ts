import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-booking-ui-${randomUUID()}`;
const db = new pg.Pool({ connectionString: targets.database.toString() });
let bookingId: string;
let index = 0;
const ids: string[] = [];
const serviceName = `Syntetisk time ${prefix.slice(-5)}`;
const groupName = `Syntetisk gruppe ${prefix.slice(-5)}`;
const groupServiceName = `Syntetisk langtime ${prefix.slice(-5)}`;
const placeName = `Syntetisk sted ${prefix.slice(-5)}`;
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
async function row() { return (await db.query('SELECT status,"startAt","proposedStartAt","paymentMethod" FROM bookings WHERE id=$1', [bookingId])).rows[0]; }
async function detail(page: Page) { const res = await page.goto(`/admin/bookinger/${bookingId}`); expect(res?.status()).toBe(200); await expect(page.getByRole("heading", { name: serviceName, exact: true })).toBeVisible(); }
test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
  await db.query('INSERT INTO service_types (id,slug,name,"priceOre","durationMin","coachUserId","updatedAt") VALUES ($1,$1,$2,0,30,$3,NOW())',[`${prefix}-service`,serviceName,users.LOCAL_COACH_A_ID]);
  await db.query('INSERT INTO groups (id,name,"coachId","updatedAt") VALUES ($1,$2,$3,NOW())',[`${prefix}-group`,groupName,users.LOCAL_COACH_A_ID]);
  await db.query('INSERT INTO service_types (id,slug,name,"priceOre","durationMin","coachUserId","updatedAt") VALUES ($1,$1,$2,0,180,$3,NOW())',[`${prefix}-group-service`,groupServiceName,users.LOCAL_COACH_A_ID]);
  await db.query('INSERT INTO locations (id,name,address,"updatedAt") VALUES ($1,$2,$3,NOW())',[`${prefix}-place`,placeName,"Syntetisk adresse"]);
});
test.beforeEach(async () => {
  bookingId = `${prefix}-${++index}`; ids.push(bookingId);
  const start = new Date(Date.UTC(2099,0,index,10));
  await db.query('INSERT INTO bookings (id,"userId","coachId","serviceTypeId","locationId","startAt","endAt",status,"priceOre","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,\'CONFIRMED\',0,NOW())',[bookingId,users.LOCAL_P01_ID,users.LOCAL_COACH_A_ID,`${prefix}-service`,`${prefix}-place`,start.toISOString(),new Date(+start+1800000).toISOString()]);
});
test.afterAll(async () => {
  try {
    await db.query('DELETE FROM innboks_epost WHERE "bookingId"=ANY($1::text[])',[ids]);
    await db.query('DELETE FROM notifications WHERE link LIKE $1',[`%${prefix}%`]);
    await db.query('DELETE FROM audit_logs WHERE target LIKE $1',[`%${prefix}%`]);
    await db.query('DELETE FROM bookings WHERE "serviceTypeId"=$1',[`${prefix}-service`]);
    await db.query('DELETE FROM groups WHERE id=$1',[`${prefix}-group`]);
    await db.query('DELETE FROM service_types WHERE id=$1',[`${prefix}-group-service`]);
    await db.query('DELETE FROM service_types WHERE id=$1',[`${prefix}-service`]);
    await db.query('DELETE FROM locations WHERE id=$1',[`${prefix}-place`]);
  } finally { await db.end(); }
});
test("coach avlyser egen booking og ser lagret status etter ny lasting",async ({page,context},info)=>{
  await login(page,context); await detail(page);
  await expect(page.getByText("10:00–10:30",{exact:true})).toBeVisible();
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/booking-detalj-${info.project.name}.png`,fullPage:true});
  await page.getByRole("button",{name:"Avlys booking",exact:true}).click();
  await page.getByRole("alertdialog").getByRole("button",{name:"Avlys booking",exact:true}).click();
  await expect.poll(async ()=>(await row()).status).toBe("CANCELLED");
  await page.reload(); await expect(page.getByText("BOOKINGEN ER AVLYST · INGEN HANDLINGER",{exact:true})).toBeVisible();
});
test("nettfeil ved avvisning beholder begrunnelse og nytt forsøk lager ett utkast",async ({page,context})=>{
  await db.query('UPDATE bookings SET status=\'PENDING\' WHERE id=$1',[bookingId]);
  await login(page,context);await detail(page);await page.getByRole("button",{name:"Avvis",exact:true}).click();
  const dialog=page.getByRole("alertdialog");await dialog.locator("textarea").fill("Syntetisk begrunnelse for avvisning");
  await context.setOffline(true);await dialog.getByRole("button",{name:"Avvis og lag utkast",exact:true}).click();
  await expect(dialog.getByRole("alert")).toHaveText("Bookingen kunne ikke avvises. Prøv igjen.");
  expect((await row()).status).toBe("PENDING");await expect(dialog.locator("textarea")).toHaveValue("Syntetisk begrunnelse for avvisning");
  await context.setOffline(false);await dialog.getByRole("button",{name:"Avvis og lag utkast",exact:true}).click();
  await expect.poll(async ()=>(await row()).status).toBe("CANCELLED");
  expect((await db.query('SELECT count(*)::int AS n FROM innboks_epost WHERE "bookingId"=$1',[bookingId])).rows[0].n).toBe(1);
});
test("fremmed coach får ikke se detaljsiden",async ({page,context})=>{
  await login(page,context,"COACH_B");const res=await page.goto(`/admin/bookinger/${bookingId}`);
  expect([200,404]).toContain(res?.status()); // Next streams notFound with HTTP 200 after headers.
  await expect(page.getByRole("heading",{name:"Denne siden finnes ikke",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:serviceName,exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Avlys booking",exact:true})).toHaveCount(0);
  expect((await row()).status).toBe("CONFIRMED");
});
test("ny booking lagres fra hele veiviseren med klokkeslett og valgt betaling",async ({page,context},info)=>{
  const bookingDay = info.project.name === "desktop" ? "2099-02-10" : info.project.name === "mobil" ? "2099-02-11" : "2099-02-12";
  await login(page,context);await page.goto("/admin/bookinger/ny");
  await page.getByRole("radiogroup",{name:"Spiller",exact:true}).getByRole("radio").filter({hasText:users.LOCAL_P01_EMAIL}).click();
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("radiogroup",{name:"Tjeneste",exact:true}).getByRole("radio").filter({hasText:serviceName}).click();
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("radiogroup",{name:"Sted",exact:true}).getByRole("radio").filter({hasText:placeName}).click();
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.locator('input[type="date"]').fill(bookingDay);await page.locator("select").selectOption("09:30");
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("radiogroup",{name:"Betaling",exact:true}).getByRole("radio").filter({hasText:"Gratis"}).click();
  const choices=page.getByRole("radiogroup",{name:"Betaling",exact:true}).getByRole("radio");
  for (const choice of await choices.all()) {
    expect(await choice.evaluate(el=>getComputedStyle(el).display)).toBe("grid");
    expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/booking-veiviser-${info.project.name}.png`,fullPage:true});
  await page.getByRole("button",{name:"Opprett booking",exact:true}).click();await expect(page).toHaveURL(/\/admin\/bookinger\/(?!ny)[^/]+$/);
  const created=(await db.query('SELECT "startAt","paymentMethod","priceOre" FROM bookings WHERE "serviceTypeId"=$1 AND "startAt"=$2',[`${prefix}-service`,`${bookingDay}T09:30:00Z`])).rows[0];
  expect(created.paymentMethod).toBe("GRATIS");expect(created.priceOre).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("gruppetime beholder tre timers varighet over årsskiftet",async ({page,context})=>{
  await login(page,context);await page.goto(`/admin/bookinger/ny?groupId=${prefix}-group`);
  await expect(page.getByRole("radiogroup",{name:"Gruppe",exact:true}).getByRole("radio").filter({hasText:groupName})).toHaveAttribute("aria-checked","true");
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("radiogroup",{name:"Tjeneste",exact:true}).getByRole("radio").filter({hasText:groupServiceName}).click();
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("radiogroup",{name:"Sted",exact:true}).getByRole("radio").filter({hasText:placeName}).click();
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.locator('input[type="date"]').fill("2099-12-31");await page.locator("select").selectOption("22:00");
  await page.getByRole("button",{name:"Neste",exact:true}).click();
  await page.getByRole("button",{name:"Opprett booking",exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/admin/grupper/${prefix}-group/timeplan$`));
  const rows=(await db.query(`SELECT "startAt","endAt",EXTRACT(EPOCH FROM ("endAt"-"startAt"))/60 AS minutes, to_char("endAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Oslo','YYYY-MM-DD HH24:MI') AS slutt FROM group_schedules WHERE "groupId"=$1`,[`${prefix}-group`])).rows;
  expect(rows.length).toBe(1);expect(Number(rows[0].minutes)).toBe(180);expect(rows[0].slutt).toBe("2100-01-01 01:00");
  await expect(page.getByText(/22:00–01:00 · 3 t/)).toBeVisible();
});
