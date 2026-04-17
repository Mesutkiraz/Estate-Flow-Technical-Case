import { BadRequestException } from '@nestjs/common';
import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(() => {
    service = new CommissionService();
  });

  describe('same agent (listing === selling)', () => {
    it('gives the agent 100 % of the pool', () => {
      const result = service.calculate(10_000, 0.5, 'agent-A', 'agent-A');

      expect(result.totalFee).toBe(10_000);
      expect(result.agencyAmount).toBe(5_000);
      expect(result.agentPoolAmount).toBe(5_000);
      expect(result.agents).toHaveLength(1);
      expect(result.agents[0]).toEqual({
        agentId: 'agent-A',
        role: 'both',
        amount: 5_000,
      });
    });

    it('reconciles agency + agent to totalFee', () => {
      const result = service.calculate(7_777.77, 0.6, 'a1', 'a1');
      const sum = result.agencyAmount + result.agents[0].amount;
      expect(sum).toBeCloseTo(result.totalFee, 2);
    });
  });

  describe('two different agents (25 / 25 split)', () => {
    it('splits the pool 50-50', () => {
      const result = service.calculate(10_000, 0.5, 'agent-A', 'agent-B');

      expect(result.agencyAmount).toBe(5_000);
      expect(result.agentPoolAmount).toBe(5_000);
      expect(result.agents).toHaveLength(2);
      expect(result.agents[0]).toEqual({
        agentId: 'agent-A',
        role: 'listing',
        amount: 2_500,
      });
      expect(result.agents[1]).toEqual({
        agentId: 'agent-B',
        role: 'selling',
        amount: 2_500,
      });
    });

    it('handles an odd-cent pool correctly (rounding goes to listing)', () => {
      const result = service.calculate(100.01, 0.5, 'a1', 'a2');
      const agentSum = result.agents.reduce((s, a) => s + a.amount, 0);
      expect(agentSum).toBeCloseTo(result.agentPoolAmount, 2);
    });
  });

  describe('rounding reconciliation', () => {
    it('reconciles to the cent for 200 random fees (same agent)', () => {
      for (let i = 0; i < 200; i++) {
        const fee = +(Math.random() * 999_999 + 0.01).toFixed(2);
        const rate = +(Math.random() * 0.99 + 0.01).toFixed(4);
        const result = service.calculate(fee, rate, 'x', 'x');

        const total = result.agencyAmount + result.agents[0].amount;
        expect(Math.abs(total - result.totalFee)).toBeLessThanOrEqual(0.01);
      }
    });

    it('reconciles to the cent for 200 random fees (two agents)', () => {
      for (let i = 0; i < 200; i++) {
        const fee = +(Math.random() * 999_999 + 0.01).toFixed(2);
        const rate = +(Math.random() * 0.99 + 0.01).toFixed(4);
        const result = service.calculate(fee, rate, 'a', 'b');

        const agentSum = result.agents.reduce((s, a) => s + a.amount, 0);
        const total = result.agencyAmount + agentSum;
        expect(Math.abs(total - result.totalFee)).toBeLessThanOrEqual(0.01);
      }
    });
  });

  describe('invalid inputs', () => {
    it.each([0, -1, -100])('throws for totalFee = %d', (fee) => {
      expect(() => service.calculate(fee, 0.5, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for NaN totalFee', () => {
      expect(() => service.calculate(NaN, 0.5, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for Infinity totalFee', () => {
      expect(() => service.calculate(Infinity, 0.5, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for negative Infinity totalFee', () => {
      expect(() => service.calculate(-Infinity, 0.5, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for agencyRate > 1', () => {
      expect(() => service.calculate(1000, 1.5, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for agencyRate < 0', () => {
      expect(() => service.calculate(1000, -0.1, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for NaN agencyRate', () => {
      expect(() => service.calculate(1000, NaN, 'a', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for missing listingAgentId', () => {
      expect(() => service.calculate(1000, 0.5, '', 'b')).toThrow(
        BadRequestException,
      );
    });

    it('throws for missing sellingAgentId', () => {
      expect(() => service.calculate(1000, 0.5, 'a', '')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('edge cases', () => {
    it('handles agencyRate = 0 (all to agents)', () => {
      const result = service.calculate(1000, 0, 'a', 'b');
      expect(result.agencyAmount).toBe(0);
      expect(result.agentPoolAmount).toBe(1000);
    });

    it('handles agencyRate = 1 (all to agency)', () => {
      const result = service.calculate(1000, 1, 'a', 'b');
      expect(result.agencyAmount).toBe(1000);
      expect(result.agentPoolAmount).toBe(0);
      expect(result.agents[0].amount).toBe(0);
      expect(result.agents[1].amount).toBe(0);
    });

    it('handles very small fee (0.01)', () => {
      const result = service.calculate(0.01, 0.5, 'a', 'a');
      expect(result.agencyAmount + result.agents[0].amount).toBeCloseTo(0.01, 2);
    });
  });
});
