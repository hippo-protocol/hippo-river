<script lang="ts" setup>
import {
  useBlockchain,
  useFormatter,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { select } from '@/components/dynamic/index';
import type { PaginatedProposals } from '@/types';
import ProposalProcess from './ProposalProcess.vue';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
const dialog = useTxDialog();
const props = defineProps({
  proposals: { type: Object as PropType<PaginatedProposals> },
  tab: { type: String },
});

const format = useFormatter();
const staking = useStakingStore();
const chain = useBlockchain();
function showType(v: string) {
  if (v) {
    return v.substring(v.lastIndexOf('.') + 1);
  }
  return v;
}

const statusMap: Record<string, string> = {
  PROPOSAL_STATUS_DEPOSIT_PERIOD: 'DEPOSIT',
  PROPOSAL_STATUS_VOTING_PERIOD: 'VOTING',
  PROPOSAL_STATUS_PASSED: 'PASSED',
  PROPOSAL_STATUS_REJECTED: 'REJECTED',
};

const proposalInfo = ref();

const emptyLabel = computed(() => {
  const tab = props.tab
  if (tab === '0') {
    return 'Proposals';
  } else if (tab === '1') {
    return 'Proposals in Deposit Period';
  } else if (tab === '2') {
    return 'Voting Proposals';
  } else if (tab === '3') {
    return 'Passed Proposals';
  } else if (tab === '4') {
    return 'Rejected Proposals';
  }
  return '';
})

function metaItem(metadata: string | undefined): { title: string; summary: string } {
  return metadata ? JSON.parse(metadata) : {}
}

</script>
<template>
  <div class="rounded text-sm px-[40px]">
    <table class="table-compact w-full table-fixed hidden lg:!table">
      <thead>
        <tr>
          <th class="w-20 text-left">ID</th>
          <th class="text-left">Title</th>
          <th class="text-left">Type</th>
          <th class="text-left">Voter Turnout</th>
          <th class="w-20 text-left">Status</th>
          <th class="text-right">End Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in proposals?.proposals" :key="index">
          <td class="px-4">
            <label for="proposal-detail-modal" class="text-main text-base hover:text-indigo-400 cursor-pointer"
              @click="proposalInfo = item">
              #{{ item?.proposal_id }}</label>
          </td>
          <td class="">
            <div>
              <RouterLink :to="`/${chain.chainName}/gov/${item?.proposal_id}`"
                class="text-main text-base mb-1 block hover:text-indigo-400 truncate">
                {{ item?.content?.title || item?.title || metaItem(item?.metadata)?.title }}
              </RouterLink>
            </div>
          </td>
          <td>{{ showType(item.content['@type']) }}</td>
          <td class="">
            <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
          </td>
          <td class="">
            <div class="flex items-center" :class="statusMap?.[item?.status] === 'PASSED'
              ? 'text-yes'
              : statusMap?.[item?.status] === 'REJECTED'
                ? 'text-no'
                : 'text-info'
              ">

              <div class="text-xs">
                {{ statusMap?.[item?.status] || item?.status }}
              </div>
            </div>

          </td>
          <td class="text-[12px] text-[#737373] font-normal text-right">
            {{ dayjs().isBefore(dayjs(item.voting_end_time)) ? `Remaining time
            ${dayjs(item.voting_end_time).diff(dayjs(),
              'day') + 1} days` : `Vote Ended` }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!proposals?.proposals || proposals?.proposals.length == 0"
      class="text-center text-white-400 dark:text-white-500 py-4">
      There are no {{ emptyLabel }} yet
    </div>

    <div class="lg:!hidden">
      <div v-for="(item, index) in proposals?.proposals" :key="index" class="px-4 py-4">
        <div class="text-main text-base mb-1 flex justify-between hover:text-indigo-400">
          <RouterLink :to="`/${chain.chainName}/gov/${item?.proposal_id}`" class="flex-1 w-0 truncate mr-4">{{
            item?.content?.title || item?.title || metaItem(item?.metadata)?.title }}</RouterLink>
          <label for="proposal-detail-modal" class="text-main text-base hover:text-indigo-400 cursor-pointer"
            @click="proposalInfo = item">
            #{{ item?.proposal_id }}</label>
        </div>

        <div class="grid grid-cols-4 mt-2 mb-2">
          <div class="col-span-2">
            <div v-if="item.content"
              class="bg-[#f6f2ff] text-[#9c6cff] dark:bg-gray-600 dark:text-gray-300 inline-block rounded-full px-2 py-[1px] text-xs mb-1">
              {{ showType(item.content['@type']) }}
            </div>
          </div>

          <div class="truncate text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end">
            {{ format.toDay(item.voting_end_time, 'from') }}
          </div>
        </div>

        <div>
          <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
        </div>

        <div class="mt-4" v-if="statusMap?.[item?.status] === 'VOTING'">
          <div class="flex justify-between">
            <div class="flex items-center" :class="statusMap?.[item?.status] === 'PASSED'
              ? 'text-yes'
              : statusMap?.[item?.status] === 'REJECTED'
                ? 'text-no'
                : 'text-info'
              ">
              <div class="w-1 h-1 rounded-full mr-2" :class="statusMap?.[item?.status] === 'PASSED'
                ? 'bg-yes'
                : statusMap?.[item?.status] === 'REJECTED'
                  ? 'bg-no'
                  : 'bg-info'
                "></div>
              <div class="text-xs flex items-center">
                {{ statusMap?.[item?.status] || item?.status }}
              </div>
            </div>
            <label for="vote" class="btn btn-xs btn-primary rounded-sm" @click="
              dialog.open('vote', {
                proposal_id: item?.proposal_id,
              })
              ">
              <span v-if="item?.voterStatus !== 'VOTE_OPTION_NO_WITH_VETO'">{{
                item?.voterStatus?.replace('VOTE_OPTION_', '')
              }}</span>

              <span v-else>Vote</span></label>

          </div>
        </div>
      </div>
    </div>

    <input type="checkbox" id="proposal-detail-modal" class="modal-toggle" />
    <label for="proposal-detail-modal" class="modal">
      <label class="modal-box !w-11/12 !max-w-5xl" for="">
        <label for="proposal-detail-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="font-bold text-lg">Description</h3>
        <p class="py-4">
          <Component
            v-if="proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary"
            :is="select(proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary, 'horizontal')"
            :value="proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary">
          </Component>
        </p>
      </label>
    </label>
  </div>
</template>
