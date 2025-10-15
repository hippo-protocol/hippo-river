<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useBlockchain, useFormatter, useAccountStore } from '@/stores';
import type { RichlistEntry } from '@/types';
import { onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import router from '@/router';

const props = defineProps(['chain']);

const formattter = useFormatter()
const accountStore = useAccountStore()

const accounts = ref([] as RichlistEntry[])
const tab = ref('0')
const page = ref(1)
const pageSize = 20
const maxSize = 1000
const total = ref('0')

onMounted(() => {
    let currentPage: number;
    if (!router.currentRoute.value.query.page) {
        currentPage = 1
    }
    else {
        currentPage = Number(router.currentRoute.value.query.page)
        if (isNaN(currentPage) || currentPage < 1) {
            currentPage = 1
        }
    }
    pageload(currentPage)
});

function pageload(p: number) {
    accountStore.getRichlist(p, pageSize).then(res => {
        accounts.value = res
        total.value = Math.min(accountStore.total, maxSize).toString()
        router.replace(router.currentRoute.value.path + `?page=${p}`);
        page.value = p
    });
}

const changeTab = (_tab: string) => {
    tab.value = _tab
}


</script>
<template>
    <div class="overflow-x-auto px-[40px] py-[35px]">
        <div class="flex items-center justify-between mb-[40px]">
            <div class="flex gap-[4px]  rounded-[24px] border border-[#2c3443] p-[4px] size-fit">
                <div>
                    <a class="tab text-white text-normal capitalize !rounded-[20px]"
                        :class="{ 'tab-active !text-black !bg-white': tab === '0' }" @click="changeTab('0')">Rich
                        List</a>
                </div>

            </div>
        </div>
        <table class="table table-compact text-white">
            <thead>
                <tr class="border-0 text-white">
                    <td>Rank</td>
                    <td>{{ $t('account.address') }}</td>
                    <td>Amount</td>
                </tr>
            </thead>
            <tbody>
                <tr class="h-[20px] border-0"></tr>
                <tr v-for="(acc, index) in accounts" class="hover">
                    <td>#{{ index + 1 + (page - 1) * pageSize }}</td>
                    <td>
                        <RouterLink :to="`/${chain}/account/${acc.address}`">{{ acc.address }}</RouterLink>
                    </td>
                    <td> {{ Number(acc.balance).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                        }) }} HP </td>
                </tr>
            </tbody>

        </table>
        <PaginationBar :limit="pageSize" :total="total" :callback="pageload" :current-page="page" />
    </div>
</template>

<route>
    {
      meta: {
        i18n: 'account',
        order: 6
      }
    }
  </route>
