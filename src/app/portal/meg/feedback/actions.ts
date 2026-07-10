"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { audit } from "@/lib/audit";
import { nonEmpty } from "@/lib/validation/schemas";
import { prisma } from "@/lib/prisma";

const FeedbackSchema = z.object({
  nps: z.number().int().min(0, "NPS må være minst 0").max(10, "NPS kan være maks 10"),
  type: z.enum(["bug", "forslag", "ros", "sporsmal"], { error: "Ugyldig tilbakemeldingstype" }),
  tekst: nonEmpty(2000),
  anonym: z.boolean(),
});

type Input = {
  nps: number;
  type: "bug" | "forslag" | "ros" | "sporsmal";
  tekst: string;
  anonym: boolean;
};

export async function submitFeedback(input: Input): Promise<void> {
  FeedbackSchema.parse(input);
  const user = await requireConsentingUser();

  await prisma.appFeedback.create({
    data: {
      userId: user.id,
      type: input.type,
      tekst: input.tekst,
      side: "portal/meg/feedback",
    },
  });

  await audit({
    actorId: input.anonym ? "anonym" : user.id,
    action: "feedback.submitted",
    target: user.id,
    metadata: {
      nps: input.nps,
      type: input.type,
      tekstLengde: input.tekst.length,
      anonym: input.anonym,
    },
  });

  redirect("/portal/meg/feedback?takk=1");
}
