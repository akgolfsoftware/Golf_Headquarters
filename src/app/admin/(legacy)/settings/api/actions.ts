"use server";

import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type CreateApiKeyInput = {
  name: string;
  scopes: string[];
};

export type CreateApiKeyResult = {
  id: string;
  secret: string; // vises kun én gang
  prefix: string;
};

function generateSecret(): { fullKey: string; prefix: string; hashed: string } {
  const random = randomBytes(32).toString("base64url");
  const fullKey = `akg_${random}`;
  const prefix = fullKey.slice(0, 12);
  const hashed = createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, prefix, hashed };
}

export async function createApiKey(
  input: CreateApiKeyInput
): Promise<CreateApiKeyResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  if (!input.name.trim()) throw new Error("missing-name");

  const { fullKey, prefix, hashed } = generateSecret();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: input.name.trim(),
      hashedKey: hashed,
      prefix,
      scopes: input.scopes,
    },
  });

  await audit({
    actorId: user.id,
    action: "api_key.created",
    target: `ApiKey:${apiKey.id}`,
    metadata: { name: input.name, scopes: input.scopes },
  });

  revalidatePath("/admin/settings/api");

  return { id: apiKey.id, secret: fullKey, prefix };
}

export async function revokeApiKey(keyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) throw new Error("not-found");
  if (key.userId !== user.id && user.role !== "ADMIN") throw new Error("forbidden");

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "api_key.revoked",
    target: `ApiKey:${keyId}`,
  });

  revalidatePath("/admin/settings/api");
}
