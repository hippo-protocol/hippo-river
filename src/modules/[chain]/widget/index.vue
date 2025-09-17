<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import type { Connection } from '@/types';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const props = defineProps(['chain']);
const chainStore = useBlockchain();
const baseStore = useBaseStore()
const endpoint = ref(chainStore.current?.endpoints?.rest?.at(0)?.address)

const chainId = computed(() => baseStore.latest?.block?.header?.chain_id || "")
const chainName = computed(() => chainStore?.current?.prettyName || "")
const hdPath = computed(() => {
  return `m/44'/${chainStore.current?.coinType}/0'/0/0`
})

const basePath = computed(() => chainId.value.includes('testnet') ? 'https://river-testnet.hippoprotocol.ai' : 'https://river.hippoprotocol.ai')
</script>
<template>
  <div class="px-[40px] py-[76px] text-white">
    <h2 class="card-title mb-[20px]">{{ $t('widget.title') }}</h2>
    <div class="p-[32px] bg-gra-dark border border-[#1E1F22] rounded-[32px] mb-[100px] shadow">
      <div class="my-4 grid grid-flow-col auto-cols-max  overflow-auto">
        <div class="form-control">
          <div class="input-group py-[4px] pl-[4px] pr-[16px] rounded-[24px] border border-[#2C3443]">
            <span class="text-[12px] !bg-white text-black !px-[20px] !py-[7px] !rounded-l-[20px]">{{
              $t('widget.endpoint')
            }}</span>
            <select v-model="endpoint" class="bg-black w-fit px-[20px] py-[7px]">
              <option disabled selected>{{ $t('widget.select_endpoint') }}</option>
              <option v-for="v in chainStore.current?.endpoints.rest" :value="v.address">{{ v.address }}</option>
            </select>
          </div>
        </div>
      </div>
      <span class="text-base">{{ $t('widget.text_1') }}</span>
      <div class="mockup-code bg-base-200 my-2">
        <pre
          data-prefix="1"><code class="text-white">&lt;script type="module" src="{{ basePath }}/widget/ping-widget.js"&gt;</code></pre>
      </div>
    </div>

    <h2 class="card-title mb-[20px]">{{ $t('module.widget') }}</h2>
    <div class="p-[32px] bg-gra-dark border border-[#1E1F22] rounded-[32px] mb-[100px] shadow">
      <div class="">
        <span class="text-base"> 1. {{ $t('widget.text_2') }}</span>
        <div class="mockup-code bg-base-200 my-2">
          <pre data-prefix=">"><code class="text-green-400">&lt;!-- This widget is optional. --&gt; </code></pre>
          <pre
            data-prefix=">"><code  class="text-white">&lt;ping-connect-wallet chain-id="{{ chainId }}" hd-path="{{ hdPath }}"/&gt;</code></pre>
        </div>

        <span class="text-base"> 2. {{ $t('widget.text_3') }}</span>
        <div class="mockup-code bg-base-200 my-2">
          <pre
            data-prefix=">"><code class="text-white">&lt;ping-token-convert chain-name="{{ chainName }}" endpoint="{{ endpoint }}" hd-path="{{ hdPath }}"/&gt;</code></pre>
          <pre
            data-prefix=">"><code class="text-white">&lt;label for="PingTokenConvert" class="btn btn-sm"&gt;Buy {{ chainName.toUpperCase() }}&lt;/label&gt;</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'widget',
        order: 300
      }
    }
</route>
