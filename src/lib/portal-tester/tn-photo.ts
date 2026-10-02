import "server-only";
import sharp, { type Sharp } from "sharp";

export const TN_TEST_PHOTO_INPUT_MAX = 3 * 1024 * 1024;
export const TN_TEST_PHOTO_OUTPUT_MAX = 2 * 1024 * 1024;
export const TN_TEST_PHOTO_TYPES = new Set(["jpeg", "png", "webp"]);

/** Decode from bytes, reject unsupported/animated formats and re-encode to
 * metadata-free WebP. Client MIME and filename are intentionally ignored. */
export async function normaliserTnTestbilde(input: Buffer) {
  if (!input.length || input.length > TN_TEST_PHOTO_INPUT_MAX) throw new Error("Bildet må være maks 3 MB.");
  let pipeline: Sharp;
  try {
    pipeline = sharp(input, { failOn: "error", limitInputPixels: 20_000_000, animated: false });
    const metadata = await pipeline.metadata();
    if (!metadata.format || !TN_TEST_PHOTO_TYPES.has(metadata.format) || (metadata.pages ?? 1) > 1) {
      throw new Error("Velg et stillbilde i JPEG, PNG eller WebP-format.");
    }
    const image = await pipeline.rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    if (image.data.length > TN_TEST_PHOTO_OUTPUT_MAX) throw new Error("Bildet kan ikke komprimeres nok. Velg et mindre bilde.");
    return { bytes: image.data, width: image.info.width, height: image.info.height };
  } catch (error) {
    if (error instanceof Error && /^(Bildet|Velg et stillbilde)/.test(error.message)) throw error;
    throw new Error("Bildet kunne ikke leses. Velg et vanlig JPEG-, PNG- eller WebP-bilde.");
  }
}
