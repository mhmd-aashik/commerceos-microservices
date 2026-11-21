export interface AppConfig {
  app: {
    port: number;
    environment: string;
  };

  grpc: {
    auth: {
      host: string;
      port: number;
    };
  };
}
