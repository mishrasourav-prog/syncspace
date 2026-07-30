import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useUpdateSelfProfileMutation } from "../hooks/useProfileMutations";
import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_HEADLINE_MAX_LENGTH,
  PROFILE_LOCATION_MAX_LENGTH,
  type ProfileFormValues,
  profileFormSchema,
  toUpdateSelfProfilePayload,
} from "../schemas/profile.schemas";
import type {
  SelfProfile,
  UpdateSelfProfilePayload,
} from "../types/profile.types";

interface PersonalInformationCardProps {
  profile: SelfProfile;
  isEditing: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

function toDefaultValues(profile: SelfProfile): ProfileFormValues {
  return {
    name: profile.name,
    username: profile.username,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
  };
}

function buildChangedPayload(
  values: ProfileFormValues,
  profile: SelfProfile,
): UpdateSelfProfilePayload {
  const normalized = toUpdateSelfProfilePayload(values);
  const payload: UpdateSelfProfilePayload = {};

  if (normalized.name !== profile.name) {
    payload.name = normalized.name;
  }

  if (normalized.username !== profile.username) {
    payload.username = normalized.username;
  }

  if (normalized.headline !== profile.headline) {
    payload.headline = normalized.headline;
  }

  if (normalized.bio !== profile.bio) {
    payload.bio = normalized.bio;
  }

  if (normalized.location !== profile.location) {
    payload.location = normalized.location;
  }

  return payload;
}

export function PersonalInformationCard({
  profile,
  isEditing,
  onCancel,
  onSaved,
}: PersonalInformationCardProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateMutation = useUpdateSelfProfileMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toDefaultValues(profile),
  });

  const headlineValue = useWatch({ control, name: "headline" }) ?? "";
  const bioValue = useWatch({ control, name: "bio" }) ?? "";

  useEffect(() => {
    if (!isEditing) {
      reset({
        name: profile.name,
        username: profile.username,
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
      });
    }
  }, [
    isEditing,
    profile.name,
    profile.username,
    profile.headline,
    profile.bio,
    profile.location,
    reset,
  ]);

  function handleCancel() {
    reset(toDefaultValues(profile));
    setFormError(null);
    updateMutation.reset();
    onCancel();
  }

  function onSubmit(values: ProfileFormValues) {
    if (updateMutation.isPending) {
      return;
    }

    setFormError(null);
    updateMutation.reset();

    const payload = buildChangedPayload(values, profile);

    if (Object.keys(payload).length === 0) {
      onSaved();
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully.");
        onSaved();
      },
      onError: (error) => {
        if (error.status === 409) {
          setError("username", {
            type: "server",
            message: error.message || "Username is already taken.",
          });
          return;
        }

        setFormError(error.message || "Unable to update your profile.");
      },
    });
  }

  if (!isEditing) {
    return (
      <section
        aria-labelledby="personal-information-heading"
        className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
      >
        <h2
          id="personal-information-heading"
          className="text-h3 text-foreground"
        >
          Personal Information
        </h2>

        <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-caption">Full Name</dt>
            <dd className="mt-1 text-sm text-foreground">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-caption">Username</dt>
            <dd className="mt-1 text-sm text-foreground">
              @{profile.username}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-caption">Email Address</dt>
            <dd className="mt-1 break-all text-sm text-foreground">
              {profile.email}
            </dd>
          </div>
          <div>
            <dt className="text-caption">Headline</dt>
            <dd className="mt-1 text-sm text-foreground">
              {profile.headline || "No headline added."}
            </dd>
          </div>
          <div>
            <dt className="text-caption">Location</dt>
            <dd className="mt-1 text-sm text-foreground">
              {profile.location || "No location added."}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-caption">Bio / About</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {profile.bio || "No bio added."}
            </dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <form
      aria-labelledby="personal-information-heading"
      className="rounded-xl border border-border bg-surface/60 p-4 shadow-soft sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <h2
          id="personal-information-heading"
          className="text-h3 text-foreground"
        >
          Personal Information
        </h2>
        <p className="mt-1 text-caption">
          Update the public details your teammates see.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="profile-name">
          <Input
            id="profile-name"
            autoComplete="name"
            {...register("name")}
            error={errors.name?.message}
          />
        </FormField>

        <FormField label="Username" htmlFor="profile-username">
          <Input
            id="profile-username"
            autoComplete="username"
            {...register("username")}
            error={errors.username?.message}
          />
        </FormField>

        <div className="mb-4 sm:col-span-2">
          <Label htmlFor="profile-email">Email Address</Label>
          <Input
            id="profile-email"
            value={profile.email}
            readOnly
            aria-describedby="profile-email-help"
            className="cursor-not-allowed opacity-70"
          />
          <p id="profile-email-help" className="mt-1.5 text-xs text-muted">
            Email changes require a verified email-change workflow and are not
            available in this version.
          </p>
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <Label htmlFor="profile-headline" className="mb-0">
              Headline (Optional)
            </Label>
            <span className="text-[11px] tabular-nums text-muted">
              {headlineValue.length}/{PROFILE_HEADLINE_MAX_LENGTH}
            </span>
          </div>
          <Input
            id="profile-headline"
            placeholder="e.g. Frontend Developer"
            maxLength={PROFILE_HEADLINE_MAX_LENGTH}
            {...register("headline")}
            error={errors.headline?.message}
          />
        </div>

        <FormField label="Location (Optional)" htmlFor="profile-location">
          <Input
            id="profile-location"
            placeholder="City, Region"
            maxLength={PROFILE_LOCATION_MAX_LENGTH}
            {...register("location")}
            error={errors.location?.message}
          />
        </FormField>

        <div className="mb-4 sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <Label htmlFor="profile-bio" className="mb-0">
              Bio / About (Optional)
            </Label>
            <span className="text-[11px] tabular-nums text-muted">
              {bioValue.length}/{PROFILE_BIO_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="profile-bio"
            rows={5}
            maxLength={PROFILE_BIO_MAX_LENGTH}
            {...register("bio")}
            error={errors.bio?.message}
          />
        </div>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
