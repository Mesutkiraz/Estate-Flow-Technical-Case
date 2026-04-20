<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-brand-ink tracking-tight">Transactions</h1>
        <p class="mt-1 text-brand-graphite/50">Manage all property transactions</p>
      </div>
      <NuxtLink to="/transactions/new" class="btn-primary" id="new-transaction-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Transaction
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6 flex-wrap" id="transaction-filters">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        @click="activeFilter = opt.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
        :class="activeFilter === opt.value
          ? 'bg-brand-pink text-white shadow-pink'
          : 'bg-white text-brand-graphite/60 border border-gray-200 hover:border-brand-pink/30 hover:text-brand-pink'"
      >
        {{ opt.label }}
        <span v-if="opt.count !== undefined" class="ml-1 opacity-60">({{ opt.count }})</span>
      </button>
    </div>

    <!-- Loading -->
    <template v-if="txStore.loading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton v-for="i in 6" :key="i" variant="card" height="200px" />
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="filteredTransactions.length === 0">
      <div class="glass-card text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-brand-pink/10 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-brand-ink mb-1">No transactions found</h3>
        <p class="text-brand-graphite/40 mb-4">{{ activeFilter === '' ? 'Create your first transaction to get started' : 'No transactions match this filter' }}</p>
        <NuxtLink to="/transactions/new" class="btn-primary inline-flex">Create Transaction</NuxtLink>
      </div>
    </template>

    <!-- Grid -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TransactionCard
          v-for="tx in filteredTransactions"
          :key="tx._id"
          :tx="tx"
          class="animate-fade-in-up"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionsStore } from '~/stores/transactions';
import { STAGES, STAGE_LABELS } from '~/types';
import type { Stage } from '~/types';

useHead({ title: 'Transactions' });

const route = useRoute();
const txStore = useTransactionsStore();
const queryStage = route.query.stage as string;
const activeFilter = ref(STAGES.includes(queryStage as any) ? queryStage : '');

onMounted(() => txStore.fetchAll());

const filteredTransactions = computed(() => {
  if (!activeFilter.value) return txStore.transactions;
  return txStore.transactions.filter((t) => t.stage === activeFilter.value);
});

const filterOptions = computed(() => [
  { label: 'All', value: '', count: txStore.transactions.length },
  ...STAGES.map((stage) => ({
    label: STAGE_LABELS[stage],
    value: stage,
    count: txStore.transactions.filter((t) => t.stage === stage).length,
  })),
]);
</script>
