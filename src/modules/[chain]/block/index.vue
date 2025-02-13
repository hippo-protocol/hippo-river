<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useFormatter } from '@/stores';
import TxsInBlocksChart from '@/components/charts/TxsInBlocksChart.vue';
import { onMounted, watch } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';

const props = defineProps(['chain']);

const tab = ref('blocks');

const base = useBaseStore();

const format = useFormatter();

const list = computed(() => {
  return base.latestBlocks.block_metas || [];
});

const pageSize = 20;
const onPageChange = (page: number) => {
  base.fetchBlocks(
    Number(base.latest.block.header.height) - page * pageSize,
    Number(base.latest.block.header.height) - (page - 1) * pageSize
  );
};

const ellipsisHash = (tx: string) => {
  return tx.slice(0,6) + '...' + tx.slice(tx.length - 6, tx.length);
};

watch(
  () => base.latest,
  (newLatest) => {
    if (newLatest && list.value.length === 0) {
      base.fetchBlocks(
        Number(newLatest.block.header.height) - pageSize,
        newLatest.block.header.height
      );
    }
  }
);

onMounted(() => {
  if (list.value.length !== 0)
    base.fetchBlocks(
      Number(base.latest.block.header.height) - pageSize,
      base.latest.block.header.height
    );
});
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
          class="flex flex-col justify-between rounded p-5 shadow bg-base-100"
          :to="`/${chain}/block/${item.header.height}`"
        >
          <div class="flex justify-between">
            <h3 class="text-md font-bold sm:!text-lg w-[75px]">
              {{ item.header.height }}
            </h3>
            <span
              class="text-right whitespace-nowrap font-normal w-[150px] text-md sm:!text-lg sm:!w-[200px] truncate flex items-start"
            >
              {{ ellipsisHash(item.block_id.hash) }}
            </span>
            <div class="flex justify-between tooltip" data-tip="Block Proposor">
              <div class="hidden text-md sm:!block truncate">
                <h3 class="text-md font-bold sm:!text-lg w-[70px]">
                  {{ format.validatorFromHex(item.header?.proposer_address) }}
                </h3>
              </div>
            </div>
            <span
              class="text-right whitespace-nowrap font-normal text-md sm:!text-lg w-[46px]"
            >
              {{ item.num_txs }} txs
            </span>
            <span
              class="w-auto rounded whitespace-nowrap font-normal text-green-600 text-md sm:!text-lg w-[70px]"
            >
              {{ format.toDay(item.header?.time, 'from') }}
            </span>
          </div>
        </RouterLink>
        <PaginationBar
          :total="base.latest.block?.header.height"
          :limit="pageSize"
          :callback="onPageChange"
        />
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
