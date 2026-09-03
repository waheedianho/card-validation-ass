import { Body, Controller, HttpStatus, Post, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { CardDto, CardService } from '../../application/card';

@Controller('card')
export class CardEndpoint {
    constructor(private readonly cardService: CardService) { }

    @Post()
    async checkCard(
        @Res() res: Response,
        @Body() dto: CardDto,
    ): Promise<Response> {
        const result = this.cardService.validateCard(dto);
        return res
            .status(HttpStatus.OK)
            .json(res.formatResponse(HttpStatus.OK, 'Card is valid', result));
    }
}