import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { documentQueryKeys } from "./document.queryKeys";
import type {
  ProjectDocument,
  ProjectDocumentListResult,
} from "./types/document.types";

type InfiniteDocuments = InfiniteData<
  ProjectDocumentListResult,
  string | undefined
>;

function replaceInPages(
  pages: ProjectDocumentListResult[],
  document: ProjectDocument,
): ProjectDocumentListResult[] {
  return pages.map((page) => ({
    ...page,
    documents: page.documents.map((candidate) =>
      candidate._id === document._id ? document : candidate,
    ),
  }));
}

function removeFromPages(
  pages: ProjectDocumentListResult[],
  documentId: string,
): ProjectDocumentListResult[] {
  return pages.map((page) => ({
    ...page,
    documents: page.documents.filter(
      (candidate) => candidate._id !== documentId,
    ),
  }));
}

function prependToFirstPage(
  pages: ProjectDocumentListResult[],
  document: ProjectDocument,
): ProjectDocumentListResult[] {
  if (pages.length === 0) return pages;

  return pages.map((page, index) => {
    if (index !== 0) return page;

    return {
      ...page,
      documents: [
        document,
        ...page.documents.filter((candidate) => candidate._id !== document._id),
      ],
    };
  });
}

export function writeDocumentToCaches(
  queryClient: QueryClient,
  projectId: string,
  document: ProjectDocument,
): void {
  queryClient.setQueryData(
    documentQueryKeys.detail(projectId, document._id),
    document,
  );

  queryClient.setQueriesData<InfiniteDocuments>(
    { queryKey: documentQueryKeys.infinite(projectId) },
    (data) => {
      if (!data) return data;
      return { ...data, pages: replaceInPages(data.pages, document) };
    },
  );

  queryClient.setQueriesData<ProjectDocumentListResult>(
    { queryKey: [...documentQueryKeys.project(projectId), "list"] },
    (data) => {
      if (!data) return data;
      return replaceInPages([data], document)[0];
    },
  );
}

export function moveDocumentBetweenCaches(
  queryClient: QueryClient,
  projectId: string,
  document: ProjectDocument,
): void {
  queryClient.setQueryData(
    documentQueryKeys.detail(projectId, document._id),
    document,
  );

  queryClient.setQueriesData<InfiniteDocuments>(
    { queryKey: documentQueryKeys.infinite(projectId) },
    (data) => {
      if (!data) return data;
      return { ...data, pages: removeFromPages(data.pages, document._id) };
    },
  );

  queryClient.setQueryData<InfiniteDocuments>(
    documentQueryKeys.infiniteList(projectId, document.isArchived, ""),
    (data) => {
      if (!data) return data;
      return { ...data, pages: prependToFirstPage(data.pages, document) };
    },
  );

  queryClient.setQueriesData<ProjectDocumentListResult>(
    { queryKey: [...documentQueryKeys.project(projectId), "list"] },
    (data) => {
      if (!data) return data;
      return {
        ...data,
        documents: data.documents.filter(
          (candidate) => candidate._id !== document._id,
        ),
      };
    },
  );

  if (!document.isArchived) {
    queryClient.setQueryData<ProjectDocumentListResult>(
      documentQueryKeys.projectList(projectId, ""),
      (data) => {
        if (!data) return data;
        return {
          ...data,
          documents: [
            document,
            ...data.documents.filter(
              (candidate) => candidate._id !== document._id,
            ),
          ],
        };
      },
    );
  }
}

export function invalidateProjectDocuments(
  queryClient: QueryClient,
  projectId: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: documentQueryKeys.project(projectId),
  });
}
