import { Request, Response } from "express";
import { SupportService } from "../services/support.service";
import { asyncHandler } from "../lib/asyncHandler";
import { sendSuccess } from "../lib/response";
import { AuthenticatedRequest } from "../middleware/auth";

export const createTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SupportService.createTicket(req.user!.id, req.body);
  return sendSuccess(res, result, "Ticket created", 201);
});

export const getMyTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SupportService.getUserTickets(req.user!.id, req);
  return sendSuccess(res, result);
});

export const getTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SupportService.getTicketWithMessages(req.params.id, req.user!.id);
  return sendSuccess(res, result);
});

export const addMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SupportService.addMessage(req.params.ticketId, req.user!.id, req.user!.role, req.body.text);
  return sendSuccess(res, result, "Message sent", 201);
});

export const adminGetTickets = asyncHandler(async (req: Request, res: Response) => {
  const result = await SupportService.adminGetAll(req);
  return sendSuccess(res, result);
});

export const adminUpdateTicket = asyncHandler(async (req: Request, res: Response) => {
  const result = await SupportService.adminUpdateTicket(req.params.id, req.body);
  return sendSuccess(res, result, "Ticket updated");
});
