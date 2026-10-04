# Cómo contribuir

Gracias por querer mejorar la skill. Para que el criterio siga siendo confiable:

1. **Cada regla lleva su fuente.** Las referencias marcan el origen de cada número entre corchetes: oficial,
   estudio, creador o `[casa]` (aprendido editando). Una regla nueva sin fuente entra como `[casa]` y con el
   caso que la motivó.
2. **Audio solo CC0.** Un sonido nuevo entra con su página, el archivo original y el texto de la licencia en
   `biblioteca/LICENCIAS.md`, y con su entrada en `catalogo.json` (duración, LUFS y uso sugerido). Nada con
   licencia dudosa.
3. **SKILL.md bajo 500 líneas.** El detalle va en `referencias/`, a un nivel de profundidad desde SKILL.md, y
   los archivos de más de 100 líneas llevan índice.
4. **Valida antes del PR:**

   ```bash
   npx skills-ref validate ./skills/edicion-de-video
   ```

5. **Si cambias el criterio, agrega o ajusta un caso en `evals/evals.json`** con lo que debería responder el
   agente.

Los issues con un video de ejemplo (qué se ve mal y en qué segundo) son los más útiles.
