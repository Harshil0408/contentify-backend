declare namespace NodeJS {
  interface ProcessEnv {
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY?: string; // optional fallback
  }
}