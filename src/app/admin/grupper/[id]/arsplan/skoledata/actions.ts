"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";

const GYLDIGE_KATEGORIER = ["TIME", "PROVE", "HELDAGSPROVE", "EKSAMEN", "FERIE", "SKOLETUR", "ANNET"];
const GYLDIGE_TRINN = ["VG1", "VG2", "VG3"];

type ParsetLinje = {
  classYear: string | null;
  schoolYear: string;
  date: Date;
  category: string;
  title: string;
  note: string | null;
};

/**
 * Parser limt-inn tabelldata, ett rad per linje:
 * YYYY-MM-DD|TRINN|KATEGORI|Tittel|Notat
 * TRINN kan stå tomt (= gjelder alle trinn). Notat er valgfritt. Linjer som
 * starter med # eller er tomme hoppes over.
 */
function parseLinjer(
  raatekst: string,
  schoolYear: string,
): { rader: ParsetLinje[]; feil: string[] } {
  const rader: ParsetLinje[] = [];
  const feil: string[] = [];
  const linjer = raatekst.split("\n");

  linjer.forEach((raw, i) => {
    const linje = raw.trim();
    if (!linje || linje.startsWith("#")) return;
    const deler = linje.split("|").map((d) => d.trim());
    const [datoStr, trinnStr, kategoriStr, tittelStr, notatStr] = deler;
    const linjenr = i + 1;

    if (!datoStr || Number.isNaN(Date.parse(datoStr))) {
      feil.push(`Linje ${linjenr}: ugyldig dato «${datoStr ?? ""}»`);
      return;
    }
    const kategori = (kategoriStr ?? "").toUpperCase();
    if (!GYLDIGE_KATEGORIER.includes(kategori)) {
      feil.push(`Linje ${linjenr}: ukjent kategori «${kategoriStr ?? ""}» (må være ${GYLDIGE_KATEGORIER.join("/")})`);
      return;
    }
    const trinn = (trinnStr ?? "").toUpperCase();
    if (trinn && !GYLDIGE_TRINN.includes(trinn)) {
      feil.push(`Linje ${linjenr}: ukjent trinn «${trinnStr}» (må være VG1/VG2/VG3 eller tomt)`);
      return;
    }
    if (!tittelStr) {
      feil.push(`Linje ${linjenr}: mangler tittel`);
      return;
    }

    rader.push({
      classYear: trinn || null,
      schoolYear,
      date: new Date(`${datoStr}T00:00:00`),
      category: kategori,
      title: tittelStr,
      note: notatStr || null,
    });
  });

  return { rader, feil };
}

export async function importerSkoledata(
  groupId: string,
  formData: FormData,
): Promise<{ ok: true; antall: number; feil: string[] } | { ok: false; feil: string[] }> {
  await requireCoachActionUser();
  const schoolYear = (formData.get("schoolYear") as string) ?? "";
  const raatekst = (formData.get("data") as string) ?? "";

  if (!/^\d{4}\/\d{4}$/.test(schoolYear)) {
    return { ok: false, feil: [`Skoleår må være på formen «2026/2027», fikk «${schoolYear}»`] };
  }

  const { rader, feil } = parseLinjer(raatekst, schoolYear);
  if (rader.length === 0) {
    return { ok: false, feil: feil.length ? feil : ["Fant ingen gyldige rader å importere."] };
  }

  await prisma.schoolScheduleEntry.createMany({
    data: rader.map((r) => ({
      classYear: r.classYear,
      schoolYear: r.schoolYear,
      date: r.date,
      category: r.category,
      title: r.title,
      note: r.note,
    })),
  });

  revalidatePath(`/admin/grupper/${groupId}/arsplan`);
  revalidatePath("/team-wang");

  return { ok: true, antall: rader.length, feil };
}
