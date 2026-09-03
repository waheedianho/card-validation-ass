import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { IsLuhnValid } from './validators/luhn.validator';
import { ApiProperty } from '@nestjs/swagger';


export class CardDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'cardNo must not be empty' })
    @IsString({ message: 'cardNo must be a string' })
    @Matches(/^[\d\s-]+$/, {
        message: 'cardNo must contain only digits, spaces, or dashes',
    })
    @Length(13, 23, {
        message: 'cardNo must be between 13 and 19 digits (spaces/dashes allowed)',
    })
    @IsLuhnValid()
    cardNo: string;
}