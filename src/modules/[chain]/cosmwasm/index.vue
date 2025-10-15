<script lang="ts" setup>
import { useBlockchain, useFormatter, useTxDialog } from '@/stores';
import { useWasmStore } from './WasmStore';
import { onMounted, ref } from 'vue';
import type { PaginabledCodeInfos } from './types';
import { PageRequest } from '@/types';
import PaginationBar from '@/components/PaginationBar.vue';
import router from '@/router';

const props = defineProps(['chain']);

const codes = ref({} as PaginabledCodeInfos);

const pageRequest = ref(new PageRequest())
const wasmStore = useWasmStore();
const dialog = useTxDialog()
const creator = ref("")
const field = ref("contract")
const history = ref([])

function pageload(pageNum: number) {
    pageRequest.value.setPage(pageNum)
    wasmStore.wasmClient.getWasmCodeList(pageRequest.value).then((x) => {
        codes.value = x;
    });
}
pageload(1)

onMounted(() => {
    const historyStore = JSON.parse(localStorage.getItem("contract_history") || "{}")
    history.value = historyStore[props.chain] || []
})

function myContracts() {
    if (field.value === "contract")
        router.push(`/${props.chain}/cosmwasm/0/transactions?contract=${creator.value}`)
    else if (field.value === "creator")
        router.push(`/${props.chain}/cosmwasm/${creator.value}/contracts`)
}
const togo = ref("")
function gotoHistory() {
    router.push(`/${props.chain}/cosmwasm/0/transactions?contract=${togo.value}`)
}
</script>
<template>
    <div class="px-[48px] py-[76px] text-white">
        <h2 class="truncate w-full mb-[35px] text-[21px]">{{ $t('cosmwasm.title') }}</h2>
        <div class="flex justify-between items-center ">
            <div class="grid grid-flow-col auto-cols-max gap-4 overflow-hidden">
                <div class="join w-full border border-[#1D1D1D] p-[8px] !rounded-[24px] bg-[#0E0F11]">
                    <select v-model="field" class="cursor-pointer bg-inherit rounded-none px-[12px] py-[7px]">
                        <option value="contract">Contract</option>
                        <option value="creator">Creator</option>
                    </select>
                    <input v-model="creator" type=text
                        class="w-full join-item !ml-[12px] bg-inherit border-l border-l-[#2c3443] pl-[20px] "
                        placeholder="address" />

                </div>
                <button @click="myContracts()"
                    class="rounded-[32px] bg-white text-black px-[20px] py-[7px] font-bold">{{
                        $t('cosmwasm.btn_query')
                    }}</button>
            </div>
            <div class="">
                <select v-model="togo" class="select !bg-inherit" @change="gotoHistory()">
                    <option value="">History</option>
                    <option v-for="(v, index) in history" :key="index" :value="v">...{{ String(v).substring(45) }}
                    </option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="table table-compact w-full mt-4 text-sm">
                <thead class="text-white">
                    <tr class="border-0">
                        <th>{{ $t('cosmwasm.code_id') }}</th>
                        <th>{{ $t('cosmwasm.code_hash') }}</th>
                        <th>{{ $t('cosmwasm.creator') }}</th>
                        <th>{{ $t('cosmwasm.permissions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(v, index) in codes.code_infos" :key="index">
                        <td>{{ v.code_id }}</td>
                        <td>
                            <RouterLink :to="`/${props.chain}/cosmwasm/${v.code_id}/contracts`"
                                class="truncate max-w-[200px] block text-primary dark:invert" :title="v.data_hash">
                                {{ v.data_hash }}
                            </RouterLink>
                        </td>
                        <td>{{ v.creator }}</td>
                        <td>
                            {{ v.instantiate_permission?.permission }}
                            <span>{{ v.instantiate_permission?.address }}
                                {{ v.instantiate_permission?.addresses.join(', ') }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="flex justify-between">
                <PaginationBar :limit="pageRequest.limit" :total="codes.pagination?.total" :callback="pageload" />
                <label for="wasm_store_code" class="btn !bg-white !text-black my-5"
                    @click="dialog.open('wasm_store_code', {})">{{
                        $t('cosmwasm.btn_up_sc') }}</label>
            </div>
        </div>
    </div>
</template>

<route>
    {
      meta: {
        i18n: 'cosmwasm'
      }
    }
</route>
