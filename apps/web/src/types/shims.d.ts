// Consolidated shims for Vite ImportMeta extensions and generated page imports.
interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
  readonly VITE_ENV?: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (cb?: (mod?: any) => void) => void;
  };
  glob: (pattern: string, options?: any) => Record<string, () => Promise<any>>;
}

// Allow generated react-router types to import page modules by path.
declare module '*page.jsx' {
  const value: any;
  export default value;
}

declare module '*page.js' {
  const value: any;
  export default value;
}

// Common explicit relative imports the generator emits
declare module 'src/app/page.jsx' {
  const value: any;
  export default value;
}

declare module 'src/app/__create/not-found.tsx' {
  const value: any;
  export default value;
}

// Module alias used in server-side code
declare module '@/lib/config' {
  export function getServerConfig(): Record<string, string>;
  export function getClientConfig(): Record<string, string>;
  export function peekServerEnv(key: string): string | undefined;
}
