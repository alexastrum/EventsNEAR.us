<template>
  <text-select-input
    label="Recipient wallet"
    outline
    class="col-3"
    v-model="distribution[ind].walletAddress"
    :options="allUsers"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    modelValue: {} as PropType<string | string[]>,
  },
  emits: ['update:modelValue'],
  setup() {
    return;
  },
});
</script>
