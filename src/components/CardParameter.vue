<script lang="ts" setup>
import type { PropType } from 'vue';
import { useFormatter } from '@/stores';
import { formatSeconds } from '@/libs/utils';
const props = defineProps({
  cardItem: {
    type: Object as PropType<{ title: string; items: Array<any> }>,
  },
});

const formatter = useFormatter();
function calculateValue(value: any) {
  if (Array.isArray(value)) {
    return formatter.weiToEther((value[0] && value[0].amount)) || '-';
  }
  if(String(value).search(/^\d+s$/g) > -1) {
    return formatSeconds(value)
  }
  const newValue = Number(value);
  if (`${newValue}` === 'NaN' || typeof value === 'boolean') {
    return value;
  }

  if (newValue < 1 && newValue > 0) {
    return formatter.formatDecimalToPercent(value);
  }
  return newValue.toLocaleString();
}

function formatTitle(v: string) {
  if(!v) return ""
  return v.replace(/_/g, " ")
}
</script>
<template>
  <div
    class="mb-[60px]"
    v-if="props.cardItem?.items && props.cardItem?.items?.length > 0"
  >
    <div class="text-[21px] mb-[35px]">{{ props.cardItem?.title }}</div>
    <div
      class="grid grid-cols-2 md:!grid-cols-4 gap-4"
    >
      <div
        v-for="(item, index) of props.cardItem?.items"
        :key="index"
        class="px-[32px] py-[24px] rounded-[32px] bg-gra-dark border border-[#1E1F22]"
      >
        <div class="text-[13px] mb-[14px] text-[#98a9ce]">{{ formatTitle(item?.subtitle) }}</div>
        <div class="text-[16px] text-white">{{ calculateValue(item?.value) }}</div>
      </div>
    </div>
  </div>
</template>
