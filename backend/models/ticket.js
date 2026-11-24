export const TICKET_STATUSES = ['Abierto', 'En curso', 'Resuelto'];

export function makeTicket({ title, description, assigneeId = 'sin-asignar' }) {
  return {
    id: `T-${Date.now().toString(36).toUpperCase()}`,
    title: title.trim(),
    description: description.trim(),
    status: 'Abierto',
    assigneeId,
    createdAt: new Date().toISOString(),
  };
}
