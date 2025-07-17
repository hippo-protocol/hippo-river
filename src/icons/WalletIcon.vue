<script setup lang="ts">
defineProps<{
    size: string
}>();
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 20 20" fill="none">
        <path
            d="M6.675 5.69231L12.625 2L15.6 5.69231M17.7857 9.38462H16.2375C14.9465 9.38462 13.9 10.3948 13.9 11.641C13.9 12.8872 14.9465 13.8974 16.2375 13.8974H17.7857M17.7857 9.38462H19V13.8974H17.7857M17.7857 9.38462V5.69231H2V18H17.7857V13.8974"
            stroke="white" stroke-linecap="round" />
    </svg>
</template>