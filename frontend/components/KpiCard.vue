<template>
  <div class="glass-card flex flex-col gap-2 group" :id="id">
    <span class="text-xs font-medium uppercase tracking-wider text-brand-graphite/50">{{ label }}</span>
    <span class="text-3xl font-extrabold text-brand-ink tabular-nums">
      {{ displayValue }}
    </span>
    <span v-if="subtitle" class="text-xs text-brand-graphite/40">{{ subtitle }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  id?: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  animate?: boolean;
}>();

const displayValue = ref('');
const animatedValue = ref(0);

function formatNumber(n: number): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `${props.prefix || ''}${formatted}${props.suffix || ''}`;
}

function countUp(target: number, duration = 1200) {
  if (!props.animate || target === 0) {
    animatedValue.value = target;
    displayValue.value = formatNumber(target);
    return;
  }

  const start = animatedValue.value;
  const diff = target - start;
  const startTime = performance.now();

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    animatedValue.value = start + diff * ease;
    displayValue.value = formatNumber(Math.round(animatedValue.value * 100) / 100);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

onMounted(() => countUp(props.value));
watch(() => props.value, (newVal) => countUp(newVal));
</script>
