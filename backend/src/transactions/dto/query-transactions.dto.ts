import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryTransactionsDto {
  @IsOptional()
  @IsString()
  @IsIn(['agreement', 'earnest_money', 'title_deed', 'completed'])
  stage?: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}
