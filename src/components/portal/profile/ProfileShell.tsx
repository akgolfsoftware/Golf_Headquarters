"use client";

/**
 * ProfileShell — hovedlayout for PlayerHQ "Meg"-profilen (/portal/meg).
 *
 * Setter opp lys, mobil-først side med:
 *   1. Profilheader (avatar + navn + meta)
 *   2. Redigerbart profilskjema
 *   3. Preferanser (varsler, enhet, språk)
 *   4. Tilkoblede kontoer
 *   5. Badges/achievements
 *   6. Logg ut
 *
 * Alle data kommer som props fra server-siden; lagring går via server actions.
 */

import type { Achievement, User } from "@/generated/prisma/client";
import type { UserPreferences } from "@/lib/preferences";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileForm } from "./ProfileForm";
import { PreferencesCard } from "./PreferencesCard";
import { ConnectedAccounts } from "./ConnectedAccounts";
import { AchievementsList } from "./AchievementsList";
import { LogoutButton } from "./LogoutButton";

export type ProfileData = {
  user: Pick<
    User,
    | "id"
    | "name"
    | "email"
    | "phone"
    | "avatarUrl"
    | "hcp"
    | "homeClub"
    | "dateOfBirth"
  >;
  preferences: UserPreferences;
  authProvider: string;
  achievements: Pick<Achievement, "id" | "kind" | "earnedAt" | "payload">[];
};

export type ProfileShellProps = {
  data: ProfileData;
  /** Server action for å oppdatere profilfelter. */
  onUpdateProfile: (input: {
    name: string;
    phone: string | null;
    homeClub: string | null;
    hcp: number | null;
    dateOfBirth: Date | null;
  }) => Promise<void>;
  /** Server action for å oppdatere preferanser. */
  onUpdatePreferences: (input: Partial<UserPreferences>) => Promise<void>;
  /** Server action for å logge ut. */
  onLogout: () => Promise<void>;
};

export function ProfileShell({
  data,
  onUpdateProfile,
  onUpdatePreferences,
  onLogout,
}: ProfileShellProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6 md:max-w-[640px]">
      <ProfileHeader user={data.user} />

      <div className="mt-6 space-y-4">
        <ProfileForm user={data.user} onSubmit={onUpdateProfile} />

        <PreferencesCard
          preferences={data.preferences}
          onChange={onUpdatePreferences}
        />

        <ConnectedAccounts provider={data.authProvider} />

        <AchievementsList achievements={data.achievements} />

        <LogoutButton onLogout={onLogout} />
      </div>
    </div>
  );
}
