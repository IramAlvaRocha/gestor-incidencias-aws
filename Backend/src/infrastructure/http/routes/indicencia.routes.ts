import { Router } from 'express';
import type { IncidenciaController } from '../controllers/incidencia.controller.js';

export const crearIncidenciaRouter = (controller: IncidenciaController): Router => {
  const router = Router();

  router.get('/', controller.listar);
  router.post('/', controller.crear);

  return router;
};