<template>
  <q-img :src="content" fit="contain"></q-img>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImageRenderer',
  props: { content: String },
});
</script>
