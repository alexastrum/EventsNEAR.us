<template>
  <date-input v-if="isDate(content)" v-model="content" v-bind="$attrs" />
  <number-input
    v-else-if="isNumber(content)"
    v-model="content"
    v-bind="$attrs"
  />
  <boolean-input
    v-else-if="isBool(content)"
    v-model="content"
    v-bind="$attrs"
  />
  <text-input v-else v-model="content" v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import BooleanInput from './BooleanInput.vue';
import DateInput from './DateInput.vue';
import NumberInput from './NumberInput.vue';
import TextInput from './TextInput.vue';
export default defineComponent({
  components: { TextInput, DateInput, NumberInput, BooleanInput },
  name: 'AutoInput',
  props: {
    modelValue: {} as PropType<string | Date | number | boolean>,
  },
  setup(props, { emit }) {
    const content = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });
    function isDate(item: unknown) {
      return item instanceof Date;
    }
    function isNumber(item: unknown) {
      return typeof item === 'number' || typeof item === 'bigint';
    }
    function isBool(item: unknown) {
      return typeof item === 'boolean';
    }
    return {
      content,
      isDate,
      isNumber,
      isBool,
    };
  },
});
</script>
