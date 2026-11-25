# Equipo de subagentes de Codex

Este proyecto define tres subagentes locales en `.codex/agents/`: `explicador`, `revisor_qa` y `documentador`. Codex los configura con archivos TOML. El revisor conserva el checklist detallado en `.agents/skills/revisor-qa/SKILL.md`.

## Qué hace cada uno

- **Explicador:** recorre el flujo real de un módulo en hasta diez pasos, con archivos y funciones. Solo lee y explica.
- **Revisor QA:** busca riesgos concretos de robustez y seguridad en el backend. Usa la Skill existente y devuelve evidencia, escenarios y consecuencias. No edita.
- **Documentador:** compara el código con `README.md` y los Markdown de `docs/`; actualiza solo la documentación que falte o esté desactualizada. No cambia código.

## Cómo se encadenan

Para un pedido que solicite entender un módulo, revisar sus riesgos y documentar lo que falte, las instrucciones de `AGENTS.md` piden al agente principal que:

1. Llame al explicador y obtenga el mapa del flujo.
2. Pase ese mapa y el mismo alcance al revisor QA.
3. Pase al documentador el mapa y los hallazgos para que confirme los datos en el código y contraste la documentación.
4. Resuma el resultado e informe los archivos de documentación tocados.

Los subagentes no se pasan mensajes entre sí: el agente principal copia el contexto y el resultado pertinente en cada delegación. Un pedido que solicite solo explicar o solo revisar no debe activar la cadena completa.

## Prompt natural de prueba

> Voy a tocar el módulo de tickets por primera vez. Explicame el recorrido de ejecución, revisá los riesgos del backend y actualizá la documentación técnica solo donde falte información. Al final resumí qué encontraste y qué archivos documentales cambiaste.

El prompt no nombra subagentes; la regla del proyecto guía al agente principal para elegirlos y llamarlos en orden.

## Permisos

Los subagentes heredan el sandbox y la política de aprobación del chat principal. No existe una configuración de permisos distinta por cada archivo TOML: las reglas de no escribir del explicador y del revisor son instrucciones de comportamiento, no una protección técnica.

Como el documentador necesita poder actualizar README o `docs/`, la sesión debe permitir esas escrituras. El código de aplicación queda fuera del alcance declarado del documentador, pero el permiso técnico del sandbox es compartido. Revisá el diff al terminar. Para un análisis con garantía técnica de solo lectura, ejecutá explicación y revisión en una sesión `read-only` separada y documentá después en otra sesión autorizada para escribir.

## Resultado esperado

El agente principal debe presentar el mapa del módulo, los hallazgos respaldados por el código, las actualizaciones documentales realizadas (o indicar que no eran necesarias) y declarar si cambió algún archivo fuera de documentación.
