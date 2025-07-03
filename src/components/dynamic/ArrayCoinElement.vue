<script lang="ts" setup>
import { useFormatter } from '@/stores';
import type { Coin } from '@/types';
import { computed } from 'vue';

const props = defineProps({
  value: { type: Array<Coin> },
});

const format = useFormatter();

const formatted = computed(() => {
  if (props.value && props.value[0]?.denom === 'ahp') {
    return format.formatHP(props.value, true) // when format hp, use bignumber
  }
  return format.formatTokens(props.value, true);
})
</script>
<template>
  <div>
    {{ formatted }}
  </div>
</template>
<script lang="ts">
export default {
  name: 'ArrayCoinElement',
};
</script>
