<template>
  <q-select
    :required="isRequired"
    v-model="content"
    color="white"
    dark
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    :options="updatedOptions"
    emit-value
    @filter="(a, b, c) => filterFn(a, b, c)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue';

export default defineComponent({
  name: 'TextInput',
  props: {
    modelValue: {} as PropType<string | string[]>,
    isRequired: Boolean,
    isMultiple: Boolean,
    autogrow: Boolean,
    options: Object as PropType<string[]>,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const content = computed({
      get: () =>
        props.isMultiple && Array.isArray(props.modelValue)
          ? props.modelValue?.join('\n')
          : props.modelValue,
      set: (value) => {
        emit(
          'update:modelValue',
          props.isMultiple && typeof value === 'string'
            ? value.split('\n')
            : value
        );
      },
    });

    const updatedOptions = ref(props.options);
    const filterFn = (val: string, update: (x: () => void) => void) => {
      update(() => {
        const needle = val.toLowerCase();
        updatedOptions.value = [
          ...(props.options?.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          ) || []),
          ...(val == '' ? [] : [val]),
        ];
      });
    };
    return { content, filterFn, updatedOptions };
  },
});
</script>
