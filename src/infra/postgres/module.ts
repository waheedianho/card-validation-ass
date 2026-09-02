import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';
import { ISecretsAdapter, SecretsModule } from '../secret';
import { PostgresService } from './service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { name } from '../../../package.json';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: ({ POSTGRES: { POSTGRES_URL }, IS_LOCAL }: ISecretsAdapter): TypeOrmModuleOptions => {
                const conn = new PostgresService().getConnection({ URI: POSTGRES_URL })
                return {
                    ...conn,
                    timeout: 5000,
                    connectTimeout: 5000,
                    logging: false,
                    autoLoadEntities: true,
                    synchronize: IS_LOCAL,
                    migrationsTableName: 'migrations',
                    migrations: [path.join(__dirname, '/migrations/*.{ts,js}')],
                    entities: [path.join(__dirname, '/schemas/*.{ts,js}')],
                    applicationName: name,
                    extra: {
                        connectionTimeoutMillis: 10000,
                        idleTimeoutMillis: 30000,
                        max: 90,
                        min: 10
                    }
                }
            },
            async dataSourceFactory(options) {
                const dataSource = new DataSource(options as DataSourceOptions)
                return dataSource.initialize()
            },
            imports: [SecretsModule],
            inject: [ISecretsAdapter]
        })
    ]
})
export class PostgresDatabaseModule { }
