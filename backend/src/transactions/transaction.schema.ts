import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { Stage } from './stage-machine';

@Schema({ _id: false })
export class Property {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Number, required: true })
  price: number;
}
export const PropertySchema = SchemaFactory.createForClass(Property);

@Schema({ _id: false })
export class AgentShare {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent' })
  agentId: Types.ObjectId;

  @Prop({ type: String, enum: ['listing', 'selling', 'both'] })
  role: 'listing' | 'selling' | 'both';

  @Prop({ type: Number })
  amount: number;
}
export const AgentShareSchema = SchemaFactory.createForClass(AgentShare);

@Schema({ _id: false })
export class Breakdown {
  @Prop({ type: Number })
  totalFee: number;

  @Prop({ type: Number })
  agencyRate: number;

  @Prop({ type: Number })
  agencyAmount: number;

  @Prop({ type: Number })
  agentPoolAmount: number;

  @Prop({ type: [AgentShareSchema], default: [] })
  agents: AgentShare[];
}
export const BreakdownSchema = SchemaFactory.createForClass(Breakdown);

@Schema({ _id: false })
export class HistoryEntry {
  @Prop({ type: String, default: null })
  from: Stage | null;

  @Prop({ type: String, required: true })
  to: Stage;

  @Prop({ type: String, default: '' })
  note: string;

  @Prop({ type: Date, default: () => new Date() })
  changedAt: Date;
}
export const HistoryEntrySchema = SchemaFactory.createForClass(HistoryEntry);

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: PropertySchema, required: true })
  property: Property;

  @Prop({ required: true })
  serviceFeeAmount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  listingAgentId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  sellingAgentId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed'],
    default: 'agreement',
  })
  stage: Stage;

  @Prop({ type: BreakdownSchema })
  breakdown: Breakdown;

  @Prop({ type: [HistoryEntrySchema], default: [] })
  history: HistoryEntry[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.virtual('listingAgent', {
  ref: 'Agent',
  localField: 'listingAgentId',
  foreignField: '_id',
  justOne: true,
});

TransactionSchema.virtual('sellingAgent', {
  ref: 'Agent',
  localField: 'sellingAgentId',
  foreignField: '_id',
  justOne: true,
});

TransactionSchema.set('toJSON', { virtuals: true });
TransactionSchema.set('toObject', { virtuals: true });

