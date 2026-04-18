import { IsIn, IsOptional, IsString } from 'class-validator';
import { Stage } from '../stage-machine';

export class SetStageDto {
  @IsString()
  @IsIn(['agreement', 'earnest_money', 'title_deed', 'completed'])
  stage: Stage;

  @IsOptional()
  @IsString()
  note?: string;
}
