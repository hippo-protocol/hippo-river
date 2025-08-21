<script lang="ts" setup>
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';

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
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue'
import ActiveProposals from '@/components/ActiveProposals.vue';
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

   <ActiveProposals type="dashboard"/>
    <div class="bg-black rounded shadow px-[40px] py-[48px] flex flex-col gap-[16px] border-t border-[#2C3443]">
      <div class="flex justify-between text-[21px] font-bold text-main">
        <span class="truncate">{{ walletStore.currentAddress || 'Not Connected' }}</span>
        <label v-if="!walletStore.currentAddress" class="flex items-center gap-[8px] cursor-pointer"
          for="PingConnectWallet">
          <span class="text-[12px] font-normal">Connect Wallet</span>
          <div class="w-[28px] h-[28px] p-[4px] flex items-center justify-center rounded-[32px] bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5.83333 1L10 6M10 6L5.83333 11M10 6L0 6" stroke="black" stroke-width="2" />
            </svg>
          </div>
        </label>
      </div>
      <div class="grid grid-cols-1 md:!grid-cols-2 auto-cols-auto gap-4">
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('account.balance') }}</div>
          <div class="text-lg font-semibold text-main text-right">
            {{ format.formatToken(walletStore.balanceOfStakingToken) }}
          </div>
          <div class="text-sm text-right" :class="color">
            ${{ format.tokenValue(walletStore.balanceOfStakingToken) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('module.staking') }}</div>
          <div class="text-lg font-semibold text-main text-right">
            {{ format.formatToken(walletStore.stakingAmount) }}
          </div>
          <div class="text-sm text-right" :class="color">
            ${{ format.tokenValue(walletStore.stakingAmount) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('index.reward') }}</div>
          <div class="text-lg font-semibold text-main text-right">
            {{ format.formatToken(walletStore.rewardAmount) }}
          </div>
          <div class="text-sm text-right" :class="color">
            ${{ format.tokenValue(walletStore.rewardAmount) }}
          </div>
        </div>
        <div class="bg-gra-dark rounded-[32px] px-[32px] py-[20px]">
          <div class="text-sm mb-1">{{ $t('index.unbonding') }}</div>
          <div class="text-lg font-semibold text-main text-right">
            {{ format.formatToken(walletStore.unbondingAmount) }}
          </div>
          <div class="text-sm text-right" :class="color">
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

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-[16px] text-bold">
        <label for="PingTokenConvert" class="btn !bg-[#10df89] round-[12px] text-white flex gap-[8px] items-center"><svg
            xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path
              d="M8.80005 6.5C9.25478 4.49601 11.047 3 13.1885 3C15.6738 3 17.6885 5.01472 17.6885 7.5C17.6885 9.80209 15.9599 11.7004 13.7298 11.9678M5.80005 5L7.80005 3L5.80005 1M1.80005 7V3H7.5M14.8001 15L12.8001 17L14.8001 19M18.8001 13V17H13.1885M10.8 13.5C10.8 15.9853 8.78533 18 6.30005 18C3.81477 18 1.80005 15.9853 1.80005 13.5C1.80005 11.0147 3.81477 9 6.30005 9C8.78533 9 10.8 11.0147 10.8 13.5Z"
              stroke="white" stroke-linecap="square" />
          </svg>{{ $t('index.btn_swap') }}</label>
        <label for="send" class="btn !bg-[#666CFF] round-[12px] text-white flex gap-[8px] items-center"
          @click="dialog.open('send', {}, updateState)"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="20"
            viewBox="0 0 21 20" fill="none">
            <path
              d="M5.40018 5.00037V8.50037M15.4002 5.00037V8.50037M14.9002 12.0004H16.9002H18.5V2.00012L16.9002 2.00037H3.90018H2.5V12.0005L3.90018 12.0004H5.90018M7.57096 15.1718L10.3994 18.0002M10.3994 18.0002L13.0373 15.3623M10.3994 18.0002L10.3995 12.2149M12.4002 7.00037C12.4002 8.10494 11.5048 9.00037 10.4002 9.00037C9.29561 9.00037 8.40018 8.10494 8.40018 7.00037C8.40018 5.8958 9.29561 5.00037 10.4002 5.00037C11.5048 5.00037 12.4002 5.8958 12.4002 7.00037Z"
              stroke="white" stroke-linecap="square" />
          </svg>{{
            $t('account.btn_send') }}</label>
        <label for="delegate" class="btn !bg-[#FF57CC] round-[12px] text-white flex gap-[8px] items-center"
          @click="dialog.open('delegate', { fees: { amount: '150000000000000000', denom: 'ahp' } }, updateState)"><svg
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6.70259 17.0512C7.67243 16.7307 9.93538 17.5177 11.5518 17.3718C12.834 17.2559 13.3042 17.2905 14.4613 16.7307C15.4685 16.2434 16.5409 15.0809 17.2414 14.2233C17.6875 13.6773 17.5355 12.8866 16.9458 12.4968C16.441 12.1632 15.7689 12.2292 15.34 12.6545L14.0596 13.9239C13.6958 14.2845 13.2024 14.4871 12.688 14.4871L10 14.5M6.70259 12.5641L7.68664 12.0762C8.31509 11.7647 9.00806 11.6025 9.71069 11.6025H9.97584C10.3781 11.6025 10.7786 11.6557 11.1667 11.7606L12.5257 12.1281C13.2441 12.3224 13.4828 13.2136 12.9563 13.7357L12.1983 14.4871M9.6121 6.79483C9.6121 8.21095 10.77 9.35893 12.1983 9.35893C13.6267 9.35893 14.7846 8.21095 14.7846 6.79483C14.7846 5.37872 13.6267 4.23073 12.1983 4.23073M9.6121 6.79483C9.6121 5.37872 10.77 4.23073 12.1983 4.23073M9.6121 6.79483C8.18376 6.79483 7.02587 5.64684 7.02587 4.23073C7.02587 2.81461 8.18376 1.66663 9.6121 1.66663C11.0404 1.66663 12.1983 2.81461 12.1983 4.23073M2.5 18.5H6.5V11H2.5V18.5Z"
              stroke="white" />
          </svg>{{
            $t('account.btn_delegate') }}</label>
        <label for="withdraw" class="btn !bg-[#41AAFF] round-[12px] text-white flex gap-[8px] items-center !flex-nowrap"
          @click="dialog.open('withdraw', {}, updateState)"><svg xmlns="http://www.w3.org/2000/svg" width="21"
            height="20" viewBox="0 0 21 20" fill="none">
            <path
              d="M17.3002 12.2999V16H2.10024L2.09985 4H17.3002V7.64244M18.1002 12.2999H15.5002C14.2852 12.2999 13.3002 11.3149 13.3002 10.0999C13.3002 8.88488 14.2852 7.8999 15.5002 7.8999H18.1002V12.2999Z"
              stroke="white" stroke-linecap="square" />
          </svg>{{ $t('index.btn_withdraw_reward') }}</label>
        <label for="transfer" class="btn !bg-[#FF5E3A] round-[12px] text-white flex gap-[8px] items-center"><svg
            xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path
              d="M8.61113 14.9017C8.27714 14.9662 7.9316 15 7.57781 15C4.6998 15 2.3667 12.7614 2.3667 10C2.3667 7.23858 4.6998 5 7.57781 5C7.9316 5 8.27714 5.03383 8.61113 5.09829M19.0334 10C19.0334 12.7614 16.7003 15 13.8223 15C10.9442 15 8.61113 12.7614 8.61113 10C8.61113 7.23858 10.9442 5 13.8223 5C16.7003 5 19.0334 7.23858 19.0334 10Z"
              stroke="white" stroke-linecap="square" />
          </svg>Transfer</label>
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
