import express, { type Application } from 'express';
import cors from 'cors';
import type { IncidenciaController } from './controllers/incidencia.controller.js';
import { crearIncidenciaRouter } from './routes/indicencia.routes.js';


export const crearServidor = (incidenciaController: IncidenciaController): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/incidencias', crearIncidenciaRouter(incidenciaController));

  app.get('/', (_req, res) => {
    res.send('API de Gestión de Incidencias - Clean Architecture 🚀');
  });

  return app;
};