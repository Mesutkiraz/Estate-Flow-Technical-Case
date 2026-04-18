<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <template v-if="agentsStore.loading && !agent">
      <Skeleton variant="card" height="300px" />
    </template>

    <!-- Not found -->
    <template v-else-if="!agent">
      <div class="glass-card text-center py-16">
        <h2 class="text-xl font-bold text-brand-ink mb-2">Agent Not Found</h2>
        <NuxtLink to="/agents" class="btn-primary inline-flex mt-4">← Back to Agents</NuxtLink>
      </div>
    </template>

    <template v-else>
      <nav class="flex items-center gap-2 text-sm text-brand-graphite/40 mb-6">
        <NuxtLink to="/agents" class="hover:text-brand-pink transition-colors">Agents</NuxtLink>
        <span>/</span>
        <span class="text-brand-ink font-medium">{{ agent.name }}</span>
      </nav>

      <!-- Agent header -->
      <div class="glass-card flex items-center gap-6 mb-8" id="agent-detail-header">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-pinkDeep flex items-center justify-center text-white font-extrabold text-3xl shadow-pinkLg">
          {{ agent.name.charAt(0) }}
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-extrabold text-brand-ink">{{ agent.name }}</h1>
          <p class="text-brand-graphite/50 mt-0.5">{{ agent.email }}</p>
          <p v-if="agent.phone" class="text-brand-graphite/40 text-sm mt-0.5">{{ agent.phone }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="showEdit = true" class="btn-secondary text-sm" id="edit-agent-btn">Edit</button>
          <button @click="showDeleteConfirm = true" class="btn-primary !bg-red-500 hover:!bg-red-600 !shadow-none text-sm" id="delete-agent-btn">Delete</button>
        </div>
      </div>

      <!-- Agent's transactions -->
      <div>
        <h2 class="text-xl font-bold text-brand-ink mb-4">Transactions</h2>
        <template v-if="txStore.loading">
          <Skeleton variant="card" height="160px" />
        </template>
        <template v-else-if="agentTransactions.length === 0">
          <div class="glass-card text-center py-8">
            <p class="text-brand-graphite/40">No transactions for this agent yet</p>
          </div>
        </template>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionCard v-for="tx in agentTransactions" :key="tx._id" :tx="tx" />
          </div>
        </template>
      </div>

      <!-- Edit modal -->
      <Modal v-model="showEdit" id="edit-agent-modal">
        <template #title>Edit Agent</template>
        <form @submit.prevent="onUpdate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Name</label>
            <input v-model="editForm.name" type="text" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Email</label>
            <input v-model="editForm.email" type="email" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Phone</label>
            <input v-model="editForm.phone" type="tel" class="input-field" />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showEdit = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <!-- Delete confirm -->
      <ConfirmDialog
        v-model="showDeleteConfirm"
        title="Delete Agent"
        message="Are you sure you want to permanently delete this agent? Transactions referencing them will remain."
        confirm-text="Delete"
        :danger="true"
        @confirm="onDelete"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAgentsStore } from '~/stores/agents';
import { useTransactionsStore } from '~/stores/transactions';

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();
const txStore = useTransactionsStore();

const showEdit = ref(false);
const showDeleteConfirm = ref(false);

const agent = computed(() => agentsStore.current);
const agentTransactions = computed(() =>
  txStore.transactions.filter(
    (t) => t.listingAgentId === agent.value?._id || t.sellingAgentId === agent.value?._id,
  ),
);

const editForm = reactive({ name: '', email: '', phone: '' });

useHead({ title: computed(() => agent.value?.name || 'Agent') });

onMounted(async () => {
  await agentsStore.fetchOne(route.params.id as string);
  await txStore.fetchAll({ agentId: route.params.id as string });
});

watch(agent, (a) => {
  if (a) {
    editForm.name = a.name;
    editForm.email = a.email;
    editForm.phone = a.phone || '';
  }
});

async function onUpdate() {
  if (!agent.value) return;
  await agentsStore.update(agent.value._id, {
    name: editForm.name,
    email: editForm.email,
    phone: editForm.phone || undefined,
  });
  showEdit.value = false;
}

async function onDelete() {
  if (!agent.value) return;
  showDeleteConfirm.value = false;
  await agentsStore.remove(agent.value._id);
  router.push('/agents');
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
