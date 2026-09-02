
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ISecretsAdapter } from './adapter'
import { EnvEnum } from './types'

@Injectable()
export class SecretsService implements ISecretsAdapter {
    constructor(private readonly config: ConfigService) { }

    get TIMEOUT() { return this.config.get<number>('TIMEOUT') as number; }

    get IS_LOCAL() { return this.config.get<EnvEnum>('NODE_ENV') === EnvEnum.LOCAL; }

    get IS_PRODUCTION() { return this.config.get<EnvEnum>('NODE_ENV') === EnvEnum.PRD; }

    get ENV() { return this.config.get<EnvEnum>('NODE_ENV') as string; }

    get PORT() { return this.config.get<number>('PORT') as number; }

    get HOST() { return this.config.get<string>('HOST') as string; }

    get LOG_LEVEL() { return this.config.get<string>('LOG_LEVEL') as string; }

    get DATE_FORMAT() { return this.config.get<string>('DATE_FORMAT') as string; }

    get TZ() { return this.config.get<string>('TZ') as string; }

    get REDIS_URL() { return this.config.get<string>('REDIS_URL') as string; }
    get REDIS_PASSWORD() { return this.config.get<string>('REDIS_PASSWORD') ?? ''; }

    get MONGO() {
        return {
            MONGO_URL: this.config.get<string>('MONGO_URL') as string,
            MONGO_DATABASE: this.config.get<string>('MONGO_DATABASE') as string,
            MONGO_EXPRESS_URL: this.config.get<string>('MONGO_EXPRESS_URL') as string
        };
    }

    get EMAIL() {
        return {
            HOST: this.config.get<string>('EMAIL_HOST') as string,
            PORT: Number(this.config.get<number>('EMAIL_PORT')),
            USER: this.config.get<string>('EMAIL_USER') as string,
            PASS: this.config.get<string>('EMAIL_PASS') as string,
            FROM: this.config.get<string>('EMAIL_FROM') as string
        };
    }

    get POSTGRES() {
        return {
            POSTGRES_URL: `postgresql://${this.config.get('POSTGRES_USER')}:${this.config.get(
                'POSTGRES_PASSWORD'
            )}@${this.config.get('POSTGRES_HOST')}:${this.config.get('POSTGRES_PORT')}/${this.config.get('POSTGRES_DATABASE')}`,
            POSTGRES_PGADMIN_URL: this.config.get<string>('PGADMIN_URL') as string
        };
    }

    get ZIPKIN_URL() { return this.config.get<string>('ZIPKIN_URL') as string; }

    get PROMETHUES_URL() { return this.config.get<string>('PROMETHUES_URL') as string; }

    get GRAFANA_URL() { return this.config.get<string>('GRAFANA_URL') as string; }

    get TOKEN_EXPIRATION() { return this.config.get<number | string>('TOKEN_EXPIRATION') as string; }
    get REFRESH_TOKEN_EXPIRATION() { return this.config.get<number | string>('REFRESH_TOKEN_EXPIRATION') as string; }

    get JWT_SECRET_KEY() { return this.config.get<string>('JWT_SECRET_KEY') as string; }
    get JWT_REFRESH_SECRET_KEY() { return this.config.get<string>('JWT_REFRESH_SECRET_KEY') as string; }

    get AUTH() {
        return {
            GOOGLE: {
                CLIENT_ID: this.config.get<string>('GOOGLE_CLIENT_ID') as string,
                CLIENT_SECRET: this.config.get<string>('GOOGLE_CLIENT_SECRET') as string,
                REDIRECT_URL: this.config.get<string>('GOOGLE_REDIRECT_URI') as string
            }
        };
    }
}
