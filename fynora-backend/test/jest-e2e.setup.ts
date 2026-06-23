import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const backendRoot = join(__dirname, '..');

const envFiles = ['.env.test', '.env'] as const;

for (const file of envFiles) {
  const path = join(backendRoot, file);

  if (existsSync(path)) {
    config({ path, override: file === '.env' });
  }
}

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

const requiredEnvKeys = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ALLOWED_ORIGINS',
] as const;

const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Variáveis de ambiente ausentes para E2E: ${missingEnvKeys.join(', ')}. ` +
      'Configure fynora-backend/.env (copie de .env.example) ou ajuste fynora-backend/.env.test.',
  );
}
