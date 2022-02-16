<template>
  <span>{{ dateFormatted }}</span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { date } from 'quasar';

export default defineComponent({
  name: 'DateRenderer',
  props: {
    content: Date,
    // Y = Year, M = Month, D = Day, e.g use case MMM D YYYY = May 6 2021
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
  },
  setup(props) {
    const dateFormatted = computed(
      () => props.content && date.formatDate(props.content, props.format)
    );
    return {
      dateFormatted,
    };
  },
});
</script>
