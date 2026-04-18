<template>
  <div class="relative" :id="id">
    <label v-if="label" class="block text-sm font-medium text-brand-graphite/70 mb-1.5">{{ label }}</label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-brand-ink text-sm font-medium
             transition-all duration-200
             focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink
             appearance-none cursor-pointer"
      :disabled="loading"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="agent in agents" :key="agent._id" :value="agent._id">
        {{ agent.name }} — {{ agent.email }}
      </option>
    </select>
    <!-- Custom arrow -->
    <div class="absolute right-3 pointer-events-none" :class="label ? 'top-10' : 'top-3.5'">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Agent } from '~/types';

defineProps<{
  modelValue: string;
  agents: Agent[];
  label?: string;
  placeholder?: string;
  loading?: boolean;
  id?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
