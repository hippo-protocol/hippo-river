<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';

// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';

import { useDashboard } from '@/stores/useDashboard';
import { useBaseStore, useBlockchain } from '@/stores';

import NavBarWallet from './NavBarWallet.vue';
import type { NavGroup, NavLink, NavSectionTitle, VerticalNavItems } from '../types';
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
          <h1 class="flex-1 ml-3 text-2xl font-semibold dark:text-white">
            Hippo River
          </h1>
        </RouterLink>
        <div class="pr-4 cursor-pointer xl:!hidden" @click="sidebarShow = false">
          <Icon icon="mdi-close" class="text-2xl" />
        </div>
      </div>
      <div v-for="(item, index) of blockchain.computedChainMenu" :key="index" class="px-2">
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
            <div class="text-base capitalize flex-1 text-gray30 whitespace-nowrap px-[40px] py-[4px]">
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
                <div class="text-base capitalize text-gray-500 dark:text-gray-300" :class="{
                  '!text-white': selected($route, el),
                }">
                  {{ $t(el?.title) }}
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
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
          class="btn btn-ghost px-[16px] py-[2px] flex items-center gap-[8px] justify-center border-[#19181C] bg-gra-dark-button rounded-[32px]">
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
