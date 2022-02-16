<template>
  <q-icon name="done" color="positive" size="2rem" v-if="content" />
  <q-icon name="close" size="2rem" v-else-if="content !== undefined" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BooleanRenderer',
  props: { content: Boolean },
  setup() {
    return {};
  },
});
</script>
