// Error controlado: lleva el código HTTP que debe devolver la API.
export class ApiError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
