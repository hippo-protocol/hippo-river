<script lang="ts" setup>
import ApexCharts from 'vue3-apexcharts';
import { getMarketPriceChartConfig } from './apexChartConfig';
import { useIndexModule } from '@/modules/[chain]/indexStore';
import { computed, ref } from '@vue/reactivity';
import { useBaseStore } from '@/stores';

const store = useIndexModule();
const baseStore = useBaseStore();
const chartConfig = computed(() => {
    const theme = baseStore.theme;
    const labels = store.marketData.prices.map((item: any) => item[0]);
    return getMarketPriceChartConfig(theme, labels);
});
const props=defineProps({
    kind: {
        type: String,
        required: true
    }
})

const series = computed(() => {
    return [
        {
            name: props.kind === 'price' ? 'Price' : 'Volume',
            data:
                props.kind === 'price'
                    ? store.marketData.prices.map((item: any) => item[1])
                    : store.marketData.total_volumes.map(
                          (item: any) => item[1]
                      ),
        },
    ];
});

</script>

<template>
    
    <ApexCharts
        type="area"
        height="230"
        :options="chartConfig"
        :series="series"
    />
</template>
