import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from './postgres/module.js';
import { SecretsModule } from './secret/module.js';

@Module({
  imports: [PostgresDatabaseModule, SecretsModule],
  exports: [PostgresDatabaseModule, SecretsModule],
})
export class InfraModule { }
