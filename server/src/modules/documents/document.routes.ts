import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import documentController from "./document.controller";

const documentRouter = Router();

documentRouter.use(authenticateUser);

documentRouter.post(
  "/projects/:projectId/documents",
  documentController.createDocument.bind(documentController),
);

documentRouter.get(
  "/projects/:projectId/documents",
  documentController.getProjectDocuments.bind(documentController),
);

documentRouter.get(
  "/documents/:documentId",
  documentController.getDocumentById.bind(documentController),
);

documentRouter.patch(
  "/documents/:documentId",
  documentController.updateDocument.bind(documentController),
);

documentRouter.patch(
  "/documents/:documentId/archive",
  documentController.archiveDocument.bind(documentController),
);

documentRouter.patch(
  "/documents/:documentId/restore",
  documentController.restoreDocument.bind(documentController),
);

export default documentRouter;
