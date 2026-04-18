import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AdvanceTransactionDto } from './dto/advance-transaction.dto';
import { SetStageDto } from './dto/set-stage.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  findAll(@Query() query: QueryTransactionsDto) {
    return this.txService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.txService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTransactionDto) {
    return this.txService.create(dto);
  }

  @Patch(':id/advance')
  advance(
    @Param('id') id: string,
    @Body() dto: AdvanceTransactionDto,
  ) {
    return this.txService.advance(id, dto.note);
  }

  @Patch(':id/stage')
  setStage(
    @Param('id') id: string,
    @Body() dto: SetStageDto,
  ) {
    return this.txService.setStage(id, dto.stage, dto.note);
  }

  @Get(':id/breakdown')
  getBreakdown(@Param('id') id: string) {
    return this.txService.getBreakdown(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.txService.remove(id);
  }
}
