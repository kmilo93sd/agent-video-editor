# Ritmo y cortes

Cada número lleva su fuente entre corchetes; la lista está al final. Cuando las fuentes no coinciden se
muestra el rango de cada una, sin promediar. Tipo de fuente:

- **oficial**: documentación de la plataforma o del fabricante;
- **estudio**: investigación publicada;
- **creador**: blog o análisis de creadores o herramientas;
- **casa**: regla aprendida revisando cortes reales de tutoriales de software (ver «Por qué la casa manda»).

## Tabla de referencia rápida

| Qué | Tutorial de pantalla | Explicativo | Short vertical |
|---|---|---|---|
| **Cada cuánto cambia lo que se ve** (corte, zoom, gráfico, texto o encuadre) | Cuando cambia la acción, no por reloj **[casa]**. Si nada cambia en 20–40 s, revisar: creadores piden un cambio cada 25–40 s pasado el minuto 3 **[air.io, creador]**, un «microgancho» cada 30–60 s **[TubeBuddy, creador]** o cada 60–90 s **[vidIQ, creador]** | Plano medio de cine actual ≈ 4–5 s **[Cutting 2011, estudio, cine]**; talking head de YouTube 2–5 s por plano **[Ali Abdaal vía blogs, creador]**; primeros 3 min cada 10–15 s **[air.io, creador]** | 2–3 s por plano **[OpusClip, creador]**; los 3 primeros segundos deciden **[TikTok vía blogs, creador]** |
| **Plano mínimo** | 5 s **[casa]**; un mes de una tira o un paso repetido, 2 s **[casa]** | Sin fuente seria. Usar el texto que tenga encima como piso (fila de abajo) | Sin fuente seria; 2 s si lleva texto |
| **Plano máximo** | Sin tope fijo mientras la acción avance a 1×. Congelado esperando a la voz: si pasa de ~6 s, la voz dice más de lo que la pantalla muestra; poner un gráfico o regrabar **[casa]** | Sin fuente seria | 4 s **[OpusClip, creador]** |
| **Pattern interrupt o gráfico** | Un gráfico cuando hay un concepto que la pantalla no muestra, no por cuota **[casa; Mayer, estudio]**. Zoom: uno cada dos frases como máximo **[casa]**; separar zooms 5–7 s **[Envision, creador]** | Primer interrupt a los 25–35 s, luego cada 2–3 min **[air.io, creador]** | Algo nuevo cada 5–7 s (corte, texto, sonido) **[análisis de MrBeast, creador]** |
| **Texto en pantalla** | 0,33 s por palabra **[BBC, oficial]**, o 20 caracteres/s **[Netflix, oficial]**; mínimo 5/6 s (20 cuadros) **[Netflix, oficial]**. Fórmula práctica: `max(1,5 s; palabras × 0,33 s + 0,5 s)` | igual | igual; en vertical, 3–5 palabras por línea |
| **Silencio entre frases** | ≥ 0,4 s **[casa]**. Referencias externas: 200–400 ms **[Syllaby, creador]**; Descript acorta huecos largos a ~250 ms **[Descript, oficial de la herramienta]** | 200–400 ms **[Syllaby]** | 200–300 ms **[Syllaby]** |
| **Silencio sin voz** | Aviso a los 3 s, falla a los 6 s, salvo que la pantalla muestre una acción que se explica sola **[casa]** | Sin fuente seria | Evitar |
| **Duración de una transición** | Corte seco dentro de un capítulo. Placa de capítulo: 3 s quieta, su contenido entra en 0,55 s **[casa]**. Zoom: ≥ 1,5 s para entrar, 0,9 s para salir **[casa]** | Disolvencia por defecto de Premiere: 1 s **[Adobe, oficial]**. Gráficos de UI: entra 225 ms, sale 195 ms, complejas 375 ms, > 400 ms se siente lento **[Material Design, oficial, para interfaces]** | 0,2–0,4 s o corte seco |
| **Corte seco o fundido** | Corte seco siempre dentro de un paso; la placa de capítulo marca el cambio de bloque **[casa]** | Corte = continuidad; disolvencia = paso de tiempo o cambio de lugar o tema; fundido a negro = fin de un bloque **[StudioBinder]** | Corte seco |

## Reglas de ritmo para tutoriales

1. **La pantalla manda y la voz se acomoda.** Dentro de un capítulo el clip avanza y nunca retrocede: ningún
   segundo se ve dos veces y no se vuelve a un clip ya dejado **[casa]**. Ver un formulario tipearse dos veces
   confunde más que cualquier silencio.
2. **Velocidad: 1× para navegar, hacer clic y ver resultados. El tipeo, como máximo a 1,5×** **[casa]**. Si
   sigue largo, se corta con un corte limpio que se note; no se acelera más.
   - Aquí la casa se aparta de las herramientas: Screen Studio y otros aceleran el tipeo 2–5× **[Screen
     Studio, creador]**.
   - Se probó en un corte real y no se entendía: la gente no entiende tan rápido. Quien mira un
     tutorial lo repite con la app abierta al lado.
3. **No cortar en mitad de una animación de la app** (un modal que se abre, una carga) **[casa]**.
4. **Voz por frase, puesta cuando pasa lo que dice.**
   - Si la acción dura más que la frase, la pantalla queda sola.
   - Si la frase dura más que la acción, se congela el resultado.
   - Esto es contigüidad temporal: palabra e imagen juntas, no una después de otra **[Mayer, estudio]**.
5. **Cortes J y L** para que la voz anticipe el plano siguiente o lo acompañe un poco **[TechSmith]**. En un
   tutorial se usan poco: la voz debe nombrar lo que ya está en pantalla. Donde sí sirven es en la salida de
   una placa hacia el producto. Ahí la casa deja 0,6 s de respiro después de la placa antes de la primera
   frase **[casa]**; adelantar la voz más que eso no tiene fuente.
6. **Quitar el tiempo muerto** (cargas, esperas, búsquedas de un botón) con cortes limpios, no con aceleración.
   YouTube recomienda planificar los cortes desde el guion y usar jump cuts para sacar relleno **[YT-edición,
   oficial]**.
7. **Largo y segmentación.**
   - Bloques de menos de 6 minutos: en 6,9 millones de sesiones de edX, los videos cortos retienen mucho más
     **[Guo 2014, estudio]**.
   - En los tutoriales la gente ve en promedio 2–3 minutos de cada video, cualquiera sea su largo, y vuelve a
     mirarlos y salta a la parte que necesita. Por eso conviene marcar las transiciones con texto grande
     **[Guo 2014, estudio]**.
   - En YouTube eso se traduce en capítulos con placa (ver `gancho-y-retencion.md`).
   - Para un proceso largo, NN/g recomienda un video por paso en vez de uno solo **[NN/g]**.
8. **Ritmo cambiante, no parejo.** La animación más lenta de una escena debería durar unas 3 veces la más
   rápida **[hyperframes-creative/motion-principles]**. Esto aplica a las placas y a los gráficos, no a la
   velocidad del clip.

## Por qué la casa manda en tutoriales

Las cifras de creadores (2–3 s por plano, interrupt cada 5–7 s) vienen de videos de entretenimiento y de
talking head. En un tutorial de software el cuello de botella es que quien mira **siga la acción y la
repita**.

El primer corte del tutorial de referencia amarró la pantalla a la voz: 45 planos en 5 minutos, con tramos a
×3 y ×10, y no se entendía. Las reglas de arriba salen de esa revisión. Cuando una cifra externa choca con
esas reglas, gana la regla de la casa, y se dice.

## Fuentes

- **[casa]**: reglas de montaje del tutorial de referencia, revisado el 4-oct-2026. Las verifica el generador (`hyperframes.md`).
- **[Cutting 2011]**: Cutting, Brunick & DeLong, «How act structure sculpts shot lengths and shot transitions in Hollywood film», *Projections* 5(1). https://www.researchgate.net/publication/236964224_On_Shot_Lengths_and_Film_Acts_A_Revised_View
- **[Guo 2014]**: Guo, Kim & Rubin, «How video production affects student engagement: an empirical study of MOOC videos», L@S 2014. https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[Mayer]**: Mayer (2008), «Applying the science of learning: evidence-based principles for the design of multimedia instruction», *American Psychologist* 63(8). https://doi.org/10.1037/0003-066X.63.8.760
- **[NN/g]**: Nielsen Norman Group, «Instructional video guidelines». https://www.nngroup.com/articles/instructional-video-guidelines/
- **[YT-edición]**: YouTube Help, «Video editing tips». https://support.google.com/youtube/answer/11221953
- **[Netflix]**: Netflix, «Timed Text Style Guide: Subtitle Timing Guidelines» (mínimo 20 cuadros). https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394
  - «English (USA) Timed Text Style Guide» (20 cps adultos, 17 cps niños, 42 caracteres por línea). https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977
- **[BBC]**: BBC Subtitle Guidelines: 160–180 palabras/min, ~0,33 s por palabra. Leído vía resumen de terceros, porque la página de la BBC no cargó: https://www.clevercast.com/bbc-subtitling-guidelines/
- **[Adobe]**: Premiere Pro, duración por defecto de la transición de 1 s (Preferencias › Línea de tiempo). https://helpx.adobe.com/premiere/desktop/add-video-effects/apply-video-transitions/change-transition-duration-using-the-effect-controls-panel.html
- **[Material Design]**: «Duration & easing». https://m1.material.io/motion/duration-easing.html
- **[StudioBinder]**: «What is a dissolve». https://www.studiobinder.com/blog/what-is-a-dissolve-in-film-definition/
- **[TechSmith]**: «How to edit videos: L-cuts and J-cuts». https://www.techsmith.com/blog/how-to-edit-videos-l-cuts-and-j-cuts/
- **[Screen Studio]**: «Speed up typing segments». https://screen.studio/guide/speed-up-typing-segments
- **[Envision]**: «Best practices for screencast». https://www.envision.everspringpartners.com/build/best-practices-for-screencast
- **[Descript]**: «Shorten word gaps». https://help.descript.com/hc/en-us/articles/10164807277453-Shorten-word-gaps
- **[Syllaby]**: «Voiceover pacing». https://syllaby.io/blog/voiceover-pacing-silence-trimming-retention-editing/
- **[air.io]**: «Advanced retention editing». https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8
- **[TubeBuddy]**: https://www.tubebuddy.com/blog/youtube-viewer-retention-to-increase-watch-time/
- **[vidIQ]**: https://vidiq.com/blog/post/audience-retention-secrets-youtube/
- **[OpusClip]**: https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention
- **[análisis de MrBeast]**: https://www.a4bcreative.com/post/the-pattern-interrupt-edit-how-to-keep-viewers-hooked-for-the-full-60-seconds
- **[Ali Abdaal vía blogs]**: https://techbullion.com/an-ultimate-guide-to-ali-abdaal-video-editing-style-and-methods/
- **[TikTok vía blogs]**: https://www.teleprompter.com/blog/tiktok-3-second-rule
