<template>
  <q-input
    :required="isRequired"
    color="white"
    dark
    filled
    v-bind="$attrs"
    v-model="content"
    :rules="[(val) => !isRequired || !!val]"
    :autogrow="autogrow || isMultiple"
  >
    <template v-slot:prepend>
      <slot name="prepend" />
    </template>
    <template v-slot:append>
      <slot name="append" />
    </template>
    <template v-slot:default>
      <slot name="default" />
    </template>
    <template v-slot:after>
      <slot name="after" />
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
  name: 'TextInput',
  props: {
    modelValue: {} as PropType<string | string[]>,
    isRequired: Boolean,
    isMultiple: Boolean,
    autogrow: Boolean,
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

    return { content };
  },
});
</script>
