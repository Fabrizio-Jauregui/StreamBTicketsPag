# Clase 17 — Mejora del revisor QA

## Objetivo y alcance

Se afinó la Skill de Codex `revisor-qa` sin cambiar el backend. La comparación usa la revisión de referencia compartida por el usuario y una revisión posterior del mismo backend, con `backend/repositories/ticketRepository.js` como foco y sus rutas, servicio, modelo y configuración como contexto. El código revisado no cambió entre ambas revisiones.

La referencia indicó que no podía confirmar la carga automática de una Skill y que no ejecutó pruebas. La revisión posterior siguió explícitamente la versión actual de `SKILL.md`; esto compara el comportamiento de revisión, pero no demuestra invocación automática en ambos casos.

## Cambios realizados en la Skill

Se hicieron tres cambios focalizados en `.agents/skills/revisor-qa/SKILL.md`:

1. **Distinguir archivo ausente de otros errores de lectura.** Se agregó la comprobación de `ENOENT` y la evaluación explícita de si un fallback puede reemplazar datos. Mejora el análisis de `ensureFile()`, que captura cualquier error y escribe una lista vacía.
2. **Separar evidencia estática de escenarios inferidos.** Se indicó que, si no se ejecutó una prueba, el informe debe decirlo y no describir el escenario como reproducido. Mejora la precisión cuando se analiza una posible interrupción de escritura.
3. **Tratar la exposición hipotética como condición pendiente.** Si el acceso externo depende de un proxy o despliegue no observado, no presentarlo como vulnerabilidad actual. Mejora la valoración de la API, que escucha en `127.0.0.1` y cuyo proxy no fue inspeccionado.

Se conservaron las instrucciones de no modificar código, el límite de cinco hallazgos y la advertencia de que la Skill no configura permisos técnicos. No se añadió `readonly: true`: ese campo pertenece al formato de agente de Cursor, no al frontmatter de una Skill de Codex.

## Evidencia antes del cambio

La revisión de referencia del backend informó estos riesgos:

- `ensureFile()` podía reemplazar los tickets al tratar cualquier error de lectura como si faltara el archivo.
- Las operaciones concurrentes podían sobrescribir cambios; también señaló que una escritura interrumpida podía dejar JSON incompleto.
- Faltaban validaciones de tipo y longitud para título y descripción.
- Los IDs basados en `Date.now()` podían repetirse.
- Informó falta de autenticación como hallazgo medio, aunque dejó claro que el acceso externo dependía de un proxy no observado y que el servidor escucha en `127.0.0.1`.

No se ejecutaron pruebas dinámicas. La referencia marcó la invocación automática de la Skill como no verificada.

## Evidencia después del cambio

Aplicando la Skill actual al mismo backend, la revisión estática conserva los hallazgos sustentados por el código:

1. **Alto — posible reemplazo de tickets ante un error de lectura.** `backend/repositories/ticketRepository.js:8-14` captura cualquier error de `readFile` y escribe `[]`. Si falla la lectura de un archivo existente por una causa distinta de `ENOENT` y la escritura sí puede completarse, los tickets pueden reemplazarse. El escenario no se ejecutó.
2. **Medio — actualizaciones concurrentes pueden perder cambios.** `backend/services/ticketService.js:22-25, 29-35` lee la lista, modifica una copia y guarda la lista completa mediante el repositorio; dos solicitudes pueden partir del mismo estado.
3. **Medio — una escritura interrumpida puede dejar JSON inválido.** `backend/repositories/ticketRepository.js:22-24` escribe directamente el archivo y `findAll()` parsea el contenido sin recuperación (`:17-19`). No se interrumpió una escritura para probarlo.
4. **Medio — IDs duplicados pueden dirigir una actualización al primer ticket coincidente.** `backend/models/ticket.js:5` usa `Date.now()` y `backend/services/ticketService.js:29-35` busca con `findIndex`.
5. **Bajo — validación incompleta de título y descripción.** `backend/services/ticketService.js:14-17` llama a `.trim()` sin comprobar que los valores sean cadenas ni fija un límite de longitud por campo. Un número puede provocar un `TypeError` que `backend/server.js:15-16` responde como 500; textos extensos repetidos también hacen crecer el JSON. No se enviaron solicitudes de prueba ni se midió el crecimiento.

La ausencia de autenticación no se reportó como vulnerabilidad actual: el servidor limita la escucha a `127.0.0.1`. Un proxy o despliegue que exponga la API queda como condición no verificada, no como hallazgo confirmado.

## Estado de Git

- **Antes:** `main` seguía a `origin/main` y el árbol estaba limpio en `a6c54fd`.
- **Después:** `.agents/skills/revisor-qa/SKILL.md` está modificado y este informe aparece en `docs/`; los archivos del backend siguen intactos.
- Los cambios de esta actividad no se han cometido ni publicado.

## Comparación y comprobaciones

- El riesgo de fallback de archivo sigue siendo un hallazgo, ahora se especifica que `ENOENT` es distinto de otros fallos de lectura y se describe la condición que podría reemplazar datos.
- Las escrituras concurrentes y la interrupción de una escritura se describen por separado; no se afirmó que la corrupción se hubiera reproducido.
- La falta de autenticación pasó de hallazgo condicional a nota pendiente de verificar en el despliegue.
- Los riesgos de tipo de entrada e ID permanecen porque el código que los causa no cambió.
- No se modificó el backend ni se ejecutaron pruebas o builds. `git diff --check` no reportó problemas de formato en el cambio de la Skill.
- El perfil del chat durante estas comprobaciones no fue técnicamente `read-only`; no se hizo ninguna operación de escritura durante la revisión.
