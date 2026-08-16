/**
 * Utstyr-flatens data (W3) — /portal/meg/utstyr.
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-utstyr.html
 *
 * To kilder som IKKE kan maskin-kobles (se gapping-data.ts):
 *  - EquipmentBag: bagen som seks fritekstfelter («irons», «wedges») —
 *    registrert av spilleren i /portal/meg/utstyrsbag.
 *  - TrackMan-slagene: målte carry-snitt per kølle (beregnGapping, D5).
 *
 * Lengdene er MÅLTE snitt, aldri ønsketall. Kølle under måleterskelen
 * (tynn) viser «—» og stiplet søyle — ingen gjetting.
 */

import { prisma } from "@/lib/prisma";
import { hentGapping } from "@/lib/portal/gapping-data";
import type { KolleMaaling, Gap } from "@/lib/domain/gapping";

export type UtstyrBagFelt = { label: string; kort: string; verdi: string };

export type UtstyrFlateData = {
  /** Bag-feltene som faktisk er fylt ut (fritekst fra EquipmentBag). */
  bagFelter: UtstyrBagFelt[];
  /** Ball og tilbehør (ball, bag, notater) — også fritekst. */
  tilbehor: UtstyrBagFelt[];
  notater: string | null;
  harBag: boolean;
  /** Målte køller, stigende etter median (fasitens trapp går SW → Dr). */
  koller: KolleMaaling[];
  gap: Gap[];
  vinduDager: number;
  okter: number;
};

/** Rekkefølge + etiketter for bag-feltene, fasitens korte kølle-koder. */
const BAG_FELTER = [
  ["driver", "Driver", "Dr"],
  ["fairwayWoods", "Fairwaywood", "Fw"],
  ["hybrids", "Hybrid", "Hy"],
  ["irons", "Jernsett", "Jn"],
  ["wedges", "Wedger", "We"],
  ["putter", "Putter", "Pt"],
] as const;

export async function hentUtstyrFlate(userId: string): Promise<UtstyrFlateData> {
  const [bag, gapping] = await Promise.all([
    prisma.equipmentBag.findUnique({ where: { userId } }),
    hentGapping(userId),
  ]);

  const bagFelter: UtstyrBagFelt[] = [];
  for (const [felt, label, kort] of BAG_FELTER) {
    const verdi = bag?.[felt]?.trim();
    if (verdi) bagFelter.push({ label, kort, verdi });
  }

  const tilbehor: UtstyrBagFelt[] = [];
  if (bag?.ball?.trim()) tilbehor.push({ label: "Ball", kort: "Ba", verdi: bag.ball.trim() });
  if (bag?.bag?.trim()) tilbehor.push({ label: "Bag", kort: "Bg", verdi: bag.bag.trim() });

  // Stigende median — fasitens trapp tegnes fra kortest til lengst.
  const koller = [...gapping.koller].sort((a, b) => a.median - b.median);

  return {
    bagFelter,
    tilbehor,
    notater: bag?.notes?.trim() || null,
    harBag: bagFelter.length > 0 || tilbehor.length > 0,
    koller,
    gap: gapping.gap,
    vinduDager: gapping.vinduDager,
    okter: gapping.okter,
  };
}

/**
 * Kort kølle-etikett til trappa (fasit: SW/PW/9/8/7/6/5/4h/3v/Dr).
 * TrackMan-navnene er fritekst — mønstrene under dekker de vanlige, resten
 * beholder de tre første tegnene i stedet for å gjette.
 */
export function kortKolleNavn(klubb: string): string {
  const k = klubb.trim().toLowerCase();
  if (/^driver$/.test(k)) return "Dr";
  if (/putter/.test(k)) return "Pt";
  if (/pitch/.test(k) || /^pw$/.test(k)) return "PW";
  if (/sand/.test(k) || /^sw$/.test(k)) return "SW";
  if (/lob/.test(k) || /^lw$/.test(k)) return "LW";
  if (/gap ?wedge/.test(k) || /^gw$/.test(k)) return "GW";
  const jern = k.match(/^(\d{1,2})-?\s*jern$/) ?? k.match(/^jern\s*(\d{1,2})$/);
  if (jern) return jern[1];
  const hybrid = k.match(/^(\d)-?\s*hybrid/) ?? k.match(/hybrid\s*(\d)/);
  if (hybrid) return `${hybrid[1]}h`;
  const wood = k.match(/^(\d)-?\s*(?:wood|tre)/) ?? k.match(/(?:wood|tre)\s*(\d)/);
  if (wood) return `${wood[1]}v`;
  return klubb.trim().slice(0, 3);
}
