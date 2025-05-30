<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useFormatter, useStakingStore } from '@/stores';
import TxsInBlocksChart from '@/components/charts/TxsInBlocksChart.vue';
import { onMounted, watch } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import type { Validator } from '@/types';
import router from '@/router';

const props = defineProps(['chain']);

const tab = ref('blocks');

const base = useBaseStore();

const format = useFormatter();
const staking = useStakingStore();

const avatarCache = localStorage.getItem('avatars');
const avatars = ref(avatarCache ? JSON.parse(avatarCache) as any : {} as any);

const list = computed(() => {
  return base.latestBlocks.block_metas || [];
});

const page = ref(1);

const pageSize = 20;
const onPageChange = (_page: number) => {
  const minHeight = Number(base.latest.block.header.height) - _page * pageSize;
  base.fetchBlocks(
    minHeight < 0 ? 0 : minHeight,
    Number(base.latest.block.header.height) - (_page - 1) * pageSize
  );
  page.value = _page;
  router.replace(
    router.currentRoute.value.path + `?page=${_page}`
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
    return '/hippo-protocol.png';
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
      onPageChange(1)
    }
    if (!localStorage.getItem('avatars')) {
      loadAvatars();
    }
  }
);

onMounted(() => {
  if (!base.latest.block) return;
  const currentPage = Number(router.currentRoute.value.query.page) || 1;
  onPageChange(currentPage)
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
        <PaginationBar :total="base.latest.block?.header.height" :limit="pageSize" :callback="onPageChange"
          :current-page="page" />
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
