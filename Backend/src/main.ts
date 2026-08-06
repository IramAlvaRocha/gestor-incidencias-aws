import "dotenv/config"
import { buildApp } from "./buildApp.js";

const PORT = process.env.PORT ?? 3000;
const app = buildApp();

app.listen(()=> {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
})