<template>
  <header class="sticky top-0 z-50 bg-brand-ink/95 backdrop-blur-lg border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group shrink-0" id="header-logo">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-pink to-brand-pinkDeep flex items-center justify-center shadow-pink transition-transform group-hover:scale-110 shrink-0">
            <span class="text-white font-bold text-sm">EF</span>
          </div>
          <span class="text-white font-bold text-lg tracking-tight whitespace-nowrap">Estate Flow</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1" id="header-nav">
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

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
          aria-label="Toggle mobile menu"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Nav Outline -->
    <div v-show="mobileMenuOpen" class="md:hidden border-t border-white/5 bg-brand-ink/95 backdrop-blur-lg">
      <div class="px-4 py-3 space-y-1">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block px-4 py-3 rounded-xl text-base font-medium text-white/60 hover:text-white hover:bg-white/5"
          active-class="text-brand-pink bg-brand-pink/10"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mobileMenuOpen = ref(false);

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
