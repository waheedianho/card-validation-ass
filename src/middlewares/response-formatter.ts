import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ResponseFormat } from '.';


@Injectable()
export class ResponseFormatterMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        res.formatResponse = (status: number, message: string, data?: any): ResponseFormat => {
            return {
                status,
                message,
                data,
            };
        };

        next();
    }
}