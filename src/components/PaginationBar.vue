<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    total: { type: String },
    limit: { type: Number },
    callback: { type: Function, required: true },
    currentPage: { type: Number, default: 1 },
});
const current = ref(1)
const showSize = 3
const pages = computed(() => {
    const pages: { color: string, page: number }[] = []
    const total = Number(props.total || 0)
    let skipFlag = false; // to add ' ... '
    if (total > 0 && props.limit && total > props.limit) {
        let page = 0
        while (true) {
            if (page * props.limit >= total) break
            page += 1
            if (total / props.limit > 10 && page > showSize && page < (total / props.limit - showSize + 1)) {
                if (!(page >= current.value - 1 && page <= current.value + 1)) {
                    if(!skipFlag){
                        pages.push({ color: '', page: '...' as any })
                        skipFlag = true
                    }
                    continue
                }
            }
            pages.push({
                color: page === current.value ? 'btn-primary' : '',
                page: page,
            })
        }
    }
    return pages
})

function gotoPage(pageNum: number) {
    current.value = pageNum
    props.callback(pageNum)
}

watch(() => { return props.currentPage }, (newPage) => {
    if (!!newPage && newPage !== current.value) {
        gotoPage(newPage);
    }
}, { immediate: true });

</script>
<template>
    <div class="py-[40px]">
        <div v-if="total && limit" class="flex justify-center items-center gap-[4px] p-[8px]">
            <button v-for="{ page, color } in pages" :key="page"
                class="bg-transparent text-white rounded-[100px] min-w-[28px] min-h-[28px] text-[11px] font-bold" :class="{
                    '!bg-white !text-black': current === page
                }" @click="(page as any) ==='...' ? undefined : gotoPage(page)">
                {{ page }}
            </button>
        </div>
    </div>
</template>
