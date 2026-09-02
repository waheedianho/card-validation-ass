import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ApplicationModule } from './application/application.module.js';
import { InfraModule } from './infra/module.js';
import { ApiModule } from './api/api.module.js';
import { DomainModule } from './domain/domain.module.js';


export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'card-validation',
    // }),
    ApplicationModule,
    InfraModule,
    ApiModule,
    DomainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
