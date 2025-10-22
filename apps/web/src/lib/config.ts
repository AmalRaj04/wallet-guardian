/**
 * Centralized environment config for apps/web.
 * - getServerConfig() returns server-only secrets and throws helpful errors when missing.
 * - getClientConfig() returns safely-exposed NEXT_PUBLIC_* values for client code.
 */
export type ServerConfig = {
  GROQ_API_URL: string;
  GROQ_API_KEY: string;
  DATABASE_URL: string | undefined;
  AUTH_SECRET: string;
  AUTH_URL: string | undefined;
  CREATE_TEMP_API_KEY: string | undefined;
  CORS_ORIGINS: string | undefined;
};

export type ClientConfig = {
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?: string;
  NEXT_PUBLIC_BLOCKSCOUT_API_URL?: string;
  NEXT_PUBLIC_PROJECT_GROUP_ID?: string;
  NEXT_PUBLIC_CREATE_BASE_URL?: string;
  NEXT_PUBLIC_CREATE_API_BASE_URL?: string;
  NEXT_PUBLIC_CREATE_HOST?: string;
};

function required(name: string, val: string | undefined): string {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function getServerConfig(): ServerConfig {
  // NOTE: only call this on the server (Node runtime). It will throw when required secrets are missing.
  return {
    GROQ_API_URL: required('GROQ_API_URL', process.env.GROQ_API_URL),
    GROQ_API_KEY: required('GROQ_API_KEY', process.env.GROQ_API_KEY),
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: required('AUTH_SECRET', process.env.AUTH_SECRET),
    AUTH_URL: process.env.AUTH_URL,
    CREATE_TEMP_API_KEY: process.env.CREATE_TEMP_API_KEY,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
  };
}

export function getClientConfig(): ClientConfig {
  return {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_BLOCKSCOUT_API_URL: process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL,
    NEXT_PUBLIC_PROJECT_GROUP_ID: process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    NEXT_PUBLIC_CREATE_BASE_URL: process.env.NEXT_PUBLIC_CREATE_BASE_URL,
    NEXT_PUBLIC_CREATE_API_BASE_URL: process.env.NEXT_PUBLIC_CREATE_API_BASE_URL,
    NEXT_PUBLIC_CREATE_HOST: process.env.NEXT_PUBLIC_CREATE_HOST,
  };
}

// Small helper used by server modules that want non-throwing lookups
export function peekServerEnv(key: keyof ServerConfig): string | undefined {
  return (process.env as any)[key];
}
