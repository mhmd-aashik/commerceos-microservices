import type { AppConfig } from './configuration.types.js';

const configuration = (): AppConfig => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    environment: process.env.NODE_ENV ?? 'development',
  },

  grpc: {
    auth: {
      host: process.env.AUTH_GRPC_HOST ?? 'localhost',
      port: Number(process.env.AUTH_GRPC_PORT ?? 50051),
    },
  },
});

export default configuration;
