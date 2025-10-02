<script lang="ts" setup>
import { useBlockchain, useGovStore, useStakingStore, useFormatter } from '@/stores';
import { useIndexModule } from '@/modules/[chain]/indexStore';
import dayjs from 'dayjs';
import ProposalProcess from '@/components/ProposalProcess.vue';

import type { GovProposal } from '@/types';
const props = defineProps({
    type: {
        type: String,
        required: true,
    }
})
const blockchain = useBlockchain();
const store = useIndexModule();
const govStore = useGovStore()
const staking = useStakingStore();
const format = useFormatter();

const calcTurnout = (proposal: GovProposal) => {
    console.info(proposal)
    const tally = proposal.final_tally_result;
    let sum = 0;
    if (tally) {
        sum += Number(tally.abstain || 0);
        sum += Number(tally.yes || 0);
        sum += Number(tally.no || 0);
        sum += Number(tally.no_with_veto || 0);
    }
    const total = sum;
    if (total > 0) {
        const bonded = staking.pool?.bonded_tokens || '1';
        return format.percent(total / Number(bonded));
    }
    return 0;
}

function showType(v: string) {
    if (v) {
        return v.substring(v.lastIndexOf('.') + 1);
    }
    return v;
}
</script>
<template>
    <div v-if="blockchain.supportModule('governance') && store?.proposals?.proposals.length > 0"
        class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
        <div class="flex justify-between items-center">
            <h3 class="text-[21px] font-bold text-white px-[20px]">Active Proposals</h3>

            <RouterLink :to="`/${blockchain.chainName}/gov`" class="flex items-center gap-[8px]"
                v-if="type === 'dashboard'">
                <p class="text-[#e2e3e5] text-[12px] text-normal">See All</p>
                <div class="w-[28px] h-[28px] bg-white rounded-[32px] flex items-center justify-center p-[4px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M5.83333 1L10 6M10 6L5.83333 11M10 6L0 6" stroke="black" stroke-width="2" />
                    </svg>
                </div>
            </RouterLink>
            <div class="flex items-center gap-[6px]" v-if="type === 'gov'">
                <div class="text-[13px] text-[#515151]">
                    Live Proposals · <strong class="text-white">{{ store.proposals?.proposals?.length || 0 }}</strong>
                </div>
                <div class="text-[13px] text-[#515151]">|</div>
                <div class="text-[13px] text-[#515151]">
                    Total Proposals · <strong class="text-white">{{ govStore.proposals[0]?.pagination.total || 0
                        }}</strong>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-[6px] px-[20px]" v-if="type === 'dashboard'">
            <div class="text-[13px] text-[#515151]">
                Live Proposals · <strong class="text-white">{{ store.proposals?.proposals?.length || 0 }}</strong>
            </div>
            <div class="text-[13px] text-[#515151]">|</div>
            <div class="text-[13px] text-[#515151]">
                Total Proposals · <strong class="text-white">{{ govStore.proposals[0]?.pagination.total || 0 }}</strong>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-auto-auto gap-[16px]">
            <div v-for="proposal in store?.proposals.proposals" :key="proposal.proposal_id"
                class="flex flex-col justify-between p-[24px] bg-gra-dark rounded-[32px] border border-[#1E1F22] h-[280px]">
                <div class="flex flex-col gap-[20px]">
                    <div class="flex justify-between">
                        <span class="text-[14px] text-[#a6a6a6]">#{{ proposal.proposal_id }}</span>
                        <div class="flex gap-[4px] items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                                <circle cx="2" cy="2" r="2" fill="#10DF89" />
                            </svg>
                            <span class="text-[11px] text-[#10DF89]">VOTING</span>
                        </div>
                    </div>
                    <p class="text-[16px] text-white">{{ proposal.title }}</p>
                    <div class="px-[8px] py-[4px] rounded-[4px] bg-[#1f2638] w-fit text-[12px]">{{
                        showType(proposal.content['@type']) }}
                    </div>
                </div>
                <div class="flex flex-col gap-[24px]">
                    <div class="flex flex-col gap-[12px]">
                        <div class="flex justify-between  items-center text-white text-[16px]">
                            <p class="text-[#737373] text-[12px]">{{ `Remaining time
                                ${dayjs(proposal.voting_end_time).diff(dayjs(),
                                'day') + 1} days` }}</p>
                            <span>{{ calcTurnout(proposal) }}</span>
                        </div>
                        <div class="progress rounded-[3px] h-[8px] text-xs flex items-center">
                            <div class="h-[8px] bg-[linear-gradient(90deg,#3485FF,#D8E8FF)] flex items-center pl-2 text-white overflow-hidden"
                                :style="`width: ${calcTurnout(proposal)}`">
                            </div>
                        </div>
                    </div>
                    <RouterLink :to="`/${blockchain.chainName}/gov/${proposal.proposal_id}`"
                        class="text-[14px] text-white text-bold px-[10px] py-[12px] h-[40px] flex items-center justify-center gap-[2px] rounded-[12px] bg-[#10DF89]">
                        Vote&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"
                            fill="none">
                            <path d="M6.33333 1L10.5 6M10.5 6L6.33333 11M10.5 6L0.5 6" stroke="white"
                                stroke-width="2" />
                        </svg>
                    </RouterLink>
                </div>
            </div>
        </div>
        <div class="pb-8 text-center" v-if="store.proposals?.proposals?.length === 0">
            {{ $t('index.no_active_proposals') }}
        </div>
    </div>
    <div v-if="store?.proposals?.proposals.length === 0"
        class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
        <div class="flex justify-between items-center">
            <h3 class="text-[21px] font-bold text-white px-[20px]">Active Proposals</h3>

            <RouterLink :to="`/${blockchain.chainName}/gov`" class="flex items-center gap-[8px]"
                v-if="type === 'dashboard'">
                <p class="text-[#e2e3e5] text-[12px] text-normal">See All</p>
                <div class="w-[28px] h-[28px] bg-white rounded-[32px] flex items-center justify-center p-[4px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M5.83333 1L10 6M10 6L5.83333 11M10 6L0 6" stroke="black" stroke-width="2" />
                    </svg>
                </div>
            </RouterLink>
        </div>
        <div class="flex items-center gap-[6px] px-[20px]" v-if="type === 'dashboard'">
            <div class="text-[13px] text-[#515151]">
                Live Proposals · <strong class="text-white">{{ store.proposals?.proposals?.length || 0 }}</strong>
            </div>
            <div class="text-[13px] text-[#515151]">|</div>
            <div class="text-[13px] text-[#515151]">
                Total Proposals · <strong class="text-white">{{ govStore.proposals[0]?.pagination.total || 0 }}</strong>
            </div>
        </div>
        <div
            class="bg-gra-dark rounded-[32px] border border-[#1e1f22] padding-[24px] h-[320px] flex items-center justify-center self-stretch">
            <p class="text-[18px] text-[#515151]">No Live Proposals</p>
        </div>

    </div>
</template>