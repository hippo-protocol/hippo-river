<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { fromBase64 } from '@cosmjs/encoding';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import PaginationBar from '@/components/PaginationBar.vue';

const props = defineProps(['chain']);
const vueRouters = useRouter();
const tab = ref('recent');

const base = useBaseStore();
const chainStore = useBlockchain();

const format = useFormatter();
const hashReg = /^[A-Z\d]{64}$/;
const hash = ref('');
const current = chainStore?.current?.chainName || '';
onMounted(() => {
  const currentTab = String(
    vueRouters.currentRoute.value.query.tab || 'recent'
  );
  tab.value = currentTab;
  if (currentTab === 'recent') {
    base.fetchTxs(1);
  }
});
function search() {
  if (hashReg.test(hash.value)) {
    vueRouters.push({ path: `/${current}/tx/${hash.value}` });
  }
}
const onPageChange=(page: number)=>{
  base.fetchTxs(page);
}


</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-transparent mb-4">
      <a
        class="tab text-gray-400 uppercase"
        :class="{ 'tab-active': tab === 'recent' }"
        @click="tab = 'recent'"
        >{{ $t('block.recent') }}</a
      >
      <a
        class="tab text-gray-400 uppercase"
        :class="{ 'tab-active': tab === 'search' }"
        @click="tab = 'search'"
        >Search</a
      >
    </div>

    <div v-show="tab === 'recent'" class="bg-base-100 rounded overflow-x-auto">
      <table class="table w-full table-compact">
        <thead class="bg-base-200">
          <tr>
            <th style="position: relative; z-index: 2">
              {{ $t('account.height') }}
            </th>
            <th style="position: relative; z-index: 2">
              {{ $t('account.hash') }}
            </th>
            <th>{{ $t('account.messages') }}</th>
            <th>{{ $t('block.fees') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in base.latestTxs"
            :index="index"
            class="hover"
          >
            <td class="text-sm text-primary">
              <RouterLink :to="`/${props.chain}/block/${item.height}`">{{
                item.height
              }}</RouterLink>
            </td>
            <td class="truncate text-primary" width="50%">
              <RouterLink :to="`/${props.chain}/tx/${item.hash}`">{{
                item.hash
              }}</RouterLink>
            </td>
            <td>
              {{
                format.messages(decodeTxRaw(fromBase64(item.tx)).body.messages)
              }}
            </td>
            <td>
              {{
                format.formatTokens(
                  decodeTxRaw(fromBase64(item.tx)).authInfo.fee?.amount
                )
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <PaginationBar
          :total="base.txCount"
          :limit="20"
          :callback="onPageChange"
        />
    </div>

    <div v-show="tab === 'search'" class="bg-base-100 rounded overflow-x-auto">
      <div class="p-4">
        <div class="form-control">
          <input
            v-model="hash"
            type="text"
            class="input input-bordered"
            placeholder="Search by Tx Hash"
            @blur="search"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'tx',
        order: 5
      }
    }
  </route>
