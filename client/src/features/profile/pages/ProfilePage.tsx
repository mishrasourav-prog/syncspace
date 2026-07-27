import { useState } from "react";

import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { AccountInformationCard } from "../components/AccountInformationCard";
import { PersonalInformationCard } from "../components/PersonalInformationCard";
import { ProfileDangerZone } from "../components/ProfileDangerZone";
import { ProfileErrorState } from "../components/ProfileErrorState";
import { ProfilePageSkeleton } from "../components/ProfilePageSkeleton";
import { ProfileSummaryCard } from "../components/ProfileSummaryCard";
import { useSelfProfileQuery } from "../hooks/useProfileQueries";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const profileQuery = useSelfProfileQuery();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to Dashboard
        </Link>
        <h1 className="mt-3 text-h1 text-foreground">Profile</h1>
        <p className="mt-1 text-body">Manage your personal information and account settings.</p>
      </header>

      {profileQuery.isLoading ? <ProfilePageSkeleton /> : null}

      {profileQuery.isError ? (
        <ProfileErrorState
          title="Unable to load your profile"
          message={profileQuery.error.message || "Please try again."}
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      ) : null}

      {profileQuery.isSuccess ? (
        <>
          <ProfileSummaryCard
            profile={profileQuery.data}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <PersonalInformationCard
              profile={profileQuery.data}
              isEditing={isEditing}
              onCancel={() => setIsEditing(false)}
              onSaved={() => setIsEditing(false)}
            />
            <AccountInformationCard profile={profileQuery.data} />
          </div>

          <ProfileDangerZone profile={profileQuery.data} />
        </>
      ) : null}
    </div>
  );
}

export default ProfilePage;
