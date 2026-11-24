async function request(path, options) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
  return data;
}

export const api = {
  tickets: () => request('/tickets'),
  users: () => request('/users'),
  create: (body) => request('/tickets', { method: 'POST', body: JSON.stringify(body) }),
  status: (id, status) => request(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assign: (id, assigneeId) => request(`/tickets/${id}/assignee`, { method: 'PATCH', body: JSON.stringify({ assigneeId }) }),
  suggest: (id) => request(`/tickets/${id}/suggested-reply`, { method: 'POST' }),
};
