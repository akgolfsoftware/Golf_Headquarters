import "server-only";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { krevDokumentOpplastingstilgang, opprettGruppeDokument } from "./tn-post";
import { uploadFile } from "@/lib/storage/supabase-storage";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";

const bucket = STORAGE_BUCKETS.TN_POST_VEDLEGG;
export const MAKS_TN_DOKUMENT_BYTES = MAX_FILE_SIZES[bucket];

/** Kontroller filsignaturen i tillegg til eksisterende størrelses-/MIME-grense. */
function samsvarerFiltype(bytes: Buffer, mime: string): boolean {
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return bytes.subarray(0, 4).equals(Buffer.from([80,75,3,4])) && bytes.includes(Buffer.from("[Content_Types].xml")) && bytes.includes(Buffer.from("xl/workbook.xml"));
  }
  return false;
}

export async function lagreTnDokument(groupId: string, forfatterId: string, fil: File): Promise<{ ok: true } | { ok: false; feil: string }> {
  if (!z.string().min(1).max(200).safeParse(groupId).success) return { ok: false, feil: "Ugyldig gruppe." };
  try {
    await krevDokumentOpplastingstilgang(groupId, forfatterId);
  } catch {
    return { ok: false, feil: "Du har ikke tilgang til å laste opp i denne gruppen." };
  }
  if (!(fil instanceof File) || fil.size === 0 || fil.size > MAKS_TN_DOKUMENT_BYTES) {
    return { ok: false, feil: "Velg en fil mellom 1 byte og 50 MB." };
  }
  const bytes = Buffer.from(await fil.arrayBuffer());
  if (!ALLOWED_MIME_TYPES[bucket].includes(fil.type) || !samsvarerFiltype(bytes, fil.type)) {
    return { ok: false, feil: "Filinnholdet må være PDF, JPG, PNG, WebP eller XLSX." };
  }
  const path = `${groupId}/${randomUUID()}`;
  try {
    const opplastet = await uploadFile({ bucket, path, file: bytes, contentType: fil.type });
    await opprettGruppeDokument({ forfatterId, groupId,
      fileName: fil.name.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 255) || "dokument",
      fileType: fil.type, fileSize: fil.size, path: opplastet.path });
    return { ok: true };
  } catch {
    // Stien er unik og serverlaget. Også rydding hvis signering feiler etter upload.
    try {
      const { error } = await supabaseAdmin().storage.from(bucket).remove([path]);
      if (error) return { ok: false, feil: "Dokumentet kunne ikke lagres. En ufullstendig opplasting må ryddes av administrator." };
    } catch {
      return { ok: false, feil: "Dokumentet kunne ikke lagres. En ufullstendig opplasting må ryddes av administrator." };
    }
    return { ok: false, feil: "Dokumentet kunne ikke lagres. Prøv igjen." };
  }
}
