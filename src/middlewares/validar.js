// Valida body, params o query con un esquema de Zod.
// El resultado limpio queda en req.datos.body / req.datos.params / req.datos.query
export const validar = (schema, origen = 'body') => (req, res, next) => {
  const resultado = schema.safeParse(req[origen]);

  if (!resultado.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: resultado.error.issues.map((i) => ({
        campo: i.path.join('.') || origen,
        mensaje: i.message,
      })),
    });
  }

  req.datos = { ...req.datos, [origen]: resultado.data };
  next();
};
