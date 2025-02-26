<script lang="ts" setup>
import { useGovStore, useTxDialog } from '@/stores';
import ProposalListItem from '@/components/ProposalListItem.vue';
import { ref, onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';

const tab = ref('0');
const store = useGovStore();
const pageRequest = ref(new PageRequest());
const dialog = useTxDialog();

onMounted(() => {
  store.fetchProposals('0').then((x) => {
    if (x?.proposals?.length === 0) {
      return;
    }
    store.fetchProposals('1');
    store.fetchProposals('2');
    store.fetchProposals('3');
    store.fetchProposals('4');
  });
});

const changeTab = (val: '0' | '1' | '2' | '3' | '4') => {
  tab.value = val;
};

function page(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposals(tab.value, pageRequest.value);
}

</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-transparent mb-4 text-center flex justify-between gap-4">
      <div>
        <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '0' }" @click="changeTab('0')">ALL</a>
        <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '1' }"
          @click="changeTab('1')">DEPOSIT</a>
        <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '2' }" @click="changeTab('2')">{{
          $t('gov.voting') }}</a>
        <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '3' }" @click="changeTab('3')">{{
          $t('gov.passed') }}</a>
        <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '4' }" @click="changeTab('4')">{{
          $t('gov.rejected') }}</a>
      </div>
      <label for='propose' class="btn btn-secondary btn-sm text-white uppercase"
        @click="dialog.open('propose', {})">Propose</label>
    </div>
    <ProposalListItem :proposals="store?.proposals[tab]" />
    <PaginationBar :total="store?.proposals[tab]?.pagination?.total" :limit="pageRequest.limit" :callback="page" />
  </div>
</template>
<route>
  {
    meta: {
      i18n: 'governance',
      order: 2
    }
  }
</route>
