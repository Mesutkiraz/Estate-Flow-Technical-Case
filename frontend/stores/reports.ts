import { defineStore } from 'pinia';
import type { SummaryReport } from '~/types';
import { useApi } from '~/composables/useApi';

export const useReportsStore = defineStore('reports', {
  state: () => ({
    summary: null as SummaryReport | null,
    loading: false,
  }),

  actions: {
    async fetchSummary() {
      this.loading = true;
      try {
        const { api } = useApi();
        this.summary = await api<SummaryReport>('/reports/summary');
      } finally {
        this.loading = false;
      }
    },
  },
});
