import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-template-${randomUUID()}`;
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

test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
  await db.query('INSERT INTO email_templates (id,slug,name,subject,body,active,"updatedAt") VALUES ($1,$1,$2,$3,$4,true,NOW())', [prefix,"Syntetisk mal", "Lagret {{name}}", "Lagret innledning"]);
});
test.afterAll(async () => {
  try {
    await db.query('DELETE FROM audit_logs WHERE target=$1', [`EmailTemplate:${prefix}`]);
    await db.query('DELETE FROM email_templates WHERE id=$1', [prefix]);
  } finally { await db.end(); }
});
test("rediger, test ulagret tekst, lagre, arkiver og aktiver med ekte Auth og database", async ({page,context}, info) => {
  const key = info.project.name === "mobil" ? "COACH_B" : "COACH_A";
  await login(page,context,key); await page.goto(`/admin/email-templates/${prefix}/rediger`);
  await page.getByLabel("Navn på mal",{exact:true}).fill("Syntetisk endret mal");
  const subject = `Syntetisk test ${prefix} {{time}}`;
  await page.getByLabel("Emne",{exact:true}).fill(subject);
  await page.getByLabel("Tekst",{exact:true}).fill("Hei {{spillerNavn}}. Ulagret kontrolltekst <img src=x>");
  await expect(page.getByText("Syntetisk test " + prefix + " 16:30",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Send test",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"godtatt for sending"})).toBeVisible();
  const messages = await (await fetch(`http://127.0.0.1:55624/api/v1/search?query=${encodeURIComponent(`subject:${prefix}`)}`)).json();
  expect(messages.messages.length).toBeGreaterThan(0);
  const message = await (await fetch(`http://127.0.0.1:55624/api/v1/message/${messages.messages[0].ID}`)).json();
  expect(message.HTML).toContain("Ulagret kontrolltekst &lt;img src=x&gt;");
  expect(message.To.map((r:{Address:string})=>r.Address)).toEqual([users[`LOCAL_${key}_EMAIL`]]);
  expect((await db.query('SELECT subject FROM email_templates WHERE id=$1',[prefix])).rows[0].subject).toBe("Lagret {{name}}");
  await page.getByRole("button",{name:"Lagre mal",exact:true}).click();
  await expect(page.getByRole("button",{name:"Lagret",exact:true})).toBeDisabled();
  await page.reload(); await expect(page.getByLabel("Emne",{exact:true})).toHaveValue(subject);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("button",{name:"Arkiver",exact:true}).click();
  await page.screenshot({path:join(tmpdir(),`ak-hq-template-dialog-${info.project.name}.png`),fullPage:false});
  const dialogButton = page.getByRole("alertdialog").getByRole("button",{name:"Arkiver",exact:true});
  await expect(dialogButton).toBeInViewport();
  const box=await dialogButton.boundingBox();expect(box).not.toBeNull();expect(box!.x+box!.width).toBeLessThanOrEqual(info.project.use.viewport!.width);
  await dialogButton.click({timeout:5000});
  await expect(page.getByText("Inaktiv · lagret",{exact:true})).toBeVisible();
  await page.reload(); await expect(page.getByText("Inaktiv · lagret",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Send test",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"godtatt for sending"})).toBeVisible();
  expect((await db.query('SELECT active FROM email_templates WHERE id=$1',[prefix])).rows[0].active).toBe(false);
  await page.getByRole("button",{name:"Aktiver mal",exact:true}).click();
  await expect(page.getByText("Aktiv · lagret",{exact:true})).toBeVisible();
  await page.getByLabel("Emne",{exact:true}).fill("Avvis syntetisk " + prefix);
  await page.getByRole("button",{name:"Send test",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"Testen kunne ikke sendes"})).toBeVisible();
  const audits = await db.query('SELECT metadata FROM audit_logs WHERE target=$1 AND action=$2', [`EmailTemplate:${prefix}`,"email_template.test_sent"]);
  expect(audits.rowCount).toBe(2); expect(audits.rows.every(r=>r.metadata===null)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const screenshots=join(tmpdir(),"ak-hq-template-editor");mkdirSync(screenshots,{recursive:true});
  await page.screenshot({path:join(screenshots,`${info.project.name}-feil.png`),fullPage:true});
});
test("spiller får ikke lese maleditoren",async({page,context})=>{
  await login(page,context,"P01");await page.goto(`/admin/email-templates/${prefix}/rediger`);
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByLabel("Emne",{exact:true})).toHaveCount(0);
  await expect(page.getByText("Lagret innledning",{exact:true})).toHaveCount(0);
});
