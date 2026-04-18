<template>
  <div class="animate-shimmer rounded-2xl" :class="classes" :style="{ height, width }" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    height?: string;
    width?: string;
    variant?: 'card' | 'line' | 'circle';
  }>(),
  {
    height: '1rem',
    width: '100%',
    variant: 'line',
  },
);

const classes = {
  card: 'bg-gray-100',
  line: 'bg-gray-100',
  circle: 'bg-gray-100 !rounded-full',
}[props.variant];
</script>
