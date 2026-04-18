import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Stage } from './stage-machine';

function makeFakeDoc(data: any) {
  const doc = {
    ...data,
    _id: data._id || 'tx-' + Math.random().toString(36).slice(2, 8),
    save: jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve(this);
    }),
    toJSON: () => ({ ...doc }),
  };
  if (!doc.history) doc.history = [];
  return doc;
}

function createFakeModel(store: any[] = []) {
  const model: any = jest.fn().mockImplementation((data: any) => {
    const doc = makeFakeDoc(data);
    store.push(doc);
    return doc;
  });

  model.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(store),
  });

  model.findById = jest.fn().mockImplementation((id: string) => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(store.find((d) => d._id === id) || null),
  }));

  model.findByIdAndDelete = jest.fn().mockImplementation((id: string) => ({
    exec: jest.fn().mockResolvedValue(store.find((d) => d._id === id) || null),
  }));

  model.aggregate = jest.fn().mockResolvedValue([]);

  return model;
}

const fakeAgentsService = {
  findOne: jest.fn().mockImplementation((id: string) => {
    if (id === 'missing-agent') {
      return Promise.reject(new NotFoundException(`Agent #${id} not found`));
    }
    return Promise.resolve({ _id: id, name: 'Test', email: 'test@test.com' });
  }),
};

const fakeCommissionService = {
  calculate: jest.fn().mockImplementation((fee, rate, lid, sid) => ({
    totalFee: fee,
    agencyRate: rate,
    agencyAmount: fee * rate,
    agentPoolAmount: fee * (1 - rate),
    agents:
      lid === sid
        ? [{ agentId: lid, role: 'both', amount: fee * (1 - rate) }]
        : [
            { agentId: lid, role: 'listing', amount: (fee * (1 - rate)) / 2 },
            { agentId: sid, role: 'selling', amount: (fee * (1 - rate)) / 2 },
          ],
  })),
};

describe('TransactionsService', () => {
  let service: TransactionsService;
  let store: any[];
  let model: any;

  beforeEach(() => {
    store = [];
    model = createFakeModel(store);
    jest.clearAllMocks();

    service = new TransactionsService(
      model as any,
      fakeAgentsService as any,
      fakeCommissionService as any,
    );
  });

  describe('create', () => {
    const dto = {
      property: { address: '123 Main', city: 'Istanbul', type: 'Apartment', price: 1_000_000 },
      serviceFeeAmount: 50_000,
      listingAgentId: 'agent-1',
      sellingAgentId: 'agent-2',
    };

    it('creates a transaction with stage=agreement', async () => {
      const result = await service.create(dto);
      expect(result.stage).toBe('agreement');
      expect(result.history).toHaveLength(1);
      expect(result.history[0].to).toBe('agreement');
      expect(result.save).toHaveBeenCalled();
    });

    it('validates both agents exist', async () => {
      await service.create(dto);
      expect(fakeAgentsService.findOne).toHaveBeenCalledWith('agent-1');
      expect(fakeAgentsService.findOne).toHaveBeenCalledWith('agent-2');
    });

    it('computes breakdown via CommissionService', async () => {
      await service.create(dto);
      expect(fakeCommissionService.calculate).toHaveBeenCalledWith(
        50_000,
        0.5,
        'agent-1',
        'agent-2',
      );
    });

    it('rejects if listing agent does not exist', async () => {
      await expect(
        service.create({ ...dto, listingAgentId: 'missing-agent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects if selling agent does not exist', async () => {
      await expect(
        service.create({ ...dto, sellingAgentId: 'missing-agent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for an unknown id', async () => {
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the document if it exists', async () => {
      store.push(makeFakeDoc({ _id: 'tx-abc', stage: 'agreement', history: [] }));
      const tx = await service.findOne('tx-abc');
      expect(tx._id).toBe('tx-abc');
    });
  });

  describe('advance', () => {
    it('moves agreement → earnest_money', async () => {
      store.push(
        makeFakeDoc({
          _id: 'tx-1',
          stage: 'agreement' as Stage,
          serviceFeeAmount: 10000,
          listingAgentId: 'a1',
          sellingAgentId: 'a2',
          history: [],
        }),
      );
      const tx = await service.advance('tx-1', 'Test advance');
      expect(tx.stage).toBe('earnest_money');
      expect(tx.history).toHaveLength(1);
    });

    it('moves earnest_money → title_deed', async () => {
      store.push(
        makeFakeDoc({
          _id: 'tx-2',
          stage: 'earnest_money' as Stage,
          serviceFeeAmount: 10000,
          listingAgentId: 'a1',
          sellingAgentId: 'a2',
          history: [],
        }),
      );
      const tx = await service.advance('tx-2');
      expect(tx.stage).toBe('title_deed');
    });

    it('moves title_deed → completed', async () => {
      store.push(
        makeFakeDoc({
          _id: 'tx-3',
          stage: 'title_deed' as Stage,
          serviceFeeAmount: 10000,
          listingAgentId: 'a1',
          sellingAgentId: 'a2',
          history: [],
        }),
      );
      const tx = await service.advance('tx-3');
      expect(tx.stage).toBe('completed');
    });

    it('rejects advance from terminal stage (completed)', async () => {
      store.push(
        makeFakeDoc({ _id: 'tx-4', stage: 'completed' as Stage, history: [] }),
      );
      await expect(service.advance('tx-4')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setStage', () => {
    it('allows a valid forward transition', async () => {
      store.push(
        makeFakeDoc({
          _id: 'tx-5',
          stage: 'agreement' as Stage,
          serviceFeeAmount: 10000,
          listingAgentId: 'a1',
          sellingAgentId: 'a2',
          history: [],
        }),
      );
      const tx = await service.setStage('tx-5', 'earnest_money', 'manual');
      expect(tx.stage).toBe('earnest_money');
    });

    it('rejects skip: agreement → title_deed', async () => {
      store.push(
        makeFakeDoc({ _id: 'tx-6', stage: 'agreement' as Stage, history: [] }),
      );
      await expect(
        service.setStage('tx-6', 'title_deed'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects backward: earnest_money → agreement', async () => {
      store.push(
        makeFakeDoc({
          _id: 'tx-7',
          stage: 'earnest_money' as Stage,
          history: [],
        }),
      );
      await expect(
        service.setStage('tx-7', 'agreement'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException for unknown id', async () => {
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });

    it('deletes an existing transaction', async () => {
      store.push(makeFakeDoc({ _id: 'tx-del', stage: 'agreement', history: [] }));
      await expect(service.remove('tx-del')).resolves.toBeUndefined();
    });
  });
});
