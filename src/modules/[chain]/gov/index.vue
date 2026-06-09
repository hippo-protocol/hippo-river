<script lang="ts" setup>
import { useGovStore, useTxDialog } from '@/stores';
import ProposalListItem from '@/components/ProposalListItem.vue';
import { computed, ref, onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';
import ActiveProposals from '@/components/ActiveProposals.vue';

const tab = ref('0');
const store = useGovStore();
const pageRequest = ref(new PageRequest());
pageRequest.value.setPageSize(5);
const dialog = useTxDialog();
const proposeModalRef = ref<HTMLDialogElement | null>(null);
const currentProposals = computed(() => {
  const proposals = store.proposals[tab.value];
  return proposals && { ...proposals, proposals: proposals.proposals.slice(0, pageRequest.value.limit) };
});

onMounted(() => {
  store.fetchProposals('0', pageRequest.value).then((x) => {
    if (x?.proposals?.length === 0) {
      return;
    }
    store.fetchProposals('1', pageRequest.value);
    store.fetchProposals('2', pageRequest.value);
    store.fetchProposals('3', pageRequest.value);
    store.fetchProposals('4', pageRequest.value);
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
  store.fetchProposals('0', pageRequest.value);
  store.fetchProposals('1', pageRequest.value);
  store.fetchProposals('2', pageRequest.value);
};

const openProposeModal = () => {
  proposeModalRef.value?.showModal();
};

const closeProposeModal = () => {
  proposeModalRef.value?.close();
};

</script>
<template>
  <div>
    <ActiveProposals type="gov" />
    <div class="h-[1px] w-full bg-[#2c3443] mb-[62px] mt-[17px]"></div>
    <h3 class="text-[21px] text-white font-bold ml-[40px] px-[20px] mb-[56px]">All Proposals</h3>
    <div class="tabs tabs-boxed bg-transparent text-center flex justify-between mb-[48px] px-[60px]">
      <div class="flex gap-[4px]  rounded-[24px] border border-[#2c3443]  p-[4px]">
        <a class="tab text-white text-normal capitalize !rounded-[20px]"
          :class="{ 'tab-active !text-black !bg-white': tab === '0' }" @click="changeTab('0')">All</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]"
          :class="{ 'tab-active !text-black !bg-white': tab === '1' }" @click="changeTab('1')">Deposit</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]"
          :class="{ 'tab-active !text-black !bg-white': tab === '2' }" @click="changeTab('2')">{{
            $t('gov.voting') }}</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]"
          :class="{ 'tab-active !text-black !bg-white': tab === '3' }" @click="changeTab('3')">{{
            $t('gov.passed') }}</a>
        <a class="tab text-white text-normal capitalize !rounded-[20px]"
          :class="{ 'tab-active !text-black !bg-white': tab === '4' }" @click="changeTab('4')">{{
            $t('gov.rejected') }}</a>
      </div>

      <button type="button" class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px]"
        @click="openProposeModal">
        Propose
      </button>
      <dialog id="proposeWrapperModal" ref="proposeModalRef" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Select Proposal Type</h3>
          <div class="flex flex-col gap-[4px]"><label for='propose'
              class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px]"
              @click="dialog.open('propose', {}, proposeCallback); closeProposeModal()">
              Text Proposal
            </label>
            <label for='community_pool_spend'
              class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px]"
              @click="dialog.open('community_pool_spend', {}, proposeCallback); closeProposeModal()">
              Community Pool Spend Proposal
            </label>
          </div>

          <div class="modal-action">
            <button class="btn btn-ghost" @click="closeProposeModal">
              Close
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
    <ProposalListItem :proposals="currentProposals" :tab="tab" />
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
