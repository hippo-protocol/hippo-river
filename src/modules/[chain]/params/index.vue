<script lang="ts" setup>
import { useParamStore } from '@/stores';
import { ref, onMounted } from 'vue';
import CardParameter from '@/components/CardParameter.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';
const store = useParamStore();
const chain = ref(store.chain);
onMounted(() => {
  // fetch the data
  store.initial();
});
</script>
<template>
  <div class="overflow-hidden px-[48px] py-[76px] text-white">
    <!-- Chain ID -->
    <div class="mb-[60px]">
      <div class="text-[21px] mb-[35px]">{{ chain.title }}</div>
      <div class="grid grid-cols-2 md:!grid-cols-4 gap-4">
        <div v-for="(item, index) of chain.items" :key="index" class="px-[32px] py-[24px] rounded-[32px] bg-gra-dark border border-[#1E1F22]">
          <div class="text-[13px] mb-[14px] text-[#98a9ce]">{{ item.subtitle }}</div>
          <div class="text-[16px] text-white">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <!-- minting Parameters  -->
    <CardParameter :cardItem="store.mint" />
    <!-- Staking Parameters  -->
    <CardParameter :cardItem="store.staking" />
    <!-- Governance Parameters -->
    <CardParameter :cardItem="store.gov" />
    <!-- Distribution Parameters -->
    <CardParameter :cardItem="store.distribution" />
    <!-- Slashing Parameters -->
    <CardParameter :cardItem="store.slashing" />

  </div>
</template>

<route>
{
  meta: {
    i18n: 'parameters',
    order: 50
  }
}
</route>
