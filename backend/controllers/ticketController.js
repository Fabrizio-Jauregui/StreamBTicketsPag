import * as service from '../services/ticketService.js';

export async function list(_req, res, next) {
  try { res.json(await service.listTickets()); } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createTicket(req.body)); } catch (error) { next(error); }
}

export async function setStatus(req, res, next) {
  try { res.json(await service.changeStatus(req.params.id, req.body.status)); } catch (error) { next(error); }
}

export async function setAssignee(req, res, next) {
  try { res.json(await service.assignTicket(req.params.id, req.body.assigneeId)); } catch (error) { next(error); }
}

export async function suggest(req, res, next) {
  try { res.json(await service.suggestReply(req.params.id)); } catch (error) { next(error); }
}
