<template>
  <header class="sticky top-0 z-50 bg-brand-ink/95 backdrop-blur-lg border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group" id="header-logo">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-pink to-brand-pinkDeep flex items-center justify-center shadow-pink transition-transform group-hover:scale-110">
            <span class="text-white font-bold text-sm">EF</span>
          </div>
          <span class="text-white font-bold text-lg tracking-tight">Estate Flow</span>
        </NuxtLink>

        <!-- Nav -->
        <nav class="flex items-center gap-1" id="header-nav">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :id="`nav-${link.label.toLowerCase()}`"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/agents', label: 'Agents' },
];
</script>

<style scoped>
.nav-link {
  @apply px-4 py-2 rounded-lg text-sm font-medium text-white/60
         transition-all duration-200
         hover:text-white hover:bg-white/5;
}

.nav-link.router-link-active {
  @apply text-brand-pink bg-brand-pink/10;
}
</style>
