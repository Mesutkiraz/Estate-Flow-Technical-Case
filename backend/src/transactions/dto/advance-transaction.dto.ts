import { IsOptional, IsString } from 'class-validator';

export class AdvanceTransactionDto {
  @IsOptional()
  @IsString()
  note?: string;
}
