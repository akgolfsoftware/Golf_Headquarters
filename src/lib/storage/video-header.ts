/** Containerhode, ikke avspillings-/innholdsanalyse. Klientens MIME er bare et hint. */
export function videoHeaderMatches(bytes: Uint8Array, mime: string, fileSize = bytes.length): boolean {
  if (!Number.isSafeInteger(fileSize) || fileSize < bytes.length) return false;
  const text = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (mime === "video/webm") {
    return bytes.length >= 8 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
      && text(0, Math.min(bytes.length, 4096)).includes("webm");
  }
  if (mime !== "video/mp4" && mime !== "video/quicktime") return false;
  if (bytes.length < 12) return false;
  const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  if (size < 8 || size > fileSize) return false;
  const atom = text(4, 8);
  if (mime === "video/quicktime" && ["moov", "mdat", "wide"].includes(atom)) return true;
  if (atom !== "ftyp" || size < 16) return false;
  const brand = text(8, 12);
  if (mime === "video/quicktime") return brand === "qt  ";
  return ["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V ", "MSNV", "dash", "cmfc", "cmfs"].includes(brand);
}
