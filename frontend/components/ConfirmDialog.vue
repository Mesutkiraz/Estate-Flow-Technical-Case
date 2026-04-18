<template>
  <Modal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" id="confirm-dialog">
    <template #title>{{ title }}</template>

    <p class="text-sm text-brand-graphite/70">{{ message }}</p>

    <template #footer>
      <div class="flex items-center gap-3 justify-end">
        <button @click="$emit('update:modelValue', false)" class="btn-secondary" id="confirm-cancel-btn">
          Cancel
        </button>
        <button @click="$emit('confirm')" class="btn-primary" :class="danger ? '!bg-red-500 hover:!bg-red-600' : ''" id="confirm-ok-btn">
          {{ confirmText }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();
</script>
