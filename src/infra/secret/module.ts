import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ISecretsAdapter } from './adapter';
import { SecretsService } from './service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env']
        })
    ],
    providers: [
        {
            provide: ISecretsAdapter,
            useFactory: (config: ConfigService) => {
                const secret = new SecretsService(config);
                return secret;
            },
            inject: [ConfigService]
        }
    ],
    exports: [ISecretsAdapter]
})
export class SecretsModule { }