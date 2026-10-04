# Miniatura, título y descripción

**Oficial** = YouTube Help. **Creador** = práctica difundida sin datos públicos de YouTube. Fuentes al final.

## Miniatura

**Especificación (oficial)** **[YT-miniaturas]**:

- videos en 16:9, hasta 3840×2160 y ancho mínimo de 640 px; Shorts en 9:16;
- JPG o PNG;
- hasta 2 MB si se sube desde el teléfono y 50 MB desde el computador;
- la cuenta tiene que estar verificada.

Recomendación práctica: exportar a **1920×1080 JPG bajo 2 MB**, que sirve en los dos caminos.

**Prácticas:**

1. **Lo prometido se ve en el video.** La miniatura y el título deben reflejar lo que muestran los primeros
   30 s. Es lo primero que YouTube recomienda para la intro **[YT-momentos]**.
   - Una miniatura engañosa viola las políticas de spam y prácticas engañosas **[YT-spam]**.
2. **Pocas palabras: 1–5, idealmente 3–4**, en sans-serif gruesa, legibles a ~180 px de ancho **[Snappa,
   creador]**. No repetir el título: complementarlo.
3. **Un sujeto dominante y alto contraste**; máximo 2–3 elementos **[GrowthOS, creador]**.
   - Para un tutorial de software, el sujeto suele ser el resultado (el informe, el total, el «listo»),
     ampliado y recortado.
   - Una cara con expresión clara suele subir el CTR **[Snappa, creador]**, pero no tiene cifra oficial.
4. **Esquina inferior derecha libre**: ahí va la duración del video **[Pixelbatch, creador]**.
5. **Piel de marca consistente** entre videos de una serie (misma tipografía y acento). Así la serie se
   reconoce en el feed.
6. **Probar.** YouTube permite **A/B de hasta 3 títulos y/o miniaturas**; gana la que logra **más tiempo de
   visualización**, no más clics **[YT-AB]**. Para juzgar una miniatura nueva, YouTube sugiere mirar el CTR de
   las primeras 24 horas en Inicio y Sugeridos **[YT-prácticas-miniatura]**.

Para producir la miniatura: un fotograma del resultado (`npx hyperframes snapshot --at <t>`) como base, más
texto y marca encima, en una composición aparte o con la skill `canvas-design`.

## Título

- **Límite: 100 caracteres** **[YT-límites]**. Se corta en las listas alrededor de los 60–70; lo importante va
  en los primeros ~60 **[utilhq, creador]**.
- **Tutorial = búsqueda.** Empieza con lo que la persona escribiría en el buscador: «Cómo liquidar sueldos
  en …», «Conciliar la cartola del banco en …». Después, el producto o el matiz.
- Sin mayúsculas sostenidas ni clickbait: el título promete exactamente lo que el video enseña.

## Descripción

- **Límite: 5.000 caracteres** **[YT-límites]**. Lo visible antes de «Mostrar más» son las primeras ~150
  **[utilhq, creador]**: ahí va qué enseña el video y el enlace a la guía escrita.
- **Capítulos**: lista de timestamps desde `00:00`, al menos 3, cada uno de ≥ 10 s **[YT-capítulos]**. Se
  copian del archivo de montaje que escribe el generador, no se miden a mano.
- **Hashtags**: YouTube muestra hasta 3 junto al título, y si hay **más de 60 ignora todos** **[YT-hashtags]**.
  Usar 2–5 relevantes.
- **Créditos de audio**: si se usó música de la YouTube Audio Library con licencia Creative Commons, el
  crédito va en la descripción **[YT-audio-library]**. La biblioteca propia es CC0: no exige crédito.
- **Correcciones**: una línea `Corrección:` con el timestamp y la explicación, sin volver a subir el video
  **[YT-límites]**.

## Fuentes

- **[YT-miniaturas]**: «Add video thumbnails». https://support.google.com/youtube/answer/72431
- **[YT-AB]**: «A/B test titles & thumbnails». https://support.google.com/youtube/answer/16391400
- **[YT-prácticas-miniatura]**: https://support.google.com/youtube/answer/12340300
- **[YT-momentos]**: https://support.google.com/youtube/answer/9314415
- **[YT-capítulos]**: https://support.google.com/youtube/answer/9884579
- **[YT-hashtags]**: https://support.google.com/youtube/answer/6390658
- **[YT-límites]**: «Edit video settings». https://support.google.com/youtube/answer/57407
- **[YT-audio-library]**: https://support.google.com/youtube/answer/3376882
- **[YT-spam]**: «Spam, deceptive practices & scams policies». https://support.google.com/youtube/answer/2801973
- **[Snappa]**: https://snappa.com/blog/youtube-thumbnail-best-practices/
- **[GrowthOS]**: https://growthos.in/blog/youtube-thumbnail-best-practices
- **[Pixelbatch]**: https://pixelbatch.io/blog/youtube-thumbnail-size-guide
- **[utilhq]**: https://utilhq.com/articles/youtube-character-limits-seo-guide/
