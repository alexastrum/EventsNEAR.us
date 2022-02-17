<template>
  <text-input
    :type="currency ? 'text' : 'number'"
    outlined
    :input-class="currency ? 'text-right' : ''"
    :mask="currency ? '#.##' : ''"
    :fill-mask="currency ? '0' : ''"
    :reverse-fill-mask="currency"
    :suffix="currency ? '$' : ''"
    v-bind="$attrs"
    v-model="content"
    :rules="[(val) => !isRequired || !!val]"
    :step="step"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import TextInput from './TextInput.vue';

export default defineComponent({
  components: { TextInput },
  name: 'NumberInput',
  props: {
    isRequired: Boolean,
    modelValue: Number,
    currency: Boolean,
    step: {
      type: String,
      default: 'any',
    },
  },

  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const content = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', Number(value));
      },
    });
    return { content };
  },
});
</script>
