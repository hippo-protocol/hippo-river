<script lang="ts" setup>
import { useFormatter } from '@/stores';
import type { Coin } from '@/types';

const props = defineProps({
  value: { type: Array<Coin> },
});

const format = useFormatter();
</script>
<template>
  <div>
    {{ format.formatHP(value, true) }}
  </div>
</template>
<script lang="ts">
export default {
  name: 'ArrayCoinElement',
};
</script>
