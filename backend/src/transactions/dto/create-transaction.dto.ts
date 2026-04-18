import {
  IsString,
  IsNumber,
  IsMongoId,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  type: string;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateTransactionDto {
  @ValidateNested()
  @Type(() => PropertyDto)
  property: PropertyDto;

  @IsNumber()
  @IsPositive()
  serviceFeeAmount: number;

  @IsMongoId()
  listingAgentId: string;

  @IsMongoId()
  sellingAgentId: string;
}
