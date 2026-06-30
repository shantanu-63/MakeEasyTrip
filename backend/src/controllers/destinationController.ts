import { Request, Response } from "express";
import { DestinationService } from "../services/destination.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";

export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.getAll(req);
  return sendSuccess(res, result);
});

export const getDestination = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.getById(req.params.id);
  return sendSuccess(res, result);
});

export const createDestination = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.create(req.body);
  return sendSuccess(res, result, "Destination created", 201);
});

export const updateDestination = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.update(req.params.id, req.body);
  return sendSuccess(res, result, "Destination updated");
});

export const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
  const result = await DestinationService.delete(req.params.id);
  return sendSuccess(res, result);
});
