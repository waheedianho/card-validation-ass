import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: Logger
    ) { }

    catch(exception: unknown, host: ArgumentsHost) {
        this.logger.error(exception)
        const ctx = host.switchToHttp();


        const { httpAdapter } = this.httpAdapterHost;
        const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: exception instanceof Error ? exception.message : exception,
        }

        httpAdapter.reply(ctx.getResponse<Response>(), responseBody, httpStatus);
    }
}