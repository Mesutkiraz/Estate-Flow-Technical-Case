export type Stage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed';

export const STAGES: Stage[] = [
  'agreement',
  'earnest_money',
  'title_deed',
  'completed',
];

export const STAGE_LABELS: Record<Stage, string> = {
  agreement: 'Agreement',
  earnest_money: 'Earnest Money',
  title_deed: 'Title Deed',
  completed: 'Completed',
};

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = 'listing' | 'selling' | 'both';

export interface AgentShare {
  agentId: string;
  role: Role;
  amount: number;
}

export interface Breakdown {
  totalFee: number;
  agencyRate: number;
  agencyAmount: number;
  agentPoolAmount: number;
  agents: AgentShare[];
}

export interface Property {
  address: string;
  city: string;
  type: string;
  price: number;
}

export interface HistoryEntry {
  from: Stage | null;
  to: Stage;
  note: string;
  changedAt: string;
}

export interface Transaction {
  _id: string;
  property: Property;
  serviceFeeAmount: number;
  listingAgentId: string;
  sellingAgentId: string;
  listingAgent?: Agent;
  sellingAgent?: Agent;
  stage: Stage;
  breakdown: Breakdown;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

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
