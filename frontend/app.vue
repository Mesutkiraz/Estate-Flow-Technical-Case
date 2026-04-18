<template>
  <div class="min-h-screen bg-brand-mist">
    <AppHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title?: string) => (title ? `${title} — Estate Flow` : 'Estate Flow'),
})
</script>
