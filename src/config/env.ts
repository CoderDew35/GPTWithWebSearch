import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Environment {
  NODE_ENV: string;
  PORT: number;
  OPENAI_API_KEY: string;
  SERP_API_KEY: string;
  CORS_ORIGIN: string;
}

export const env: Environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SERP_API_KEY: process.env.SERP_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// Validate that required environment variables are defined
const validateEnv = (): void => {
  const requiredEnvVars = ['OPENAI_API_KEY', 'SERP_API_KEY'];
  
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is missing`);
    }
  }
};

try {
  validateEnv();
} catch (error) {
  if (error instanceof Error) {
    console.error(`Environment validation error: ${error.message}`);
  }
  // Don't exit in development to make debugging easier
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
