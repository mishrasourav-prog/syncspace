import type { NextFunction, Request, Response } from "express";

import ApiResponse from "../../utils/ApiResponse";

import documentService from "./document.service";

import {
  createProjectDocumentBodySchema,
  documentIdParamSchema,
  getProjectDocumentsQuerySchema,
  projectIdParamSchema,
  updateProjectDocumentBodySchema,
} from "./document.validation";

class DocumentController {
  async createDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);

      const data = createProjectDocumentBodySchema.parse(req.body);

      const document = await documentService.createDocument(
        projectId,
        req.user!._id,
        data,
      );

      return res
        .status(201)
        .json(new ApiResponse(201, "Document created successfully.", document));
    } catch (error) {
      return next(error);
    }
  }

  async getProjectDocuments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);

      const query = getProjectDocumentsQuerySchema.parse(req.query);

      const documents = await documentService.getProjectDocuments(
        projectId,
        req.user!._id,
        query,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Documents retrieved successfully.", documents),
        );
    } catch (error) {
      return next(error);
    }
  }

  async getDocumentById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { documentId } = documentIdParamSchema.parse(req.params);

      const document = await documentService.getDocumentById(
        documentId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Document retrieved successfully.", document),
        );
    } catch (error) {
      return next(error);
    }
  }

  async updateDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { documentId } = documentIdParamSchema.parse(req.params);

      const data = updateProjectDocumentBodySchema.parse(req.body);

      const document = await documentService.updateDocument(
        documentId,
        req.user!._id,
        data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Document updated successfully.", document));
    } catch (error) {
      return next(error);
    }
  }

  async archiveDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { documentId } = documentIdParamSchema.parse(req.params);

      const document = await documentService.archiveDocument(
        documentId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Document archived successfully.", document),
        );
    } catch (error) {
      return next(error);
    }
  }

  async restoreDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { documentId } = documentIdParamSchema.parse(req.params);

      const document = await documentService.restoreDocument(
        documentId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Document restored successfully.", document),
        );
    } catch (error) {
      return next(error);
    }
  }
}

const documentController = new DocumentController();

export default documentController;
