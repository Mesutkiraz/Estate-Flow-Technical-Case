import { Injectable, BadRequestException } from '@nestjs/common';

export interface AgentCommission {
  agentId: string;
  role: 'listing' | 'selling' | 'both';
  amount: number;
}

export interface CommissionBreakdown {
  totalFee: number;
  agencyRate: number;
  agencyAmount: number;
  agentPoolAmount: number;
  agents: AgentCommission[];
}

@Injectable()
export class CommissionService {
  calculate(
    totalFee: number,
    agencyRate: number,
    listingAgentId: string,
    sellingAgentId: string,
  ): CommissionBreakdown {
    this.assertPositiveFinite(totalFee, 'totalFee');
    if (
      !Number.isFinite(agencyRate) ||
      agencyRate < 0 ||
      agencyRate > 1
    ) {
      throw new BadRequestException(
        'agencyRate must be a finite number between 0 and 1',
      );
    }
    if (!listingAgentId || !sellingAgentId) {
      throw new BadRequestException(
        'Both listingAgentId and sellingAgentId are required',
      );
    }

    const agencyAmount = this.round2(totalFee * agencyRate);
    const agentPoolAmount = this.round2(totalFee - agencyAmount);

    const agents: AgentCommission[] = [];

    if (listingAgentId === sellingAgentId) {
      agents.push({
        agentId: listingAgentId,
        role: 'both',
        amount: agentPoolAmount,
      });
    } else {
      const listingAmount = this.round2(agentPoolAmount * 0.5);
      const sellingAmount = this.round2(agentPoolAmount - listingAmount);

      agents.push({
        agentId: listingAgentId,
        role: 'listing',
        amount: listingAmount,
      });
      agents.push({
        agentId: sellingAgentId,
        role: 'selling',
        amount: sellingAmount,
      });
    }

    return {
      totalFee,
      agencyRate,
      agencyAmount,
      agentPoolAmount,
      agents,
    };
  }

  private round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private assertPositiveFinite(value: number, label: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new BadRequestException(
        `${label} must be a positive finite number, got ${value}`,
      );
    }
  }
}
