import { z } from "zod";

export const COACHING_EMAIL_DRAFT = "COACHING_EMAIL_DRAFT";
export const CoachingEmailDraft = z.object({
  tittel: z.string().min(1).max(200), forklaring: z.string().max(1000),
  bookingId: z.string().min(1).max(128), coachId: z.string().min(1).max(128),
  kind: z.enum(["TAKK", "OPPFOLGING"]), completedAt: z.string().datetime(),
  subject: z.string().min(1).max(200), body: z.string().trim().min(1).max(10000),
});
export type CoachingEmailDraftData = z.infer<typeof CoachingEmailDraft>;
export const CoachingDraftInput = z.object({ actionId: z.string().min(1).max(128), body: z.string().trim().min(1).max(10000) });
