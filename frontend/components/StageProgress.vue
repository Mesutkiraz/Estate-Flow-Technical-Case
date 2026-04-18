<template>
  <div class="flex items-center gap-0 w-full" :id="id">
    <template v-for="(s, i) in STAGES" :key="s">
      <!-- Dot -->
      <div class="flex flex-col items-center gap-1 relative z-10">
        <div
          class="w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center"
          :class="dotClasses(i)"
        >
          <svg v-if="i < currentIndex" class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.485 3.515a1 1 0 0 1 0 1.414l-7.071 7.07a1 1 0 0 1-1.415 0L1.929 8.93a1 1 0 0 1 1.414-1.414L5.5 9.672l6.571-6.571a1 1 0 0 1 1.414.414z"/>
          </svg>
        </div>
        <span class="text-[10px] font-medium whitespace-nowrap" :class="labelClasses(i)">
          {{ STAGE_LABELS[s] }}
        </span>
      </div>

      <!-- Connecting line -->
      <div
        v-if="i < STAGES.length - 1"
        class="flex-1 h-0.5 transition-all duration-700 ease-out mx-1 rounded-full"
        :class="lineClasses(i)"
        :style="lineStyle(i)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { STAGES, STAGE_LABELS } from '~/types';
import type { Stage } from '~/types';

const props = defineProps<{
  stage: Stage;
  id?: string;
}>();

const currentIndex = computed(() => STAGES.indexOf(props.stage));

function dotClasses(i: number): string {
  if (i < currentIndex.value) return 'bg-brand-pink border-brand-pink scale-100';
  if (i === currentIndex.value) return 'bg-brand-pink border-brand-pink scale-125 shadow-pink animate-pulse-glow';
  return 'bg-white border-gray-300';
}

function labelClasses(i: number): string {
  if (i <= currentIndex.value) return 'text-brand-pink font-semibold';
  return 'text-gray-400';
}

function lineClasses(i: number): string {
  if (i < currentIndex.value) return 'bg-brand-pink';
  return 'bg-gray-200';
}

function lineStyle(i: number): Record<string, string> {
  if (i === currentIndex.value - 1) {
    return { transition: 'background-color 0.7s ease-out, width 0.7s ease-out' };
  }
  return {};
}
</script>
