import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import {
  archiveDocumentRequest,
  createDocumentRequest,
  renameDocumentRequest,
  restoreDocumentRequest,
  updateDocumentRequest,
} from "../api/document.api";
import { invalidateProjectDocuments, moveDocumentBetweenCaches, writeDocumentToCaches } from "../document.cache";
import type {
  CreateDocumentPayload,
  ProjectDocument,
  RenameDocumentPayload,
  UpdateDocumentPayload,
} from "../types/document.types";

export function useCreateDocumentMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDocument, ApiErrorShape, CreateDocumentPayload>({
    mutationFn: (payload) => createDocumentRequest(projectId, payload),

    onSuccess: (document) => {
      writeDocumentToCaches(queryClient, projectId, document);
    },

    onSettled: async () => {
      await invalidateProjectDocuments(queryClient, projectId);
    },
  });
}

interface RenameDocumentVariables {
  documentId: string;
  payload: RenameDocumentPayload;
}

export function useRenameDocumentMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDocument, ApiErrorShape, RenameDocumentVariables>({
    mutationFn: ({ documentId, payload }) => renameDocumentRequest(documentId, payload),

    onSuccess: (document) => {
      writeDocumentToCaches(queryClient, projectId, document);
    },

    onSettled: async () => {
      await invalidateProjectDocuments(queryClient, projectId);
    },
  });
}

interface UpdateDocumentVariables {
  documentId: string;
  payload: UpdateDocumentPayload;
}

/**
 * The single save mutation used by the Document Editor (spec section 23).
 * A 409 revision conflict rejects with `ApiErrorShape.status === 409` and
 * the exact server message — the editor page distinguishes that case to
 * drive the conflict dialog instead of a generic error toast.
 */
export function useUpdateDocumentMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDocument, ApiErrorShape, UpdateDocumentVariables>({
    mutationFn: ({ documentId, payload }) => updateDocumentRequest(documentId, payload),

    onSuccess: (document) => {
      writeDocumentToCaches(queryClient, projectId, document);
    },

    onSettled: async () => {
      await invalidateProjectDocuments(queryClient, projectId);
    },
  });
}

export function useArchiveDocumentMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDocument, ApiErrorShape, string>({
    mutationFn: (documentId) => archiveDocumentRequest(documentId),

    onSuccess: (document) => {
      moveDocumentBetweenCaches(queryClient, projectId, document);
    },

    onSettled: async () => {
      await invalidateProjectDocuments(queryClient, projectId);
    },
  });
}

export function useRestoreDocumentMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDocument, ApiErrorShape, string>({
    mutationFn: (documentId) => restoreDocumentRequest(documentId),

    onSuccess: (document) => {
      moveDocumentBetweenCaches(queryClient, projectId, document);
    },

    onSettled: async () => {
      await invalidateProjectDocuments(queryClient, projectId);
    },
  });
}
