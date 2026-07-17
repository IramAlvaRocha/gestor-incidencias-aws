import 'dotenv/config';
import { InMemoryIncidenciasRepository } from './infrastructure/repositories/InMemoryIncidenciasRepository.js';
import { CrearIncidencia } from './application/use-cases/Incidencias/CrearIncidencias.js';
import { ObtenerIncidencias } from './application/use-cases/Incidencias/ObtenerIncidencias.js';
import { IncidenciaController } from './infrastructure/http/controllers/incidencia.controller.js';
import { crearServidor } from './infrastructure/http/server.js';

const PORT = process.env.PORT ?? 3000;

// Composition Root: aquí se decide qué implementación concreta usar
const incidenciaRepository = new InMemoryIncidenciasRepository();
const crearIncidenciaUseCase = new CrearIncidencia(incidenciaRepository);
const obtenerIncidenciasUseCase = new ObtenerIncidencias(incidenciaRepository);
const incidenciaController = new IncidenciaController(crearIncidenciaUseCase, obtenerIncidenciasUseCase);

const app = crearServidor(incidenciaController);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});