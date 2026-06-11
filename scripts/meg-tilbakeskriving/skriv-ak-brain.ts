/**
 * Skriver dagsnotat fra Meg-logger til ak-brain-vaulten.
 * Appender ## Fra Meg-seksjon nederst i $AK_BRAIN_PATH/YYYY-MM-DD.md.
 * Idempotent: hopper over hvis seksjonen allerede finnes.
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";

export async function skrivAkBrain(
  dato: string,
  dagsnotat: string,
  akBrainPath: string,
): Promise<void> {
  const filsti = path.join(akBrainPath, `${dato}.md`);

  let eksisterende = "";
  try {
    eksisterende = await readFile(filsti, "utf-8");
  } catch {
    // filen finnes ikke — opprettes nedenfor
  }

  if (eksisterende.includes("## Fra Meg")) {
    console.log(`[ak-brain] ${dato}: ## Fra Meg finnes allerede, hopper over`);
    return;
  }

  const topptekst = eksisterende.trim() ? eksisterende.trimEnd() : `# ${dato}`;
  const innhold = `${topptekst}\n\n## Fra Meg\n\n${dagsnotat.trim()}\n`;

  await writeFile(filsti, innhold, "utf-8");
  console.log(`[ak-brain] ${dato}: dagsnotat skrevet → ${filsti}`);
}
