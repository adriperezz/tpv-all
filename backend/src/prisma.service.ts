import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private keepaliveTimer?: NodeJS.Timeout;

  constructor() {
    const rawUrl = process.env.DATABASE_URL ?? '';
    let datasourceUrl = rawUrl;
    try {
      const u = new URL(rawUrl);
      if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '60');
      if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '60');
      if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
      datasourceUrl = u.toString();
    } catch { /* malformed URL — use as-is */ }

    super({
      datasources: { db: { url: datasourceUrl } },
      log: process.env.PRISMA_LOG_QUERIES === 'true'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
          ]
        : [
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
          ],
    });

    // @ts-ignore
    this.$on('warn', (e: any) => this.logger.warn(e.message));
    // @ts-ignore — filtrar "Closed" que son lifecycle internos del pool, no errores reales
    this.$on('error', (e: any) => {
      if (typeof e.message === 'string' && e.message.includes('kind: Closed')) return;
      this.logger.error(e.message);
    });

    if (process.env.PRISMA_LOG_QUERIES === 'true') {
      // @ts-ignore
      this.$on('query', (e: any) => this.logger.debug(`${e.query} [${e.duration}ms]`));
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma conectado');
    } catch (e: any) {
      // No crashear al arrancar si la BBDD no es alcanzable aún
      this.logger.warn(`Prisma: no se pudo conectar al arrancar (${e.message}) — se reintentará en cada query`);
    }
    this.keepaliveTimer = setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`;
      } catch { }
    }, 2 * 60 * 1000);
  }

  async onModuleDestroy() {
    clearInterval(this.keepaliveTimer);
    await this.$disconnect();
  }
}
