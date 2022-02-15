<template>
  <q-page>
    <div class="container column q-mx-auto q-px-md q-col-gutter-y-xl q-mb-xl">
      <div>
        <h2 class="q-my-none fn-xl fn-bold text-light">Search Results</h2>
        <div class="text-grey fn-md">
          There are no results for search query <b>"{{ query }}"</b>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// .section {
//   height: 200px;
// }
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchPage',
  props: { query: String },
  setup() {
    return;
  },
});
</script>
