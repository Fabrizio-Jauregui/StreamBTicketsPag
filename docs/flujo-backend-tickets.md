# Flujo del backend de tickets

Este documento describe el flujo implementado en `backend/` y los riesgos estáticos conocidos. La lista de endpoints también aparece en el README; aquí se explica cómo pasan las solicitudes por el servidor, el servicio y el repositorio.

## Recorrido de una solicitud

1. `backend/server.js` configura `express.json()`, monta las rutas de tickets bajo `/api/tickets` y registra un middleware final que responde errores como `{ "error": "..." }`, usando `error.status` o `500`.
2. `backend/routes/ticketRoutes.js` deriva las solicitudes a los controladores: `GET /`, `POST /`, `PATCH /:id/status`, `PATCH /:id/assignee` y `POST /:id/suggested-reply`.
3. En `backend/controllers/ticketController.js`, cada controlador llama al servicio correspondiente. La creación devuelve `201`; las demás operaciones devuelven el resultado como JSON. Los errores pasan al middleware final mediante `next(error)`.
4. `backend/services/ticketService.js` aplica las reglas. La creación requiere título y descripción no vacíos después de `trim()`, valida el asignatario y usa `sin-asignar` como valor predeterminado. Los cambios de estado se limitan a los estados definidos en el modelo; las asignaciones deben corresponder a una persona conocida.
5. Para crear o actualizar, el servicio lee la lista completa, modifica la lista en memoria y la entrega al repositorio para guardarla. El listado ordena los tickets por fecha de creación descendente. La sugerencia busca el ticket y devuelve texto de demostración; no modifica ni guarda el ticket.
6. `backend/repositories/ticketRepository.js` crea el directorio de datos si hace falta. Si no puede leer el archivo, intenta inicializarlo con `[]`; después `findAll()` analiza el JSON y `saveAll()` reescribe el archivo completo `backend/data/tickets.json`.
7. En el cliente, `src/api.js` analiza la respuesta JSON y lanza un error si el estado HTTP no es exitoso. `src/App.jsx` muestra el error; al crear correctamente, limpia el formulario y vuelve a cargar tickets y usuarios.

El servidor escucha en `127.0.0.1` por defecto. Esta configuración describe el acceso directo del proceso; no determina cómo podría quedar expuesta una instalación detrás de un proxy o en otro entorno de despliegue.

## Riesgos estáticos conocidos

Los puntos siguientes son escenarios inferidos del código; no se reproducen como comportamiento en cada solicitud y no se ejecutaron pruebas dinámicas para este documento.

- **Escrituras concurrentes:** creación y actualización hacen lectura, modificación y reescritura de la lista completa sin coordinación entre solicitudes. Dos operaciones solapadas podrían guardar copias basadas en el mismo estado y perder uno de los cambios.
- **Error de lectura al inicializar:** `ensureFile()` trata cualquier error de lectura como archivo ausente. Si un archivo existente no se puede leer por otra causa y sí se puede escribir, el fallback podría reemplazar su contenido por `[]`.
- **Colisión de IDs:** `makeTicket()` deriva el ID de `Date.now()`. Dos creaciones en el mismo milisegundo podrían recibir el mismo ID; `updateTicket()` actualiza la primera coincidencia.
- **Tipos de entrada:** la validación de título y descripción invoca `.trim()` sin comprobar primero que ambos valores sean cadenas. Un valor JSON de otro tipo podría producir `TypeError`, que el middleware responde como `500`. El límite de 90 caracteres del asunto está en la interfaz, no en esta validación del backend.

Estos puntos describen riesgos, no mitigaciones ya implementadas. La exposición externa depende de la configuración de despliegue, que no se inspecciona aquí.
