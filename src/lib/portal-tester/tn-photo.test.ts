import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { normaliserTnTestbilde } from "./tn-photo";

test("normaliserer et godkjent bilde til WebP uten EXIF-metadata", async () => {
  const source = await sharp({ create: { width: 120, height: 80, channels: 3, background: "#2468ac" } })
    .jpeg().withMetadata({ exif: { IFD0: { Artist: "synthetic" } } }).toBuffer();
  const clean = await normaliserTnTestbilde(source);
  const metadata = await sharp(clean.bytes).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.exif, undefined);
  assert.equal(clean.width, 120);
  assert.equal(clean.height, 80);
});

test("avviser SVG, ugyldige bytes og tom fil", async () => {
  await assert.rejects(normaliserTnTestbilde(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>", "utf8")), /kunne ikke leses/i);
  await assert.rejects(normaliserTnTestbilde(Buffer.from("not an image")), /kunne ikke leses/i);
  await assert.rejects(normaliserTnTestbilde(Buffer.alloc(0)), /maks 3 MB/i);
});

test("avviser opplastinger over inngangsgrensen før bildedekoding", async () => {
  await assert.rejects(normaliserTnTestbilde(Buffer.alloc(3 * 1024 * 1024 + 1)), /maks 3 MB/i);
});
