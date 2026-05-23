-- P17 GDPR art. 8: mindreårig + foreldresamtykke
ALTER TABLE public.users
  ADD COLUMN "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN "requiresGuardianConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "guardianConsentGivenAt" TIMESTAMP(3),
  ADD COLUMN "guardianConsentByUserId" TEXT;

CREATE INDEX "users_requiresGuardianConsent_idx" ON public.users("requiresGuardianConsent");
CREATE INDEX "users_guardianConsentByUserId_idx" ON public.users("guardianConsentByUserId");
