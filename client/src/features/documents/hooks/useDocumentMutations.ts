import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  ApiErrorShape,
} from "@/lib/axios";

import {
  archiveDocumentRequest,
  createDocumentRequest,
  renameDocumentRequest,
  restoreDocumentRequest,
} from "../api/document.api";

import {
  documentQueryKeys,
} from "../document.queryKeys";

import type {
  CreateDocumentPayload,
  ProjectDocument,
  RenameDocumentPayload,
} from "../types/document.types";

function invalidateProjectDocuments(
  queryClient: ReturnType<
    typeof useQueryClient
  >,
  projectId: string
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey:
      documentQueryKeys.project(
        projectId
      ),
  });
}

export function useCreateDocumentMutation(
  projectId: string
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    ProjectDocument,
    ApiErrorShape,
    CreateDocumentPayload
  >({
    mutationFn:
      (
        payload
      ) =>
        createDocumentRequest(
          projectId,
          payload
        ),

    onSettled:
      async () => {
        await invalidateProjectDocuments(
          queryClient,
          projectId
        );
      },
  });
}

interface RenameDocumentVariables {
  documentId: string;
  payload: RenameDocumentPayload;
}

export function useRenameDocumentMutation(
  projectId: string
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    ProjectDocument,
    ApiErrorShape,
    RenameDocumentVariables
  >({
    mutationFn:
      ({
        documentId,
        payload,
      }) =>
        renameDocumentRequest(
          documentId,
          payload
        ),

    onSettled:
      async () => {
        await invalidateProjectDocuments(
          queryClient,
          projectId
        );
      },
  });
}

export function useArchiveDocumentMutation(
  projectId: string
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    ProjectDocument,
    ApiErrorShape,
    string
  >({
    mutationFn:
      (
        documentId
      ) =>
        archiveDocumentRequest(
          documentId
        ),

    onSettled:
      async () => {
        await invalidateProjectDocuments(
          queryClient,
          projectId
        );
      },
  });
}

export function useRestoreDocumentMutation(
  projectId: string
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    ProjectDocument,
    ApiErrorShape,
    string
  >({
    mutationFn:
      (
        documentId
      ) =>
        restoreDocumentRequest(
          documentId
        ),

    onSettled:
      async () => {
        await invalidateProjectDocuments(
          queryClient,
          projectId
        );
      },
  });
}
