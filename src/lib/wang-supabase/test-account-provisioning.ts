import { WANG_SYNTHETIC_PROFILES } from "./synthetic-profiles";
import {
  expectedWangTestEmail,
  WANG_DEMO_PROJECT_REF,
  type WangTestAccountInput,
} from "./test-account-linking";
import { WANG_ROLES, type WangRole } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface WangTestAccountSpec {
  role: WangRole;
  profileKey: string;
  email: string;
}

export interface WangTestCredentialAccount extends WangTestAccountSpec {
  id: string;
  password: string;
}

export interface WangTestCredentialDocument extends WangTestAccountInput {
  accounts: WangTestCredentialAccount[];
}

export function lagWangTestAccountSpecs(): WangTestAccountSpec[] {
  return WANG_SYNTHETIC_PROFILES.map((profile) => ({
    role: profile.role,
    profileKey: profile.profileKey,
    email: expectedWangTestEmail(profile.profileKey),
  }));
}

export function erGodkjentSyntetiskWangAuthBruker(
  spec: WangTestAccountSpec,
  user: {
    email?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  },
): boolean {
  return (
    user.email === spec.email &&
    user.app_metadata?.wang_synthetic === true &&
    user.app_metadata?.wang_synthetic_profile_key === spec.profileKey &&
    user.user_metadata?.wang_synthetic_profile_key === spec.profileKey
  );
}

export function lagWangTestCredentialDocument(input: {
  studentId: string;
  accounts: WangTestCredentialAccount[];
}): WangTestCredentialDocument {
  if (!UUID_PATTERN.test(input.studentId)) {
    throw new Error("studentId må være en gyldig UUID.");
  }
  const byRole = new Map(input.accounts.map((account) => [account.role, account]));
  if (byRole.size !== WANG_ROLES.length || input.accounts.length !== WANG_ROLES.length) {
    throw new Error("Kontoene må inneholde nøyaktig én konto for hver WANG-rolle.");
  }

  const accounts = WANG_ROLES.map((role) => {
    const account = byRole.get(role);
    const expected = lagWangTestAccountSpecs().find((spec) => spec.role === role);
    if (
      !account ||
      !expected ||
      !UUID_PATTERN.test(account.id) ||
      account.profileKey !== expected.profileKey ||
      account.email !== expected.email ||
      account.password.length < 24
    ) {
      throw new Error(`Ugyldig syntetisk testkonto for rollen ${role}.`);
    }
    return account;
  });
  if (new Set(accounts.map((account) => account.id)).size !== WANG_ROLES.length) {
    throw new Error("Hver syntetiske WANG-konto må ha en unik bruker-ID.");
  }

  return {
    projectRef: WANG_DEMO_PROJECT_REF,
    studentId: input.studentId,
    profileIds: Object.fromEntries(
      accounts.map((account) => [account.role, account.id]),
    ) as Record<WangRole, string>,
    accounts,
  };
}
