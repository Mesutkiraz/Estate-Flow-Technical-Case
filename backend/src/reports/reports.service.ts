import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/transaction.schema';

export interface StageSummary {
  stage: string;
  count: number;
}

export interface AgentEarning {
  agentId: string;
  total: number;
}

export interface SummaryReport {
  totalTransactions: number;
  byStage: StageSummary[];
  completedCount: number;
  totalServiceFees: number;
  totalAgencyEarnings: number;
  totalAgentPoolEarnings: number;
  agentEarnings: AgentEarning[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly txModel: Model<TransactionDocument>,
  ) {}

  async getSummary(): Promise<SummaryReport> {
    const byStageAgg: StageSummary[] = await this.txModel.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $project: { _id: 0, stage: '$_id', count: 1 } },
      { $sort: { stage: 1 } },
    ]);

    const completed = await this.txModel
      .find({ stage: 'completed' })
      .lean()
      .exec();

    let totalServiceFees = 0;
    let totalAgencyEarnings = 0;
    let totalAgentPoolEarnings = 0;
    const agentMap = new Map<string, number>();

    for (const tx of completed) {
      totalServiceFees += tx.serviceFeeAmount;
      if (tx.breakdown) {
        totalAgencyEarnings += tx.breakdown.agencyAmount || 0;
        totalAgentPoolEarnings += tx.breakdown.agentPoolAmount || 0;
        if (Array.isArray(tx.breakdown.agents)) {
          for (const share of tx.breakdown.agents) {
            const aid = share.agentId.toString();
            agentMap.set(aid, (agentMap.get(aid) || 0) + share.amount);
          }
        }
      }
    }

    const agentEarnings: AgentEarning[] = Array.from(agentMap.entries()).map(
      ([agentId, total]) => ({ agentId, total: Math.round(total * 100) / 100 }),
    );

    const totalTransactions = byStageAgg.reduce((s, g) => s + g.count, 0);

    return {
      totalTransactions,
      byStage: byStageAgg,
      completedCount: completed.length,
      totalServiceFees: Math.round(totalServiceFees * 100) / 100,
      totalAgencyEarnings: Math.round(totalAgencyEarnings * 100) / 100,
      totalAgentPoolEarnings: Math.round(totalAgentPoolEarnings * 100) / 100,
      agentEarnings,
    };
  }
}
