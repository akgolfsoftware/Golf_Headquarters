import { chromium } from "playwright";

const DR = `${process.env.HOME}/Library/CloudStorage/GoogleDrive-akgolfgroup@gmail.com/My Drive/AK Golf Group/software/akgolf-hq/design-retninger`;
const files = ["A-skog-premium", "B-editorial-lys", "C-terminal"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

for (const f of files) {
  const url = `file://${DR}/${f}.html`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DR}/${f}.png`, fullPage: true });
  console.log(`skjermbilde: ${f}.png`);
}

await browser.close();
console.log("ferdig");
