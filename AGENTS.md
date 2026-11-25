# Instrucciones del proyecto

## Equipo de subagentes

Usá la cadena completa solo cuando el pedido combine entender un módulo, revisar sus riesgos y documentar lo que falte. Para pedidos que soliciten solo una de esas tareas, atendé únicamente esa tarea.

Cuando corresponda la cadena completa, coordiná los subagentes de forma secuencial:

1. Llamá a `explicador` con el módulo y el alcance pedido. Pedile un recorrido del flujo, en orden, con archivos y funciones concretos; debe limitarse a diez pasos y no editar archivos.
2. Pasale al subagente `revisor_qa` el mismo alcance y el resultado del explicador. Si el alcance es el backend de tickets, pedile que lea y aplique la Skill `revisor-qa`. El revisor no debe editar archivos.
3. Pasale a `documentador` el mapa del explicador y los hallazgos del revisor. Debe comprobarlos contra el código y la documentación existente, y escribir solo lo que falte o esté desactualizado.
4. Reuní los resultados, indicá qué archivos de documentación se modificaron y confirmá que no hubo cambios en código de la aplicación.

Los subagentes no comparten automáticamente sus contextos entre sí. El agente principal debe incluir explícitamente el resultado anterior en cada delegación. No presentes un hallazgo como comportamiento documentado si el código no lo confirma; distinguí hechos, riesgos y cuestiones pendientes.

La instrucción de no escribir del explicador y el revisor es de comportamiento, no un permiso técnico separado. Los subagentes heredan el sandbox y la política de aprobación del chat principal. Para que el documentador pueda editar documentación, elegí conscientemente un modo que permita esas escrituras; el código de la aplicación debe quedar fuera del alcance.

La guía y un prompt natural de ejemplo están en [`docs/equipo-subagentes-codex.md`](docs/equipo-subagentes-codex.md).
