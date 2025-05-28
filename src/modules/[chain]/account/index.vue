<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useBlockchain, useFormatter, useAccountStore } from '@/stores';
import { type RichlistEntry } from '@/types';
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
const total = ref('100')

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
        router.replace(router.currentRoute.value.path + `?page=${p}`);
        page.value = p
    });
}

const changeTab = (_tab: string) => {
    tab.value = _tab
}


</script>
<template>
    <div class=" overflow-x-auto">
        <div class="tabs tabs-boxed bg-transparent mb-4 text-center flex justify-between gap-4">
            <div>
                <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === '0' }"
                    @click="changeTab('0')">Rich List</a>
            </div>
        </div>
        <table class="table table-compact">
            <thead>
                <tr>
                    <td>Rank</td>
                    <td>{{ $t('account.address') }}</td>
                    <td>Amount</td>
                </tr>
            </thead>
            <tr v-for="(acc, index) in accounts">
                <td># {{ index + 1 + (page - 1) * pageSize }}</td>
                <td>
                    <RouterLink :to="`/${chain}/account/${acc.address}`">{{ acc.address }}</RouterLink>
                </td>
                <td> {{ Number(acc.balance).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                }) }} HP </td>
            </tr>
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
