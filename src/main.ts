import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { Logger } from '@nestjs/common';
import { name } from '../package.json'
import { ISecretsAdapter } from './infra/secret';

const loggerService = new Logger(name);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    cors: true,
  });


  const {
    ENV,
    TIMEOUT,
    POSTGRES: { POSTGRES_URL, POSTGRES_PGADMIN_URL },
    PORT,
    HOST,
    IS_PRODUCTION
  } = app.get(ISecretsAdapter)


  app.useLogger(loggerService)
  app.useGlobalFilters()


  app.enableCors()
  app.useGlobalFilters()


  process.on('uncaughtException', (error) => {
    loggerService.error(error as Error)
  })

  process.on('unhandledRejection', (error) => {
    loggerService.error(error as Error)
  })



  loggerService.log(`Application is running!`);
  loggerService.log(`🔵 Postgres listening at ${(POSTGRES_URL)}`)

  await app.listen(PORT ?? 3000, () => {
    loggerService.log(`🟢 ${name} listening at ${(PORT)} on ${(ENV?.toUpperCase())} 🟢`)
    // if (!IS_PRODUCTION) loggerService.log(`🟢 Swagger listening at ${(`${HOST}/api-docs`)} 🟢`)
  });
}
bootstrap();
