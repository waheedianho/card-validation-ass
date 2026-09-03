import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/module.js';
import { CardEndpoint } from './card/endpoint.js';
import { ApiTags } from '@nestjs/swagger';


@ApiTags("Card")
@Module({
    imports: [ApplicationModule],
    controllers: [CardEndpoint]
})
export class ApiModule { }
