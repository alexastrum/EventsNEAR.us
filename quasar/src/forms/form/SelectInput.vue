<template>
  <q-select
    outlined
    v-bind="$attrs"
    v-model="content"
    :multiple="isMultiple"
    :use-chips="isMultiple"
    :rules="[(val) => !isRequired || !!val]"
    :options="options"
  >
    <!-- <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"> dd </q-item>
    </template> -->
  </q-select>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
  name: 'SelectInput',
  props: {
    modelValue: {} as PropType<string | string[]>,
    options: Array as PropType<string[]>,
    isMultiple: Boolean,
    isRequired: Boolean,
  },
  setup(props, { emit }) {
    const content = computed({
      get: () =>
        !props.isMultiple || Array.isArray(props.modelValue)
          ? props.modelValue
          : [],
      set: (value) => {
        emit('update:modelValue', value);
      },
    });
    return {
      content,
    };
  },
});
</script>
