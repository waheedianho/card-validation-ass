import { describe, it, expect, beforeEach } from 'vitest';
import { CardService } from './service';
import { IsLuhnValidConstraint } from './validators/luhn.validator';
import { detectCardNetwork } from './validators/card-network.util';

// ---------------------------------------------------------------------------
// Luhn Validator
// ---------------------------------------------------------------------------
describe('IsLuhnValidConstraint', () => {
    let constraint: IsLuhnValidConstraint;

    beforeEach(() => {
        constraint = new IsLuhnValidConstraint();
    });

    it('returns true for a valid Visa card number', () => {
        expect(constraint.validate('4532015112830366', {} as any)).toBe(true);
    });

    it('returns true when number contains spaces', () => {
        expect(constraint.validate('4532 0151 1283 0366', {} as any)).toBe(true);
    });

    it('returns true when number contains dashes', () => {
        expect(constraint.validate('4532-0151-1283-0366', {} as any)).toBe(true);
    });

    it('returns false for a number that fails the Luhn check', () => {
        expect(constraint.validate('4532015112830367', {} as any)).toBe(false);
    });

    it('returns false when value is not a string', () => {
        expect(constraint.validate(1234567890123456 as any, {} as any)).toBe(false);
    });

    it('returns false when string contains non-digit characters', () => {
        expect(constraint.validate('4532abcd12830366', {} as any)).toBe(false);
    });

    it('provides a default error message', () => {
        expect(constraint.defaultMessage({} as any)).toBe(
            'cardNo must be a valid card number (Luhn check failed)',
        );
    });
});

// ---------------------------------------------------------------------------
// Card Network Detection
// ---------------------------------------------------------------------------
describe('detectCardNetwork', () => {
    it('detects Visa (16 digits)', () => {
        const result = detectCardNetwork('4532015112830366');
        expect(result.network).toBe('Visa');
        expect(result.isValidLength).toBe(true);
    });

    it('detects Mastercard (51–55 prefix)', () => {
        const result = detectCardNetwork('5425233430109903');
        expect(result.network).toBe('Mastercard');
        expect(result.isValidLength).toBe(true);
    });

    it('detects American Express (15 digits)', () => {
        const result = detectCardNetwork('374251018720950');
        expect(result.network).toBe('American Express');
        expect(result.isValidLength).toBe(true);
    });

    it('detects Discover', () => {
        const result = detectCardNetwork('6011111111111117');
        expect(result.network).toBe('Discover');
        expect(result.isValidLength).toBe(true);
    });

    it('returns Unknown for unrecognised prefix', () => {
        const result = detectCardNetwork('9999999999999999');
        expect(result.network).toBe('Unknown');
        expect(result.isValidLength).toBe(false);
    });

    it('sets isValidLength to false when length does not match the network', () => {
        // Visa prefix but wrong length (only 12 digits)
        const result = detectCardNetwork('453201511283');
        expect(result.network).toBe('Visa');
        expect(result.isValidLength).toBe(false);
    });

    it('strips spaces before detection', () => {
        const result = detectCardNetwork('4532 0151 1283 0366');
        expect(result.network).toBe('Visa');
    });
});

// ---------------------------------------------------------------------------
// CardService
// ---------------------------------------------------------------------------
describe('CardService', () => {
    let service: CardService;

    beforeEach(() => {
        service = new CardService();
    });

    it('returns a valid result for a Visa card', () => {
        const result = service.validateCard({ cardNo: '4532015112830366' });

        expect(result.isValid).toBe(true);
        expect(result.cardNo).toBe('4532015112830366');
        expect(result.network).toBe('Visa');
        expect(result.isValidLength).toBe(true);
    });

    it('masks all but the last 4 digits', () => {
        const result = service.validateCard({ cardNo: '4532015112830366' });
        // 16-digit card → 3 groups of **** + last 4
        expect(result.maskedCardNo).toBe('**** **** **** 0366');
    });

    it('masks a card supplied with spaces (sanitizes before masking)', () => {
        const result = service.validateCard({ cardNo: '4532 0151 1283 0366' });
        expect(result.maskedCardNo).toBe('**** **** **** 0366');
    });

    it('masks a card supplied with dashes', () => {
        const result = service.validateCard({ cardNo: '4532-0151-1283-0366' });
        expect(result.maskedCardNo).toBe('**** **** **** 0366');
    });

    it('returns the original cardNo (unsanitized) in the result', () => {
        const cardNo = '4532 0151 1283 0366';
        const result = service.validateCard({ cardNo });
        expect(result.cardNo).toBe(cardNo);
    });

    it('detects Mastercard network', () => {
        const result = service.validateCard({ cardNo: '5425233430109903' });
        expect(result.network).toBe('Mastercard');
    });

    it('returns Unknown network for unrecognised prefix', () => {
        // Construct a Luhn-valid but unrecognised number (starts with 9)
        // Luhn valid: 9999999999999995
        const result = service.validateCard({ cardNo: '9999999999999995' });
        expect(result.network).toBe('Unknown');
        expect(result.isValidLength).toBe(false);
    });
});
