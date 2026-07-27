import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare2,
  FolderKanban,
  Mail,
  Pencil,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";

import type { SelfProfile } from "../types/profile.types";

const PROVIDER_LABEL: Record<SelfProfile["provider"], string> = {
  email: "Email",
  google: "Google",
  facebook: "Facebook",
  twitter: "Twitter",
  github: "GitHub",
};

interface ProfileSummaryCardProps {
  profile: SelfProfile;
  isEditing: boolean;
  onStartEdit: () => void;
}

export function ProfileSummaryCard({
  profile,
  isEditing,
  onStartEdit,
}: ProfileSummaryCardProps) {
  const statistics = [
    {
      label: "Workspaces",
      value: profile.stats.workspaces,
      icon: Building2,
    },
    {
      label: "Projects",
      value: profile.stats.projects,
      icon: FolderKanban,
    },
    {
      label: "Tasks completed",
      value: profile.stats.tasksCompleted,
      icon: CheckSquare2,
    },
  ] as const;

  return (
    <section
      aria-labelledby="profile-summary-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            src={profile.avatar}
            name={profile.name}
            size="xl"
            className="h-24 w-24 text-2xl sm:h-28 sm:w-28"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="profile-summary-heading" className="truncate text-h2 text-foreground">
                  {profile.name}
                </h2>
                <p className="mt-0.5 truncate text-caption">@{profile.username}</p>
              </div>

              {!isEditing ? (
                <Button type="button" size="sm" variant="secondary" onClick={onStartEdit}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit profile
                </Button>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              <p className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden />
                <span className="truncate">{profile.email}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={profile.headline ? "primary" : "neutral"} className="max-w-full whitespace-normal break-words text-left">
                  <BriefcaseBusiness className="h-3 w-3" aria-hidden />
                  {profile.headline || "No headline added"}
                </Badge>
                <Badge variant="neutral">{PROVIDER_LABEL[profile.provider]}</Badge>
              </div>

              <p className="flex items-center gap-2 text-caption">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[470px]">
          {statistics.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/35 px-3 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col">
                <dt className="truncate text-caption">{label}</dt>
                <dd className="order-first text-lg font-semibold tabular-nums text-foreground">
                  {value.toLocaleString()}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
