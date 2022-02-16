<template>
  <span>
    {{
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(content)
    }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CurrencyRenderer',
  props: {
    content: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  setup(props) {
    const maximumSignificantDigits = computed(
      () => props.content?.toString().length
    );
    return {
      maximumSignificantDigits,
    };
  },
});
</script>
