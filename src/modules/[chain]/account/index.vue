<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useBlockchain, useFormatter } from '@/stores';
import { PageRequest, type AuthAccount, type Pagination } from '@/types';
import { onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
const props = defineProps(['chain']);

const chainStore = useBlockchain()

const accounts = ref([] as AuthAccount[])
const pageRequest = ref(new PageRequest())
const pageResponse = ref({} as Pagination)
const tab = ref('0')

onMounted(() => {
    pageload(1)
});

function pageload(p: number) {
    pageRequest.value.setPage(p)
    chainStore.rpc.getAuthAccounts(pageRequest.value).then(x => {
        accounts.value = x.accounts
        pageResponse.value = x.pagination
    });
}

function findField(v: any, field: string) {
    if (!v || Array.isArray(v) || typeof v === 'string') return null
    const fields = Object.keys(v)
    if (fields.includes(field)) {
        return v[field]
    }
    for (let i = 0; i < fields.length; i++) {
        const re: any = findField(v[fields[i]], field)
        if (re) return re
    }
}
function showAddress(v: any) {
    return findField(v, 'address')
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
            <tr v-for="acc in accounts">
                <td># 1</td>
                <td>
                    <RouterLink :to="`/${chain}/account/${showAddress(acc)}`">{{ showAddress(acc) }}</RouterLink>
                </td>
                <td> 123 HP </td>
            </tr>
        </table>
        <PaginationBar :limit="pageRequest.limit" :total="pageResponse.total" :callback="pageload" />
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
