import { defineStore } from 'pinia';
import type { Agent } from '~/types';
import { useApi } from '~/composables/useApi';
import { useToastsStore } from './toasts';

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    current: null as Agent | null,
    loading: false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        const { api } = useApi();
        this.agents = await api<Agent[]>('/agents');
      } finally {
        this.loading = false;
      }
    },

    async fetchOne(id: string) {
      this.loading = true;
      try {
        const { api } = useApi();
        this.current = await api<Agent>(`/agents/${id}`);
      } finally {
        this.loading = false;
      }
    },

    async create(payload: { name: string; email: string; phone?: string }) {
      const { api } = useApi();
      const agent = await api<Agent>('/agents', {
        method: 'POST',
        body: payload,
      });
      this.agents.unshift(agent);
      const toasts = useToastsStore();
      toasts.success(`Agent "${agent.name}" created`);
      return agent;
    },

    async update(id: string, payload: Partial<Agent>) {
      const { api } = useApi();
      const agent = await api<Agent>(`/agents/${id}`, {
        method: 'PATCH',
        body: payload,
      });
      const idx = this.agents.findIndex((a) => a._id === id);
      if (idx !== -1) this.agents[idx] = agent;
      if (this.current?._id === id) this.current = agent;
      const toasts = useToastsStore();
      toasts.success(`Agent "${agent.name}" updated`);
      return agent;
    },

    async remove(id: string) {
      const { api } = useApi();
      await api(`/agents/${id}`, { method: 'DELETE' });
      this.agents = this.agents.filter((a) => a._id !== id);
      if (this.current?._id === id) this.current = null;
      const toasts = useToastsStore();
      toasts.success('Agent deleted');
    },
  },
});
