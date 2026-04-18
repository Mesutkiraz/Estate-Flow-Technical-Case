<template>
  <span
    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-300"
    :class="classes"
    :id="id"
  >
    <span class="w-2 h-2 rounded-full" :class="dotClass" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Stage } from '~/types';
import { STAGE_LABELS } from '~/types';

const props = defineProps<{
  stage: Stage;
  id?: string;
}>();

const label = computed(() => STAGE_LABELS[props.stage] || props.stage);

const colorMap: Record<Stage, { bg: string; text: string; dot: string }> = {
  agreement: {
    bg: 'bg-amber-50 border border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  earnest_money: {
    bg: 'bg-blue-50 border border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  title_deed: {
    bg: 'bg-purple-50 border border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  completed: {
    bg: 'bg-emerald-50 border border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
};

const classes = computed(() => {
  const c = colorMap[props.stage];
  return `${c.bg} ${c.text}`;
});

const dotClass = computed(() => colorMap[props.stage].dot);
</script>
