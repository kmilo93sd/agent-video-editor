# Checklist de revisión antes de mostrar un corte

Un corte no se muestra hasta pasar las tres partes. Lo automático lo hace el generador o el CLI; lo demás se
mira a ojo, en snapshots, no imaginándolo desde el código.

## 1. Automático: tiene que salir limpio

- [ ] `node gen-voz.mjs` sin pendientes:
  - todas las anclas calzan, sin repetidas;
  - ningún capítulo a más de 4 dB de la mediana.
- [ ] `node verificar-voz.mjs NN tmp/trans-NN/transcript.json` revisado en cada capítulo nuevo o regenerado.
  Sale con código 1 ante cualquier diferencia, y las siglas deletreadas siempre difieren: no es una compuerta
  automática, se lee tramo por tramo. Que no haya:
  - ninguna sigla leída como palabra;
  - ningún número dicho distinto;
  - ninguna palabra comida.
- [ ] `node gen-video.mjs` termina sin reglas rotas (`revisar()` de `plantillas/montaje-base.mjs`):
  - [ ] sin retrocesos ni vuelta a un clip ya dejado;
  - [ ] planos ≥ 5 s (salvo los marcados `corto`);
  - [ ] ningún tramo sobre ×1,5;
  - [ ] ≥ 0,4 s entre frases; ningún silencio > 6 s sin `silencioJustificado`; los avisos > 3 s se miran a ojo;
  - [ ] cada gráfico entra ≤ 0,5 s antes de su palabra, tiene contenido antes de 1 s, y cada elemento entra a ≤ 0,6 s de su palabra;
  - [ ] zooms ≤ 1,10, ≥ 1,5 s de entrada, uno cada dos frases, sin cruzar un corte;
  - [ ] cada congelado sale del segundo en que va el clip (± 0,1 s).
- [ ] `npx hyperframes check` sin errores (no correr `lint` antes: `check` lo incluye). Primera pasada con
  `--snapshots`.
- [ ] Guion sin frases de la lista negra de `referencias/voz-y-guion.md`.
- [ ] Los timestamps de capítulo (de `datos/montaje.json`) cumplen YouTube: desde `00:00`, ≥ 3, cada uno ≥ 10 s.

## 2. En `datos/montaje.json`: números que delatan problemas

- [ ] `congelado` de cada plano: sobre ~6 s, la voz dice más de lo que la pantalla muestra. Hay que poner un
  gráfico, partir la frase o regrabar.
- [ ] Planos con una sola frase muy larga encima: ¿la pantalla cambia mientras habla?
- [ ] Largo total y por capítulo: bloques bajo 6 min si se puede (`referencias/ritmo-y-cortes.md`).

## 3. A ojo, con snapshots

**Cómo sacarlos.** Con los tiempos globales de `datos/montaje.json`, siempre con `--no-end` (no agrega el
cuadro final), `--describe false` (no llama a Gemini, que cobra) y `-o` a una carpeta temporal por grupo:

```bash
# un punto medio por plano (sirve para ver que cada sub-composición monta)
npx hyperframes snapshot --at 12.4,31.0,48.7 --no-end --describe false -o tmp/snap-planos

# cada gráfico, cada 0,5 s desde que entra hasta que sale
npx hyperframes snapshot --at 258.0,258.5,259.0,259.5,260.0,260.5,261.0 --no-end --describe false -o tmp/snap-p13
```

**Hoja de contacto**: una imagen por cada 12 cuadros, que se lee por filas de izquierda a derecha.

```bash
node hoja-de-contacto.mjs tmp/snap-p13      # escribe tmp/snap-p13/hoja-1.jpg, hoja-2.jpg…
```

Mirar **las hojas**, no 20 imágenes sueltas: cada imagen adjunta encarece el resto de la sesión. Para el detalle
de un elemento: `npx hyperframes snapshot --zoom "#p13" --describe false -o tmp/zoom`.

**Qué mirar:**

- [ ] **Gráficos**:
  - [ ] ningún cuadro con un marco, tabla o tarjeta vacía;
  - [ ] las filas aparecen en el orden en que la voz las nombra;
  - [ ] el gráfico no sigue en pantalla mucho después de su última frase.
- [ ] **Congelados**:
  - [ ] el cuadro fijo muestra el resultado ya terminado (modal abierto del todo, carga terminada);
  - [ ] no hay salto visible entre el último cuadro en movimiento y el congelado.
- [ ] **Placas**: texto dentro del title-safe (80 %), legible, sin cortar palabras.
- [ ] **Ancla de borde**: visible durante el producto y oculta mientras hay un gráfico encima.
- [ ] **Zoom**:
  - [ ] el foco cae sobre el botón o dato que nombra la voz, no sobre un borde vacío;
  - [ ] a 1,10 el texto de la UI sigue nítido.
- [ ] **Texto en pantalla**: dura al menos `max(1,5 s; palabras × 0,33 s + 0,5 s)`; contraste suficiente; ≥ 40 px de alto
  en 1080p.
- [ ] **Datos**: todo es de la empresa demo; ningún RUT, nombre ni monto real; los botones que nombra la voz
  dicen lo mismo en la pantalla.
- [ ] **Gancho**: el primer plano muestra el resultado prometido en el título y la miniatura.
- [ ] **Últimos 5–20 s**: espacio libre para la pantalla final.

**Oír** (con audífonos, en la vista previa):

- [ ] la voz no sube ni baja entre capítulos;
- [ ] las siglas suenan deletreadas;
- [ ] la música (si hay) no compite con la voz;
- [ ] los efectos no tapan una cifra ni se repiten más de 3 veces seguidas;
- [ ] ningún clic de la grabación real lleva efecto encima.

## 4. Después del render (solo con aprobación)

- [ ] `ffprobe`: la duración coincide con el `data-duration` raíz.
- [ ] Render con `--video-frame-format png` (grabaciones de pantalla).
- [ ] Master de loudness en dos pasadas: -14 LUFS, true peak ≤ -1 dBTP (`referencias/audio-y-sfx.md`).
  Verificar con `ebur128`.
- [ ] Mirar el MP4 entero a 1×, de corrido, una vez. No reemplaza a lo anterior: lo confirma.
