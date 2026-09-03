import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsLuhnValid', async: false })
export class IsLuhnValidConstraint implements ValidatorConstraintInterface {
    validate(cardNumber: string, _args: ValidationArguments): boolean {
        if (typeof cardNumber !== 'string') return false;

        // Strip spaces and dashes for user-friendly input
        const sanitized = cardNumber.replace(/[\s-]/g, '');

        if (!/^\d+$/.test(sanitized)) return false;

        let sum = 0;
        let shouldDouble = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized[i], 10);

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0;
    }

    defaultMessage(_args: ValidationArguments): string {
        return 'cardNo must be a valid card number (Luhn check failed)';
    }
}

export function IsLuhnValid(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsLuhnValidConstraint,
        });
    };
}
