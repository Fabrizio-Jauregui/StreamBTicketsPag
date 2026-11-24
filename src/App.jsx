import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const statuses = ['Abierto', 'En curso', 'Resuelto'];

function TicketCard({ ticket, users, onStatus, onAssign, onSuggest }) {
  const [suggestion, setSuggestion] = useState('');
  const [busy, setBusy] = useState(false);
  const assignee = users.find((user) => user.id === ticket.assigneeId)?.name || 'Sin asignar';
  const created = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ticket.createdAt));

  async function requestSuggestion() {
    setBusy(true);
    try { setSuggestion((await onSuggest(ticket.id)).suggestion); }
    catch (issue) { onError(issue.message); }
    finally { setBusy(false); }
  }

  return <article className="ticket-card">
    <div className="ticket-topline"><span className="ticket-id">{ticket.id}</span><span className={`status status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></div>
    <h3>{ticket.title}</h3>
    <p className="ticket-description">{ticket.description}</p>
    <div className="ticket-meta"><span>Creado {created}</span><span>Asignado a {assignee}</span></div>
    <div className="ticket-controls">
      <label>Estado<select value={ticket.status} onChange={(event) => onStatus(ticket.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
      <label>Asignar<select value={ticket.assigneeId} onChange={(event) => onAssign(ticket.id, event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
    </div>
    <button className="suggest-button" onClick={requestSuggestion} disabled={busy}>{busy ? 'Preparando…' : '✦ Sugerir respuesta'}</button>
    {suggestion && <div className="suggestion"><strong>Sugerencia de demostración</strong><p>{suggestion}</p></div>}
  </article>;
}

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assigneeId: 'sin-asignar' });
  const [filter, setFilter] = useState('Todos');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [items, people] = await Promise.all([api.tickets(), api.users()]);
    setTickets(items);
    setUsers(people);
  }

  useEffect(() => {
    refresh().catch((issue) => setError(issue.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => filter === 'Todos' ? tickets : tickets.filter((ticket) => ticket.status === filter), [tickets, filter]);
  const openCount = tickets.filter((ticket) => ticket.status !== 'Resuelto').length;

  async function run(action) {
    setError('');
    try { await action(); await refresh(); }
    catch (issue) { setError(issue.message); }
  }

  async function submit(event) {
    event.preventDefault();
    await run(async () => {
      await api.create(form);
      setForm({ title: '', description: '', assigneeId: 'sin-asignar' });
    });
  }

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="#inicio"><span className="brand-mark">M</span><span>Mesa Clara<small>Soporte simple</small></span></a><span className="topbar-note"><span className="online-dot" /> Panel de tickets</span></header>
    <section className="welcome" id="inicio"><div><p className="eyebrow">CENTRO DE SOPORTE</p><h1>Hola, equipo <span>👋</span></h1><p>Un lugar simple para organizar las consultas y darles seguimiento.</p></div><div className="summary-card"><span>Tickets activos</span><strong>{openCount.toString().padStart(2, '0')}</strong><small>pendientes de resolución</small></div></section>
    <section className="workspace">
      <div className="form-panel"><div className="section-heading"><div><p className="eyebrow">NUEVA SOLICITUD</p><h2>Crear ticket</h2></div><span className="heading-icon">＋</span></div>
        <form onSubmit={submit}>
          <label htmlFor="title">Asunto</label><input id="title" maxLength="90" placeholder="Ej. No puedo acceder a mi cuenta" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label htmlFor="description">¿Qué está pasando?</label><textarea id="description" rows="4" placeholder="Contanos un poco más para poder ayudarte…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <label htmlFor="assignee">Asignar a</label><select id="assignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="primary-button" type="submit">Crear ticket <span>→</span></button>
        </form>
        <p className="form-hint">Los campos de asunto y descripción son obligatorios.</p>
      </div>
      <div className="list-panel"><div className="section-heading list-heading"><div><p className="eyebrow">SEGUIMIENTO</p><h2>Tickets <span className="count-pill">{tickets.length}</span></h2></div><select aria-label="Filtrar tickets" className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>{['Todos', ...statuses].map((status) => <option key={status}>{status}</option>)}</select></div>
        {loading ? <div className="empty-state">Cargando tickets…</div> : filtered.length ? <div className="ticket-list">{filtered.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} users={users} onError={setError} onStatus={(id, status) => run(() => api.status(id, status))} onAssign={(id, assignee) => run(() => api.assign(id, assignee))} onSuggest={api.suggest} />)}</div> : <div className="empty-state"><span>✦</span><strong>{tickets.length ? 'No hay tickets en este estado' : 'Todavía no hay tickets'}</strong><p>{tickets.length ? 'Probá con otro filtro para ver más resultados.' : 'Cuando crees una solicitud, aparecerá acá.'}</p></div>}
      </div>
    </section>
    <footer>Una mesa de ayuda chiquita, clara y en movimiento.<span>Proyecto de práctica · IA como asistente</span></footer>
  </main>;
}
