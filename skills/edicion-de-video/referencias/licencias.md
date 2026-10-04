# Licencias de audio para YouTube

Qué se puede usar en un video monetizado sin atribución y sin sorpresas de Content ID. La biblioteca propia
(`../biblioteca/`) es 100 % CC0 y su evidencia está en `../biblioteca/LICENCIAS.md`. Fuentes al final.

## Resumen por fuente

| Fuente | Licencia | Atribución | Uso comercial | Descarga | Riesgo de Content ID |
|---|---|---|---|---|---|
| **Kenney.nl** (audio) | CC0 | No («would be nice but is not mandatory») | Sí | Zip directo, sin cuenta | Bajo |
| **OpenGameArt.org**, filtrando CC0 | CC0 (por pieza; hay otras licencias en el sitio) | No | Sí | Directa, sin cuenta | Bajo, no nulo |
| **Freesound.org** | Por sonido: CC0, CC BY o CC BY-NC | CC0 no; CC BY sí; **CC BY-NC no sirve** para un canal monetizado | Solo CC0 y CC BY | **Requiere cuenta** para descargar; la API requiere clave | Bajo en CC0 |
| **Sonniss GDC Game Audio Bundle** | Royalty-free propia | No | Sí | Directa, sin registro; ~7,5 GB | Bajo |
| **YouTube Audio Library** | Propia de YouTube; algunas pistas CC BY | Solo las CC BY (crédito en la descripción) | Sí, en YouTube | Desde YouTube Studio | Nulo: YouTube dice que no se reclaman |
| **Pixabay** (música y efectos) | Pixabay Content License | No | Sí, salvo venderlo suelto | Directa | **Alto en música**: algunos autores la registran en Content ID |
| **Incompetech** (Kevin MacLeod) | CC BY 4.0, **no CC0** | **Sí, obligatoria** | Sí | Directa | Bajo |

Detalle de cada fila, con citas textuales:

- **Kenney**: cada página de paquete dice «License: Creative Commons CC0». El `License.txt` dice «You may use
  these assets in personal and commercial projects. Credit … would be nice but is not mandatory.»
  **[Kenney]**
- **Freesound**:
  - «To download a sound, first make sure you are logged into your registered account.»
  - «For 'attribution' you should always mention the original creators.»
  - «'Noncommercial' … you can't earn any money with the piece of work you create!» **[Freesound]**
  - La API exige credencial propia (token o, para algunos recursos, OAuth2) **[Freesound-API]**, y la descarga
    desde la web exige cuenta. Por eso no se usó para esta biblioteca. Queda como opción: crear cuenta, filtrar por licencia CC0 y anotar cada sonido
    aquí.
- **Sonniss**:
  - «Everything is royalty-free and commercially usable.»
  - «No attribution is required.»
  - Prohíbe usar los sonidos para entrenar IA y revenderlos sueltos **[Sonniss]**.
  - Útil cuando falte un efecto específico; no se incluyó por su peso.
- **YouTube Audio Library**:
  - «Copyright-safe music and sound effects downloaded from the Audio Library won't be claimed by a rights
    holder through the Content ID system.»
  - «If you're using a track with a Creative Commons license, you must credit the artist in your video's
    description.» **[YT-audio-library]**
  - La página solo habla de su uso en YouTube: **no la uses para videos que también van a otras redes**.
- **Pixabay**: la licencia permite uso sin atribución **[Pixabay-licencia]**. Su propia FAQ reconoce que
  algunos contribuidores «upload their tracks to Pixabay for free use but also register them with Content ID»
  **[Pixabay-FAQ]**. Por eso **no se usa música de Pixabay sin estar dispuesto a disputar reclamos**.
  - Ojo: los efectos que trae `media-use` para usar sin credencial de HeyGen son de Pixabay
    (`media-use/audio/assets/sfx/CREDITS.md`). Para efectos el riesgo es menor que para música, pero no son CC0.

## Reglas

1. **En un canal monetizado, solo CC0, la Audio Library de YouTube o una licencia que diga explícitamente
   «uso comercial sin atribución».** Nada «NC», nada sin licencia escrita, nada «encontrado en YouTube».
2. **Antes de agregar un sonido a la biblioteca**:
   - leer la licencia en la página del paquete o del sonido, no en un agregador;
   - guardar la URL y el texto en `biblioteca/LICENCIAS.md`;
   - si la licencia es dudosa o no se encuentra, no entra.
3. **CC BY sí sirve, pero obliga a acreditar** en la descripción («"Título" de Autor, CC BY 4.0, enlace»).
   Anotarlo en el brief para no olvidarlo al publicar.
4. **Content ID no mira la licencia.** Un reclamo sobre material CC0 o con licencia es un error del sistema,
   no una falta. Se disputa en YouTube Studio con:
   - el enlace a la página de la pista;
   - el enlace a su licencia.
   Un reclamo afecta la monetización de ese video, no el estado del canal **[Pixabay-FAQ]**.
5. **No registres música libre en Content ID** a nombre propio: no es tuya y genera reclamos a terceros
   **[Pixabay-FAQ]**.

## Fuentes

- **[Kenney]**: https://kenney.nl/assets/ui-audio (y el resto de paquetes en `../biblioteca/LICENCIAS.md`)
- **[Freesound]**: https://freesound.org/help/faq/
- **[Freesound-API]**: https://freesound.org/docs/api/authentication.html
- **[Sonniss]**: https://gdc.sonniss.com/
- **[YT-audio-library]**: https://support.google.com/youtube/answer/3376882
- **[Pixabay-licencia]**: https://pixabay.com/service/license-summary/
- **[Pixabay-FAQ]**: https://pixabay.com/service/faq/
- **[Incompetech]**: https://incompetech.com/music/royalty-free/faq.html
- **[OpenGameArt]**: https://opengameart.org/content/faq
- **CC0**: https://creativecommons.org/publicdomain/zero/1.0/
