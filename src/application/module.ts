import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/module.js';
import { DomainModule } from '../domain/module.js';
import { CardService } from './card/service.js';

@Module({
    imports: [InfraModule, DomainModule],
    providers: [CardService],
    exports: [CardService],
})
export class ApplicationModule {}
