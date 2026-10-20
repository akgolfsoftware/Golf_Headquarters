/** Samme globale CSS/prosess som Next, uten innlogging eller datakall. */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
const root = process.cwd();
const from = resolve(root, "src/app/globals.css");
const out = process.env.PRECISION_GLOBAL_CSS_OUT ? resolve(process.env.PRECISION_GLOBAL_CSS_OUT) : resolve(tmpdir(), "ak-hq-upgrade-global.css");
const result = await postcss([tailwindcss({ base: root, optimize: false, transformAssetUrls: false })]).process(readFileSync(from, "utf8"), { from, to: out });
writeFileSync(out, result.css);
console.log(`Global CSS for skjermprøvene: ${out}`);
