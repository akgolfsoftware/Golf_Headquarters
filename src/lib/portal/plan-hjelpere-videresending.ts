/**
 * PlayerHQ pakke 17b: de gamle adressene for plan-hjelperne og skjermen hver av dem sendes til.
 * Sidene under de gamle adressene leser herfra, så testen låser hvor de sender.
 * Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, «Sendes videre».
 */
export const PLAN_HJELPERE_VIDERESENDING = {
  "/portal/tren/fys-plan": "/portal/planlegge/fysisk",
  "/portal/tren/fys-plan/[planId]": "/portal/planlegge/fysisk",
  "/portal/kalender/opptatt": "/portal/planlegge/opptatt",
  "/portal/tren/feiring/[planId]": "/portal/planlegge/periode-ferdig",
  "/portal/ai/mal-bygger": "/portal/mal/ny",
} as const;

/**
 * Føringen av én fysisk økt (dagens logger, FysiskV2). Den er ikke i nytt design ennå og blir stående på
 * /portal/fysisk til Live fysisk er koblet til programmet; adressen videresendes derfor ikke i 17b.
 */
export const FYSISK_OKT_HREF = "/portal/fysisk";

export const periodeFerdigHref = (periodeId: string) => `/portal/planlegge/periode-ferdig/${periodeId}`;
