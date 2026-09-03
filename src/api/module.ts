import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/module.js';
import { CardEndpoint } from './card/endpoint.js';

@Module({
    imports: [ApplicationModule],
    controllers: [CardEndpoint]
})
export class ApiModule { }
