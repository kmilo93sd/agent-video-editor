# Gancho y retención

Fuentes entre corchetes; lista al final. **Oficial** = YouTube Help. **Creador** = blogs de herramientas o
creadores, útiles pero sin datos públicos que los respalden.

## Cómo mide YouTube la retención (oficial)

- **Intro** es el porcentaje de la audiencia que sigue mirando después de los **primeros 30 s** **[YT-momentos]**.
- **Spikes**: partes que se volvieron a ver o se compartieron. **Dips**: partes que se saltaron o donde la
  gente dejó de mirar **[YT-momentos]**.
- Los momentos clave aparecen con videos de **≥ 60 s y ≥ 100 vistas** **[YT-momentos]**.
- YouTube da dos palancas para la intro **[YT-momentos]**:
  1. que la miniatura y el título reflejen el contenido real;
  2. probar distintos estilos en los primeros 30 s.

Tras publicar, revisar el informe de retención. Un dip en un paso concreto indica qué capítulo editar o
regrabar.

## El gancho (primeros 15–30 s)

1. **Mostrar el resultado primero.** El primer plano es el estado final: el informe cerrado, el mes
   confirmado. La voz dice qué se va a lograr y con qué datos.
   - Sin fuente oficial que lo exija.
   - Es lo que cumple la regla 1 de YouTube: lo prometido en miniatura y título se ve en los primeros
     segundos **[YT-momentos]**.
2. **Sin intro de logo ni saludo.** El logo va en una tarjeta sobre el resultado, no en un plano aparte.
   - TubeBuddy pide el gancho en los primeros 5 s **[TubeBuddy-hacks, creador]**.
   - Para shorts, los primeros 3 s deciden **[TikTok vía blogs, creador]**.
3. **Decir para quién es y qué va a poder hacer**, con los datos de la demo, no con promesas genéricas. Nada
   de «en pocos clics» ni «de principio a fin» (ver `voz-y-guion.md`).
4. **Largo del gancho: 10–20 s** en un tutorial **[casa]**.
   - Más largo retrasa el primer paso.
   - Más corto no alcanza a mostrar el resultado y decir qué viene.
5. Se pierde cerca de la mitad de la audiencia en el primer minuto **[TubeBuddy-hacks, creador]**. No hay cifra
   oficial; tómalo como orden de magnitud.

## Capítulos (oficial)

Reglas de YouTube para que los capítulos funcionen **[YT-capítulos]**:

- el primer timestamp es `00:00`;
- al menos **3** timestamps, en orden ascendente;
- cada capítulo dura **≥ 10 s**.

Los capítulos automáticos vienen activados en subidas nuevas, pero no todo video los recibe. Para un tutorial
se escriben a mano en la descripción.

En el video, **cada capítulo abre con una placa** (título y «Paso 2 de 5»). Hay además un **ancla de borde**
con el nombre del paso, para quien entra a mitad del video desde un capítulo. Esto aplica dos hallazgos:

- en un tutorial la gente salta a la parte que necesita, y el texto grande en las transiciones lo facilita
  **[Guo 2014, estudio]**;
- los marcadores de tiempo ayudan a encontrar el momento **[NN/g]**.

El generador debe sacar los tiempos de inicio de cada capítulo a un archivo (por ejemplo
`datos/montaje.json`), para pegarlos en la descripción sin medirlos a mano.

## End screen y cierre (oficial)

- La pantalla final ocupa los **últimos 5–20 s**; el video necesita **≥ 25 s**; hasta **4 elementos** en 16:9
  **[YT-pantalla-final]**.
- Deja esos 5–20 s con fondo de marca y sin texto importante donde irán los elementos. Si no, los elementos
  tapan el contenido.
- El cierre dice a dónde ir (la guía escrita, el siguiente video) en una frase, sin resumen largo.

## Pattern interrupts

YouTube no publica una frecuencia. Las cifras de creadores y la postura de la casa para tutoriales están en la
tabla de `ritmo-y-cortes.md`.

## Fuentes

- **[YT-momentos]**: YouTube Help, «Measure key moments for audience retention». https://support.google.com/youtube/answer/9314415
- **[YT-capítulos]**: YouTube Help, «Video chapters». https://support.google.com/youtube/answer/9884579
- **[YT-pantalla-final]**: YouTube Help, «Add end screens to videos». https://support.google.com/youtube/answer/6388789
- **[Guo 2014]**: https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[NN/g]**: https://www.nngroup.com/articles/instructional-video-guidelines/
- **[TubeBuddy-hacks]**: https://www.tubebuddy.com/blog/youtube-audience-retention-hacks-that-work/
- **[TikTok vía blogs]**: https://www.teleprompter.com/blog/tiktok-3-second-rule
- **[casa]**: ver `ritmo-y-cortes.md`.
