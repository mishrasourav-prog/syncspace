import { BriefcaseBusiness, CalendarDays, LockKeyhole } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

import type { MemberProfile } from "../types/profile.types";

interface MemberProfileSummaryProps {
  member: MemberProfile;
}

export function MemberProfileSummary({ member }: MemberProfileSummaryProps) {
  return (
    <section
      aria-labelledby="member-summary-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          src={member.avatar}
          name={member.name}
          size="xl"
          className="h-24 w-24 text-2xl sm:h-28 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="member-summary-heading"
                className="truncate text-h2 text-foreground"
              >
                {member.name}
              </h2>
              <p className="mt-0.5 truncate text-caption">@{member.username}</p>
            </div>

            <Badge variant="neutral">
              <LockKeyhole className="h-3 w-3" aria-hidden />
              Read-only member profile
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={member.headline ? "primary" : "neutral"}
              className="max-w-full whitespace-normal break-words text-left"
            >
              <BriefcaseBusiness className="h-3 w-3" aria-hidden />
              {member.headline || "No headline added"}
            </Badge>
          </div>

          <p className="mt-3 flex items-center gap-2 text-caption">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Member since {formatDate(member.createdAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
