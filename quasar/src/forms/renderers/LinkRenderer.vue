<template>
  <a v-if="content?.match(/^[A-Za-z]+:/)" target="_blank" :href="content">
    {{ content }}
  </a>
  <router-link v-else-if="content" target="_blank" :to="content">
    {{ content }}
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LinkRenderer',
  props: { content: String },
});
</script>
