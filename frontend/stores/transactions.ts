import { defineStore } from 'pinia';
import type { Transaction, Stage } from '~/types';
import { useApi } from '~/composables/useApi';
import { useToastsStore } from './toasts';

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    current: null as Transaction | null,
    loading: false,
  }),

  getters: {
    byStage: (state) => (stage: Stage) =>
      state.transactions.filter((t) => t.stage === stage),
  },

  actions: {
    async fetchAll(query?: { stage?: string; agentId?: string }) {
      this.loading = true;
      try {
        const { api } = useApi();
        const params = new URLSearchParams();
        if (query?.stage) params.set('stage', query.stage);
        if (query?.agentId) params.set('agentId', query.agentId);
        const qs = params.toString();
        this.transactions = await api<Transaction[]>(
          `/transactions${qs ? '?' + qs : ''}`,
        );
      } finally {
        this.loading = false;
      }
    },

    async fetchOne(id: string) {
      this.loading = true;
      try {
        const { api } = useApi();
        this.current = await api<Transaction>(`/transactions/${id}`);
      } finally {
        this.loading = false;
      }
    },

    async create(payload: {
      property: { address: string; city: string; type: string; price: number };
      serviceFeeAmount: number;
      listingAgentId: string;
      sellingAgentId: string;
    }) {
      const { api } = useApi();
      const tx = await api<Transaction>('/transactions', {
        method: 'POST',
        body: payload,
      });
      this.transactions.unshift(tx);
      const toasts = useToastsStore();
      toasts.success('Transaction created');
      return tx;
    },

    async advance(id: string, note?: string) {
      const { api } = useApi();
      const tx = await api<Transaction>(`/transactions/${id}/advance`, {
        method: 'PATCH',
        body: { note },
      });
      this.replaceInList(tx);
      if (this.current?._id === id) this.current = tx;
      const toasts = useToastsStore();
      toasts.success(`Advanced to ${tx.stage}`);
      return tx;
    },

    async setStage(id: string, stage: Stage, note?: string) {
      const { api } = useApi();
      const tx = await api<Transaction>(`/transactions/${id}/stage`, {
        method: 'PATCH',
        body: { stage, note },
      });
      this.replaceInList(tx);
      if (this.current?._id === id) this.current = tx;
      return tx;
    },

    async remove(id: string) {
      const { api } = useApi();
      await api(`/transactions/${id}`, { method: 'DELETE' });
      this.transactions = this.transactions.filter((t) => t._id !== id);
      if (this.current?._id === id) this.current = null;
      const toasts = useToastsStore();
      toasts.success('Transaction deleted');
    },

    replaceInList(tx: Transaction) {
      const idx = this.transactions.findIndex((t) => t._id === tx._id);
      if (idx !== -1) this.transactions[idx] = tx;
    },
  },
});
