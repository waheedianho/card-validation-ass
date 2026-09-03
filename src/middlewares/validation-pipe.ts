import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Logger } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    constructor(private logger: Logger) { }

    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype as Function)) {
            return value;
        }
        const object = plainToInstance(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            const message = errors[0].constraints ? Object.values(errors[0].constraints)[0] : 'Validation error';
            this.logger.error(message);
            throw new BadRequestException(message);
        }
        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}