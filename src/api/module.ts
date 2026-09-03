import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/module.js';

@Module({
    imports: [ApplicationModule],
    controllers: []
})
export class ApiModule { }
