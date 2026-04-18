<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <NuxtLink to="/transactions" class="text-sm text-brand-graphite/40 hover:text-brand-pink transition-colors">
        ← Back to Transactions
      </NuxtLink>
      <h1 class="text-3xl font-extrabold text-brand-ink tracking-tight mt-3">New Transaction</h1>
      <p class="mt-1 text-brand-graphite/50">Create a new property transaction</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Property info -->
      <div class="glass-card">
        <h2 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Property Details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Address</label>
            <input v-model="form.property.address" type="text" required
              class="input-field" placeholder="e.g. Bağdat Cad. No:42" id="input-address" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">City</label>
            <input v-model="form.property.city" type="text" required
              class="input-field" placeholder="e.g. Istanbul" id="input-city" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Property Type</label>
            <input v-model="form.property.type" type="text" required
              class="input-field" placeholder="e.g. Apartment, Villa" id="input-type" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Price ($)</label>
            <input v-model.number="form.property.price" type="number" min="1" step="0.01" required
              class="input-field" placeholder="3500000" id="input-price" />
          </div>
        </div>
      </div>

      <!-- Financials -->
      <div class="glass-card">
        <h2 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Financials</h2>
        <div>
          <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Service Fee Amount ($)</label>
          <input v-model.number="form.serviceFeeAmount" type="number" min="0.01" step="0.01" required
            class="input-field" placeholder="105000" id="input-service-fee" />
        </div>
      </div>

      <!-- Agents -->
      <div class="glass-card">
        <h2 class="text-sm font-semibold text-brand-graphite/60 uppercase tracking-wider mb-4">Agents</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentPicker
            v-model="form.listingAgentId"
            :agents="agentsStore.agents"
            label="Listing Agent"
            placeholder="Select listing agent"
            :loading="agentsStore.loading"
            id="picker-listing-agent"
          />
          <AgentPicker
            v-model="form.sellingAgentId"
            :agents="agentsStore.agents"
            label="Selling Agent"
            placeholder="Select selling agent"
            :loading="agentsStore.loading"
            id="picker-selling-agent"
          />
        </div>
        <p v-if="form.listingAgentId && form.listingAgentId === form.sellingAgentId"
          class="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Same agent — they'll receive 100% of the agent pool
        </p>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <NuxtLink to="/transactions" class="btn-secondary">Cancel</NuxtLink>
        <button type="submit" class="btn-primary" :disabled="submitting" id="submit-transaction-btn">
          {{ submitting ? 'Creating…' : 'Create Transaction' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionsStore } from '~/stores/transactions';
import { useAgentsStore } from '~/stores/agents';

useHead({ title: 'New Transaction' });

const router = useRouter();
const txStore = useTransactionsStore();
const agentsStore = useAgentsStore();

const submitting = ref(false);

const form = reactive({
  property: {
    address: '',
    city: '',
    type: '',
    price: 0,
  },
  serviceFeeAmount: 0,
  listingAgentId: '',
  sellingAgentId: '',
});

onMounted(() => agentsStore.fetchAll());

async function onSubmit() {
  submitting.value = true;
  try {
    const tx = await txStore.create({
      property: form.property,
      serviceFeeAmount: form.serviceFeeAmount,
      listingAgentId: form.listingAgentId,
      sellingAgentId: form.sellingAgentId,
    });
    router.push(`/transactions/${tx._id}`);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-brand-ink text-sm
         transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink
         placeholder:text-gray-300;
}
</style>
