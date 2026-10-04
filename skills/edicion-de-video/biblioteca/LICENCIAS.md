# Licencias de la biblioteca de audio

Todo lo que hay en `sfx/` y `musica/` es **CC0 1.0** (dominio público). Se puede usar en videos comerciales
y monetizados, modificar y redistribuir dentro de un video, **sin atribución**. Texto legal de CC0:
https://creativecommons.org/publicdomain/zero/1.0/

Revisado el 4 de octubre de 2026, leyendo la página de cada paquete y el `License.txt` que trae el zip. Si se
agrega un sonido, se revisa igual y se anota aquí antes de que entre al catálogo. Nada con licencia dudosa.

## Kenney (kenney.nl), 24 efectos

Cada página de paquete muestra, en el recuadro de datos, «License: Creative Commons CC0». Se descargó el zip
enlazado en esa página, sin cuenta.

| Paquete | Página | Zip descargado | Texto del `License.txt` |
|---|---|---|---|
| UI Audio | https://kenney.nl/assets/ui-audio | https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip | «License (Creative Commons Zero, CC0) … You may use these assets in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.» |
| Interface Sounds | https://kenney.nl/assets/interface-sounds | https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip | «License: (Creative Commons Zero, CC0) … This content is free to use in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not mandatory)» |
| Impact Sounds | https://kenney.nl/assets/impact-sounds | https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip | Igual que Interface Sounds. |
| Casino Audio | https://kenney.nl/assets/casino-audio | https://kenney.nl/media/pages/assets/casino-audio/2472606a04-1721639069/kenney_casino-audio.zip | Igual que UI Audio. |
| RPG Audio | https://kenney.nl/assets/rpg-audio | https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip | Igual que UI Audio. |

Qué archivo de qué paquete es cada sonido: campo `origen` de `catalogo.json`.

## Generados aquí, 3 efectos

- `whoosh-suave`, `whoosh-corto`: ruido rosa filtrado con envolvente, generado con `ffmpeg` (`anoisesrc`,
  `bandpass`, `afade`). No sale de ninguna grabación ajena; se dedican a CC0.
- `tipeo-3s`: secuencia armada con `click2`, `click4` y `click5` de Kenney UI Audio (CC0), con tiempos y
  volúmenes al azar con semilla fija. Obra derivada de material CC0; se dedica a CC0.

## Música, 3 pistas de OpenGameArt.org

Cada página muestra «License(s): CC0» en el campo de licencias. Se descargó el archivo enlazado en la página,
sin cuenta.

| Archivo | Pista y autor | Página | Archivo original |
|---|---|---|---|
| `musica-contemplacion.mp3` | «Contemplation», Joth | https://opengameart.org/content/contemplation-0 | https://opengameart.org/sites/default/files/Contemplation.mp3 |
| `musica-lofi-te.mp3` | «A cup of tea» (de «lofi Compilation»), TAD | https://opengameart.org/content/lofi-compilation | https://opengameart.org/sites/default/files/A%20cup%20of%20tea.mp3 |
| `musica-loop-calmo.mp3` | «Calm Loop», wipics | https://opengameart.org/content/calm-loop | https://opengameart.org/sites/default/files/Relaxing.mp3 |

**Riesgo de Content ID:** CC0 no impide que un tercero registre la misma pista en Content ID. No se verificó si
alguna de las tres está registrada, y no hay forma de garantizarlo. Si llega un reclamo, se disputa en YouTube
Studio con el enlace a la página de OpenGameArt, que muestra la licencia CC0. Ver `../referencias/licencias.md`.

## Normalización

Los archivos de aquí ya no son byte a byte los originales: se pasaron a 44,1 kHz y se normalizaron (efectos a
-22 LUFS con techo de -1 dBTP, música a -16 LUFS con techo de -1,5 dBTP). El criterio completo está en
`catalogo.json` → `criterio`.
