import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "src/generated/**", "coverage/**"],
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
  },
);

//files selecciona el código y las pruebas que queremos revisar.
// extends activa las reglas recomendadas.
// ignores excluye archivos generados, como el cliente Prisma y la compilación. Al estar en un objeto separado, estas exclusiones son globales.