import * as mongoose from 'mongoose';
import { AgentSchema } from '../agents/agent.schema';
import { TransactionSchema } from '../transactions/transaction.schema';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/estate';

async function seed() {
  console.log(`Seed Connecting to ${MONGO_URI.replace(/\/\/.*@/, '//***@')}…`);
  await mongoose.connect(MONGO_URI);

  const Agent = mongoose.model('Agent', AgentSchema);
  const Transaction = mongoose.model('Transaction', TransactionSchema);

  await Agent.deleteMany({});
  await Transaction.deleteMany({});
  console.log('🗑  Cleared agents and transactions collections.');

  const agents = await Agent.insertMany([
    { name: 'Ayşe Yılmaz', email: 'ayse@estateflow.com', phone: '+90 532 111 2233' },
    { name: 'Mehmet Kaya', email: 'mehmet@estateflow.com', phone: '+90 533 444 5566' },
    { name: 'Elif Demir', email: 'elif@estateflow.com', phone: '+90 534 777 8899' },
  ]);
  console.log(`✅ Inserted ${agents.length} agents.`);

  const [ayse, mehmet, elif] = agents;

  function breakdown(
    fee: number,
    listingId: mongoose.Types.ObjectId,
    sellingId: mongoose.Types.ObjectId,
  ) {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const agencyAmount = round2(fee * 0.5);
    const agentPool = round2(fee - agencyAmount);

    const isSameAgent = listingId.equals(sellingId);
    const agentsList = isSameAgent
      ? [{ agentId: listingId, role: 'both' as const, amount: agentPool }]
      : [
        { agentId: listingId, role: 'listing' as const, amount: round2(agentPool * 0.5) },
        {
          agentId: sellingId,
          role: 'selling' as const,
          amount: round2(agentPool - round2(agentPool * 0.5)),
        },
      ];

    return {
      totalFee: fee,
      agencyRate: 0.5,
      agencyAmount,
      agentPoolAmount: agentPool,
      agents: agentsList,
    };
  }

  const txData = [
    {
      property: { address: 'Bağdat Cad. No:42', city: 'Istanbul', type: 'Apartment', price: 350_000 },
      serviceFeeAmount: 10_500,
      listingAgentId: ayse._id,
      sellingAgentId: mehmet._id,
      stage: 'agreement',
      breakdown: breakdown(10_500, ayse._id, mehmet._id),
      history: [{ from: null, to: 'agreement', note: 'Transaction created', changedAt: new Date() }],
    },
    {
      property: { address: 'Atatürk Blv. No:18', city: 'Ankara', type: 'Villa', price: 720_000 },
      serviceFeeAmount: 21_600,
      listingAgentId: mehmet._id,
      sellingAgentId: elif._id,
      stage: 'earnest_money',
      breakdown: breakdown(21_600, mehmet._id, elif._id),
      history: [
        { from: null, to: 'agreement', note: 'Transaction created', changedAt: new Date(Date.now() - 86400000 * 3) },
        { from: 'agreement', to: 'earnest_money', note: 'Earnest money deposited', changedAt: new Date(Date.now() - 86400000) },
      ],
    },
    {
      property: { address: 'Kordon No:7', city: 'Izmir', type: 'Commercial', price: 1_200_000 },
      serviceFeeAmount: 36_000,
      listingAgentId: elif._id,
      sellingAgentId: elif._id,
      stage: 'title_deed',
      breakdown: breakdown(36_000, elif._id, elif._id),
      history: [
        { from: null, to: 'agreement', note: 'Transaction created', changedAt: new Date(Date.now() - 86400000 * 7) },
        { from: 'agreement', to: 'earnest_money', note: 'Earnest money deposited', changedAt: new Date(Date.now() - 86400000 * 5) },
        { from: 'earnest_money', to: 'title_deed', note: 'Title deed transferred', changedAt: new Date(Date.now() - 86400000 * 2) },
      ],
    },
    {
      property: { address: 'Marina Mah. D:14', city: 'Antalya', type: 'Apartment', price: 280_000 },
      serviceFeeAmount: 8_400,
      listingAgentId: ayse._id,
      sellingAgentId: elif._id,
      stage: 'completed',
      breakdown: breakdown(8_400, ayse._id, elif._id),
      history: [
        { from: null, to: 'agreement', note: 'Transaction created', changedAt: new Date(Date.now() - 86400000 * 14) },
        { from: 'agreement', to: 'earnest_money', note: 'Earnest money deposited', changedAt: new Date(Date.now() - 86400000 * 10) },
        { from: 'earnest_money', to: 'title_deed', note: 'Title deed transferred', changedAt: new Date(Date.now() - 86400000 * 6) },
        { from: 'title_deed', to: 'completed', note: 'Transaction completed', changedAt: new Date(Date.now() - 86400000 * 1) },
      ],
    },
    {
      property: { address: 'Sahil Yolu No:3', city: 'Bodrum', type: 'Villa', price: 666_660 },
      serviceFeeAmount: 333.33,
      listingAgentId: mehmet._id,
      sellingAgentId: ayse._id,
      stage: 'completed',
      breakdown: breakdown(333.33, mehmet._id, ayse._id),
      history: [
        { from: null, to: 'agreement', note: 'Transaction created', changedAt: new Date(Date.now() - 86400000 * 20) },
        { from: 'agreement', to: 'earnest_money', note: 'Earnest money deposited', changedAt: new Date(Date.now() - 86400000 * 15) },
        { from: 'earnest_money', to: 'title_deed', note: 'Title deed transferred', changedAt: new Date(Date.now() - 86400000 * 9) },
        { from: 'title_deed', to: 'completed', note: 'Transaction completed — residual cent test', changedAt: new Date(Date.now() - 86400000 * 3) },
      ],
    },
  ];

  const txs = await Transaction.insertMany(txData);
  console.log(`✅ Inserted ${txs.length} transactions across all stages.`);

  await mongoose.disconnect();
  console.log('🏁 Seed complete. Disconnected.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
