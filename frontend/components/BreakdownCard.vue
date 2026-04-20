<template>
  <div class="glass-card" :id="id">
    <h3 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Commission Breakdown</h3>

    <div class="space-y-3">
      <!-- Total fee -->
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-brand-graphite/70">Total Fee</span>
        <span class="font-bold text-brand-ink">{{ fmt.currency(breakdown.totalFee) }}</span>
      </div>

      <!-- Agency -->
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-brand-graphite/70">Agency ({{ Math.round(breakdown.agencyRate * 100) }}%)</span>
        <span class="font-semibold text-brand-ink">{{ fmt.currency(breakdown.agencyAmount) }}</span>
      </div>

      <!-- Agent Pool -->
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-brand-graphite/70">Agent Pool</span>
        <span class="font-semibold text-brand-ink">{{ fmt.currency(breakdown.agentPoolAmount) }}</span>
      </div>

      <!-- Each agent -->
      <div v-for="share in breakdown.agents" :key="share.agentId" class="flex justify-between items-center py-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center"
            :class="share.role === 'listing' || share.role === 'both' ? 'bg-brand-pink/10 text-brand-pink' : 'bg-purple-100 text-purple-600'"
          >
            {{ agentInitial(share.agentId) }}
          </span>
          <div>
            <span class="text-sm font-medium text-brand-ink">{{ agentName(share.agentId) }}</span>
            <span class="chip ml-2">{{ share.role }}</span>
          </div>
        </div>
        <span class="font-semibold text-brand-ink">{{ fmt.currency(share.amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Breakdown, Transaction } from '~/types';
import { useFormat } from '~/composables/useFormat';

const props = defineProps<{
  breakdown: Breakdown;
  transaction?: Transaction;
  id?: string;
}>();

const fmt = useFormat();

function agentName(agentId: string): string {
  if (props.transaction?.listingAgent?._id === agentId) return props.transaction.listingAgent.name;
  if (props.transaction?.sellingAgent?._id === agentId) return props.transaction.sellingAgent.name;
  return 'Deleted Agent';
}

function agentInitial(agentId: string): string {
  const name = agentName(agentId);
  return name === 'Deleted Agent' ? '?' : name.charAt(0).toUpperCase();
}
</script>
