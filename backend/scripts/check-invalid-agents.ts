import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  listingAgentId: mongoose.Schema.Types.ObjectId,
  sellingAgentId: mongoose.Schema.Types.ObjectId,
  property: { address: String }
});

const AgentSchema = new mongoose.Schema({
  name: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
const Agent = mongoose.model('Agent', AgentSchema);

async function check() {
  await mongoose.connect('mongodb://localhost:27017/estate-flow');

  const transactions = await Transaction.find();
  const agents = await Agent.find();
  const agentIds = new Set(agents.map(a => a._id.toString()));

  console.log('--- Transactions with Invalid Agents ---');
  for (const tx of transactions) {
    const listingInvalid = !agentIds.has(tx.listingAgentId?.toString());
    const sellingInvalid = !agentIds.has(tx.sellingAgentId?.toString());

    if (listingInvalid || sellingInvalid) {
      console.log(`Transaction: ${tx.property?.address} (${tx._id})`);
      if (listingInvalid) console.log(`  Invalid Listing Agent ID: ${tx.listingAgentId}`);
      if (sellingInvalid) console.log(`  Invalid Selling Agent ID: ${tx.sellingAgentId}`);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
