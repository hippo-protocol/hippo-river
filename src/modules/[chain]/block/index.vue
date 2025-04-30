<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useFormatter, useStakingStore } from '@/stores';
import TxsInBlocksChart from '@/components/charts/TxsInBlocksChart.vue';
import { onMounted, watch } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import type { Validator } from '@/types';

const props = defineProps(['chain']);

const tab = ref('blocks');

const base = useBaseStore();

const format = useFormatter();
const staking = useStakingStore();
const avatars = ref({} as any);

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
  return tx.slice(0, 6) + '...' + tx.slice(tx.length - 6, tx.length);
};

const fetchAvatar = (identity: string) => {
  // fetch avatar from keybase
  return new Promise<void>((resolve) => {
    staking
      .keybase(identity)
      .then((d) => {
        if (Array.isArray(d.them) && d.them.length > 0) {
          const uri = String(d.them[0]?.pictures?.primary?.url).replace(
            'https://s3.amazonaws.com/keybase_processed_uploads/',
            ''
          );

          avatars.value[identity] = uri;
          resolve();
        } else throw new Error(`failed to fetch avatar for ${identity}`);
      })
      .catch((error) => {
        // console.error(error); // uncomment this if you want the user to see which avatars failed to load.
        resolve();
      });
  });
};
const loadAvatars = () => {
  // fetches all avatars from keybase and stores it in localStorage
  const promises = staking.validators.map((validator) => {
    const identity = validator.description?.identity;

    // Here we also check whether we haven't already fetched the avatar
    if (identity && !avatars.value[identity]) {
      return fetchAvatar(identity);
    } else {
      return Promise.resolve();
    }
  });
};
const validatorMonikerToLogo = (validator?: Validator) => {
  const identity = validator?.description?.identity;
  if (!validator || !identity || !avatars.value[identity]) {
    if (staking.defaultValidators.includes(validator!.description?.moniker)) {
      return `/validators/${validator!.description?.moniker}.png`;
    }
    return '/favicon.ico';
  }
  const url = avatars.value[identity] || '';
  return url.startsWith('http')
    ? url
    : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
}

watch(
  () => base.latest,
  (latest) => {
    if (latest && list.value.length === 0) {
      base.fetchBlocks(
        Number(latest.block.header.height) - pageSize,
        latest.block.header.height
      );
    }
  }
);

onMounted(() => {
  if (!base.latest.block) return;
  base.fetchBlocks(
    Number(base.latest.block.header.height) - pageSize,
    base.latest.block.header.height
  );
  loadAvatars();
});

</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-transparent mb-4">
      <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === 'blocks' }" @click="tab = 'blocks'">{{
        $t('block.recent') }}</a>
      <RouterLink class="tab text-gray-400 uppercase" :to="`/${chain}/block/${Number(base.latest?.block?.header.height || 0) + 10000
        }`">{{ $t('block.future') }}</RouterLink>
    </div>

    <div v-show="tab === 'blocks'">
      <TxsInBlocksChart />

      <div class="grid grid-cols-1 gap-3">
        <RouterLink v-for="item in list" class="flex flex-col justify-between rounded p-5 shadow bg-base-100"
          :to="`/${chain}/block/${item.header.height}`">
          <div class="flex justify-between">
            <h3 class="text-md font-bold sm:!text-lg w-[75px]">
              {{ item.header.height }}
            </h3>
            <span
              class="text-right whitespace-nowrap font-normal w-[150px] text-md sm:!text-lg sm:!w-[200px] truncate flex items-start">
              {{ ellipsisHash(item.block_id.hash) }}
            </span>
            <div class="flex justify-between tooltip" data-tip="Block Proposor">
              <div class="hidden text-md items-center sm:!flex truncate text-ellipsis sm:gap-2 ">
                <img :src="validatorMonikerToLogo(format.validatorFromHex(item.header?.proposer_address))" width="28"
                  height="28" />
                <h3
                  class="text-md font-bold text-left overflow-hidden text-ellipsis sm:!text-xs w-[100px] md:w-[160px] md:!text-lg">
                  {{ format.validatorFromHex(item.header?.proposer_address)?.description.moniker }}
                </h3>
              </div>
            </div>
            <span class="text-right whitespace-nowrap font-normal text-md sm:!text-lg w-[46px]">
              {{ item.num_txs }} txs
            </span>
            <span class="w-auto rounded whitespace-nowrap font-normal text-green-600 text-md sm:!text-lg w-[70px]">
              {{ format.toDay(item.header?.time, 'from') }}
            </span>
          </div>
        </RouterLink>
        <PaginationBar :total="base.latest.block?.header.height" :limit="pageSize" :callback="onPageChange" />
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
