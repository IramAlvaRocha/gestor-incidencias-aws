import type { Request, Response } from 'express';
import type { CrearIncidencia } from '../../../application/use-cases/Incidencias/CrearIncidencias.js';
import type { ObtenerIncidencias } from '../../../application/use-cases/Incidencias/ObtenerIncidencias.js';
import { crearIncidenciaSchema } from '../validators/indicencia.schema.js';

export class IncidenciaController {
  constructor(
    private readonly crearIncidenciaUseCase: CrearIncidencia,
    private readonly obtenerIncidenciasUseCase: ObtenerIncidencias
  ) {}

  crear = async (req: Request, res: Response) => {
  const resultado = crearIncidenciaSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ errores: resultado.error.flatten().fieldErrors });
  }

  const { titulo, descripcion, prioridad } = resultado.data;

  const incidencia = await this.crearIncidenciaUseCase.execute({
    titulo,
    descripcion,
    prioridad, // ya es Prioridad | undefined, coincide con el DTO
  });

  return res.status(201).json(incidencia);
};

  listar = async (_req: Request, res: Response) => {
    const incidencias = await this.obtenerIncidenciasUseCase.execute();
    return res.status(200).json(incidencias);
  };
}