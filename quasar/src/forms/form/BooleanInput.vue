<template>
  <q-toggle class="q-pb-md" v-bind="$attrs" v-model="content" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BooleanInput',
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const content = computed({
      get: () => !!props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    return { content };
  },
});
</script>
