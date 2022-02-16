<template>
  <q-input
    outlined
    v-bind="$attrs"
    v-model="content"
    :rules="[isValidDate, (val) => !isRequired || !!val]"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          :cover="false"
          transition-show="jump-down"
          transition-hide="jump-up"
        >
          <q-date :mask="format" v-model="content"></q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { date } from 'quasar';

export default defineComponent({
  name: 'CalendarInput',
  props: {
    modelValue: Date,
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    isRequired: Boolean,
  },
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    function isValidDate(value: string) {
      const dateValue = date.extractDate(value, props.format);
      return date.formatDate(dateValue, props.format) === value;
    }

    const content = computed({
      get: () => {
        return date.formatDate(props.modelValue, props.format);
      },
      set: (value) => {
        if (isValidDate(value)) {
          emit('update:modelValue', date.extractDate(value, props.format));
        }
      },
    });

    return {
      content,
      isValidDate,
    };
  },
});
</script>
