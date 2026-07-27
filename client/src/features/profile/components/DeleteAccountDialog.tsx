import {
  useMemo,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  AlertTriangle,
} from "lucide-react";
import {
  useForm,
} from "react-hook-form";

import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Input,
} from "@/components/ui/input";
import {
  FormField,
} from "@/components/ui/label";
import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  useDeleteAccountMutation,
} from "../hooks/useProfileMutations";
import {
  useDeletionReadinessQuery,
} from "../hooks/useProfileQueries";
import {
  createDeleteAccountFormSchema,
  type DeleteAccountFormValues,
  toDeleteAccountPayload,
} from "../schemas/profile.schemas";
import type {
  SelfProfile,
} from "../types/profile.types";

import {
  DeletionReadinessBlockers,
} from "./DeletionReadinessBlockers";
import {
  ProfileErrorState,
} from "./ProfileErrorState";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  profile: SelfProfile;
}

const EMPTY_VALUES:
  DeleteAccountFormValues = {
    confirmation:
      "",
    username:
      "",
    currentPassword:
      "",
  };

export function DeleteAccountDialog({
  open,
  onClose,
  profile,
}: DeleteAccountDialogProps) {
  const requireCurrentPassword =
    profile.canChangePassword;

  const readinessQuery =
    useDeletionReadinessQuery(
      open
    );

  const deleteAccountMutation =
    useDeleteAccountMutation();

  const schema =
    useMemo(
      () =>
        createDeleteAccountFormSchema(
          profile.username,
          requireCurrentPassword
        ),
      [
        profile.username,
        requireCurrentPassword,
      ]
    );

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setFocus,
    formState: {
      errors,
    },
  } = useForm<DeleteAccountFormValues>({
    resolver:
      zodResolver(
        schema
      ),

    defaultValues:
      EMPTY_VALUES,
  });


  const handleClose =
    (): void => {
      if (
        deleteAccountMutation.isPending
      ) {
        return;
      }

      reset(
        EMPTY_VALUES
      );

      deleteAccountMutation.reset();

      onClose();
    };

  const onSubmit =
    (
      values:
        DeleteAccountFormValues
    ): void => {
      if (
        deleteAccountMutation.isPending ||
        readinessQuery.data
          ?.canDelete !==
        true
      ) {
        return;
      }

      deleteAccountMutation.reset();

      deleteAccountMutation.mutate(
        toDeleteAccountPayload(
          values,
          requireCurrentPassword
        ),
        {
          onError:
            (
              error
            ) => {
              if (
                error.status ===
                  401 &&
                requireCurrentPassword
              ) {
                resetField(
                  "currentPassword",
                  {
                    defaultValue:
                      "",
                  }
                );

                setFocus(
                  "currentPassword"
                );
              }

              if (
                error.status ===
                409
              ) {
                void readinessQuery.refetch();
              }
            },
        }
      );
    };

  const readinessErrorMessage =
    readinessQuery.error
      ?.message ??
    "Unable to check whether this account can be deleted.";

  const mutationErrorMessage =
    deleteAccountMutation.error
      ?.message ??
    "Unable to delete the account. Please try again.";

  const isBlocked =
    readinessQuery.isSuccess &&
    readinessQuery.data
      .canDelete ===
      false;

  return (
    <Dialog
      className="max-w-2xl"
      description="Review the consequences and complete every required confirmation before permanently deleting your account."
      disableOutsideClose
      onClose={handleClose}
      open={open}
      title="Delete Account"
    >
      {readinessQuery.isPending ? (
        <div
          aria-label="Checking account-deletion readiness"
          className="space-y-4"
          role="status"
        >
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />

          <DialogFooter>
            <Button
              onClick={handleClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      ) : null}

      {readinessQuery.isError ? (
        <div className="space-y-4">
          <ProfileErrorState
            compact
            message={readinessErrorMessage}
            onRetry={() => {
              void readinessQuery.refetch();
            }}
            title="Unable to check deletion readiness"
          />

          <DialogFooter>
            <Button
              onClick={handleClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      ) : null}

      {isBlocked &&
      readinessQuery.data ? (
        <div className="space-y-4">
          <DeletionReadinessBlockers
            blockers={
              readinessQuery.data
                .blockers
            }
          />

          <DialogFooter>
            <Button
              onClick={handleClose}
              type="button"
              variant="secondary"
            >
              Close
            </Button>

            <Button
              onClick={() => {
                void readinessQuery.refetch();
              }}
              type="button"
              variant="primary"
            >
              Check again
            </Button>
          </DialogFooter>
        </div>
      ) : null}

      {readinessQuery.isSuccess &&
      readinessQuery.data
        .canDelete ? (
        <form
          noValidate
          onSubmit={
            handleSubmit(
              onSubmit
            )
          }
        >
          <div className="mb-5 rounded-lg border border-danger/30 bg-danger/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-danger"
              />

              <div>
                <p className="text-sm font-semibold text-foreground">
                  This action cannot be undone
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted">
                  <li>
                    Your workspace and project memberships will be removed.
                  </li>
                  <li>
                    Your current task assignments and private operational records will be removed.
                  </li>
                  <li>
                    Your personal account identity will be anonymized.
                  </li>
                  <li>
                    Historical content you authored remains available under “Deleted user” so shared records stay intact.
                  </li>
                  <li>
                    Every active session will be revoked immediately.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <FormField
            htmlFor="delete-username"
            label={`Type your username (${profile.username}) to confirm`}
          >
            <Input
              autoComplete="off"
              disabled={
                deleteAccountMutation
                  .isPending
              }
              error={
                errors.username
                  ?.message
              }
              id="delete-username"
              {...register(
                "username"
              )}
            />
          </FormField>

          <FormField
            htmlFor="delete-confirmation"
            label='Type "DELETE" exactly to confirm'
          >
            <Input
              autoCapitalize="characters"
              autoComplete="off"
              disabled={
                deleteAccountMutation
                  .isPending
              }
              error={
                errors.confirmation
                  ?.message
              }
              id="delete-confirmation"
              {...register(
                "confirmation"
              )}
            />
          </FormField>

          {requireCurrentPassword ? (
            <FormField
              htmlFor="delete-password"
              label="Current Password"
            >
              <Input
                autoComplete="current-password"
                disabled={
                  deleteAccountMutation
                    .isPending
                }
                error={
                  errors.currentPassword
                    ?.message
                }
                id="delete-password"
                type="password"
                {...register(
                  "currentPassword"
                )}
              />
            </FormField>
          ) : null}

          {deleteAccountMutation.isError ? (
            <p
              className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {mutationErrorMessage}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              disabled={
                deleteAccountMutation
                  .isPending
              }
              onClick={handleClose}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>

            <Button
              disabled={
                deleteAccountMutation
                  .isPending
              }
              type="submit"
              variant="danger"
            >
              {deleteAccountMutation
                .isPending
                ? "Deleting…"
                : "Permanently Delete Account"}
            </Button>
          </DialogFooter>
        </form>
      ) : null}
    </Dialog>
  );
}
