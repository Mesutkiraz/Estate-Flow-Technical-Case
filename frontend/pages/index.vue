<template>
  <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
    
    <!-- Hero Panel (Day 1 - High Drama) -->
    <div class="relative bg-brand-ink rounded-[32px] overflow-hidden p-10 lg:p-24 flex flex-col items-center justify-center text-center shadow-[0_30px_60px_-15px_rgba(11,11,15,0.4)] border border-brand-graphite/10">
      
      <!-- Fading Perspective Grid -->
      <div class="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)] pointer-events-none"></div>
      
      <!-- Dual Aurora Glow -->
      <div class="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FF2D87]/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div class="absolute -bottom-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-pink/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <!-- Copy -->
      <div class="relative z-10 w-full max-w-3xl flex flex-col items-center text-white" v-motion-fade-visible>
        <span class="inline-block px-4 py-1.5 bg-brand-pinkSoft/10 text-brand-pinkSoft border border-brand-pinkSoft/20 rounded-full text-[11px] font-extrabold uppercase tracking-[0.2em] mb-8 shadow-[0_0_15px_rgba(255,45,135,0.2)]">
          Transaction OS
        </span>
        <h1 class="text-5xl lg:text-[72px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-6 text-white drop-shadow-lg flex items-center justify-center gap-3">
          <span class="text-brand-ink bg-brand-pink px-4 pt-1 pb-2 rounded-2xl drop-shadow-[0_0_15px_rgba(255,45,135,0.5)] text-[48px] lg:text-[56px] leading-[1] tracking-tighter self-center">EF</span>
          <span>Estate<span class="text-brand-pink drop-shadow-[0_0_20px_rgba(255,45,135,0.4)]">Flow</span></span>
        </h1>
        <p class="text-white/60 text-lg lg:text-xl mb-12 font-medium leading-relaxed max-w-xl mx-auto">
          Seamlessly track property closures, distribute commissions, and manage lifecycle stages with zero friction.
        </p>
        
        <!-- Glassmorphic Stat & Action Pill -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-2 p-4 sm:px-10 rounded-[2rem] sm:rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
            <!-- Stat 1 -->
            <div class="text-center sm:text-left">
              <div class="text-white/40 text-[10px] font-extrabold uppercase tracking-widest mb-1">Global Pipeline</div>
              <div class="text-white/90 text-2xl font-extrabold tracking-tight">{{ summary?.totalTransactions || 0 }} <span class="text-white/30 text-lg font-medium tracking-normal">deals</span></div>
            </div>
            <!-- Divider -->
            <div class="hidden sm:block w-px h-10 bg-white/10"></div>
            <!-- Stat 2 -->
            <div class="text-center sm:text-left">
              <div class="text-white/40 text-[10px] font-extrabold uppercase tracking-widest mb-1">Total Earnings</div>
              <div class="text-brand-pinkSoft text-2xl font-extrabold tracking-tight">{{ fmt.currency(summary?.totalAgencyEarnings || 0) }}</div>
            </div>
            <!-- Divider -->
            <div class="hidden sm:block w-px h-10 bg-white/10"></div>
            <!-- Actions -->
            <div class="flex gap-4">
              <NuxtLink to="/transactions/new" class="btn-primary px-6 py-3.5 text-sm font-bold tracking-wide !bg-brand-pink hover:!bg-brand-pinkDeep shadow-[0_8px_25px_-8px_rgba(255,45,135,0.8)] hover:scale-105 active:scale-95 transition-all">
                Initialize
              </NuxtLink>
              <NuxtLink to="/transactions" class="btn-secondary !bg-white/5 border border-white/20 !text-white hover:!bg-white/15 px-6 py-3.5 text-sm font-bold tracking-wide hover:scale-105 active:scale-95 transition-all">
                Overview
              </NuxtLink>
            </div>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="reportsStore.loading || txStore.loading || agentsStore.loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton v-for="i in 4" :key="i" variant="card" height="120px" />
      </div>
      <Skeleton variant="card" height="400px" />
    </template>

    <template v-else>
      <!-- KPI Cards (Day 4 spec) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          id="kpi-total-transactions"
          label="Total transactions"
          :value="summary?.totalTransactions || 0"
          :animate="true"
          subtitle="All stages"
        />
        <KpiCard
          id="kpi-in-progress"
          label="In progress"
          :value="inProgressCount"
          :animate="true"
        />
        <KpiCard
          id="kpi-completed"
          label="Completed"
          :value="summary?.completedCount || 0"
          :animate="true"
          :subtitle="completedPercent + '% of total'"
        />
        <KpiCard
          id="kpi-agency-earnings"
          label="Agency earnings"
          :value="summary?.totalAgencyEarnings || 0"
          prefix="$"
          :animate="true"
        />
      </div>

      <!-- KANBAN PIPELINE -->
      <div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          <div
            v-for="col in pipelineCols"
            :key="col.stage"
            class="flex flex-col gap-5 p-4 rounded-2xl bg-brand-mist/30 border border-brand-graphite/5"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between px-1">
              <h3 class="font-bold text-brand-ink uppercase text-[11px] tracking-widest">{{ col.label }}</h3>
              <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full" :class="col.badgeClass">
                {{ col.count }}
              </span>
            </div>
            <!-- Column Cards -->
            <div class="flex flex-col gap-4">
              <TransactionCard v-for="tx in col.txs" :key="tx._id" :tx="tx" class="!shadow-sm hover:!shadow-md bg-white" />
              <div v-if="col.txs.length === 0" class="text-center py-6 border-2 border-dashed border-brand-graphite/10 rounded-xl">
                 <p class="text-xs font-semibold text-brand-graphite/40 uppercase tracking-widest">Empty</p>
              </div>
            </div>
            <!-- View All Link -->
            <div class="text-center mt-1">
              <NuxtLink :to="`/transactions?stage=${col.stage}`" class="text-brand-pinkDeep text-xs font-bold hover:underline transition-colors">
                View all &rarr;
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Layout: Table + Top Agents -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Recent Transactions Table (2/3 width) -->
        <div class="lg:col-span-2 glass-card overflow-hidden !p-0 self-start">
          <div class="p-6 border-b border-brand-graphite/5 flex justify-between items-center bg-white z-10">
            <h2 class="text-lg font-bold text-brand-ink">Recent transactions</h2>
            <NuxtLink to="/transactions" class="text-brand-pinkDeep text-xs font-bold hover:underline transition-colors">View All &rarr;</NuxtLink>
          </div>
          
          <div v-if="recentTx.length === 0" class="p-12 text-center text-brand-graphite/40">
            No transactions found in the database.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead class="bg-brand-mist/40">
                <tr class="text-[10px] text-brand-graphite/50 uppercase tracking-widest border-b border-brand-graphite/10">
                  <th class="px-6 py-4 font-semibold w-1/3">Property</th>
                  <th class="px-6 py-4 font-semibold">Stage</th>
                  <th class="px-6 py-4 font-semibold">Service Fee</th>
                  <th class="px-6 py-4 font-semibold">Agents</th>
                  <th class="px-6 py-4 font-semibold text-right">Updated</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-graphite/5 bg-white">
                <tr
                  v-for="tx in recentTx"
                  :key="tx._id"
                  class="hover:bg-brand-pinkSoft/10 transition-colors cursor-pointer group"
                  @click="router.push(`/transactions/${tx._id}`)"
                >
                  <td class="px-6 py-4">
                    <div class="font-semibold text-brand-ink text-sm group-hover:text-brand-pinkDeep transition-colors truncate max-w-[200px]">{{ tx.property.address }}</div>
                    <div class="text-[11px] text-brand-graphite/50 mt-0.5 truncate">{{ tx.property.city }} &middot; {{ tx.property.type }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <StageBadge :stage="tx.stage" />
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-extrabold text-brand-ink/90 text-sm tracking-tight">{{ fmt.currency(tx.serviceFeeAmount) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex -space-x-2">
                      <div class="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold"
                           :class="tx.listingAgent ? 'bg-brand-pinkSoft text-brand-pinkDeep z-10' : 'bg-brand-mist text-brand-graphite/40 z-10'">
                        {{ tx.listingAgent?.name?.slice(0, 2).toUpperCase() || '?' }}
                      </div>
                      <div v-if="tx.sellingAgent && tx.sellingAgent?._id !== tx.listingAgent?._id"
                           class="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-brand-mist text-brand-ink z-0 flex items-center justify-center text-[10px] font-bold">
                        {{ tx.sellingAgent?.name?.slice(0, 2).toUpperCase() || '?' }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-[11px] text-brand-graphite/40 font-mono">{{ fmt.date(tx.updatedAt) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Earning Agents (1/3 width) -->
        <div class="lg:col-span-1 glass-card self-start sticky top-24">
          <h2 class="text-lg font-bold text-brand-ink mb-6">Top earning agents</h2>
          <div v-if="topAgents.length === 0" class="text-center py-8 text-sm text-brand-graphite/40">
            No agents have recorded earnings yet.
          </div>
          <div v-else class="space-y-1">
            <div v-for="(agent, i) in topAgents" :key="agent.agentId" class="flex items-center gap-4 p-3 hover:bg-brand-mist/50 rounded-xl transition-colors">
              <div class="font-extrabold text-brand-graphite/30 w-4 text-center text-xs">{{ i + 1 }}</div>
              <div class="w-10 h-10 rounded-full bg-brand-pinkSoft text-brand-pinkDeep font-bold flex items-center justify-center border-2 border-white shadow-sm text-xs tracking-wider">
                {{ agent.initials }}
              </div>
              <div class="flex-1 font-semibold text-brand-ink text-sm truncate">{{ agent.name }}</div>
              <div class="font-extrabold text-brand-pinkDeep tracking-tight text-sm">{{ fmt.currency(agent.total) }}</div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useReportsStore } from '~/stores/reports';
import { useTransactionsStore } from '~/stores/transactions';
import { useAgentsStore } from '~/stores/agents';
import { useFormat } from '~/composables/useFormat';
import { STAGES, STAGE_LABELS } from '~/types';

useHead({ title: 'Dashboard' });

const router = useRouter();
const reportsStore = useReportsStore();
const txStore = useTransactionsStore();
const agentsStore = useAgentsStore();
const fmt = useFormat();

onMounted(async () => {
  await Promise.all([
    reportsStore.fetchSummary(),
    txStore.fetchAll(),
    agentsStore.fetchAll(),
  ]);
});

const summary = computed(() => reportsStore.summary);

const inProgressCount = computed(() => {
  if (!summary.value) return 0;
  return summary.value.totalTransactions - summary.value.completedCount;
});
const completedPercent = computed(() => {
  if (!summary.value || summary.value.totalTransactions === 0) return 0;
  return Math.round((summary.value.completedCount / summary.value.totalTransactions) * 100);
});

const pipelineCols = computed(() => {
  return STAGES.map((stage) => {
    const txsForStage = txStore.byStage(stage);
    let badgeClass = '';
    
    if (stage === 'agreement') badgeClass = 'bg-white text-brand-ink/70 border border-brand-graphite/10 shadow-sm';
    else if (stage === 'earnest_money') badgeClass = 'bg-brand-pinkSoft text-brand-pinkDeep shadow-sm';
    else if (stage === 'title_deed') badgeClass = 'bg-brand-pinkSoft text-brand-pinkDeep border border-brand-pink/20 shadow-sm';
    else if (stage === 'completed') badgeClass = 'bg-brand-ink text-white shadow-sm';

    return {
      stage,
      label: STAGE_LABELS[stage],
      badgeClass,
      count: txsForStage.length,
      txs: txsForStage.slice(0, 3) 
    };
  });
});

const topAgents = computed(() => {
  if (!summary.value || agentsStore.agents.length === 0) return [];
  
  return [...summary.value.agentEarnings]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((ae) => {
      const agent = agentsStore.agents.find(a => a._id === ae.agentId);
      const name = agent?.name || 'Unknown Agent';
      const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?';
      return { ...ae, name, initials };
    });
});

const recentTx = computed(() => txStore.transactions.slice(0, 5));
</script>
