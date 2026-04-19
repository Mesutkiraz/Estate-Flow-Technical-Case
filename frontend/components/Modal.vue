<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @keydown.escape="close"
        @click.self="close"
        :id="id"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm" @click="close" />

        <!-- Panel -->
        <div
          ref="modalRef"
          class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto
                 border border-gray-100 animate-fade-in-up"
          @click.stop
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-0">
            <h2 class="text-lg font-bold text-brand-ink">
              <slot name="title">Modal</slot>
            </h2>
            <button
              @click="close"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-ink hover:bg-gray-100 transition-colors"
              id="modal-close-btn"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 pb-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  id?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function close() {
  emit('update:modelValue', false);
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close();
}

onMounted(() => window.addEventListener('keydown', onEscape));
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape));

const modalRef = ref<HTMLElement | null>(null);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab' && modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements.length) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
}

let previouslyFocused: HTMLElement | null = null;

watch(() => props.modelValue, async (val) => {
  if (val) {
    previouslyFocused = document.activeElement as HTMLElement;
    await nextTick();
    if (modalRef.value) {
      modalRef.value.focus();
    }
  } else {
    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
