import { useState } from "react";

import { ChevronRight, KeyRound, Trash2 } from "lucide-react";

import type { SelfProfile } from "../types/profile.types";

import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface ProfileDangerZoneProps {
  profile: SelfProfile;
}

export function ProfileDangerZone({ profile }: ProfileDangerZoneProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <section
      aria-labelledby="danger-zone-heading"
      className="rounded-xl border border-danger/30 bg-danger/5 p-5 sm:p-6"
    >
      <h2 id="danger-zone-heading" className="text-h3 text-danger">
        Danger Zone
      </h2>
      <p className="mt-1 text-caption">
        Security and irreversible account actions require additional
        confirmation.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPasswordDialogOpen(true)}
          className="flex min-h-20 items-center gap-3 rounded-lg border border-danger/20 bg-background/40 p-4 text-left transition-colors hover:border-danger/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
            <KeyRound className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Change Password
            </span>
            <span className="mt-1 block text-caption">
              {profile.canChangePassword
                ? "Update your password and sign out every active session."
                : "Your password is managed by your authentication provider."}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="flex min-h-20 items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-left transition-colors hover:border-danger/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/20 text-danger">
            <Trash2 className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Delete Account
            </span>
            <span className="mt-1 block text-caption">
              Remove current access and anonymize your personal account identity
              permanently.
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        </button>
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        canChangePassword={profile.canChangePassword}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        profile={profile}
      />
    </section>
  );
}

export default ProfileDangerZone;
