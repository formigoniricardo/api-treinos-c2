import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Forçamos o Vitest a conhecer nossas variáveis de ambiente essenciais
    env: {
      DATABASE_URL: "file:./prisma/dev.db",
      JWT_SECRET: "chave_super_secreta_de_testes"
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});