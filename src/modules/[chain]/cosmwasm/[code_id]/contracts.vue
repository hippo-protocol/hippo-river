<script lang="ts" setup>
import { useWasmStore } from '../WasmStore';
import { ref } from 'vue';
import type {
  ContractInfo,
  PaginabledContracts,
} from '../types';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';
import { useTxDialog } from '@/stores';

const props = defineProps(['code_id', 'chain']);

const pageRequest = ref(new PageRequest());
const response = ref({} as PaginabledContracts);

const info = ref({} as ContractInfo);
const dialog = useTxDialog();
const infoDialog = ref(false);
const wasmStore = useWasmStore();
function loadContract(pageNum: number) {
  const pr = new PageRequest();
  pr.setPage(pageNum);
  if(String(props.code_id).search(/^[\d]+$/) > -1){
    // query with code id
    wasmStore.wasmClient.getWasmCodeContracts(props.code_id, pr).then((x) => {
      response.value = x;
    })
  } else {
    // query by creator
    wasmStore.wasmClient.getWasmContractsByCreator(props.code_id, pr).then((x) => {
      response.value = {
        contracts: x.contract_addresses,
        pagination: x.pagination,
      };
    })
  }
}
loadContract(1);



function showInfo(address: string) {
  wasmStore.wasmClient.getWasmContracts(address).then((x) => {
    info.value = x.contract_info;
  });
}

</script>
<template>
  <div class="px-[48px] py-[76px] text-white">
    <div>
      <h2 class="truncate w-full mb-[35px] text-[21px] font-bold">
        {{ $t('cosmwasm.contract_list_code') }}: {{ props.code_id }}
      </h2>
      <div class="overflow-x-auto">
        <table class="table table-compact w-full mt-4 text-sm">
          <thead class="text-white">
            <tr class="border-0">
              <th style="position: relative; z-index: 2">{{ $t('cosmwasm.contract_list') }}</th>
              <th>{{ $t('account.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(v, index) in response.contracts"
              :key="index"
              class="hover"
            >
              <td>{{ v }}</td>
              <td>
                <label
                  @click="showInfo(v)"
                  for="modal-contract-detail"
                  class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px] mr-2"
                  >{{ $t('cosmwasm.btn_contract') }}</label
                >
                <RouterLink
                  :to="`transactions?contract=${v}`"
                  class="btn btn-secondary btn-sm !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px]"
                >
                {{ $t('cosmwasm.btn_details') }}
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between">
          <PaginationBar
            :limit="pageRequest.limit"
            :total="response.pagination?.total"
            :callback="loadContract"
          />
          <label
            for="wasm_instantiate_contract"
            class="btn btn-secondary !text-black !bg-white !rounded-[20px] !px-[20px] !py-[7px] my-5"
            @click="
              dialog.open('wasm_instantiate_contract', {
                codeId: props.code_id,
              })
            "
            >{{ $t('cosmwasm.instantiate_contract') }}</label
          >
        </div>
      </div>
    </div>

    <input type="checkbox" id="modal-contract-detail" class="modal-toggle" />
    <label for="modal-contract-detail" class="modal cursor-pointer">
      <label class="modal-box !w-11/12 !max-w-5xl relative p-2 bg-[#0E0F11] border border-[#1D1D1D] text-white" for="">
        <div>
          <div class="flex items-center justify-between px-3 pt-2">
            <div class="text-lg">{{ $t('cosmwasm.contract_detail') }}</div>
            <label
              @click="infoDialog = false"
              for="modal-contract-detail"
              class="btn btn-sm btn-circle"
              >✕</label
            >
          </div>
          <div>
            <DynamicComponent :value="info" />
          </div>
        </div>
      </label>
    </label>

  </div>
</template>
