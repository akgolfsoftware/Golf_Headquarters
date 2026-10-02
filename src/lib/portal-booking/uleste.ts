import { getUnreadNotifications } from "@/app/portal/actions";

/** Antall uleste varsler til bjella i PlayerHQ-skallet. Feiler oppslaget, vises ingen teller. */
export async function hentUleste(userId: string): Promise<number> {
  try {
    return (await getUnreadNotifications(userId, 1)).count;
  } catch {
    return 0;
  }
}
