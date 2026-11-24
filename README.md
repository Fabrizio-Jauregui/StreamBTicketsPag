# Mesa Clara — soporte simple

Aplicación didáctica de tickets con React, Express y persistencia local en JSON.

## Ejecutar

1. Instalar Node.js 20 o superior.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev` (compila React y levanta el servidor).
4. Abrir `http://127.0.0.1:3001`.

La interfaz compilada y la API se sirven desde Express en el puerto 3001.

## Arquitectura

- `src/`: interfaz React y cliente HTTP.
- `backend/controllers/`: reciben solicitudes HTTP y devuelven respuestas.
- `backend/services/`: validaciones y reglas del soporte.
- `backend/models/`: estructura y estados permitidos de un ticket.
- `backend/repositories/`: lectura y escritura del archivo JSON.
- `backend/data/tickets.json`: datos guardados localmente.

La sugerencia de respuesta está simulada con una plantilla. No llama a un modelo de IA; se presenta así para probar el flujo sin credenciales externas.

## API

- `GET /api/tickets`: listar tickets.
- `POST /api/tickets`: crear un ticket.
- `PATCH /api/tickets/:id/status`: cambiar el estado.
- `PATCH /api/tickets/:id/assignee`: asignar una persona.
- `POST /api/tickets/:id/suggested-reply`: obtener una sugerencia de demostración.
- `GET /api/users`: listar las personas disponibles.
- `GET /api/health`: comprobar que la API está activa.
