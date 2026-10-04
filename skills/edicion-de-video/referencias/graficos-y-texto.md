# Gráficos y texto en pantalla

Cuándo poner un gráfico o un texto, cuánto dura, cómo entra y cómo se ve en un teléfono. El diseño de la piel
de marca (paleta, tipografía, `frame.md`) es de `hyperframes-creative`; la animación, de
`hyperframes-animation`. Aquí van las reglas de oficio y sus números. Fuentes al final.

## Cuándo un gráfico

1. **Para explicar un concepto que la pantalla no muestra**: cómo se arma un asiento, qué parte del sueldo va
   a quién, una línea de tiempo. Un registro gráfico explica lo que la grabación no alcanza a mostrar.
   - Palabras con imagen enseñan más que palabras solas **[Mayer, estudio]**.
2. **Después del gráfico, el dato en la plataforma.** El gráfico explica y la grabación muestra que la app lo
   hace **[casa]**.
3. **Nunca decorativo.** Si el gráfico se puede quitar sin perder nada, sobra **[Mayer: coherencia]**.

## Un gráfico nunca está vacío

En el primer corte del tutorial de referencia, el gráfico de un asiento quedó unos 5 s como marco vacío esperando a la voz. Reglas **[casa]**, verificadas por el
generador:

| Regla | Número |
|---|---|
| El gráfico entra antes de la palabra que lo introduce | **a lo más 0,5 s** antes |
| Su primer elemento con contenido aparece | **dentro del primer segundo** |
| Cada fila o elemento entra cuando la voz lo nombra | **a ≤ 0,6 s** de su palabra |
| Ninguna tarjeta, tabla o marco queda sin contenido | **más de 1 s** |
| Se queda después de su última frase | ~1,2 s, y sale |

Las filas entran **ancladas a palabras de la alineación**, no con un `stagger` parejo: el `stagger` adelanta
filas que la voz todavía no nombra.

## Cuánto dura un texto en pantalla

- **0,33 s por palabra** (160–180 palabras/min) **[BBC]**, o **20 caracteres/s** para adultos y 17 para niños
  **[Netflix]**.
- Mínimo **20 cuadros (≈ 0,83 s)** por evento **[Netflix]**.
- Fórmula práctica: `duración = max(1,5 s; palabras × 0,33 s + 0,5 s)`. El medio segundo extra es para
  encontrar el texto antes de leerlo **[derivada de BBC; el extra es casa]**.
- Un rótulo que acompaña a la voz (una sigla desarrollada) entra con su palabra y se queda **hasta 0,6 s
  después de que termina de nombrarse, y nunca menos que la fórmula de arriba** **[casa]**.
- **Líneas de hasta 42 caracteres** **[Netflix]**. En vertical, 3–5 palabras por línea.

## Entradas y salidas

- **En la UI**, Material Design usa:
  - 225 ms para entrar, 195 ms para salir y 375 ms para transiciones grandes;
  - en escritorio, 150–200 ms;
  - y advierte que sobre 400 ms se siente lento **[Material Design]**.
  Eso es para interfaces.
- **En video**, el texto tiene que alcanzar a verse entrar. La casa usa:
  - 0,35–0,6 s para tarjetas y titulares (`power3.out`, sin rebote);
  - 0,3 s para filas;
  - 0,25 s para salidas **[casa]**.
- **Variar la velocidad a propósito**: la animación más lenta de una escena dura unas 3 veces la más rápida
  **[hyperframes-creative/motion-principles]**.
- **Sin rebote ni elástico en contenido serio**; un `back.out` suave solo en un CTA **[casa]**.
- Entrada corta con desplazamiento de 20–40 px más opacidad. Nada que gire, rebote o haga zoom desde 0.

## Zonas seguras

- Contenido visible dentro del **action-safe de 90 %** (5 % de margen por lado) **[hyperframes-studio]**.
- Texto y contenido clave dentro del **title-safe de 80 %** (10 % por lado) **[hyperframes-studio]**.
- Son los márgenes por defecto de Premiere que usa la vista previa de HyperFrames. Aquí no se usan otros
  números para no contradecirla.
- **Últimos 5–20 s**: dejar libre el área donde irán los elementos de la pantalla final **[YT-pantalla-final]**.
- **Ancla de borde** (nombre del paso, abajo a la izquierda): dentro del title-safe, y sin chocar con la barra
  de progreso del reproductor.

## Legibilidad en teléfono

- Texto de cuerpo de **≥ 40–60 px de alto en 1080p**; títulos ~50 % más grandes **[legibility.info]**.
- Contraste **≥ 4,5:1** para texto normal (WCAG AA) **[WebAIM]**. Sobre video, poner el texto en una tarjeta
  de fondo sólido o con velo, nunca directo sobre la grabación.
- Máximo una idea por tarjeta. Si hay que leer más de ~12 palabras mientras la voz habla de otra cosa, falla
  la redundancia **[Mayer]**: la voz y el texto compiten.
- No hay cifra oficial de YouTube sobre qué parte de las vistas viene de teléfonos. Las cifras de terceros
  (60–70 %) no se pudieron verificar; diseña igual para teléfono.

## Consistencia de marca

- Una sola piel en intro, placas, gráficos y cierre: misma paleta, tipografía, radio, sombra y curva de
  animación.
- La piel se define una vez en `frame.md` / `design.md` y se aplica con `hyperframes-creative`
  (`references/design-spec.md`, `design-adherence.md`). No inventes colores fuera de ese archivo.
- La grabación de producto no lleva piel encima: la marca aparece donde no hay producto que mostrar.

## Fuentes

- **[casa]**: reglas del tutorial de referencia (ver `ritmo-y-cortes.md`).
- **[Mayer]**: https://doi.org/10.1037/0003-066X.63.8.760
- **[BBC]**: BBC Subtitle Guidelines, leído vía https://www.clevercast.com/bbc-subtitling-guidelines/
- **[Netflix]**: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977 y https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394
- **[Material Design]**: https://m1.material.io/motion/duration-easing.html
- **[legibility.info]**: https://legibility.info/rules-for-text-in-videos
- **[WebAIM]**: https://webaim.org/articles/contrast/
- **[YT-pantalla-final]**: https://support.google.com/youtube/answer/6388789
- **[hyperframes-studio]**: `~/.claude/skills/hyperframes-studio/SKILL.md` § 4 «Safe zones».
- **[hyperframes-creative/motion-principles]**: `~/.claude/skills/hyperframes-creative/references/motion-principles.md`.
