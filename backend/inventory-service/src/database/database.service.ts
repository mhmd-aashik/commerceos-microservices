import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema/index.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  readonly db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({
      connectionString: this.config.getOrThrow<string>('DATABASE_URL'),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.db = drizzle({
      client: this.pool,
      schema,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
    console.log('Inventory database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
