import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from './transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AgentsService } from '../agents/agents.service';
import { CommissionService } from '../commission/commission.service';
import { StageMachine, Stage } from './stage-machine';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly txModel: Model<TransactionDocument>,
    private readonly agentsService: AgentsService,
    private readonly commissionService: CommissionService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
    await Promise.all([
      this.agentsService.findOne(dto.listingAgentId),
      this.agentsService.findOne(dto.sellingAgentId),
    ]);

    const breakdown = this.commissionService.calculate(
      dto.serviceFeeAmount,
      0.5,
      dto.listingAgentId,
      dto.sellingAgentId,
    );

    const tx = new this.txModel({
      ...dto,
      stage: 'agreement' as Stage,
      breakdown,
      history: [
        {
          from: null,
          to: 'agreement',
          note: 'Transaction created',
          changedAt: new Date(),
        },
      ],
    });

    return tx.save();
  }

  async findAll(query: QueryTransactionsDto = {}): Promise<TransactionDocument[]> {
    const filter: Record<string, any> = {};
    if (query.stage) filter.stage = query.stage;
    if (query.agentId) {
      filter.$or = [
        { listingAgentId: query.agentId },
        { sellingAgentId: query.agentId },
      ];
    }

    return this.txModel
      .find(filter)
      .populate('listingAgent', 'name email')
      .populate('sellingAgent', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<TransactionDocument> {
    const tx = await this.txModel
      .findById(id)
      .populate('listingAgent', 'name email')
      .populate('sellingAgent', 'name email')
      .exec();

    if (!tx) throw new NotFoundException(`Transaction #${id} not found`);
    return tx;
  }

  async advance(id: string, note = ''): Promise<TransactionDocument> {
    const tx = await this.findOne(id);
    const next = StageMachine.nextStage(tx.stage);

    if (!next) {
      throw new BadRequestException(
        `Transaction is already at terminal stage "${tx.stage}"`,
      );
    }

    return this.transitionTo(tx, next, note);
  }

  async setStage(
    id: string,
    targetStage: Stage,
    note = '',
  ): Promise<TransactionDocument> {
    const tx = await this.findOne(id);

    if (!StageMachine.canTransition(tx.stage, targetStage)) {
      throw new BadRequestException(
        `Cannot transition from "${tx.stage}" to "${targetStage}"`,
      );
    }

    return this.transitionTo(tx, targetStage, note);
  }

  async getBreakdown(id: string) {
    const tx = await this.findOne(id);
    return tx.breakdown;
  }

  async remove(id: string): Promise<void> {
    const result = await this.txModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Transaction #${id} not found`);
  }

  private async transitionTo(
    tx: TransactionDocument,
    target: Stage,
    note: string,
  ): Promise<TransactionDocument> {
    const previousStage = tx.stage;
    tx.stage = target;

    if (target !== 'completed') {
      tx.breakdown = this.commissionService.calculate(
        tx.serviceFeeAmount,
        0.5,
        tx.listingAgentId.toString(),
        tx.sellingAgentId.toString(),
      ) as any;
    }

    tx.history.push({
      from: previousStage,
      to: target,
      note: note || `Stage advanced to ${target}`,
      changedAt: new Date(),
    });

    return tx.save();
  }
}
