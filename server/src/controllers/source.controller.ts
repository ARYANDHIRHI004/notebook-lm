import { Request, Response } from "express";
import { UnauthorizedError, ValidationError } from "../utils/api.error.js";
import { uploadPdfSource, listSourcesService, deleteSourceService } from "../services/source.service.js";

export async function uploadPdf(req: Request, res: Response) {
  const workspaceId = (req.params.workspaceId || req.body?.workspaceId || req.query?.workspaceId) as string;
  const userId = req.session?.user?.id;

  if (!workspaceId) {
    throw new ValidationError("Workspace ID is required");
  }

  if (!req.file) {
    throw new ValidationError("PDF file is required");
  }

  const title = typeof req.body?.title === "string" ? req.body.title : undefined;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const source = await uploadPdfSource(
    workspaceId as string,
    userId,
    req.file,
    title,
  );

  res.status(201).json(source);
}

export async function listSources(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId } = req.params;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");

  const sources = await listSourcesService(workspaceId as string, userId);
  res.status(200).json(sources);
}

export async function deleteSource(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, sourceId } = req.params;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!sourceId) throw new ValidationError("Source ID is required");

  const deleted = await deleteSourceService(sourceId as string, workspaceId as string, userId);
  res.status(200).json(deleted);
}
