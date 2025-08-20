<script lang="ts" setup>
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';

import { Icon } from '@iconify/vue';
import {
  useBlockchain,
  useFormatter,
  useTxDialog,
  useWalletStore,
  useParamStore,
  useGovStore,
  useStakingStore,
} from '@/stores';
import { onMounted, ref } from 'vue';
import { useIndexModule, colorMap } from './indexStore';
import { computed } from '@vue/reactivity';

import CardStatisticsVertical from '@/components/CardStatisticsVertical.vue';
import ProposalListItem from '@/components/ProposalListItem.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue'
import ProposalProcess from '@/components/ProposalProcess.vue';
import dayjs from 'dayjs';
const props = defineProps(['chain']);


const blockchain = useBlockchain();
const store = useIndexModule();
const walletStore = useWalletStore();
const govStore = useGovStore()
const staking = useStakingStore();
const format = useFormatter();
const dialog = useTxDialog();
const paramStore = useParamStore()
const coinInfo = computed(() => {
  return store.coinInfo;
});

onMounted(() => {
  store.loadDashboard();
  walletStore.loadMyAsset();
  paramStore.handleAbciInfo()
  // if(!(coinInfo.value && coinInfo.value.name)) {
  // }
});
const ticker = computed(() => store.coinInfo.tickers[store.tickerIndex]);

const currName = ref("")
blockchain.$subscribe((m, s) => {
  if (s.chainName !== currName.value) {
    currName.value = s.chainName
    store.loadDashboard();
    walletStore.loadMyAsset();
    paramStore.handleAbciInfo()
  }
});
function shortName(name: string, id: string) {
  return name?.toLowerCase().startsWith('ibc/') ||
    name?.toLowerCase().startsWith('0x')
    ? id
    : name;
}

const comLinks = [

  {
    name: 'Twitter',
    icon: 'icon_twitter',
    href: 'https://x.com/Hippo_Protocol',
  },
  {
    name: 'LinkedIn',
    icon: 'icon_linkedin',
    href: 'https://www.linkedin.com/company/hippoprotocol',
  },
  {
    name: 'Medium',
    icon: 'icon_medium',
    href: 'https://medium.com/hippoprotocol',
  },
  {
    name: 'Discord',
    icon: 'icon_discord',
    href: 'https://discord.com/invite/hippoprotocol',
  },
  {
    name: 'Github',
    icon: 'icon_github',
    href: 'https://github.com/hippo-protocol',
  },
  {
    name: 'Telegram',
    icon: 'icon_telegram',
    href: 'https://t.me/hippoprotocol',
  },
  {
    name: 'Website',
    icon: 'icon_web',
    href: 'https://hippoprotocol.ai',
  }
];

// wallet box
const change = computed(() => {
  const token = walletStore.balanceOfStakingToken;
  return token ? format.priceChanges(token.denom) : 0;
});
const color = computed(() => {
  switch (true) {
    case change.value > 0:
      return 'text-green-600';
    case change.value === 0:
      return 'text-grey-500';
    case change.value < 0:
      return 'text-red-600';
  }
});

function updateState() {
  walletStore.loadMyAsset()
}

function trustColor(v: string) {
  return `text-${colorMap(v)}`
}

const quantity = ref(100)
const qty = computed({
  get: () => {
    return parseFloat(quantity.value.toFixed(6))
  },
  set: val => {
    quantity.value = val
  }
})
const amount = computed({
  get: () => {
    return quantity.value * ticker.value?.converted_last.usd || 0
  },
  set: val => {
    quantity.value = val / ticker.value?.converted_last.usd || 0
  }
})

const kind = ref('price')
function changeChart(type: string) {
  kind.value = type;
}

</script>

<template>
  <div>
    <div class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex gap-[60px]">
      <div class="flex flex-col justify-between flex-1">
        <div class="flex flex-col gap-[16px]">
          <h2 class="text-[32px] font-bold text-white">Hippo Protocol</h2>
          <p class="text-[#BCBCBC] text-[14px] font-normal">Hippo Protocol is a blockchain optimized for secure,
            decentralized management of healthcare data.
            Its native token, HP, is used for governance, staking, and transaction fees.</p>
        </div>
        <div class="flex items-center justify-between flex-wrap gap-[4px] mt-[10px] 2xl:mt-0">
          <div class="flex items-center gap-[20px] flex-wrap">
            <a v-for="(item, index) of comLinks" :key="index" :href="item.href" target="_blank"
              class="link link-primary flex items-center">
              <img :src="`/src/assets/images/svg/${item.icon}.svg`" class="w-[20px] h-[20px]" />
            </a>
          </div>
          <div class="flex flex-wrap gap-[4px] items-center">
            <div class="text-[#41aaff] text-[12px] font-semibold rounded-[4px] bg-[#16253D] px-[8px] py-[4px]">
              #Healthcare</div>
            <div class="text-[#10DF89] text-[12px] font-semibold rounded-[4px] bg-[#0c2623] px-[8px] py-[4px]">#Smart
              Contract Platform</div>
            <div class="text-[#FF57CC] text-[12px] font-semibold rounded-[4px] bg-[#3A1037] px-[8px] py-[4px]">#Layer 1
            </div>
          </div>
        </div>
      </div>
      <div
        class="px-[24px] py-[16px] flex gap-[20px] justify-center items-center shrink-0 w-[465px] h-[170px] bg-[#0E0F11] rounded-[32px] border-1 border-[#1E1F22]">
        <div class="flex flex-col gap-[24px] flex-1">X contents</div>
        <div class="flex w-[220px] h-[130px] justify-center items-center rounded-[12px] overflow-hidden">
          <img src="/src/assets/images/hippo-social.png" class="object-contain" />
        </div>
      </div>
    </div>

    <div v-if="coinInfo && coinInfo.name"
      class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
      <div class="flex justify-between px-[20px] items-center">
        <h3 class="text-[21px] font-bold text-white">Market</h3>
        <div class="tabs tabs-boxed bg-black p-[4px] gap-[4px] items-center rounded-[24px] border border-[#1d1f23]">
          <a class="tab text-xs mr-2 text-white " :class="{ 'tab-active !text-black !bg-white': kind === 'price' }"
            @click="changeChart('price')">
            Price
          </a>
          <a class="tab text-xs text-white" :class="{ 'tab-active !text-black !bg-white': kind === 'volume' }"
            @click="changeChart('volume')">
            Volume
          </a>
        </div>
      </div>
      <div class="flex gap-[16px] h-[262px]">
        <div class=" p-[24px] rounded-[32px] border border-[#1e1f22] bg-gra-dark min-w-[300px]">
          <label class="flex flex-col gap-[16px] h-full">
            <div class="flex flex-col flex-grow justify-between">
              <div
                class="bg-[#191B1D] flex items-center justify-between px-[20px] py-[12px] cursor-pointer rounded-[12px] dropdown dropdown-hover">
                <div class="font-bold text-[20px] text-white">
                  {{ ticker?.market?.name || '' }}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M7.78109 9.02291C7.38076 9.52369 6.61923 9.52369 6.2189 9.02291L0.50434 1.87441C-0.0191299 1.21959 0.447095 0.250001 1.28543 0.250001L12.7146 0.250002C13.5529 0.250002 14.0191 1.21959 13.4957 1.87442L7.78109 9.02291Z"
                    fill="#424B5A" />
                </svg>
                <div class="dropdown-content pt-1 top-[50px]">
                  <div class="h-64 overflow-auto w-full shadow rounded">
                    <ul class="menu w-full bg-gray-100 rounded dark:bg-[#384059]">
                      <li v-for="(item, index) in store.coinInfo.tickers" :key="index"
                        @click="store.selectTicker(index)">
                        <div class="flex items-center justify-between hover:bg-base-100">
                          <div class="flex-1">
                            <div class="text-main text-sm" :class="trustColor(item.trust_score)">
                              {{ item?.market?.name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                              {{ shortName(item?.base, item?.coin_id) }}/{{
                                shortName(item?.target, item?.target_coin_id)
                              }}
                            </div>
                          </div>

                          <div class="text-base text-main">
                            ${{ item?.converted_last?.usd }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="text-[22px] font-bold text-white text-right">
                ${{ ticker?.converted_last?.usd }}
              </div>
            </div>
            <div class="flex justify-between">
              <div class="text-info text-sm text-[#98A9CE]">
                {{ shortName(ticker?.base, ticker?.coin_id) }}/{{
                  shortName(ticker?.target, ticker?.target_coin_id)
                }}
              </div>
              <div class="text-sm" :class="store.priceColor">
                {{ store.priceChange }}%
              </div>
            </div>
            <div class="flex">
              <label class="btn !p-[12px] rounded-[12px] border border-[#19181C] bg-gra-dark-button" for="calculator">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 10.2162H9.78378M10.2162 18V1.99999M6.10811 7.62161V4.8108M4.7027 6.21621H7.51351M4.7027 14.5405H7.51351M12.8108 11.7297H15.6216M12.8108 9.13513H15.6216M4.16216 18H15.8378H18V1.99999H15.8378H4.16216H2V18H4.16216Z"
                    stroke="white" stroke-linecap="square" />
                </svg>
              </label>
              <!-- Put this part before </body> tag -->
              <input type="checkbox" id="calculator" class="modal-toggle" />
              <div class="modal">
                <div class="modal-box">
                  <h3 class="text-lg font-bold">{{ $t('index.price_calculator') }}</h3>
                  <div class="flex flex-col w-full mt-5">
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span class="uppercase">{{ coinInfo.symbol }}</span>
                        </label>
                        <input type="number" v-model="qty" min="0" placeholder="Input a number"
                          class="input grow input-bordered join-item" />
                      </div>
                    </div>
                    <div class="divider">=</div>
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span>USD</span>
                        </label>
                        <input type="number" v-model="amount" min="0" placeholder="Input amount"
                          class="join-item grow input input-bordered" />
                      </div>
                    </div>
                  </div>
                </div>
                <label class="modal-backdrop" for="calculator">{{ $t('index.close') }}</label>
              </div>
              <a class="!px-[10px] !py-[12px] !text-white btn grow ml-[8px] !h-[42px]"
                :class="{ '!btn-success': store.trustColor === 'green', '!btn-warning': store.trustColor === 'yellow' }"
                :href="'https://apps.apple.com/app/data-hippo/id6738997275'" target="_blank">
                Get HP
              </a>
            </div>
          </label>
        </div>
        <PriceMarketChart :kind="kind" class="max-w-[826px] grow" />
      </div>
    </div>

    <div
      class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
      <h3 class="text-[21px] font-bold text-white">Onchain Metrics</h3>

      <div class="grid grid-cols-1 gap-[8px] md:!grid-cols-4 lg:!grid-cols-4">
        <div v-for="(item, key) in store.stats" :key="key">
          <CardStatisticsVertical v-bind="item" />
        </div>
      </div>
    </div>

    <div v-if="blockchain.supportModule('governance') && store?.proposals?.proposals.length > 0"
      class="bg-black rounded shadow px-[40px] pt-[44px] pb-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
      <div class="flex justify-between items-center">
        <h3 class="text-[21px] font-bold text-white">Active Proposals</h3>

        <RouterLink :to="`/${blockchain.chainName}/gov`" class="flex items-center gap-[8px]">
          <p class="text-[#e2e3e5] text-[12px] text-normal">See All</p>
          <div class="w-[28px] h-[28px] bg-white rounded-[32px] flex items-center justify-center p-[4px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5.83333 1L10 6M10 6L5.83333 11M10 6L0 6" stroke="black" stroke-width="2" />
            </svg>
          </div>
        </RouterLink>
      </div>
      <div class="flex items-center gap-[6px]">
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
            <!-- TODO label ? -->
          </div>
          <div class="flex flex-col gap-[24px]">
            <div class="flex flex-col gap-[12px]">
              <div class="flex justify-between text-white text-[16px]">
                <p class="text-[#737373] text-[12px]">{{ `Remaining time ${dayjs(proposal.voting_end_time).diff(dayjs(),
                  'day') + 1} days` }}</p>
              </div>
              <ProposalProcess :pool="staking.pool" :tally="proposal.final_tally_result" />
            </div>
            <RouterLink :to="`/${chain}/gov/${proposal.proposal_id}`"
              class="text-[14px] text-white text-bold px-[10px] py-[12px] h-[40px] flex items-center justify-center gap-[2px] rounded-[12px] bg-[#10DF89]">
              Vote<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6.33333 1L10.5 6M10.5 6L6.33333 11M10.5 6L0.5 6" stroke="white" stroke-width="2" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="pb-8 text-center" v-if="store.proposals?.proposals?.length === 0">
        {{ $t('index.no_active_proposals') }}
      </div>
    </div>

    <div class="bg-black rounded mt-4 ">
      <div class="flex justify-between px-4 pt-4 pb-2 text-lg font-semibold text-main">
        <span class="truncate">{{ walletStore.currentAddress || 'Not Connected' }}</span>
        <RouterLink v-if="walletStore.currentAddress"
          class="float-right text-sm cursor-pointert link link-primary no-underline font-medium"
          :to="`/${chain}/account/${walletStore.currentAddress}`">{{ $t('index.more') }}</RouterLink>
      </div>
      <div class="grid grid-cols-1 md:!grid-cols-2 auto-cols-auto gap-4 px-[40px] pb-[48px]">
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('account.balance') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.balanceOfStakingToken) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.balanceOfStakingToken) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('module.staking') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.stakingAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.stakingAmount) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('index.reward') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.rewardAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.rewardAmount) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('index.unbonding') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.unbondingAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.unbondingAmount) }}
          </div>
        </div>
      </div>

      <div v-if="walletStore.delegations.length > 0" class="px-4 pb-4 overflow-auto">
        <table class="table table-compact w-full table-zebra">
          <thead>
            <tr>
              <th>{{ $t('account.validator') }}</th>
              <th>{{ $t('account.delegations') }}</th>
              <th>{{ $t('account.rewards') }}</th>
              <th>{{ $t('staking.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in walletStore.delegations" :key="index">
              <td>
                <RouterLink class="link link-primary no-underline"
                  :to="`/${chain}/staking/${item?.delegation?.validator_address}`">
                  {{
                    format.validatorFromBech32(
                      item?.delegation?.validator_address
                    )
                  }}
                </RouterLink>
              </td>
              <td>{{ format.formatToken(item?.balance) }}</td>
              <td>
                {{
                  format.formatTokens(
                    walletStore?.rewards?.rewards?.find(
                      (el) =>
                        el?.validator_address ===
                        item?.delegation?.validator_address
                    )?.reward)
                }}
              </td>
              <td>
                <div>
                  <label for="delegate" class="btn !btn-xs !btn-primary btn-ghost rounded-sm mr-2"
                    @click="dialog.open('delegate', { validator_address: item.delegation.validator_address, fees: { amount: '150000000000000000', denom: 'ahp' } }, updateState)">
                    {{ $t('account.btn_delegate') }}
                  </label>
                  <label for="unbond" class="btn !btn-xs !btn-primary btn-ghost rounded-sm" @click="
                    dialog.open(
                      'unbond',
                      {
                        validator_address: item.delegation.validator_address,
                        fees: { amount: '150000000000000000', denom: 'ahp' }
                      },
                      updateState
                    )
                    ">{{ $t('account.btn_unbond') }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 pb-6 mt-4">
        <label for="PingTokenConvert" class="btn btn-primary round-[12px] text-white">{{ $t('index.btn_swap') }}</label>
        <label for="send" class="btn !bg-yes round-[12px] text-white" @click="dialog.open('send', {}, updateState)">{{
          $t('account.btn_send') }}</label>
        <label for="delegate" class="btn !bg-info round-[12px] text-white"
          @click="dialog.open('delegate', { fees: { amount: '150000000000000000', denom: 'ahp' } }, updateState)">{{
            $t('account.btn_delegate') }}</label>
        <label for="withdraw" class="btn !bg-lime-500 round-[12px] text-white"
          @click="dialog.open('withdraw', {}, updateState)">{{ $t('index.btn_withdraw_reward') }}</label>
        <label for="transfer" class="btn !bg-[#ff5e3a] round-[12px] text-white">Transfer</label>
      </div>

      <!-- TODO Hippo Blog -->

      <Teleport to="body">
        <ping-token-convert :chain-name="blockchain?.current?.prettyName" :endpoint="blockchain?.endpoint?.address"
          :hd-path="walletStore?.connectedWallet?.hdPath"></ping-token-convert>
      </Teleport>
    </div>


    <div v-if="!store.coingeckoId" class="bg-base-100 rounded mt-4">
      <div class="px-4 pt-4 pb-2 text-lg font-semibold text-main">
        {{ $t('index.node_info') }}
      </div>
      <ArrayObjectElement :value="paramStore.nodeVersion?.items" :thead="false" />
      <div class="h-4"></div>
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'dashboard',
      order: 1,
    }
  }
</route>
