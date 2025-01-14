<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useFormatter } from '@/stores';
import TxsInBlocksChart from '@/components/charts/TxsInBlocksChart.vue';
import { watch } from 'vue';

const props = defineProps(['chain']);

const tab = ref('blocks');

const base = useBaseStore();

const format = useFormatter();

const list = computed(() => {
  return base.latestBlocks.block_metas || [];
});

watch(
  () => base.latest,
  (newLatest) => {
    if (newLatest && list.value.length === 0) {
      base.fetchBlocks(
        Number(newLatest.block.header.height) - 25,
        newLatest.block.header.height
      );
    }
  },
);

</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-transparent mb-4">
      <a
        class="tab text-gray-400 uppercase"
        :class="{ 'tab-active': tab === 'blocks' }"
        @click="tab = 'blocks'"
        >{{ $t('block.recent') }}</a
      >
      <RouterLink
        class="tab text-gray-400 uppercase"
        :to="`/${chain}/block/${
          Number(base.latest?.block?.header.height || 0) + 10000
        }`"
        >{{ $t('block.future') }}</RouterLink
      >
    </div>

    <div v-show="tab === 'blocks'">
      <TxsInBlocksChart />

      <div class="grid grid-cols-1 gap-3">
        <RouterLink
          v-for="item in list"
          class="flex flex-col justify-between rounded p-4 shadow bg-base-100"
          :to="`/${chain}/block/${item.header.height}`"
        >
          <div class="flex justify-between">
            <h3 class="text-md font-bold sm:!text-lg">
              {{ item.header.height }}
            </h3>
            <div class="flex justify-between tooltip" data-tip="Block Proposor">
              <div class="hidden text-md sm:!block truncate">
                <h3 class="text-md font-bold sm:!text-lg">
                  {{ format.validatorFromHex(item.header?.proposer_address) }}
                </h3>
              </div>
            </div>
            <span
              class="text-right whitespace-nowrap font-normal text-md sm:!text-lg"
            >
              {{ item.num_txs }} txs
            </span>
            <span
              class="rounded whitespace-nowrap font-normal text-green-600 text-md sm:!text-lg"
            >
              {{ format.toDay(item.header?.time, 'from') }}
            </span>
          </div>
        </RouterLink>
        <!-- TODO pagination -->
        <!-- <PaginationBar :total="store?.proposals[tab]?.pagination?.total" :limit="pageRequest.limit" :callback="page" /> -->
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'blocks',
        order: 5
      }
    }
  </route>
