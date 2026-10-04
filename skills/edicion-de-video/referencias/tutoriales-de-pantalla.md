# Tutoriales de pantalla

Cómo grabar y editar la pantalla para que quien mira pueda repetir el flujo con la app abierta al lado.
Fuentes al final.

## Grabar

1. **Datos de demo, nunca reales.**
   - Se graba en un ambiente local con una empresa y personas ficticias.
   - Nunca se usa un espejo de producción, aunque los datos «parezcan» de prueba.
   - Los textos de botones que nombra la voz tienen que coincidir con lo que muestra el clip **[casa]**.
2. **1920×1080 a sangre** y texto legible en un teléfono.
   - Grabar con el zoom del navegador o de la app al 125–150 % cuando la UI es densa **[Envision; legibility.info]**.
   - Si algo se ve chico en la grabación, en el teléfono no se lee. El ajuste se hace antes de grabar, no con
     zoom en la edición.
3. **Playwright con marcas**, con `plantillas/grabar.ejemplo.mjs` copiada al proyecto.
   - Fija `viewport` y `recordVideo.size` en 1920×1080. Sin eso, Playwright graba a 800×450 y reescala sin
     avisar.
   - Cada acción escribe una línea `12.34s abre «Bancos»` en `<clip>.marcas.txt`, medida desde que se crea la
     página, que es cuando empieza el video.
   - El generador busca las marcas por texto, no por segundo. Al regrabar un clip con el mismo nombre de
     archivo, el montaje se reacomoda solo, y falla diciendo qué marca ya no está **[casa]**.
   - Playwright graba `.webm` con poca tasa de bits. La plantilla lo pasa a `.mp4` H.264 (CRF 14, GOP de 15
     cuadros), que es lo que usa el montaje: se ve más nítido con zoom y la vista previa busca bien.
4. **En Windows, Chromium y Playwright se corren con `node`, no con `bun`** **[casa: tropiezo vivido]**.
5. **Cursor con propósito.**
   - Moverlo solo para ir al siguiente clic, y dejarlo quieto mientras la voz explica **[Envision]**.
   - Si el cursor del sistema queda chico en 1080p, agrandarlo (≥ 20 px visibles) o dibujarlo en la página
     grabada **[Envision]**.
6. **Tipeo real, a velocidad humana.** Se graba a la velocidad natural de Playwright con `delay` por tecla. En
   la edición se puede llevar a 1,5× como máximo (ver `ritmo-y-cortes.md`).
7. **Un clip por bloque de acción**, no un clip por video. Regrabar un paso no obliga a regrabar todo.

## Editar

1. **Guiar la mirada con el encuadre, no con flechas.**
   - El cursor de la grabación ya marca el clic.
   - Para el botón o el dato que nombra la voz, usar un zoom lento: **hasta 1,10**, **≥ 1,5 s para entrar**,
     y se queda mientras se habla de eso. Como máximo **uno cada dos frases** **[casa]**.
   - Las herramientas de screencast proponen 1,5×–4× y entradas de 100–500 ms **[Envision, creador]**. Eso
     marea a quien sigue el flujo en otra pantalla; la casa usa 1,10.
2. **Un zoom nunca cruza un corte**: empieza y termina dentro del mismo plano **[casa]**.
3. **Sin acelerar resultados.** Navegación, clics y resultados van a 1×; las esperas se cortan **[casa]**.
4. **Congelar en vez de repetir.**
   - Si la voz necesita más tiempo que la acción, se congela el último cuadro del resultado.
   - El cuadro congelado se toma del segundo exacto en que va el clip.
   - **Tropiezo vivido:** un congelado tomado de un segundo equivocado (por ejemplo, de antes de que el
     modal terminara de abrir) hace que el modal parezca abrirse y cerrarse.
   - El generador anota el segundo de cada congelado y compara con el segundo del clip.
5. **Texto en pantalla solo para lo que se escribe o se busca**: un rótulo con la sigla desarrollada, una ruta
   de menú, una tecla.
   - No duplicar en texto lo que la voz dice: el principio de redundancia muestra que narración más el mismo
     texto en pantalla aprende peor que narración sola **[Mayer, estudio]**.
   - Sí ayuda resaltar dónde mirar (principio de señalización) **[Mayer]**.
6. **Gráficos e ilustraciones para lo que la pantalla no muestra.**
   - Un concepto (cómo se arma un asiento, qué es una cotización) se dibuja.
   - Además, se muestra el dato en la plataforma.
   - Palabras con imagen enseñan mejor que palabras solas (principio multimedia) **[Mayer, estudio]**.
   - Ilustraciones de contexto (el negocio, la persona) con `gen-ilustraciones.mjs` (de `plantillas/`), siempre sin
     texto dentro de la imagen.
7. **Nada decorativo.** Animación, música o b-roll que no explica algo distrae (principio de coherencia)
   **[Mayer, estudio]**.
8. **Mostrar el dato en la plataforma después del gráfico.** El gráfico explica; la pantalla prueba que la app
   lo hace **[casa]**.

## Duración y estructura

- Bloques de menos de 6 min; en tutoriales la gente vuelve a mirar y salta, así que la estructura por pasos con
  placa y capítulo importa más que el largo total **[Guo 2014, estudio]**.
- Para un proceso de muchos pasos, NN/g recomienda un video por paso **[NN/g]**. Si se hace uno solo, que
  cada capítulo se entienda por sí mismo.
- Cada video lleva su guía escrita con el mismo contenido y el video incrustado, para quien no puede tener
  sonido: NN/g reporta que mucha gente mira sin audio **[NN/g]**.

## Fuentes

- **[casa]**: reglas del tutorial de referencia; ver `ritmo-y-cortes.md`.
- **[Mayer]**: Mayer (2008), *American Psychologist* 63(8), principios multimedia, coherencia, señalización, redundancia, contigüidad temporal y segmentación. https://doi.org/10.1037/0003-066X.63.8.760
- **[Guo 2014]**: https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[NN/g]**: https://www.nngroup.com/articles/instructional-video-guidelines/
- **[Envision]**: https://www.envision.everspringpartners.com/build/best-practices-for-screencast
- **[legibility.info]**: https://legibility.info/rules-for-text-in-videos
