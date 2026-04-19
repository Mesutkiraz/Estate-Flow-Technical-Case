<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-brand-ink tracking-tight">Agents</h1>
        <p class="mt-1 text-brand-graphite/50">Manage your team of real estate agents</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary" id="new-agent-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Agent
      </button>
    </div>

    <!-- Loading -->
    <template v-if="agentsStore.loading && agentsStore.agents.length === 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton v-for="i in 3" :key="i" variant="card" height="140px" />
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="agentsStore.agents.length === 0">
      <div class="glass-card text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-brand-pink/10 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-brand-ink mb-1">No agents yet</h3>
        <p class="text-brand-graphite/40 mb-4">Add your first agent to start managing transactions</p>
        <button @click="showCreateModal = true" class="btn-primary inline-flex">Add Agent</button>
      </div>
    </template>

    <!-- Agent cards -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="agent in agentsStore.agents"
          :key="agent._id"
          :to="`/agents/${agent._id}`"
          class="glass-card group hover:-translate-y-1 hover:shadow-pinkLg transition-all duration-300 cursor-pointer block"
          :id="`agent-card-${agent._id}`"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-pink to-brand-pinkDeep flex items-center justify-center text-white font-bold text-lg shadow-pink">
              {{ agent.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-brand-ink text-base truncate group-hover:text-brand-pink transition-colors">{{ agent.name }}</h3>
              <p class="text-sm text-brand-graphite/40 truncate">{{ agent.email }}</p>
              <p v-if="agent.phone" class="text-xs text-brand-graphite/30 mt-0.5">{{ agent.phone }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>

    <!-- Create agent modal -->
    <Modal v-model="showCreateModal" id="create-agent-modal">
      <template #title>New Agent</template>

      <form @submit.prevent="onCreateAgent" class="space-y-4">
        <div>
          <label for="input-agent-name" class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Name</label>
          <input v-model="createForm.name" type="text" required class="input-field" placeholder="Full name" id="input-agent-name" />
        </div>
        <div>
          <label for="input-agent-email" class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Email</label>
          <input v-model="createForm.email" type="email" required class="input-field" placeholder="agent@email.com" id="input-agent-email" />
        </div>
        <div>
          <label for="input-agent-phone" class="block text-sm font-medium text-brand-graphite/70 mb-1.5">Phone (optional)</label>
          <input v-model="createForm.phone" type="tel" class="input-field" placeholder="+90 5XX XXX XXXX" id="input-agent-phone" />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="creatingAgent" id="submit-agent-btn">
            {{ creatingAgent ? 'Creating…' : 'Create Agent' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAgentsStore } from '~/stores/agents';

useHead({ title: 'Agents' });

const agentsStore = useAgentsStore();
const showCreateModal = ref(false);
const creatingAgent = ref(false);

const createForm = reactive({
  name: '',
  email: '',
  phone: '',
});

onMounted(() => agentsStore.fetchAll());

async function onCreateAgent() {
  creatingAgent.value = true;
  try {
    await agentsStore.create({
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone || undefined,
    });
    showCreateModal.value = false;
    createForm.name = '';
    createForm.email = '';
    createForm.phone = '';
  } finally {
    creatingAgent.value = false;
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
