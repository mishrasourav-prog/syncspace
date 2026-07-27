import {
  BriefcaseBusiness,
  MapPin,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

import type { MemberProfile } from "../types/profile.types";

interface MemberAboutCardProps {
  member: MemberProfile;
}

interface AboutRowProps {
  label: string;
  value: string;
  icon: LucideIcon;
  preserveWhitespace?: boolean;
}

function AboutRow({ label, value, icon: Icon, preserveWhitespace = false }: AboutRowProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/35 p-3">
      <div className="flex items-center gap-2 text-caption">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {label}
      </div>
      <p
        className={`mt-2 text-sm leading-6 text-foreground ${preserveWhitespace ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export function MemberAboutCard({ member }: MemberAboutCardProps) {
  return (
    <section
      aria-labelledby="member-about-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
    >
      <h2 id="member-about-heading" className="text-h3 text-foreground">
        About
      </h2>

      <div className="mt-4 space-y-3">
        <AboutRow
          label="Headline"
          value={member.headline || "No headline added."}
          icon={BriefcaseBusiness}
        />
        <AboutRow
          label="Location"
          value={member.location || "No location added."}
          icon={MapPin}
        />
        <AboutRow
          label="Bio / About"
          value={member.bio || "No bio added."}
          icon={MessageSquareText}
          preserveWhitespace
        />
      </div>
    </section>
  );
}
