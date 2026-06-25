/**
 * Gating verification step 4: UI Godkjenn → DB mutation.
 * Usage: SCRATCH=... VERIFY_BASE_URL=http://localhost:3001 npx tsx scripts/verify-godkjenninger-ui.ts
 */
import "./_env";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { prisma } from "@/lib/prisma";

const SCRATCH =
  process.env.SCRATCH ??
  "/var/folders/nw/zq6jwb211dn7q6rbv5vr1bwh0000gn/T/grok-goal-3410cbd91df7/implementer";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3001";

const lines: string[] = [];
function log(...parts: unknown[]) {
  const line = parts
    .map((p) => (typeof p === "string" ? p : JSON.stringify(p, null, 2)))
    .join(" ");
  console.log(line);
  lines.push(line);
}

const COACH = { email: "coachtest@akgolf.test", password: "Screentest123!" };

async function snapshotSessions(planId: string) {
  return prisma.trainingPlanSession.findMany({
    where: {
      planId,
      scheduledAt: { gte: new Date() },
      status: "PLANNED",
    },
    select: {
      id: true,
      title: true,
      pyramidArea: true,
      drills: { select: { exerciseId: true } },
    },
  });
}

async function main() {
  log("=== STEP 4: UI Godkjenn → DB mutation ===");
  log("BASE:", BASE);

  const action = await prisma.planAction.findFirst({
    where: {
      status: "PENDING",
      actionType: "PYRAMID_ADJUST",
      agentName: "plan-watcher",
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!action) {
    log("FAIL: ingen PENDING PYRAMID_ADJUST fra plan-watcher — kjør verify-agent-loop først");
    process.exit(1);
  }

  const plan =
    action.planId != null
      ? await prisma.trainingPlan.findUnique({ where: { id: action.planId } })
      : await prisma.trainingPlan.findFirst({
          where: { userId: action.userId, isActive: true },
        });

  if (!plan) {
    log("FAIL: ingen plan for action");
    process.exit(1);
  }

  const beforeSessions = await snapshotSessions(plan.id);
  const beforeCount = beforeSessions.length;
  log("Action:", action.id, action.actionType, "spiller:", action.user.name);
  log("BEFORE PLANNED sessions:", beforeCount, beforeSessions);

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  const responses: string[] = [];
  page.on("response", (res) => {
    const url = res.url();
    if (
      url.includes("/admin/godkjenninger") ||
      url.includes("godkjenninger") ||
      (res.request().method() === "POST" && url.includes("admin"))
    ) {
      responses.push(`${res.request().method()} ${res.status()} ${url.slice(0, 100)}`);
    }
  });

  try {
    await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', COACH.email);
    await page.fill('input[type="password"]', COACH.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|portal)/, { timeout: 25000 });
    log("Logged in:", COACH.email);

    const detailUrl = `${BASE}/admin/godkjenninger/${action.id}`;
    await page.goto(detailUrl, { waitUntil: "networkidle" });
    log("Loaded detail:", detailUrl);

    const bodyBefore = await page.locator("body").innerText();
    log("Detail has diff/analyse:", /diff|før|etter|analyse|signal/i.test(bodyBefore));

    await mkdir(SCRATCH, { recursive: true });
    await page.screenshot({
      path: join(SCRATCH, "godkjenninger-before-approve.png"),
      fullPage: true,
    });

    const godkjenn = page.getByRole("button", { name: "Godkjenn" });
    await godkjenn.click();
    log("Clicked: Godkjenn");

    // Poll DB — redirect kan ta tid; godkjenning er pass hvis status + sessions endres
    let afterAction: { status: string; updatedAt: Date } | null = null;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(500);
      afterAction = await prisma.planAction.findUnique({
        where: { id: action.id },
        select: { status: true, updatedAt: true },
      });
      if (afterAction?.status === "ACCEPTED") break;
    }

    try {
      await page.waitForURL(/\/admin\/godkjenninger\/?$/, { timeout: 5000 });
      log("Redirected to godkjenninger liste etter approve");
    } catch {
      log("Redirect timeout — sjekker DB-status i stedet");
    }

    const bodyAfter = await page.locator("body").innerText();
    if (/Noe gikk galt|feil/i.test(bodyAfter)) {
      log("UI error text:", bodyAfter.slice(0, 400));
    }
    const afterSessions = await snapshotSessions(plan.id);
    const afterCount = afterSessions.length;

    log("AFTER action status:", afterAction);
    log("AFTER PLANNED sessions:", afterCount, afterSessions);
    log("Session delta:", afterCount - beforeCount);
    log("Server responses:", responses.slice(-15));

    await page.screenshot({
      path: join(SCRATCH, "godkjenninger-after-approve.png"),
      fullPage: true,
    });

    const passed =
      afterAction?.status === "ACCEPTED" &&
      afterCount > beforeCount &&
      afterSessions.some((s) => s.drills.length > 0);

    log(passed ? "PASS step 4 (UI approve muterte plan)" : "FAIL step 4");

    const prior = await readFile(join(SCRATCH, "godkjenninger-evidence.txt"), "utf8").catch(
      () => "",
    );
    await writeFile(
      join(SCRATCH, "godkjenninger-evidence.txt"),
      `${prior}\n\n--- UI APPROVE FLOW ---\n${lines.join("\n")}`,
    );
    await writeFile(join(SCRATCH, "godkjenninger-ui.log"), lines.join("\n"));

    if (!passed) process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});