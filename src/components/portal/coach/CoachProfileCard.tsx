import { Mail, Phone, User } from "lucide-react";
import { AthleticAvatar } from "@/components/athletic/avatar";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import type { CoachProfile } from "@/app/portal/coach/actions";

type CoachProfileCardProps = {
  coach: CoachProfile;
};

export function CoachProfileCard({ coach }: CoachProfileCardProps) {
  if (!coach) {
    return (
      <AthleticCard label="Din coach" showPulse>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
            <User className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Ingen coach tildelt</h2>
            <p className="text-sm text-muted-foreground">
              Når du får tildelt en coach, vises profil og kontaktinfo her.
            </p>
          </div>
        </div>
      </AthleticCard>
    );
  }

  return (
    <AthleticCard
      label="Din coach"
      action={<AthleticEyebrow tone="lime">HOVEDCOACH</AthleticEyebrow>}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AthleticAvatar
          src={coach.avatarUrl}
          alt={coach.name}
          initials={coach.initials}
          size="lg"
          status="online"
        />
        <div className="flex-1">
          <h2 className="font-display text-xl font-semibold tracking-tight">{coach.name}</h2>
          <p className="text-sm text-muted-foreground">{coach.role === "ADMIN" ? "Admin / Coach" : "Hovedcoach"}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <a
              href={`mailto:${coach.email}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              {coach.email}
            </a>
            {coach.phone && (
              <a
                href={`tel:${coach.phone}`}
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                {coach.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </AthleticCard>
  );
}
