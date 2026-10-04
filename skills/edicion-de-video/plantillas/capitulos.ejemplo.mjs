export const idCap = (cap) => `cap${cap}`;

export const caps = [
  {
    cap: "00",
    titulo: "Apertura",
    vo:
      "Este es el informe del mes ya cerrado, con sus doce movimientos conciliados. Vamos a llegar a esto " +
      "desde cero: cargar la cartola, revisar lo que el sistema propone y cerrar el mes.",
    anclas: ["Este es el informe", "Vamos a llegar"],
  },
  {
    cap: "01",
    titulo: "Cargar la cartola",
    vo:
      "En Bancos, el botón Subir cartola abre el selector de archivos. El archivo que baja el banco en " +
      "formato ce ese uve sirve tal cual. Al subirlo, la tabla muestra cada movimiento con su fecha y su monto.",
    anclas: ["En Bancos", "El archivo que baja", "Al subirlo"],
    visuales: [{ ancla: "cada movimiento" }],
  },
];
