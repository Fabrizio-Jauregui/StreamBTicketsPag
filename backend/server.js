import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ticketRoutes from './routes/ticketRoutes.js';
import { users } from './services/ticketService.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const here = dirname(fileURLToPath(import.meta.url));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/users', (_req, res) => res.json(users));
app.use('/api/tickets', ticketRoutes);
app.use(express.static(resolve(here, '../dist')));
app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ error: error.message || 'Error interno.' });
});
app.get('*path', (_req, res) => res.sendFile(resolve(here, '../dist/index.html')));
app.listen(port, '127.0.0.1', () => console.log(`API disponible en http://127.0.0.1:${port}`));
