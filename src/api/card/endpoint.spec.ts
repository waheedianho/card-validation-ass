import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CardEndpoint } from './endpoint';
import { CardService } from '../../application/card/service';
import type { CardValidationResult } from '../../application/card/service';

// Stub the express module so the `import { Response } from 'express'` in
// endpoint.ts doesn't fail at test runtime (we never actually use it).
vi.mock('express', () => ({ Response: class Response {} }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal mock of the Express Response object used by the endpoint. */
function makeMockRes(overrides: object = {}) {
    const res: any = {
        formatResponse: vi.fn((status: number, message: string, data?: any) => ({
            status,
            message,
            data,
        })),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        ...overrides,
    };
    return res;
}

const VALID_VISA_RESULT: CardValidationResult = {
    cardNo: '4532015112830366',
    isValid: true,
    network: 'Visa',
    isValidLength: true,
    maskedCardNo: '**** **** **** 0366',
};

// ---------------------------------------------------------------------------
// CardEndpoint (controller)
// ---------------------------------------------------------------------------
describe('CardEndpoint', () => {
    let endpoint: CardEndpoint;
    let cardService: CardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CardEndpoint],
            providers: [
                {
                    provide: CardService,
                    useValue: {
                        validateCard: vi.fn().mockReturnValue(VALID_VISA_RESULT),
                    },
                },
            ],
        }).compile();

        endpoint = module.get<CardEndpoint>(CardEndpoint);
        cardService = module.get<CardService>(CardService);
    });

    it('is defined', () => {
        expect(endpoint).toBeDefined();
    });

    it('calls cardService.validateCard with the supplied DTO', async () => {
        const dto = { cardNo: '4532015112830366' };
        const res = makeMockRes();

        await endpoint.checkCard(res, dto as any);

        expect(cardService.validateCard).toHaveBeenCalledOnce();
        expect(cardService.validateCard).toHaveBeenCalledWith(dto);
    });

    it('responds with HTTP 200', async () => {
        const dto = { cardNo: '4532015112830366' };
        const res = makeMockRes();

        await endpoint.checkCard(res, dto as any);

        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('sends a formatted JSON response on success', async () => {
        const dto = { cardNo: '4532015112830366' };
        const res = makeMockRes();

        await endpoint.checkCard(res, dto as any);

        expect(res.json).toHaveBeenCalledOnce();
        // formatResponse wraps the payload — verify it was called correctly
        expect(res.formatResponse).toHaveBeenCalledWith(
            HttpStatus.OK,
            'Card is valid',
            VALID_VISA_RESULT,
        );
    });

    it('includes the service result inside the JSON body', async () => {
        const dto = { cardNo: '4532015112830366' };
        const res = makeMockRes();

        await endpoint.checkCard(res, dto as any);

        const jsonPayload = res.json.mock.calls[0][0];
        expect(jsonPayload).toMatchObject({
            status: HttpStatus.OK,
            message: 'Card is valid',
            data: VALID_VISA_RESULT,
        });
    });

    it('propagates whatever CardService returns (Mastercard scenario)', async () => {
        const mastercardResult: CardValidationResult = {
            cardNo: '5425233430109903',
            isValid: true,
            network: 'Mastercard',
            isValidLength: true,
            maskedCardNo: '**** **** **** 9903',
        };
        vi.mocked(cardService.validateCard).mockReturnValueOnce(mastercardResult);

        const dto = { cardNo: '5425233430109903' };
        const res = makeMockRes();

        await endpoint.checkCard(res, dto as any);

        const jsonPayload = res.json.mock.calls[0][0];
        expect(jsonPayload.data.network).toBe('Mastercard');
    });
});
