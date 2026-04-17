<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title?: string) => (title ? `${title} — Estate Flow` : 'Estate Flow'),
})
</script>
