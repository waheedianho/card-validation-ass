import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { Logger } from '@nestjs/common';
import { name } from '../package.json'
import { ISecretsAdapter } from './infra/secret';
import { AppExceptionFilter } from './middlewares/exception-filter.js';
import { ResponseFormatterMiddleware } from './middlewares/response-formatter.js';
import { ValidationPipe } from './middlewares/validation-pipe.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


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
  app.useGlobalFilters(new AppExceptionFilter(app.get(HttpAdapterHost), loggerService))

  app.useGlobalPipes(new ValidationPipe(loggerService))
  app.use(new ResponseFormatterMiddleware().use)

  app.enableCors()
  app.useGlobalFilters()


  process.on('uncaughtException', (error) => {
    loggerService.error(error as Error)
  })

  process.on('unhandledRejection', (error) => {
    loggerService.error(error as Error)
  })


  if (!IS_PRODUCTION) {
    try {
      const config = new DocumentBuilder()
        .setTitle('Card Validation')
        .setDescription('This system validate card number')
        .setVersion('1.0')
        .addTag('Card')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    } catch (error) {
      loggerService.warn({ message: 'Failed to load Swager API documentation', obj: { originalError: error } })
    }
  }



  loggerService.log(`Application is running!`);
  loggerService.log(`🔵 Postgres listening at ${(POSTGRES_URL)}`)

  await app.listen(PORT ?? 3000, () => {
    loggerService.log(`🟢 ${name} listening at ${(PORT)} on ${(ENV?.toUpperCase())} 🟢`)
    // if (!IS_PRODUCTION) loggerService.log(`🟢 Swagger listening at ${(`${HOST}/api-docs`)} 🟢`)
  });
}
bootstrap();
