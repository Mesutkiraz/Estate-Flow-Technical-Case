<template>
  <div class="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm" id="toast-container">
    <TransitionGroup name="toast">
      <Toast
        v-for="toast in toasts.items"
        :key="toast.id"
        :toast="toast"
        @dismiss="toasts.dismiss(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastsStore } from '~/stores/toasts';

const toasts = useToastsStore();
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
