<script lang="ts" setup>
import Countdown from '@chenfengyuan/vue-countdown';
import { ref } from 'vue';
import { computed } from '@vue/reactivity';

const props = defineProps({
  time: { type: Number },
  css: { type: String },
});

const isTransition = computed(() => {
  return !!props.time && !isNaN(props.time) && props.time > 0;
});
</script>
<template>
  <Countdown v-if="time" :time="time > 0 ? time : 0" v-slot="{ days, hours, minutes, seconds }"
    class="countdown-container justify-items-center">
    <span class="text-primary font-bold" :class="css">{{ days }}</span> days
    <span class="text-primary font-bold" :class="css">{{ hours }}</span> hours
    <span class="text-primary font-bold" :class="css">{{ minutes }}</span>
    minutes
    <span class="text-primary font-bold w-40" :class="css">
      <Transition name="slide-up" v-if="isTransition">
        <span v-if="seconds % 2 === 0" class="countdown !leading-[unset]">{{
          seconds
        }}</span>
        <span v-else class="countdown !leading-[unset]">{{ seconds }}</span>
      </Transition>
      <span v-else class="text-primary font-bold" :class="css">{{
        seconds
      }}</span>
    </span>
    <span :class="isTransition && 'ml-5 md:ml-12'"> seconds</span>
  </Countdown>
</template>

<style>
.countdown-container {
  display: inline-flexbox;
  position: relative;
}

.countdown {
  position: absolute;
  width: 45%;
  text-align: right;
  float: right;
}
</style>
