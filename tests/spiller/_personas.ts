import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export type Persona = {
  id: "voksen" | "junior";
  navn: string;
  email: string;
};

export const PERSONAS: Persona[] = [
  { id: "voksen", navn: "Øyvind Rohjan (voksen)", email: "screentest@akgolf.test" },
  { id: "junior", navn: "Sofie Testesen (13 år)", email: "screentest-junior@akgolf.test" },
];

export function passord(): string {
  return process.env.SCREENTEST_PASSWORD?.trim() ?? "";
}
