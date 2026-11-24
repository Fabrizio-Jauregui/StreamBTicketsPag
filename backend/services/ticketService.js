import { makeTicket, TICKET_STATUSES } from '../models/ticket.js';
import * as repository from '../repositories/ticketRepository.js';

export const users = [
  { id: 'ana', name: 'Ana Torres' },
  { id: 'marcos', name: 'Marcos Díaz' },
  { id: 'sin-asignar', name: 'Sin asignar' },
];

export async function listTickets() {
  return (await repository.findAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(input) {
  input ||= {};
  if (!input.title?.trim() || !input.description?.trim()) {
    throw Object.assign(new Error('Completá el título y la descripción.'), { status: 400 });
  }
  if (!users.some((user) => user.id === (input.assigneeId || 'sin-asignar'))) {
    throw Object.assign(new Error('El usuario asignado no existe.'), { status: 400 });
  }
  const tickets = await repository.findAll();
  const ticket = makeTicket(input);
  tickets.push(ticket);
  await repository.saveAll(tickets);
  return ticket;
}

async function updateTicket(id, change) {
  const tickets = await repository.findAll();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index < 0) throw Object.assign(new Error('No se encontró el ticket.'), { status: 404 });
  tickets[index] = { ...tickets[index], ...change };
  await repository.saveAll(tickets);
  return tickets[index];
}

export async function changeStatus(id, status) {
  if (!TICKET_STATUSES.includes(status)) {
    throw Object.assign(new Error('El estado elegido no es válido.'), { status: 400 });
  }
  return updateTicket(id, { status });
}

export async function assignTicket(id, assigneeId) {
  if (!users.some((user) => user.id === assigneeId)) {
    throw Object.assign(new Error('El usuario asignado no existe.'), { status: 400 });
  }
  return updateTicket(id, { assigneeId });
}

export async function suggestReply(id) {
  const tickets = await repository.findAll();
  const ticket = tickets.find((item) => item.id === id);
  if (!ticket) throw Object.assign(new Error('No se encontró el ticket.'), { status: 404 });
  return {
    suggestion: `Hola, gracias por avisarnos sobre «${ticket.title}». Ya registramos tu consulta y vamos a revisar lo que ocurre. Si podés, compartinos cualquier detalle adicional que nos ayude a resolverlo.`,
    kind: 'demo',
  };
}
