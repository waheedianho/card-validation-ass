import { Injectable } from '@nestjs/common';
import { CardDto } from './dto';
import { detectCardNetwork, CardNetworkInfo } from './validators/card-network.util';

export interface CardValidationResult {
    cardNo: string;
    isValid: boolean;
    network: CardNetworkInfo['network'];
    isValidLength: boolean;
    maskedCardNo: string;
}

@Injectable()
export class CardService {
    constructor() { }

    validateCard(dto: CardDto): CardValidationResult {
        const sanitized = dto.cardNo.replace(/[\s-]/g, '');
        const { network, isValidLength } = detectCardNetwork(sanitized);

        return {
            cardNo: dto.cardNo,
            isValid: true,
            network,
            isValidLength,
            maskedCardNo: this.maskCardNumber(sanitized),
        };
    }

    private maskCardNumber(sanitized: string): string {
        const last4 = sanitized.slice(-4);
        const groups = Math.ceil((sanitized.length - 4) / 4);
        const masked = Array(groups).fill('****').join(' ');
        return `${masked} ${last4}`;
    }
}