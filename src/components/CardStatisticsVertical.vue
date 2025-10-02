<script setup lang="ts">
import { controlledComputed } from '@vueuse/core'

interface Props {
  title: string;
  color?: string;
  icon: string;
  stats: string;
  change?: number;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
});

const isPositive = controlledComputed(
  () => props.change,
  () => Math.sign(props.change || 0) === 1
);
</script>

<template>
  <div
    class="bg-gra-dark rounded-[32px] border border-[#1E1F22] py-[24px] px-[32px] items-start gap-[24px] grow flex flex-col">
    <div class="flex items-center justify-between self-stretch">
      <p class="text-[#98a9ce] text-[14px]">{{ props.title }}</p>
      <img :src="props.icon" :alt="props.title" class="w-[40px] h-[40px] shrink-0" />
    </div>
    <span class="text-white text-[20px] text-bold">{{ props.stats || '-' }}</span>
  </div>
</template>
