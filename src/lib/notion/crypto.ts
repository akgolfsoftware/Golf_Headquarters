// Krypto-helper for Notion OAuth-tokens.
// AES-256-GCM med 12-byte IV + 16-byte auth tag.
//
// NOTION_ENCRYPTION_KEY må være 32 bytes hex (64 chars).
// Generer med: openssl rand -hex 32

import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.NOTION_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "NOTION_ENCRYPTION_KEY mangler. Generer med: openssl rand -hex 32",
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error(
      `NOTION_ENCRYPTION_KEY må være 32 bytes hex (64 chars). Fikk ${key.length} bytes.`,
    );
  }
  cachedKey = key;
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Ugyldig kryptert token-format");
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
