<template>
  <div class="min-h-screen flex flex-col bg-brand-pink">
    <main class="flex-1">
      <h1 class="text-3xl font-bold text-center py-8">Here we go again.</h1>
    </main>
    <footer class="py-8 text-center text-xs text-black/40">
      Estate Flow — test only
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title?: string) => (title ? `${title} — Estate Flow` : 'Estate Flow'),
})
</script>
