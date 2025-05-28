import { defineStore } from 'pinia';
import type { RichlistEntry } from '@/types';

export const useAccountStore = defineStore('account', {
  state: () => ({
    total: 0,
  }),

  actions: {
    async getRichlist(page: number = 1, limit: number = 20) {
      const richlist = await this.fetchRichlist(page, limit);
      return richlist;
    },
    async fetchRichlist(page: number, limit: number) {
      try {
        const response = await fetch(
          `https://supply.hippoprotocol.ai/api/hp/richlist?limit=${limit}&offset=${
            page - 1
          }`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch richlist');
        }
        const data = (await response.json()) as {
          count: number;
          data: RichlistEntry[];
        };
        this.total = data.count;
        return data.data;
      } catch (error) {
        console.error('Error fetching richlist:', error);
        return [];
      }
    },
  },
});
