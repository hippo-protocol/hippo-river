<script lang="ts" setup>
import { useGovStore, useTxDialog } from '@/stores';
import ProposalListItem from '@/components/ProposalListItem.vue';
import { ref, onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';
import ActiveProposals from '@/components/ActiveProposals.vue';

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

function onPageChange(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposals(tab.value, pageRequest.value);
}

const proposeCallback = () => {
  // when User Propose new Proposal, then fetch proposals status of ALL, DEPOSIT, VOTING
  store.fetchProposals('0');
  store.fetchProposals('1');
  store.fetchProposals('2');
}


</script>
<template>
  <div>
    <ActiveProposals type="gov"/>
    <div class="h-[1px] w-full bg-[#2c3443] mb-[62px] mt-[17px]" ></div>
    <div class="tabs tabs-boxed bg-transparent text-center flex justify-between mb-[48px] px-[40px]">
      <div class="flex gap-[4px]  rounded-[24px] border border-[#2c3443]  p-[4px]">
        <a class="tab text-white text-normal capitalize !rounded-[20px]" :class="{ 'tab-active !text-black !bg-white': tab === '0' }" @click="changeTab('0')">All</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]" :class="{ 'tab-active !text-black !bg-white': tab === '1' }"
          @click="changeTab('1')">Deposit</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]" :class="{ 'tab-active !text-black !bg-white': tab === '2' }" @click="changeTab('2')">{{
          $t('gov.voting') }}</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]" :class="{ 'tab-active !text-black !bg-white': tab === '3' }" @click="changeTab('3')">{{
          $t('gov.passed') }}</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]" :class="{ 'tab-active !text-black !bg-white': tab === '4' }" @click="changeTab('4')">{{
          $t('gov.rejected') }}</a>
      </div>
      <label for='propose' class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px]"
        @click="dialog.open('propose', {}, proposeCallback)">Propose</label>
    </div>
    <ProposalListItem :proposals="store?.proposals[tab]" :tab="tab" />
    <PaginationBar :total="store?.proposals[tab]?.pagination?.total" :limit="pageRequest.limit"
      :callback="onPageChange" />
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
