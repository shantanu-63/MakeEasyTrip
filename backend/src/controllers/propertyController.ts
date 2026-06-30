import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { createPropertySchema, updatePropertySchema } from "../validators/property.validator";

export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const result = await PropertyService.getAll(req);
  return sendSuccess(res, result);
});

export const getProperty = asyncHandler(async (req: Request, res: Response) => {
  const result = await PropertyService.getById(req.params.id);
  return sendSuccess(res, result);
});

export const getPartnerProperties = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner profile not found");
  const result = await PropertyService.getPartnerProperties(partner.id, req);
  return sendSuccess(res, result);
});

export const createProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createPropertySchema.parse(req.body);
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner profile not found. Please complete onboarding.");
  const result = await PropertyService.create(partner.id, data);
  return sendSuccess(res, result, "Property submitted for approval", 201);
});

export const updateProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = updatePropertySchema.parse(req.body);
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner profile not found");
  const result = await PropertyService.update(req.params.id, partner.id, data);
  return sendSuccess(res, result, "Property updated");
});

export const deleteProperty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prisma } = await import("../config/db");
  const partner = await prisma.partner.findUnique({ where: { userId: req.user!.id } });
  if (!partner) throw (await import("../lib/ApiError")).ApiError.notFound("Partner profile not found");
  const result = await PropertyService.delete(req.params.id, partner.id);
  return sendSuccess(res, result);
});
