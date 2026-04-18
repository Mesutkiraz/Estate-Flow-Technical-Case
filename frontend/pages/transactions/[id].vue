<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <template v-if="txStore.loading && !tx">
      <Skeleton variant="card" height="400px" />
    </template>

    <!-- Not found -->
    <template v-else-if="!tx">
      <div class="glass-card text-center py-16">
        <h2 class="text-xl font-bold text-brand-ink mb-2">Transaction Not Found</h2>
        <NuxtLink to="/transactions" class="btn-primary inline-flex mt-4">← Back to Transactions</NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-brand-graphite/40 mb-6" id="detail-breadcrumb">
        <NuxtLink to="/transactions" class="hover:text-brand-pink transition-colors">Transactions</NuxtLink>
        <span>/</span>
        <span class="text-brand-ink font-medium">{{ tx.property.address }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-brand-ink tracking-tight">{{ tx.property.address }}</h1>
          <p class="mt-1 text-brand-graphite/50">
            {{ tx.property.city }} — {{ tx.property.type }} — {{ fmt.currency(tx.property.price) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <StageBadge :stage="tx.stage" id="detail-stage-badge" />
          <button
            v-if="tx.stage !== 'completed'"
            @click="onAdvance"
            class="btn-primary"
            :disabled="advancing"
            id="advance-stage-btn"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {{ advancing ? 'Advancing…' : 'Advance Stage' }}
          </button>
        </div>
      </div>

      <!-- Stage progress -->
      <div class="glass-card mb-8" id="detail-stage-progress">
        <h3 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Progress</h3>
        <StageProgress :stage="tx.stage" />
      </div>

      <!-- Two column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Left: Details -->
        <div class="space-y-6">
          <!-- Agents -->
          <div class="glass-card" id="detail-agents">
            <h3 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Agents</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-xl bg-brand-pink/5">
                <div class="w-10 h-10 rounded-full bg-brand-pink/10 text-brand-pink font-bold flex items-center justify-center">
                  {{ tx.listingAgent?.name?.charAt(0) || '?' }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-brand-ink text-sm">{{ tx.listingAgent?.name || 'Unknown' }}</div>
                  <div class="text-xs text-brand-graphite/40">{{ tx.listingAgent?.email || '' }}</div>
                </div>
                <span class="chip">Listing</span>
              </div>

              <div
                v-if="tx.sellingAgent && tx.sellingAgent._id !== tx.listingAgent?._id"
                class="flex items-center gap-3 p-3 rounded-xl bg-purple-50"
              >
                <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center">
                  {{ tx.sellingAgent.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-brand-ink text-sm">{{ tx.sellingAgent.name }}</div>
                  <div class="text-xs text-brand-graphite/40">{{ tx.sellingAgent.email }}</div>
                </div>
                <span class="chip !bg-purple-100 !text-purple-600">Selling</span>
              </div>

              <div v-if="tx.sellingAgent?._id === tx.listingAgent?._id" class="text-xs text-brand-graphite/40 italic">
                Same agent handles both listing and selling
              </div>
            </div>
          </div>

          <!-- Key info -->
          <div class="glass-card" id="detail-key-info">
            <h3 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Key Information</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-brand-graphite/50">Service Fee</dt>
                <dd class="font-semibold text-brand-ink">{{ fmt.currency(tx.serviceFeeAmount) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-brand-graphite/50">Created</dt>
                <dd class="text-sm text-brand-ink">{{ fmt.datetime(tx.createdAt) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-brand-graphite/50">Last Updated</dt>
                <dd class="text-sm text-brand-ink">{{ fmt.datetime(tx.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Right: Breakdown -->
        <BreakdownCard :breakdown="tx.breakdown" :transaction="tx" id="detail-breakdown" />
      </div>

      <!-- History -->
      <div class="glass-card" id="detail-history">
        <h3 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Stage History</h3>
        <div class="relative pl-6 space-y-4">
          <!-- Timeline line -->
          <div class="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />

          <div v-for="(entry, i) in tx.history" :key="i" class="relative flex gap-4">
            <div class="absolute left-[-15px] top-1 w-3 h-3 rounded-full border-2 border-white z-10"
              :class="i === tx.history.length - 1 ? 'bg-brand-pink animate-pulse-glow' : 'bg-brand-pinkDeep'"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <StageBadge v-if="entry.to" :stage="entry.to" />
                <span v-if="entry.from" class="text-xs text-brand-graphite/30">from {{ STAGE_LABELS[entry.from] || entry.from }}</span>
              </div>
              <p v-if="entry.note" class="text-sm text-brand-graphite/60 mt-1">{{ entry.note }}</p>
              <time class="text-xs text-brand-graphite/30 mt-1 block">{{ fmt.datetime(entry.changedAt) }}</time>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="mt-8 p-6 rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-red-700">Danger Zone</h3>
            <p class="text-xs text-red-400 mt-0.5">This action cannot be undone</p>
          </div>
          <button
            @click="showDeleteConfirm = true"
            class="btn-primary !bg-red-500 hover:!bg-red-600 !shadow-none text-sm"
            id="delete-transaction-btn"
          >
            Delete Transaction
          </button>
        </div>
      </div>

      <ConfirmDialog
        v-model="showDeleteConfirm"
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? This action cannot be undone."
        confirm-text="Delete"
        :danger="true"
        @confirm="onDelete"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactionsStore } from '~/stores/transactions';
import { useFormat } from '~/composables/useFormat';
import { STAGE_LABELS } from '~/types';

const route = useRoute();
const router = useRouter();
const txStore = useTransactionsStore();
const fmt = useFormat();

const advancing = ref(false);
const showDeleteConfirm = ref(false);

const tx = computed(() => txStore.current);

useHead({ title: computed(() => tx.value?.property.address || 'Transaction') });

onMounted(() => {
  txStore.fetchOne(route.params.id as string);
});

async function onAdvance() {
  if (!tx.value) return;
  advancing.value = true;
  try {
    await txStore.advance(tx.value._id);
  } finally {
    advancing.value = false;
  }
}

async function onDelete() {
  if (!tx.value) return;
  showDeleteConfirm.value = false;
  await txStore.remove(tx.value._id);
  router.push('/transactions');
}
</script>
