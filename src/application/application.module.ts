import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/module.js';
import { DomainModule } from '../domain/domain.module.js';

@Module({
    imports: [InfraModule, DomainModule],
    providers: [],
    exports: []
})
export class ApplicationModule { }
