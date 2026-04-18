<template>
  <NuxtLink
    :to="`/transactions/${tx._id}`"
    class="glass-card block transition-all duration-300 hover:-translate-y-1 hover:shadow-pinkLg group cursor-pointer"
    :id="`transaction-card-${tx._id}`"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-brand-ink text-base truncate group-hover:text-brand-pink transition-colors">
          {{ tx.property.address }}
        </h3>
        <p class="text-sm text-brand-graphite/50 mt-0.5">{{ tx.property.city }} — {{ tx.property.type }}</p>
      </div>
      <StageBadge :stage="tx.stage" class="ml-3 flex-shrink-0" />
    </div>

    <!-- Stage progress -->
    <StageProgress :stage="tx.stage" class="mb-4" />

    <!-- Footer info -->
    <div class="flex items-center justify-between text-xs text-brand-graphite/50">
      <div class="flex items-center gap-3">
        <span v-if="tx.listingAgent" class="flex items-center gap-1">
          <span class="w-5 h-5 rounded-full bg-brand-pink/10 text-brand-pink text-[10px] font-bold flex items-center justify-center">
            {{ tx.listingAgent.name.charAt(0) }}
          </span>
          {{ tx.listingAgent.name }}
        </span>
        <span v-if="tx.sellingAgent && tx.sellingAgent._id !== tx.listingAgent?._id" class="flex items-center gap-1">
          <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold flex items-center justify-center">
            {{ tx.sellingAgent.name.charAt(0) }}
          </span>
          {{ tx.sellingAgent.name }}
        </span>
      </div>
      <span class="font-semibold text-brand-ink">{{ fmt.currency(tx.serviceFeeAmount) }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Transaction } from '~/types';
import { useFormat } from '~/composables/useFormat';

defineProps<{ tx: Transaction }>();
const fmt = useFormat();
</script>
