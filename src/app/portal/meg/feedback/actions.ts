"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";

type Input = {
  nps: number;
  type: "bug" | "forslag" | "ros" | "sporsmal";
  tekst: string;
  anonym: boolean;
};

export async function submitFeedback(input: Input): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

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
