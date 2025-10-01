<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';

// Components
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';

import { NetworkType, useDashboard } from '@/stores/useDashboard';
import { useBaseStore, useBlockchain } from '@/stores';

import NavBarWallet from './NavBarWallet.vue';
import type { NavGroup, NavLink, VerticalNavItems } from '../types';
import dayjs from 'dayjs';
import LanguageIcon from '@/icons/LanguageIcon.vue';

const dashboard = useDashboard();
dashboard.initial();
const blockchain = useBlockchain();
blockchain.randomSetupEndpoint();
const baseStore = useBaseStore();

const current = ref('hippo-protocol'); // the current chain
const temp = ref('')
blockchain.$subscribe((m, s) => {
  if (current.value === s.chainName && temp.value != s.endpoint.address) {
    temp.value = s.endpoint.address
    blockchain.initial();
  }
  if (current.value != s.chainName) {
    current.value = s.chainName;
    blockchain.randomSetupEndpoint();
  }
});

const sidebarShow = ref(false);
const sidebarOpen = ref(true);

const changeOpen = (index: Number) => {
  if (index === 0) {
    sidebarOpen.value = !sidebarOpen.value;
  }
};

function isNavGroup(nav: VerticalNavItems | any): nav is NavGroup {
  return (<NavGroup>nav).children !== undefined;
}
function isNavLink(nav: VerticalNavItems | any): nav is NavLink {
  return (<NavLink>nav).to !== undefined;
}
function selected(route: any, nav: NavLink) {
  const b = route.path === nav.to?.path || route.path.startsWith(nav.to?.path) && nav.title.indexOf('dashboard') === -1
  return b
}
const blocktime = computed(() => {
  return dayjs(baseStore.latest?.block?.header?.time)
});

const behind = computed(() => {
  const current = dayjs().subtract(10, 'minute')
  return blocktime.value.isBefore(current)
});

const theme = computed(() => {
  return baseStore.theme;
});

const changeMode = (val?: 'dark' | 'light') => {
  let value: 'dark' | 'light' = 'dark';
  const currentValue: 'dark' | 'light' = val || theme.value;
  if (currentValue === 'dark') {
    value = 'light';
  }
  if (value === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
  document.documentElement.setAttribute('data-theme', value);
  window.localStorage.setItem('theme', value);
  baseStore.theme = value;
};

onMounted(() => {
  // Original code from NavbarThemeSwitcher.vue
  changeMode(theme.value === 'light' ? 'dark' : 'light');
});

dayjs()
</script>

<template>
  <div class="bg-black">
    <!-- sidebar -->
    <div class="w-64 fixed z-50 left-0 top-0 bottom-0 overflow-auto border-r border-bg"
      :class="{ block: sidebarShow, 'hidden xl:!block': !sidebarShow }">
      <div class="flex justify-center py-[12px] px-[40px] h-[70px] border-b border-bg">
        <RouterLink to="/" class="flex items-center">
          <img class="flex-1 text-2xl font-semibold dark:text-white w-[124px] h-[30px]"
            src="/images/HippoRiver-logo-white.png" alt="Hippo River Logo" />
          </img>
        </RouterLink>
        <div class="pr-4 cursor-pointer xl:!hidden" @click="sidebarShow = false">
          <Icon icon="mdi-close" class="text-2xl" />
        </div>
      </div>
      <div v-for="(item, index) of blockchain.computedChainMenu" :key="index" class="px-2 border-b border-bg">
        <div v-if="isNavGroup(item)" :tabindex="index" class="collapse" :class="{
          'collapse-arrow': index > 0 && item?.children?.length > 0,
          'collapse-open': index === 0 && sidebarOpen,
          'collapse-close': index === 0 && !sidebarOpen,
        }">
          <input v-if="index > 0" type="checkbox" class="cursor-pointer !h-10 block" @click="changeOpen(index)" />
          <div class="collapse-titleflex items-center cursor-pointer pt-[24px]">
            <Icon v-if="item?.icon?.icon" :icon="item?.icon?.icon" class="text-xl mr-2" :class="{
              'text-yellow-500': item?.title === 'Favorite',
              'text-blue-500': item?.title !== 'Favorite',
            }" />
            <div class="font-bold text-[13px] capitalize flex-1 text-gray30 whitespace-nowrap px-[40px] py-[4px]">
              Hippo Protocol
            </div>
            <div v-if="item?.badgeContent" class="mr-6 badge badge-sm text-white border-none" :class="item?.badgeClass">
              {{ item?.badgeContent }}
            </div>
          </div>
          <div class="collapse-content">
            <div v-for="(el, key) of item?.children" class="menu bg-black w-full !p-0">
              <RouterLink v-if="isNavLink(el)" @click="sidebarShow = false"
                class="hover:bg-gray-100 dark:hover:bg-[#373f59] cursor-pointer px-3 py-2 flex items-center" :class="{
                  'border-r-[6px] border-primary bg-[linear-gradient(90deg,rgba(26,33,30,0.5),rgba(16,223,137,0.25))]': selected($route, el),
                }" :to="el.to">
                <img v-if="el?.icon?.image" :src="el?.icon?.image" class="w-6 h-6 rounded-full mr-3 ml-4 " />
                <div class="text-[13px] capitalize text-white" :class="{
                  '!text-white': selected($route, el),
                }">
                  {{ $t(el?.title) }}
                </div>
              </RouterLink>
            </div>
            <div v-if="index === 0 && dashboard.networkType === NetworkType.Testnet" class="menu bg-black w-full !p-0">
              <RouterLink class="hover:bg-gray-100 dark:hover:bg-[#373f59] cursor-pointer px-3 py-2 flex items-center"
                :class="{
                  'border-r-[6px] border-primary bg-[linear-gradient(90deg,rgba(26,33,30,0.5),rgba(16,223,137,0.25))]': selected($route, { to: { path: `/${blockchain.chainName}/faucet` }, title: 'module.faucet' }),
                }" :to="`/${blockchain.chainName}/faucet`">
                <img src="/src/assets/images/svg/staking.svg" class="w-6 h-6 rounded-full mr-3 ml-4 " />
                <div class="text-[13px] capitalize text-white" :class="{
                  '!text-white': false,
                }">
                  Faucet
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="px-2 border-b border-bg collapse  collapse-open">
        <div class="collapse-titleflex items-center cursor-pointer pt-[24px]">
          <div class="font-bold text-[13px] capitalize flex-1 text-gray30 whitespace-nowrap px-[40px] py-[4px]">
            Information
          </div>
        </div>
        <div class="collapse-content">
          <div class="menu bg-black w-full !p-0">
            <RouterLink @click="sidebarShow = false"
              class="hover:bg-gray-100 dark:hover:bg-[#373f59] cursor-pointer px-3 py-2 flex items-center" :class="{
                'border-r-[6px] border-primary bg-[linear-gradient(90deg,rgba(26,33,30,0.5),rgba(16,223,137,0.25))]': selected($route, {} as any), // FIXME 
              }" :to="{ path: '/' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                class="mr-3 ml-4">
                <path
                  d="M12.1201 3.00294C11.9571 2.99403 11.7926 3.00249 11.6279 3.0293C10.5577 3.2033 9.75 4.19357 9.75 5.33057V6.75001H6.85254C4.01896 6.75001 1.69857 9.09756 1.51758 12.0527L1.5 12L0.75 15.75L1.72998 14.77C1.8721 15.6957 2.06535 16.6694 2.27197 17.4316L3.16406 21H6.75V18.4146C7.30425 18.6013 7.97025 18.75 8.625 18.75C8.9175 18.75 9.6885 18.7211 10.5 18.4556V21H14.0859L14.9575 17.4976C14.9823 17.4263 15.5251 15.843 15.7134 12.75H19.5C21.1545 12.75 22.5 11.4045 22.5 9.75001V8.11671C22.5 6.4292 21.3137 5.25147 19.6157 5.25147C18.6475 5.25147 17.911 5.50573 17.4258 5.75098C16.897 5.19748 15.903 4.50001 14.25 4.50001H14.1211C13.9898 4.12951 13.7636 3.79714 13.4561 3.53614C13.0786 3.21495 12.6092 3.02965 12.1201 3.00294ZM11.8682 4.51026C12.0962 4.47351 12.3146 4.53325 12.4849 4.67725C12.6536 4.8205 12.75 5.02951 12.75 5.25001V6.00001H14.25C15.9735 6.00001 16.5604 7.05021 16.5791 7.08546L17.0142 7.9336L17.7422 7.31544C17.7692 7.29219 18.421 6.75147 19.6157 6.75147C20.4827 6.75147 21 7.26096 21 8.11671V9.75001C21 10.5773 20.3272 11.25 19.5 11.25H14.2793L14.2515 11.9707C14.121 15.2865 13.5467 16.9881 13.522 17.0684L12.9141 19.5H12V15.75L10.8003 16.6494C10.039 17.2209 8.8545 17.25 8.625 17.25C7.641 17.25 6.62067 16.7702 6.45117 16.6494L5.25 15.7485V19.5H4.33594L3.72363 17.0552C3.34488 15.6542 3 13.4449 3 12.4219C3 10.1209 4.72854 8.25001 6.85254 8.25001H11.25V5.33057C11.25 4.92707 11.5209 4.56726 11.8682 4.51026ZM15 6.75001C14.8011 6.75001 14.6103 6.82902 14.4697 6.96968C14.329 7.11033 14.25 7.30109 14.25 7.50001C14.25 7.69892 14.329 7.88968 14.4697 8.03034C14.6103 8.17099 14.8011 8.25001 15 8.25001C15.1989 8.25001 15.3897 8.17099 15.5303 8.03034C15.671 7.88968 15.75 7.69892 15.75 7.50001C15.75 7.30109 15.671 7.11033 15.5303 6.96968C15.3897 6.82902 15.1989 6.75001 15 6.75001Z"
                  fill="white" />
              </svg>
              <div class="text-[13px] capitalize text-white" :class="{
                '!text-white': true,
              }">
                News
              </div>
            </RouterLink>
          </div>
          <div class="menu bg-black w-full !p-0">
            <RouterLink @click="sidebarShow = false"
              class="hover:bg-gray-100 dark:hover:bg-[#373f59] cursor-pointer px-3 py-2 flex items-center" :class="{
                'border-r-[6px] border-primary bg-[linear-gradient(90deg,rgba(26,33,30,0.5),rgba(16,223,137,0.25))]': selected($route, {} as any), // FIXME 
              }" :to="{ path: '/' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                class="mr-3 ml-4">
                <path
                  d="M3.75 3.75V20.25H20.25V3.75H3.75ZM5.25 5.25H18.75V18.75H5.25V5.25ZM9 6.75V9.75H6.75V17.25H15V14.25H17.25V6.75H9ZM10.5 8.25H15.75V9H10.5V8.25ZM10.5 10.5H15.75V12.75H10.5V10.5ZM8.25 11.25H9V12.0234H8.25V11.25ZM8.25 13.5234H9V14.25H13.5V15.75H8.25V13.5234Z"
                  fill="white" />
              </svg>
              <div class="text-[13px] capitalize text-white" :class="{
                '!text-white': true,
              }">
                Applications
              </div>
            </RouterLink>
          </div>
        </div>

      </div> -->
    </div>
    <div class="xl:!ml-64 ">
      <!-- header -->
      <div class="flex items-center py-[15px] px-[60px] bg-black border-b border-bg rounded sticky top-0 z-10 h-[70px]">
        <div class="text-2xl pr-3 cursor-pointer xl:!hidden" @click="sidebarShow = true">
          <Icon icon="mdi-menu" />
        </div>

        <ChainProfile />

        <div class="flex-1 w-0"></div>

        <NavbarSearch class="!inline-block" />
        <NavBarWallet />
        <button
          class="btn btn-ghost px-[16px] py-[2px] flex items-center gap-[8px] justify-center border-[#19181C] bg-gra-dark-button !rounded-[32px] ml-[4px]">
          <LanguageIcon :size="'20'" />
          <span class="text-white">EN</span>
        </button>
      </div>

      <!-- 👉 Pages -->
      <div style="min-height: calc(100vh - 180px);">
        <div v-if="behind" class="alert alert-error mb-4">
          <div class="flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-current flex-shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('pages.out_of_sync') }} {{ blocktime.format() }} ({{ blocktime.fromNow() }})</span>
          </div>
        </div>
        <RouterView v-slot="{ Component }">
          <Transition mode="out-in">
            <Component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>
